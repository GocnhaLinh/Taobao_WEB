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

export interface ExchangeRateResponse {
  rate: number;
}

export interface UseSettingsReturn {
  config: FeeConfig | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  handleRefresh: () => Promise<void>;
  refetch: () => void;
}
