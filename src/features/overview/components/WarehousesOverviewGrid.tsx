import React from 'react';
import { Warehouse as WarehouseIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useTranslation } from '../../../lib/i18n';

interface WarehousesOverviewGridProps {
  warehouses: any[];
}

export const WarehousesOverviewGrid: React.FC<WarehousesOverviewGridProps> = ({ warehouses }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
          <WarehouseIcon className="h-5 w-5 text-emerald-500 shrink-0" />
          <span className="truncate">{t('warehouseManagement')} ({warehouses.length})</span>
        </h3>
        <Badge variant="success" className="shrink-0 whitespace-nowrap">
          <span className="hidden sm:inline">ACTIVE SYSTEM</span>
          <span className="sm:hidden">ACTIVE</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map((wh: any) => (
          <div
            key={wh.id || wh.code}
            className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{wh.name}</span>
              <Badge variant={wh.isDefault ? 'success' : 'info'}>{wh.code}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Địa chỉ: {wh.address || wh.province}
            </p>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Khu vực phục vụ: {wh.supportedProvinces?.slice(0, 3).join(', ') || 'Toàn quốc'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
