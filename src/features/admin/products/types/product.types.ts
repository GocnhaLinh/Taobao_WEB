import type React from 'react';
import type { Product, ProductVariant, Category, Brand } from '../../../../types';
import type { BulkCreateVariantsData } from './bulk-variant.types';

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  outOfStockCount: number;
  deletedProductsCount: number;
  totalVariantsCount: number;
}

export interface UseProductsReturn {
  activeTab: 'ACTIVE' | 'DELETED';
  setActiveTab: (tab: 'ACTIVE' | 'DELETED') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeProducts: Product[];
  deletedProducts: Product[];
  categories: Category[];
  brands: Brand[];
  metrics: ProductMetrics;
  isLoading: boolean;
  isRefreshing: boolean;
  handleRefresh: () => Promise<void>;
  refreshAll: () => void;
  
  // Modals State
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  detailProduct: Product | null;
  setDetailProduct: (product: Product | null) => void;
  
  isVariantModalOpen: boolean;
  setIsVariantModalOpen: (open: boolean) => void;
  editingVariant: ProductVariant | null;
  setEditingVariant: (variant: ProductVariant | null) => void;
  targetProductId: string;
  setTargetProductId: (id: string) => void;

  isBulkVariantModalOpen: boolean;
  setIsBulkVariantModalOpen: (open: boolean) => void;
  bulkVariantProductId: string;
  setBulkVariantProductId: (id: string) => void;
  bulkVariantCategoryName: string | undefined;
  setBulkVariantCategoryName: (name: string | undefined) => void;

  // Event Handlers & Mutations
  handleOpenAddProduct: () => void;
  handleOpenEditProduct: (p: Product) => void;
  handleProductSubmit: (data: Partial<Product>) => void;
  handleDeleteProductRequest: (p: Product) => Promise<void>;
  handleRestoreProductRequest: (p: Product) => Promise<void>;
  handleForceDeleteProductRequest: (p: Product) => Promise<void>;
  
  handleOpenAddVariant: (productId: string) => void;
  handleOpenEditVariant: (productId: string, v: ProductVariant) => void;
  handleVariantSubmit: (data: Partial<ProductVariant>) => void;
  handleDeleteVariantRequest: (v: ProductVariant) => Promise<void>;
  handleToggleVariantStatus: (variantId: string, currentStatus: string) => void;
  handleInlineUpdateVariant: (id: string, data: Partial<ProductVariant>) => void;

  handleOpenBulkVariant: (productId: string, categoryName?: string) => void;
  handleBulkVariantSubmit: (data: BulkCreateVariantsData) => void;

  ConfirmDialog: React.ReactNode;
}

export interface ProductCardProps {
  product: Product;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (p: Product) => void;
  onAddVariant: (productId: string) => void;
  onEditVariant: (v: ProductVariant) => void;
  onDeleteVariant: (v: ProductVariant) => void;
  onToggleVariant?: (v: ProductVariant) => void;
  onBulkAddVariant?: (productId: string) => void;
  onViewDetail?: (p: Product) => void;
  isDeletedTab?: boolean;
  onRestoreProduct?: (p: Product) => void;
  onForceDeleteProduct?: (p: Product) => void;
}

export interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEditProduct?: (p: Product) => void;
  onAddVariant?: (productId: string) => void;
  onEditVariant?: (v: ProductVariant) => void;
  onBulkAddVariant?: (productId: string) => void;
  onInlineUpdateVariant?: (id: string, data: Partial<ProductVariant>) => void;
  onToggleVariant?: (v: ProductVariant) => void;
}

export interface ProductFilterProps {
  activeTab: 'ACTIVE' | 'DELETED';
  setActiveTab: (tab: 'ACTIVE' | 'DELETED') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCount: number;
  deletedCount: number;
}

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  editingProduct?: Product | null;
  categories: Category[];
  brands: Brand[];
}

export interface ProductStatCardsProps {
  metrics: ProductMetrics;
}

export interface VariantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  editingVariant?: ProductVariant | null;
  productId: string;
  categoryName?: string;
  /** Existing variants of the product to check for (size+color) duplicates */
  existingVariants?: ProductVariant[];
}

export interface ProfitCalculatorValues {
  originalPriceCNY: string;
  exchangeRate: string;
  weight: string;
  shippingFeePerKg: string;
  price: string;
}

export interface VariantProfitCalculatorProps {
  values: ProfitCalculatorValues;
  onChange: (field: keyof ProfitCalculatorValues, value: string) => void;
  className?: string;
}

export interface UseVariantFormModalParams {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingVariant?: ProductVariant | null;
  productId: string;
  categoryName?: string;
  existingVariants?: ProductVariant[];
}

export interface UseVariantFormModalReturn {
  t: (key: any, params?: any) => string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  sku: string;
  setSku: (val: string) => void;
  size: string;
  setSize: (val: string) => void;
  color: string;
  setColor: (val: string) => void;
  stock: string;
  setStock: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  originalPriceCNY: string;
  setOriginalPriceCNY: (val: string) => void;
  exchangeRate: string;
  setExchangeRate: (val: string) => void;
  weight: string;
  setWeight: (val: string) => void;
  shippingFeePerKg: string;
  setShippingFeePerKg: (val: string) => void;
  image: string;
  setImage: (val: string) => void;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  isUploading: boolean;
  applyImageToSameColor: boolean;
  setApplyImageToSameColor: (val: boolean) => void;
  duplicateComboError: string | null;
  setDuplicateComboError: (val: string | null) => void;
  cleanupSessionImages: () => Promise<void>;
  hasUploadedImages: () => boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRemoveImage: (urlToRemove: string) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
}
