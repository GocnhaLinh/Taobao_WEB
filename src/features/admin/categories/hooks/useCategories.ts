import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../../../../lib/i18n';
import { useNotification } from '../../../../lib/notification';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  fetchCategories,
  fetchDeletedCategories,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  restoreCategoryApi,
  hardDeleteCategoryApi,
} from '../api/category.api';
import { fetchCategoryLabelsApi } from '../../../../services/categoryLabelService';
import type { Category, ActiveTabType, ViewMode, ConfirmType, ConfirmModalState } from '../types';
import { mapCategoryLabelsToMap } from '../utils/category.utils';
import { PAGE_SIZE_ROW, PAGE_SIZE_CARD } from '../constants';

export function useCategories() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTabType>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? 'row' : 'card';
    }
    return 'row';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode('card');
      } else {
        setViewMode('row');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageSize = viewMode === 'row' ? PAGE_SIZE_ROW : PAGE_SIZE_CARD;

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Confirm Modal State
  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
    isOpen: false,
    category: null,
    type: 'SOFT_DELETE',
  });

  // Queries
  const { data: activeCategories = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ['categories', 'ACTIVE'],
    queryFn: fetchCategories,
  });

  const { data: deletedCategories = [], isLoading: isLoadingDeleted } = useQuery({
    queryKey: ['categories', 'DELETED'],
    queryFn: fetchDeletedCategories,
  });

  const { data: categoryLabels = [] } = useQuery({
    queryKey: ['categoryLabels'],
    queryFn: fetchCategoryLabelsApi,
  });

  const labelsMap = useMemo(() => {
    return mapCategoryLabelsToMap(categoryLabels);
  }, [categoryLabels]);

  // Refresh queries
  const invalidateCategoryQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const invalidateLabelQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['categoryLabels'] });
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      invalidateCategoryQueries();
      showNotification(t('categoryCreated'), 'success');
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to add category';
      showNotification(errText, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategoryApi,
    onSuccess: () => {
      invalidateCategoryQueries();
      showNotification(t('categoryUpdated'), 'success');
      setIsFormModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update category';
      showNotification(errText, 'error');
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      invalidateCategoryQueries();
      showNotification(t('categoryDeleted'), 'success');
      closeConfirmModal();
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to delete category';
      showNotification(errText, 'error');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreCategoryApi,
    onSuccess: () => {
      invalidateCategoryQueries();
      showNotification(t('categoryRestored'), 'success');
      closeConfirmModal();
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to restore category';
      showNotification(errText, 'error');
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteCategoryApi,
    onSuccess: () => {
      invalidateCategoryQueries();
      showNotification(t('categoryForceDeleted'), 'success');
      closeConfirmModal();
    },
    onError: (error: any) => {
      const errText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to permanently delete category';
      showNotification(errText, 'error');
    },
  });

  // Action Handlers
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

    if (type === 'SOFT_DELETE') softDeleteMutation.mutate(category.id);
    else if (type === 'RESTORE') restoreMutation.mutate(category.id);
    else if (type === 'HARD_DELETE') hardDeleteMutation.mutate(category.id);
  };

  // Filtered & Paginated Categories
  const rawList = activeTab === 'ACTIVE' ? activeCategories : deletedCategories;

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return rawList;
    const q = debouncedSearch.toLowerCase();
    return rawList.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [rawList, debouncedSearch]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  const isLoadingCurrent = activeTab === 'ACTIVE' ? isLoadingActive : isLoadingDeleted;
  const isFormLoading = createMutation.isPending || updateMutation.isPending;
  const isConfirmLoading =
    softDeleteMutation.isPending || restoreMutation.isPending || hardDeleteMutation.isPending;

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
    activeCategories,
    deletedCategories,
    labelsMap,
    filteredCategories,
    paginatedCategories,
    totalPages,
    isLoadingCurrent,
    isFormLoading,
    isConfirmLoading,
    isFormModalOpen,
    setIsFormModalOpen,
    editingCategory,
    confirmModalState,
    handleOpenAdd,
    handleOpenEdit,
    handleFormSubmit,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
    invalidateLabelQueries,
  };
}
