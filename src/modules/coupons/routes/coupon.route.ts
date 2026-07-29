import { Router } from "express";
import * as couponController from "../controllers/coupon.controller";

const router = Router();

router.post("/", couponController.createCoupon);
router.get("/", couponController.getCoupons);
router.post("/validate", couponController.validateCoupon);
router.get("/code/:code", couponController.getCouponByCode);
router.get("/:id", couponController.getCouponById);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

export default router;
