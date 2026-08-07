export const getOrderStatusOptions = (
  t: (key: any) => string,
  includeAllOption = false
) => {
  const options = [
    { value: 'PENDING_ORDER', label: `⏳ 1. ${t('statusPendingOrderOption') || 'Đợi đặt hàng (Chờ Admin xử lý)'}` },
    { value: 'ORDERED', label: `🛒 2. ${t('statusOrderedOption') || 'Đã đặt hàng (Đã mua Taobao/1688)'}` },
    { value: 'SHIPPING', label: `🚚 3. ${t('statusShippingOption') || 'Đang vận chuyển (Trung - Việt)'}` },
    { value: 'ARRIVED_WAREHOUSE', label: `🏢 4. ${t('statusArrivedWarehouseOption') || 'Đã đến kho (Kho Việt Nam)'}` },
    { value: 'COMPLETED', label: `🎉 5. ${t('statusCompletedOption') || 'Hoàn thành (Giao thành công)'}` },
    { value: 'CANCELLED', label: `❌ ${t('statusCancelledOption') || 'Đã hủy đơn hàng'}` },
  ];

  if (includeAllOption) {
    return [{ value: 'ALL', label: t('allOrderStatus') || 'Tất cả trạng thái' }, ...options];
  }
  return options;
};

export const getPaymentStatusOptions = (
  t: (key: any) => string,
  includeAllOption = false
) => {
  const options = [
    { value: 'PENDING', label: `⏳ ${t('paymentPending') || 'Chưa thanh toán (Chưa cọc)'}` },
    { value: 'DEPOSIT_50', label: `💵 ${t('paymentDeposit50') || 'Đã đặt cọc 50%'}` },
    { value: 'DEPOSIT_70', label: `💳 ${t('paymentDeposit70') || 'Đã đặt cọc 70%'}` },
    { value: 'PAID', label: `✅ ${t('paymentPaid') || 'Đã thanh toán 100%'}` },
    { value: 'REFUNDED', label: `🔄 ${t('paymentRefunded') || 'Đã hoàn tiền'}` },
    { value: 'FAILED', label: `❌ ${t('paymentFailed') || 'Thanh toán thất bại'}` },
  ];

  if (includeAllOption) {
    return [{ value: 'ALL', label: t('allPaymentStatus') || 'Tất cả trạng thái cọc / thanh toán' }, ...options];
  }
  return options;
};

export const ORDER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING_ORDER', label: '⏳ 1. Đợi đặt hàng (Chờ Admin xử lý)' },
  { value: 'ORDERED', label: '🛒 2. Đã đặt hàng (Đã mua Taobao/1688)' },
  { value: 'SHIPPING', label: '🚚 3. Đang vận chuyển (Trung - Việt)' },
  { value: 'ARRIVED_WAREHOUSE', label: '🏢 4. Đã đến kho (Kho Việt Nam)' },
  { value: 'COMPLETED', label: '🎉 5. Hoàn thành (Giao thành công)' },
  { value: 'CANCELLED', label: '❌ Đã hủy đơn hàng' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái cọc / thanh toán' },
  { value: 'PENDING', label: '⏳ Chưa thanh toán (Chưa cọc)' },
  { value: 'DEPOSIT_50', label: '💵 Đã đặt cọc 50%' },
  { value: 'DEPOSIT_70', label: '💳 Đã đặt cọc 70%' },
  { value: 'PAID', label: '✅ Đã thanh toán (100%)' },
  { value: 'REFUNDED', label: '🔄 Đã hoàn tiền' },
  { value: 'FAILED', label: '❌ Thanh toán thất bại' },
];
