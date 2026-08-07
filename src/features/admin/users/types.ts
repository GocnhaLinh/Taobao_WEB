export type UserRoleType = 'ALL' | 'USER' | 'ADMIN' | 'CUSTOMER';
export type UserStatusType = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'DELETED';
export type UserTabType = 'ACTIVE' | 'TRASH';

export interface UserItem {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string | null;
  role: string;
  avatar?: string | null;
  status?: string;
  orders?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUsersParams {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  users: UserItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserMetrics {
  totalUsers: number;
  activeCount: number;
  customerCount: number;
  adminCount: number;
  blockedCount: number;
}

export interface UserFilterProps {
  activeTab: UserTabType;
  onTabChange: (tab: UserTabType) => void;
  activeCount: number;
  trashCount: number;
  searchTerm: string;
  onSearchChange: (q: string) => void;
  roleFilter: string;
  onRoleChange: (role: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  totalCount: number;
}

export interface UserStatCardsProps {
  metrics: UserMetrics;
}

export interface UserRowCardProps {
  user: UserItem;
  onEdit?: (user: UserItem) => void;
  onDelete?: (user: UserItem) => void;
  onRestore?: (user: UserItem) => void;
  onSelect?: (user: UserItem) => void;
}

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: UserItem | null;
  onSuccess?: () => void;
}

export interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  pass: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  avatar?: string;
}

export interface UseUsersReturn {
  activeTab: UserTabType;
  setActiveTab: (t: UserTabType) => void;
  activeCount: number;
  trashCount: number;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
  totalUsersCount: number;
  rawUsers: UserItem[];
  filteredUsers: UserItem[];
  paginatedUsers: UserItem[];
  metrics: UserMetrics;
  isLoading: boolean;
  refetch: () => void;
  selectedUser: UserItem | null;
  setSelectedUser: (u: UserItem | null) => void;
  editingUser: UserItem | null;
  setEditingUser: (u: UserItem | null) => void;
  isFormModalOpen: boolean;
  setIsFormModalOpen: (open: boolean) => void;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  handleOpenCreate: () => void;
  handleOpenEdit: (u: UserItem) => void;
  handleOpenDetail: (u: UserItem) => void;
}
