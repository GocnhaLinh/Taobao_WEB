import { axiosClient } from '../../../../services/axiosClient';
import type { GetReviewsParams, GetReviewsResponse } from '../types';

export const fetchReviewsApi = async (params?: GetReviewsParams): Promise<GetReviewsResponse> => {
  const res = await axiosClient.get<any, any>('/reviews', { params });
  if (Array.isArray(res)) {
    return { reviews: res, total: res.length, page: 1, limit: 50, totalPages: 1 };
  }
  return res;
};

export const deleteReviewApi = async (id: string): Promise<any> => {
  return axiosClient.delete<any, any>(`/reviews/${id}`);
};
