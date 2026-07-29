import { prisma } from '../../../config/prisma';

export const getLatestExchangeRate = async () => {
  return prisma.exchangeRate.findFirst({
    orderBy: { createdAt: 'desc' },
  });
};

export const createExchangeRate = async (rate: number, createdBy: string = 'ADMIN') => {
  return prisma.exchangeRate.create({
    data: {
      rate,
      effectiveFrom: new Date(),
      createdBy,
    },
  });
};

export const getLatestFee = async () => {
  return prisma.fee.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
};

export const updateOrCreateFee = async (data: {
  exchangeRate: number;
  shippingCnPerKg: number;
  shippingVnPerKg: number;
  warehouseFreeDays: number;
  warehouseFeePerDay: number;
  serviceFeePercent: number;
  depositPercent: number;
}) => {
  const current = await getLatestFee();
  if (current) {
    return prisma.fee.update({
      where: { id: current.id },
      data,
    });
  } else {
    return prisma.fee.create({
      data,
    });
  }
};
