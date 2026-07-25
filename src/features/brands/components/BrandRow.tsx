import React, { useState } from 'react';
import { Edit2, Trash2, RotateCcw, Award } from 'lucide-react';
import type { Brand } from '../../../types';

interface BrandRowProps {
  brand: Brand;
  isTrashView?: boolean;
  onEdit?: (brand: Brand) => void;
  onSoftDelete?: (brand: Brand) => void;
  onRestore?: (brand: Brand) => void;
  onHardDelete?: (brand: Brand) => void;
}

export const BrandRow: React.FC<BrandRowProps> = React.memo(({
  brand,
  isTrashView = false,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  const [imgError, setImgError] = useState(false);

  // Calculate remaining days until 30-day auto deletion
  const getRemainingDaysInfo = (deletedAt?: string) => {
    if (!deletedAt) {
      return {
        text: '⏱️ Tự xóa sau 30 ngày',
        style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium',
      };
    }

    const deleteDate = new Date(deletedAt).getTime();
    const now = new Date().getTime();
    const diffMs = now - deleteDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(30 - diffDays, 0);

    if (remainingDays <= 5) {
      return {
        text: `⚠️ Sắp xóa (Còn ${remainingDays} ngày)`,
        style: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse font-bold',
      };
    }
    if (remainingDays <= 15) {
      return {
        text: `⏱️ Tự xóa sau ${remainingDays} ngày`,
        style: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold',
      };
    }
    return {
      text: `⏱️ Tự xóa sau ${remainingDays} ngày`,
      style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium',
    };
  };

  const remainingInfo = getRemainingDaysInfo(brand.deletedAt);

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
        isTrashView
          ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:-translate-y-0.5'
      }`}
    >
      {/* Brand Info Left Side */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
          {brand.logo && !imgError ? (
            <img
              src={brand.logo}
              alt={brand.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <Award className="h-5 w-5 text-indigo-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-slate-900 dark:text-white font-bold text-base truncate">{brand.name}</h4>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shrink-0">
              OFFICIAL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {brand.description || 'Thương hiệu thời trang cao cấp.'}
          </p>
        </div>
      </div>

      {/* Actions & Status Right Side */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/10 w-full sm:w-auto">
        {/* Countdown tag if trash */}
        {isTrashView && (
          <div className={`px-2.5 py-0.5 rounded-xl border text-[10px] ${remainingInfo.style}`}>
            {remainingInfo.text}
          </div>
        )}

        {/* Action Buttons (with space-between on mobile/tablet) */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-1">
          {!isTrashView ? (
            <>
              <button
                onClick={() => onEdit?.(brand)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer"
                title="Chỉnh sửa thương hiệu"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSoftDelete?.(brand)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                title="Chuyển vào thùng rác"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onRestore?.(brand)}
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer"
                title="Khôi phục"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => onHardDelete?.(brand)}
                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                title="Xóa vĩnh viễn"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
