import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { Search } from 'lucide-react';

interface ReviewFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  totalCount: number;
}

export const ReviewFilter: React.FC<ReviewFilterProps> = ({
  searchTerm,
  setSearchTerm,
  ratingFilter,
  setRatingFilter,
  totalCount,
}) => {
  const { t } = useTranslation();

  const ratingOptions = [
    { value: 'ALL', label: t('allRatings') },
    { value: '5', label: '5 ⭐⭐⭐⭐⭐' },
    { value: '4', label: '4 ⭐⭐⭐⭐' },
    { value: '3', label: '3 ⭐⭐⭐' },
    { value: '2', label: '2 ⭐⭐' },
    { value: '1', label: '1 ⭐' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
      <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
        {t('reviewListTitle')}
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
          {t('reviewCount', { count: totalCount })}
        </span>
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchReviewPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Rating Filter Select */}
        <CustomSelect
          size="sm"
          className="w-full sm:w-40"
          value={ratingFilter}
          onChange={setRatingFilter}
          options={ratingOptions}
        />
      </div>
    </div>
  );
};
