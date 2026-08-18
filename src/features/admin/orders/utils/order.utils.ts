import type { Order, OrderMetrics } from '../types';

export const calculateOrderMetrics = (orders: Order[]): OrderMetrics => {
  // Doanh thu KHÔNG tính đơn đã hủy (CANCELLED) + đơn đã hoàn tiền (REFUNDED)
  const revenueOrders = orders.filter(
    (o) =>
      (o.orderStatus || '').toUpperCase() !== 'CANCELLED' &&
      (o.paymentStatus || '').toUpperCase() !== 'REFUNDED'
  );
  const totalRevenue = revenueOrders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const pendingCount = orders.filter(
    (o) => o.orderStatus?.toUpperCase() === 'PENDING_ORDER' || o.orderStatus?.toUpperCase() === 'PENDING'
  ).length;
  const inTransitCount = orders.filter((o) =>
    ['SHIPPING', 'ORDERED'].includes(o.orderStatus?.toUpperCase() || '')
  ).length;
  const arrivedCount = orders.filter((o) => o.orderStatus?.toUpperCase() === 'ARRIVED_WAREHOUSE').length;
  const completedCount = orders.filter((o) => o.orderStatus?.toUpperCase() === 'COMPLETED').length;

  return {
    totalRevenue,
    pendingCount,
    inTransitCount,
    arrivedCount,
    completedCount,
    totalOrders: orders.length,
  };
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
