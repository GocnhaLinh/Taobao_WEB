import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../../../../lib/i18n';
import { useManualRefresh } from '../../../../hooks/useManualRefresh';
import { fetchWarehouses } from '../../warehouses/api/warehouse.api';
import { getFeeConfigApi } from '../../settings/api/settings.api';
import { fetchDashboardStats } from '../api/dashboard.api';
import { getSupportedAreas } from '../utils/dashboard.utils';
import type { UseOverviewReturn } from '../types';

/**
 * Aggregates all data needed by the Overview dashboard:
 * real-time stats, the active exchange rate and the warehouse list.
 */
export const useOverview = (): UseOverviewReturn => {
  const { t } = useTranslation();

  // Lazy by default: the global QueryClient staleTime (5 min) reuses cache on
  // mount; the refresh button (handleRefresh) is what forces a DB call anytime.
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    retry: 1,
  });

  // Shares the cache key with the Settings page: the rate is cached until the
  // admin saves a new value (Settings invalidates ['settings-fees'] on save).
  const feeQuery = useQuery({
    queryKey: ['settings-fees'],
    queryFn: getFeeConfigApi,
    retry: 1,
    staleTime: Infinity,
  });

  const warehousesQuery = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
    retry: 1,
  });

  const warehouses = warehousesQuery.data || [];
  const supportedAreas = getSupportedAreas(warehouses, t('nationwide'));

  const { isRefreshing, handleRefresh } = useManualRefresh(async () => {
    await Promise.all([
      statsQuery.refetch(),
      feeQuery.refetch(),
      warehousesQuery.refetch(),
    ]);
  }, 1000);

  return {
    stats: statsQuery.data,
    currentRate: feeQuery.data?.exchangeRate,
    isFeeError: feeQuery.isError && !feeQuery.data,
    warehouses,
    supportedAreas,
    isStatsLoading: statsQuery.isPending,
    isStatsError: statsQuery.isError && !statsQuery.data,
    isWarehousesLoading: warehousesQuery.isPending,
    isWarehousesError: warehousesQuery.isError,
    isRefreshing,
    handleRefresh,
  };
};
