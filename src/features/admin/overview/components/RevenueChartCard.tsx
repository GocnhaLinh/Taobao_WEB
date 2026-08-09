import React, { useMemo, useState } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';
import type { DashboardMonthlyPoint, RevenueChartCardProps } from '../types';
import { createMonthLabelFormatter, formatMonthLabel } from '../utils/dashboard.utils';

interface ChartBarProps {
  item: DashboardMonthlyPoint;
  activeChartTab: 'revenue' | 'orders';
  maxChartValue: number;
  monthFormatter: Intl.DateTimeFormat;
}

/**
 * Single bar column with a tooltip that follows the mouse cursor.
 */
const ChartBar: React.FC<ChartBarProps> = ({
  item,
  activeChartTab,
  maxChartValue,
  monthFormatter,
}) => {
  const { t } = useTranslation();
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const value = activeChartTab === 'revenue' ? item.revenue : item.orders;
  // Zero-data months render an empty track instead of a fake bar
  const heightPercent = value > 0 ? Math.max(3, Math.round((value / maxChartValue) * 100)) : 0;

  return (
    <div
      className="relative flex-1 flex flex-col items-center gap-2 group h-full justify-end"
      onMouseMove={(e) => setTooltipPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
      onMouseLeave={() => setTooltipPos(null)}
    >
      {/* Tooltip follows the cursor — month name + exact amount / order count */}
      {tooltipPos && (
        <div
          className="absolute z-10 pointer-events-none bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap text-center animate-in fade-in duration-150"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, calc(-100% - 10px))',
          }}
        >
          <span className="block text-[9px] uppercase tracking-wider text-slate-300">
            {formatMonthLabel(monthFormatter, item.month)}
          </span>
          <span className="block mt-0.5">
            {activeChartTab === 'revenue'
              ? `${item.revenue.toLocaleString('vi-VN')} ₫`
              : `${item.orders} ${t('ordersUnit')}`}
          </span>
        </div>
      )}

      {/* Bar fill — empty track when the month has no data */}
      {value > 0 ? (
        <div
          style={{ height: `${heightPercent}%` }}
          className={`w-full rounded-t-lg transition-all shadow-md group-hover:shadow-indigo-500/30 ${
            activeChartTab === 'revenue'
              ? 'bg-gradient-to-t from-indigo-600 via-purple-500 to-indigo-400 group-hover:brightness-125'
              : 'bg-gradient-to-t from-sky-600 via-cyan-500 to-sky-400 group-hover:brightness-125'
          }`}
        />
      ) : (
        <div className="w-2.5 h-3 rounded-sm border border-dashed border-slate-200 dark:border-white/10 mb-auto" />
      )}
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        {formatMonthLabel(monthFormatter, item.month)}
      </span>
    </div>
  );
};

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({ data }) => {
  const { t, language } = useTranslation();
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'orders'>('revenue');

  // Locale-aware short month label (e.g. "thg 1", "Jan", "1月")
  const monthFormatter = useMemo(() => createMonthLabelFormatter(language), [language]);

  const maxChartValue = useMemo(
    () =>
      Math.max(0, ...data.map((d) => (activeChartTab === 'revenue' ? d.revenue : d.orders))),
    [data, activeChartTab],
  );

  const isEmpty = data.length === 0 || maxChartValue === 0;

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500 shrink-0" />
            {t('chartTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('chartDesc')}</p>
        </div>
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveChartTab('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === 'revenue'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('revenueTab')}
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('ordersTab')}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="h-56 flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm">
            {t('emptyChart')}
          </p>
        </div>
      ) : (
        <div className="pt-4 pb-2 overflow-x-auto no-scrollbar">
          <div className="h-56 min-w-[500px] sm:min-w-0 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200 dark:border-white/10">
            {data.map((item) => (
              <ChartBar
                key={item.key}
                item={item}
                activeChartTab={activeChartTab}
                maxChartValue={maxChartValue}
                monthFormatter={monthFormatter}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
