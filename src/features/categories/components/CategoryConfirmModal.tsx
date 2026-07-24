import React from 'react';
import { AlertTriangle, Archive, RotateCcw } from 'lucide-react';
import type { Category } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export type ConfirmType = 'SOFT_DELETE' | 'RESTORE' | 'HARD_DELETE';

interface CategoryConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: Category | null;
  type: ConfirmType;
  isLoading?: boolean;
}

export const CategoryConfirmModal: React.FC<CategoryConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category,
  type,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  if (!category) return null;

  const getConfig = () => {
    switch (type) {
      case 'SOFT_DELETE':
        return {
          title: t('confirmSoftDeleteTitle') || 'Xác nhận chuyển vào Thùng rác',
          btnText: t('softDelete') || 'Chuyển vào Thùng rác',
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white border-none',
          boxClass: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300',
          icon: <Archive className="h-6 w-6 shrink-0 text-amber-500" />,
          message: (
            <span>
              Danh mục <strong className="font-bold underline">{category.name}</strong> sẽ được chuyển vào Thùng rác. Bạn có thể khôi phục lại bất kỳ lúc nào trong vòng 30 ngày.
            </span>
          ),
        };
      case 'RESTORE':
        return {
          title: t('confirmRestoreTitle') || 'Xác nhận khôi phục danh mục',
          btnText: t('restore') || 'Khôi Phục',
          btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white border-none',
          boxClass: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300',
          icon: <RotateCcw className="h-6 w-6 shrink-0 text-emerald-500" />,
          message: (
            <span>
              Bạn có chắc chắn muốn khôi phục danh mục <strong className="font-bold underline">{category.name}</strong> trở lại danh sách hoạt động?
            </span>
          ),
        };
      case 'HARD_DELETE':
      default:
        return {
          title: t('confirmHardDeleteTitle') || 'Cảnh báo: Xóa vĩnh viễn danh mục',
          btnText: t('hardDelete') || 'Xóa Vĩnh Viễn',
          btnClass: 'bg-rose-600 hover:bg-rose-700 text-white border-none',
          boxClass: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300',
          icon: <AlertTriangle className="h-6 w-6 shrink-0 text-rose-500 animate-bounce" />,
          message: (
            <span>
              Hành động này sẽ <strong>XÓA VĨNH VIỄN</strong> danh mục <strong className="font-bold underline">{category.name}</strong> khỏi cơ sở dữ liệu và <strong>KHÔNG THỂ KHÔI PHỤC LẠI</strong>. Bạn có chắc chắn?
            </span>
          ),
        };
    }
  };

  const config = getConfig();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel') || 'Hủy'}
          </Button>
          <Button
            variant="primary"
            className={config.btnClass}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {config.btnText}
          </Button>
        </>
      }
    >
      <div className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-medium ${config.boxClass}`}>
        {config.icon}
        <p>{config.message}</p>
      </div>
    </Modal>
  );
};
