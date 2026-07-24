import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { User, Mail, Phone, Calendar, ShieldCheck, UserCheck } from 'lucide-react';

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
}

interface UserCardProps {
  user: UserItem;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const displayName = user.fullName || user.name || 'Khách hàng';
  const initial = displayName.charAt(0).toUpperCase();
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl space-y-4 hover:border-indigo-500/40 hover:shadow-lg transition duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              {initial}
            </div>
          )}

          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-base line-clamp-1">{displayName}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate max-w-[170px]">{user.email}</span>
            </p>
          </div>
        </div>

        <Badge variant={isAdmin ? 'danger' : 'neutral'}>
          {user.role}
        </Badge>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Phone className="h-3 w-3 text-slate-400" /> SĐT
          </span>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {user.phone || 'Chưa cập nhật'}
          </p>
        </div>

        <div className="space-y-1 text-right">
          <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
            <UserCheck className="h-3 w-3 text-emerald-500" /> Trạng thái
          </span>
          <p className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">
            {user.status || 'ACTIVE'}
          </p>
        </div>
      </div>

      {user.createdAt && (
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Tham gia:
          </span>
          <span className="font-medium text-slate-500 dark:text-slate-400">
            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      )}
    </div>
  );
};
