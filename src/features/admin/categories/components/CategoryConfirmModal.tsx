import React from 'react';
import { AlertTriangle, Archive, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

import type { CategoryConfirmModalProps } from '../types';

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
          title: t('confirmSoftDeleteTitle') || 'Confirm Move to Trash',
          btnText: t('softDelete') || 'Move to Trash',
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white border-none',
          boxClass: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300',
          icon: <Archive className="h-6 w-6 shrink-0 text-amber-500" />,
          message: t('confirmSoftDeleteTitle') || `Category "${category.name}" will be moved to Trash.`,
          messageRaw: (
            <span>
              {t('trashNotice') || 'Items in Trash are kept for up to 30 days.'}
            </span>
          ),
        };
      case 'RESTORE':
        return {
          title: t('confirmRestoreTitle') || 'Confirm Category Restoration',
          btnText: t('restore') || 'Restore',
          btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white border-none',
          boxClass: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300',
          icon: <RotateCcw className="h-6 w-6 shrink-0 text-emerald-500" />,
          message: t('confirmRestoreTitle') || `Restore category "${category.name}"?`,
          messageRaw: null,
        };
      case 'HARD_DELETE':
      default:
        return {
          title: t('confirmHardDeleteTitle') || 'Warning: Permanently Delete Category',
          btnText: t('hardDelete') || 'Delete Permanently',
          btnClass: 'bg-rose-600 hover:bg-rose-700 text-white border-none',
          boxClass: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300',
          icon: <AlertTriangle className="h-6 w-6 shrink-0 text-rose-500 animate-bounce" />,
          message: t('confirmHardDeleteTitle') || `Permanently delete category "${category.name}"?`,
          messageRaw: null,
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
            {t('cancel') || 'Cancel'}
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
        <p>{config.messageRaw || config.message}</p>
      </div>
    </Modal>
  );
};

