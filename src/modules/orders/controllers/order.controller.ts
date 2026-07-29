import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, addressId, items, couponCode, shippingFee } = req.body;
    if (!userId || !addressId || !items || !Array.isArray(items)) {
      res.status(400).json({ error: 'userId, addressId và danh sách sản phẩm (items) là bắt buộc.' });
      return;
    }

    const order = await orderService.placeOrder({
      userId,
      addressId,
      items,
      couponCode,
      shippingFee: Number(shippingFee) || 0,
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus, search, page, limit } = req.query;
    const result = await orderService.listAllOrders({
      status: status as string,
      paymentStatus: paymentStatus as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId là bắt buộc.' });
      return;
    }
    const orders = await orderService.getUserOrders(userId);
    res.json(orders);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderDetails(id);
    res.json(order);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note, createdBy } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Trạng thái đơn hàng (status) là bắt buộc.' });
      return;
    }

    const updatedOrder = await orderService.changeOrderStatus(id, status, note, createdBy || 'ADMIN');
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ error: 'Lý do hủy đơn hàng (reason) là bắt buộc.' });
      return;
    }

    const cancellation = await orderService.cancelOrder(id, reason);
    res.json(cancellation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const adjustOrderTotal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newTotal, reason, updatedBy } = req.body;
    if (newTotal === undefined || !reason) {
      res.status(400).json({ error: 'newTotal và reason là bắt buộc.' });
      return;
    }

    const updated = await orderService.adjustOrderTotal(id, Number(newTotal), reason, updatedBy || 'ADMIN');
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
