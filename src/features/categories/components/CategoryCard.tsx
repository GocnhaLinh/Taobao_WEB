import React from 'react';
import { Edit2, Trash2, RotateCcw } from 'lucide-react';
import type { Category } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../../components/ui/Button';

interface CategoryCardProps {
  category: Category;
  isTrashView?: boolean;
  onEdit?: (category: Category) => void;
  onSoftDelete?: (category: Category) => void;
  onRestore?: (category: Category) => void;
  onHardDelete?: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isTrashView = false,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  const { t } = useTranslation();

  // Calculate remaining days until 30-day auto deletion
  const getRemainingDaysInfo = (deletedAt?: string) => {
    if (!deletedAt) {
      return {
        text: '⏱️ Tự xóa sau 30 ngày',
        style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium',
      };
    }

    const deleteDate = new Date(deletedAt).getTime();
    const now = new Date().getTime();
    const diffMs = now - deleteDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(30 - diffDays, 0);

    if (remainingDays <= 5) {
      return {
        text: `⚠️ Sắp bị xóa vĩnh viễn (Còn ${remainingDays} ngày)`,
        style: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse font-bold',
      };
    }
    if (remainingDays <= 15) {
      return {
        text: `⏱️ Tự xóa sau ${remainingDays} ngày`,
        style: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold',
      };
    }
    return {
      text: `⏱️ Tự xóa sau ${remainingDays} ngày`,
      style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium',
    };
  };

  const getSexLabel = (sexVal?: string) => {
    if (!sexVal) return `👫 ${t('sexUnisex') || 'Unisex'}`;
    const val = sexVal.toUpperCase();
    if (val === 'MALE' || val === 'M') return `👨 ${t('sexMale') || 'Nam'}`;
    if (val === 'FEMALE' || val === 'F') return `👩 ${t('sexFemale') || 'Nữ'}`;
    if (val === 'KID' || val === 'KIDS') return `🧒 ${t('sexKid') || 'Trẻ em'}`;
    if (val === 'OTHER') return `✨ ${t('sexOther') || 'Khác'}`;
    if (val === 'UNISEX') return `👫 ${t('sexUnisex') || 'Unisex'}`;
    return `🏷️ ${sexVal}`;
  };

  const getSexBadgeStyle = (sexVal?: string) => {
    const val = (sexVal || 'UNISEX').toUpperCase();
    if (val === 'MALE' || val === 'M') return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30';
    if (val === 'FEMALE' || val === 'F') return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
    if (val === 'KID' || val === 'KIDS') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
    if (val === 'OTHER') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
    return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30';
  };

  const remainingInfo = getRemainingDaysInfo(category.deletedAt);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between group ${
        isTrashView
          ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Top Row: Sex Badge */}
        <div className="flex justify-between items-start mb-2.5">
          <span className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold ${getSexBadgeStyle(category.sex)}`}>
            {getSexLabel(category.sex)}
          </span>
        </div>

        {/* Category Title & Slug */}
        <h4 className="text-slate-900 dark:text-white font-bold text-base leading-snug">{category.name}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-lg w-fit">
          /{category.slug}
        </p>

        {/* Auto Delete Countdown Tag for Trash Items */}
        {isTrashView && (
          <div className={`mt-2.5 px-2.5 py-1 rounded-xl border text-[10px] w-fit ${remainingInfo.style}`}>
            {remainingInfo.text}
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-1.5">
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
  );
};
