import React, { useState } from 'react';
import { Building2, Star, Globe, Trash2, Sliders, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';
import type { WarehouseStatsProps } from '../types';

export const WarehouseStats: React.FC<WarehouseStatsProps> = ({
  totalActive,
  defaultWarehouseName,
  supportedProvincesCount,
  trashCount,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Mobile / Tablet Toggle Header Button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="lg:hidden flex items-center gap-2 w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer mb-3 shadow-xs"
      >
        <Sliders className="h-4 w-4 text-indigo-500 shrink-0" />
        <span>{t('warehouseManagement')}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
            {totalActive} {t('warehouses')}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {/* Collapsible Grid Container */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-hidden transition-all duration-400 ease-in-out ${
          isExpanded
            ? 'max-h-[800px] opacity-100'
            : 'max-h-0 opacity-0 lg:max-h-[800px] lg:opacity-100'
        }`}
      >
        {/* Metric 1: Active Warehouses */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              Kho hoạt động
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block truncate">
              {totalActive}
            </span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block truncate">
              Hệ thống đa kho
            </span>
          </div>
        </div>

        {/* Metric 2: Default Warehouse */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              Tổng kho mặc định
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <Star className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight block truncate" title={defaultWarehouseName}>
              {defaultWarehouseName}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block truncate">
              Mặc định gán đơn hàng
            </span>
          </div>
        </div>

        {/* Metric 3: Supported Provinces */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              Tỉnh/Thành bao phủ
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-xl shrink-0">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block truncate">
              {supportedProvincesCount} Tỉnh
            </span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold block truncate">
              Phủ sóng giao hàng
            </span>
          </div>
        </div>

        {/* Metric 4: Trash Count */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              Thùng rác
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
              <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block truncate">
              {trashCount}
            </span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block truncate">
              Kho đã lưu trữ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
