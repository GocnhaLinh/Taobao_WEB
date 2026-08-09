import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../../../../lib/i18n';
import type { BulkVariantSystemBarProps } from '../../types/bulk-variant.types';

export const BulkVariantSystemBar: React.FC<BulkVariantSystemBarProps> = ({
  exchangeRate,
  shippingFeePerKg,
  duplicateErrors,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* System info bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-200/30 dark:border-indigo-700/20 rounded-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t('exchangeRate')}:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-white">
            {exchangeRate > 0 ? exchangeRate.toLocaleString('vi-VN') : '—'}
          </span>
          <span className="text-slate-400">/ 1¥ CNY</span>
        </span>
        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t('shippingCnFee')}:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-white">
            {shippingFeePerKg > 0 ? shippingFeePerKg.toLocaleString('vi-VN') : '—'}
          </span>
          <span className="text-slate-400">/ kg</span>
        </span>
        <span className="ml-auto text-[11px] text-slate-400 italic">{t('autoFromSystem')}</span>
      </div>

      {/* Duplicate errors banner */}
      {duplicateErrors.length > 0 && (
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/30 rounded-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            ⚠️ Biến thể bị trùng ({duplicateErrors.length})
          </p>
          {duplicateErrors.map((err, i) => (
            <p key={i} className="text-[11px] text-rose-600 dark:text-rose-400 pl-6">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
