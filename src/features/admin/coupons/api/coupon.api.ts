import { axiosClient } from '../../../../services/axiosClient';
import type {
  CouponData,
  GetCouponsParams,
  GetCouponsResponse,
  ValidateCouponResponse,
  CreateCouponData,
  UpdateCouponData,
} from '../types';

export const getCouponsApi = async (params?: GetCouponsParams): Promise<GetCouponsResponse> => {
  const res = await axiosClient.get<unknown, GetCouponsResponse | CouponData[]>('/coupons', { params });
  if (Array.isArray(res)) {
    return { coupons: res, total: res.length, page: 1, limit: 50, totalPages: 1 };
  }
  return res;
};

export const createCouponApi = async (data: CreateCouponData): Promise<CouponData> => {
  return axiosClient.post<unknown, CouponData>('/coupons', data);
};

export const updateCouponApi = async (id: string, data: UpdateCouponData): Promise<CouponData> => {
  return axiosClient.put<unknown, CouponData>(`/coupons/${id}`, data);
};

export const validateCouponApi = async (data: {
  code: string;
  orderValue: number;
  userId?: string;
}): Promise<ValidateCouponResponse> => {
  return axiosClient.post<unknown, ValidateCouponResponse>('/coupons/validate', data);
};

export const deleteCouponApi = async (id: string, softDelete: boolean = true): Promise<{ message: string }> => {
  return axiosClient.delete<unknown, { message: string }>(`/coupons/${id}`, {
    params: { softDelete },
  });
};
