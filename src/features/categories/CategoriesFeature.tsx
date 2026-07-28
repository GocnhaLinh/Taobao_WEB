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
  Sparkles,
  LayoutGrid,
  List,
} from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { useNotification } from "../../lib/notification";
import { useDebounce } from "../../lib/useDebounce";
import {
  fetchCategories,
  fetchDeletedCategories,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  restoreCategoryApi,
  hardDeleteCategoryApi,
} from "../../services/categoryService";
import { fetchCategoryLabelsApi } from "../../services/categoryLabelService";
import type { Category } from "../../types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { CategoryCard } from "./components/CategoryCard";
import { CategoryRow } from "./components/CategoryRow";
import type { ConfirmType } from "./components/CategoryConfirmModal";

const CategoryFormModal = React.lazy(() =>
  import("./components/CategoryFormModal").then((m) => ({ default: m.CategoryFormModal })),
);
const CategoryConfirmModal = React.lazy(() =>
  import("./components/CategoryConfirmModal").then((m) => ({ default: m.CategoryConfirmModal })),
);

type ActiveTabType = "ACTIVE" | "TRASH";
type ViewMode = "row" | "card";

export const CategoriesFeature: React.FC = () => {
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Confirm Modal State (Soft Delete, Restore, Hard Delete)
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    category: Category | null;
    type: ConfirmType;
  }>({
    isOpen: false,
    category: null,
    type: "SOFT_DELETE",
  });

  // Queries
  const { data: activeCategories = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ["categories", "ACTIVE"],
    queryFn: fetchCategories,
  });

  const { data: deletedCategories = [], isLoading: isLoadingDeleted } =
    useQuery({
      queryKey: ["categories", "DELETED"],
      queryFn: fetchDeletedCategories,
    });

  // Fetch category labels for icon mapping
  const { data: categoryLabels = [] } = useQuery({
    queryKey: ["categoryLabels"],
    queryFn: fetchCategoryLabelsApi,
  });

  // Build labelsMap: label name -> icon
  const labelsMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoryLabels.forEach((lbl) => {
      map[lbl.name] = lbl.icon || '🏷️';
    });
    return map;
  }, [categoryLabels]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification(t('categoryCreated'), "success");
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to add category";
      showNotification(errText, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification(t('categoryUpdated'), "success");
      setIsFormModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update category";
      showNotification(errText, "error");
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification(t('categoryDeleted'), "success");
      closeConfirmModal();
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete category";
      showNotification(errText, "error");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification(t('categoryRestored'), "success");
      closeConfirmModal();
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to restore category";
      showNotification(errText, "error");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification(t('categoryForceDeleted'), "success");
      closeConfirmModal();
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to permanently delete category";
      showNotification(errText, "error");
    },
  });

  // Modal Action Handlers
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: { name: string; slug: string; sex?: string }) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openConfirmModal = (category: Category, type: ConfirmType) => {
    setConfirmModalState({ isOpen: true, category, type });
  };

  const closeConfirmModal = () => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = () => {
    const { category, type } = confirmModalState;
    if (!category) return;

    if (type === "SOFT_DELETE") softDeleteMutation.mutate(category.id);
    else if (type === "RESTORE") restoreMutation.mutate(category.id);
    else if (type === "HARD_DELETE") hardDeleteMutation.mutate(category.id);
  };

  // Filtered & Paginated Categories
  const rawList = activeTab === "ACTIVE" ? activeCategories : deletedCategories;

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return rawList;
    const q = debouncedSearch.toLowerCase();
    return rawList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [rawList, debouncedSearch]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

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
            <Sparkles className="h-6 w-6 text-indigo-500" />
            {t("productCategories")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("manageCategories")}
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden lg:inline">{t("addCategory")}</span>
          <span className="lg:hidden">{t("addShort")}</span>
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
              title={t("activeCategoriesTab")}
            >
              <Layers className="h-4 w-4" />
              <span className="hidden lg:inline">
                {t("activeCategoriesTab")}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-white/20 text-slate-700 dark:text-white font-mono">
                {activeCategories.length}
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
              title={t("trashCategoriesTab")}
            >
              <Archive className="h-4 w-4" />
              <span className="hidden lg:inline">
                {t("trashCategoriesTab")}
              </span>
              {deletedCategories.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-rose-600 font-extrabold animate-pulse">
                  {deletedCategories.length}
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
                placeholder={t("searchCategoriesPlaceholder")}
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
            <span>{t("trashNoticeBanner")}</span>
          </div>
        )}

        {/* Categories List / Cards Grid */}
        {isLoadingCurrent ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 animate-pulse">
            {t("loadingCategories")}
          </div>
        ) : paginatedCategories.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
            <Archive className="h-10 w-10 opacity-30" />
            <span>
              {activeTab === "ACTIVE"
                ? t("emptyActiveCategories")
                : t("emptyTrashCategories")}
            </span>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                labelsMap={labelsMap}
                isTrashView={activeTab === "TRASH"}
                onEdit={handleOpenEdit}
                onSoftDelete={(c) => openConfirmModal(c, "SOFT_DELETE")}
                onRestore={(c) => openConfirmModal(c, "RESTORE")}
                onHardDelete={(c) => openConfirmModal(c, "HARD_DELETE")}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedCategories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                labelsMap={labelsMap}
                isTrashView={activeTab === "TRASH"}
                onEdit={handleOpenEdit}
                onSoftDelete={(c) => openConfirmModal(c, "SOFT_DELETE")}
                onRestore={(c) => openConfirmModal(c, "RESTORE")}
                onHardDelete={(c) => openConfirmModal(c, "HARD_DELETE")}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('page')}{" "}
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
                {t('prev')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                {t('next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        {/* Form Modal (Add & Edit) */}
        <CategoryFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingCategory}
          defaultSex="UNISEX"
          isLoading={isFormLoading}
          onLabelsChanged={() => queryClient.invalidateQueries({ queryKey: ["categoryLabels"] })}
        />

        {/* Confirmation Modal (Soft Delete, Restore, Hard Delete) */}
        <CategoryConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          category={confirmModalState.category}
          type={confirmModalState.type}
          isLoading={isConfirmLoading}
        />
      </React.Suspense>
    </div>
  );
};
