import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../../lib/i18n';
import { Button } from '../../components/ui/Button';
import { fetchUsers } from '../../services/userService';
import { UserCard, type UserItem } from './components/UserCard';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Users, Search, RefreshCw, UserCheck, ShieldAlert, UserPlus } from 'lucide-react';

export const UsersFeature: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { data: apiUsers, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: 1,
  });

  const displayList: UserItem[] = (apiUsers || []) as UserItem[];

  const filteredUsers = displayList.filter((usr) => {
    const name = usr.fullName || usr.name || '';
    const email = usr.email || '';
    const phone = usr.phone || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm);

    const matchesRole = roleFilter === 'ALL' || usr.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsers = displayList.length;
  const adminCount = displayList.filter((u) => u.role === 'ADMIN').length;
  const customerCount = displayList.filter((u) => u.role === 'USER' || u.role === 'CUSTOMER').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-7 w-7 text-indigo-500" />
            {t('userManagement')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('userDesc')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-sm font-semibold shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>

          <Button variant="primary" className="gap-2 shadow-lg shadow-indigo-500/25">
            <UserPlus className="h-4 w-4" />
            + Thêm Tài Khoản Mới
          </Button>
        </div>
      </div>

      {/* Metric Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Người Dùng</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalUsers}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách Hàng (User)</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{customerCount}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quản Trị Viên (Admin)</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{adminCount}</h4>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
            Danh sách Khách hàng & Quản trị
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {filteredUsers.length} tài khoản
            </span>
          </h3>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, sđt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Role Filter */}
            <CustomSelect
              size="sm"
              className="w-36"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'ALL', label: 'Tất cả vai trò' },
                { value: 'USER', label: 'Tài khoản USER' },
                { value: 'ADMIN', label: 'Tài khoản ADMIN' },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto text-indigo-500" />
            <p className="font-semibold">Đang tải dữ liệu người dùng từ CSDL...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-slate-400">
            <Users className="h-12 w-12 mx-auto stroke-1 text-slate-500" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">Không tìm thấy tài khoản nào</h4>
            <p className="text-xs max-w-sm mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc lọc lại vai trò tài khoản.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((usr) => (
              <UserCard key={usr.id} user={usr} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
