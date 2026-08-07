import type { CouponData, CouponMetrics } from '../types';

export const isCouponExpired = (coupon: CouponData | { status: string; expiredAt?: string | null }): boolean => {
  if (coupon.status === 'EXPIRED') return true;
  if (coupon.expiredAt) {
    const time = new Date(coupon.expiredAt).getTime();
    if (!isNaN(time) && time < Date.now()) return true;
  }
  return false;
};

export const filterCoupons = (
  coupons: CouponData[],
  search: string,
  status: string,
  typeFilter: string = 'ALL'
): CouponData[] => {
  return coupons.filter((coupon) => {
    if (coupon.status === 'DELETED') return false;

    const matchesSearch =
      !search || coupon.code.toLowerCase().includes(search.toLowerCase());

    const expired = isCouponExpired(coupon);

    const matchesStatus =
      status === 'ALL'
        ? true
        : status === 'EXPIRED'
        ? expired
        : status === 'ACTIVE'
        ? coupon.status === 'ACTIVE' && !expired
        : coupon.status === status && !expired;

    const matchesType =
      typeFilter === 'ALL' ||
      coupon.discountType.toUpperCase() === typeFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesType;
  });
};

export const calculateCouponMetrics = (coupons: CouponData[]): CouponMetrics => {
  let activeCoupons = 0;
  let disabledCoupons = 0;
  let expiredCoupons = 0;
  let totalUsageCount = 0;

  const validCoupons = coupons.filter((c) => c.status !== 'DELETED');

  validCoupons.forEach((coupon) => {
    totalUsageCount += coupon.usageCount || 0;
    const expired = isCouponExpired(coupon);

    if (expired) {
      expiredCoupons++;
    } else if (coupon.status === 'ACTIVE') {
      activeCoupons++;
    } else if (coupon.status === 'DISABLED') {
      disabledCoupons++;
    }
  });

  return {
    totalCoupons: validCoupons.length,
    activeCoupons,
    disabledCoupons,
    expiredCoupons,
    totalUsageCount,
  };
};
