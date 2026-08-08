import type React from 'react';
import type { Product, ProductVariant, Category, Brand } from '../../../types';

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
