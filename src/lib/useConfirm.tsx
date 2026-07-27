import { useState, useCallback, useRef } from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { AlertTriangle, Info, Trash2, CheckCircle } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = useCallback(() => {
    setOptions(null);
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setOptions(null);
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
  }, []);

  const ConfirmDialog = options ? (
    <Modal isOpen={true} onClose={handleClose} title={options.title || 'Xác nhận'}>
      <div className="space-y-5">
        <div
          className={`flex items-start gap-4 p-4 rounded-2xl border ${
            options.variant === 'warning'
              ? 'bg-amber-500/10 border-amber-500/20'
              : options.variant === 'info'
              ? 'bg-blue-500/10 border-blue-500/20'
              : 'bg-rose-500/10 border-rose-500/20'
          }`}
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              options.variant === 'warning'
                ? 'bg-amber-500/20 text-amber-500'
                : options.variant === 'info'
                ? 'bg-blue-500/20 text-blue-500'
                : 'bg-rose-500/20 text-rose-500'
            }`}
          >
            {options.variant === 'info' ? (
              <Info className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Hành động này cần xác nhận</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {options.description || 'Bạn có chắc chắn muốn thực hiện hành động này?'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={handleClose}>
            {options.cancelText || 'Hủy bỏ'}
          </Button>
          <Button
            variant={options.variant === 'danger' ? 'danger' : 'primary'}
            type="button"
            onClick={handleConfirm}
            className={`gap-2 ${
              options.variant === 'danger' ? 'shadow-lg shadow-rose-500/20' : 'shadow-lg shadow-indigo-500/20'
            }`}
          >
            {options.variant === 'danger' ? <Trash2 className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {options.confirmText || 'Đồng ý'}
          </Button>
        </div>
      </div>
    </Modal>
  ) : null;

  return { confirm, ConfirmDialog };
};
