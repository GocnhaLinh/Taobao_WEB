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

/** Thuộc tính đầy đủ của variant trong đơn (snapshot từ ProductVariant) */
export interface OrderVariant {
  id: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  price: number;
  salePrice?: number | null;
  stock?: number;
  image?: string | null;
  images?: string[];
  weight?: number | null;
  originalPriceCNY?: number | null;
  exchangeRate?: number | null;
  shippingCostVND?: number | null;
  totalCostVND?: number | null;
  profitVND?: number | null;
  status?: string;
  /** Fallback ảnh cấp sản phẩm — nhiều sản phẩm chỉ lưu ảnh ở product (variant không có ảnh riêng) */
  product?: {
    thumbnail?: string | null;
    images?: { imageUrl: string }[];
  } | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantName?: string | null;
  quantity: number;
  price: number;
  variant?: OrderVariant | null;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  note?: string | null;
  createdBy: string;
  createdAt: string;
}

export type CancellationStatusType = 'PENDING' | 'APPROVED' | 'REFUNDED' | 'REJECTED';

export interface OrderCancellation {
  id: string;
  orderId: string;
  reason: string;
  productRefund: number;
  shippingLoss: number;
  warehouseLoss: number;
  serviceLoss: number;
  finalRefund: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CancelOrderData {
  reason: string;
  productRefund?: number;
  shippingLoss?: number;
  warehouseLoss?: number;
  serviceLoss?: number;
  finalRefund?: number;
  status?: CancellationStatusType;
  /** Người hủy đơn: ADMIN (trang admin) / USER (khách hàng — sẽ ghép sau khi có auth) */
  cancelledBy?: 'ADMIN' | 'USER';
}

export interface OrderUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
}

export interface Order {
  id: string;
  /** Mã đơn tuần tự hiển thị OD0001, OD0002... (ObjectId vẫn là khóa chính) */
  orderCode?: string | null;
  /** null khi là đơn khách vãng lai (chưa đăng ký tài khoản) */
  userId?: string | null;
  addressId?: string | null;
  /** Snapshot khách hàng vãng lai (chưa đăng ký tài khoản) */
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  shippingProvince?: string | null;
  shippingDistrict?: string | null;
  shippingWard?: string | null;
  shippingDetail?: string | null;
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
  cancellations?: OrderCancellation[];
  user?: OrderUser;
  address?: {
    id: string;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
  } | null;
}

export interface CreateOrderItemInput {
  variantId: string;
  quantity: number;
  /** Admin có thể override giá bán */
  price?: number;
}

export interface CreateOrderData {
  userId?: string;
  addressId?: string;
  items: CreateOrderItemInput[];
  couponCode?: string;
  shippingFee: number;
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    province?: string;
    district?: string;
    ward?: string;
    detail?: string;
  };
  createdBy?: string;
}

export type CustomerMode = 'registered' | 'guest';

export interface GetOrdersParams {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
  /** Phạm vi trạng thái tính metrics của page (không theo dropdown lọc danh sách) */
  metricsStatus?: string;
}

export interface GetOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Metrics tính trên toàn bộ đơn khớp bộ lọc (không phân trang) — do server tính */
  metrics?: OrderMetrics;
}

export interface OrderMetrics {
  totalRevenue: number;
  pendingCount: number;
  inTransitCount: number;
  arrivedCount: number;
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
  /** Làm mới danh sách mà KHÔNG đóng modal (dùng sau khi hủy đơn) */
  onListRefresh?: () => void;
}

export interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: Order) => void;
}

export interface CreateOrderCustomer {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
}

export interface DraftOrderItem {
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  price: number;
  /** Ảnh đại diện tốt nhất khi thêm vào đơn: variant image → product thumbnail (có thể rỗng nếu không có ảnh) */
  image?: string;
  variant: OrderVariant;
}

export interface UseCreateOrderParams {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: Order) => void;
}

