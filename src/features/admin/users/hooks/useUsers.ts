import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../../hooks/useDebounce';
import { getUsersApi } from '../api/user.api';
import type { UserItem, UserTabType, UseUsersReturn } from '../types';
import { calculateUserMetrics, filterUsers } from '../utils/user.utils';

export const useUsers = (): UseUsersReturn => {
  const [activeTab, setActiveTab] = useState<UserTabType>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: rawUsers = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersApi,
    retry: 1,
  });

  const metrics = useMemo(() => calculateUserMetrics(rawUsers), [rawUsers]);

  const activeUsers = useMemo(
    () => rawUsers.filter((u) => u.status?.toUpperCase() !== 'DELETED'),
    [rawUsers]
  );
  const trashUsers = useMemo(
    () => rawUsers.filter((u) => u.status?.toUpperCase() === 'DELETED'),
    [rawUsers]
  );

  const targetList = activeTab === 'TRASH' ? trashUsers : activeUsers;

  const filteredUsers = useMemo(() => {
    return filterUsers(targetList, debouncedSearch, roleFilter, statusFilter);
  }, [targetList, debouncedSearch, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, validCurrentPage, pageSize]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (user: UserItem) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  return {
    activeTab,
    setActiveTab,
    activeCount: activeUsers.length,
    trashCount: trashUsers.length,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage: validCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalUsersCount: filteredUsers.length,
    rawUsers,
    filteredUsers,
    paginatedUsers,
    metrics,
    isLoading,
    refetch,
    selectedUser,
    setSelectedUser,
    editingUser,
    setEditingUser,
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDetail,
  };
};
