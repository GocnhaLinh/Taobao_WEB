export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  status: string;
  deletedAt?: string;
}

export type ConfirmType = 'SOFT_DELETE' | 'RESTORE' | 'HARD_DELETE';
export type ActiveTabType = 'ACTIVE' | 'TRASH';
export type ViewMode = 'row' | 'card';

export interface ConfirmModalState {
  isOpen: boolean;
  brand: Brand | null;
  type: ConfirmType;
}

export interface BrandCardProps {
  brand: Brand;
  isTrashView?: boolean;
  onEdit: (brand: Brand) => void;
  onSoftDelete: (brand: Brand) => void;
  onRestore: (brand: Brand) => void;
  onHardDelete: (brand: Brand) => void;
}

export interface BrandRowProps {
  brand: Brand;
  isTrashView?: boolean;
  onEdit: (brand: Brand) => void;
  onSoftDelete: (brand: Brand) => void;
  onRestore: (brand: Brand) => void;
  onHardDelete: (brand: Brand) => void;
}

export interface BrandItemProps {
  brand: Brand;
  isTrashView: boolean;
  viewMode: ViewMode;
  onEdit: (brand: Brand) => void;
  onSoftDelete: (brand: Brand) => void;
  onRestore: (brand: Brand) => void;
  onHardDelete: (brand: Brand) => void;
}

export interface BrandTableProps {
  brands: Brand[];
  activeTab: ActiveTabType;
  viewMode: ViewMode;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (brand: Brand) => void;
  onSoftDelete: (brand: Brand) => void;
  onRestore: (brand: Brand) => void;
  onHardDelete: (brand: Brand) => void;
}

export interface BrandFilterProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  activeCount: number;
  trashCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; logo?: string; description?: string }) => void;
  initialData?: Brand | null;
  isLoading?: boolean;
}

export interface BrandConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  brand: Brand | null;
  type: ConfirmType;
  isLoading?: boolean;
}
