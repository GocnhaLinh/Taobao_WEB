import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, ChevronLeft, ChevronRight, ChevronDown, Clock, Archive, Layers, Building2,
  LayoutGrid, List, MapPin, Star, Globe, Warehouse as WarehouseIcon,
  ArrowUpDown, Sparkles, Trash2, Sliders,
} from 'lucide-react';
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
type SortField = 'name' | 'code' | 'province';

// ─── Stats Card Component ──────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  subtitle?: string;
}

const accentMap = {
  indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/25 text-indigo-600 dark:text-indigo-400',
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/25 text-amber-600 dark:text-amber-400',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/25 text-rose-600 dark:text-rose-400',
  sky: 'from-sky-500/20 to-sky-600/10 border-sky-500/25 text-sky-600 dark:text-sky-400',
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, accent, subtitle }) => (
  <div className={`flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br ${accentMap[accent]} border shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}>
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75 truncate">{label}</p>
      <p className="text-lg font-extrabold tabular-nums leading-tight">{value}</p>
      {subtitle && <p className="text-[10px] opacity-60 truncate">{subtitle}</p>}
    </div>
  </div>
);

// ─── Skeleton Components ───────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 animate-pulse space-y-3">
    <div className="flex gap-2">
      <div className="h-5 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-5 w-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-700" />
    <div className="h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-700" />
    <div className="flex gap-1.5 pt-1">
      <div className="h-5 w-14 rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="pt-2 flex justify-end gap-1.5">
      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  </div>
);

const SkeletonRow: React.FC = () => (
  <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 animate-pulse flex items-center gap-3">
    <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex gap-2">
        <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-4 w-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="flex gap-1 shrink-0">
      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  </div>
);

// ─── Main Feature Component ────────────────────────────────────────
export const WarehousesFeature: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Tab & Search & Pagination & View Mode & Sort
  const [activeTab, setActiveTab] = useState<ActiveTabType>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Default view: Laptop (>= 1024px) -> row, Mobile/Tablet (< 1024px) -> card
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

  const pageSize = viewMode === 'row' ? 10 : 8;

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
  const handleOpenAdd = useCallback(() => {
    setEditingWarehouse(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((wh: Warehouse) => {
    setEditingWarehouse(wh);
    setIsFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: {
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
    },
    [editingWarehouse, updateMutation, createMutation],
  );

  const openConfirmModal = useCallback((wh: Warehouse, type: ConfirmType) => {
    setConfirmModalState({ isOpen: true, warehouse: wh, type });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirmAction = useCallback(() => {
    const { warehouse: wh, type } = confirmModalState;
    if (!wh) return;
    if (type === 'SOFT_DELETE') softDeleteMutation.mutate(wh.id);
    else if (type === 'RESTORE') restoreMutation.mutate(wh.id);
    else if (type === 'HARD_DELETE') hardDeleteMutation.mutate(wh.id);
  }, [confirmModalState, softDeleteMutation, restoreMutation, hardDeleteMutation]);

  // ─── Derived Data ──────────────────────────────────────────────
  // Stats
  const stats = useMemo(() => {
    const total = activeWarehouses.length;
    const defaultCount = activeWarehouses.filter((w) => w.isDefault).length;
    const uniqueProvinces = new Set(activeWarehouses.map((w) => w.province));
    const allSupportedProvinces = new Set<string>();
    activeWarehouses.forEach((w) => {
      w.supportedProvinces?.forEach((p) => allSupportedProvinces.add(p));
    });
    const allSupportedDistricts = new Set<string>();
    activeWarehouses.forEach((w) => {
      w.supportedDistricts?.forEach((d) => allSupportedDistricts.add(d));
    });
    return { total, defaultCount, provinces: uniqueProvinces.size, supportedProvinces: allSupportedProvinces.size, supportedDistricts: allSupportedDistricts.size };
  }, [activeWarehouses]);

  // Filtered & Sorted
  const rawList = activeTab === 'ACTIVE' ? activeWarehouses : deletedWarehouses;

  const filteredWarehouses = useMemo(() => {
    let list = rawList;
    // Filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (wh) =>
          wh.name.toLowerCase().includes(q) ||
          wh.code.toLowerCase().includes(q) ||
          wh.province.toLowerCase().includes(q) ||
          (wh.address && wh.address.toLowerCase().includes(q)),
      );
    }
    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'code') cmp = a.code.localeCompare(b.code);
      else if (sortField === 'province') cmp = a.province.localeCompare(b.province);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [rawList, debouncedSearch, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredWarehouses.length / pageSize) || 1;
  const paginatedWarehouses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWarehouses.slice(start, start + pageSize);
  }, [filteredWarehouses, currentPage, pageSize]);

  // Reset page on filter/sort/tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortField, sortAsc, activeTab]);

  const isLoadingCurrent = activeTab === 'ACTIVE' ? isLoadingActive : isLoadingDeleted;
  const isFormLoading = createMutation.isPending || updateMutation.isPending;
  const isConfirmLoading =
    softDeleteMutation.isPending || restoreMutation.isPending || hardDeleteMutation.isPending;

  // ─── Collapse/Expand Stats Bar ────────────────────────────────
  const [isStatsExpanded, setIsStatsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResizeStats = () => {
      if (window.innerWidth >= 1024) {
        setIsStatsExpanded(true);
      }
    };
    window.addEventListener('resize', handleResizeStats);
    return () => window.removeEventListener('resize', handleResizeStats);
  }, []);

  // Sort toggle
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* ───────────────── Header ───────────────── */}
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

      {/* ───────────────── Stats Bar with Collapse/Expand ────────── */}
      <div className="relative">
        {/* Toggle button - chỉ hiện trên mobile/tablet */}
        <button
          onClick={() => setIsStatsExpanded((prev) => !prev)}
          className="lg:hidden flex items-center gap-2 w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer mb-1"
        >
          <Sliders className="h-4 w-4" />
          <span>{t('warehouseActiveTab') || 'Warehouse Stats'}</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
              {stats.total}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                isStatsExpanded ? 'rotate-180' : ''
              }`}
            />
          </span>
        </button>

        {/* Collapsible stats grid */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-hidden transition-all duration-400 ease-in-out ${
            isStatsExpanded
              ? 'max-h-96 opacity-100'
              : 'max-h-0 opacity-0 lg:max-h-96 lg:opacity-100'
          }`}
        >
          <StatCard
            icon={<WarehouseIcon className="h-5 w-5" />}
            label={t('warehouseActiveTab') || 'Active Warehouses'}
            value={stats.total}
            accent="indigo"
            subtitle={t('total') || 'Total'}
          />
          <StatCard
            icon={<Star className="h-5 w-5 fill-current" />}
            label={t('warehouseDefault') || 'Default'}
            value={stats.defaultCount}
            accent="amber"
            subtitle={stats.defaultCount > 0 ? `${stats.defaultCount} warehouse${stats.defaultCount > 1 ? 's' : ''}` : 'None'}
          />
          <StatCard
            icon={<MapPin className="h-5 w-5" />}
            label={t('warehouseProvince') || 'Provinces'}
            value={stats.provinces}
            accent="emerald"
            subtitle={t('warehouseSupportedArea') || 'Locations'}
          />
          <StatCard
            icon={<Globe className="h-5 w-5" />}
            label={t('warehouseSupportedProvinces') || 'Supported Provinces'}
            value={stats.supportedProvinces}
            accent="sky"
            subtitle={`${stats.supportedDistricts} districts`}
          />
          <StatCard
            icon={<Layers className="h-5 w-5" />}
            label={t('inTrash') || 'In Trash'}
            value={deletedWarehouses.length}
            accent="rose"
            subtitle={deletedWarehouses.length > 0 ? `${deletedWarehouses.length} item${deletedWarehouses.length > 1 ? 's' : ''}` : 'Empty'}
          />
        </div>
      </div>

      {/* ───────────────── Main Workspace ───────────────── */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Navigation Tabs Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          {/* Pill Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('ACTIVE'); }}
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
              onClick={() => { setActiveTab('TRASH'); }}
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
                }}
                className="pl-10 text-xs bg-slate-50 dark:bg-slate-800/80"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative group shrink-0">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-indigo-500/30 transition-all cursor-pointer"
                title={t('sort') || 'Sort'}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline capitalize">{sortField}</span>
              </button>
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1.5 w-40 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                {(['name', 'code', 'province'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      sortField === field
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="capitalize">{field}</span>
                    {sortField === field && (
                      <span className="text-[10px]">{sortAsc ? '▲' : '▼'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Switcher */}
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
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            <span>{t('warehouseTrashNotice')}</span>
          </div>
        )}

        {/* ───────────────── Phase 2: Loading Skeletons ───────────────── */}
        {isLoadingCurrent ? (
          <div className="animate-in fade-in duration-300">
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            )}
          </div>
        ) : paginatedWarehouses.length === 0 ? (
          /* ───────────────── Phase 2: Enhanced Empty State ───────────────── */
          <div className="py-16 text-center flex flex-col items-center gap-4 animate-in fade-in duration-300">
            {activeTab === 'ACTIVE' ? (
              <>
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <WarehouseIcon className="h-8 w-8 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-700 dark:text-slate-300 font-bold text-base">
                    {t('emptyActiveWarehouses')}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {t('emptyActiveWarehouses') || 'Get started by adding your first warehouse'}
                  </p>
                </div>
                <Button onClick={handleOpenAdd} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1.5" />
                  {t('addWarehouse')}
                </Button>
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-rose-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-700 dark:text-slate-300 font-bold text-base">
                    {t('emptyTrashWarehouses')}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {t('emptyTrashWarehouses') || 'Deleted warehouses will appear here'}
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Try moving an active warehouse to Trash
                </span>
              </>
            )}
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {paginatedWarehouses.map((wh) => (
              <WarehouseCard
                key={wh.id}
                warehouse={wh}
                isTrashView={activeTab === 'TRASH'}
                searchQuery={debouncedSearch}
                onEdit={handleOpenEdit}
                onSoftDelete={(w) => openConfirmModal(w, 'SOFT_DELETE')}
                onRestore={(w) => openConfirmModal(w, 'RESTORE')}
                onHardDelete={(w) => openConfirmModal(w, 'HARD_DELETE')}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {paginatedWarehouses.map((wh) => (
              <WarehouseRow
                key={wh.id}
                warehouse={wh}
                isTrashView={activeTab === 'TRASH'}
                searchQuery={debouncedSearch}
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
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between animate-in fade-in duration-200">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('page')} <strong className="text-slate-900 dark:text-white">{currentPage}</strong> / {totalPages}
              <span className="ml-2 opacity-60">
                ({filteredWarehouses.length} {t('total')?.toLowerCase() || 'items'})
              </span>
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
        <WarehouseFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingWarehouse}
          isLoading={isFormLoading}
        />
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