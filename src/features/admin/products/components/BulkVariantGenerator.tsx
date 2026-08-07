import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import {
  Plus,
  X,
  Package,
  Sparkles,
  TrendingUp,
  Calculator,
  AlertCircle,
  DollarSign,
  CheckCircle2,
  Weight,
  BarChart3,
  ArrowUpRight,
  Image,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { generateAutoSku } from '../../../../utils/skuHelper';
import { getFeeConfigApi } from '../../settings/api/settings.api';
import { uploadSingleImageApi } from '../../../../services/uploadService';
import { useNotification } from '../../../../lib/notification';

interface VariantInput {
  size?: string;
  color?: string;
  sku: string;
  price?: number;
  originalPriceCNY?: number | null;
  weight?: number | null;
  image?: string;
}

interface BulkVariantGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    productId: string;
    common: {
      price?: number;
      originalPriceCNY?: number | null;
      weight?: number | null;
      stock?: number;
    };
    variants: VariantInput[];
  }) => void;
  isLoading?: boolean;
  productId: string;
  categoryName?: string;
  /** Existing variants of the product to check for (size+color) duplicates */
  existingVariants?: { size?: string | null; color?: string | null; status?: string }[];
}

const DIGITS_ONLY = /^[0-9]*$/;
const DECIMAL_INPUT = /^[0-9]*\.?[0-9]*$/;

