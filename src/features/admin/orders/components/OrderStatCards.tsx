import React from 'react';
import { Clock, Truck, CheckCircle2, TrendingUp } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';
import type { OrderStatCardsProps } from '../types';

export const OrderStatCards: React.FC<OrderStatCardsProps> = ({ metrics }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Pending Orders */}
      <div className="p-3 sm:p-4.5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 transition-all duration-200 hover:border-amber-500/30 min-w-0">
        <div className="p-2 sm:p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
          <Clock className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            {t('statusPendingOrder')}
          </p>
          <h4 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
            {metrics.pendingCount}
          </h4>
        </div>
      </div>

      {/* In Transit */}
      <div className="p-3 sm:p-4.5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 transition-all duration-200 hover:border-sky-500/30 min-w-0">
        <div className="p-2 sm:p-2.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl border border-sky-500/20 shrink-0">
          <Truck className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            {t('statusShipping')}
          </p>
          <h4 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
            {metrics.inTransitCount}
          </h4>
        </div>
      </div>

      {/* Completed */}
      <div className="p-3 sm:p-4.5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 transition-all duration-200 hover:border-emerald-500/30 min-w-0">
        <div className="p-2 sm:p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
          <CheckCircle2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            {t('statusCompleted')}
          </p>
          <h4 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
            {metrics.completedCount}
          </h4>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="p-3 sm:p-4.5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 transition-all duration-200 hover:border-indigo-500/30 min-w-0">
        <div className="p-2 sm:p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
          <TrendingUp className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            {t('totalRevenueLabel')}
          </p>
          <h4 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate" title={`${metrics.totalRevenue.toLocaleString()} ₫`}>
            {metrics.totalRevenue.toLocaleString()} ₫
          </h4>
        </div>
      </div>
    </div>
  );
};
