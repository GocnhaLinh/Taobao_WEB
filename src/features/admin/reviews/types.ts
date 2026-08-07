export interface ReviewData {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    id: string;
    fullName?: string;
    email?: string;
  };
  product?: {
    id: string;
    productName?: string;
  };
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
}

export interface GetReviewsResponse {
  reviews: ReviewData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewMetrics {
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
  oneStarCount: number;
}

export interface UseReviewsReturn {
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  reviews: ReviewData[];
  metrics: ReviewMetrics;
  isLoading: boolean;
  isRefreshing: boolean;
  handleRefresh: () => Promise<void>;
  refetch: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalItems: number;
}
