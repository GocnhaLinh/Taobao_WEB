import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';

const router = Router();

router.post('/', reviewController.addReview);
router.get('/', reviewController.listReviews);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/user/:userId', reviewController.getUserReviews);
router.delete('/:id', reviewController.deleteReview);

export default router;
