import {
  Clock,
  ShoppingBag,
  Truck,
  Building2,
  CheckCircle2,
  XCircle,
  Wallet,
  RotateCcw,
  BadgeCheck,
  Warehouse,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { SelectOption } from '../../../components/ui/CustomSelect';
import type { OrderMetrics } from './types';
import type { TranslationKey } from '../../../lib/i18n';

/** Class icon dùng cho dropdown (nhỏ gọn) */
const iconClass = 'h-3.5 w-3.5 shrink-0';

/** Class icon dùng cho card thống kê (to hơn icon dropdown) */
const statIconClass = 'h-4.5 w-4.5 sm:h-5 sm:w-5';

/**
 * Cấu hình card thống kê trạng thái đơn — phần TĨNH (không phụ thuộc t()/metrics).
 * label/count được điền ĐỘNG trong OrderStatCards:
 *   label = t(labelKey), count = metrics[countKey].
 * status vừa dùng để lọc (chỉ hiện card khi status nằm trong allowedStatuses của page)
 * vừa dùng làm React key (status luôn unique).
 * Lưu ý: card "Đang vận chuyển" (status ORDERED) đại diện cho ORDERED + SHIPPING
 * — backend gộp 2 trạng thái này vào metrics.inTransitCount.
 */
export interface OrderStatCardConfig {
  status: string;
  /** Khóa i18n cho label — type-safe theo TranslationKey */
  labelKey: TranslationKey;
  countKey: keyof OrderMetrics;
  icon: ReactNode;
  chip: string;
  bar: string;
}

export const ORDER_STAT_CARDS: OrderStatCardConfig[] = [
  {
    status: 'PENDING_ORDER',
    labelKey: 'statusPendingOrder',
    countKey: 'pendingCount',
    icon: <Clock className={statIconClass} />,
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
  },
  {
    status: 'ORDERED',
    labelKey: 'statusShipping',
    countKey: 'inTransitCount',
    icon: <Truck className={statIconClass} />,
    chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    bar: 'bg-sky-500',
  },
  {
    status: 'ARRIVED_WAREHOUSE',
    labelKey: 'statusArrivedWarehouse',
    countKey: 'arrivedCount',
    icon: <Warehouse className={statIconClass} />,
    chip: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    bar: 'bg-violet-500',
  },
  {
    status: 'COMPLETED',
    labelKey: 'statusCompleted',
    countKey: 'completedCount',
    icon: <CheckCircle2 className={statIconClass} />,
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
  },
];

export const getOrderStatusOptions = (
  t: (key: any) => string,
  includeAllOption = false,
  allowedStatuses?: string[]
): SelectOption[] => {
  const options: SelectOption[] = [
    {
      value: 'PENDING_ORDER',
      label: `1. ${t('statusPendingOrderOption') || 'Đợi đặt hàng'}`,
      icon: <Clock className={iconClass} />,
    },
    {
      value: 'ORDERED',
      label: `2. ${t('statusOrderedOption') || 'Đã đặt hàng'}`,
      icon: <ShoppingBag className={iconClass} />,
    },
    {
      value: 'SHIPPING',
      label: `3. ${t('statusShippingOption') || 'Đang vận chuyển'}`,
      icon: <Truck className={iconClass} />,
    },
    {
      value: 'ARRIVED_WAREHOUSE',
      label: `4. ${t('statusArrivedWarehouseOption') || 'Đã đến kho'}`,
      icon: <Building2 className={iconClass} />,
    },
    {
      value: 'COMPLETED',
      label: `5. ${t('statusCompletedOption') || 'Hoàn thành'}`,
      icon: <CheckCircle2 className={iconClass} />,
    },
    {
      value: 'CANCELLED',
      label: t('statusCancelledOption') || 'Đã hủy đơn hàng',
      icon: <XCircle className={iconClass} />,
    },
  ];

  // Lọc theo allowedStatuses (page Order chỉ hiển thị 4 trạng thái, page Kho hiển thị 2 trạng thái)
  const filtered =
    allowedStatuses && allowedStatuses.length > 0
      ? options.filter((o) => allowedStatuses.includes(o.value))
      : options;

  if (includeAllOption) {
    return [{ value: 'ALL', label: t('allOrderStatus') || 'Tất cả trạng thái' }, ...filtered];
  }
  return filtered;
};

export const getPaymentStatusOptions = (
  t: (key: any) => string,
  includeAllOption = false
): SelectOption[] => {
  const options: SelectOption[] = [
    {
      value: 'PENDING',
      label: t('paymentPending') || 'Chưa thanh toán',
      icon: <Clock className={iconClass} />,
    },
    {
      value: 'DEPOSIT_50',
      label: t('paymentDeposit50') || 'Đã đặt cọc 50%',
      icon: <Wallet className={iconClass} />,
    },
    {
      value: 'DEPOSIT_70',
      label: t('paymentDeposit70') || 'Đã đặt cọc 70%',
      icon: <Wallet className={iconClass} />,
    },
    {
      value: 'PAID',
      label: t('paymentPaid') || 'Đã thanh toán 100%',
      icon: <BadgeCheck className={iconClass} />,
    },
    {
      value: 'REFUNDED',
      label: t('paymentRefunded') || 'Đã hoàn tiền',
      icon: <RotateCcw className={iconClass} />,
    },
    {
      value: 'FAILED',
      label: t('paymentFailed') || 'Thanh toán thất bại',
      icon: <XCircle className={iconClass} />,
    },
  ];

  if (includeAllOption) {
    return [{ value: 'ALL', label: t('allPaymentStatus') || 'Tất cả trạng thái cọc / thanh toán' }, ...options];
  }
  return options;
};

/** Trạng thái mặc định của page Order cũ: chờ đặt / đã đặt / vận chuyển + đã hủy */
export const DEFAULT_ORDER_STATUSES = ['PENDING_ORDER', 'ORDERED', 'SHIPPING', 'CANCELLED'];

/** Trạng thái của page Kho & Hoàn thành: đã đến kho + hoàn thành */
export const WAREHOUSE_ORDER_STATUSES = ['ARRIVED_WAREHOUSE', 'COMPLETED'];
