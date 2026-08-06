import React from 'react';
import { Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { useTranslation } from '../../../../lib/i18n';
import type { WarehouseTableProps } from '../types';
import { WarehouseItem } from './WarehouseItem';

const SkeletonCard: React.FC = () => (
  <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 animate-pulse space-y-3">
    <div className="flex gap-2">
      <div className="h-5 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-5 w-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-700" />
    <div className="h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-700" />
    <div className="flex gap-1.5 pt-1">
      <div className="h-5 w-14 rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="pt-2 flex justify-end gap-1.5">
      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  </div>
);

const SkeletonRow: React.FC = () => (
  <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 animate-pulse flex items-center gap-3">
    <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex gap-2">
        <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-4 w-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="flex gap-1 shrink-0">
      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  </div>
);

export const WarehouseTable: React.FC<WarehouseTableProps> = ({
  warehouses,
  activeTab,
  viewMode,
  searchQuery,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  const { t } = useTranslation();
  const isTrashView = activeTab === 'TRASH';

  if (isLoading) {
    return viewMode === 'card' ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3 animate-in fade-in duration-300">
        <Archive className="h-10 w-10 opacity-30" />
        <span>
          {activeTab === 'ACTIVE'
            ? t('emptyActiveWarehouses')
            : t('emptyTrashWarehouses')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {warehouses.map((wh, index) => (
            <div
              key={wh.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <WarehouseItem
                warehouse={wh}
                isTrashView={isTrashView}
                viewMode="card"
                searchQuery={searchQuery}
                onEdit={onEdit}
                onSoftDelete={onSoftDelete}
                onRestore={onRestore}
                onHardDelete={onHardDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {warehouses.map((wh, index) => (
            <div
              key={wh.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <WarehouseItem
                warehouse={wh}
                isTrashView={isTrashView}
                viewMode="row"
                searchQuery={searchQuery}
                onEdit={onEdit}
                onSoftDelete={onSoftDelete}
                onRestore={onRestore}
                onHardDelete={onHardDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between animate-in fade-in duration-200">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('page')}{' '}
            <strong className="text-slate-900 dark:text-white">{currentPage}</strong> / {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('prev')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              {t('next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
