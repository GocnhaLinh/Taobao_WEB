import React from 'react';
import type { Warehouse } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

export type ConfirmType = 'SOFT_DELETE' | 'RESTORE' | 'HARD_DELETE';

interface WarehouseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warehouse?: Warehouse | null;
  type: ConfirmType;
  isLoading?: boolean;
}

export const WarehouseConfirmModal: React.FC<WarehouseConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  warehouse,
  type,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  if (!warehouse) return null;

  const getContent = () => {
    switch (type) {
      case 'SOFT_DELETE':
        return {
          title: t('warehouseConfirmSoftDeleteTitle'),
          icon: <Trash2 className="h-6 w-6 text-amber-500" />,
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          message: (
            <span>
              {t('warehouseConfirmSoftDeleteDesc', { name: warehouse.name, code: warehouse.code })}
            </span>
          ),
          confirmButtonText: t('warehouseConfirmSoftDeleteBtn'),
          confirmVariant: 'danger' as const,
        };
      case 'RESTORE':
        return {
          title: t('warehouseConfirmRestoreTitle'),
          icon: <RotateCcw className="h-6 w-6 text-emerald-500" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          message: (
            <span>
              {t('warehouseConfirmRestoreDesc', { name: warehouse.name, code: warehouse.code })}
            </span>
          ),
          confirmButtonText: t('warehouseConfirmRestoreBtn'),
          confirmVariant: 'primary' as const,
        };
      case 'HARD_DELETE':
        return {
          title: t('warehouseConfirmHardDeleteTitle'),
          icon: <AlertTriangle className="h-6 w-6 text-rose-500" />,
          bgColor: 'bg-rose-500/10 border-rose-500/20',
          message: (
            <span>
              {t('warehouseConfirmHardDeleteDesc', { name: warehouse.name, code: warehouse.code })}
            </span>
          ),
          confirmButtonText: t('warehouseConfirmHardDeleteBtn'),
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
            {t('cancel')}
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
