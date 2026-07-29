import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/prisma';

export const createPayment = async (data: Prisma.PaymentUncheckedCreateInput) => {
  return prisma.payment.create({ data });
};

export const getPaymentsByOrderId = async (orderId: string) => {
  return prisma.payment.findMany({
    where: { orderId },
  });
};

export const updatePaymentStatus = async (id: string, status: string) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id },
      data: { status },
    });

    // If payment is paid, we can automatically update the order payment status to paid
    if (status === 'PAID') {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'PAID' },
      });
    }

    return payment;
  });
};
