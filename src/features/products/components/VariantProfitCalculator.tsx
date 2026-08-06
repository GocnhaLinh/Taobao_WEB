import React from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Calculator, Sparkles, TrendingUp } from 'lucide-react';

interface ProfitCalculatorValues {
  originalPriceCNY: string;
  exchangeRate: string;
  weight: string;
  shippingFeePerKg: string;
  price: string;
}

interface VariantProfitCalculatorProps {
  values: ProfitCalculatorValues;
  onChange: (field: keyof ProfitCalculatorValues, value: string) => void;
  /** Custom className cho container */
  className?: string;
}

export const VariantProfitCalculator: React.FC<VariantProfitCalculatorProps> = ({
  values,
  onChange,
  className = '',
}) => {
  const { t } = useTranslation();

  const cny = parseFloat(values.originalPriceCNY) || 0;
  const rate = parseFloat(values.exchangeRate) || 0;
  const kg = parseFloat(values.weight) || 0;
  const perKg = parseFloat(values.shippingFeePerKg) || 0;
  const rawShip = kg * perKg;
  const shipVND = Math.round(rawShip);
  const totalCostVND = Math.round(cny * rate + rawShip);
  const sellingVND = parseFloat(values.price) || 0;
  const profitVND = Math.round(sellingVND - totalCostVND);
  const profitMargin =
    sellingVND > 0 ? ((profitVND / sellingVND) * 100).toFixed(1) : '0';

  return (
    <div
      className={`p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <Calculator className="h-4 w-4" />
          {t('initialVariant') || 'China Import Profit Calculator'}
        </h4>
        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          label={t('originCostCNY')}
          type="number"
          step="0.01"
          value={values.originalPriceCNY}
          onChange={(e) => onChange('originalPriceCNY', e.target.value)}
          placeholder="E.g. 45 (CNY)"
        />
        <Input
          label={t('exchangeRateLabel')}
          type="number"
          value={values.exchangeRate}
          onChange={(e) => onChange('exchangeRate', e.target.value)}
          placeholder="3,500đ"
          disabled
        />
        <Input
          label={t('weightKg')}
          type="number"
          step="0.01"
          value={values.weight}
          onChange={(e) => onChange('weight', e.target.value)}
          placeholder="E.g. 0.5 (kg)"
        />
        <Input
          label={t('shippingCnFee')}
          type="number"
          value={values.shippingFeePerKg}
          onChange={(e) => onChange('shippingFeePerKg', e.target.value)}
          placeholder="E.g. 28000"
          disabled
        />
      </div>

      {/* Realtime Profit Card Summary */}
      {cny > 0 && (
        <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">
              {t('shippingFeeCalc')}
            </span>
            <strong className="text-slate-900 dark:text-white font-bold text-xs">
              {shipVND.toLocaleString()} đ ({kg}kg)
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              {t('totalLandingCost')}
            </span>
            <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              {totalCostVND.toLocaleString()} đ
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              {t('estimatedProfit')}
            </span>
            <strong
              className={`font-bold text-xs ${profitVND >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
            >
              {profitVND >= 0 ? '+' : ''}
              {profitVND.toLocaleString()} đ
            </strong>
          </div>
          <div className="flex items-center">
            <Badge
              variant={
                parseFloat(profitMargin) >= 30
                  ? 'success'
                  : parseFloat(profitMargin) > 0
                    ? 'info'
                    : 'danger'
              }
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {t('profitRate', { margin: profitMargin })}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};
