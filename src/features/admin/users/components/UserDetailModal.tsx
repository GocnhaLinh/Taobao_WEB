import React from "react";
import { Modal } from "../../../../components/ui/Modal";
import { Badge } from "../../../../components/ui/Badge";
import { useTranslation } from "../../../../lib/i18n";
import type { UserDetailModalProps } from "../types";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { t } = useTranslation();

  if (!user) return null;

  const displayName = user.fullName || user.name || t("anonymousUser");
  const initial = displayName.charAt(0).toUpperCase();
  const isAdmin = user.role.toUpperCase() === "ADMIN";

  const modalTitleNode = (
    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base sm:text-lg">
      <User className="h-5 w-5 text-indigo-500 shrink-0" />
      <span>{t("userDetailTitle")}</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitleNode}
      maxWidth="md"
    >
      <div className="space-y-5 text-slate-900 dark:text-white">
        {/* Header Profile Info */}
        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              {initial}
            </div>
          )}

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg truncate">
                {displayName}
              </h3>
              <Badge
                variant={isAdmin ? "danger" : "neutral"}
                className="shrink-0"
              >
                {isAdmin ? "ADMIN" : "USER"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
              ID: {user.id}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3 bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-indigo-500" /> Email:
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 break-all">
              {user.email}
            </p>
          </div>

          <div className="p-3 bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-500" />{" "}
              {t("userPhoneLabel")}:
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {user.phone || "N/A"}
            </p>
          </div>

          <div className="p-3 bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />{" "}
              {t("userRoleLabel")}:
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">
              {user.role}
            </p>
          </div>

          <div className="p-3 bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              {user.status === "BLOCKED" ? (
                <XCircle className="h-3.5 w-3.5 text-rose-500" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
              {t("userStatusLabel")}:
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">
              {user.status || "ACTIVE"}
            </p>
          </div>
        </div>

        {/* Date Info */}
        {user.createdAt && (
          <div className="p-3 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/5 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {t("createdAt")}:
            </span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {new Date(user.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