export const BulkVariantGenerator: React.FC<BulkVariantGeneratorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  productId,
  categoryName,
  existingVariants: existingVariantsProp,
}) => {
  const { t } = useTranslation();

  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [sizePrices, setSizePrices] = useState<Record<string, string>>({});
  const [sizeOriginalPrices, setSizeOriginalPrices] = useState<Record<string, string>>({});
  const [sizeWeights, setSizeWeights] = useState<Record<string, string>>({});

  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [colorImages, setColorImages] = useState<Record<string, string>>({});

  const [commonPrice, setCommonPrice] = useState('');
  const [commonOriginalPriceCNY, setCommonOriginalPriceCNY] = useState('');
  const [commonWeight, setCommonWeight] = useState('');
  const [commonStock, setCommonStock] = useState('10');

  const [exchangeRate, setExchangeRate] = useState(0);
  const [shippingFeePerKg, setShippingFeePerKg] = useState(0);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { showNotification } = useNotification();

  const resetForm = useCallback(() => {
    setSizes([]);
    setSizeInput('');
    setSizePrices({});
    setSizeOriginalPrices({});
    setSizeWeights({});
    setColors([]);
    setColorInput('');
    setColorImages({});
    setCommonPrice('');
    setCommonOriginalPriceCNY('');
    setCommonWeight('');
    setCommonStock('10');
    setDuplicateErrors([]);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    getFeeConfigApi()
      .then((cfg) => {
        if (cfg) {
          if (cfg.exchangeRate) setExchangeRate(cfg.exchangeRate);
          if (cfg.shippingCnPerKg) setShippingFeePerKg(cfg.shippingCnPerKg);
        }
      })
      .catch((err) => console.warn('Could not fetch fee config:', err));
  }, [isOpen, resetForm]);

  const allPricesSet = sizes.length > 0 && sizes.every(s => !!sizePrices[s]);
  const allWeightsSet = sizes.length > 0 && sizes.every(s => !!sizeWeights[s]);

  const rate = exchangeRate || 0;
  const perKg = shippingFeePerKg || 0;

  const calcProfit = useCallback(
    (size: string) => {
      const price = parseFloat(sizePrices[size]) || parseFloat(commonPrice) || 0;
      const cny = parseFloat(sizeOriginalPrices[size]) || parseFloat(commonOriginalPriceCNY) || 0;
      const kg = parseFloat(sizeWeights[size]) || parseFloat(commonWeight) || 0;
      const shipCost = Math.round(kg * perKg);
      const totalCost = cny > 0 && rate > 0 ? Math.round(cny * rate + shipCost) : 0;
      const profit = price > 0 ? Math.round(price - totalCost) : 0;
      const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';
      return { price, cny, kg, shipCost, totalCost, profit, margin };
    },
    [sizePrices, sizeOriginalPrices, sizeWeights, commonPrice, commonOriginalPriceCNY, commonWeight, rate, perKg]
  );

  const generatedVariants = useMemo(() => {
    const list: VariantInput[] = [];
    const hasSizes = sizes.length > 0;
    const hasColors = colors.length > 0;

    const getPrice = (size: string): number | undefined => {
      const p = sizePrices[size];
      return p ? parseFloat(p) : (commonPrice ? parseFloat(commonPrice) : undefined);
    };
    const getOriginalCNY = (size: string): number | null | undefined => {
      const c = sizeOriginalPrices[size];
      if (c && c.length > 0) return parseFloat(c);
      if (commonOriginalPriceCNY && commonOriginalPriceCNY.length > 0) return parseFloat(commonOriginalPriceCNY);
      return null;
    };
    const getWeight = (size: string): number | null | undefined => {
      const w = sizeWeights[size];
      if (w && w.length > 0) return parseFloat(w);
      if (commonWeight && commonWeight.length > 0) return parseFloat(commonWeight);
      return null;
    };
    const getImage = (color: string): string | undefined => {
      return colorImages[color] || undefined;
    };

    if (hasSizes && hasColors) {
      for (const size of sizes) {
        const price = getPrice(size);
        const originalPriceCNY = getOriginalCNY(size);
        const weight = getWeight(size);
        for (const color of colors) {
          list.push({ size, color, sku: generateAutoSku(categoryName, size, color), price, originalPriceCNY, weight, image: getImage(color) });
        }
      }
    } else if (hasSizes) {
      for (const size of sizes) {
        list.push({
          size,
          color: '',
          sku: generateAutoSku(categoryName, size, ''),
          price: getPrice(size),
          originalPriceCNY: getOriginalCNY(size),
          weight: getWeight(size),
        });
      }
    } else if (hasColors) {
      const price = commonPrice ? parseFloat(commonPrice) : undefined;
      const originalPriceCNY = commonOriginalPriceCNY ? parseFloat(commonOriginalPriceCNY) : null;
      const weight = commonWeight ? parseFloat(commonWeight) : null;
      for (const color of colors) {
        list.push({ size: '', color, sku: generateAutoSku(categoryName, '', color), price, originalPriceCNY, weight, image: getImage(color) });
      }
    }

    return list;
  }, [sizes, colors, sizePrices, sizeOriginalPrices, sizeWeights, commonPrice, commonOriginalPriceCNY, commonWeight, categoryName, colorImages]);

  // Size sort order: S < M < L < XL < 2XL < 3XL + numeric sizes ascending
  const sortSizes = useCallback((arr: string[]) => {
    const sizeOrder: Record<string, number> = {
      'xs': 0, 's': 1, 'm': 2, 'l': 3, 'xl': 4,
      '2xl': 5, 'xxl': 5, '3xl': 6, '4xl': 7, '5xl': 8,
    };
    return [...arr].sort((a, b) => {
      const al = a.toLowerCase();
      const bl = b.toLowerCase();
      const aOrder = sizeOrder[al];
      const bOrder = sizeOrder[bl];
      if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
      // Numeric sort for number sizes (e.g. 13, 15, 17)
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return al.localeCompare(bl);
    });
  }, []);

  const addSize = useCallback(() => {
    const trimmed = sizeInput.trim();
    if (trimmed && !sizes.includes(trimmed)) {
      const newSizes = sortSizes([...sizes, trimmed]);
      setSizes(newSizes);
      setSizePrices((prev) => ({ ...prev, [trimmed]: '' }));
      setSizeOriginalPrices((prev) => ({ ...prev, [trimmed]: '' }));
      setSizeWeights((prev) => ({ ...prev, [trimmed]: '' }));
      setSizeInput('');
    }
  }, [sizeInput, sizes, sortSizes]);

  const removeSize = useCallback((size: string) => {
    setSizes((prev) => prev.filter((s) => s !== size));
    setSizePrices((prev) => {
      const next = { ...prev };
      delete next[size];
      return next;
    });
    setSizeOriginalPrices((prev) => {
      const next = { ...prev };
      delete next[size];
      return next;
    });
    setSizeWeights((prev) => {
      const next = { ...prev };
      delete next[size];
      return next;
    });
  }, []);

  const updateSizePrice = useCallback((size: string, raw: string) => {
    if (!DIGITS_ONLY.test(raw)) return;
    setSizePrices((prev) => ({ ...prev, [size]: raw }));
  }, []);

  const updateSizeOriginalPrice = useCallback((size: string, raw: string) => {
    if (!DECIMAL_INPUT.test(raw)) return;
    setSizeOriginalPrices((prev) => ({ ...prev, [size]: raw }));
  }, []);

  const updateSizeWeight = useCallback((size: string, raw: string) => {
    if (!DECIMAL_INPUT.test(raw)) return;
    setSizeWeights((prev) => ({ ...prev, [size]: raw }));
  }, []);

  const clearSizeCustomValues = useCallback((size: string) => {
    setSizePrices((prev) => ({ ...prev, [size]: '' }));
    setSizeOriginalPrices((prev) => ({ ...prev, [size]: '' }));
    setSizeWeights((prev) => ({ ...prev, [size]: '' }));
  }, []);

  const addColor = useCallback(() => {
    const trimmed = colorInput.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors((prev) => [...prev, trimmed]);
      setColorInput('');
    }
  }, [colorInput, colors]);

  const removeColor = useCallback((color: string) => {
    setColors((prev) => prev.filter((c) => c !== color));
    setColorImages((prev) => {
      const next = { ...prev };
      delete next[color];
      return next;
    });
    // Clean up file input ref
    delete fileInputRefs.current[color];
  }, []);

  // Build existing combos from passed existingVariants prop
  const existingCombos = useMemo(() => {
    const combos = new Set<string>();
    const ev = existingVariantsProp || [];
    if (ev.length > 0) {
      ev.forEach((v: any) => {
        if (v.status !== 'DELETED') {
          combos.add(`${v.size || ''}|${v.color || ''}`);
        }
      });
    }
    return combos;
  }, [existingVariantsProp]);

  const [duplicateErrors, setDuplicateErrors] = useState<string[]>([]);

  // Check for duplicates in generated variants vs existing combos
  const checkDuplicates = useCallback(() => {
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const v of generatedVariants) {
      const comboKey = `${v.size || ''}|${v.color || ''}`;
      if (existingCombos.has(comboKey)) {
        errors.push(`(Size: "${v.size || 'N/A'}", Màu: "${v.color || 'N/A'}") đã tồn tại!`);
      }
      if (seen.has(comboKey) && v.size && v.color) {
        errors.push(`(Size: "${v.size}", Màu: "${v.color}") bị trùng trong danh sách!`);
      }
      seen.add(comboKey);
    }
    setDuplicateErrors(errors);
    return errors.length === 0;
  }, [generatedVariants, existingCombos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generatedVariants.length === 0) return;

    if (!checkDuplicates()) {
      showNotification('⚠️ Có biến thể bị trùng! Vui lòng kiểm tra lại.', 'error');
      return;
    }

    onSubmit({
      productId,
      common: {
        price: commonPrice ? parseFloat(commonPrice) : undefined,
        originalPriceCNY: parseFloat(commonOriginalPriceCNY) || null,
        weight: parseFloat(commonWeight) || null,
        stock: commonStock ? parseInt(commonStock, 10) : 10,
      },
      variants: generatedVariants.map(v => ({
        size: v.size || undefined,
        color: v.color || undefined,
        sku: v.sku,
        price: v.price,
        originalPriceCNY: v.originalPriceCNY,
        weight: v.weight,
        image: v.image,
      })),
    });
  };

  const totalVariants = generatedVariants.length;
  const hasSizeOrColor = sizes.length > 0 || colors.length > 0;

  const customCounts = useMemo(() => {
    const priceCount = Object.values(sizePrices).filter(Boolean).length;
    const cnyCount = Object.values(sizeOriginalPrices).filter(Boolean).length;
    const weightCount = Object.values(sizeWeights).filter(Boolean).length;
    return { priceCount, cnyCount, weightCount };
  }, [sizePrices, sizeOriginalPrices, sizeWeights]);

  const hideCommonPriceSection = sizes.length >= 2 && allPricesSet;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('bulkVariantTitle') || '📊 Create Bulk Variants'}
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            onClick={handleSubmit}
            disabled={totalVariants === 0}
            className="flex items-center gap-1.5"
          >
            <Package className="h-4 w-4" />
            {t('bulkCreateVariantsBtn', { count: totalVariants })}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* System info bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-200/30 dark:border-indigo-700/20 rounded-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t('exchangeRate')}:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white">{exchangeRate > 0 ? exchangeRate.toLocaleString('vi-VN') : '—'}</span>
            <span className="text-slate-400">/ 1¥ CNY</span>
          </span>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t('shippingCnFee')}:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white">{shippingFeePerKg > 0 ? shippingFeePerKg.toLocaleString('vi-VN') : '—'}</span>
            <span className="text-slate-400">/ kg</span>
          </span>
          <span className="ml-auto text-[11px] text-slate-400 italic">{t('autoFromSystem')}</span>
        </div>

        {/* Duplicate errors banner */}
        {duplicateErrors.length > 0 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/30 rounded-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              ⚠️ Biến thể bị trùng ({duplicateErrors.length})
            </p>
            {duplicateErrors.map((err, i) => (
              <p key={i} className="text-[11px] text-rose-600 dark:text-rose-400 pl-6">{err}</p>
            ))}
          </div>
        )}

        {/* Size & Color */}
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
                {colors.map((c) => (
                  <div key={c} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 w-12 shrink-0">{c}</span>
                    <input
                      type="file"
                      ref={(el) => { fileInputRefs.current[c] = el; }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const res = await uploadSingleImageApi(file);
                          if (res?.url) {
                            setColorImages((prev) => ({ ...prev, [c]: res.url }));
                            showNotification(`📸 Ảnh màu "${c}" đã tải lên!`, 'success');
                          }
                        } catch (err: any) {
                          showNotification(err.message || 'Upload thất bại', 'error');
                        }
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
                      className="shrink-0 p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors cursor-pointer"
                      title="Tải ảnh lên"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    {colorImages[c] && (
                      <button
                        type="button"
                        onClick={() => setColorImages((prev) => {
                          const next = { ...prev };
                          delete next[c];
                          return next;
                        })}
                        className="shrink-0 p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                        title="Xóa ảnh"
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price & Weight per-size table */}
        {sizes.length > 0 && (
          <div className="p-4 bg-white dark:bg-slate-900/50 border border-indigo-200/40 dark:border-indigo-700/30 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 shrink-0" />
                {t('priceAndWeightBySize')}
              </h4>
              <span className="text-[10px] text-slate-400">
                {customCounts.priceCount > 0 || customCounts.cnyCount > 0 || customCounts.weightCount > 0
                  ? t('customCountsFormat', { priceCount: customCounts.priceCount, cnyCount: customCounts.cnyCount, weightCount: customCounts.weightCount, total: sizes.length })
                  : t('allUsingCommon')}
              </span>
            </div>

            <div className="hidden sm:grid sm:grid-cols-[5.5rem,1fr,1fr,1fr,5rem] sm:gap-3 items-center text-[11px] text-slate-400 dark:text-slate-400 font-semibold tracking-wider pb-1 border-b border-slate-100 dark:border-white/5">
              <div className="text-center font-bold text-slate-500 dark:text-slate-400">{t('sizeColumn')}</div>
              <div className="px-1 text-slate-600 dark:text-slate-300 font-semibold">{t('sellingPriceColumn')}</div>
              <div className="px-1 text-slate-600 dark:text-slate-300 font-semibold">{t('originCostColumn')}</div>
              <div className="px-1 text-slate-600 dark:text-slate-300 font-semibold">{t('weightColumn')}</div>
              <div className="text-right text-slate-400 font-medium">{t('statusColumn')}</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {sizes.map((size) => {
                const hasPrice = !!sizePrices[size];
                const hasCNY = !!sizeOriginalPrices[size];
                const hasWeight = !!sizeWeights[size];
                const isCustom = hasPrice || hasCNY || hasWeight;
                const p = calcProfit(size);
                const hasProfitData = p.cny > 0 && p.price > 0;

                return (
                  <div key={size} className="py-2.5">
                    <div className="flex flex-col sm:grid sm:grid-cols-[5.5rem,1fr,1fr,1fr,5rem] gap-2 sm:gap-3 items-center transition-colors">
                      <div className="min-w-0 flex items-center justify-center">
                        <span className="inline-block px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold whitespace-nowrap">
                          {size}
                        </span>
                      </div>

                      <div className="w-full">
                        <label className="block sm:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('sellingPriceColumn')}</label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={sizePrices[size] ?? ''}
                          onChange={(e) => updateSizePrice(size, e.target.value)}
                          placeholder={commonPrice ? `${t('defaultPrefix')}: ${parseInt(commonPrice).toLocaleString('vi-VN')}đ` : t('enterPrice')}
                          currency={hasPrice}
                        />
                      </div>

                      <div className="w-full">
                        <label className="block sm:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('originCostColumn')}</label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={sizeOriginalPrices[size] ?? ''}
                          onChange={(e) => updateSizeOriginalPrice(size, e.target.value)}
                          placeholder={commonOriginalPriceCNY ? `${t('defaultPrefix')}: ${commonOriginalPriceCNY}¥` : t('enterCNY')}
                        />
                      </div>

                      <div className="w-full">
                        <label className="block sm:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('weightColumn')}</label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={sizeWeights[size] ?? ''}
                          onChange={(e) => updateSizeWeight(size, e.target.value)}
                          placeholder={commonWeight ? `${t('defaultPrefix')}: ${commonWeight}kg` : t('enterWeight')}
                        />
                      </div>

                      <div className="flex items-center gap-1.5 justify-end self-center w-full">
                        {isCustom ? (
                          <>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {t('set')}
                            </span>
                            <button
                              type="button"
                              onClick={() => clearSizeCustomValues(size)}
                              className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title={t('clearCustomValues')}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic whitespace-nowrap">
                            {t('usingCommon')}
                          </span>
                        )}
                      </div>

                      {hasProfitData && (
                        <div className="sm:col-start-2 sm:col-span-4 mt-1.5 sm:mt-0">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5 border border-emerald-200/30 dark:border-emerald-700/20 rounded-xl text-xs">
                          <span className="flex items-center gap-1 text-slate-500">
                            <BarChart3 className="h-3 w-3" />
                            {t('costLabel')}:
                            <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                              {p.totalCost.toLocaleString('vi-VN')}đ
                            </strong>
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <ArrowUpRight className="h-3 w-3" />
                            {t('estimatedProfit')}:
                            <strong className={`font-bold ${p.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {p.profit >= 0 ? '+' : ''}{p.profit.toLocaleString('vi-VN')}đ
                            </strong>
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
                          <Badge
                            variant={
                              parseFloat(p.margin) >= 30
                                ? 'success'
                                : parseFloat(p.margin) > 0
                                  ? 'info'
                                  : 'danger'
                            }
                            className="text-[10px]"
                          >
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                            {t('profitRate', { margin: p.margin })}
                          </Badge>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Common Values & Profit calculator */}
        <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Calculator className="h-4 w-4" />
              {t('commonValuesAndProfit')}
            </h4>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {hideCommonPriceSection ? (
              <div className="flex items-center justify-center p-3 bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-700/30 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" />
                <span>{t('allSizesHavePrice')}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Input
                  label={t('commonPriceLabel')}
                  type="text"
                  inputMode="numeric"
                  value={commonPrice}
                  onChange={(e) => {
                    if (DIGITS_ONLY.test(e.target.value)) setCommonPrice(e.target.value);
                  }}
                  placeholder="250000"
                  currency={!!commonPrice}
                />
                <p className="px-1 text-[10px] text-slate-400 italic">
                  {t('commonPriceDesc')}
                </p>
              </div>
            )}
            <Input
              label={t('commonOriginCostLabel')}
              type="text"
              inputMode="decimal"
              value={commonOriginalPriceCNY}
              onChange={(e) => setCommonOriginalPriceCNY(e.target.value)}
              placeholder="45"
            />
            {allWeightsSet ? (
              <div className="flex items-center justify-center p-3 bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-700/30 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" />
                <span>{t('allSizesHaveWeight')}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Input
                  label={t('commonWeightLabel')}
                  type="text"
                  inputMode="decimal"
                  value={commonWeight}
                  onChange={(e) => {
                    if (DECIMAL_INPUT.test(e.target.value)) setCommonWeight(e.target.value);
                  }}
                  placeholder="0.3"
                />
                <p className="px-1 text-[10px] text-slate-400 italic">
                  {t('commonWeightDesc')}
                </p>
              </div>
            )}
            <Input
              label={t('stock')}
              type="number"
              value={commonStock}
              onChange={(e) => setCommonStock(e.target.value)}
              placeholder="10"
            />
          </div>

            {/* Profit Card */}
            {parseFloat(commonOriginalPriceCNY) > 0 && (
              <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">{t('shippingFeeCalc')}</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-xs">
                    {(Math.round((parseFloat(commonWeight) || 0) * perKg)).toLocaleString()} đ ({parseFloat(commonWeight) || 0}kg)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">{t('totalLandingCost')}</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    {(Math.round((parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg)).toLocaleString()} đ
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">{t('estimatedProfit')}</span>
                  <strong className={`font-bold text-xs ${
                    (parseFloat(commonPrice) || 0) - Math.round((parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg) >= 0
                      ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {(() => {
                      const sp = parseFloat(commonPrice) || 0;
                      const cp = Math.round((parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg);
                      const p = sp - cp;
                      return `${p >= 0 ? '+' : ''}${p.toLocaleString()} đ`;
                    })()}
                  </strong>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant={
                      (() => {
                        const sp = parseFloat(commonPrice) || 0;
                        const cp = Math.round((parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg);
                        const p = sp - cp;
                        const m = sp > 0 ? (p / sp) * 100 : 0;
                        return m >= 30 ? 'success' : m > 0 ? 'info' : 'danger';
                      })()
                    }
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {t('profitRate', { margin: (() => {
                      const sp = parseFloat(commonPrice) || 0;
                      const cp = Math.round((parseFloat(commonOriginalPriceCNY) || 0) * rate + (parseFloat(commonWeight) || 0) * perKg);
                      const p = sp - cp;
                      return sp > 0 ? ((p / sp) * 100).toFixed(1) : '0';
                    })() })}
                  </Badge>
                </div>
              </div>
            )}
            {parseFloat(commonOriginalPriceCNY) === 0 && (parseFloat(commonPrice) || 0) > 0 && (
              <div className="p-2 text-xs text-slate-500 italic">
                {t('enterOriginCostHint')}
              </div>
            )}
          </div>

        {/* Preview */}
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
              <span className="text-[10px] text-slate-400 mt-1 block">
                {t('sizeColorTip')}
              </span>
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
                      <img src={v.image} alt={v.sku} className="h-6 w-6 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0" />
                    )}
                    <Badge variant="neutral" className="font-mono text-[10px] truncate max-w-full sm:max-w-[180px]">{v.sku}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs pl-8 sm:pl-0">
                    {v.size ? <span>{t('size')}: <strong className="text-slate-800 dark:text-white">{v.size}</strong></span> : null}
                    {v.color ? <span>{t('color')}: <strong className="text-slate-800 dark:text-white">{v.color}</strong></span> : null}
                    <span>{t('sellingPrice')}: <strong className="text-emerald-600">
                      {v.price ? `${v.price.toLocaleString()}đ` : commonPrice ? `${parseInt(commonPrice).toLocaleString()}đ` : 'N/A'}
                    </strong></span>
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
      </form>
    </Modal>
  );
};