export interface UseCreateOrderReturn {
  customerMode: CustomerMode;
  setCustomerMode: (m: CustomerMode) => void;
  users: OrderUser[];
  loadingData: boolean;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  addresses: import('../../../types').Address[];
  customer: CreateOrderCustomer;
  setCustomerField: (field: keyof CreateOrderCustomer, value: string) => void;
  productSearch: string;
  setProductSearch: (s: string) => void;
  filteredProducts: import('../../../types').Product[];
  selectedProduct: import('../../../types').Product | null;
  selectedVariantId: string;
  handleSelectVariant: (id: string) => void;
  handleSelectProduct: (id: string) => void;
  quantity: number;
  setQuantity: (n: number) => void;
  priceOverride: string;
  setPriceOverride: (s: string) => void;
  shippingFee: string;
  setShippingFee: (s: string) => void;
  couponCode: string;
  setCouponCode: (s: string) => void;
  draftItems: DraftOrderItem[];
  addItem: () => void;
  updateItemQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  subtotal: number;
  /** Số tiền giảm do voucher (đã validate qua API) — trừ vào tổng thanh toán */
  discountAmount: number;
  /** Trạng thái kiểm tra mã giảm giá: idle (chưa nhập) / valid / invalid */
  couponStatus: 'idle' | 'valid' | 'invalid';
  /** Thông báo lỗi mã giảm giá (khi invalid) */
  couponMessage: string | null;
  total: number;
  isSubmitting: boolean;
  error: string | null;
  handleSubmit: () => Promise<void>;
  handleClose: () => void;
}

export interface OrderFilterProps {
  searchTerm: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  paymentFilter: string;
  onPaymentChange: (payment: string) => void;
  totalCount: number;
  /** Giới hạn danh sách trạng thái hiển thị trong dropdown (mặc định: tất cả) */
  allowedStatuses?: string[];
}

export interface OrderStatCardsProps {
  metrics: OrderMetrics;
  /** Các trạng thái được phép hiển thị → chỉ render card tương ứng (page Order / page Kho khác nhau) */
  allowedStatuses?: string[];
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
  /** Làm mới danh sách phía sau mà KHÔNG đóng modal (sau khi lưu trạng thái) */
  onRefresh?: () => void;
  /** Cập nhật bản chi tiết đang xem (refetch đơn theo id) sau khi lưu thành công */
  onSaved?: () => void;
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

export interface UseCancelOrderModalParams {
  order: Order | null;
  isOpen: boolean;
  onSuccess?: (cancellation: OrderCancellation) => void;
}

export interface UseCancelOrderModalReturn {
  reason: string;
  setReason: (v: string) => void;
  productRefund: number;
  setProductRefund: (v: number) => void;
  shippingLoss: number;
  setShippingLoss: (v: number) => void;
  warehouseLoss: number;
  setWarehouseLoss: (v: number) => void;
  serviceLoss: number;
  setServiceLoss: (v: number) => void;
  isSubmitting: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  finalRefund: number;
  alreadyCancelled: boolean;
  /** Đơn đã hoàn thành (đã giao cho khách) → không thể hủy, kể cả Admin */
  completed: boolean;
  placedNoRefund: boolean;
  handleSubmit: () => Promise<void>;
}

export interface UseOrderCancellationParams {
  order: Order | null;
  isOpen: boolean;
  /** Làm mới danh sách mà KHÔNG đóng modal (dùng sau khi hủy đơn) */
  onListRefresh?: () => void;
}

export interface UseOrderCancellationReturn {
  isCancelModalOpen: boolean;
  setIsCancelModalOpen: (v: boolean) => void;
  /** Bản đầy đủ (gồm cancellations / payments) sau khi fetch */
  fullOrder: Order | null;
  /** Đơn dùng để render: ưu tiên bản đầy đủ nếu khớp id */
  currentOrder: Order | null;
  updatingCancellationId: string | null;
  cancellationError: string | null;
  handleChangeCancellationStatus: (cancellationId: string, status: string) => Promise<void>;
  /** Xử lý sau khi hủy đơn thành công: đóng modal + refetch chi tiết + làm mới list */
  handleCancelSuccess: () => void;
  /** Refetch lại bản chi tiết đầy đủ của đơn (dùng sau khi lưu trạng thái để cập nhật dữ liệu hiển thị) */
  refreshOrder: () => Promise<void>;
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
  /** Đơn đã lọc + phân trang server-side — dùng trực tiếp để render list */
  orders: Order[];
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
