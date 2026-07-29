import { Router } from 'express';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);
router.put('/:id/adjust-total', orderController.adjustOrderTotal);

export default router;
