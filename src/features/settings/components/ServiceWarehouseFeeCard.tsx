import React from 'react';
import { Percent } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

interface ServiceWarehouseFeeCardProps {
  serviceFeePercent: string;
  setServiceFeePercent: (val: string) => void;
  depositPercent: string;
  setDepositPercent: (val: string) => void;
  warehouseFreeDays: string;
  setWarehouseFreeDays: (val: string) => void;
  warehouseFeePerDay: string;
  setWarehouseFeePerDay: (val: string) => void;
}

export const ServiceWarehouseFeeCard: React.FC<ServiceWarehouseFeeCardProps> = ({
  serviceFeePercent,
  setServiceFeePercent,
  depositPercent,
  setDepositPercent,
  warehouseFreeDays,
  setWarehouseFreeDays,
  warehouseFeePerDay,
  setWarehouseFeePerDay,
}) => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
        <Percent className="h-5 w-5 text-amber-500" />
        Phí Dịch vụ & Quy định Kho hàng
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Phí dịch vụ mua hàng (%)
          </label>
          <Input
            type="number"
            step="0.1"
            value={serviceFeePercent}
            onChange={(e) => setServiceFeePercent(e.target.value)}
            placeholder="5.5"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tỷ lệ đặt cọc tối thiểu (%)
          </label>
          <Input
            type="number"
            step="1"
            value={depositPercent}
            onChange={(e) => setDepositPercent(e.target.value)}
            placeholder="70"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Số ngày miễn phí lưu kho (Ngày)
          </label>
          <Input
            type="number"
            step="1"
            value={warehouseFreeDays}
            onChange={(e) => setWarehouseFreeDays(e.target.value)}
            placeholder="30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Phí lưu kho quá hạn (VNĐ / Ngày)
          </label>
          <Input
            type="number"
            step="500"
            value={warehouseFeePerDay}
            onChange={(e) => setWarehouseFeePerDay(e.target.value)}
            placeholder="5000"
          />
        </div>
      </div>
    </div>
  );
};
