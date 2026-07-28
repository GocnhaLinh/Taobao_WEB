import React from 'react';
import { Edit2, Trash2, RotateCcw, Building2, MapPin, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';
import type { Warehouse } from '../../../types';
import { getGradientByProvince } from '../../../utils/gradientHelper';
import { HighlightText } from './highlight';

interface WarehouseRowProps {
  warehouse: Warehouse;
  isTrashView?: boolean;
  searchQuery?: string;
  onEdit?: (warehouse: Warehouse) => void;
  onSoftDelete?: (warehouse: Warehouse) => void;
  onRestore?: (warehouse: Warehouse) => void;
  onHardDelete?: (warehouse: Warehouse) => void;
}

// ─── Countdown Badge with Progress ─────────────────────────────────
const CountdownBadge: React.FC<{ deletedAt?: string }> = ({ deletedAt }) => {
  const { t } = useTranslation();
  if (!deletedAt) return null;

  const deleteDate = new Date(deletedAt).getTime();
  const now = new Date().getTime();
  const diffMs = now - deleteDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(30 - diffDays, 0);
  const progress = Math.min((diffDays / 30) * 100, 100);

  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  let bgColor = 'bg-emerald-500/10 border-emerald-500/20';

  if (remainingDays <= 5) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-600 dark:text-rose-400';
    bgColor = 'bg-rose-500/15 border-rose-500/30';
  } else if (remainingDays <= 15) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600 dark:text-amber-400';
    bgColor = 'bg-amber-500/15 border-amber-500/30';
  }

  return (
    <div className={`px-2.5 py-1 rounded-xl border text-[10px] flex items-center gap-2 ${bgColor} ${textColor}`}>
      {remainingDays <= 5 ? (
        <AlertTriangle className="h-3 w-3 shrink-0" />
      ) : (
        <Clock className="h-3 w-3 shrink-0" />
      )}
      <span className="font-semibold whitespace-nowrap">
        {remainingDays <= 5
          ? t('aboutToDelete', { days: remainingDays })
          : t('autoDeleteInDays', { days: remainingDays })}
      </span>
      <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const WarehouseRow: React.FC<WarehouseRowProps> = React.memo(({
  warehouse,
  isTrashView = false,
  searchQuery = '',
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  const { t } = useTranslation();
  const gradientClass = getGradientByProvince(warehouse.province);

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
        isTrashView
          ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 hover:shadow-md'
          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      {/* Warehouse Info Left Side */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradientClass} border flex items-center justify-center shrink-0`}>
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-slate-900 dark:text-white font-bold text-base truncate">
              <HighlightText text={warehouse.name} query={searchQuery} />
            </h4>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${gradientClass}`}>
              <HighlightText text={warehouse.code} query={searchQuery} />
            </span>
            {warehouse.isDefault && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                <ShieldCheck className="h-3 w-3" /> {t('warehouseDefault')}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span>
              <HighlightText
                text={warehouse.address || `${warehouse.district || ''}, ${warehouse.province}`}
                query={searchQuery}
              />
            </span>
          </p>
        </div>
      </div>

      {/* Actions & Status Right Side */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/10 w-full sm:w-auto">
        {/* Countdown badge if trash */}
        {isTrashView && <CountdownBadge deletedAt={warehouse.deletedAt} />}

        {/* Action Buttons */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-1">
          {!isTrashView ? (
            <>
              <button
                onClick={() => onEdit?.(warehouse)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                title={t('edit')}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSoftDelete?.(warehouse)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                title={t('softDelete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onRestore?.(warehouse)}
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                title={t('restore')}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => onHardDelete?.(warehouse)}
                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                title={t('hardDelete')}
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