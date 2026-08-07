import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Search, RefreshCw, Clock, Archive } from "lucide-react";
import { useTranslation } from "../../../lib/i18n";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useNotification } from "../../../lib/notification";
import { useConfirm } from "../../../hooks/useConfirm";
import { useDebounce } from "../../../hooks/useDebounce";
import { ProductCard } from "./components/ProductCard";

const ProductFormModal = React.lazy(() =>
  import("./components/ProductFormModal").then((m) => ({ default: m.ProductFormModal })),
);
const VariantFormModal = React.lazy(() =>
  import("./components/VariantFormModal").then((m) => ({ default: m.VariantFormModal })),
);
const ProductDetailModal = React.lazy(() =>
  import("./components/ProductDetailModal").then((m) => ({ default: m.ProductDetailModal })),
);
const BulkVariantGenerator = React.lazy(() =>
  import("./components/BulkVariantGenerator").then((m) => ({ default: m.BulkVariantGenerator })),
);
import {
  fetchProducts,
  fetchDeletedProducts,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  createVariantApi,
  updateVariantApi,
  deleteVariantApi,
  bulkCreateVariantsApi,
  updateVariantStatusApi,
  bulkUpdateVariantImagesApi,
} from "../../../services/productService";
import { fetchCategories } from "../categories/api/category.api";
import { fetchBrands } from "../brands/api/brand.api";
import type { Product, ProductVariant } from "../../../types";

