import { Prisma } from '@prisma/client';
import * as paymentModel from '../models/payment.model';
import * as orderModel from '../models/order.model';

export const recordPayment = async (data: Prisma.PaymentUncheckedCreateInput) => {
  const order = await orderModel.getOrderById(data.orderId);
  if (!order) {
    throw new Error('Đơn hàng không tồn tại để thanh toán.');
  }
  return paymentModel.createPayment(data);
};

export const getOrderPayments = async (orderId: string) => {
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new Error('Đơn hàng không tồn tại.');
  }
  return paymentModel.getPaymentsByOrderId(orderId);
};

export const processPaymentSuccess = async (paymentId: string) => {
  return paymentModel.updatePaymentStatus(paymentId, 'PAID');
};
