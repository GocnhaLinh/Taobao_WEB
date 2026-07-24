import React from 'react';
import { Globe, DollarSign } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

interface ExchangeRateCardProps {
  exchangeRate: string;
  setExchangeRate: (val: string) => void;
}

export const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({
  exchangeRate,
  setExchangeRate,
}) => {
  const rateNum = parseFloat(exchangeRate) || 0;
  const sampleVnd = 100 * rateNum;

  return (
    <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-500" />
          Tỷ giá Quy đổi ngoại tệ (NDT ➔ VNĐ)
        </h3>
        <Badge variant="success">Active System Rate</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tỷ giá NDT (¥ 1 Tệ = ? VNĐ) *
          </label>
          <Input
            type="number"
            step="1"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            placeholder="Ví dụ: 3995"
            required
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Tỷ giá này sẽ được áp dụng tự động để tính toán giá VNĐ cho tất cả sản phẩm nhập từ Trung Quốc.
          </span>
        </div>

        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
          <div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold block">Quy đổi mẫu:</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ¥ 100 RMB = {sampleVnd.toLocaleString()} VNĐ
            </span>
          </div>
          <DollarSign className="h-8 w-8 text-indigo-500 opacity-80" />
        </div>
      </div>
    </div>
  );
};
