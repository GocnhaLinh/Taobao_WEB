import type { ReviewData, ReviewMetrics } from '../types';

export const filterReviews = (
  reviews: ReviewData[],
  search: string,
  ratingFilter: string
): ReviewData[] => {
  return reviews.filter((r) => {
    const matchesSearch =
      !search ||
      (r.comment && r.comment.toLowerCase().includes(search.toLowerCase())) ||
      (r.user?.fullName && r.user.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (r.product?.productName && r.product.productName.toLowerCase().includes(search.toLowerCase()));

    const matchesRating =
      ratingFilter === 'ALL' || r.rating === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });
};

export const calculateReviewMetrics = (reviews: ReviewData[]): ReviewMetrics => {
  if (reviews.length === 0) {
    return { totalReviews: 0, averageRating: 0, fiveStarCount: 0, oneStarCount: 0 };
  }

  let totalRating = 0;
  let fiveStarCount = 0;
  let oneStarCount = 0;

  reviews.forEach((r) => {
    totalRating += r.rating;
    if (r.rating === 5) fiveStarCount++;
    if (r.rating === 1) oneStarCount++;
  });

  return {
    totalReviews: reviews.length,
    averageRating: Number((totalRating / reviews.length).toFixed(1)),
    fiveStarCount,
    oneStarCount,
  };
};
