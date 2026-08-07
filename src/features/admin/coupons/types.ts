import type React from 'react';
import type { CouponItem } from './components/CouponCard';

export interface CouponData {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  expiredAt?: string | null;
  status: string;
  usageCount?: number;
  createdAt?: string;
}

export interface GetCouponsParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export interface GetCouponsResponse {
  coupons: CouponData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  message?: string;
  coupon?: CouponData;
}

export interface CreateCouponData {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiredAt: string;
}

export type UpdateCouponData = Partial<CreateCouponData> & { status?: string };

export interface CouponMetrics {
  totalCoupons: number;
  activeCoupons: number;
  disabledCoupons: number;
  expiredCoupons: number;
  totalUsageCount: number;
}

export interface UseCouponsReturn {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  coupons: CouponData[];
  metrics: CouponMetrics;
  isLoading: boolean;
  isRefreshing: boolean;
  handleRefresh: () => Promise<void>;
  refetch: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalItems: number;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isValidateModalOpen: boolean;
  setIsValidateModalOpen: (open: boolean) => void;
  editingCoupon: CouponData | null;
  setEditingCoupon: (coupon: CouponData | null) => void;
  handleCreateCoupon: (data: CouponItem) => void;
  handleUpdateCoupon: (id: string, data: Partial<CouponItem>) => void;
  handleToggleStatus: (coupon: CouponItem) => void;
  handleDeleteRequest: (coupon: CouponItem) => Promise<void>;
  ConfirmDialog: React.ReactNode;
}
