import { Router } from 'express';
import categoryRouter from '../modules/categories/routes/category.route';
import brandRouter from '../modules/products/routes/brand.route';
import userRouter from '../modules/users/routes/user.route';
import addressRouter from '../modules/users/routes/address.route';
import productRouter from '../modules/products/routes/product.route';
import reviewRouter from '../modules/products/routes/review.route';
import uploadRouter from '../modules/products/routes/upload.route';
import chatRouter from '../modules/chat/routes/chat.route';
import warehouseRouter from '../modules/warehouses/routes/warehouse.route';
import couponRouter from '../modules/coupons/routes/coupon.route';
import settingsRouter from '../modules/settings/routes/settings.route';
import cartRouter from '../modules/carts/routes/cart.route';
import orderRouter from '../modules/orders/routes/order.route';

import categoryLabelRouter from '../modules/categories/routes/categoryLabel.route';

const router = Router();

router.use('/categories', categoryRouter);
router.use('/category-labels', categoryLabelRouter);
router.use('/brands', brandRouter);
router.use('/users', userRouter);
router.use('/addresses', addressRouter);
router.use('/products', productRouter);
router.use('/reviews', reviewRouter);
router.use('/upload', uploadRouter);
router.use('/chat', chatRouter);
router.use('/warehouses', warehouseRouter);
router.use('/coupons', couponRouter);
router.use('/settings', settingsRouter);
router.use('/carts', cartRouter);
router.use('/orders', orderRouter);

export default router;
