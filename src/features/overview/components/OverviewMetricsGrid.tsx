import React from 'react';
import { Globe, Layers, Warehouse as WarehouseIcon, Receipt, TrendingUp } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Metric 1: Exchange Rate */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tỷ giá NDT (¥ ➔ VNĐ)</span>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Globe className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {exchangeRate.toLocaleString()} ₫
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>Cập nhật từ Cấu hình Phí</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Categories */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Danh mục sản phẩm</span>
          <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {categoriesCount}
          </span>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block">
            Danh mục hệ thống MongoDB
          </span>
        </div>
      </div>

      {/* Metric 3: Warehouses */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Hệ thống Kho hàng</span>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <WarehouseIcon className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {warehousesCount} Kho
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            Hà Nội, Hồ Chí Minh, Đà Nẵng
          </span>
        </div>
      </div>

      {/* Metric 4: Active Coupons */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('activeCoupons')}</span>
          <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <Receipt className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">12</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
            Mã khuyến mãi đang khả dụng
          </span>
        </div>
      </div>
    </div>
  );
};
