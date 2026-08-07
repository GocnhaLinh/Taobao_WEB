import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import type { OrderRowCardProps } from '../types';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import { Package, Calendar, ChevronRight } from 'lucide-react';

export const OrderRowCard: React.FC<OrderRowCardProps> = React.memo(({ order, onSelect }) => {
  const { t } = useTranslation();
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || order.items?.length || 0;
  const userName = order.user?.fullName || order.userId || 'Khách hàng';

  // Get customer initial for avatar
  const initial = userName.charAt(0).toUpperCase();

  const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => onSelect && onSelect(order)}
      className="group p-3.5 sm:p-4.5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-2xl space-y-2.5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer min-w-0"
    >
      {/* Header Row: Customer Avatar & Info + Date + Arrow Icon */}
      <div className="flex items-center justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                #{order.id.slice(-8)}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-0.5 shrink-0">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
              <span className="truncate">{userName}</span>
              <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
              <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 text-[11px] font-semibold shrink-0">
                <Package className="h-3.5 w-3.5" />
                {t('productsCount', { count: itemCount })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-1.5 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 rounded-xl transition shrink-0">
          <ChevronRight className="h-5 w-5 text-indigo-500" />
        </div>
      </div>

      {/* Tags Row: Taobao Order ID & Tracking Code */}
      {(order.taobaoOrderId || order.trackingCode) && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {order.taobaoOrderId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-mono font-black bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shadow-xs tracking-wide">
              <span className="text-[10px] font-sans font-black uppercase tracking-wider px-1.5 py-0.5 bg-indigo-500/25 dark:bg-indigo-400/20 text-indigo-800 dark:text-indigo-200 rounded-md">
                TB
              </span>
              {order.taobaoOrderId}
            </span>
          )}
          {order.trackingCode && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-mono font-black bg-sky-500/15 dark:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-500/30 shadow-xs tracking-wide">
              <span className="text-[10px] font-sans font-black uppercase tracking-wider px-1.5 py-0.5 bg-sky-500/25 dark:bg-sky-400/20 text-sky-800 dark:text-sky-200 rounded-md">
                VC
              </span>
              {order.trackingCode}
            </span>
          )}
        </div>
      )}

      {/* Financials & Badges Row */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <span className="block text-slate-900 dark:text-white font-black text-sm sm:text-base tracking-tight">
            {order.totalAmount.toLocaleString()} ₫
          </span>
          <span className="text-[10px] text-slate-400 block font-medium">
            {order.depositAmount && order.depositAmount > 0 && order.depositAmount < order.totalAmount
              ? t('remainingDebt', { amount: `${(order.totalAmount - order.depositAmount).toLocaleString()} ₫` })
              : t('includesShipping')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <PaymentStatusBadge paymentStatus={order.paymentStatus} />
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>
    </div>
  );
});
