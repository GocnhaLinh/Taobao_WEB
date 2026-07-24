import { axiosClient } from './axiosClient';

export interface CouponData {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  expiredAt?: string | null;
  status: string;
  usageCount?: number;
  createdAt?: string;
}

export interface GetCouponsResponse {
  coupons: CouponData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  message?: string;
  coupon?: CouponData;
}

export const getCouponsApi = async (params?: { search?: string; page?: number; limit?: number }): Promise<GetCouponsResponse> => {
  const res = await axiosClient.get<any, any>('/coupons', { params });
  if (Array.isArray(res)) {
    return { coupons: res, total: res.length, page: 1, limit: 50, totalPages: 1 };
  }
  return res;
};

export const createCouponApi = async (data: {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiredAt: string;
}): Promise<CouponData> => {
  return axiosClient.post<any, CouponData>('/coupons', data);
};

export const updateCouponApi = async (
  id: string,
  data: Partial<{
    code: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number | null;
    expiredAt?: string;
    status?: string;
  }>
): Promise<CouponData> => {
  return axiosClient.put<any, CouponData>(`/coupons/${id}`, data);
};

export const validateCouponApi = async (data: {
  code: string;
  orderValue: number;
  userId?: string;
}): Promise<ValidateCouponResponse> => {
  return axiosClient.post<any, ValidateCouponResponse>('/coupons/validate', data);
};

export const deleteCouponApi = async (id: string, softDelete: boolean = true): Promise<any> => {
  return axiosClient.delete<any, any>(`/coupons/${id}`, {
    params: { softDelete },
  });
};
