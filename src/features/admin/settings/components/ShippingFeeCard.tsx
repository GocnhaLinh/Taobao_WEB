import React from 'react';
import { Truck } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';
import { Input } from '../../../../components/ui/Input';

interface ShippingFeeCardProps {
  shippingCnPerKg: string;
  setShippingCnPerKg: (val: string) => void;
  shippingVnPerKg: string;
  setShippingVnPerKg: (val: string) => void;
}

export const ShippingFeeCard: React.FC<ShippingFeeCardProps> = ({
  shippingCnPerKg,
  setShippingCnPerKg,
  shippingVnPerKg,
  setShippingVnPerKg,
}) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <div>
        <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg flex items-center gap-2">
          <Truck className="h-5 w-5 text-emerald-500 shrink-0" />
          {t('settingsShippingTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('settingsShippingDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {t('settingsShippingCnLabel')}
          </label>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {t('settingsShippingCnDesc')}
          </p>
          <Input
            type="number"
            step="500"
            value={shippingCnPerKg}
            onChange={(e) => setShippingCnPerKg(e.target.value)}
            placeholder="Ví dụ: 28000"
            required
            className="bg-white dark:bg-slate-900"
          />
        </div>

        <div className="space-y-2 p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {t('settingsShippingVnLabel')}
          </label>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            {t('settingsShippingVnDesc')}
          </p>
          <Input
            type="number"
            step="500"
            value={shippingVnPerKg}
            onChange={(e) => setShippingVnPerKg(e.target.value)}
            placeholder="Ví dụ: 15000"
            required
            className="bg-white dark:bg-slate-900"
          />
        </div>
      </div>
    </div>
  );
};

