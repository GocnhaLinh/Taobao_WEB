import React from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/common/LoadingState';
import { Pagination } from '../../../components/ui/Pagination';
import { CouponCard, type CouponItem } from './components/CouponCard';
import { CouponStatCards } from './components/CouponStatCards';
import { CouponFilter } from './components/CouponFilter';
import { useCoupons } from './hooks/useCoupons';
import { Ticket, Plus, RefreshCw, Calculator } from 'lucide-react';

const CouponFormModal = React.lazy(() =>
  import('./components/CouponFormModal').then((m) => ({ default: m.CouponFormModal })),
);
const ValidateCouponModal = React.lazy(() =>
  import('./components/ValidateCouponModal').then((m) => ({ default: m.ValidateCouponModal })),
);

export const CouponsFeature: React.FC = () => {
  const { t } = useTranslation();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    coupons: rawCoupons,
    metrics,
    isLoading,
    isRefreshing,
    handleRefresh,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isValidateModalOpen,
    setIsValidateModalOpen,
    editingCoupon,
    setEditingCoupon,
    handleCreateCoupon,
    handleUpdateCoupon,
    handleToggleStatus,
    handleDeleteRequest,
    ConfirmDialog,
  } = useCoupons();

  const coupons: CouponItem[] = rawCoupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.discountType?.toUpperCase() || 'FIXED',
    value: c.discountValue,
    minOrder: c.minOrderValue,
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : undefined,
    status: c.status?.toUpperCase() || 'ACTIVE',
    expiryDate: c.expiredAt ?? undefined,
    usageCount: c.usageCount || 0,
  }));

  const paginatedCoupons = coupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const editingCouponItem: CouponItem | null = editingCoupon
    ? {
        id: editingCoupon.id,
        code: editingCoupon.code,
        type: editingCoupon.discountType?.toUpperCase() || 'FIXED',
        value: editingCoupon.discountValue,
        minOrder: editingCoupon.minOrderValue,
        maxDiscount: editingCoupon.maxDiscount ? Number(editingCoupon.maxDiscount) : undefined,
        status: editingCoupon.status?.toUpperCase() || 'ACTIVE',
        expiryDate: editingCoupon.expiredAt ?? undefined,
        usageCount: editingCoupon.usageCount || 0,
      }
    : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Ticket className="h-7 w-7 text-indigo-500" />
            {t('couponManagement')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('couponDesc')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-xs font-semibold shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </button>

          <Button
            variant="secondary"
            onClick={() => setIsValidateModalOpen(true)}
            className="gap-2 text-xs"
          >
            <Calculator className="h-4 w-4 text-indigo-500" />
            {t('testCoupon')}
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow-lg shadow-indigo-500/25 self-start sm:self-auto text-xs"
          >
            <Plus className="h-4 w-4" />
            {t('createCoupon')}
          </Button>
        </div>
      </div>

      {/* Reusable Metric Stat Cards Component */}
      <CouponStatCards metrics={metrics} />

      {/* Main Container & Filter Controls */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Reusable Filter Controls Component */}
        <CouponFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          totalCount={coupons.length}
        />

        {/* Coupons Cards Grid */}
        {isLoading || isRefreshing ? (
          <LoadingState text={t('loadingCoupons')} />
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center space-y-3 animate-in fade-in duration-300">
            <Ticket className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto stroke-1" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">{t('noCouponsFound')}</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t('noCouponsHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCoupons.map((cp, index) => (
                <div key={cp.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 60}ms` }}>
                  <CouponCard
                    coupon={cp}
                    onEdit={(item) => {
                      const raw = rawCoupons.find((rc) => rc.id === item.id) || null;
                      setEditingCoupon(raw);
                    }}
                    onToggleStatus={handleToggleStatus}
                    onDeleteRequest={handleDeleteRequest}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  totalItems={totalItems}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        {/* Create / Edit Unified Coupon Modal */}
        <CouponFormModal
          isOpen={isCreateModalOpen || Boolean(editingCoupon)}
          editingCoupon={editingCouponItem}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingCoupon(null);
          }}
          onSubmit={(formData) => {
            if (editingCoupon) {
              handleUpdateCoupon(editingCoupon.id, formData);
            } else {
              handleCreateCoupon(formData as CouponItem);
            }
          }}
        />

        {/* Validate / Test Coupon Modal */}
        <ValidateCouponModal
          isOpen={isValidateModalOpen}
          onClose={() => setIsValidateModalOpen(false)}
        />
      </React.Suspense>

      {/* Reusable Confirm Dialog */}
      {ConfirmDialog}
    </div>
  );
};
