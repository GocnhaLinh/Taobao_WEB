import React from 'react';
import { Award } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

const topBuyers = [
  {
    id: '1',
    name: 'Nguyễn Văn Hùng',
    email: 'hung.nguyen@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    totalSpent: 185400000,
    ordersCount: 42,
    vipTier: 'DIAMOND',
  },
  {
    id: '2',
    name: 'Trần Thị Mai',
    email: 'mai.tran88@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    totalSpent: 142000000,
    ordersCount: 35,
    vipTier: 'GOLD',
  },
  {
    id: '3',
    name: 'Lê Minh Tuấn',
    email: 'tuan.leminh@yahoo.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    totalSpent: 98500000,
    ordersCount: 28,
    vipTier: 'GOLD',
  },
  {
    id: '4',
    name: 'Phạm Hoài An',
    email: 'hoaian.pham@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    totalSpent: 74200000,
    ordersCount: 19,
    vipTier: 'SILVER',
  },
  {
    id: '5',
    name: 'Đặng Quốc Anh',
    email: 'quocanh.dang@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    totalSpent: 56800000,
    ordersCount: 14,
    vipTier: 'SILVER',
  },
];

export const TopBuyersLeaderboard: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" />
          BXH Người mua nhiều nhất (VIP)
        </h3>
        <Badge variant="info">TOP BUYERS</Badge>
      </div>

      <div className="space-y-3">
        {topBuyers.map((buyer, idx) => {
          const rankBadge =
            idx === 0
              ? 'bg-amber-500 text-white'
              : idx === 1
              ? 'bg-slate-400 text-white'
              : idx === 2
              ? 'bg-amber-700 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

          return (
            <div
              key={buyer.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${rankBadge}`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </div>

                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 shadow-sm">
                  <img src={buyer.avatar} alt={buyer.name} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate flex items-center gap-1.5">
                    {buyer.name}
                    <Badge
                      variant={buyer.vipTier === 'DIAMOND' ? 'purple' : buyer.vipTier === 'GOLD' ? 'warning' : 'info'}
                      className="px-1.5 py-0.5 text-[9px]"
                    >
                      {buyer.vipTier}
                    </Badge>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                    {buyer.email}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {buyer.totalSpent.toLocaleString()} ₫
                </span>
                <span className="text-[10px] text-indigo-500 font-semibold block">
                  {buyer.ordersCount} đơn hàng thành công
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
