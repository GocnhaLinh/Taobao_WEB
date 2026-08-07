import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { Badge } from '../../../../components/ui/Badge';
import { TrashCountdownBar } from '../../../../components/ui/TrashCountdownBar';
import { Mail, Phone, Calendar, ShieldCheck, User as UserIcon, Edit2, Trash2, RotateCcw } from 'lucide-react';
import type { UserRowCardProps } from '../types';

export const UserRowCard: React.FC<UserRowCardProps> = React.memo(({
  user,
  onEdit,
  onDelete,
  onRestore,
  onSelect,
}) => {
  const { t } = useTranslation();
  const displayName = user.fullName || user.name || t('anonymousUser');
  const initial = displayName.charAt(0).toUpperCase();
  const isAdmin = user.role.toUpperCase() === 'ADMIN';

  const statusUpper = (user.status || 'ACTIVE').toUpperCase();
  const isDeleted = statusUpper === 'DELETED';
  const isBlocked = statusUpper === 'BLOCKED' || statusUpper === 'INACTIVE' || isDeleted;

  return (
    <div
      onClick={() => onSelect && onSelect(user)}
      className="group relative overflow-hidden bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-3.5 space-y-3 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/15 hover:scale-[1.015] transition-all duration-300 cursor-pointer min-w-0 flex flex-col justify-between"
    >
      {/* Large Spy ID Badge Portrait Image Area (h-48 sm:h-52) */}
      <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 shadow-inner group-hover:shadow-md transition duration-300 shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-950 flex flex-col items-center justify-center gap-1.5 text-white p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-2xl font-black ring-4 ring-white/10">
              {initial}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300/80 mt-1">
              ID PASS #{user.id.slice(-6)}
            </span>
          </div>
        )}

        {/* Floating Glassmorphism Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <Badge variant={isAdmin ? 'danger' : 'neutral'} className="shadow-lg backdrop-blur-md bg-slate-950/70 border border-white/20 px-2.5 py-1 text-xs">
            {isAdmin ? (
              <span className="flex items-center gap-1 font-black text-rose-400">
                <ShieldCheck className="h-3.5 w-3.5" /> ADMIN
              </span>
            ) : (
              <span className="flex items-center gap-1 font-bold text-slate-200">
                <UserIcon className="h-3.5 w-3.5 text-indigo-400" /> USER
              </span>
            )}
          </Badge>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border ${
              isBlocked
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {statusUpper}
          </span>
        </div>
      </div>

      {/* Card Details Section */}
      <div className="px-1 space-y-2.5 flex-1 flex flex-col justify-between">
        {/* Large Prominent Name & Email */}
        <div>
          <h4 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
            {displayName}
          </h4>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 min-w-0">
            <Mail className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{user.email}</span>
          </p>
        </div>

        {/* Soft-Delete Auto Cleanup Countdown Bar */}
        {isDeleted && (
          <TrashCountdownBar
            deletedAt={user.updatedAt || user.createdAt}
            maxDays={30}
            variant="card"
          />
        )}

        {/* Phone, Date & Action Buttons Footer */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold min-w-0">
              <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{user.phone || 'N/A'}</span>
            </div>
            {user.createdAt && (
              <span className="text-[11px] text-slate-400 font-medium hidden xs:flex items-center gap-1 shrink-0">
                <Calendar className="h-3 w-3 text-slate-400" />
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {isDeleted ? (
              <>
                {onRestore && (
                  <button
                    type="button"
                    onClick={() => onRestore(user)}
                    className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition cursor-pointer"
                    title={t('restore') || 'Khôi phục'}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(user)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer"
                    title={t('deletePermanent') || 'Xóa vĩnh viễn'}
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </button>
                )}
              </>
            ) : (
              <>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(user)}
                    className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition cursor-pointer"
                    title={t('edit') || 'Sửa'}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(user)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer"
                    title={t('delete') || 'Xóa'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
