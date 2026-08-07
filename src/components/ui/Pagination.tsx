import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { CustomSelect } from './CustomSelect';
import { useTranslation } from '../../lib/i18n';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = 'mục',
  className = '',
}) => {
  const { t } = useTranslation();

  if (totalPages <= 0 && (!totalItems || totalItems === 0)) return null;

  const validTotalPages = Math.max(1, totalPages);
  const validCurrentPage = Math.min(Math.max(1, currentPage), validTotalPages);

  const startItem = pageSize && totalItems ? (validCurrentPage - 1) * pageSize + 1 : null;
  const endItem = pageSize && totalItems ? Math.min(validCurrentPage * pageSize, totalItems) : null;

  // Generate page numbers array with smart ellipsis logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (validTotalPages <= 7) {
      for (let i = 1; i <= validTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validCurrentPage > 3) pages.push('...');

      const start = Math.max(2, validCurrentPage - 1);
      const end = Math.min(validTotalPages - 1, validCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (validCurrentPage < validTotalPages - 2) pages.push('...');
      pages.push(validTotalPages);
    }

    return pages;
  };

  const selectOptions = pageSizeOptions.map((opt) => ({
    value: String(opt),
    label: `${opt} / ${t('perPage')}`,
  }));

  return (
    <div className={`pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs animate-in fade-in duration-200 ${className}`}>
      {/* Range Info & Custom Styled Page Size Selector - flex row on mobile for clean side-by-side alignment */}
      <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto text-slate-500 dark:text-slate-400">
        {startItem !== null && endItem !== null && totalItems !== undefined ? (
          <span className="text-slate-600 dark:text-slate-400 font-medium truncate">
            {t('showingRangeFormat', {
              start: startItem,
              end: endItem,
              total: totalItems,
              label: itemLabel,
            })}
          </span>
        ) : (
          <span className="text-slate-600 dark:text-slate-400 font-medium truncate">
            {t('pageRangeFormat', {
              page: validCurrentPage,
              totalPages: validTotalPages,
            })}
          </span>
        )}

        {onPageSizeChange && pageSize && (
          <div className="w-24 sm:w-28 shrink-0">
            <CustomSelect
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={selectOptions}
              size="sm"
              dropUp={true}
            />
          </div>
        )}
      </div>

      {/* Pagination Page Number Controls */}
      <div className="flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          className="px-2.5 py-1 text-xs rounded-xl font-bold"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">{t('prevPage')}</span>
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 font-bold">
                  ...
                </span>
              );
            }

            const isCurrent = page === validCurrentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage === validTotalPages}
          className="px-2.5 py-1 text-xs rounded-xl font-bold"
        >
          <span className="hidden sm:inline">{t('nextPage')}</span>
          <ChevronRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
};
