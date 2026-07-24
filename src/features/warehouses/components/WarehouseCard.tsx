import React from 'react';
import { Edit2, Trash2, RotateCcw, MapPin, Building2, ShieldCheck, Tag } from 'lucide-react';
import type { Warehouse } from '../../../types';

interface WarehouseCardProps {
  warehouse: Warehouse;
  isTrashView?: boolean;
  onEdit?: (warehouse: Warehouse) => void;
  onSoftDelete?: (warehouse: Warehouse) => void;
  onRestore?: (warehouse: Warehouse) => void;
  onHardDelete?: (warehouse: Warehouse) => void;
}

export const WarehouseCard: React.FC<WarehouseCardProps> = ({
  warehouse,
  isTrashView = false,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
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
        text: `⚠️ Sắp bị xóa (Còn ${remainingDays} ngày)`,
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

  const remainingInfo = getRemainingDaysInfo(warehouse.deletedAt);

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between group ${
        isTrashView
          ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Header & Badges */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              {warehouse.code}
            </span>
            {warehouse.isDefault && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> MẶC ĐỊNH
              </span>
            )}
          </div>
        </div>

        {/* Warehouse Title */}
        <h4 className="text-slate-900 dark:text-white font-bold text-base leading-snug flex items-center gap-2">
          <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="truncate">{warehouse.name}</span>
        </h4>

        {/* Address & Region */}
        <div className="space-y-1.5 mt-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {warehouse.address || `${warehouse.district || ''}, ${warehouse.province}`}
            </span>
          </p>

          {/* Supported Provinces Tags */}
          {warehouse.supportedProvinces && warehouse.supportedProvinces.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="h-3 w-3" /> Khu vực hỗ trợ:
              </span>
              {warehouse.supportedProvinces.map((prov, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {prov}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Countdown tag if trash */}
        {isTrashView && (
          <div className={`px-2.5 py-1 rounded-xl border text-[11px] mb-3 w-fit ${remainingInfo.style}`}>
            {remainingInfo.text}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-end gap-1.5">
        {!isTrashView ? (
          <>
            <button
              onClick={() => onEdit?.(warehouse)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer"
              title="Chỉnh sửa kho hàng"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSoftDelete?.(warehouse)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
              title="Chuyển vào thùng rác"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onRestore?.(warehouse)}
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer"
              title="Khôi phục kho hàng"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => onHardDelete?.(warehouse)}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
              title="Xóa vĩnh viễn"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
