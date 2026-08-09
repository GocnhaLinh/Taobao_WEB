import React, { useState } from 'react';
import {
  Globe,
  Layers,
  Warehouse as WarehouseIcon,
  Ticket,
  TrendingUp,
  Sliders,
  ChevronDown,
  Coins,
  ShoppingCart,
  Package,
  Users,
} from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';
import { formatCompactVND } from '../../../../utils/currencyHelper';
import type { MetricCardProps, OverviewMetricsGridProps } from '../types';

const GrowthIndicator: React.FC<{ value: number }> = ({ value }) => {
  if (value === 0) {
    return <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">—</span>;
  }
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
        positive ? 'text-emerald-500' : 'text-rose-500'
      }`}
    >
      <TrendingUp className={`h-3 w-3 ${positive ? '' : 'rotate-180'}`} />
      {positive ? '+' : ''}
      {value}%
    </span>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  icon,
  iconBg,
  hoverBorder,
  value,
  footer,
}) => (
  <div
    className={`p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group transition-all ${hoverBorder}`}
  >
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
        {label}
      </span>
      <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
    </div>
    <div className="space-y-1.5">
      <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block truncate">
        {value}
      </span>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold truncate">{footer}</div>
    </div>
  </div>
);

export const OverviewMetricsGrid: React.FC<OverviewMetricsGridProps> = ({
  exchangeRate,
  metrics,
  supportedAreas,
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
        <span>{t('overviewStats')}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
            {metrics ? `${metrics.totalOrders} ${t('orders')}` : '…'}
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
            ? 'max-h-[1600px] opacity-100'
            : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
        }`}
      >
        {/* 1. Exchange Rate */}
        <MetricCard
          label={t('exchangeRate')}
          icon={<Globe className="h-5 w-5 sm:h-6 sm:w-6" />}
          iconBg="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
          hoverBorder="hover:border-indigo-500/50"
          value={exchangeRate ? `${exchangeRate.toLocaleString()} ₫` : '—'}
          footer={
            exchangeRate ? (
              <span className="flex items-center gap-1 text-emerald-500 min-w-0">
                <TrendingUp className="h-3 w-3 shrink-0" />
                <span className="truncate">{t('updatedFromFeeConfig')}</span>
              </span>
            ) : undefined
          }
        />

        {/* 2. Total Revenue */}
        <MetricCard
          label={t('totalRevenueMetric')}
          icon={<Coins className="h-5 w-5 sm:h-6 sm:w-6" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
          hoverBorder="hover:border-emerald-500/50"
          value={
            metrics ? (
              <span className="text-lg sm:text-2xl">
                {metrics.totalRevenue.toLocaleString('vi-VN')} ₫
              </span>
            ) : undefined
          }
          footer={
            metrics ? (
              <>
                <span className="text-slate-500 dark:text-slate-400 truncate">
                  {formatCompactVND(metrics.revenueThisMonth)} ₫ {t('thisMonth')}
                </span>
                <GrowthIndicator value={metrics.revenueGrowthPercent} />
              </>
            ) : undefined
          }
        />

        {/* 3. Orders */}
        <MetricCard
          label={t('totalOrdersMetric')}
          icon={<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />}
          iconBg="bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
          hoverBorder="hover:border-sky-500/50"
          value={metrics?.totalOrders?.toLocaleString('vi-VN')}
          footer={
            metrics ? (
              <>
                <span className="text-slate-500 dark:text-slate-400 truncate">
                  {metrics.ordersThisMonth} {t('orders')} {t('thisMonth')}
                </span>
                <GrowthIndicator value={metrics.ordersGrowthPercent} />
              </>
            ) : undefined
          }
        />

        {/* 4. Products */}
        <MetricCard
          label={t('totalProductsMetric')}
          icon={<Package className="h-5 w-5 sm:h-6 sm:w-6" />}
          iconBg="bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
          hoverBorder="hover:border-violet-500/50"
          value={metrics?.totalProducts?.toLocaleString('vi-VN')}
          footer={<span className="text-violet-600 dark:text-violet-400 truncate">{t('active')}</span>}
        />

        {/* 5. Categories */}
        <MetricCard
          label={t('productCategories')}
          icon={<Layers className="h-5 w-5 sm:h-6 sm:w-6" />}
          iconBg="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
          hoverBorder="hover:border-purple-500/50"
          value={metrics?.totalCategories?.toLocaleString('vi-VN')}
          footer={<span className="text-purple-600 dark:text-purple-400 truncate">{t('active')}</span>}
        />

        {/* 6. Warehouses */}
        <MetricCard
          label={t('warehouseManagement')}
          icon={<WarehouseIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
          hoverBorder="hover:border-emerald-500/50"
          value={metrics?.totalWarehouses?.toLocaleString('vi-VN')}
          footer={
            <span className="text-emerald-600 dark:text-emerald-400 truncate">
              {t('warehouseSupportedArea')} {supportedAreas}
            </span>
          }
        />

        {/* 7. Active Coupons */}
        <MetricCard
          label={t('activeCoupons')}
          icon={<Ticket className="h-5 w-5 sm:h-6 sm:w-6" />}
          iconBg="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
          hoverBorder="hover:border-amber-500/50"
          value={metrics?.totalActiveCoupons?.toLocaleString('vi-VN')}
          footer={
            <span className="text-amber-600 dark:text-amber-400 truncate">
              {t('vouchersAvailable')}
            </span>
          }
        />

        {/* 8. Users */}
        <MetricCard
          label={t('totalUsers')}
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
          iconBg="bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
          hoverBorder="hover:border-rose-500/50"
          value={metrics?.totalUsers?.toLocaleString('vi-VN')}
          footer={<span className="text-rose-600 dark:text-rose-400 truncate">{t('customers')}</span>}
        />
      </div>
    </div>
  );
};
