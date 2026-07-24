import React from 'react';
import type { Brand } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

export type ConfirmType = 'SOFT_DELETE' | 'RESTORE' | 'HARD_DELETE';

interface BrandConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  brand?: Brand | null;
  type: ConfirmType;
  isLoading?: boolean;
}

export const BrandConfirmModal: React.FC<BrandConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  brand,
  type,
  isLoading = false,
}) => {
  if (!brand) return null;

  const getContent = () => {
    switch (type) {
      case 'SOFT_DELETE':
        return {
          title: 'Xác nhận chuyển vào Thùng rác',
          icon: <Trash2 className="h-6 w-6 text-amber-500" />,
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          message: (
            <span>
              Bạn có chắc chắn muốn chuyển thương hiệu{' '}
              <strong className="text-slate-900 dark:text-white font-bold">"{brand.name}"</strong> vào Thùng rác?
              Thương hiệu sẽ được lưu giữ tối đa 30 ngày trước khi tự động xóa.
            </span>
          ),
          confirmButtonText: 'Chuyển vào Thùng rác',
          confirmVariant: 'danger' as const,
        };
      case 'RESTORE':
        return {
          title: 'Xác nhận khôi phục thương hiệu',
          icon: <RotateCcw className="h-6 w-6 text-emerald-500" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          message: (
            <span>
              Bạn muốn khôi phục thương hiệu{' '}
              <strong className="text-slate-900 dark:text-white font-bold">"{brand.name}"</strong> quay trở lại danh
              sách hoạt động chính?
            </span>
          ),
          confirmButtonText: 'Khôi phục ngay',
          confirmVariant: 'primary' as const,
        };
      case 'HARD_DELETE':
        return {
          title: 'Cảnh báo: Xóa vĩnh viễn thương hiệu',
          icon: <AlertTriangle className="h-6 w-6 text-rose-500" />,
          bgColor: 'bg-rose-500/10 border-rose-500/20',
          message: (
            <span>
              Hành động này sẽ xóa thương hiệu{' '}
              <strong className="text-slate-900 dark:text-white font-bold">"{brand.name}"</strong> vĩnh viễn khỏi hệ
              thống và không thể hoàn tác.
            </span>
          ),
          confirmButtonText: 'Xóa vĩnh viễn',
          confirmVariant: 'danger' as const,
        };
    }
  };

  const { title, icon, bgColor, message, confirmButtonText, confirmVariant } = getContent();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
            {confirmButtonText}
          </Button>
        </>
      }
    >
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300 ${bgColor}`}>
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="leading-relaxed">{message}</div>
      </div>
    </Modal>
  );
};
