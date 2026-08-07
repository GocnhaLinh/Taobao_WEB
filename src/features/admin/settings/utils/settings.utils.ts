import type { FeeConfig } from '../types';

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  exchangeRate: 3650,
  shippingCnPerKg: 15,
  shippingVnPerKg: 25000,
  warehouseFreeDays: 7,
  warehouseFeePerDay: 5000,
  serviceFeePercent: 5,
  depositPercent: 70,
};

export const calculateShippingCostVND = (
  weightKg: number,
  config: FeeConfig = DEFAULT_FEE_CONFIG
): number => {
  const cnCostVND = weightKg * config.shippingCnPerKg * config.exchangeRate;
  const vnCostVND = weightKg * config.shippingVnPerKg;
  return cnCostVND + vnCostVND;
};
