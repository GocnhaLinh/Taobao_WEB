import React from 'react';
import type { ProductMetrics } from '../types';
import { Package, AlertTriangle, Trash2, Layers } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';

interface ProductStatCardsProps {
  metrics: ProductMetrics;
}

export const ProductStatCards: React.FC<ProductStatCardsProps> = ({ metrics }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('activeProductsStat')}</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{metrics.activeProducts}</h4>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('outOfStockWarningStat')}</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{metrics.outOfStockCount}</h4>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('totalVariantsStat')}</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{metrics.totalVariantsCount}</h4>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
          <Trash2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('trashStat')}</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{metrics.deletedProductsCount}</h4>
        </div>
      </div>
    </div>
  );
};
