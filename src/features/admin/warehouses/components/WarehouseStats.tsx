import React from 'react';
import { Building2, Star, Globe, Trash2 } from 'lucide-react';
import type { WarehouseStatsProps } from '../types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  subtitle?: string;
}

const accentMap = {
  indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/25 text-indigo-600 dark:text-indigo-400',
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/25 text-amber-600 dark:text-amber-400',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/25 text-rose-600 dark:text-rose-400',
  sky: 'from-sky-500/20 to-sky-600/10 border-sky-500/25 text-sky-600 dark:text-sky-400',
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, accent, subtitle }) => (
  <div className={`flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br ${accentMap[accent]} border shadow-xs backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}>
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75 truncate">{label}</p>
      <p className="text-lg font-extrabold tabular-nums leading-tight">{value}</p>
      {subtitle && <p className="text-[10px] opacity-60 truncate">{subtitle}</p>}
    </div>
  </div>
);

export const WarehouseStats: React.FC<WarehouseStatsProps> = ({
  totalActive,
  defaultWarehouseName,
  supportedProvincesCount,
  trashCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
      <StatCard
        icon={<Building2 className="h-5 w-5 text-indigo-500" />}
        label="Kho hoạt động"
        value={totalActive}
        accent="indigo"
        subtitle="Hệ thống đa kho"
      />
      <StatCard
        icon={<Star className="h-5 w-5 text-amber-500" />}
        label="Tổng Kho Mặc Định"
        value={defaultWarehouseName}
        accent="amber"
        subtitle="Mặc định gán đơn"
      />
      <StatCard
        icon={<Globe className="h-5 w-5 text-sky-500" />}
        label="Tỉnh/Thành bao phủ"
        value={`${supportedProvincesCount} Tỉnh`}
        accent="sky"
        subtitle="Phủ sóng giao hàng"
      />
      <StatCard
        icon={<Trash2 className="h-5 w-5 text-rose-500" />}
        label="Thùng rác"
        value={trashCount}
        accent="rose"
        subtitle="Kho đã lưu trữ"
      />
    </div>
  );
};
