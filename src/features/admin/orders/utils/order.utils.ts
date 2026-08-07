import type { Order, OrderMetrics } from '../types';

export const calculateOrderMetrics = (orders: Order[]): OrderMetrics => {
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const pendingCount = orders.filter(
    (o) => o.orderStatus?.toUpperCase() === 'PENDING_ORDER' || o.orderStatus?.toUpperCase() === 'PENDING'
  ).length;
  const inTransitCount = orders.filter((o) =>
    ['SHIPPING', 'ORDERED', 'ARRIVED_WAREHOUSE'].includes(o.orderStatus?.toUpperCase() || '')
  ).length;
  const completedCount = orders.filter((o) => o.orderStatus?.toUpperCase() === 'COMPLETED').length;

  return {
    totalRevenue,
    pendingCount,
    inTransitCount,
    completedCount,
    totalOrders: orders.length,
  };
};

export const filterOrders = (
  orders: Order[],
  searchTerm: string,
  statusFilter: string,
  paymentFilter: string
): Order[] => {
  const searchLower = searchTerm.replace(/^#/, '').trim().toLowerCase();

  const filtered = orders.filter((ord) => {
    const userName = ord.user?.fullName || '';
    const userEmail = ord.user?.email || '';
    const taobaoId = ord.taobaoOrderId || '';
    const tracking = ord.trackingCode || '';

    const matchesSearch =
      !searchLower ||
      taobaoId.toLowerCase().includes(searchLower) ||
      tracking.toLowerCase().includes(searchLower) ||
      ord.id.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'ALL' || ord.orderStatus?.toUpperCase() === statusFilter.toUpperCase();
    const matchesPayment = paymentFilter === 'ALL' || ord.paymentStatus?.toUpperCase() === paymentFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (!searchLower) return filtered;

  // Sắp xếp ưu tiên: Mã Taobao -> Mã vận chuyển -> Mã đơn -> Tên/Email
  return filtered.sort((a, b) => {
    const aTb = (a.taobaoOrderId || '').toLowerCase().includes(searchLower);
    const bTb = (b.taobaoOrderId || '').toLowerCase().includes(searchLower);
    if (aTb && !bTb) return -1;
    if (!aTb && bTb) return 1;

    const aVc = (a.trackingCode || '').toLowerCase().includes(searchLower);
    const bVc = (b.trackingCode || '').toLowerCase().includes(searchLower);
    if (aVc && !bVc) return -1;
    if (!aVc && bVc) return 1;

    return 0;
  });
};

/**
 * Tự động dịch các trường dữ liệu ghi chú lịch sử đơn hàng (Taobao, Vận chuyển, Cọc, Thanh toán)
 * sang ngôn ngữ đang được người dùng lựa chọn (Việt / Anh / Trung).
 */
export const formatHistoryNote = (
  note: string,
  t: (key: any, params?: any) => string
): string => {
  if (!note) return '';

  const parts = note.split(' | ');
  const translatedParts = parts.map((part) => {
    const trimmed = part.trim();

    // Thanh toán / Payment
    if (/^(Thanh toán|Payment|支付):/i.test(trimmed)) {
      const val = trimmed.replace(/^(Thanh toán|Payment|支付):\s*/i, '');
      return `${t('paymentLabel')} ${val}`;
    }

    // Đã cọc / Deposited
    if (/^(Đã cọc|Deposited|已付定金):/i.test(trimmed)) {
      const val = trimmed.replace(/^(Đã cọc|Deposited|已付定金):\s*/i, '');
      return `${t('depositedLabel')}: ${val}`;
    }

    // Mã Taobao / Taobao ID
    if (/^(Mã Taobao|Taobao ID|淘宝单号):/i.test(trimmed)) {
      const val = trimmed.replace(/^(Mã Taobao|Taobao ID|淘宝单号):\s*/i, '');
      return `${t('taobaoOrderIdLabel')}: ${val}`;
    }

    // Mã vận chuyển / Tracking Code
    if (/^(Mã vận chuyển|Tracking Code|Tracking|运单号):/i.test(trimmed)) {
      const val = trimmed.replace(/^(Mã vận chuyển|Tracking Code|Tracking|运单号):\s*/i, '');
      return `${t('trackingCodeLabel')}: ${val}`;
    }

    return trimmed;
  });

  return translatedParts.join(' | ');
};
