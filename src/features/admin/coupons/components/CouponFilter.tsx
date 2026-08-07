import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { getCouponStatusOptions, getCouponTypeOptions } from '../constants';
import { Search } from 'lucide-react';

interface CouponFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  totalCount: number;
}

export const CouponFilter: React.FC<CouponFilterProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  totalCount,
}) => {
  const { t } = useTranslation();

  const statusOptions = getCouponStatusOptions(t);
  const typeOptions = getCouponTypeOptions(t);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
      <div>
        <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
          {t('voucherList')}
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            {t('voucherCount', { count: totalCount })}
          </span>
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 lg:w-60">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchCouponPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter Select */}
          <CustomSelect
            size="sm"
            className="w-full sm:w-44"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />

          {/* Type Filter Select */}
          <CustomSelect
            size="sm"
            className="w-full sm:w-36"
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
          />
        </div>
      </div>
    </div>
  );
};
