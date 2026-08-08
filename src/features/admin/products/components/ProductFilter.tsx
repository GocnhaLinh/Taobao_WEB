import React from 'react';
import { Search, Package, Archive } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';

interface ProductFilterProps {
  activeTab: 'ACTIVE' | 'DELETED';
  setActiveTab: (tab: 'ACTIVE' | 'DELETED') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCount: number;
  deletedCount: number;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  activeCount,
  deletedCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
      {/* Active / Deleted Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 self-start">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'ACTIVE'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="h-4 w-4" />
          {t('activeTabLabel')}
          <span className="ml-1.5 px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold">
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DELETED')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'DELETED'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Archive className="h-4 w-4" />
          {t('trashTabLabel')}
          <span className="ml-1.5 px-2 py-0.5 text-[10px] rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
            {deletedCount}
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('searchProductFilterPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>
    </div>
  );
};
