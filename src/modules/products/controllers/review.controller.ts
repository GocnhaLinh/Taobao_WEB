import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, userId, rating, comment } = req.body;

    if (!productId || !userId || rating === undefined) {
      res.status(400).json({ error: 'productId, userId và rating là bắt buộc.' });
      return;
    }

    const review = await reviewService.addProductReview({
      productId,
      userId,
      rating: parseInt(rating, 10),
      comment,
    });
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getProductReviews(productId);
    res.json(reviews);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const reviews = await reviewService.getUserReviews(userId);
    res.json(reviews);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await reviewService.removeReview(id);
    res.json({ message: 'Xóa đánh giá thành công.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.query.productId as string | undefined;
    const userId = req.query.userId as string | undefined;
    const search = req.query.search as string | undefined;
    const rating = req.query.rating ? parseInt(req.query.rating as string, 10) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const result = await reviewService.listReviews({
      productId,
      userId,
      rating,
      search,
      page,
      limit,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
