import { Prisma } from '@prisma/client';
import * as reviewModel from '../models/review.model';
import * as productModel from '../models/product.model';
import * as userModel from '../../users/models/user.model';

export const addProductReview = async (data: Prisma.ReviewUncheckedCreateInput) => {
  // Verify user and product exist
  const [user, product] = await Promise.all([
    userModel.findUserById(data.userId),
    productModel.getProductById(data.productId),
  ]);

  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }
  if (!product) {
    throw new Error('Sản phẩm không tồn tại.');
  }

  // Optional: Check if rating is valid (1-5)
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Đánh giá phải từ 1 đến 5 sao.');
  }

  return reviewModel.createReview(data);
};

export const getProductReviews = async (productId: string) => {
  const product = await productModel.getProductById(productId);
  if (!product) {
    throw new Error('Sản phẩm không tồn tại.');
  }
  return reviewModel.getReviewsByProductId(productId);
};

export const getUserReviews = async (userId: string) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }
  return reviewModel.getReviewsByUserId(userId);
};

export const removeReview = async (id: string) => {
  // Optional: Add check if review exists or auth logic
  return reviewModel.deleteReview(id);
};

export const listReviews = async (params: {
  productId?: string;
  userId?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    reviewModel.getReviewsWithPagination({
      productId: params.productId,
      userId: params.userId,
      rating: params.rating,
      search: params.search,
      skip,
      take: limit,
    }),
    reviewModel.countReviews({
      productId: params.productId,
      userId: params.userId,
      rating: params.rating,
      search: params.search,
    }),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
