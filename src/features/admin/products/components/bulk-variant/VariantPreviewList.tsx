import React from 'react';
import { Weight, AlertCircle } from 'lucide-react';
import { Badge } from '../../../../../components/ui/Badge';
import { useTranslation } from '../../../../../lib/i18n';
import type { VariantPreviewListProps } from '../../types/bulk-variant.types';

export const VariantPreviewList: React.FC<VariantPreviewListProps> = ({
  totalVariants,
  hasSizeOrColor,
  generatedVariants,
  commonPrice,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Preview header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('previewTitle', { count: totalVariants })}
          </h4>
          <span className="text-xs text-slate-500">
            <strong className="font-mono text-indigo-500">{t('autoSku')}</strong>
          </span>
        </div>

        {!hasSizeOrColor ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed">
            {t('addSizeOrColorHint')}
            <br />
            <span className="text-[10px] text-slate-400 mt-1 block">{t('sizeColorTip')}</span>
          </div>
        ) : (
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {generatedVariants.map((v, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-2.5 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-xl text-xs gap-1.5 sm:gap-3 hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-400 font-mono w-6 shrink-0 text-[11px]">#{idx + 1}</span>
                  {v.image && (
                    <img
                      src={v.image}
                      alt={v.sku}
                      className="h-6 w-6 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0"
                    />
                  )}
                  <Badge variant="neutral" className="font-mono text-[10px] truncate max-w-full sm:max-w-[180px]">
                    {v.sku}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs pl-8 sm:pl-0">
                  {v.size ? (
                    <span>
                      {t('size')}: <strong className="text-slate-800 dark:text-white">{v.size}</strong>
                    </span>
                  ) : null}
                  {v.color ? (
                    <span>
                      {t('color')}: <strong className="text-slate-800 dark:text-white">{v.color}</strong>
                    </span>
                  ) : null}
                  <span>
                    {t('sellingPrice')}:{' '}
                    <strong className="text-emerald-600">
                      {v.price
                        ? `${v.price.toLocaleString()}đ`
                        : commonPrice
                          ? `${parseInt(commonPrice, 10).toLocaleString()}đ`
                          : 'N/A'}
                    </strong>
                  </span>
                  {v.originalPriceCNY != null && (
                    <span className="text-slate-400">
                      <strong className="text-slate-800 dark:text-white">{v.originalPriceCNY}¥</strong>
                    </span>
                  )}
                  {v.weight != null && (
                    <span>
                      <Weight className="h-3 w-3 inline mr-0.5 text-slate-400" />
                      <strong className="text-slate-800 dark:text-white">{v.weight}kg</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalVariants > 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t('willCreateVariants', { count: totalVariants })}
        </div>
      )}
    </div>
  );
};
