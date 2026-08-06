import React, { useState } from 'react';
import { Edit2, Trash2, RotateCcw, Award } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';
import type { Brand } from '../../../../types';
import { TrashCountdownBar } from '../../../../components/ui/TrashCountdownBar';

interface BrandCardProps {
  brand: Brand;
  isTrashView?: boolean;
  onEdit?: (brand: Brand) => void;
  onSoftDelete?: (brand: Brand) => void;
  onRestore?: (brand: Brand) => void;
  onHardDelete?: (brand: Brand) => void;
}

export const BrandCard: React.FC<BrandCardProps> = React.memo(({
  brand,
  isTrashView = false,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between group ${
        isTrashView
          ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Brand Logo & Header */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className="h-12 w-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {brand.logo && !imgError ? (
              <img
                src={brand.logo}
                alt={brand.name}
                onError={() => setImgError(true)}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Award className="h-6 w-6 text-indigo-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-slate-900 dark:text-white font-bold text-base leading-snug truncate">
              {brand.name}
            </h4>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 inline-block mt-0.5">
              {t('officialBrand')}
            </span>
          </div>
        </div>

        {/* Brand Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4">
          {brand.description || t('brandDescriptionDefault')}
        </p>

        {/* Countdown tag if trash */}
        {isTrashView && (
          <div className="mb-3">
            <TrashCountdownBar
              deletedAt={brand.deletedAt}
              fallbackDate={brand.updatedAt}
              variant="card"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-end gap-1.5">
        {!isTrashView ? (
          <>
            <button
              onClick={() => onEdit?.(brand)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer"
              title={t('edit')}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSoftDelete?.(brand)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
              title={t('softDelete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onRestore?.(brand)}
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer"
              title={t('restore')}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => onHardDelete?.(brand)}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
              title={t('hardDelete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
});

