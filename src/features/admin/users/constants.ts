import type { SelectOption } from '../../../components/ui/CustomSelect';
import type { TranslateFn } from '../../../lib/i18n';

export const getUserRoleOptions = (t: TranslateFn, includeAll = false): SelectOption[] => {
  const options: SelectOption[] = [];
  if (includeAll) {
    options.push({ value: 'ALL', label: t('allRoles') || 'Tất cả vai trò' });
  }
  options.push(
    { value: 'USER', label: t('userRole') || 'Khách hàng (User)' },
    { value: 'ADMIN', label: t('adminRoleLabel') || 'Quản trị viên (Admin)' }
  );
  return options;
};

export const getUserStatusOptions = (t: TranslateFn, includeAll = false): SelectOption[] => {
  const options: SelectOption[] = [];
  if (includeAll) {
    options.push({ value: 'ALL', label: t('allStatuses') || 'Tất cả trạng thái' });
  }
  options.push(
    { value: 'ACTIVE', label: t('statusActive') || 'Hoạt động' },
    { value: 'INACTIVE', label: t('statusInactive') || 'Tạm ngưng' },
    { value: 'BLOCKED', label: t('statusBlocked') || 'Đã khóa' }
  );
  return options;
};
