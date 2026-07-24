import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { fetchHealth } from '../../services/api';

export const HealthStatus: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['backendHealth'],
    queryFn: fetchHealth,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/10 text-xs">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">{t('healthCheck')}</span>
      </div>
      {isLoading && <span className="text-amber-500 font-semibold animate-pulse">{t('checking')}</span>}
      {isError && (
        <span className="text-rose-500 font-semibold flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> {t('offline')}
        </span>
      )}
      {data && (
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" /> {t('connected')}
        </span>
      )}
      <button
        onClick={() => refetch()}
        className="ml-auto p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-indigo-600 dark:text-indigo-400"
        title={t('retryCheck')}
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
