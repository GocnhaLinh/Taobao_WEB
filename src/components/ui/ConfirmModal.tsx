import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  description = 'Are you sure you want to perform this action? This data cannot be recovered.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <div className="p-2 bg-rose-500/20 text-rose-500 rounded-xl shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t('confirm') || 'Confirmation Required'}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isLoading}
            className="gap-2 shadow-lg shadow-rose-500/20"
          >
            <Trash2 className="h-4 w-4" />
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
