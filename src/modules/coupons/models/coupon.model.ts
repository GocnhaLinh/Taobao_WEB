import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { isNotEmpty } from "../../../utils/prisma-helpers";

export const createCoupon = async (data: Prisma.CouponCreateInput) => {
  return prisma.coupon.create({ data });
};

export const getCouponById = async (id: string) => {
  return prisma.coupon.findUnique({
    where: { id },
  });
};

export const getCouponByCode = async (code: string) => {
  return prisma.coupon.findUnique({
    where: { code },
  });
};

export const updateCoupon = async (
  id: string,
  data: Prisma.CouponUpdateInput,
) => {
  return prisma.coupon.update({
    where: { id },
    data,
  });
};

export const updateCouponUsage = async (id: string) => {
  return prisma.coupon.update({
    where: { id },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });
};

export const deleteCoupon = async (
  id: string,
  options: { softDelete?: boolean } = { softDelete: true },
) => {
  if (options.softDelete !== false) {
    return prisma.coupon.update({
      where: { id },
      data: { status: "DELETED" },
    });
  } else {
    return prisma.coupon.delete({
      where: { id },
    });
  }
};

export const getCouponsWithPagination = async (
  params: {
    search?: string;
    skip?: number;
    take?: number;
  } = {},
) => {
  const { search, skip, take } = params;
  return prisma.coupon.findMany({
    where: {
      ...(isNotEmpty(search) && {
        code: { contains: search, mode: "insensitive" },
      }),
    },
    orderBy: {
      expiredAt: "desc",
    },
    skip,
    take,
  });
};

export const countCoupons = async (
  params: {
    search?: string;
  } = {},
) => {
  const { search } = params;
  return prisma.coupon.count({
    where: {
      ...(isNotEmpty(search) && {
        code: { contains: search, mode: "insensitive" },
      }),
    },
  });
};

export const validateCoupon = async (
  code: string,
  orderValue: number,
  _userId?: string,
) => {
  const coupon = await getCouponByCode(code);

  if (!coupon || coupon.status !== "ACTIVE") {
    return {
      valid: false,
      message: "Mã giảm giá không tồn tại hoặc đã hết hiệu lực.",
    };
  }

  if (coupon.expiredAt && new Date(coupon.expiredAt) < new Date()) {
    return { valid: false, message: "Mã giảm giá đã hết hạn sử dụng." };
  }

  if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
    return {
      valid: false,
      message: `Giá trị đơn hàng phải đạt tối thiểu ${coupon.minOrderValue.toLocaleString("vi-VN")} VNĐ để áp dụng mã này.`,
    };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: "Mã giảm giá đã hết lượt sử dụng." };
  }

  return { valid: true, coupon };
};
