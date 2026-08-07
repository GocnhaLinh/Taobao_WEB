import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { updateOrderStatusApi } from '../api/order.api';
import type { UseOrderDetailModalParams, UseOrderDetailModalReturn } from '../types';

export const useOrderDetailModal = ({ order, onRefresh }: UseOrderDetailModalParams): UseOrderDetailModalReturn => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<string>('PENDING_ORDER');
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositPercentage, setDepositPercentage] = useState<number>(0);
  const [taobaoOrderId, setTaobaoOrderId] = useState<string>('');
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus || 'PENDING_ORDER');
      setPaymentStatus(order.paymentStatus || 'PENDING');
      setDepositAmount(order.depositAmount || 0);
      setDepositPercentage(order.depositPercentage || 0);
      setTaobaoOrderId(order.taobaoOrderId || '');
      setTrackingCode(order.trackingCode || '');
      setNote('');
      setMessage(null);
    }
  }, [order]);

  const handleCopyText = useCallback((text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handlePaymentStatusChange = useCallback(
    (newPayStatus: string) => {
      setPaymentStatus(newPayStatus);
      const total = order?.totalAmount || 0;

      switch (newPayStatus.toUpperCase()) {
        case 'DEPOSIT_50':
          setDepositPercentage(50);
          setDepositAmount(Math.round(total * 0.5));
          break;
        case 'DEPOSIT_70':
          setDepositPercentage(70);
          setDepositAmount(Math.round(total * 0.7));
          break;
        case 'PAID':
        case 'PAID_100':
          setDepositPercentage(100);
          setDepositAmount(total);
          break;
        case 'PENDING':
        case 'FAILED':
          setDepositPercentage(0);
          setDepositAmount(0);
          break;
        default:
          break;
      }
    },
    [order?.totalAmount]
  );

  const handleSaveStatus = useCallback(async () => {
    if (!order) return;
    setIsUpdating(true);
    setMessage(null);
    try {
      await updateOrderStatusApi(
        order.id,
        status,
        note || undefined,
        taobaoOrderId || undefined,
        trackingCode || undefined,
        paymentStatus || undefined,
        depositAmount,
        depositPercentage
      );
      setMessage({ type: 'success', text: t('orderUpdateSuccess') });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.error || err.message || t('orderUpdateFailed'),
      });
    } finally {
      setIsUpdating(false);
    }
  }, [
    order,
    status,
    note,
    taobaoOrderId,
    trackingCode,
    paymentStatus,
    depositAmount,
    depositPercentage,
    onRefresh,
    t,
  ]);

  return {
    status,
    setStatus,
    paymentStatus,
    depositAmount,
    setDepositAmount,
    depositPercentage,
    taobaoOrderId,
    setTaobaoOrderId,
    trackingCode,
    setTrackingCode,
    note,
    setNote,
    isUpdating,
    message,
    copiedField,
    handleCopyText,
    handlePaymentStatusChange,
    handleSaveStatus,
  };
};
