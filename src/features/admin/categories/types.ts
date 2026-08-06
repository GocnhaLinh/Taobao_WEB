export type SexType = 'MALE' | 'FEMALE' | 'KID' | 'OTHER' | 'UNISEX';

export interface Category {
  id: string;
  name: string;
  slug: string;
  sex?: SexType | string;
  status: string;
  deletedAt?: string;
}

export interface CategoryLabel {
  id: string;
  name: string;
  icon?: string;
}

export type ConfirmType = 'SOFT_DELETE' | 'RESTORE' | 'HARD_DELETE';
export type ActiveTabType = 'ACTIVE' | 'TRASH';
export type ViewMode = 'row' | 'card';

export interface ConfirmModalState {
  isOpen: boolean;
  category: Category | null;
  type: ConfirmType;
}

export interface CategoryCardProps {
  category: Category;
  labelsMap: Record<string, string>;
  isTrashView?: boolean;
  onEdit: (category: Category) => void;
  onSoftDelete: (category: Category) => void;
  onRestore: (category: Category) => void;
  onHardDelete: (category: Category) => void;
}

export interface CategoryRowProps {
  category: Category;
  labelsMap: Record<string, string>;
  isTrashView?: boolean;
  onEdit: (category: Category) => void;
  onSoftDelete: (category: Category) => void;
  onRestore: (category: Category) => void;
  onHardDelete: (category: Category) => void;
}

export interface CategoryItemProps {
  category: Category;
  labelsMap: Record<string, string>;
  isTrashView: boolean;
  viewMode: ViewMode;
  onEdit: (category: Category) => void;
  onSoftDelete: (category: Category) => void;
  onRestore: (category: Category) => void;
  onHardDelete: (category: Category) => void;
}

export interface CategoryTableProps {
  categories: Category[];
  labelsMap: Record<string, string>;
  activeTab: ActiveTabType;
  viewMode: ViewMode;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (category: Category) => void;
  onSoftDelete: (category: Category) => void;
  onRestore: (category: Category) => void;
  onHardDelete: (category: Category) => void;
}

export interface CategoryFilterProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  activeCount: number;
  trashCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; slug: string; sex: string }) => void;
  initialData?: Category | null;
  defaultSex?: string;
  isLoading?: boolean;
  onLabelsChanged?: () => void;
}

export interface CategoryConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: Category | null;
  type: ConfirmType;
  isLoading?: boolean;
}
