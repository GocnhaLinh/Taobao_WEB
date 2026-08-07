import { axiosClient } from '../../../../services/axiosClient';
import type { FeeConfig, ExchangeRateResponse } from '../types';

export const getFeeConfigApi = async (): Promise<FeeConfig> => {
  return axiosClient.get<any, FeeConfig>('/settings/fees');
};

export const saveFeeConfigApi = async (data: FeeConfig): Promise<FeeConfig> => {
  return axiosClient.post<any, FeeConfig>('/settings/fees', data);
};

export const getExchangeRateApi = async (): Promise<ExchangeRateResponse> => {
  return axiosClient.get<any, ExchangeRateResponse>('/settings/exchange-rate');
};

export const updateExchangeRateApi = async (rate: number): Promise<any> => {
  return axiosClient.post('/settings/exchange-rate', { rate });
};
