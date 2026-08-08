import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../../../../lib/i18n';
import { useNotification } from '../../../../lib/notification';
import { useConfirm } from '../../../../hooks/useConfirm';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useManualRefresh } from '../../../../hooks/useManualRefresh';
import type { Product, ProductVariant } from '../../../../types';
import type { BulkCreateVariantsData, UseProductsReturn } from '../types';
import {
  fetchProductsApi,
  fetchDeletedProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  createVariantApi,
  updateVariantApi,
  deleteVariantApi,
  bulkCreateVariantsApi,
  updateVariantStatusApi,
} from '../api/product.api';
import { fetchCategories } from '../../categories/api/category.api';
import { fetchBrands } from '../../brands/api/brand.api';
import { calculateProductMetrics, filterProducts } from '../utils/product.utils';

export const useProducts = (): UseProductsReturn => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const { confirm, ConfirmDialog } = useConfirm();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DELETED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [targetProductId, setTargetProductId] = useState('');

  const [isBulkVariantModalOpen, setIsBulkVariantModalOpen] = useState(false);
  const [bulkVariantProductId, setBulkVariantProductId] = useState('');
  const [bulkVariantCategoryName, setBulkVariantCategoryName] = useState<string | undefined>();

  // Queries
  const {
    data: rawActiveProducts = [],
    isLoading: isLoadingActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: fetchProductsApi,
  });

  const {
    data: rawDeletedProducts = [],
    isLoading: isLoadingDeleted,
    refetch: refetchDeleted,
  } = useQuery({
    queryKey: ['products', 'deleted'],
    queryFn: fetchDeletedProductsApi,
    enabled: activeTab === 'DELETED',
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [queryClient]);

  const { isRefreshing, handleRefresh } = useManualRefresh(async () => {
    await Promise.all([refetchActive(), refetchDeleted()]);
  }, 1000);

  const activeProducts = useMemo(() => {
    return filterProducts(rawActiveProducts, debouncedSearch);
  }, [rawActiveProducts, debouncedSearch]);

  const deletedProducts = useMemo(() => {
    return filterProducts(rawDeletedProducts, debouncedSearch);
  }, [rawDeletedProducts, debouncedSearch]);

  const metrics = useMemo(() => {
    return calculateProductMetrics(rawActiveProducts, rawDeletedProducts);
  }, [rawActiveProducts, rawDeletedProducts]);

  // Product Mutations
  const createProductMutation = useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('productAddedSuccess'), 'success');
      setIsProductModalOpen(false);
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || t('productAddedFailed'), 'error');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProductApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('productUpdatedSuccess'), 'success');
      setIsProductModalOpen(false);
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || t('productUpdatedFailed'), 'error');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductApi(id, true),
    onSuccess: () => {
      refreshAll();
      showNotification(t('productDeleted'), 'success');
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Error deleting product', 'error');
    },
  });

  const restoreProductMutation = useMutation({
    mutationFn: (id: string) => updateProductApi({ id, status: 'ACTIVE' }),
    onSuccess: () => {
      refreshAll();
      showNotification(t('productRestored'), 'success');
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Error restoring product', 'error');
    },
  });

  const forceDeleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductApi(id, false),
    onSuccess: () => {
      refreshAll();
      showNotification(t('productForceDeleted'), 'success');
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Error permanently deleting product', 'error');
    },
  });

  // Variant Mutations
  const createVariantMutation = useMutation({
    mutationFn: createVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('variantAdded'), 'success');
      setIsVariantModalOpen(false);
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Error adding variant', 'error');
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: updateVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('variantUpdated'), 'success');
      setIsVariantModalOpen(false);
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Error updating variant', 'error');
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: deleteVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('variantDeleted'), 'success');
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Error deleting variant', 'error');
    },
  });

  const bulkCreateVariantMutation = useMutation({
    mutationFn: bulkCreateVariantsApi,
    onSuccess: (res) => {
      refreshAll();
      showNotification(`Đã tạo ${res.count} biến thể thành công!`, 'success');
      setIsBulkVariantModalOpen(false);
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Lỗi khi tạo biến thể hàng loạt', 'error');
    },
  });

  const inlineUpdateVariantMutation = useMutation({
    mutationFn: (data: { id: string } & Partial<ProductVariant>) => updateVariantApi(data),
    onSuccess: () => {
      refreshAll();
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Lỗi khi cập nhật biến thể', 'error');
    },
  });

  const toggleVariantStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateVariantStatusApi(id, status),
    onSuccess: () => {
      refreshAll();
    },
    onError: (err: { message?: string }) => {
      showNotification(err.message || 'Lỗi khi đổi trạng thái biến thể', 'error');
    },
  });

  // Handlers
  const handleOpenAddProduct = useCallback(() => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  }, []);

  const handleOpenEditProduct = useCallback((p: Product) => {
    setEditingProduct(p);
    setIsProductModalOpen(true);
  }, []);

  const handleProductSubmit = useCallback(
    (data: Partial<Product>) => {
      if (editingProduct) {
        updateProductMutation.mutate({ id: editingProduct.id, ...data });
      } else {
        createProductMutation.mutate(data);
      }
    },
    [editingProduct, updateProductMutation, createProductMutation]
  );

  const handleDeleteProductRequest = useCallback(
    async (p: Product) => {
      const isConfirmed = await confirm({
        title: 'Chuyển sản phẩm vào thùng rác',
        description: `Bạn có chắc chắn muốn chuyển sản phẩm "${p.productName}" vào thùng rác?`,
        confirmText: 'Chuyển vào Thùng rác',
      });
      if (isConfirmed) {
        deleteProductMutation.mutate(p.id);
      }
    },
    [confirm, deleteProductMutation]
  );

  const handleRestoreProductRequest = useCallback(
    async (p: Product) => {
      const isConfirmed = await confirm({
        title: 'Khôi phục sản phẩm',
        description: `Khôi phục "${p.productName}" về danh sách đang bán?`,
        confirmText: 'Khôi phục',
      });
      if (isConfirmed) {
        restoreProductMutation.mutate(p.id);
      }
    },
    [confirm, restoreProductMutation]
  );

  const handleForceDeleteProductRequest = useCallback(
    async (p: Product) => {
      const isConfirmed = await confirm({
        title: 'Xóa vĩnh viễn sản phẩm',
        description: `Hành động này không thể hoàn tác. Bạn có chắc muốn xóa vĩnh viễn "${p.productName}"?`,
        confirmText: 'Xóa vĩnh viễn',
      });
      if (isConfirmed) {
        forceDeleteProductMutation.mutate(p.id);
      }
    },
    [confirm, forceDeleteProductMutation]
  );

  const handleOpenAddVariant = useCallback((productId: string) => {
    setTargetProductId(productId);
    setEditingVariant(null);
    setIsVariantModalOpen(true);
  }, []);

  const handleOpenEditVariant = useCallback((productId: string, v: ProductVariant) => {
    setTargetProductId(productId);
    setEditingVariant(v);
    setIsVariantModalOpen(true);
  }, []);

  const handleVariantSubmit = useCallback(
    (data: Partial<ProductVariant>) => {
      if (editingVariant) {
        updateVariantMutation.mutate({ id: editingVariant.id, ...data });
      } else {
        createVariantMutation.mutate({ productId: targetProductId, ...data });
      }
    },
    [editingVariant, targetProductId, updateVariantMutation, createVariantMutation]
  );

  const handleDeleteVariantRequest = useCallback(
    async (v: ProductVariant) => {
      const isConfirmed = await confirm({
        title: 'Xóa biến thể',
        description: `Bạn có chắc muốn xóa biến thể SKU "${v.sku}"?`,
        confirmText: 'Xóa biến thể',
      });
      if (isConfirmed) {
        deleteVariantMutation.mutate(v.id);
      }
    },
    [confirm, deleteVariantMutation]
  );

  const handleToggleVariantStatus = useCallback(
    (variantId: string, currentStatus: string) => {
      const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      toggleVariantStatusMutation.mutate({ id: variantId, status: nextStatus });
    },
    [toggleVariantStatusMutation]
  );

  const handleInlineUpdateVariant = useCallback(
    (id: string, data: Partial<ProductVariant>) => {
      inlineUpdateVariantMutation.mutate({ id, ...data });
    },
    [inlineUpdateVariantMutation]
  );

  const handleOpenBulkVariant = useCallback((productId: string, categoryName?: string) => {
    setBulkVariantProductId(productId);
    setBulkVariantCategoryName(categoryName);
    setIsBulkVariantModalOpen(true);
  }, []);

  const handleBulkVariantSubmit = useCallback(
    (data: BulkCreateVariantsData) => {
      bulkCreateVariantMutation.mutate(data);
    },
    [bulkCreateVariantMutation]
  );

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    activeProducts,
    deletedProducts,
    categories,
    brands,
    metrics,
    isLoading: activeTab === 'ACTIVE' ? isLoadingActive : isLoadingDeleted,
    isRefreshing,
    handleRefresh,
    refreshAll,

    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    setEditingProduct,
    detailProduct,
    setDetailProduct,

    isVariantModalOpen,
    setIsVariantModalOpen,
    editingVariant,
    setEditingVariant,
    targetProductId,
    setTargetProductId,

    isBulkVariantModalOpen,
    setIsBulkVariantModalOpen,
    bulkVariantProductId,
    setBulkVariantProductId,
    bulkVariantCategoryName,
    setBulkVariantCategoryName,

    handleOpenAddProduct,
    handleOpenEditProduct,
    handleProductSubmit,
    handleDeleteProductRequest,
    handleRestoreProductRequest,
    handleForceDeleteProductRequest,

    handleOpenAddVariant,
    handleOpenEditVariant,
    handleVariantSubmit,
    handleDeleteVariantRequest,
    handleToggleVariantStatus,
    handleInlineUpdateVariant,

    handleOpenBulkVariant,
    handleBulkVariantSubmit,

    ConfirmDialog,
  };
};
