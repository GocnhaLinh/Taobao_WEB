import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import type { CouponMetrics } from '../types';
import { Ticket, Power, Clock } from 'lucide-react';

interface CouponStatCardsProps {
  metrics: CouponMetrics;
}

export const CouponStatCards: React.FC<CouponStatCardsProps> = ({ metrics }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
          <Ticket className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('activeCountLabel')}</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{metrics.activeCoupons}</h4>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
          <Power className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('disabledCountLabel')}</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{metrics.disabledCoupons ?? 0}</h4>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('expiredCountLabel')}</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{metrics.expiredCoupons}</h4>
        </div>
      </div>
    </div>
  );
};
