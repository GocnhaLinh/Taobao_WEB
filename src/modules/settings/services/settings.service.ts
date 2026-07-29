import * as settingsModel from '../models/settings.model';
import { prisma } from '../../../config/prisma';
import { invalidateFeeConfigCache } from '../../products/services/product.service';

export const recalculateAllVariantsCosts = async (exchangeRate: number, shippingCnPerKg: number) => {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { status: { not: 'DELETED' } },
    });

    // Wrap trong transaction: nếu crash giữa chừng → rollback toàn bộ
    // tránh dữ liệu inconsistent (499/1000 variant cập nhật, 501 variant giữ giá cũ)
    await prisma.$transaction(
      variants
        .filter((v) => {
          const originalPriceCNY = v.originalPriceCNY ? Number(v.originalPriceCNY) : 0;
          const weight = v.weight ? Number(v.weight) : 0;
          return originalPriceCNY > 0 || weight > 0;
        })
        .map((v) => {
          const price = Number(v.price || 0);
          const weight = v.weight ? Number(v.weight) : 0;
          const originalPriceCNY = v.originalPriceCNY ? Number(v.originalPriceCNY) : 0;

          const rawShip = (weight > 0 && shippingCnPerKg > 0) ? weight * shippingCnPerKg : (v.shippingCostVND || 0);
          const shippingCostVND = rawShip > 0 ? Math.round(rawShip) : (v.shippingCostVND || 0);

          const totalCostVND = (originalPriceCNY > 0 && exchangeRate > 0)
            ? Math.round(originalPriceCNY * exchangeRate + rawShip)
            : (v.totalCostVND || null);

          const profitVND = totalCostVND !== null ? Math.round(price - totalCostVND) : (v.profitVND || null);

          return prisma.productVariant.update({
            where: { id: v.id },
            data: { exchangeRate, shippingCostVND, totalCostVND, profitVND },
          });
        }),
    );
  } catch (error) {
    console.error('Lỗi khi tự động tính lại giá vốn biến thể sản phẩm:', error);
  }
};

export const getExchangeRate = async () => {
  const rate = await settingsModel.getLatestExchangeRate();
  if (!rate) {
    throw new Error('Chưa có thông tin tỷ giá trong hệ thống.');
  }
  return rate;
};

export const updateExchangeRate = async (rate: number, createdBy = 'ADMIN') => {
  if (rate <= 0) {
    throw new Error('Tỷ giá phải lớn hơn 0.');
  }
  const newRate = await settingsModel.createExchangeRate(rate, createdBy);

  const fee = await settingsModel.getLatestFee();
  if (fee) {
    await settingsModel.updateOrCreateFee({
      exchangeRate: rate,
      shippingCnPerKg: fee.shippingCnPerKg,
      shippingVnPerKg: fee.shippingVnPerKg,
      warehouseFreeDays: fee.warehouseFreeDays,
      warehouseFeePerDay: fee.warehouseFeePerDay,
      serviceFeePercent: fee.serviceFeePercent,
      depositPercent: fee.depositPercent,
    });
    await recalculateAllVariantsCosts(rate, fee.shippingCnPerKg);
  }

  // Xóa cache fee config để product.service lấy tỷ giá mới ngay lập tức
  invalidateFeeConfigCache();

  return newRate;
};

export const getFeeConfig = async () => {
  const fee = await settingsModel.getLatestFee();
  if (!fee) {
    throw new Error('Chưa có thông tin cấu hình phí trong hệ thống.');
  }
  const latestRate = await settingsModel.getLatestExchangeRate();
  if (latestRate && latestRate.rate) {
    return {
      ...fee,
      exchangeRate: latestRate.rate,
    };
  }
  return fee;
};

export const saveFeeConfig = async (data: {
  exchangeRate: number;
  shippingCnPerKg: number;
  shippingVnPerKg: number;
  warehouseFreeDays: number;
  warehouseFeePerDay: number;
  serviceFeePercent: number;
  depositPercent: number;
}) => {
  if (
    data.exchangeRate <= 0 ||
    data.shippingCnPerKg < 0 ||
    data.shippingVnPerKg < 0 ||
    data.warehouseFreeDays < 0 ||
    data.warehouseFeePerDay < 0 ||
    data.serviceFeePercent < 0 ||
    data.depositPercent < 0
  ) {
    throw new Error('Các giá trị cấu hình phí phải hợp lệ và lớn hơn hoặc bằng 0.');
  }

  await settingsModel.createExchangeRate(data.exchangeRate, 'ADMIN');
  const result = await settingsModel.updateOrCreateFee(data);
  await recalculateAllVariantsCosts(data.exchangeRate, data.shippingCnPerKg);

  // Xóa cache fee config để product.service lấy phí mới ngay lập tức
  invalidateFeeConfigCache();

  return result;
};
