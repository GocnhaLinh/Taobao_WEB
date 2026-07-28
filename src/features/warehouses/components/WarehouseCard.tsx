import React from 'react';
import { Edit2, Trash2, RotateCcw, MapPin, Building2, ShieldCheck, Tag, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';
import type { Warehouse } from '../../../types';
import { getGradientByProvince } from '../../../utils/gradientHelper';
import { HighlightText } from './highlight';

interface WarehouseCardProps {
  warehouse: Warehouse;
  isTrashView?: boolean;
  searchQuery?: string;
  onEdit?: (warehouse: Warehouse) => void;
  onSoftDelete?: (warehouse: Warehouse) => void;
  onRestore?: (warehouse: Warehouse) => void;
  onHardDelete?: (warehouse: Warehouse) => void;
}

// ─── Countdown Progress Bar ────────────────────────────────────────
const CountdownBar: React.FC<{ deletedAt?: string }> = ({ deletedAt }) => {
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
    <div className={`px-3 py-2 rounded-xl border ${bgColor} space-y-1.5`}>
      <div className="flex items-center justify-between text-[11px]">
        <span className={`flex items-center gap-1 font-semibold ${textColor}`}>
          {remainingDays <= 5 ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          {remainingDays <= 5
            ? t('aboutToDelete', { days: remainingDays })
            : t('autoDeleteInDays', { days: remainingDays })}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const WarehouseCard: React.FC<WarehouseCardProps> = React.memo(({
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
      className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between group ${
        isTrashView
          ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10'
          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10'
      }`}
    >
      <div>
        {/* Header & Badges */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Code badge with gradient */}
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold border ${gradientClass}`}>
              <HighlightText text={warehouse.code} query={searchQuery} />
            </span>
            {warehouse.isDefault && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                <ShieldCheck className="h-3 w-3" /> {t('warehouseDefaultBadge')}
              </span>
            )}
          </div>
        </div>

        {/* Warehouse Title */}
        <h4 className="text-slate-900 dark:text-white font-bold text-base leading-snug flex items-center gap-2">
          <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="truncate">
            <HighlightText text={warehouse.name} query={searchQuery} />
          </span>
        </h4>

        {/* Address & Region */}
        <div className="space-y-1.5 mt-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              <HighlightText
                text={warehouse.address || `${warehouse.district || ''}, ${warehouse.province}`}
                query={searchQuery}
              />
            </span>
          </p>

          {/* Province gradient badge */}
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${gradientClass}`}>
              {warehouse.province}
            </span>
          </div>

          {/* Supported Provinces Tags */}
          {warehouse.supportedProvinces && warehouse.supportedProvinces.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="h-3 w-3" /> {t('warehouseSupportedArea')}
              </span>
              {warehouse.supportedProvinces.slice(0, 4).map((prov, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {prov}
                </span>
              ))}
              {warehouse.supportedProvinces.length > 4 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200/70 dark:bg-slate-800 text-slate-500 font-mono">
                  +{warehouse.supportedProvinces.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Countdown progress bar if trash */}
        {isTrashView && <CountdownBar deletedAt={warehouse.deletedAt} />}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-end gap-1.5">
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
  );
});