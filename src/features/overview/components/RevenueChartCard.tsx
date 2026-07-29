import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

const monthlyRevenueData = [
  { month: 'T1', revenue: 145, orders: 120 },
  { month: 'T2', revenue: 180, orders: 145 },
  { month: 'T3', revenue: 210, orders: 175 },
  { month: 'T4', revenue: 195, orders: 160 },
  { month: 'T5', revenue: 260, orders: 210 },
  { month: 'T6', revenue: 310, orders: 255 },
  { month: 'T7', revenue: 290, orders: 240 },
  { month: 'T8', revenue: 350, orders: 290 },
  { month: 'T9', revenue: 420, orders: 340 },
  { month: 'T10', revenue: 380, orders: 310 },
  { month: 'T11', revenue: 490, orders: 410 },
  { month: 'T12', revenue: 560, orders: 480 },
];

export const RevenueChartCard: React.FC = () => {
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'orders'>('revenue');

  const maxChartValue = Math.max(...monthlyRevenueData.map((d) => (activeChartTab === 'revenue' ? d.revenue : d.orders)));

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500 shrink-0" />
            Revenue & Growth Chart
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed revenue trends (Million VND) and order volume by month this year.
          </p>
        </div>
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveChartTab('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeChartTab === 'revenue'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="hidden sm:inline">Revenue (Million ₫)</span>
            <span className="sm:hidden">Doanh thu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeChartTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="hidden sm:inline">Orders (Units)</span>
            <span className="sm:hidden">Đơn hàng</span>
          </button>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="pt-4 pb-2 overflow-x-auto no-scrollbar">
        <div className="h-56 min-w-[500px] sm:min-w-0 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200 dark:border-white/10">
          {monthlyRevenueData.map((item, index) => {
            const val = activeChartTab === 'revenue' ? item.revenue : item.orders;
            const heightPercent = Math.round((val / maxChartValue) * 100);

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none z-10 shadow-lg whitespace-nowrap">
                  {activeChartTab === 'revenue' ? `${item.revenue} Tr VNĐ` : `${item.orders} Đơn`}
                </div>

                {/* Bar fill */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 via-purple-500 to-indigo-400 group-hover:brightness-125 transition-all shadow-md group-hover:shadow-indigo-500/30"
                />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
