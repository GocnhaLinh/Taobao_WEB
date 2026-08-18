import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { cancelOrderApi } from '../api/order.api';
import type { UseCancelOrderModalParams, UseCancelOrderModalReturn } from '../types';

/**
 * Đơn đã đặt trở đi (ORDERED/SHIPPING/ARRIVED_WAREHOUSE) → mặc định không hoàn tiền.
 * Loại trừ PENDING_ORDER (hoàn 100%), CANCELLED (đã hủy) và COMPLETED (không thể hủy).
 */
const isPlacedStatus = (status?: string) =>
  !['PENDING_ORDER', 'PENDING', 'CANCELLED', 'COMPLETED'].includes((status || '').toUpperCase());

export const useCancelOrderModal = ({
  order,
  isOpen,
  onSuccess,
}: UseCancelOrderModalParams): UseCancelOrderModalReturn => {
  const { t } = useTranslation();

  const [reason, setReason] = useState('');
  const [productRefund, setProductRefund] = useState(0);
  const [shippingLoss, setShippingLoss] = useState(0);
  const [warehouseLoss, setWarehouseLoss] = useState(0);
  const [serviceLoss, setServiceLoss] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Track id đơn đã reset — chỉ reset khi mở modal với đơn MỚI (khác id),
  // KHÔNG reset khi cùng đơn được refetch (object mới cùng id → giữ nội dung admin đang nhập)
  const lastResetOrderIdRef = useRef<string | null>(null);

  // Reset form khi mở modal với đơn mới
  useEffect(() => {
    // Đóng modal → xóa ref để lần mở SAU (kể cả cùng đơn) luôn reset form từ đầu
    if (!isOpen) {
      lastResetOrderIdRef.current = null;
      return;
    }
    // Chỉ reset khi đơn MỚI (khác id) — KHÔNG reset khi cùng đơn được refetch
    // (object mới cùng id → giữ nội dung admin đang nhập)
    if (order && lastResetOrderIdRef.current !== order.id) {
      lastResetOrderIdRef.current = order.id;
      const noRefundByDefault = isPlacedStatus(order.orderStatus);
      setReason('');
      // Đơn chưa đặt (PENDING_ORDER) → mặc định hoàn 100%; đã đặt trở đi → mặc định không hoàn tiền
      setProductRefund(noRefundByDefault ? 0 : order.totalAmount || 0);
      setShippingLoss(0);
      setWarehouseLoss(0);
      setServiceLoss(0);
      setMessage(null);
    }
  }, [isOpen, order]);

  const finalRefund = useMemo(
    () => Math.max(0, productRefund - shippingLoss - warehouseLoss - serviceLoss),
    [productRefund, shippingLoss, warehouseLoss, serviceLoss],
  );

  const alreadyCancelled = order?.orderStatus?.toUpperCase() === 'CANCELLED';
  // COMPLETED (đã giao cho khách) → không thể hủy, kể cả Admin
  const completed = order?.orderStatus?.toUpperCase() === 'COMPLETED';
  // Admin hủy được ở các trạng thái còn lại; đơn từ ORDERED (đã đặt) trở đi → mặc định KHÔNG hoàn tiền
  const placedNoRefund = isPlacedStatus(order?.orderStatus);

  const handleSubmit = useCallback(async () => {
    if (!order) return;
    if (!reason.trim()) {
      setMessage({ type: 'error', text: t('cancelReasonRequired') || 'Vui lòng nhập lý do hủy đơn.' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const cancellation = await cancelOrderApi(order.id, {
        reason: reason.trim(),
        productRefund: Number(productRefund) || 0,
        shippingLoss: Number(shippingLoss) || 0,
        warehouseLoss: Number(warehouseLoss) || 0,
        serviceLoss: Number(serviceLoss) || 0,
        finalRefund,
        status: 'PENDING',
        cancelledBy: 'ADMIN', // Trang admin — phân biệt khách hủy sẽ ghép sau khi có auth
      });
      setMessage({
        type: 'success',
        text:
          placedNoRefund && finalRefund <= 0
            ? t('cancelOrderNoRefundSuccess')
            : t('cancelOrderSuccess'),
      });
      if (onSuccess) onSuccess(cancellation);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.error || err.message || t('cancelOrderFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    order,
    reason,
    productRefund,
    shippingLoss,
    warehouseLoss,
    serviceLoss,
    finalRefund,
    placedNoRefund,
    onSuccess,
    t,
  ]);

  return {
    reason,
    setReason,
    productRefund,
    setProductRefund,
    shippingLoss,
    setShippingLoss,
    warehouseLoss,
    setWarehouseLoss,
    serviceLoss,
    setServiceLoss,
    isSubmitting,
    message,
    finalRefund,
    alreadyCancelled,
    completed,
    placedNoRefund,
    handleSubmit,
  };
};
