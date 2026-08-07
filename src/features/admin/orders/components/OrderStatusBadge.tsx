import React from 'react';
import { Badge } from '../../../../components/ui/Badge';
import { useTranslation } from '../../../../lib/i18n';
import { Clock, Tag, Truck, Building2, CheckCircle2, XCircle } from 'lucide-react';
import type { OrderStatusBadgeProps, PaymentStatusBadgeProps } from '../types';

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useTranslation();

  switch (status.toUpperCase()) {
    case 'PENDING_ORDER':
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap ${className}`}>
          <Clock className="h-3 w-3 shrink-0" />
          {t('statusPendingOrder') || 'Đợi đặt hàng'}
        </span>
      );
    case 'ORDERED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap ${className}`}>
          <Tag className="h-3 w-3 shrink-0" />
          {t('statusOrdered') || 'Đã đặt hàng'}
        </span>
      );
    case 'SHIPPING':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 whitespace-nowrap ${className}`}>
          <Truck className="h-3 w-3 shrink-0" />
          {t('statusShipping') || 'Đang vận chuyển'}
        </span>
      );
    case 'ARRIVED_WAREHOUSE':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap ${className}`}>
          <Building2 className="h-3 w-3 shrink-0" />
          {t('statusArrivedWarehouse') || 'Đã đến kho'}
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap ${className}`}>
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          {t('statusCompleted') || 'Hoàn thành'}
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap ${className}`}>
          <XCircle className="h-3 w-3 shrink-0" />
          {t('statusCancelled') || 'Đã hủy'}
        </span>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          {status}
        </Badge>
      );
  }
};

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ paymentStatus, className = '' }) => {
  const { t } = useTranslation();
  const st = paymentStatus.toUpperCase();

  switch (st) {
    case 'PAID':
    case 'PAID_100':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap ${className}`}>
          {t('paid100Badge')}
        </span>
      );
    case 'DEPOSIT_50':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap ${className}`}>
          {t('deposit50Badge')}
        </span>
      );
    case 'DEPOSIT_70':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap ${className}`}>
          {t('deposit70Badge')}
        </span>
      );
    case 'REFUNDED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap ${className}`}>
          {t('refundedBadge')}
        </span>
      );
    case 'FAILED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap ${className}`}>
          {t('failedBadge')}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 whitespace-nowrap ${className}`}>
          {t('unpaidBadge')}
        </span>
      );
  }
};
