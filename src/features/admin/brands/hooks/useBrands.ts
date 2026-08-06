import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../../../../lib/i18n";
import { useNotification } from "../../../../lib/notification";
import { useDebounce } from "../../../../hooks/useDebounce";
import {
  fetchBrands,
  fetchDeletedBrands,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  restoreBrandApi,
  hardDeleteBrandApi,
} from "../api/brand.api";
import type {
  Brand,
  ActiveTabType,
  ViewMode,
  ConfirmType,
  ConfirmModalState,
} from "../types";
import { filterBrands } from "../utils/brand.utils";
import { PAGE_SIZE_ROW, PAGE_SIZE_CARD } from "../constants";

export function useBrands() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTabType>("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024 ? "row" : "card";
    }
    return "row";
  });

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

  const pageSize = viewMode === "row" ? PAGE_SIZE_ROW : PAGE_SIZE_CARD;

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Confirm Modal State
  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>(
    {
      isOpen: false,
      brand: null,
      type: "SOFT_DELETE",
    },
  );

  // Queries
  const { data: activeBrands = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ["brands", "ACTIVE"],
    queryFn: fetchBrands,
  });

  const { data: deletedBrands = [], isLoading: isLoadingDeleted } = useQuery({
    queryKey: ["brands", "DELETED"],
    queryFn: fetchDeletedBrands,
  });

  const refreshBrands = () => {
    queryClient.invalidateQueries({ queryKey: ["brands"] });
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: createBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification(t("brandCreated"), "success");
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      showNotification(error.message || "Failed to add brand", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification(t("brandUpdated"), "success");
      setIsFormModalOpen(false);
      setEditingBrand(null);
    },
    onError: (error: any) => {
      showNotification(error.message || "Failed to update brand", "error");
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: deleteBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification(t("brandDeleted"), "info");
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      showNotification(error.message || "Failed to delete brand", "error");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification(t("brandRestored"), "success");
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      showNotification(error.message || "Failed to restore brand", "error");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteBrandApi,
    onSuccess: () => {
      refreshBrands();
      showNotification(t("brandForceDeleted"), "success");
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      showNotification(
        error.message || "Failed to permanently delete brand",
        "error",
      );
    },
  });

  // Action Handlers
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
    return filterBrands(rawList, debouncedSearch);
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

  return {
    t,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    viewMode,
    setViewMode,
    activeBrands,
    deletedBrands,
    filteredBrands,
    paginatedBrands,
    totalPages,
    isLoadingCurrent,
    isFormLoading,
    isConfirmLoading,
    isFormModalOpen,
    setIsFormModalOpen,
    editingBrand,
    confirmModalState,
    handleOpenAdd,
    handleOpenEdit,
    handleFormSubmit,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
  };
}
