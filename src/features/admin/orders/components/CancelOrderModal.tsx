import React from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useTranslation } from '../../../../lib/i18n';
import { useCancelOrderModal } from '../hooks/useCancelOrderModal';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order, OrderCancellation } from '../types';
import {
  AlertTriangle,
  Loader2,
  XCircle,
  RotateCcw,
  Banknote,
  Package,
  Truck,
  Warehouse,
  HandCoins,
  CheckCircle2,
} from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess?: (cancellation: OrderCancellation) => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const {
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
  } = useCancelOrderModal({ order, isOpen, onSuccess });

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <span className="truncate font-bold text-slate-900 dark:text-white text-base sm:text-lg">
            {t('cancelOrderTitle')}
          </span>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-4 text-slate-900 dark:text-white">
        {/* Cảnh báo trạng thái */}
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {t('cancelOrderWarning')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/25 rounded-xl">
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-wider">{t('totalOrderLabel')}</p>
              <p className="font-black text-indigo-700 dark:text-indigo-300 text-lg mt-1">{order.totalAmount.toLocaleString()} ₫</p>
            </div>
            <div className="p-3 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('depositedLabel')}</p>
              <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm mt-1">
                {(order.depositAmount || 0).toLocaleString()} ₫
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <OrderStatusBadge status={order.orderStatus} />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold">
              {order.orderCode || `#${order.id.slice(-8)}`}
            </span>
          </div>
        </div>

        {alreadyCancelled ? (
          <div className="p-4 text-center text-xs text-slate-400">
            {t('orderAlreadyCancelled')}
          </div>
        ) : completed ? (
          <div className="p-4 text-center text-xs text-slate-400">
            {t('cannotCancelCompleted')}
          </div>
        ) : (
          <>
            {/* Cảnh báo đơn đã đặt — không hoàn tiền */}
            {placedNoRefund && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {t('cancelOrderNoRefundWarning')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {t('cancelOrderNoRefundDesc')}
                  </p>
                </div>
              </div>
            )}
            {/* Lý do hủy */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('cancelOrderReason')} *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('cancelOrderReasonPlaceholder')}
                rows={3}
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none no-scrollbar"
              />
            </div>

            {/* Breakdown hoàn tiền */}
            <div className="space-y-2.5 p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                {t('refundBreakdownTitle')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-indigo-500" />
                    {t('productRefundLabel')}
                  </label>
                  <Input
                    type="number"
                    value={productRefund}
                    onChange={(e) => setProductRefund(Number(e.target.value) || 0)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-rose-500" />
                    {t('shippingLossLabel')}
                  </label>
                  <Input
                    type="number"
                    value={shippingLoss}
                    onChange={(e) => setShippingLoss(Number(e.target.value) || 0)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Warehouse className="h-3.5 w-3.5 text-rose-500" />
                    {t('warehouseLossLabel')}
                  </label>
                  <Input
                    type="number"
                    value={warehouseLoss}
                    onChange={(e) => setWarehouseLoss(Number(e.target.value) || 0)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <HandCoins className="h-3.5 w-3.5 text-rose-500" />
                    {t('serviceLossLabel')}
                  </label>
                  <Input
                    type="number"
                    value={serviceLoss}
                    onChange={(e) => setServiceLoss(Number(e.target.value) || 0)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-sm font-black">
                <span className="text-slate-500 dark:text-slate-400">{t('finalRefundLabel')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base">
                  {finalRefund.toLocaleString()} ₫
                </span>
              </div>
            </div>

            {message && (
              <p className={`text-xs font-bold p-2.5 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}>
                {message.text}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs px-4 py-2.5 w-full sm:w-auto font-semibold"
              >
                {t('cancel')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || !reason.trim()}
                className="text-xs px-5 py-2.5 w-full sm:w-auto font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    {t('cancelling')}
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-1.5" />
                    {t('confirmCancelOrderBtn')}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export const CancellationStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const st = (status || '').toUpperCase();
  const config: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
    PENDING: {
      cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      label: t('cancellationPending'),
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    APPROVED: {
      cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      label: t('cancellationApproved'),
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    REFUNDED: {
      cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      label: t('cancellationRefunded'),
      icon: <Banknote className="h-3 w-3" />,
    },
    REJECTED: {
      cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      label: t('cancellationRejected'),
      icon: <XCircle className="h-3 w-3" />,
    },
  };
  const cfg = config[st] || config.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};
