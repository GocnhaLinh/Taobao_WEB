import { axiosClient } from './axiosClient';

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

export interface GetReviewsResponse {
  reviews: ReviewData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchReviewsApi = async (params?: { page?: number; limit?: number }): Promise<GetReviewsResponse> => {
  const res = await axiosClient.get<any, any>('/reviews', { params });
  if (Array.isArray(res)) {
    return { reviews: res, total: res.length, page: 1, limit: 50, totalPages: 1 };
  }
  return res;
};

export const deleteReviewApi = async (id: string): Promise<any> => {
  return axiosClient.delete<any, any>(`/reviews/${id}`);
};
