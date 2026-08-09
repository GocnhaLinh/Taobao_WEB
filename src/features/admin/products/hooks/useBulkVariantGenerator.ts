import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { generateAutoSku } from '../../../../utils/skuHelper';
import { getFeeConfigApi } from '../../settings/api/settings.api';
import { uploadSingleImageApi, deleteImageApi } from '../../../../services/uploadService';
import { useNotification } from '../../../../lib/notification';
import type {
  VariantInput,
  UseBulkVariantGeneratorParams,
  UseBulkVariantGeneratorReturn,
} from '../types/bulk-variant.types';

const DIGITS_ONLY = /^[0-9]*$/;
const DECIMAL_INPUT = /^[0-9]*\.?[0-9]*$/;

export const useBulkVariantGenerator = ({
  isOpen,
  onSubmit,
  productId,
  categoryName,
  existingVariants: existingVariantsProp,
}: UseBulkVariantGeneratorParams): UseBulkVariantGeneratorReturn => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [sizePrices, setSizePrices] = useState<Record<string, string>>({});
  const [sizeOriginalPrices, setSizeOriginalPrices] = useState<Record<string, string>>({});
  const [sizeWeights, setSizeWeights] = useState<Record<string, string>>({});

  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [uploadingColors, setUploadingColors] = useState<Record<string, boolean>>({});

  const [commonPrice, setCommonPrice] = useState('');
  const [commonOriginalPriceCNY, setCommonOriginalPriceCNY] = useState('');
  const [commonWeight, setCommonWeight] = useState('');
  const [commonStock, setCommonStock] = useState('10');

  const [exchangeRate, setExchangeRate] = useState(0);
  const [shippingFeePerKg, setShippingFeePerKg] = useState(0);
  const [duplicateErrors, setDuplicateErrors] = useState<string[]>([]);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const resetForm = useCallback(() => {
    setSizes([]);
    setSizeInput('');
    setSizePrices({});
    setSizeOriginalPrices({});
    setSizeWeights({});
    setColors([]);
    setColorInput('');
    setColorImages({});
    setUploadingColors({});
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

  const allPricesSet = sizes.length > 0 && sizes.every((s) => !!sizePrices[s]);
  const allWeightsSet = sizes.length > 0 && sizes.every((s) => !!sizeWeights[s]);

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
      return p ? parseFloat(p) : commonPrice ? parseFloat(commonPrice) : undefined;
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
          list.push({
            size,
            color,
            sku: generateAutoSku(categoryName, size, color),
            price,
            originalPriceCNY,
            weight,
            image: getImage(color),
          });
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
        list.push({
          size: '',
          color,
          sku: generateAutoSku(categoryName, '', color),
          price,
          originalPriceCNY,
          weight,
          image: getImage(color),
        });
      }
    }

    return list;
  }, [
    sizes,
    colors,
    sizePrices,
    sizeOriginalPrices,
    sizeWeights,
    commonPrice,
    commonOriginalPriceCNY,
    commonWeight,
    categoryName,
    colorImages,
  ]);

  const sortSizes = useCallback((arr: string[]) => {
    const sizeOrder: Record<string, number> = {
      xs: 0, s: 1, m: 2, l: 3, xl: 4,
      '2xl': 5, xxl: 5, '3xl': 6, '4xl': 7, '5xl': 8,
    };
    return [...arr].sort((a, b) => {
      const al = a.toLowerCase();
      const bl = b.toLowerCase();
      const aOrder = sizeOrder[al];
      const bOrder = sizeOrder[bl];
      if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
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

  const sessionUploadedCloudinaryUrlsRef = useRef<Set<string>>(new Set());

  const removeColor = useCallback(async (color: string) => {
    setColors((prev) => prev.filter((c) => c !== color));
    const imgUrl = colorImages[color];
    setColorImages((prev) => {
      const next = { ...prev };
      delete next[color];
      return next;
    });
    delete fileInputRefs.current[color];

    if (imgUrl) {
      if (sessionUploadedCloudinaryUrlsRef.current.has(imgUrl)) {
        sessionUploadedCloudinaryUrlsRef.current.delete(imgUrl);
      }
      if (imgUrl.includes("cloudinary.com") || imgUrl.includes("res.cloudinary.com")) {
        try {
          await deleteImageApi(imgUrl);
          showNotification(t("imageCloudinaryDeleteSuccess"), "success");
        } catch (err) {
          console.warn("Image deletion failed:", err);
          showNotification(t("imageRemovedFromList"), "info");
        }
      } else {
        showNotification(t("imageDeleteSuccess"), "success");
      }
    }
  }, [colorImages, showNotification, t]);

  const handleUploadColorImage = useCallback(
    async (color: string, file: File) => {
      setUploadingColors((prev) => ({ ...prev, [color]: true }));
      try {
        const res = await uploadSingleImageApi(file);
        if (res?.url) {
          if (res.url.includes("cloudinary.com") || res.url.includes("res.cloudinary.com")) {
            sessionUploadedCloudinaryUrlsRef.current.add(res.url);
          }
          setColorImages((prev) => ({ ...prev, [color]: res.url }));
          showNotification(t("colorImageUploadSuccess", { color }), "success");
        }
      } catch (err: any) {
        showNotification(err.message || t("imageUploadFailed"), "error");
      } finally {
        setUploadingColors((prev) => ({ ...prev, [color]: false }));
      }
    },
    [showNotification, t]
  );

  const handleRemoveColorImage = useCallback(
    async (c: string) => {
      const imgUrl = colorImages[c];
      setColorImages((prev) => {
        const next = { ...prev };
        delete next[c];
        return next;
      });

      if (imgUrl) {
        if (sessionUploadedCloudinaryUrlsRef.current.has(imgUrl)) {
          sessionUploadedCloudinaryUrlsRef.current.delete(imgUrl);
        }
        if (imgUrl.includes("cloudinary.com") || imgUrl.includes("res.cloudinary.com")) {
          try {
            await deleteImageApi(imgUrl);
            showNotification(t("imageCloudinaryDeleteSuccess"), "success");
          } catch (err) {
            console.warn("Image deletion failed:", err);
            showNotification(t("imageRemovedFromList"), "info");
          }
        } else {
          showNotification(t("imageDeleteSuccess"), "success");
        }
      }
    },
    [colorImages, showNotification, t]
  );

  const hasUploadedImages = useCallback((): boolean => {
    return sessionUploadedCloudinaryUrlsRef.current.size > 0;
  }, []);

  const cleanupSessionImages = useCallback(async () => {
    const urls = Array.from(sessionUploadedCloudinaryUrlsRef.current);
    sessionUploadedCloudinaryUrlsRef.current.clear();
    if (urls.length > 0) {
      await Promise.all(
        urls.map((url) =>
          deleteImageApi(url).catch((err: any) =>
            console.warn("Failed to cleanup session image on cancel:", url, err)
          )
        )
      );
    }
  }, []);

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

  const checkDuplicates = useCallback(() => {
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const v of generatedVariants) {
      const comboKey = `${v.size || ''}|${v.color || ''}`;
      if (existingCombos.has(comboKey)) {
        errors.push(t('variantDuplicateExist', { size: v.size || 'N/A', color: v.color || 'N/A' }));
      }
      if (seen.has(comboKey) && v.size && v.color) {
        errors.push(t('variantDuplicateInList', { size: v.size, color: v.color }));
      }
      seen.add(comboKey);
    }
    setDuplicateErrors(errors);
    return errors.length === 0;
  }, [generatedVariants, existingCombos, t]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (generatedVariants.length === 0) return;

      if (!checkDuplicates()) {
        showNotification(t('duplicateVariantErrorNotice'), 'error');
        return;
      }

      sessionUploadedCloudinaryUrlsRef.current.clear();
      onSubmit({
        productId,
        common: {
          price: commonPrice ? parseFloat(commonPrice) : undefined,
          originalPriceCNY: parseFloat(commonOriginalPriceCNY) || null,
          weight: parseFloat(commonWeight) || null,
          stock: commonStock ? parseInt(commonStock, 10) : 10,
        },
        variants: generatedVariants.map((v) => ({
          size: v.size || undefined,
          color: v.color || undefined,
          sku: v.sku,
          price: v.price,
          originalPriceCNY: v.originalPriceCNY,
          weight: v.weight,
          image: v.image,
        })),
      });
    },
    [
      generatedVariants,
      checkDuplicates,
      showNotification,
      t,
      onSubmit,
      productId,
      commonPrice,
      commonOriginalPriceCNY,
      commonWeight,
      commonStock,
    ]
  );

  const totalVariants = generatedVariants.length;
  const hasSizeOrColor = sizes.length > 0 || colors.length > 0;

  const customCounts = useMemo(() => {
    const priceCount = Object.values(sizePrices).filter(Boolean).length;
    const cnyCount = Object.values(sizeOriginalPrices).filter(Boolean).length;
    const weightCount = Object.values(sizeWeights).filter(Boolean).length;
    return { priceCount, cnyCount, weightCount };
  }, [sizePrices, sizeOriginalPrices, sizeWeights]);

  const hideCommonPriceSection = sizes.length >= 2 && allPricesSet;

  return {
    t,
    sizes,
    sizeInput,
    setSizeInput,
    sizePrices,
    sizeOriginalPrices,
    sizeWeights,
    colors,
    colorInput,
    setColorInput,
    colorImages,
    setColorImages,
    commonPrice,
    setCommonPrice,
    commonOriginalPriceCNY,
    setCommonOriginalPriceCNY,
    commonWeight,
    setCommonWeight,
    commonStock,
    setCommonStock,
    exchangeRate,
    shippingFeePerKg,
    duplicateErrors,
    fileInputRefs,
    allPricesSet,
    allWeightsSet,
    rate,
    perKg,
    calcProfit,
    generatedVariants,
    addSize,
    removeSize,
    updateSizePrice,
    updateSizeOriginalPrice,
    updateSizeWeight,
    clearSizeCustomValues,
    addColor,
    removeColor,
    handleUploadColorImage,
    handleRemoveColorImage,
    handleSubmit,
    cleanupSessionImages,
    hasUploadedImages,
    totalVariants,
    hasSizeOrColor,
    customCounts,
    hideCommonPriceSection,
    uploadingColors,
    DIGITS_ONLY,
    DECIMAL_INPUT,
  };
};
