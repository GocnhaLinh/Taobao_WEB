import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { CheckCircle2, Mail, MapPin, Phone, User, UserRound } from 'lucide-react';
import type { Order } from '../types';

interface CustomerDetailPanelProps {
  order: Order;
  userName: string;
  userEmail: string;
  userPhone: string;
  isGuest: boolean;
  shippingAddress: string;
}

/** Dòng thông tin nhỏ cho panel chi tiết khách hàng */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}> = ({ icon, label, value, mono }) => (
  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
    <div className="text-slate-400 shrink-0 mt-0.5">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 break-all ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  </div>
);

/** Panel phụ: Chi tiết khách hàng của đơn hàng */
export const CustomerDetailPanel: React.FC<CustomerDetailPanelProps> = ({
  order,
  userName,
  userEmail,
  userPhone,
  isGuest,
  shippingAddress,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 text-slate-900 dark:text-white">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black truncate">{userName}</p>
          {isGuest ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <UserRound className="h-3 w-3" />
              {t('guestBadge')}
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('registeredCustomer')}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <InfoRow icon={<Mail className="h-4 w-4" />} label={t('userEmailLabel')} value={userEmail} />
        <InfoRow icon={<Phone className="h-4 w-4" />} label={t('userPhoneLabel')} value={userPhone} />
        {order.user && (
          <InfoRow icon={<User className="h-4 w-4" />} label={t('userIdLabel')} value={order.user.id} mono />
        )}
      </div>

      <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-emerald-500" />
          {t('shippingAddressTitle')}
        </p>
        {shippingAddress ? (
          <div className="text-xs space-y-1">
            <p className="text-slate-700 dark:text-slate-300 font-semibold">{shippingAddress}</p>
            {order.address && (
              <p className="text-[10px] text-slate-400 font-mono break-all">{order.address.id}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">{t('noShippingAddressYet')}</p>
        )}
      </div>

      {/* Đơn hàng của khách — Tổng đơn nổi bật */}
      <div className="p-3.5 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/25 rounded-2xl space-y-3">
        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-between">
          <span>{t('orderSummaryTitle')}</span>
          <span className="text-[10px] font-bold text-slate-400 normal-case">
            {t('productsCount', { count: order.items?.reduce((s, it) => s + it.quantity, 0) || 0 })}
          </span>
        </p>
        <div className="text-center py-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalOrderLabel')}</p>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight mt-1">
            {order.totalAmount.toLocaleString()} <span className="text-base">₫</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-500/10 text-xs">
          <div className="p-2 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-white/10 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('depositedLabel')}</p>
            <p className="font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{(order.depositAmount || 0).toLocaleString()} ₫</p>
          </div>
          <div className="p-2 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-white/10 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('debtLabel')}</p>
            <p className="font-black text-rose-500 mt-0.5">{Math.max(0, (order.totalAmount || 0) - (order.depositAmount || 0)).toLocaleString()} ₫</p>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          <span>{t('paymentLabel')}</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{order.paymentStatus.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
