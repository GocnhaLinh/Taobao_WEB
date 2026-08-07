import type { TranslateFn } from '../../../lib/i18n';

export const getCouponStatusOptions = (t: TranslateFn) => [
  { value: 'ALL', label: t('allStatuses') },
  { value: 'ACTIVE', label: t('activeStatus') },
  { value: 'DISABLED', label: t('disabledStatus') },
  { value: 'EXPIRED', label: t('expiredStatus') },
];

export const getCouponTypeOptions = (t: TranslateFn) => [
  { value: 'ALL', label: t('allTypes') },
  { value: 'FIXED', label: t('fixedAmount') },
  { value: 'PERCENT', label: t('percentDiscount') },
];
