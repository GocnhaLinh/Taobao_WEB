import React from 'react';
import { BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { LoadingState } from '../../../components/common/LoadingState';
import { useOverview } from './hooks/useOverview';
import { OverviewMetricsGrid } from './components/OverviewMetricsGrid';
import { RevenueChartCard } from './components/RevenueChartCard';
import { TopProductsLeaderboard, TopBuyersLeaderboard } from './components/TopRankings';
import { WarehousesOverviewGrid } from './components/WarehousesOverviewGrid';

export const OverviewFeature: React.FC = () => {
  const { t } = useTranslation();

  const {
    stats,
    currentRate,
    isFeeError,
    warehouses,
    supportedAreas,
    isStatsLoading,
    isStatsError,
    isWarehousesLoading,
    isWarehousesError,
    isRefreshing,
    handleRefresh,
  } = useOverview();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500 shrink-0" />
            {t('overviewDashboard')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('overviewDesc')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isStatsLoading || isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-xs font-semibold shadow-sm disabled:opacity-50"
          >
            {isRefreshing ? (
              <Spinner className="text-indigo-500" />
            ) : (
              <RefreshCw className="h-4 w-4 text-indigo-500" />
            )}
            {t('refresh')}
          </button>
          {isFeeError ? (
            <Badge variant="danger" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              {t('rateLoadFailed')}
            </Badge>
          ) : currentRate ? (
            <Badge variant="info" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
              {t('activeRate', { rate: currentRate.toLocaleString() })}
            </Badge>
          ) : (
            <Badge variant="neutral" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
              …
            </Badge>
          )}
        </div>
      </div>

      {/* Error state — never show silent zeros */}
      {isStatsError && !isRefreshing ? (
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-rose-200 dark:border-rose-500/20 shadow-sm flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('statsErrorTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              {t('statsErrorDesc')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/25 cursor-pointer disabled:opacity-60"
          >
            {isRefreshing ? <Spinner size="sm" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {t('retry')}
          </button>
        </div>
      ) : isStatsLoading || isRefreshing ? (
        <LoadingState text={isRefreshing ? t('refreshingData') : t('loadingData')} />
      ) : (
        <>
          <OverviewMetricsGrid
            exchangeRate={currentRate}
            metrics={stats?.metrics}
            supportedAreas={supportedAreas}
          />

          <RevenueChartCard data={stats?.monthlyRevenue || []} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TopProductsLeaderboard products={stats?.topProducts || []} />
            <TopBuyersLeaderboard buyers={stats?.topBuyers || []} />
          </div>
        </>
      )}

      <WarehousesOverviewGrid
        warehouses={warehouses}
        isLoading={isWarehousesLoading}
        isError={isWarehousesError}
        isRetrying={isRefreshing}
        onRetry={handleRefresh}
      />
    </div>
  );
};
