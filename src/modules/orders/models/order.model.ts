import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { isNotEmpty } from '../../../utils/prisma-helpers';

export const createOrder = async (data: Prisma.OrderUncheckedCreateInput) => {
  return prisma.order.create({
    data,
    include: {
      items: true,
    },
  });
};

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      address: true,
      items: true,
      statusHistory: true,
      priceHistory: true,
      cancellations: true,
      payments: true,
    },
  });
};

export const getOrdersByUserId = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAllOrders = async (params?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { status, paymentStatus, search, page = 1, limit = 50 } = params || {};
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    status: 'ACTIVE',
    ...(status ? { orderStatus: status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(isNotEmpty(search)
      ? {
          OR: [
            { id: { contains: search, mode: 'insensitive' } },
            { user: { fullName: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        userId: true,
        addressId: true,
        totalAmount: true,
        shippingFee: true,
        discountAmount: true,
        couponCode: true,
        paymentStatus: true,
        orderStatus: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        address: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            province: true,
            district: true,
            ward: true,
            detail: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  note?: string,
  createdBy: string = "SYSTEM",
) => {
  // Use a transaction to update order and create history record
  return prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note,
        createdBy,
      },
    });

    return updatedOrder;
  });
};

export const updateOrderTotal = async (
  orderId: string,
  newTotal: number,
  reason: string,
  updatedBy: string = "SYSTEM",
) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { totalAmount: newTotal },
    });

    await tx.orderPriceHistory.create({
      data: {
        orderId,
        oldTotal: order.totalAmount,
        newTotal: newTotal,
        reason,
        updatedBy,
      },
    });

    return updatedOrder;
  });
};

export const createOrderCancellation = async (
  data: Prisma.OrderCancellationUncheckedCreateInput,
) => {
  return prisma.$transaction(async (tx) => {
    // Update order status to CANCELLED
    await tx.order.update({
      where: { id: data.orderId },
      data: { orderStatus: "CANCELLED" },
    });

    // Create history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId: data.orderId,
        status: "CANCELLED",
        note: `Order cancellation requested. Reason: ${data.reason}`,
        createdBy: "USER",
      },
    });

    // Create cancellation record
    return tx.orderCancellation.create({
      data,
    });
  });
};
