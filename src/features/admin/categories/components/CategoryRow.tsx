import React from 'react';
import { Edit2, Trash2, RotateCcw } from 'lucide-react';
import type { Category } from '../../../../types';
import { useTranslation } from '../../../../lib/i18n';
import { getGradientClass } from '../../../../utils/gradientHelper';
import { TrashCountdownBar } from '../../../../components/ui/TrashCountdownBar';

interface CategoryRowProps {
  category: Category;
  labelsMap?: Record<string, string>;
  isTrashView?: boolean;
  onEdit?: (category: Category) => void;
  onSoftDelete?: (category: Category) => void;
  onRestore?: (category: Category) => void;
  onHardDelete?: (category: Category) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = React.memo(({
  category,
  labelsMap = {},
  isTrashView = false,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  const { t } = useTranslation();

  const getSexDisplay = (sexVal?: string) => {
    if (!sexVal) return null;
    const icon = labelsMap[sexVal];
    return icon ? `${icon} ${sexVal}` : sexVal;
  };

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
        isTrashView
          ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:-translate-y-0.5'
      }`}
    >
      {/* Info Left Side */}
      <div className="flex items-center gap-3 min-w-0">          {getSexDisplay(category.sex) && (
            <span className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold shrink-0 border ${getGradientClass(category.sex!)}`}>
              {getSexDisplay(category.sex)}
            </span>
          )}
        <div className="min-w-0 flex items-center gap-2">
          <h4 className="text-slate-900 dark:text-white font-bold text-base truncate">{category.name}</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-lg shrink-0">
            /{category.slug}
          </span>
        </div>
      </div>

      {/* Center & Actions Right Side */}
      <div className="flex items-center justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/10 w-full sm:w-auto">
        {/* Countdown tag if trash */}
        {isTrashView && (
          <TrashCountdownBar
            deletedAt={category.deletedAt}
            fallbackDate={(category as any).updatedAt}
            variant="compact"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
          {!isTrashView ? (
            <>
              <button
                onClick={() => onEdit?.(category)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer"
                title={t('editCategory')}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSoftDelete?.(category)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                title={t('softDelete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onRestore?.(category)}
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer"
                title={t('restore')}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => onHardDelete?.(category)}
                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                title={t('hardDelete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

