import React, { useState } from "react";
import { useTranslation } from "../../../lib/i18n";
import { useManualRefresh } from "../../../hooks/useManualRefresh";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { LoadingState } from "../../../components/common/LoadingState";
import { Users, RefreshCw, UserPlus } from "lucide-react";
import { useUsers } from "./hooks/useUsers";
import { UserStatCards } from "./components/UserStatCards";
import { UserFilter } from "./components/UserFilter";
import { UserRowCard } from "./components/UserRowCard";
import { UserFormModal } from "./components/UserFormModal";
import { UserDetailModal } from "./components/UserDetailModal";
import { deleteUserApi, restoreUserApi } from "./api/user.api";
import type { UserItem } from "./types";

export const UsersFeature: React.FC = () => {
  const { t } = useTranslation();

  const {
    activeTab,
    setActiveTab,
    activeCount,
    trashCount,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalUsersCount,
    paginatedUsers,
    metrics,
    isLoading,
    refetch,
    selectedUser,
    editingUser,
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDetail,
  } = useUsers();

  const { isRefreshing, handleRefresh: handleManualRefresh } = useManualRefresh(refetch);

  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      setIsDeleting(true);
      await deleteUserApi(deletingUser.id);
      refetch();
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Lỗi khi xóa người dùng:", error.message || err);
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  const handleRestore = async (user: UserItem) => {
    try {
      await restoreUserApi(user.id);
      refetch();
    } catch (err: unknown) {
      console.error('Lỗi khi khôi phục người dùng:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-2 duration-500 min-w-0 max-w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500 shrink-0" />
            <span className="truncate">
              {t("userManagement") || "Quản Lý Tài Khoản Người Dùng"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-none">
            {t("userDesc") ||
              "Quản lý tài khoản khách hàng, quản trị viên, phân quyền và trạng thái hệ thống."}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading || isRefreshing}
            className="font-semibold text-xs sm:text-sm"
          >
            <RefreshCw
              className={`h-4 w-4 text-indigo-500 mr-1.5 ${isLoading || isRefreshing ? "animate-spin" : ""}`}
            />
            {t("refresh") || "Làm mới"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 shadow-lg shadow-indigo-500/25 font-bold text-xs sm:text-sm"
          >
            <UserPlus className="h-4 w-4" />
            {t("addNewAccount") || "Tạo tài khoản mới"}
          </Button>
        </div>
      </div>

      {/* Metric Stat Summary Cards */}
      <UserStatCards metrics={metrics} />

      {/* Main Content Card Container */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4 sm:space-y-6 min-w-0">
        {/* Header Filter Row with Pill Tab Switcher [Tài khoản] / [Thùng rác] */}
        <UserFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCount={activeCount}
          trashCount={trashCount}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          totalCount={totalUsersCount}
        />

        {/* User Card Grid / States */}
        {isLoading || isRefreshing ? (
          <LoadingState text={t("loadingUsers") || "Đang tải danh sách tài khoản..."} />
        ) : paginatedUsers.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-slate-400 animate-in fade-in duration-300">
            <Users className="h-12 w-12 mx-auto stroke-1 text-slate-500" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">
              {t("noUsersFound") || "Không tìm thấy tài khoản nào"}
            </h4>
            <p className="text-xs max-w-sm mx-auto">
              {t("noUsersHint") ||
                "Thử thay đổi từ khóa tìm kiếm hoặc cài đặt bộ lọc."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {paginatedUsers.map((usr, index) => (
              <div
                key={usr.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <UserRowCard
                  user={usr}
                  onSelect={handleOpenDetail}
                  onEdit={handleOpenEdit}
                  onDelete={(u) => setDeletingUser(u)}
                  onRestore={handleRestore}
                />
              </div>
            ))}
          </div>
        )}

        {/* Universal Pagination */}
        {totalUsersCount > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalUsersCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel={t("userAccountLabel") || "tài khoản"}
          />
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        editingUser={editingUser}
        onSuccess={refetch}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
      />

      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title={t("deleteUserTitle") || "Xóa tài khoản người dùng"}
        description={
          t("deleteUserDesc", {
            name: deletingUser?.fullName || deletingUser?.email || "",
          }) ||
          `Bạn có chắc chắn muốn xóa tài khoản ${deletingUser?.fullName || deletingUser?.email}?`
        }
        confirmText={t("delete") || "Xóa"}
        cancelText={t("cancel") || "Hủy"}
        isLoading={isDeleting}
      />
    </div>
  );
};
