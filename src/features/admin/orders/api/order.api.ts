import { axiosClient } from '../../../../services/axiosClient';
import type {
  Order,
  GetOrdersParams,
  GetOrdersResponse,
  CreateOrderData,
  CancelOrderData,
  OrderCancellation,
} from '../types';
import type { Address } from '../../../../types';

export const getOrdersApi = async (params?: GetOrdersParams): Promise<GetOrdersResponse> => {
  return axiosClient.get<GetOrdersResponse, GetOrdersResponse>('/orders', { params });
};

export const createOrderApi = async (data: CreateOrderData): Promise<Order> => {
  return axiosClient.post<Order, Order>('/orders', data);
};

export const getAddressesByUserIdApi = async (userId: string): Promise<Address[]> => {
  return axiosClient.get<Address[], Address[]>(`/addresses/user/${userId}`);
};

export const getOrderByIdApi = async (id: string): Promise<Order> => {
  return axiosClient.get<Order, Order>(`/orders/${id}`);
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
  return axiosClient.put<Order, Order>(`/orders/${id}/status`, {
    status,
    note,
    taobaoOrderId,
    trackingCode,
    paymentStatus,
    depositAmount,
    depositPercentage,
  });
};

export const cancelOrderApi = async (id: string, data: CancelOrderData): Promise<OrderCancellation> => {
  return axiosClient.post<OrderCancellation, OrderCancellation>(`/orders/${id}/cancel`, data);
};

export const updateCancellationStatusApi = async (
  cancellationId: string,
  status: string
): Promise<OrderCancellation> => {
  return axiosClient.put<OrderCancellation, OrderCancellation>(`/orders/cancellations/${cancellationId}/status`, {
    status,
  });
};
