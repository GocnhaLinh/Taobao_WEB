import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../../../../lib/i18n';
import { useNotification } from '../../../../lib/notification';
import { useConfirm } from '../../../../hooks/useConfirm';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useManualRefresh } from '../../../../hooks/useManualRefresh';
import type { CouponItem } from '../components/CouponCard';
import {
  getCouponsApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi,
} from '../api/coupon.api';
import type { CouponData, UseCouponsReturn } from '../types';
import { calculateCouponMetrics, filterCoupons } from '../utils/coupon.utils';

export const useCoupons = (): UseCouponsReturn => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const { confirm, ConfirmDialog } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, pageSize]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['coupons', debouncedSearch],
    queryFn: () => getCouponsApi({ search: debouncedSearch || undefined }),
    retry: 1,
  });

  const rawCoupons: CouponData[] = data?.coupons || [];

  const filtered = useMemo(() => {
    return filterCoupons(rawCoupons, debouncedSearch, statusFilter, typeFilter);
  }, [rawCoupons, debouncedSearch, statusFilter, typeFilter]);

  const metrics = useMemo(() => {
    return calculateCouponMetrics(rawCoupons);
  }, [rawCoupons]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const { isRefreshing, handleRefresh } = useManualRefresh(refetch, 1000);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newCoupon: CouponItem) =>
      createCouponApi({
        code: newCoupon.code,
        discountType: newCoupon.type ? newCoupon.type.toLowerCase() : 'fixed',
        discountValue: newCoupon.value,
        minOrderValue: newCoupon.minOrder,
        maxDiscount: newCoupon.maxDiscount,
        expiredAt: newCoupon.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showNotification(t('couponCreated'), 'success');
    },
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
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
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
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
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
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

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    coupons: filtered,
    metrics,
    isLoading,
    isRefreshing,
    handleRefresh,
    refetch,
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
  };
};
