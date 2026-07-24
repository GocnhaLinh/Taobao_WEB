import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Search, RefreshCw, Clock, Archive } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useNotification } from "../../lib/notification";
import { useConfirm } from "../../lib/useConfirm";
import { ProductCard } from "./components/ProductCard";
import { ProductFormModal } from "./components/ProductFormModal";
import { VariantFormModal } from "./components/VariantFormModal";
import { ProductDetailModal } from "./components/ProductDetailModal";
import {
  fetchProducts,
  fetchDeletedProducts,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  createVariantApi,
  updateVariantApi,
  deleteVariantApi,
} from "../../services/productService";
import { fetchCategories } from "../../services/categoryService";
import { fetchBrands } from "../../services/brandService";
import type { Product, ProductVariant } from "../../types";

export const ProductsFeature: React.FC = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const { confirm, ConfirmDialog } = useConfirm();

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DELETED">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [targetProductId, setTargetProductId] = useState("");

  // Queries
  const {
    data: activeProducts = [],
    isLoading: isLoadingActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ["products", "active"],
    queryFn: fetchProducts,
  });

  const {
    data: deletedProducts = [],
    isLoading: isLoadingDeleted,
    refetch: refetchDeleted,
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
    refetchActive();
    if (activeTab === "DELETED") refetchDeleted();
  };

  // Product Mutations
  const createProductMutation = useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      refreshAll();
      showNotification("Đã thêm sản phẩm thành công!", "success");
      setIsProductModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi thêm sản phẩm", "error");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProductApi,
    onSuccess: () => {
      refreshAll();
      showNotification("Đã cập nhật sản phẩm!", "success");
      setIsProductModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi cập nhật sản phẩm", "error");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductApi(id, true),
    onSuccess: () => {
      refreshAll();
      showNotification("Đã chuyển sản phẩm vào thùng rác!", "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi xóa sản phẩm", "error");
    },
  });

  // Variant Mutations
  const createVariantMutation = useMutation({
    mutationFn: createVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification(
        "Đã thêm biến thể & tính lợi nhuận thành công!",
        "success",
      );
      setIsVariantModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi thêm biến thể", "error");
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: updateVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification("Đã cập nhật biến thể & lợi nhuận!", "success");
      setIsVariantModalOpen(false);
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi cập nhật biến thể", "error");
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: deleteVariantApi,
    onSuccess: () => {
      refreshAll();
      showNotification("Đã xóa biến thể!", "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi xóa biến thể", "error");
    },
  });

  const restoreProductMutation = useMutation({
    mutationFn: (id: string) => updateProductApi({ id, status: "ACTIVE" }),
    onSuccess: () => {
      refreshAll();
      showNotification("Đã khôi phục sản phẩm thành công!", "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi khôi phục sản phẩm", "error");
    },
  });

  const forceDeleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductApi(id, false),
    onSuccess: () => {
      refreshAll();
      showNotification("Đã xóa vĩnh viễn sản phẩm khỏi hệ thống!", "success");
    },
    onError: (err: any) => {
      showNotification(err.message || "Lỗi xóa vĩnh viễn sản phẩm", "error");
    },
  });

  // Event Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (data: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleOpenAddVariant = (productId: string) => {
    setTargetProductId(productId);
    setEditingVariant(null);
    setIsVariantModalOpen(true);
  };

  const handleOpenEditVariant = (v: ProductVariant) => {
    setTargetProductId(v.productId);
    setEditingVariant(v);
    setIsVariantModalOpen(true);
  };

  const handleVariantSubmit = (data: any) => {
    if (editingVariant) {
      updateVariantMutation.mutate({ id: editingVariant.id, ...data });
    } else {
      createVariantMutation.mutate(data);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    const isConfirmed = await confirm({
      title: "Xác Nhận Xóa Sản Phẩm",
      description: `Bạn có chắc chắn muốn chuyển sản phẩm "${p.productName}" vào Thùng rác không?`,
      confirmText: "Chuyển vào Thùng rác",
      variant: "warning",
    });

    if (isConfirmed) {
      deleteProductMutation.mutate(p.id);
    }
  };

  const handleRestoreProduct = async (p: Product) => {
    const isConfirmed = await confirm({
      title: "Xác Nhận Khôi Phục Sản Phẩm",
      description: `Bạn có chắc chắn muốn khôi phục sản phẩm "${p.productName}" từ Thùng rác về danh sách hoạt động không?`,
      confirmText: "Khôi phục ngay",
      variant: "info",
    });

    if (isConfirmed) {
      restoreProductMutation.mutate(p.id);
    }
  };

  const handleForceDeleteProduct = async (p: Product) => {
    const isConfirmed = await confirm({
      title: "Xác Nhận Xóa Vĩnh Viễn",
      description: `Bạn có chắc muốn XÓA VĨNH VIỄN sản phẩm "${p.productName}" không? Dữ liệu sẽ mất hoàn toàn và không thể hoàn tác!`,
      confirmText: "Xóa Vĩnh Viễn",
      variant: "danger",
    });

    if (isConfirmed) {
      forceDeleteProductMutation.mutate(p.id);
    }
  };

  const handleDeleteVariant = async (v: ProductVariant) => {
    const isConfirmed = await confirm({
      title: "Xác Nhận Xóa Biến Thể",
      description: `Bạn có chắc chắn muốn xóa biến thể mẫu mã SKU "${v.sku}" khỏi sản phẩm không?`,
      confirmText: "Xóa Biến Thể",
      variant: "danger",
    });

    if (isConfirmed) {
      deleteVariantMutation.mutate(v.id);
    }
  };

  // Filter products
  const rawList = activeTab === "ACTIVE" ? activeProducts : deletedProducts;

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
    if (!searchQuery.trim()) return rawList;
    const q = searchQuery.toLowerCase();
    return rawList.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q) ||
        p.variants?.some((v) => v.sku.toLowerCase().includes(q)),
    );
  }, [rawList, searchQuery]);

  const isLoadingCurrent =
    activeTab === "ACTIVE" ? isLoadingActive : isLoadingDeleted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-500" />
            Quản lý Sản Phẩm & Lợi Nhuận
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tính toán tự động giá vốn nhập Tệ (¥), tỷ giá NDT, phí ship kho và
            lợi nhuận bán ra thị trường Việt.
          </p>
        </div>
        <Button onClick={handleOpenAddProduct}>
          <Plus className="h-4 w-4 mr-1.5" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Main Workspace */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Navigation Tabs Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ACTIVE"
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" />
              Sản phẩm ({activeProducts.length})
            </button>
            <button
              onClick={() => setActiveTab("DELETED")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "DELETED"
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Archive className="h-4 w-4" />
              Thùng rác ({deletedProducts.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên, SKU, danh mục..."
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
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            <span>
              Các sản phẩm trong Thùng rác được giữ tối đa 30 ngày kể từ khi
              xóa. Bạn có thể khôi phục bất cứ lúc nào hoặc xóa vĩnh viễn.
            </span>
          </div>
        )}

        {/* Product Cards List */}
        {isLoadingCurrent ? (
          <div className="py-12 text-center text-slate-500 animate-pulse">
            Đang tải sản phẩm...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Package className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">Chưa tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEditProduct={handleOpenEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddVariant={handleOpenAddVariant}
                onEditVariant={handleOpenEditVariant}
                onDeleteVariant={handleDeleteVariant}
                onViewDetail={(productToView) => setDetailProduct(productToView)}
                isDeletedTab={activeTab === "DELETED"}
                onRestoreProduct={handleRestoreProduct}
                onForceDeleteProduct={handleForceDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductDetailModal
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
        onEditProduct={handleOpenEditProduct}
        onAddVariant={handleOpenAddVariant}
        onEditVariant={handleOpenEditVariant}
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
      />

      {/* Reusable Confirm Dialog */}
      {ConfirmDialog}
    </div>
  );
};
