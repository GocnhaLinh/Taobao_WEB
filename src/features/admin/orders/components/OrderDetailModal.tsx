import React from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { useTranslation } from '../../../../lib/i18n';
import { getOrderStatusOptions, getPaymentStatusOptions } from '../constants';
import { formatHistoryNote } from '../utils/order.utils';
import { useOrderDetailModal } from '../hooks/useOrderDetailModal';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderDetailModalProps } from '../types';
import {
  ShoppingBag,
  User,
  Calendar,
  MapPin,
  PackageCheck,
  Clock,
  Save,
  Loader2,
  Copy,
  Check,
  Phone,
  Mail,
} from 'lucide-react';

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { t } = useTranslation();

  const {
    status,
    setStatus,
    paymentStatus,
    depositAmount,
    setDepositAmount,
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
  } = useOrderDetailModal({ order, onRefresh });

  if (!order) return null;

  const userName = order.user?.fullName || order.userId || 'Khách hàng';
  const userEmail = order.user?.email || 'N/A';
  const userPhone = order.user?.phone || 'N/A';

  const modalTitleNode = (
    <div className="flex items-center gap-2 min-w-0 pr-2">
      <ShoppingBag className="h-5 w-5 text-indigo-500 shrink-0" />
      <span className="truncate font-bold text-slate-900 dark:text-white text-base sm:text-lg">{t('orderDetailTitle')}</span>
      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 shrink-0">
        #{order.id.slice(-8)}
      </span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitleNode} maxWidth="3xl">
      <div className="space-y-5 text-slate-900 dark:text-white">
        {/* Order Card Overview Banner */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/10 pb-2.5">
            {/* Full ID line with copy */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-slate-400 font-medium shrink-0">{t('orderIdLabel')}</span>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 break-all select-all">
                {order.id}
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(order.id, 'orderId')}
                className="p-1 text-slate-400 hover:text-indigo-500 rounded-md transition cursor-pointer shrink-0"
                title={t('copyOrderId')}
              >
                {copiedField === 'orderId' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="text-xs">
              <span className="text-slate-400">{t('customerLabel')} </span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold">{userName}</strong>
              <span className="text-slate-400 hidden xs:inline"> ({userEmail})</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge variant={order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {t('paymentLabel')} {order.paymentStatus.toUpperCase()}
              </Badge>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
          </div>
        </div>

        {/* Admin Workflow & Status Update Form Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <PackageCheck className="h-4 w-4 shrink-0" />
              {t('updateStatusTitle')}
            </h4>
            <span className="text-[11px] text-slate-400 font-semibold">{t('adminControlPanel')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('orderStatusLabel')}
              </label>
              <CustomSelect
                value={status}
                onChange={setStatus}
                className="w-full text-xs"
                options={getOrderStatusOptions(t)}
              />
            </div>

            {/* Payment & Deposit Status Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('depositPaymentStatusLabel')}
              </label>
              <CustomSelect
                value={paymentStatus}
                onChange={handlePaymentStatusChange}
                className="w-full text-xs"
                options={getPaymentStatusOptions(t)}
              />
            </div>

            {/* Taobao Order ID Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                {t('taobaoOrderIdLabel')}
              </label>
              <Input
                value={taobaoOrderId}
                onChange={(e) => setTaobaoOrderId(e.target.value)}
                placeholder="Ví dụ: TB987654321012"
                className="text-xs font-mono"
              />
            </div>

            {/* CN-VN Tracking Code Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                {t('trackingCodeLabel')}
              </label>
              <Input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Ví dụ: VN8899776655CN"
                className="text-xs font-mono"
              />
            </div>

            {/* Deposit Amount Custom Input */}
            <div className="space-y-2 sm:col-span-2 p-3 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl">
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {t('actualDepositLabel')}
                </span>
                <div className="grid grid-cols-3 gap-1 font-mono text-[11px] text-center bg-slate-100 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/50 dark:border-white/5">
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-400 text-[10px]">{t('totalOrderLabel')}</span>
                    <strong className="text-slate-900 dark:text-white truncate">{order.totalAmount.toLocaleString()}₫</strong>
                  </div>
                  <div className="flex flex-col min-w-0 border-x border-slate-200/50 dark:border-white/10 px-1">
                    <span className="text-indigo-500 text-[10px]">{t('depositedLabel')}</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 truncate">{depositAmount.toLocaleString()}₫</strong>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-rose-400 text-[10px]">{t('debtLabel')}</span>
                    <strong className="text-rose-500 truncate">{Math.max(0, order.totalAmount - depositAmount).toLocaleString()}₫</strong>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                  placeholder={t('depositAmountPlaceholder')}
                  className="text-xs font-mono flex-1"
                />
                <div className="grid grid-cols-3 gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePaymentStatusChange('DEPOSIT_50')}
                    className="px-2 py-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                  >
                    {t('deposit50Btn')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePaymentStatusChange('DEPOSIT_70')}
                    className="px-2 py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
                  >
                    {t('deposit70Btn')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePaymentStatusChange('PAID')}
                    className="px-2 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                  >
                    {t('paid100Btn')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Note / History Note */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('updateNoteLabel')}
              </label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('updateNotePlaceholder')}
                className="text-xs"
              />
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

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveStatus}
              disabled={isUpdating}
              className="text-xs px-4 py-2 w-full sm:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {t('updateOrderBtn')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Customer info card */}
          <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <User className="h-4 w-4 text-indigo-500 shrink-0" /> {t('customerInfoTitle')}
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{userName}</p>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 break-all">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>{userEmail}</span>
              </div>
              {userPhone && userPhone !== 'N/A' && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>{userPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Tracking IDs */}
          <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-emerald-500 shrink-0" /> {t('shippingInfoTitle')}
            </div>
            <div className="text-xs space-y-2">
              <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-white/5">
                <span className="text-slate-500 font-semibold shrink-0">{t('addressIdLabel')}</span>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 break-all truncate">
                    {order.addressId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(order.addressId, 'addressId')}
                    className="p-1 text-slate-400 hover:text-indigo-500 shrink-0"
                    title={t('copyAddressId')}
                  >
                    {copiedField === 'addressId' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-white/5">
                <span className="text-slate-500 font-semibold shrink-0">{t('cnVnShippingLabel')}</span>
                {order.trackingCode ? (
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-500/20 text-[11px] truncate">
                    {order.trackingCode}
                  </span>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">{t('noTrackingCodeYet')}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Items List */}
        <div className="space-y-2.5">
          <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-indigo-500" />
            {t('productListTitle')} ({order.items?.length || 0})
          </h4>

          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            {order.items?.map((item) => (
              <div key={item.id} className="p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs shrink-0 mt-0.5 sm:mt-0">
                    x{item.quantity}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white break-words line-clamp-2 leading-snug">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {t('variantLabel')} <strong className="text-slate-700 dark:text-slate-300">{item.variantName}</strong>
                      </p>
                    )}
                    {item.variantId && (
                      <p className="text-[10px] font-mono text-slate-400 break-all">
                        {t('variantIdLabel')} {item.variantId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 self-end sm:self-auto pl-12 sm:pl-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.price.toLocaleString()} ₫</p>
                  <p className="text-[10px] text-slate-400">{t('total')}: {(item.price * item.quantity).toLocaleString()} ₫</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary Breakdown */}
        <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{t('itemsTotalLabel')}</span>
            <span>{(order.totalAmount - order.shippingFee + order.discountAmount).toLocaleString()} ₫</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{t('shippingFeeLabel')}</span>
            <span>+{order.shippingFee.toLocaleString()} ₫</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-500 font-medium">
              <span>{t('discountVoucherLabel')}</span>
              <span>-{order.discountAmount.toLocaleString()} ₫</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-sm font-black">
            <span>{t('totalPaymentLabel')}</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-base">{order.totalAmount.toLocaleString()} ₫</span>
          </div>
        </div>

        {/* Order Status History Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock className="h-4 w-4 text-indigo-500" />
              {t('statusHistoryTitle')} ({order.statusHistory.length})
            </h4>

            <div className="relative border-l-2 border-indigo-500/20 dark:border-indigo-500/40 ml-3 space-y-3 py-1">
              {order.statusHistory
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((hist, idx) => (
                  <div key={hist.id || idx} className="relative pl-5">
                    <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center text-[9px] text-white font-bold">
                      ✓
                    </span>
                    <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <OrderStatusBadge status={hist.status} />
                          <span className="text-[10px] text-slate-400 font-mono">{t('byUser', { user: hist.createdBy })}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(hist.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {hist.note && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/50 dark:border-white/5 mt-1">
                          "{formatHistoryNote(hist.note, t)}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
