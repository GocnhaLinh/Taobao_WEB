import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';
import type { OrderStatCardsProps } from '../types';
import { ORDER_STAT_CARDS } from '../constants';

export const OrderStatCards: React.FC<OrderStatCardsProps> = ({ metrics, allowedStatuses }) => {
  const { t } = useTranslation();

  // Điền phần ĐỘNG (label/count) từ config TĨNH trong constants — label theo ngôn ngữ, count theo metrics
  const cards = ORDER_STAT_CARDS.map((cfg) => ({
    ...cfg,
    label: t(cfg.labelKey),
    count: metrics[cfg.countKey],
  }));

  // Chỉ hiện card cho các trạng thái được phép trên page này
  const visibleCards = cards.filter(
    (c) => !allowedStatuses || allowedStatuses.length === 0 || allowedStatuses.includes(c.status),
  );

  const totalOrders = metrics.totalOrders || 0;

  // auto-fit: page Order (5 card) đủ 1 hàng, page Kho (3 card) tự kéo giãn vừa khung
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5 sm:gap-4">
      {visibleCards.map((card) => {
        const pct = totalOrders > 0 ? Math.round((card.count / totalOrders) * 100) : 0;
        return (
          <div
            key={card.status}
            className="group relative overflow-hidden p-3 sm:p-4 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md hover:shadow-indigo-500/5 hover:-translate-y-0.5 hover:border-indigo-500/30 transition-all duration-200 min-w-0"
          >
            {/* Glow trang trí */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                  {card.label}
                </p>
                <h4 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                  {card.count}
                </h4>
              </div>
              <div
                className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${card.chip} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200`}
              >
                {card.icon}
              </div>
            </div>

            {/* Thanh phần trăm */}
            <div className="relative mt-2.5 h-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${card.bar} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Total Revenue — luôn hiển thị ở mọi page */}
      <div className="group relative overflow-hidden p-3 sm:p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl shadow-sm hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200 min-w-0">
        {/* Glow trang trí */}
        <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-indigo-500 uppercase tracking-wider truncate">
              {t('totalRevenueLabel')}
            </p>
            <h4
              className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-1 tracking-tight truncate"
              title={`${metrics.totalRevenue.toLocaleString()} ₫`}
            >
              {metrics.totalRevenue.toLocaleString()} ₫
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {totalOrders} {t('totalOrdersMetric')}
            </p>
          </div>
          <div className="p-2 sm:p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
            <TrendingUp className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
