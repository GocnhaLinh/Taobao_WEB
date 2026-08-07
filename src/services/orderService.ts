import { axiosClient } from './axiosClient';

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantName?: string | null;
  quantity: number;
  price: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  note?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string | null;
  paymentStatus: string;
  depositAmount?: number;
  depositPercentage?: number;
  orderStatus: string;
  taobaoOrderId?: string | null;
  trackingCode?: string | null;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
}

export interface GetOrdersParams {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getOrdersApi = async (params?: GetOrdersParams): Promise<GetOrdersResponse> => {
  return axiosClient.get<any, GetOrdersResponse>('/orders', { params });
};

export const getOrderByIdApi = async (id: string): Promise<Order> => {
  return axiosClient.get<any, Order>(`/orders/${id}`);
};

export const getUserOrdersApi = async (userId: string): Promise<Order[]> => {
  return axiosClient.get<any, Order[]>(`/orders/user/${userId}`);
};

export const updateOrderStatusApi = async (
  id: string,
  status: string,
  note?: string,
  taobaoOrderId?: string,
  trackingCode?: string
): Promise<Order> => {
  return axiosClient.put<any, Order>(`/orders/${id}/status`, { status, note, taobaoOrderId, trackingCode });
};

export const cancelOrderApi = async (id: string, reason: string): Promise<any> => {
  return axiosClient.post<any, any>(`/orders/${id}/cancel`, { reason });
};
