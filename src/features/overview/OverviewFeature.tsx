import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { fetchCategories, fetchWarehouses, fetchProducts } from '../../services/api';
import { getFeeConfigApi } from '../../services/settingsService';
import { Badge } from '../../components/ui/Badge';
import { OverviewMetricsGrid } from './components/OverviewMetricsGrid';
import { RevenueChartCard } from './components/RevenueChartCard';
import { TopProductsLeaderboard } from './components/TopProductsLeaderboard';
import { TopBuyersLeaderboard } from './components/TopBuyersLeaderboard';
import { WarehousesOverviewGrid } from './components/WarehousesOverviewGrid';

export const OverviewFeature: React.FC = () => {
  const { t } = useTranslation();

  const { data: feeConfig } = useQuery({
    queryKey: ['feeConfig'],
    queryFn: getFeeConfigApi,
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
  });

  const { data: productsList = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  const currentRate = feeConfig?.exchangeRate || 3995;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
            {t('overviewDashboard')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tổng quan tình hình kinh doanh, tỷ giá NDT, biểu đồ doanh thu và bảng xếp hạng hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="px-3 py-1.5 text-xs font-semibold">
            Tỷ giá active: 1 ¥ = {currentRate.toLocaleString()} đ
          </Badge>
        </div>
      </div>

      <OverviewMetricsGrid
        exchangeRate={currentRate}
        categoriesCount={categories.length}
        warehousesCount={warehouses.length}
      />

      <RevenueChartCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopProductsLeaderboard productsList={productsList} />
        <TopBuyersLeaderboard />
      </div>

      <WarehousesOverviewGrid warehouses={warehouses} />
    </div>
  );
};
