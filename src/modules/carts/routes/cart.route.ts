import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';

const router = Router();

router.get('/:userId', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items/:itemId', cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/:userId/clear', cartController.clearCart);

export default router;
