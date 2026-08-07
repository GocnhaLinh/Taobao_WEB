import type { UserItem, UserMetrics } from '../types';

export const filterUsers = (
  users: UserItem[],
  searchTerm: string,
  roleFilter: string,
  statusFilter: string
): UserItem[] => {
  const query = searchTerm.trim().toLowerCase();

  return users.filter((usr) => {
    const name = (usr.fullName || usr.name || '').toLowerCase();
    const email = (usr.email || '').toLowerCase();
    const phone = usr.phone || '';

    const matchesSearch = !query || name.includes(query) || email.includes(query) || phone.includes(query);
    const matchesRole = roleFilter === 'ALL' || usr.role.toUpperCase() === roleFilter.toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || (usr.status || 'ACTIVE').toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesRole && matchesStatus;
  });
};

export const calculateUserMetrics = (users: UserItem[]): UserMetrics => {
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const customerCount = users.filter((u) => u.role === 'USER' || u.role === 'CUSTOMER').length;
  const activeCount = users.filter((u) => !u.status || u.status === 'ACTIVE').length;
  const blockedCount = users.filter((u) => u.status === 'BLOCKED' || u.status === 'INACTIVE').length;

  return {
    totalUsers,
    activeCount,
    customerCount,
    adminCount,
    blockedCount,
  };
};
