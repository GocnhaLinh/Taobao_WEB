import { Request, Response } from "express";
import * as couponService from "../services/coupon.service";
import { isDefined } from "../../../utils/prisma-helpers";

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiredAt } = req.body;

    if (!code || !discountType || discountValue === undefined || minOrderValue === undefined || !expiredAt) {
      res.status(400).json({ error: "code, discountType, discountValue, minOrderValue và expiredAt là bắt buộc." });
      return;
    }

    const coupon = await couponService.createCoupon({
      code,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expiredAt: new Date(expiredAt),
    });

    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await couponService.listCoupons({ search, page, limit });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await couponService.getCoupon(id);
    res.json(coupon);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getCouponByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const coupon = await couponService.getCouponByCode(code);
    res.json(coupon);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiredAt, status } = req.body;
    const updated = await couponService.updateCoupon(id, {
      ...(isDefined(code) && { code }),
      ...(isDefined(discountType) && { discountType }),
      ...(isDefined(discountValue) && { discountValue: Number(discountValue) }),
      ...(isDefined(minOrderValue) && { minOrderValue: Number(minOrderValue) }),
      ...(isDefined(maxDiscount) && { maxDiscount: maxDiscount ? Number(maxDiscount) : null }),
      ...(isDefined(expiredAt) && { expiredAt: new Date(expiredAt) }),
      ...(isDefined(status) && { status }),
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderValue, userId } = req.body;

    if (!code || orderValue === undefined) {
      res.status(400).json({ error: "Mã giảm giá (code) và giá trị đơn hàng (orderValue) là bắt buộc." });
      return;
    }

    const result = await couponService.validateCoupon(code, Number(orderValue), userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const softDelete = req.query.softDelete !== 'false';
    await couponService.deleteCoupon(id, softDelete);
    res.json({ message: softDelete ? "Xóa giả mã giảm giá thành công (status=DELETED)." : "Xóa vĩnh viễn mã giảm giá thành công." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
