import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import type { UserStatCardsProps } from '../types';
import { Users, UserCheck, ShieldAlert, UserX } from 'lucide-react';

export const UserStatCards: React.FC<UserStatCardsProps> = React.memo(({ metrics }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Users */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-2.5 sm:p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20 shrink-0">
          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            {t('totalUsers') || 'Tổng tài khoản'}
          </p>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {metrics.totalUsers}
          </h4>
        </div>
      </div>

      {/* Customers */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-2.5 sm:p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shrink-0">
          <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            {t('customers') || 'Khách hàng'}
          </p>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {metrics.customerCount}
          </h4>
        </div>
      </div>

      {/* Admins */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-2.5 sm:p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0">
          <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            {t('admins') || 'Quản trị viên'}
          </p>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {metrics.adminCount}
          </h4>
        </div>
      </div>

      {/* Blocked / Inactive */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="p-2.5 sm:p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 shrink-0">
          <UserX className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            {t('blockedCount') || 'Bị khóa / Tạm dừng'}
          </p>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {metrics.blockedCount}
          </h4>
        </div>
      </div>
    </div>
  );
});
