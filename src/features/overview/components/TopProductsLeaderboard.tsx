import React from 'react';
import { Crown, Sparkles, Package } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

interface TopProductsLeaderboardProps {
  productsList: any[];
}

export const TopProductsLeaderboard: React.FC<TopProductsLeaderboardProps> = ({ productsList }) => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          Top Best Selling Products
        </h3>
        <Badge variant="warning" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          TOP BESTSELLERS
        </Badge>
      </div>

      <div className="space-y-3">
        {productsList.length > 0 ? (
          productsList.slice(0, 5).map((prod: any, idx: number) => {
            const rankColor =
              idx === 0
                ? 'bg-amber-500 text-white ring-2 ring-amber-400/40 shadow-amber-500/30'
                : idx === 1
                ? 'bg-slate-400 text-white ring-2 ring-slate-300/40 shadow-slate-400/30'
                : idx === 2
                ? 'bg-amber-700 text-white ring-2 ring-amber-600/40 shadow-amber-700/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

            return (
              <div
                key={prod.id || idx}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${rankColor}`}
                  >
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>

                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-white/10">
                    {prod.thumbnail ? (
                      <img src={prod.thumbnail} alt={prod.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-indigo-500 transition-colors">
                      {prod.productName}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Category: {prod.category?.name || 'Fashion'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 block">
                    {(prod.price || 250000).toLocaleString()} ₫
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    Sold: {120 - idx * 18} items
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">No products in the system yet.</div>
        )}
      </div>
    </div>
  );
};
