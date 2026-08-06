import React, { useState } from 'react';
import { Globe, Layers, Warehouse as WarehouseIcon, Receipt, TrendingUp, Sliders, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';

interface OverviewMetricsGridProps {
  exchangeRate: number;
  categoriesCount: number;
  warehousesCount: number;
}

export const OverviewMetricsGrid: React.FC<OverviewMetricsGridProps> = ({
  exchangeRate,
  categoriesCount,
  warehousesCount,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Mobile / Tablet Toggle Header Button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="lg:hidden flex items-center gap-2 w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer mb-2 shadow-xs"
      >
        <Sliders className="h-4 w-4 text-indigo-500 shrink-0" />
        <span>Thống kê tổng quan</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
            {categoriesCount} categories
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
      {/* Metric 1: Exchange Rate */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{t('exchangeRate')}</span>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block truncate">
            {exchangeRate.toLocaleString()} ₫
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold truncate">
            <TrendingUp className="h-3 w-3 shrink-0" />
            <span className="truncate">Updated from Fee Config</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Categories */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{t('productCategories')}</span>
          <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block truncate">
            {categoriesCount}
          </span>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block truncate">
            {t('productCategories')} MongoDB
          </span>
        </div>
      </div>

      {/* Metric 3: Warehouses */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{t('warehouseManagement')}</span>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <WarehouseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block truncate">
            {warehousesCount} {t('warehouses')}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">
            {t('warehouseSupportedArea')} Hanoi, HCMC, Da Nang
          </span>
        </div>
      </div>

      {/* Metric 4: Active Coupons */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{t('activeCoupons')}</span>
          <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block truncate">12</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block truncate">
            {t('vouchersAvailable')}
          </span>
        </div>
      </div>
    </div>
  </div>
);
};

