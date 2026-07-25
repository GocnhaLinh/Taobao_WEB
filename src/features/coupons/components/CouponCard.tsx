import React, { useState } from 'react';
import { Ticket, Copy, Check, Percent, Tag, Calendar, Trash2, Edit3, Power, Clock } from 'lucide-react';

export interface CouponItem {
  id: string;
  code: string;
  type: string; // 'FIXED' | 'PERCENT'
  value: number;
  minOrder: number;
  maxDiscount?: number;
  status: string; // 'ACTIVE' | 'DISABLED' | 'EXPIRED'
  expiryDate?: string;
  usageCount?: number;
}

interface CouponCardProps {
  coupon: CouponItem;
  onEdit?: (coupon: CouponItem) => void;
  onToggleStatus?: (coupon: CouponItem) => void;
  onDeleteRequest?: (coupon: CouponItem) => void;
}

export const CouponCard: React.FC<CouponCardProps> = React.memo(({
  coupon,
  onEdit,
  onToggleStatus,
  onDeleteRequest,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPercent = coupon.type === 'PERCENT';

  // Check if date has expired
  const isExpiredByDate = coupon.expiryDate
    ? new Date(coupon.expiryDate.split('/').reverse().join('-')).getTime() < Date.now()
    : false;

  const isExpired = coupon.status === 'EXPIRED' || isExpiredByDate;
  const isActive = coupon.status === 'ACTIVE' && !isExpired;

  return (
    <div
      className={`relative group bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
        isExpired
          ? 'opacity-60 bg-slate-100/50 dark:bg-slate-900/30'
          : !isActive
          ? 'opacity-80 bg-amber-500/[0.02]'
          : ''
      }`}
    >
      {/* Decorative Gradient Bar */}
      <div
        className={`h-2 w-full bg-gradient-to-r ${
          isExpired
            ? 'from-rose-500 to-rose-700'
            : !isActive
            ? 'from-amber-500 to-amber-700'
            : isPercent
            ? 'from-amber-500 via-orange-500 to-rose-500'
            : 'from-indigo-500 via-purple-500 to-pink-500'
        }`}
      />

      <div className="p-5 space-y-4">
        {/* Top Header Row */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isExpired
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  : !isActive
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : isPercent
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
              }`}
            >
              {isPercent ? <Percent className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
            </div>
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase truncate">
              {coupon.type === 'FIXED' ? 'Giảm Cố Định' : 'Giảm Theo %'}
            </span>
          </div>

          {/* Action Buttons & Status Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status Indicator Badge / Toggle */}
            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(coupon)}
                disabled={isExpired}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border whitespace-nowrap shrink-0 ${
                  isExpired
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 cursor-not-allowed'
                    : isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                }`}
                title={isExpired ? 'Mã này đã hết hạn sử dụng' : 'Bấm để bật (Hoạt động) hoặc tắt (Tạm khóa)'}
              >
                {isExpired ? (
                  <Clock className="h-3 w-3 shrink-0" />
                ) : (
                  <Power className="h-3 w-3 shrink-0" />
                )}
                <span className="whitespace-nowrap">
                  {isExpired ? 'Đã hết hạn' : isActive ? 'Hoạt động' : 'Tạm khóa'}
                </span>
              </button>
            )}

            {/* Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(coupon)}
                className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition cursor-pointer shrink-0"
                title="Chỉnh sửa voucher"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Delete Button */}
            {onDeleteRequest && (
              <button
                type="button"
                onClick={() => onDeleteRequest(coupon)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
                title="Xóa voucher"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Voucher Value & Details */}
        <div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            {isPercent ? (
              <>
                <span>{coupon.value}%</span>
                <span className="text-xs font-medium text-slate-400">GIẢM</span>
              </>
            ) : (
              <>
                <span>{coupon.value.toLocaleString()}</span>
                <span className="text-xs font-medium text-slate-400">₫</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            <span>
              Áp dụng đơn từ <span className="font-bold text-slate-700 dark:text-slate-200">{coupon.minOrder.toLocaleString()} ₫</span>
            </span>
            {coupon.maxDiscount && (
              <span className="text-amber-500 font-semibold">
                (Tối đa {coupon.maxDiscount.toLocaleString()} ₫)
              </span>
            )}
          </div>
        </div>

        {/* Ticket Dotted Separator with Left & Right Cutout Notches */}
        <div className="relative my-2">
          <div className="border-b-2 border-dashed border-slate-200 dark:border-white/10 w-full" />
          <div className="absolute -left-7 -top-2.5 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10" />
          <div className="absolute -right-7 -top-2.5 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10" />
        </div>

        {/* Code Box with Copy Button */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Ticket className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 tracking-wider truncate">
              {coupon.code}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          HSD: {coupon.expiryDate || 'Vĩnh viễn'}
        </span>
        <span>Lượt dùng: {coupon.usageCount ?? 0}</span>
      </div>
    </div>
  );
});
