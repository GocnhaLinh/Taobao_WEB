import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../../lib/i18n';
import { useNotification } from '../../lib/notification';
import { useConfirm } from '../../lib/useConfirm';
import { useDebounce } from '../../lib/useDebounce';
import { Button } from '../../components/ui/Button';
import { CouponCard, type CouponItem } from './components/CouponCard';

const CreateCouponModal = React.lazy(() =>
  import('./components/CreateCouponModal').then((m) => ({ default: m.CreateCouponModal })),
);
const EditCouponModal = React.lazy(() =>
  import('./components/EditCouponModal').then((m) => ({ default: m.EditCouponModal })),
);
const ValidateCouponModal = React.lazy(() =>
  import('./components/ValidateCouponModal').then((m) => ({ default: m.ValidateCouponModal })),
);
import {
  getCouponsApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi,
} from '../../services/couponService';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Ticket, Search, Plus, RefreshCw, Calculator, Power, Clock } from 'lucide-react';

export const CouponsFeature: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const { confirm, ConfirmDialog } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['coupons', debouncedSearch],
    queryFn: () => getCouponsApi({ search: debouncedSearch || undefined }),
    retry: 1,
  });

  const rawCoupons = data?.coupons || [];

  const coupons: CouponItem[] = rawCoupons
    .filter((c) => c.status !== 'DELETED')
    .map((c) => ({
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

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newCoupon: CouponItem) =>
      createCouponApi({
        code: newCoupon.code,
        discountType: newCoupon.type.toLowerCase(),
        discountValue: newCoupon.value,
        minOrderValue: newCoupon.minOrder,
        maxDiscount: newCoupon.maxDiscount,
        expiredAt: newCoupon.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showNotification(t('couponCreated'), 'success');
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.error || err.message || 'Failed to create', 'error');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CouponItem> }) =>
      updateCouponApi(id, {
        code: data.code,
        discountType: data.type?.toLowerCase(),
        discountValue: data.value,
        minOrderValue: data.minOrder,
        maxDiscount: data.maxDiscount,
        expiredAt: data.expiryDate,
        status: data.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showNotification(t('couponUpdated'), 'success');
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.error || err.message || 'Failed to update', 'error');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCouponApi(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showNotification(t('couponDeleted'), 'success');
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.error || err.message || 'Failed to delete', 'error');
    },
  });

  const handleCreateCoupon = (newCoupon: CouponItem) => {
    createMutation.mutate(newCoupon);
  };

  const handleUpdateCoupon = (id: string, updatedData: Partial<CouponItem>) => {
    updateMutation.mutate({ id, data: updatedData });
  };

  const handleToggleStatus = (coupon: CouponItem) => {
    const nextStatus = coupon.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    updateMutation.mutate({
      id: coupon.id,
      data: { status: nextStatus },
    });
  };

  const handleDeleteRequest = async (coupon: CouponItem) => {
    const isConfirmed = await confirm({
      title: t('confirmDeleteCouponTitle'),
      description: t('confirmDeleteCouponDesc', { code: coupon.code }),
      confirmText: t('confirmDeleteCouponBtn'),
    });

    if (isConfirmed) {
      deleteMutation.mutate(coupon.id);
    }
  };

  // Helper check expiration
  const isCouponExpired = (c: CouponItem) => {
    if (c.status === 'EXPIRED') return true;
    if (c.expiryDate) {
      const time = new Date(c.expiryDate).getTime();
      if (!isNaN(time) && time < Date.now()) return true;
    }
    return false;
  };

  const filteredCoupons = coupons.filter((cp) => {
    const matchesSearch = cp.code.toLowerCase().includes(searchTerm.toLowerCase());
    const isExpired = isCouponExpired(cp);

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'EXPIRED'
        ? isExpired
        : statusFilter === 'ACTIVE'
        ? cp.status === 'ACTIVE' && !isExpired
        : cp.status === statusFilter && !isExpired;

    const matchesType = typeFilter === 'ALL' || cp.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = coupons.filter((c) => c.status === 'ACTIVE' && !isCouponExpired(c)).length;
  const disabledCount = coupons.filter((c) => c.status === 'DISABLED' && !isCouponExpired(c)).length;
  const expiredCount = coupons.filter((c) => isCouponExpired(c)).length;

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
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-xs font-semibold shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
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

      {/* Metric Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('activeCountLabel')}</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{activeCount}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
            <Power className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('disabledCountLabel')}</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{disabledCount}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('expiredCountLabel')}</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{expiredCount}</h4>
          </div>
        </div>
      </div>

      {/* Main Container & Filter Controls */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
              {t('voucherList')}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                {t('voucherCount', { count: filteredCoupons.length })}
              </span>
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1 lg:w-60">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchCouponPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Status Filter */}
              <CustomSelect
                size="sm"
                className="w-full sm:w-44"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ALL', label: t('allStatuses') },
                  { value: 'ACTIVE', label: t('activeStatus') },
                  { value: 'DISABLED', label: t('disabledStatus') },
                  { value: 'EXPIRED', label: t('expiredStatus') },
                ]}
              />

              {/* Type Filter */}
              <CustomSelect
                size="sm"
                className="w-full sm:w-36"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: 'ALL', label: t('allTypes') },
                  { value: 'FIXED', label: t('fixedAmount') },
                  { value: 'PERCENT', label: t('percentDiscount') },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Coupons Cards Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto text-indigo-500" />
            <p className="font-semibold">{t('loadingCoupons')}</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-16 text-center space-y-3 animate-in fade-in duration-300">
            <Ticket className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto stroke-1" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">{t('noCouponsFound')}</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t('noCouponsHint')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((cp, index) => (
              <div key={cp.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 60}ms` }}>
              <CouponCard
                coupon={cp}
                onEdit={(item) => setEditingCoupon(item)}
                onToggleStatus={handleToggleStatus}
                onDeleteRequest={handleDeleteRequest}
              />
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        {/* Create Coupon Modal */}
        <CreateCouponModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCoupon}
        />

        {/* Edit Coupon Modal */}
        <EditCouponModal
          coupon={editingCoupon}
          isOpen={Boolean(editingCoupon)}
          onClose={() => setEditingCoupon(null)}
          onUpdate={handleUpdateCoupon}
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
