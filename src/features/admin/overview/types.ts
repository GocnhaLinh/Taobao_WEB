import type { ReactNode } from 'react';
import type { Warehouse } from '../../../types';

export interface DashboardMonthlyPoint {
  /** Month number 1..12 (label is formatted per locale on the frontend) */
  month: number;
  /** e.g. "2026-08" */
  key: string;
  /** Total revenue of that month (VND) */
  revenue: number;
  /** Order count of that month */
  orders: number;
}

export interface DashboardTopProduct {
  productId: string | null;
  productName: string;
  thumbnail: string | null;
  category: string | null;
  quantitySold: number;
  revenue: number;
}

export interface DashboardTopBuyer {
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  totalSpent: number;
  ordersCount: number;
}

export interface DashboardStats {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCategories: number;
    totalWarehouses: number;
    totalActiveCoupons: number;
    totalUsers: number;
    revenueThisMonth: number;
    ordersThisMonth: number;
    revenueGrowthPercent: number;
    ordersGrowthPercent: number;
  };
  monthlyRevenue: DashboardMonthlyPoint[];
  topProducts: DashboardTopProduct[];
  topBuyers: DashboardTopBuyer[];
}

export interface UseOverviewReturn {
  stats: DashboardStats | undefined;
  currentRate: number | undefined;
  isFeeError: boolean;
  warehouses: Warehouse[];
  supportedAreas: string;
  isStatsLoading: boolean;
  isStatsError: boolean;
  isWarehousesLoading: boolean;
  isWarehousesError: boolean;
  isRefreshing: boolean;
  handleRefresh: () => void;
}

/* ------------------------------ component props ------------------------------ */

export interface OverviewMetricsGridProps {
  exchangeRate: number | undefined;
  metrics?: DashboardStats['metrics'];
  supportedAreas: string;
}

export interface MetricCardProps {
  label: string;
  icon: ReactNode;
  iconBg: string;
  hoverBorder: string;
  value?: ReactNode;
  footer?: ReactNode;
}

export interface RevenueChartCardProps {
  data: DashboardMonthlyPoint[];
}

export interface TopProductsLeaderboardProps {
  products: DashboardTopProduct[];
}

export interface TopBuyersLeaderboardProps {
  buyers: DashboardTopBuyer[];
}

export interface WarehousesOverviewGridProps {
  warehouses: Warehouse[];
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

/* --------------------- TopRankings internal shared pieces --------------------- */

export interface RankingCardProps {
  children: ReactNode;
}

export interface RankingHeaderProps {
  icon: ReactNode;
  iconClass: string;
  title: string;
  badgeVariant: 'warning' | 'info';
  badgeIcon?: ReactNode;
  badgeText: string;
  badgeTextShort: string;
}

export interface RankingEmptyProps {
  icon: ReactNode;
  label: string;
}

export interface RankingRowProps {
  rank: number;
  media: ReactNode;
  title: string;
  subtitle: string;
  rightTop: ReactNode;
  rightBottom: ReactNode;
}
