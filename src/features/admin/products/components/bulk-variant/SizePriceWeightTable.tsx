import React from 'react';
import { DollarSign, CheckCircle2, X, BarChart3, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Input } from '../../../../../components/ui/Input';
import { Badge } from '../../../../../components/ui/Badge';
import { useTranslation } from '../../../../../lib/i18n';
import type { SizePriceWeightTableProps } from '../../types/bulk-variant.types';

export const SizePriceWeightTable: React.FC<SizePriceWeightTableProps> = ({
  sizes,
  sizePrices,
  sizeOriginalPrices,
  sizeWeights,
  commonPrice,
  commonOriginalPriceCNY,
  commonWeight,
  updateSizePrice,
  updateSizeOriginalPrice,
  updateSizeWeight,
  clearSizeCustomValues,
  calcProfit,
  customCounts,
}) => {
  const { t } = useTranslation();

  if (sizes.length === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-slate-900/50 border border-indigo-200/40 dark:border-indigo-700/30 rounded-2xl shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 shrink-0" />
          {t('priceAndWeightBySize')}
        </h4>
        <span className="text-[10px] text-slate-400">
          {customCounts.priceCount > 0 || customCounts.cnyCount > 0 || customCounts.weightCount > 0
            ? t('customCountsFormat', {
                priceCount: customCounts.priceCount,
                cnyCount: customCounts.cnyCount,
                weightCount: customCounts.weightCount,
                total: sizes.length,
              })
            : t('allUsingCommon')}
        </span>
      </div>

      <div className="hidden sm:grid sm:grid-cols-[5.5rem,1fr,1fr,1fr,5rem] sm:gap-3 items-center text-[11px] text-slate-400 dark:text-slate-400 font-semibold tracking-wider pb-1 border-b border-slate-100 dark:border-white/5">
        <div className="text-center font-bold text-slate-500 dark:text-slate-400">{t('sizeColumn')}</div>
        <div className="px-1 text-slate-600 dark:text-slate-300 font-semibold">{t('sellingPriceColumn')}</div>
        <div className="px-1 text-slate-600 dark:text-slate-300 font-semibold">{t('originCostColumn')}</div>
        <div className="px-1 text-slate-600 dark:text-slate-300 font-semibold">{t('weightColumn')}</div>
        <div className="text-right text-slate-400 font-medium">{t('statusColumn')}</div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {sizes.map((size) => {
          const hasPrice = !!sizePrices[size];
          const hasCNY = !!sizeOriginalPrices[size];
          const hasWeight = !!sizeWeights[size];
          const isCustom = hasPrice || hasCNY || hasWeight;
          const p = calcProfit(size);
          const hasProfitData = p.cny > 0 && p.price > 0;

          return (
            <div
              key={size}
              className="py-3 px-3 sm:px-0 sm:py-2.5 bg-slate-50/50 dark:bg-white/[0.02] sm:bg-transparent rounded-2xl sm:rounded-none mb-3 sm:mb-0 border sm:border-0 border-slate-200/60 dark:border-white/5"
            >
              {/* Mobile Header for Size */}
              <div className="flex sm:hidden items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('size')}:
                  </span>
                  <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/25 tracking-wide uppercase">
                    {size}
                  </span>
                </div>
                {isCustom ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('set')}
                    </span>
                    <button
                      type="button"
                      onClick={() => clearSizeCustomValues(size)}
                      className="text-[11px] text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">{t('usingCommon')}</span>
                )}
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-[5.5rem,1fr,1fr,1fr,5rem] gap-2 sm:gap-3 items-center transition-colors">
                {/* Desktop Size Badge */}
                <div className="hidden sm:flex min-w-0 items-center justify-center">
                  <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/25 tracking-wide uppercase whitespace-nowrap">
                    {size}
                  </span>
                </div>

                <div className="w-full">
                  <label className="block sm:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t('sellingPriceColumn')}
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={sizePrices[size] ?? ''}
                    onChange={(e) => updateSizePrice(size, e.target.value)}
                    placeholder={
                      commonPrice
                        ? `${t('defaultPrefix')}: ${parseInt(commonPrice, 10).toLocaleString('vi-VN')}đ`
                        : t('enterPrice')
                    }
                    currency={hasPrice}
                  />
                </div>

                <div className="w-full">
                  <label className="block sm:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t('originCostColumn')}
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={sizeOriginalPrices[size] ?? ''}
                    onChange={(e) => updateSizeOriginalPrice(size, e.target.value)}
                    placeholder={commonOriginalPriceCNY ? `${t('defaultPrefix')}: ${commonOriginalPriceCNY}¥` : t('enterCNY')}
                  />
                </div>

                <div className="w-full">
                  <label className="block sm:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t('weightColumn')}
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={sizeWeights[size] ?? ''}
                    onChange={(e) => updateSizeWeight(size, e.target.value)}
                    placeholder={commonWeight ? `${t('defaultPrefix')}: ${commonWeight}kg` : t('enterWeight')}
                  />
                </div>

                <div className="hidden sm:flex items-center gap-1.5 justify-end self-center w-full">
                  {isCustom ? (
                    <>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('set')}
                      </span>
                      <button
                        type="button"
                        onClick={() => clearSizeCustomValues(size)}
                        className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title={t('clearCustomValues')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic whitespace-nowrap">{t('usingCommon')}</span>
                  )}
                </div>

                {hasProfitData && (
                  <div className="sm:col-start-2 sm:col-span-4 mt-1.5 sm:mt-0">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5 border border-emerald-200/30 dark:border-emerald-700/20 rounded-xl text-xs">
                      <span className="flex items-center gap-1 text-slate-500">
                        <BarChart3 className="h-3 w-3" />
                        {t('costLabel')}:
                        <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                          {p.totalCost.toLocaleString('vi-VN')}đ
                        </strong>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <ArrowUpRight className="h-3 w-3" />
                        {t('estimatedProfit')}:
                        <strong className={`font-bold ${p.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {p.profit >= 0 ? '+' : ''}
                          {p.profit.toLocaleString('vi-VN')}đ
                        </strong>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
                      <Badge
                        variant={
                          parseFloat(p.margin) >= 30
                            ? 'success'
                            : parseFloat(p.margin) > 0
                              ? 'info'
                              : 'danger'
                        }
                        className="text-[10px]"
                      >
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        {t('profitRate', { margin: p.margin })}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
