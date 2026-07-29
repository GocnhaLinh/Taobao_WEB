import { Prisma } from '@prisma/client';
import * as orderModel from '../models/order.model';
import * as userModel from '../../users/models/user.model';
import * as addressModel from '../../users/models/address.model';
import * as couponModel from '../../coupons/models/coupon.model';
import * as productModel from '../../products/models/product.model';
import { prisma } from '../../../config/prisma';

export const placeOrder = async (params: {
  userId: string;
  addressId: string;
  items: { variantId: string; quantity: number }[];
  couponCode?: string;
  shippingFee: number;
}) => {
  const { userId, addressId, items, couponCode, shippingFee } = params;

  // 1. Verify User and Address exist
  const user = await userModel.findUserById(userId);
  if (!user) throw new Error('Người dùng không tồn tại.');

  const address = await addressModel.getAddressById(addressId);
  if (!address) throw new Error('Địa chỉ giao hàng không tồn tại.');
  if (address.userId !== userId) throw new Error('Địa chỉ không thuộc về người dùng này.');

  if (!items || items.length === 0) {
    throw new Error('Giỏ hàng trống, không thể tạo đơn hàng.');
  }

  // 2. Load Variants and verify stock
  const orderItemsData: {
    variantId: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    price: number;
  }[] = [];

  let subtotal = 0;

  for (const item of items) {
    const variant = await productModel.getVariantById(item.variantId);
    if (!variant || !variant.sku || !variant.sku.trim() || variant.status === "DELETED") {
      throw new Error(`Mã SKU hoặc phiên bản sản phẩm ID ${item.variantId} không tồn tại hoặc đã bị tạm ngưng tại cửa hàng.`);
    }

    const availableStock = variant.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    if (variant.inventories.length > 0 && availableStock < item.quantity) {
      throw new Error(`Không đủ hàng trong kho cho sản phẩm ${variant.product.productName}. Còn lại: ${availableStock}`);
    }

    // Determine variant name (e.g. Size L - Color Red)
    const variantName = [variant.size, variant.color].filter(Boolean).join(' - ') || null;
    const price = variant.salePrice !== null && variant.salePrice !== undefined ? variant.salePrice : variant.price;

    subtotal += price * item.quantity;

    orderItemsData.push({
      variantId: variant.id,
      productName: variant.product.productName,
      variantName,
      quantity: item.quantity,
      price,
    });
  }

  // 3. Coupon validation & discount calculation
  let discountAmount = 0;
  if (couponCode) {
    const validation = await couponModel.validateCoupon(couponCode, subtotal, userId);
    if (!validation.valid || !validation.coupon) {
      throw new Error(validation.message || 'Mã giảm giá không hợp lệ.');
    }

    const coupon = validation.coupon;
    if (coupon.discountType === 'percent') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // fixed amount discount
      discountAmount = coupon.discountValue;
    }

    // Avoid discount exceeding subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  const totalAmount = subtotal + shippingFee - discountAmount;

  // 4. Use transaction to place order, deduct stock, and create history record
  return prisma.$transaction(async (tx) => {
    // A. Deduct stock from inventories if configured (FIFO/First available inventory logic)
    for (const item of items) {
      let remainingToDeduct = item.quantity;
      const inventories = await tx.inventory.findMany({
        where: { variantId: item.variantId, quantity: { gt: 0 } },
        orderBy: { quantity: 'desc' }, // deduct from warehouse with most stock first
      });

      for (const inv of inventories) {
        if (remainingToDeduct <= 0) break;

        if (inv.quantity >= remainingToDeduct) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: inv.quantity - remainingToDeduct },
          });
          remainingToDeduct = 0;
        } else {
          remainingToDeduct -= inv.quantity;
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: 0 },
          });
        }
      }
    }

    // B. Create Order & OrderItems
    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        totalAmount,
        shippingFee,
        discountAmount,
        couponCode: couponCode || null,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        items: {
          create: orderItemsData.map((oi) => ({
            userId,
            variantId: oi.variantId,
            productName: oi.productName,
            variantName: oi.variantName,
            quantity: oi.quantity,
            price: oi.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // C. Create Order Status History
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        note: 'Đơn hàng được khởi tạo thành công.',
        createdBy: 'USER',
      },
    });

    return order;
  });
};

export const getOrderDetails = async (id: string) => {
  const order = await orderModel.getOrderById(id);
  if (!order) {
    throw new Error('Đơn hàng không tồn tại.');
  }
  return order;
};

export const getUserOrders = async (userId: string) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }
  return orderModel.getOrdersByUserId(userId);
};

export const listAllOrders = async (params?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return orderModel.getAllOrders(params);
};

export const changeOrderStatus = async (
  orderId: string,
  status: string,
  note?: string,
  createdBy = 'SYSTEM',
) => {
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new Error('Đơn hàng không tồn tại để cập nhật.');
  }
  return orderModel.updateOrderStatus(orderId, status, note, createdBy);
};

export const adjustOrderTotal = async (
  orderId: string,
  newTotal: number,
  reason: string,
  updatedBy = 'SYSTEM',
) => {
  return orderModel.updateOrderTotal(orderId, newTotal, reason, updatedBy);
};

export const cancelOrder = async (orderId: string, reason: string) => {
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new Error('Đơn hàng không tồn tại để hủy.');
  }

  if (order.orderStatus === 'CANCELLED') {
    throw new Error('Đơn hàng đã được hủy trước đó.');
  }

  if (order.orderStatus === 'COMPLETED') {
    throw new Error('Không thể hủy đơn hàng đã hoàn thành.');
  }

  // Restore inventory stock on cancellation
  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      // Find the warehouse inventory for this variant, or default to a default warehouse
      const inventory = await tx.inventory.findFirst({
        where: { variantId: item.variantId },
      });

      if (inventory) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity + item.quantity },
        });
      } else {
        // Create new inventory if none existed (fallback)
        await tx.inventory.create({
          data: {
            variantId: item.variantId,
            quantity: item.quantity,
            warehouse: 'VN', // default warehouse
          },
        });
      }
    }

    return orderModel.createOrderCancellation({
      orderId,
      reason,
      productRefund: order.totalAmount,
      shippingLoss: 0,
      warehouseLoss: 0,
      serviceLoss: 0,
      finalRefund: order.totalAmount,
      status: 'PENDING',
    });
  });
};
