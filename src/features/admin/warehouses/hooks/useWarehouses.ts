import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../../../../lib/i18n';
import { useNotification } from '../../../../lib/notification';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  fetchWarehouses,
  fetchDeletedWarehouses,
  createWarehouseApi,
  updateWarehouseApi,
  deleteWarehouseApi,
  restoreWarehouseApi,
  hardDeleteWarehouseApi,
} from '../api/warehouse.api';
import type { Warehouse } from '../../../../types';
import type { ConfirmType, ActiveTabType, ViewMode, SortField } from '../types';
import { filterWarehouses, sortWarehouses } from '../utils/warehouse.utils';
import { PAGE_SIZE_ROW, PAGE_SIZE_CARD } from '../constants';

export function useWarehouses() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTabType>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? 'row' : 'card';
    }
    return 'row';
  });

  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? 'card' : 'row');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageSize = viewMode === 'row' ? PAGE_SIZE_ROW : PAGE_SIZE_CARD;

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  // Confirm Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    warehouse: Warehouse | null;
    type: ConfirmType;
  }>({
    isOpen: false,
    warehouse: null,
    type: 'SOFT_DELETE',
  });

  // Queries
  const { data: activeWarehouses = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ['warehouses', 'ACTIVE'],
    queryFn: fetchWarehouses,
  });

  const { data: deletedWarehouses = [], isLoading: isLoadingDeleted } = useQuery({
    queryKey: ['warehouses', 'DELETED'],
    queryFn: fetchDeletedWarehouses,
  });

  const refreshWarehouses = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['warehouses'] });
  }, [queryClient]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createWarehouseApi,
    onSuccess: () => {
      refreshWarehouses();
      showNotification(t('warehouseCreated'), 'success');
      setIsFormModalOpen(false);
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Failed to create warehouse', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateWarehouseApi,
    onSuccess: () => {
      refreshWarehouses();
      showNotification(t('warehouseUpdated'), 'success');
      setIsFormModalOpen(false);
      setEditingWarehouse(null);
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Failed to update warehouse', 'error');
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: deleteWarehouseApi,
    onSuccess: () => {
      refreshWarehouses();
      showNotification(t('warehouseDeleted'), 'info');
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Failed to move to trash', 'error');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreWarehouseApi,
    onSuccess: () => {
      refreshWarehouses();
      showNotification(t('warehouseRestored'), 'success');
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Failed to restore warehouse', 'error');
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteWarehouseApi,
    onSuccess: () => {
      refreshWarehouses();
      showNotification(t('warehouseForceDeleted'), 'success');
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Failed to delete permanently', 'error');
    },
  });

  // Action Handlers
  const handleOpenAdd = () => {
    setEditingWarehouse(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: {
    code: string;
    name: string;
    province: string;
    district?: string;
    address?: string;
    supportedProvinces?: string[];
    supportedDistricts?: string[];
    isDefault?: boolean;
  }) => {
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openConfirmModal = (wh: Warehouse, type: ConfirmType) => {
    setConfirmModalState({ isOpen: true, warehouse: wh, type });
  };

  const closeConfirmModal = () => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = () => {
    const { warehouse, type } = confirmModalState;
    if (!warehouse) return;

    if (type === 'SOFT_DELETE') softDeleteMutation.mutate(warehouse.id);
    else if (type === 'RESTORE') restoreMutation.mutate(warehouse.id);
    else if (type === 'HARD_DELETE') hardDeleteMutation.mutate(warehouse.id);
  };

  // Filtered & Sorted Warehouses
  const rawList = activeTab === 'ACTIVE' ? activeWarehouses : deletedWarehouses;

  const processedWarehouses = useMemo(() => {
    const filtered = filterWarehouses(rawList, debouncedSearch);
    return sortWarehouses(filtered, sortField, sortAsc);
  }, [rawList, debouncedSearch, sortField, sortAsc]);

  const totalPages = Math.ceil(processedWarehouses.length / pageSize) || 1;

  const paginatedWarehouses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedWarehouses.slice(start, start + pageSize);
  }, [processedWarehouses, currentPage, pageSize]);

  const defaultWarehouse = useMemo(
    () => activeWarehouses.find((w) => w.isDefault),
    [activeWarehouses],
  );

  const supportedProvincesCount = useMemo(() => {
    const set = new Set<string>();
    activeWarehouses.forEach((w) => {
      set.add(w.province);
      if (w.supportedProvinces) {
        w.supportedProvinces.forEach((p) => set.add(p));
      }
    });
    return set.size;
  }, [activeWarehouses]);

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
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    activeWarehouses,
    deletedWarehouses,
    processedWarehouses,
    paginatedWarehouses,
    totalPages,
    defaultWarehouse,
    supportedProvincesCount,
    isLoadingCurrent,
    isFormLoading,
    isConfirmLoading,
    isFormModalOpen,
    setIsFormModalOpen,
    editingWarehouse,
    confirmModalState,
    handleOpenAdd,
    handleOpenEdit,
    handleFormSubmit,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
  };
}
