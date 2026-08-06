import type { Warehouse } from '../../../types';

export type ConfirmType = 'SOFT_DELETE' | 'RESTORE' | 'HARD_DELETE';
export type ActiveTabType = 'ACTIVE' | 'TRASH';
export type ViewMode = 'row' | 'card';
export type SortField = 'name' | 'code' | 'province';

export interface ConfirmModalState {
  isOpen: boolean;
  warehouse: Warehouse | null;
  type: ConfirmType;
}

export interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    code: string;
    name: string;
    province: string;
    district?: string;
    address?: string;
    supportedProvinces?: string[];
    supportedDistricts?: string[];
    isDefault?: boolean;
  }) => void;
  initialData?: Warehouse | null;
  isLoading?: boolean;
}

export interface WarehouseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warehouse?: Warehouse | null;
  type: ConfirmType;
  isLoading?: boolean;
}

export interface WarehouseCardProps {
  warehouse: Warehouse;
  isTrashView?: boolean;
  searchQuery?: string;
  onEdit?: (warehouse: Warehouse) => void;
  onSoftDelete?: (warehouse: Warehouse) => void;
  onRestore?: (warehouse: Warehouse) => void;
  onHardDelete?: (warehouse: Warehouse) => void;
}

export interface WarehouseRowProps {
  warehouse: Warehouse;
  isTrashView?: boolean;
  searchQuery?: string;
  onEdit?: (warehouse: Warehouse) => void;
  onSoftDelete?: (warehouse: Warehouse) => void;
  onRestore?: (warehouse: Warehouse) => void;
  onHardDelete?: (warehouse: Warehouse) => void;
}

export interface WarehouseItemProps {
  warehouse: Warehouse;
  isTrashView: boolean;
  viewMode: ViewMode;
  searchQuery: string;
  onEdit: (warehouse: Warehouse) => void;
  onSoftDelete: (warehouse: Warehouse) => void;
  onRestore: (warehouse: Warehouse) => void;
  onHardDelete: (warehouse: Warehouse) => void;
}

export interface WarehouseTableProps {
  warehouses: Warehouse[];
  activeTab: ActiveTabType;
  viewMode: ViewMode;
  searchQuery: string;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (warehouse: Warehouse) => void;
  onSoftDelete: (warehouse: Warehouse) => void;
  onRestore: (warehouse: Warehouse) => void;
  onHardDelete: (warehouse: Warehouse) => void;
}

export interface WarehouseFilterProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  activeCount: number;
  trashCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortAsc: boolean;
  onSortAscToggle: () => void;
}

export interface WarehouseStatsProps {
  totalActive: number;
  defaultWarehouseName: string;
  supportedProvincesCount: number;
  trashCount: number;
}
