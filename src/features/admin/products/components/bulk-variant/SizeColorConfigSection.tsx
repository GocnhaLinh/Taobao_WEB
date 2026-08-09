import React from 'react';
import { Plus, X, Image, Upload, Loader2 } from 'lucide-react';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { useTranslation } from '../../../../../lib/i18n';
import type { SizeColorConfigSectionProps } from '../../types/bulk-variant.types';

export const SizeColorConfigSection: React.FC<SizeColorConfigSectionProps> = ({
  sizes,
  sizeInput,
  setSizeInput,
  addSize,
  removeSize,
  colors,
  colorInput,
  setColorInput,
  addColor,
  removeColor,
  colorImages,
  setColorImages,
  fileInputRefs,
  handleUploadColorImage,
  handleRemoveColorImage,
  uploadingColors,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Sizes */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {t('sizeLabel')} <span className="text-slate-400 font-normal normal-case">({t('optional')})</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
          {sizes.map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(size)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {sizes.length === 0 && (
            <span className="text-[11px] text-slate-400 italic">{t('noSizesHint')}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder={t('sizePlaceholder')}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addSize} className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {t('colorLabel')} <span className="text-slate-400 font-normal normal-case">({t('optional')})</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
          {colors.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold"
            >
              {color}
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {colors.length === 0 && (
            <span className="text-[11px] text-slate-400 italic">{t('noColorsHint')}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder={t('colorPlaceholder')}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addColor} className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Color images with file upload */}
        {colors.length > 0 && (
          <div className="mt-2 space-y-2 p-3 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/40 dark:border-purple-700/20 rounded-xl">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5" />
              {t('colorImagesTitle')}
            </h4>
            {colors.map((c) => {
              const isUploadingThisColor = uploadingColors?.[c];
              return (
                <div key={c} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 w-12 shrink-0">{c}</span>
                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[c] = el;
                    }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handleUploadColorImage(c, file);
                      if (e.target) e.target.value = '';
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <Input
                    value={colorImages[c] ?? ''}
                    onChange={(e) => setColorImages((prev) => ({ ...prev, [c]: e.target.value }))}
                    placeholder={t('colorImageUrlPlaceholder', { color: c })}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[c]?.click()}
                    disabled={isUploadingThisColor}
                    className={`shrink-0 p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isUploadingThisColor
                        ? 'bg-purple-200 dark:bg-purple-800 text-purple-600 dark:text-purple-300 cursor-wait'
                        : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800'
                    }`}
                    title={isUploadingThisColor ? 'Đang nén & tải ảnh...' : 'Tải ảnh lên'}
                  >
                    {isUploadingThisColor ? (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-300" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </button>
                {colorImages[c] && (
                  <button
                    type="button"
                    onClick={() => handleRemoveColorImage(c)}
                    className="shrink-0 p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                    title={t('deleteImage') || 'Xóa ảnh'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {colorImages[c] && (
                  <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-purple-200 dark:border-purple-700">
                    <img src={colorImages[c]} alt={c} className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
