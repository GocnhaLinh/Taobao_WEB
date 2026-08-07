export type OrderStatusType =
  | 'PENDING_ORDER'
  | 'ORDERED'
  | 'SHIPPING'
  | 'ARRIVED_WAREHOUSE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ALL';

export type PaymentStatusType =
  | 'PAID'
  | 'DEPOSIT_50'
  | 'DEPOSIT_70'
  | 'PENDING'
  | 'FAILED'
  | 'REFUNDED'
  | 'ALL';

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

export interface OrderUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
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
  user?: OrderUser;
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

export interface OrderMetrics {
  totalRevenue: number;
  pendingCount: number;
  inTransitCount: number;
  completedCount: number;
  totalOrders: number;
}

export interface OrderRowCardProps {
  order: Order;
  onSelect: (order: Order) => void;
}

export interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export interface OrderFilterProps {
  searchTerm: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  paymentFilter: string;
  onPaymentChange: (payment: string) => void;
  totalCount: number;
}

export interface OrderStatCardsProps {
  metrics: OrderMetrics;
}

export interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export interface PaymentStatusBadgeProps {
  paymentStatus: string;
  className?: string;
}

export interface UseOrderDetailModalParams {
  order: Order | null;
  onRefresh?: () => void;
}

export interface UseOrderDetailModalReturn {
  status: string;
  setStatus: (st: string) => void;
  paymentStatus: string;
  depositAmount: number;
  setDepositAmount: (amt: number) => void;
  depositPercentage: number;
  taobaoOrderId: string;
  setTaobaoOrderId: (id: string) => void;
  trackingCode: string;
  setTrackingCode: (code: string) => void;
  note: string;
  setNote: (note: string) => void;
  isUpdating: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  copiedField: string | null;
  handleCopyText: (text: string, fieldName: string) => void;
  handlePaymentStatusChange: (newPayStatus: string) => void;
  handleSaveStatus: () => Promise<void>;
}

export interface UseOrdersReturn {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  paymentFilter: string;
  setPaymentFilter: (s: string) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (o: Order | null) => void;
  rawOrders: Order[];
  displayOrders: Order[];
  paginatedOrders: Order[];
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
  totalOrdersCount: number;
  metrics: OrderMetrics;
  isLoading: boolean;
  refetch: () => void;
}
