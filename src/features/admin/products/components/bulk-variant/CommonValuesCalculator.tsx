import React from 'react';
import { Calculator, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { Input } from '../../../../../components/ui/Input';
import { Badge } from '../../../../../components/ui/Badge';
import { useTranslation } from '../../../../../lib/i18n';
import type { CommonValuesCalculatorProps } from '../../types/bulk-variant.types';

export const CommonValuesCalculator: React.FC<CommonValuesCalculatorProps> = ({
  hideCommonPriceSection,
  commonPrice,
  setCommonPrice,
  commonOriginalPriceCNY,
  setCommonOriginalPriceCNY,
  allWeightsSet,
  commonWeight,
  setCommonWeight,
  commonStock,
  setCommonStock,
  perKg,
  rate,
  DIGITS_ONLY,
  DECIMAL_INPUT,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <Calculator className="h-4 w-4" />
          {t('commonValuesAndProfit')}
        </h4>
        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {hideCommonPriceSection ? (
          <div className="flex items-center justify-center p-3 bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-700/30 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" />
            <span>{t('allSizesHavePrice')}</span>
          </div>
        ) : (
          <div className="space-y-1">
            <Input
              label={t('commonPriceLabel')}
              type="text"
              inputMode="numeric"
              value={commonPrice}
              onChange={(e) => {
                if (DIGITS_ONLY.test(e.target.value)) setCommonPrice(e.target.value);
              }}
              placeholder="250000"
              currency={!!commonPrice}
            />
            <p className="px-1 text-[10px] text-slate-400 italic">{t('commonPriceDesc')}</p>
          </div>
        )}
        <Input
          label={t('commonOriginCostLabel')}
          type="text"
          inputMode="decimal"
          value={commonOriginalPriceCNY}
          onChange={(e) => setCommonOriginalPriceCNY(e.target.value)}
          placeholder="45"
        />
        {allWeightsSet ? (
          <div className="flex items-center justify-center p-3 bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-700/30 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" />
            <span>{t('allSizesHaveWeight')}</span>
          </div>
        ) : (
          <div className="space-y-1">
            <Input
              label={t('commonWeightLabel')}
              type="text"
              inputMode="decimal"
              value={commonWeight}
              onChange={(e) => {
                if (DECIMAL_INPUT.test(e.target.value)) setCommonWeight(e.target.value);
              }}
              placeholder="0.3"
            />
            <p className="px-1 text-[10px] text-slate-400 italic">{t('commonWeightDesc')}</p>
          </div>
        )}
        <Input
          label={t('stock')}
          type="number"
          value={commonStock}
          onChange={(e) => setCommonStock(e.target.value)}
          placeholder="10"
        />
      </div>

      {/* Profit Card */}
      {parseFloat(commonOriginalPriceCNY) > 0 && (
        <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">{t('shippingFeeCalc')}</span>
            <strong className="text-slate-900 dark:text-white font-bold text-xs">
              {Math.round((parseFloat(commonWeight) || 0) * perKg).toLocaleString()} đ ({parseFloat(commonWeight) || 0}kg)
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">{t('totalLandingCost')}</span>
            <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              {Math.round(
                (parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg
              ).toLocaleString()}{' '}
              đ
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">{t('estimatedProfit')}</span>
            <strong
              className={`font-bold text-xs ${
                (parseFloat(commonPrice) || 0) -
                  Math.round(
                    (parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg
                  ) >=
                0
                  ? 'text-emerald-500'
                  : 'text-rose-500'
              }`}
            >
              {(() => {
                const sp = parseFloat(commonPrice) || 0;
                const cp = Math.round(
                  (parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg
                );
                const p = sp - cp;
                return `${p >= 0 ? '+' : ''}${p.toLocaleString()} đ`;
              })()}
            </strong>
          </div>
          <div className="flex items-center">
            <Badge
              variant={(() => {
                const sp = parseFloat(commonPrice) || 0;
                const cp = Math.round(
                  (parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg
                );
                const p = sp - cp;
                const m = sp > 0 ? (p / sp) * 100 : 0;
                return m >= 30 ? 'success' : m > 0 ? 'info' : 'danger';
              })()}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {t('profitRate', {
                margin: (() => {
                  const sp = parseFloat(commonPrice) || 0;
                  const cp = Math.round(
                    (parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg
                  );
                  const p = sp - cp;
                  return sp > 0 ? ((p / sp) * 100).toFixed(1) : '0';
                })(),
              })}
            </Badge>
          </div>
        </div>
      )}
      {parseFloat(commonOriginalPriceCNY) === 0 && (parseFloat(commonPrice) || 0) > 0 && (
        <div className="p-2 text-xs text-slate-500 italic">{t('enterOriginCostHint')}</div>
      )}
    </div>
  );
};
