import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Archive,
  Layers,
  LayoutGrid,
  List,
  Award,
} from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { useNotification } from "../../lib/notification";
import { useDebounce } from "../../lib/useDebounce";
import {
  fetchBrands,
  fetchDeletedBrands,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  restoreBrandApi,
  hardDeleteBrandApi,
} from "../../services/brandService";
import type { Brand } from "../../types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { BrandCard } from "./components/BrandCard";
import { BrandRow } from "./components/BrandRow";
import type { ConfirmType } from "./components/BrandConfirmModal";

const BrandFormModal = React.lazy(() =>
  import("./components/BrandFormModal").then((m) => ({ default: m.BrandFormModal })),
);
const BrandConfirmModal = React.lazy(() =>
  import("./components/BrandConfirmModal").then((m) => ({ default: m.BrandConfirmModal })),
);

type ActiveTabType = "ACTIVE" | "TRASH";
type ViewMode = "row" | "card";

export const BrandsFeature: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Tab & Search & Pagination & View Mode
  const [activeTab, setActiveTab] = useState<ActiveTabType>("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);

  // Default view: Laptop (>= 1024px) -> row (hàng ngang), Mobile/Tablet (< 1024px) -> card
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024 ? "row" : "card";
    }
    return "row";
  });

  // Tự động chuyển viewMode: Mobile & Tablet (< 1024px) -> card, Laptop/Desktop (>= 1024px) -> row
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode("card");
      } else {
        setViewMode("row");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageSize = viewMode === "row" ? 10 : 8;

  // Form Modal State (Add & Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Confirm Modal State (Soft Delete, Restore, Hard Delete)
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    brand: Brand | null;
    type: ConfirmType;
  }>({
    isOpen: false,
    brand: null,
    type: "SOFT_DELETE",
  });

  // Queries
  const { data: activeBrands = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ["brands", "ACTIVE"],
    queryFn: fetchBrands,
  });

  const { data: deletedBrands = [], isLoading: isLoadingDeleted } = useQuery({
    queryKey: ["brands", "DELETED"],
    queryFn: fetchDeletedBrands,
  });

  // Helper to invalidate all brand queries (automatically refetches active queries)
  const refreshBrands = () => {
    queryClient.invalidateQueries({ queryKey: ["brands"] });
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: createBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification("Thêm thương hiệu mới thành công!", "success");
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      showNotification(error.message || "Thêm thương hiệu thất bại", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification("Cập nhật thương hiệu thành công!", "success");
      setIsFormModalOpen(false);
      setEditingBrand(null);
    },
    onError: (error: any) => {
      showNotification(
        error.message || "Cập nhật thương hiệu thất bại",
        "error",
      );
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: deleteBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification("Đã chuyển thương hiệu vào Thùng rác!", "info");
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      showNotification(
        error.message || "Chuyển vào thùng rác thất bại",
        "error",
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification("Khôi phục thương hiệu thành công!", "success");
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      showNotification(
        error.message || "Khôi phục thương hiệu thất bại",
        "error",
      );
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification("Đã xóa vĩnh viễn thương hiệu!", "success");
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      showNotification(error.message || "Xóa thương hiệu thất bại", "error");
    },
  });

  // Event Handlers
  const handleOpenAdd = () => {
    setEditingBrand(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: {
    name: string;
    logo?: string;
    description?: string;
  }) => {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openConfirmModal = (brand: Brand, type: ConfirmType) => {
    setConfirmModalState({ isOpen: true, brand, type });
  };

  const closeConfirmModal = () => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = () => {
    const { brand, type } = confirmModalState;
    if (!brand) return;

    if (type === "SOFT_DELETE") softDeleteMutation.mutate(brand.id);
    else if (type === "RESTORE") restoreMutation.mutate(brand.id);
    else if (type === "HARD_DELETE") hardDeleteMutation.mutate(brand.id);
  };

  // Filtered & Paginated Brands
  const rawList = activeTab === "ACTIVE" ? activeBrands : deletedBrands;
  const filteredBrands = useMemo(() => {
    if (!debouncedSearch.trim()) return rawList;
    const q = debouncedSearch.toLowerCase();
    return rawList.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q)),
    );
  }, [rawList, debouncedSearch]);

  const totalPages = Math.ceil(filteredBrands.length / pageSize) || 1;
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBrands.slice(start, start + pageSize);
  }, [filteredBrands, currentPage, pageSize]);

  const isLoadingCurrent =
    activeTab === "ACTIVE" ? isLoadingActive : isLoadingDeleted;
  const isFormLoading = createMutation.isPending || updateMutation.isPending;
  const isConfirmLoading =
    softDeleteMutation.isPending ||
    restoreMutation.isPending ||
    hardDeleteMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-indigo-500" />
            {t("brandManagement") || "Quản lý Thương hiệu"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("brandDesc") ||
              "Quản lý thương hiệu sản phẩm thời trang cao cấp."}
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden lg:inline">Thêm thương hiệu</span>
          <span className="lg:hidden">Thêm</span>
        </Button>
      </div>

      {/* Main Glassmorphism Workspace */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Navigation Tabs Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          {/* Pill Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab("ACTIVE");
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 lg:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "ACTIVE"
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Thương hiệu đang sử dụng"
            >
              <Layers className="h-4 w-4" />
              <span className="hidden lg:inline">Thương hiệu sử dụng</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-white/20 text-slate-700 dark:text-white font-mono">
                {activeBrands.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("TRASH");
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 lg:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "TRASH"
                  ? "bg-rose-500 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Thùng rác lưu trữ"
            >
              <Archive className="h-4 w-4" />
              <span className="hidden lg:inline">Thùng rác lưu trữ</span>
              {deletedBrands.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-rose-600 font-extrabold animate-pulse">
                  {deletedBrands.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Box & View Mode Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm thương hiệu..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-xs bg-slate-50 dark:bg-slate-800/80"
              />
            </div>

            {/* View Mode Switcher (Row vs Card) */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("row")}
                className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold ${
                  viewMode === "row"
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Hàng ngang"
              >
                <List className="h-4 w-4" />
                <span className="hidden md:inline">Hàng ngang</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold ${
                  viewMode === "card"
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Dạng thẻ (Card)"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden md:inline">Thẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notice Banner for Recycle Bin */}
        {activeTab === "TRASH" && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            <span>
              Các thương hiệu trong Thùng rác được giữ tối đa 30 ngày kể từ khi
              xóa. Bạn có thể khôi phục bất cứ lúc nào hoặc xóa vĩnh viễn.
            </span>
          </div>
        )}

        {/* Brands List / Cards Grid */}
        {isLoadingCurrent ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 animate-pulse">
            Đang tải dữ liệu thương hiệu...
          </div>
        ) : paginatedBrands.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
            <Archive className="h-10 w-10 opacity-30" />
            <span>
              {activeTab === "ACTIVE"
                ? "Không tìm thấy thương hiệu nào"
                : "Thùng rác trống - Chưa có thương hiệu nào bị xóa"}
            </span>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isTrashView={activeTab === "TRASH"}
                onEdit={handleOpenEdit}
                onSoftDelete={(b) => openConfirmModal(b, "SOFT_DELETE")}
                onRestore={(b) => openConfirmModal(b, "RESTORE")}
                onHardDelete={(b) => openConfirmModal(b, "HARD_DELETE")}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedBrands.map((brand) => (
              <BrandRow
                key={brand.id}
                brand={brand}
                isTrashView={activeTab === "TRASH"}
                onEdit={handleOpenEdit}
                onSoftDelete={(b) => openConfirmModal(b, "SOFT_DELETE")}
                onRestore={(b) => openConfirmModal(b, "RESTORE")}
                onHardDelete={(b) => openConfirmModal(b, "HARD_DELETE")}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Trang{" "}
              <strong className="text-slate-900 dark:text-white">
                {currentPage}
              </strong>{" "}
              / {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        {/* Form Modal (Add & Edit) */}
        <BrandFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingBrand}
          isLoading={isFormLoading}
        />

        {/* Confirmation Modal (Soft Delete, Restore, Hard Delete) */}
        <BrandConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          brand={confirmModalState.brand}
          type={confirmModalState.type}
          isLoading={isConfirmLoading}
        />
      </React.Suspense>
    </div>
  );
};
