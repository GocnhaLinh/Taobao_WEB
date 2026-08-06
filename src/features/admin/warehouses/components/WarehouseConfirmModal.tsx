import React from 'react';
import type { Warehouse } from '../../../../types';
import { useTranslation } from '../../../../lib/i18n';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { AlertTriangle, RotateCcw, Trash2, Building2, MapPin, ShieldCheck } from 'lucide-react';

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
          title: (
            <span className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-amber-500" />
              {t('warehouseConfirmSoftDeleteTitle')}
            </span>
          ),
          icon: <Trash2 className="h-6 w-6 text-amber-500" />,
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          message: (
            <span className="flex items-start gap-2">
              <span>{t('warehouseConfirmSoftDeleteDesc', { name: warehouse.name, code: warehouse.code })}</span>
            </span>
          ),
          confirmButtonText: t('warehouseConfirmSoftDeleteBtn'),
          confirmVariant: 'danger' as const,
        };
      case 'RESTORE':
        return {
          title: (
            <span className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-emerald-500" />
              {t('warehouseConfirmRestoreTitle')}
            </span>
          ),
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
          title: (
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              {t('warehouseConfirmHardDeleteTitle')}
            </span>
          ),
          icon: <AlertTriangle className="h-6 w-6 text-rose-500" />,
          bgColor: 'bg-rose-500/10 border-rose-500/20',
          message: (
            <span className="flex items-start gap-2">
              <span>{t('warehouseConfirmHardDeleteDesc', { name: warehouse.name, code: warehouse.code })}</span>
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
      maxWidth="md"
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
      <div className="space-y-4">
        {/* Warning / Info Banner */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300 ${bgColor}`}>
          <div className="shrink-0 mt-0.5">{icon}</div>
          <div className="leading-relaxed">{message}</div>
        </div>

        {/* Warehouse Preview Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {warehouse.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {warehouse.code}
            </span>
            {warehouse.isDefault && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                <ShieldCheck className="h-3 w-3" />
                {t('warehouseDefault')}
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            {warehouse.address || `${warehouse.district || ''}, ${warehouse.province}`}
          </p>
        </div>
      </div>
    </Modal>
  );
};
