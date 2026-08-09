import type React from 'react';

export interface BulkVariantItemInput {
  size?: string;
  color?: string;
  sku: string;
  price?: number;
  originalPriceCNY?: number | null;
  weight?: number | null;
  stock?: number;
  image?: string;
}

export interface BulkCreateVariantsData {
  productId: string;
  common?: {
    price?: number;
    originalPriceCNY?: number | null;
    weight?: number | null;
    stock?: number;
    image?: string;
  };
  variants: BulkVariantItemInput[];
}

export interface BulkImageUpdateData {
  productId: string;
  color: string;
  image?: string;
  images?: string[];
}

export interface VariantInput {
  size?: string;
  color?: string;
  sku: string;
  price?: number;
  originalPriceCNY?: number | null;
  weight?: number | null;
  image?: string;
}

export interface BulkVariantGeneratorProps {
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

export interface UseBulkVariantGeneratorParams {
  isOpen: boolean;
  onClose?: () => void;
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
  productId: string;
  categoryName?: string;
  existingVariants?: { size?: string | null; color?: string | null; status?: string }[];
}

export interface ProfitCalcResult {
  price: number;
  cny: number;
  kg: number;
  shipCost: number;
  totalCost: number;
  profit: number;
  margin: string;
}

export interface CustomCounts {
  priceCount: number;
  cnyCount: number;
  weightCount: number;
}

export interface UseBulkVariantGeneratorReturn {
  t: (key: any, params?: any) => string;
  sizes: string[];
  sizeInput: string;
  setSizeInput: (val: string) => void;
  sizePrices: Record<string, string>;
  sizeOriginalPrices: Record<string, string>;
  sizeWeights: Record<string, string>;
  colors: string[];
  colorInput: string;
  setColorInput: (val: string) => void;
  colorImages: Record<string, string>;
  setColorImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  commonPrice: string;
  setCommonPrice: (val: string) => void;
  commonOriginalPriceCNY: string;
  setCommonOriginalPriceCNY: (val: string) => void;
  commonWeight: string;
  setCommonWeight: (val: string) => void;
  commonStock: string;
  setCommonStock: (val: string) => void;
  exchangeRate: number;
  shippingFeePerKg: number;
  duplicateErrors: string[];
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  allPricesSet: boolean;
  allWeightsSet: boolean;
  rate: number;
  perKg: number;
  calcProfit: (size: string) => ProfitCalcResult;
  generatedVariants: VariantInput[];
  addSize: () => void;
  removeSize: (size: string) => void;
  updateSizePrice: (size: string, raw: string) => void;
  updateSizeOriginalPrice: (size: string, raw: string) => void;
  updateSizeWeight: (size: string, raw: string) => void;
  clearSizeCustomValues: (size: string) => void;
  addColor: () => void;
  removeColor: (color: string) => void;
  handleUploadColorImage: (color: string, file: File) => Promise<void>;
  handleRemoveColorImage: (color: string) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
  cleanupSessionImages: () => Promise<void>;
  hasUploadedImages: () => boolean;
  totalVariants: number;
  hasSizeOrColor: boolean;
  customCounts: CustomCounts;
  hideCommonPriceSection: boolean;
  uploadingColors: Record<string, boolean>;
  DIGITS_ONLY: RegExp;
  DECIMAL_INPUT: RegExp;
}

export interface BulkVariantSystemBarProps {
  exchangeRate: number;
  shippingFeePerKg: number;
  duplicateErrors: string[];
}

export interface SizeColorConfigSectionProps {
  sizes: string[];
  sizeInput: string;
  setSizeInput: (val: string) => void;
  addSize: () => void;
  removeSize: (size: string) => void;
  colors: string[];
  colorInput: string;
  setColorInput: (val: string) => void;
  addColor: () => void;
  removeColor: (color: string) => void;
  colorImages: Record<string, string>;
  setColorImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  handleUploadColorImage: (color: string, file: File) => Promise<void>;
  handleRemoveColorImage: (color: string) => Promise<void>;
  uploadingColors?: Record<string, boolean>;
}

export interface SizePriceWeightTableProps {
  sizes: string[];
  sizePrices: Record<string, string>;
  sizeOriginalPrices: Record<string, string>;
  sizeWeights: Record<string, string>;
  commonPrice: string;
  commonOriginalPriceCNY: string;
  commonWeight: string;
  updateSizePrice: (size: string, raw: string) => void;
  updateSizeOriginalPrice: (size: string, raw: string) => void;
  updateSizeWeight: (size: string, raw: string) => void;
  clearSizeCustomValues: (size: string) => void;
  calcProfit: (size: string) => ProfitCalcResult;
  customCounts: CustomCounts;
}

export interface CommonValuesCalculatorProps {
  hideCommonPriceSection: boolean;
  commonPrice: string;
  setCommonPrice: (val: string) => void;
  commonOriginalPriceCNY: string;
  setCommonOriginalPriceCNY: (val: string) => void;
  allWeightsSet: boolean;
  commonWeight: string;
  setCommonWeight: (val: string) => void;
  commonStock: string;
  setCommonStock: (val: string) => void;
  perKg: number;
  rate: number;
  DIGITS_ONLY: RegExp;
  DECIMAL_INPUT: RegExp;
}

export interface VariantPreviewListProps {
  totalVariants: number;
  hasSizeOrColor: boolean;
  generatedVariants: VariantInput[];
  commonPrice: string;
}
