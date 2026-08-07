import React from 'react';
import { Search, Users, Archive } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { useTranslation } from '../../../../lib/i18n';
import type { UserFilterProps } from '../types';
import { getUserRoleOptions, getUserStatusOptions } from '../constants';

export const UserFilter: React.FC<UserFilterProps> = ({
  activeTab,
  onTabChange,
  activeCount,
  trashCount,
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10 w-full">
      {/* Pill Switcher for Active Accounts vs Trash */}
      <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full sm:w-auto shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('ACTIVE')}
          className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ACTIVE'
              ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{t('userAccountsTab')}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-white/20 text-slate-700 dark:text-white font-mono shrink-0">
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('TRASH')}
          className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'TRASH'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Archive className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{t('trashTab')}</span>
          {trashCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-rose-600 font-extrabold animate-pulse shrink-0">
              {trashCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Input & Dropdown Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
        {/* Search Input */}
        <div className="w-full sm:w-60 lg:w-64">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchUserPlaceholder')}
            icon={<Search className="h-4 w-4" />}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="w-full sm:w-36 lg:w-40">
            <CustomSelect
              value={roleFilter}
              onChange={onRoleChange}
              options={getUserRoleOptions(t, true)}
              className="w-full text-xs"
              size="sm"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-36 lg:w-40">
            <CustomSelect
              value={statusFilter}
              onChange={onStatusChange}
              options={getUserStatusOptions(t, true)}
              className="w-full text-xs"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