export const ProductsFeature: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const { confirm, ConfirmDialog } = useConfirm();

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DELETED">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [targetProductId, setTargetProductId] = useState("");

  // Bulk Variant state
  const [isBulkVariantModalOpen, setIsBulkVariantModalOpen] = useState(false);
  const [bulkVariantProductId, setBulkVariantProductId] = useState("");
  const [bulkVariantCategoryName, setBulkVariantCategoryName] = useState<string | undefined>();

  // Queries
  const {
    data: activeProducts = [],
    isLoading: isLoadingActive,
  } = useQuery({
    queryKey: ["products", "active"],
    queryFn: fetchProducts,
  });

  const {
    data: deletedProducts = [],
    isLoading: isLoadingDeleted,
  } = useQuery({
    queryKey: ["products", "deleted"],
    queryFn: fetchDeletedProducts,
    enabled: activeTab === "DELETED",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  // Product Mutations
  const createProductMutation = useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('productAddedSuccess'), "success");
      setIsProductModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || t('productAddedFailed'), "error");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProductApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('productUpdatedSuccess'), "success");
      setIsProductModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || t('productUpdatedFailed'), "error");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductApi(id, true),
    onSuccess: () => {
      refreshAll();
      showNotification(t('productDeleted'), "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Error deleting product", "error");
    },
  });

  // Variant Mutations
  const createVariantMutation = useMutation({
    mutationFn: createVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('variantAdded'), "success");
      setIsVariantModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || "Error adding variant", "error");
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: updateVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('variantUpdated'), "success");
      setIsVariantModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || "Error updating variant", "error");
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: deleteVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification(t('variantDeleted'), "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Error deleting variant", "error");
    },
  });

  // Bulk Variant Mutation
  const bulkCreateVariantMutation = useMutation({
    mutationFn: bulkCreateVariantsApi,
    onSuccess: (res) => {
      refreshAll();
      showNotification(`Đã tạo ${res.count} biến thể thành công!`, "success");
      setIsBulkVariantModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi khi tạo biến thể hàng loạt", "error");
    },
  });

  // Inline Update Variant Mutation
  const inlineUpdateVariantMutation = useMutation({
    mutationFn: (data: { id: string } & Partial<ProductVariant>) => updateVariantApi(data),
    onSuccess: () => {
      refreshAll();
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi khi cập nhật biến thể", "error");
    },
  });

  // Toggle Variant Status Mutation
  const toggleVariantStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateVariantStatusApi(id, status),
    onSuccess: () => {
      refreshAll();
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi khi đổi trạng thái biến thể", "error");
    },
  });

  const restoreProductMutation = useMutation({
    mutationFn: (id: string) => updateProductApi({ id, status: "ACTIVE" }),
    onSuccess: () => {
      refreshAll();
      showNotification(t('productRestored'), "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Error restoring product", "error");
    },
  });

  const forceDeleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductApi(id, false),
    onSuccess: () => {
      refreshAll();
      showNotification(t('productForceDeleted'), "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Error permanently deleting product", "error");
    },
  });

  // Event Handlers
  // ✅ useCallback giữ stable reference — React.memo trên child components mới có tác dụng
  const handleOpenAddProduct = useCallback(() => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  }, []);

  const handleOpenEditProduct = useCallback((p: Product) => {
    setEditingProduct(p);
    setIsProductModalOpen(true);
  }, []);

  const handleProductSubmit = useCallback((data: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  }, [editingProduct, updateProductMutation, createProductMutation]);

  const handleOpenAddVariant = useCallback((productId: string) => {
    setTargetProductId(productId);
    setEditingVariant(null);
    setIsVariantModalOpen(true);
  }, []);

  const handleOpenEditVariant = useCallback((v: ProductVariant) => {
    setTargetProductId(v.productId);
    setEditingVariant(v);
    setIsVariantModalOpen(true);
  }, []);

  // Bulk Image Update by Color Mutation
  const bulkUpdateVariantImagesMutation = useMutation({
    mutationFn: bulkUpdateVariantImagesApi,
    onSuccess: (res) => {
      refreshAll();
      showNotification(res.message, "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Loi cap nhat anh hang loat", "error");
    },
  });

  const handleVariantSubmit = useCallback((data: any) => {
    // Extract bulk image flag before sending to mutation
    const { applyImageToSameColor, bulkColor, bulkImage, bulkImages, ...variantData } = data;

    const onMutateSuccess = () => {
      // If user checked "Apply image to all same-color variants"
      if (applyImageToSameColor && bulkColor) {
        bulkUpdateVariantImagesMutation.mutate({
          productId: targetProductId,
          color: bulkColor,
          image: bulkImage || undefined,
          images: bulkImages && bulkImages.length > 0 ? bulkImages : undefined,
        });
      }
    };

    if (editingVariant) {
      updateVariantMutation.mutate(
        { id: editingVariant.id, ...variantData },
        { onSuccess: onMutateSuccess },
      );
    } else {
      createVariantMutation.mutate(
        variantData,
        { onSuccess: onMutateSuccess },
      );
    }
  }, [editingVariant, updateVariantMutation, createVariantMutation, targetProductId, bulkUpdateVariantImagesMutation]);

  const handleDeleteProduct = useCallback(async (p: Product) => {
    const isConfirmed = await confirm({
      title: t('confirmDeleteProductTitle'),
      description: t('confirmDeleteProductDesc', { name: p.productName }),
      confirmText: t('confirmDeleteProductBtn'),
      variant: "warning",
    });
    if (isConfirmed) deleteProductMutation.mutate(p.id);
  }, [confirm, deleteProductMutation]);

  const handleRestoreProduct = useCallback(async (p: Product) => {
    const isConfirmed = await confirm({
      title: t('confirmRestoreProductTitle'),
      description: t('confirmRestoreProductDesc', { name: p.productName }),
      confirmText: t('confirmRestoreProductBtn'),
      variant: "info",
    });
    if (isConfirmed) restoreProductMutation.mutate(p.id);
  }, [confirm, restoreProductMutation]);

  const handleForceDeleteProduct = useCallback(async (p: Product) => {
    const isConfirmed = await confirm({
      title: t('confirmForceDeleteProductTitle'),
      description: t('confirmForceDeleteProductDesc', { name: p.productName }),
      confirmText: t('confirmForceDeleteProductBtn'),
      variant: "danger",
    });
    if (isConfirmed) forceDeleteProductMutation.mutate(p.id);
  }, [confirm, forceDeleteProductMutation]);

  const handleDeleteVariant = useCallback(async (v: ProductVariant) => {
    const isConfirmed = await confirm({
      title: t('confirmDeleteVariantTitle'),
      description: t('confirmDeleteVariantDesc', { sku: v.sku }),
      confirmText: t('confirmDeleteVariantBtn'),
      variant: "danger",
    });
    if (isConfirmed) deleteVariantMutation.mutate(v.id);
  }, [confirm, deleteVariantMutation]);

  // Filter products
  const rawList = activeTab === "ACTIVE" ? activeProducts : deletedProducts;

  const handleOpenBulkVariant = useCallback((productId: string) => {
    const product = rawList.find((p) => p.id === productId);
    setBulkVariantProductId(productId);
    setBulkVariantCategoryName(product?.category?.name);
    setIsBulkVariantModalOpen(true);
  }, [rawList]);

  const handleBulkVariantSubmit = useCallback((data: any) => {
    bulkCreateVariantMutation.mutate(data);
  }, [bulkCreateVariantMutation]);

  const handleInlineUpdateVariant = useCallback((id: string, data: Partial<ProductVariant>) => {
    // Nếu data chỉ có status → dùng mutation toggle riêng
    if ('status' in data && Object.keys(data).length === 1) {
      toggleVariantStatusMutation.mutate({ id, status: data.status! });
    } else {
      inlineUpdateVariantMutation.mutate({ id, ...data });
    }
  }, [inlineUpdateVariantMutation, toggleVariantStatusMutation]);

  const handleToggleVariant = useCallback((v: ProductVariant) => {
    const newStatus = v.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    handleInlineUpdateVariant(v.id, { status: newStatus });
  }, [handleInlineUpdateVariant]);

  // Keep detail modal updated when products list changes
  React.useEffect(() => {
    if (detailProduct) {
      const updated = rawList.find((p) => p.id === detailProduct.id);
      if (updated) {
        setDetailProduct(updated);
      }
    }
  }, [rawList]);
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) return rawList;
    const q = debouncedSearch.toLowerCase();
    return rawList.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q) ||
        p.variants?.some((v) => v.sku.toLowerCase().includes(q)),
    );
  }, [rawList, debouncedSearch]);

  const isLoadingCurrent =
    activeTab === "ACTIVE" ? isLoadingActive : isLoadingDeleted;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
            {t('productProfitManagement')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            {t('productProfitDesc')}
          </p>
        </div>
        <Button onClick={handleOpenAddProduct} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1.5" />
          {t('addProduct')}
        </Button>
      </div>

      {/* Main Workspace */}
      <div className="p-3.5 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4 sm:space-y-6">
        {/* Navigation Tabs Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`flex-1 sm:flex-initial justify-center whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ACTIVE"
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              {t('productActiveTab')} ({activeProducts.length})
            </button>
            <button
              onClick={() => setActiveTab("DELETED")}
              className={`flex-1 sm:flex-initial justify-center whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === "DELETED"
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Archive className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              {t('productDeletedTab')} ({deletedProducts.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('searchProductPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" onClick={refreshAll}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notice Banner for Recycle Bin */}
        {activeTab === "DELETED" && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            <span>
            {t('productTrashNotice')}
            </span>
          </div>
        )}

        {/* Product Cards List */}
        {isLoadingCurrent ? (
          <div className="py-12 text-center text-slate-500 animate-pulse">
            {t('loadingProducts')}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2 animate-in fade-in duration-300">
            <Package className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">{t('noProductsFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((p, index) => (
              <div key={p.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 60}ms` }}>
              <ProductCard
                product={p}
                onEditProduct={handleOpenEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddVariant={handleOpenAddVariant}
                onEditVariant={handleOpenEditVariant}
                onDeleteVariant={handleDeleteVariant}
                onToggleVariant={handleToggleVariant}
                onBulkAddVariant={handleOpenBulkVariant}
                onViewDetail={(productToView) => setDetailProduct(productToView)}
                isDeletedTab={activeTab === "DELETED"}
                onRestoreProduct={handleRestoreProduct}
                onForceDeleteProduct={handleForceDeleteProduct}
              />
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        <ProductDetailModal
          isOpen={Boolean(detailProduct)}
          onClose={() => setDetailProduct(null)}
          product={detailProduct}
          onEditProduct={handleOpenEditProduct}
          onAddVariant={handleOpenAddVariant}
          onEditVariant={handleOpenEditVariant}
          onBulkAddVariant={handleOpenBulkVariant}
          onInlineUpdateVariant={handleInlineUpdateVariant}
          onToggleVariant={handleToggleVariant}
        />

        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSubmit={handleProductSubmit}
          isLoading={
            createProductMutation.isPending || updateProductMutation.isPending
          }
          editingProduct={editingProduct}
          categories={categories}
          brands={brands}
        />

        <VariantFormModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          onSubmit={handleVariantSubmit}
          isLoading={
            createVariantMutation.isPending || updateVariantMutation.isPending
          }
          editingVariant={editingVariant}
          productId={targetProductId}
          categoryName={rawList.find((p) => p.id === targetProductId)?.category?.name}
          existingVariants={rawList.find((p) => p.id === targetProductId)?.variants}
        />

        <BulkVariantGenerator
          isOpen={isBulkVariantModalOpen}
          onClose={() => setIsBulkVariantModalOpen(false)}
          onSubmit={handleBulkVariantSubmit}
          isLoading={bulkCreateVariantMutation.isPending}
          productId={bulkVariantProductId}
          categoryName={bulkVariantCategoryName}
          existingVariants={rawList.find((p) => p.id === bulkVariantProductId)?.variants}
        />
      </React.Suspense>

      {/* Reusable Confirm Dialog */}
      {ConfirmDialog}
    </div>
  );
};

