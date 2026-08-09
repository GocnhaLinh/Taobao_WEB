import React from 'react';
import { Warehouse as WarehouseIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Spinner } from '../../../../components/ui/Spinner';
import { LoadingState } from '../../../../components/common/LoadingState';
import { useTranslation } from '../../../../lib/i18n';
import type { WarehousesOverviewGridProps } from '../types';

export const WarehousesOverviewGrid: React.FC<WarehousesOverviewGridProps> = ({
  warehouses,
  isLoading,
  isError,
  isRetrying,
  onRetry,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
          <WarehouseIcon className="h-5 w-5 text-emerald-500 shrink-0" />
          <span className="truncate">
            {t('warehouseManagement')} ({isLoading ? '…' : warehouses.length})
          </span>
        </h3>
        <Badge variant="success" className="shrink-0 whitespace-nowrap">
          <span className="hidden sm:inline">{t('activeSystem')}</span>
          <span className="sm:hidden">{t('activeShort')}</span>
        </Badge>
      </div>

      {isError ? (
        <div className="flex flex-col items-center text-center gap-3 py-8">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('statsErrorTitle')}
          </p>
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/25 cursor-pointer disabled:opacity-60"
          >
            {isRetrying ? <Spinner size="sm" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {t('retry')}
          </button>
        </div>
      ) : isLoading ? (
        <LoadingState size="sm" iconOnly />
      ) : warehouses.length === 0 ? (
        <div className="text-center py-8">
          <WarehouseIcon className="h-10 w-10 mx-auto stroke-1 text-slate-400 dark:text-slate-600" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
            {t('emptyWarehouses')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div
              key={wh.id || wh.code}
              className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {wh.name}
                </span>
                <Badge variant={wh.isDefault ? 'success' : 'info'}>{wh.code}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t('addressLabel')} {wh.address || wh.province}
              </p>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                {t('serviceArea')}{' '}
                {wh.supportedProvinces?.slice(0, 3).join(', ') || t('nationwide')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
