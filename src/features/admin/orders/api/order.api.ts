import { axiosClient } from '../../../../services/axiosClient';
import type { Order, GetOrdersParams, GetOrdersResponse } from '../types';

export const getOrdersApi = async (params?: GetOrdersParams): Promise<GetOrdersResponse> => {
  return axiosClient.get<any, GetOrdersResponse>('/orders', { params });
};

export const getOrderByIdApi = async (id: string): Promise<Order> => {
  return axiosClient.get<any, Order>(`/orders/${id}`);
};

export const updateOrderStatusApi = async (
  id: string,
  status: string,
  note?: string,
  taobaoOrderId?: string,
  trackingCode?: string,
  paymentStatus?: string,
  depositAmount?: number,
  depositPercentage?: number
): Promise<Order> => {
  return axiosClient.put<any, Order>(`/orders/${id}/status`, {
    status,
    note,
    taobaoOrderId,
    trackingCode,
    paymentStatus,
    depositAmount,
    depositPercentage,
  });
};

export const cancelOrderApi = async (id: string, reason: string): Promise<any> => {
  return axiosClient.post<any, any>(`/orders/${id}/cancel`, { reason });
};
