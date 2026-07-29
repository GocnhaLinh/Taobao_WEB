import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/prisma';
import { isDefined, isNotEmpty } from '../../../utils/prisma-helpers';

export const createReview = async (data: Prisma.ReviewUncheckedCreateInput) => {
  return prisma.review.create({ data });
};

export const getReviewsByProductId = async (productId: string) => {
  return prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getReviewsByUserId = async (userId: string) => {
  return prisma.review.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          thumbnail: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const deleteReview = async (id: string) => {
  return prisma.review.delete({
    where: { id },
  });
};

export const getReviewsWithPagination = async (params: {
  productId?: string;
  userId?: string;
  rating?: number;
  search?: string;
  skip?: number;
  take?: number;
} = {}) => {
  const { productId, userId, rating, search, skip, take } = params;
  return prisma.review.findMany({
    where: {
      ...(isDefined(productId) && { productId }),
      ...(isDefined(userId) && { userId }),
      ...(isDefined(rating) && { rating }),
      ...(isNotEmpty(search) && {
        comment: { contains: search, mode: "insensitive" },
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      product: {
        select: {
          id: true,
          productName: true,
          thumbnail: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });
};

export const countReviews = async (params: {
  productId?: string;
  userId?: string;
  rating?: number;
  search?: string;
} = {}) => {
  const { productId, userId, rating, search } = params;
  return prisma.review.count({
    where: {
      ...(isDefined(productId) && { productId }),
      ...(isDefined(userId) && { userId }),
      ...(isDefined(rating) && { rating }),
      ...(isNotEmpty(search) && {
        comment: { contains: search, mode: "insensitive" },
      }),
    },
  });
};
