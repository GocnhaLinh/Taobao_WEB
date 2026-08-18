import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import type { OrderRowCardProps } from '../types';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import { Calendar, ChevronRight, Mail, MapPin, Package, Phone, ShoppingBag } from 'lucide-react';

/** Map trạng thái đơn → màu accent (viền trái + glow khi hover) */
const STATUS_ACCENT: Record<string, { bar: string; glow: string }> = {
  PENDING_ORDER: { bar: 'bg-amber-500', glow: 'hover:shadow-amber-500/10' },
  PENDING: { bar: 'bg-amber-500', glow: 'hover:shadow-amber-500/10' },
  ORDERED: { bar: 'bg-indigo-500', glow: 'hover:shadow-indigo-500/10' },
  SHIPPING: { bar: 'bg-sky-500', glow: 'hover:shadow-sky-500/10' },
  ARRIVED_WAREHOUSE: { bar: 'bg-purple-500', glow: 'hover:shadow-purple-500/10' },
  COMPLETED: { bar: 'bg-emerald-500', glow: 'hover:shadow-emerald-500/10' },
  CANCELLED: { bar: 'bg-rose-500', glow: 'hover:shadow-rose-500/10' },
};

export const OrderRowCard: React.FC<OrderRowCardProps> = React.memo(({ order, onSelect }) => {
  const { t } = useTranslation();
  const { user, customerName, customerPhone, customerEmail, userId } = order;
  const isGuest = !user;
  const userName = [user?.fullName, customerName, userId, t('anonymousUser')].find(Boolean)!;
  const userPhone = user?.phone ?? customerPhone ?? '';
  const userEmail = user?.email ?? customerEmail ?? '';
  const address = order.address
    ? [order.address.detail, order.address.ward, order.address.district, order.address.province]
        .filter(Boolean)
        .join(', ')
    : [order.shippingDetail, order.shippingWard, order.shippingDistrict, order.shippingProvince]
        .filter(Boolean)
        .join(', ');

  // Get customer initial for avatar
  const initial = userName.charAt(0).toUpperCase();

  const dateTime = new Date(order.createdAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusKey = (order.orderStatus || '').toUpperCase();
  const accent = STATUS_ACCENT[statusKey] || STATUS_ACCENT.ORDERED;

  // Danh sách sản phẩm — hiện tối đa 4 dòng, phần còn lại gộp +N
  const items = order.items || [];
  const itemLines = items.length;
  const visibleItems = items.slice(0, 4);
  const extraCount = itemLines - visibleItems.length;

  // Tài chính
  const total = order.totalAmount || 0;
  const shippingFee = order.shippingFee || 0;
  const discount = order.discountAmount || 0;
  const coupon = order.couponCode || '';
  const itemsSubtotal = total - shippingFee + discount; // = tiền hàng trước ship/giảm giá
  const deposit = order.depositAmount || 0;
  const debt = Math.max(0, total - deposit);
  const depositPct = total > 0 ? Math.min(100, Math.round((deposit / total) * 100)) : 0;

  return (
    <div
      onClick={() => onSelect && onSelect(order)}
      className={`group relative overflow-hidden p-3.5 sm:p-4 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-2xl hover:border-indigo-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-w-0 ${accent.glow}`}
    >
      {/* Accent bar trái theo trạng thái đơn */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 rounded-r-full ${accent.bar} opacity-60 group-hover:opacity-100 transition-opacity duration-200`}
      />

      {/* Row 1: Mã đơn + thời gian + chevron */}
      <div className="flex items-center justify-between gap-2 min-w-0 pl-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] sm:text-xs font-mono font-bold shrink-0">
            {order.orderCode || `#${order.id.slice(-8)}`}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-0.5 shrink-0">
            <Calendar className="h-3 w-3" />
            {dateTime}
          </span>
        </div>

        <div className="p-1.5 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 rounded-xl transition-all group-hover:translate-x-0.5 shrink-0">
          <ChevronRight className="h-5 w-5 text-indigo-500" />
        </div>
      </div>

      {/* Row 2: Khách hàng — avatar + tên + SĐT + địa chỉ + email */}
      <div className="flex items-start gap-2.5 pt-2 pl-1.5 min-w-0">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-indigo-500/20">
            {initial}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
              statusKey === 'CANCELLED' ? 'bg-rose-400' : 'bg-emerald-400'
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {userName}
            </span>
            {isGuest && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                {t('guestBadge')}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-0.5">
            {userPhone && (
              <span className="flex items-center gap-1 shrink-0">
                <Phone className="h-3 w-3 shrink-0" />
                {userPhone}
              </span>
            )}
            {address && (
              <span className="flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{address}</span>
              </span>
            )}
            {userEmail && (
              <span className="flex items-center gap-1 min-w-0">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{userEmail}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Sản phẩm — hiện tất cả (tối đa 4 dòng) */}
      {itemLines > 0 && (
        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 pl-1.5">
          <p className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              {t('productListTitle')} ({itemLines})
            </span>
          </p>
          <div className="space-y-1.5">
            {visibleItems.map((item) => {
              const thumb =
                item.variant?.image ||
                item.variant?.images?.[0] ||
                item.variant?.product?.thumbnail ||
                item.variant?.product?.images?.[0]?.imageUrl;
              return (
                <div key={item.id} className="flex items-center gap-2 min-w-0">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Package className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.productName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.variantName || item.variant?.sku || '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.price.toLocaleString()} ₫
                    </p>
                    <p className="text-[10px] text-slate-400">×{item.quantity}</p>
                  </div>
                </div>
              );
            })}
            {extraCount > 0 && (
              <p className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold pl-10">
                <ShoppingBag className="h-3 w-3 shrink-0" />
                +{extraCount} {t('productsCount', { count: extraCount })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Row 4: Tài chính chi tiết + badges */}
      <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-white/5 pl-1.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
          {/* Trái: bảng kê tiền */}
          <div className="space-y-1 text-[11px] min-w-0">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{t('itemsTotalLabel')}</span>
              <span>{itemsSubtotal.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{t('shippingFeeLabel')}</span>
              <span>+{shippingFee.toLocaleString()} ₫</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span className="truncate pr-2">
                  {t('discountVoucherLabel')}
                  {coupon ? ` (${coupon})` : ''}
                </span>
                <span className="shrink-0">-{discount.toLocaleString()} ₫</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-white/5 font-black text-slate-900 dark:text-white text-sm">
              <span>{t('totalPaymentLabel')}</span>
              <span className="text-indigo-700 dark:text-indigo-300">{total.toLocaleString()} ₫</span>
            </div>

            {/* Cọc + nợ + progress */}
            <div className="pt-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>
                  {t('depositedLabel')}: {deposit.toLocaleString()} ₫
                </span>
                <span
                  className={`font-bold ${
                    statusKey === 'CANCELLED' || debt === 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {statusKey === 'CANCELLED'
                    ? t('statusCancelled')
                    : debt > 0
                      ? t('remainingDebt', { amount: `${debt.toLocaleString()} ₫` })
                      : t('paid100Badge')}
                </span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    depositPct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${depositPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Phải: badges + mã đối tác */}
          <div className="flex flex-col items-start sm:items-end justify-between gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <PaymentStatusBadge paymentStatus={order.paymentStatus} />
              <OrderStatusBadge status={order.orderStatus} />
            </div>
            {(order.taobaoOrderId || order.trackingCode) && (
              <div className="flex flex-wrap items-center gap-1.5 justify-start sm:justify-end">
                {order.taobaoOrderId && (
                  <span className="px-2 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 truncate max-w-[170px] sm:max-w-[300px]">
                    TB: {order.taobaoOrderId}
                  </span>
                )}
                {order.trackingCode && (
                  <span className="px-2 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 truncate max-w-[170px] sm:max-w-[300px]">
                    VC: {order.trackingCode}
                  </span>
                )}
              </div>
            )}
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {t('viewProductDetail')}
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.order.orderStatus === nextProps.order.orderStatus &&
    prevProps.order.paymentStatus === nextProps.order.paymentStatus &&
    prevProps.order.totalAmount === nextProps.order.totalAmount &&
    prevProps.order.updatedAt === nextProps.order.updatedAt
  );
});
