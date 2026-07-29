import { Prisma } from '@prisma/client';
import * as couponModel from '../models/coupon.model';

export const createCoupon = async (data: Prisma.CouponCreateInput) => {
  const existingCoupon = await couponModel.getCouponByCode(data.code);
  if (existingCoupon) {
    throw new Error('Mã giảm giá này đã tồn tại.');
  }
  return couponModel.createCoupon(data);
};

export const getCoupon = async (id: string) => {
  const coupon = await couponModel.getCouponById(id);
  if (!coupon) {
    throw new Error('Mã giảm giá không tồn tại.');
  }
  return coupon;
};

export const getCouponByCode = async (code: string) => {
  const coupon = await couponModel.getCouponByCode(code);
  if (!coupon) {
    throw new Error('Mã giảm giá không tồn tại.');
  }
  return coupon;
};

export const updateCoupon = async (id: string, data: Prisma.CouponUpdateInput) => {
  const coupon = await couponModel.getCouponById(id);
  if (!coupon) {
    throw new Error('Mã giảm giá không tồn tại.');
  }
  return couponModel.updateCoupon(id, data);
};

export const validateCoupon = async (code: string, orderValue: number, userId?: string) => {
  return couponModel.validateCoupon(code, orderValue, userId);
};

export const deleteCoupon = async (id: string, softDelete: boolean = true) => {
  const coupon = await couponModel.getCouponById(id);
  if (!coupon) {
    throw new Error('Mã giảm giá không tồn tại để xóa.');
  }
  return couponModel.deleteCoupon(id, { softDelete });
};

export const listCoupons = async (params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const skip = (page - 1) * limit;

  const [coupons, total] = await Promise.all([
    couponModel.getCouponsWithPagination({
      search: params.search,
      skip,
      take: limit,
    }),
    couponModel.countCoupons({
      search: params.search,
    }),
  ]);

  return {
    coupons,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
