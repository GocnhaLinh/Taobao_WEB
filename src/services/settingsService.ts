import { axiosClient } from "./axiosClient";

export interface FeeConfig {
  id?: string;
  exchangeRate: number;
  shippingCnPerKg: number;
  shippingVnPerKg: number;
  warehouseFreeDays: number;
  warehouseFeePerDay: number;
  serviceFeePercent: number;
  depositPercent: number;
  updatedAt?: string;
}

export const getFeeConfigApi = async (): Promise<FeeConfig> => {
  return axiosClient.get<any, FeeConfig>("/settings/fees");
};

export const saveFeeConfigApi = async (data: FeeConfig): Promise<FeeConfig> => {
  return axiosClient.post<any, FeeConfig>("/settings/fees", data);
};

export const getExchangeRateApi = async (): Promise<{ rate: number }> => {
  return axiosClient.get<any, { rate: number }>("/settings/exchange-rate");
};

export const updateExchangeRateApi = async (rate: number): Promise<any> => {
  return axiosClient.post("/settings/exchange-rate", { rate });
};
