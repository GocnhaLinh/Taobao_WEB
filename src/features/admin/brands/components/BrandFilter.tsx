import React from 'react';
import { Search, Layers, Archive, List, LayoutGrid } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { useTranslation } from '../../../../lib/i18n';
import type { BrandFilterProps } from '../types';

export const BrandFilter: React.FC<BrandFilterProps> = ({
  activeTab,
  onTabChange,
  activeCount,
  trashCount,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
      {/* Pill Switcher */}
      <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onTabChange('ACTIVE')}
          className={`flex-1 sm:flex-initial px-4 lg:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'ACTIVE'
              ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={t('brandActiveTab')}
        >
          <Layers className="h-4 w-4" />
          <span className="hidden lg:inline">{t('brandActiveTab')}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-white/20 text-slate-700 dark:text-white font-mono">
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('TRASH')}
          className={`flex-1 sm:flex-initial px-4 lg:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'TRASH'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={t('brandTrashTab')}
        >
          <Archive className="h-4 w-4" />
          <span className="hidden lg:inline">{t('brandTrashTab')}</span>
          {trashCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-rose-600 font-extrabold animate-pulse">
              {trashCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Box & View Mode Toggle */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t('searchBrandPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-xs bg-slate-50 dark:bg-slate-800/80"
          />
        </div>

        {/* View Mode Switcher (Row vs Card) */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('row')}
            className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold ${
              viewMode === 'row'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Hàng ngang"
          >
            <List className="h-4 w-4" />
            <span className="hidden md:inline">Hàng ngang</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('card')}
            className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold ${
              viewMode === 'card'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Dạng thẻ (Card)"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden md:inline">Thẻ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
