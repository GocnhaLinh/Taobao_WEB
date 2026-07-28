import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ChevronLeft, ChevronRight, Clock, Archive, Layers, Building2, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { useNotification } from '../../lib/notification';
import { useDebounce } from '../../lib/useDebounce';
import {
  fetchWarehouses,
  fetchDeletedWarehouses,
  createWarehouseApi,
  updateWarehouseApi,
  deleteWarehouseApi,
  restoreWarehouseApi,
  hardDeleteWarehouseApi,
} from '../../services/warehouseService';
import type { Warehouse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { WarehouseCard } from './components/WarehouseCard';
import { WarehouseRow } from './components/WarehouseRow';
import type { ConfirmType } from './components/WarehouseConfirmModal';

const WarehouseFormModal = React.lazy(() =>
  import('./components/WarehouseFormModal').then((m) => ({ default: m.WarehouseFormModal })),
);
const WarehouseConfirmModal = React.lazy(() =>
  import('./components/WarehouseConfirmModal').then((m) => ({ default: m.WarehouseConfirmModal })),
);

type ActiveTabType = 'ACTIVE' | 'TRASH';
type ViewMode = 'row' | 'card';

export const WarehousesFeature: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Tab & Search & Pagination & View Mode
  const [activeTab, setActiveTab] = useState<ActiveTabType>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);

  // Default view: Laptop (>= 1024px) -> row (hàng ngang), Mobile/Tablet (< 1024px) -> card
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? 'row' : 'card';
    }
    return 'row';
  });

  // Auto switch viewMode on screen resize across 1024px breakpoint
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

  const pageSize = viewMode === 'row' ? 10 : 8;

  // Form Modal State (Add & Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  // Confirm Modal State (Soft Delete, Restore, Hard Delete)
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

  // Helper to invalidate queries (automatically refetches active queries)
  const refreshWarehouses = () => {
    queryClient.invalidateQueries({ queryKey: ['warehouses'] });
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: createWarehouseApi,
    onSuccess: () => {
      refreshWarehouses();
      showNotification(t('warehouseCreated'), 'success');
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
      showNotification(error.message || 'Failed to delete warehouse', 'error');
    },
  });

  // Event Handlers
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
    const { warehouse: wh, type } = confirmModalState;
    if (!wh) return;

    if (type === 'SOFT_DELETE') softDeleteMutation.mutate(wh.id);
    else if (type === 'RESTORE') restoreMutation.mutate(wh.id);
    else if (type === 'HARD_DELETE') hardDeleteMutation.mutate(wh.id);
  };

  // Filtered & Paginated Warehouses
  const rawList = activeTab === 'ACTIVE' ? activeWarehouses : deletedWarehouses;
  const filteredWarehouses = useMemo(() => {
    if (!debouncedSearch.trim()) return rawList;
    const q = debouncedSearch.toLowerCase();
    return rawList.filter(
      (wh) =>
        wh.name.toLowerCase().includes(q) ||
        wh.code.toLowerCase().includes(q) ||
        wh.province.toLowerCase().includes(q) ||
        (wh.address && wh.address.toLowerCase().includes(q))
    );
  }, [rawList, debouncedSearch]);

  const totalPages = Math.ceil(filteredWarehouses.length / pageSize) || 1;
  const paginatedWarehouses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWarehouses.slice(start, start + pageSize);
  }, [filteredWarehouses, currentPage, pageSize]);

  const isLoadingCurrent = activeTab === 'ACTIVE' ? isLoadingActive : isLoadingDeleted;
  const isFormLoading = createMutation.isPending || updateMutation.isPending;
  const isConfirmLoading =
    softDeleteMutation.isPending || restoreMutation.isPending || hardDeleteMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-500" />
            {t('warehouseManagement')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('warehouseManagementDesc')}
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden lg:inline">{t('addWarehouse')}</span>
          <span className="lg:hidden">{t('addWarehouseShort')}</span>
        </Button>
      </div>
      {/* 
        ========================================================================
        [TÍNH NĂNG TỰ ĐỘNG GÁN KHO THEO ĐỊA CHỈ - DÙNG CHO TRANG CLIENT CHECKOUT]
        Ghi chú: Đã comment lại để gỡ khỏi trang Admin, sau này sẽ cắt qua trang Client.
        ========================================================================
        <div className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Công cụ Test Tự động Gán Kho theo Địa chỉ
            </h3>
          </div>
          <form onSubmit={handleTestSelect} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input
              label="Tỉnh / Thành phố khách nhập"
              value={testProvince}
              onChange={(e) => setTestProvince(e.target.value)}
              placeholder="Ví dụ: Hồ Chí Minh, Hà Nội, Đà Nẵng..."
            />
            <Input
              label="Quận / Huyện khách nhập"
              value={testDistrict}
              onChange={(e) => setTestDistrict(e.target.value)}
              placeholder="Ví dụ: Quận 1, Cầu Giấy, Hải Châu..."
            />
            <Button type="submit" isLoading={selectTestMutation.isPending}>
              Tìm Kho xử lý phù hợp
            </Button>
          </form>

          {matchedWarehouse && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider block">
                    Kho được tự động chọn
                  </span>
                  <h4 className="text-slate-900 dark:text-white font-bold text-sm">
                    {matchedWarehouse.name} ({matchedWarehouse.code})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {matchedWarehouse.address || matchedWarehouse.province}
                  </p>
                </div>
              </div>
              <Badge variant="success" className="w-fit">
                Mã Kho: {matchedWarehouse.code}
              </Badge>
            </div>
          )}
        </div>
      */}



      {/* Main Glassmorphism Workspace */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Navigation Tabs Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          {/* Pill Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('ACTIVE');
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 lg:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'ACTIVE'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t('warehouseActiveTab')}
            >
              <Layers className="h-4 w-4" />
              <span className="hidden lg:inline">{t('warehouseActiveTab')}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-white/20 text-slate-700 dark:text-white font-mono">
                {activeWarehouses.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('TRASH');
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 lg:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'TRASH'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t('warehouseTrashTab')}
            >
              <Archive className="h-4 w-4" />
              <span className="hidden lg:inline">{t('warehouseTrashTab')}</span>
              {deletedWarehouses.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-rose-600 font-extrabold animate-pulse">
                  {deletedWarehouses.length}
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
                placeholder={t('searchWarehousePlaceholder')}
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
                onClick={() => setViewMode('row')}
                className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold ${
                  viewMode === 'row'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={t('rowView') || 'Row view'}
              >
                <List className="h-4 w-4" />
                <span className="hidden md:inline">{t('rowView') || 'Row'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={t('cardView') || 'Card view'}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden md:inline">{t('cardView') || 'Card'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notice Banner for Recycle Bin */}
        {activeTab === 'TRASH' && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            <span>
              {t('warehouseTrashNotice')}
            </span>
          </div>
        )}

        {/* Warehouses List / Cards Grid */}
        {isLoadingCurrent ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 animate-pulse">
            {t('loadingWarehouses')}
          </div>
        ) : paginatedWarehouses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
            <Archive className="h-10 w-10 opacity-30" />
            <span>
              {activeTab === 'ACTIVE'
                ? t('emptyActiveWarehouses')
                : t('emptyTrashWarehouses')}
            </span>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {paginatedWarehouses.map((wh) => (
              <WarehouseCard
                key={wh.id}
                warehouse={wh}
                isTrashView={activeTab === 'TRASH'}
                onEdit={handleOpenEdit}
                onSoftDelete={(w) => openConfirmModal(w, 'SOFT_DELETE')}
                onRestore={(w) => openConfirmModal(w, 'RESTORE')}
                onHardDelete={(w) => openConfirmModal(w, 'HARD_DELETE')}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedWarehouses.map((wh) => (
              <WarehouseRow
                key={wh.id}
                warehouse={wh}
                isTrashView={activeTab === 'TRASH'}
                onEdit={handleOpenEdit}
                onSoftDelete={(w) => openConfirmModal(w, 'SOFT_DELETE')}
                onRestore={(w) => openConfirmModal(w, 'RESTORE')}
                onHardDelete={(w) => openConfirmModal(w, 'HARD_DELETE')}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('page')} <strong className="text-slate-900 dark:text-white">{currentPage}</strong> / {totalPages}
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
        <WarehouseFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingWarehouse}
          isLoading={isFormLoading}
        />

        {/* Confirmation Modal (Soft Delete, Restore, Hard Delete) */}
        <WarehouseConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          warehouse={confirmModalState.warehouse}
          type={confirmModalState.type}
          isLoading={isConfirmLoading}
        />
      </React.Suspense>
    </div>
  );
};
