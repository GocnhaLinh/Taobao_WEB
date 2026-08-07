import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { Ticket, Edit3, Plus, Save } from 'lucide-react';
import type { CouponItem } from './CouponCard';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CouponItem>) => void;
  editingCoupon?: CouponItem | null;
  isLoading?: boolean;
}

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCoupon,
  isLoading,
}) => {
  const { t } = useTranslation();
  const isEditMode = Boolean(editingCoupon);

  const [code, setCode] = useState('');
  const [type, setType] = useState('FIXED');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [expiryDate, setExpiryDate] = useState('');

  const resetForm = () => {
    setCode('');
    setType('FIXED');
    setValue('');
    setMinOrder('');
    setMaxDiscount('');
    setStatus('ACTIVE');
    setExpiryDate('');
  };

  useEffect(() => {
    if (isOpen && editingCoupon) {
      setCode(editingCoupon.code);
      setType(editingCoupon.type);
      setValue(editingCoupon.value.toString());
      setMinOrder(editingCoupon.minOrder.toString());
      setMaxDiscount(editingCoupon.maxDiscount ? editingCoupon.maxDiscount.toString() : '');
      setStatus(editingCoupon.status);
      setExpiryDate(
        editingCoupon.expiryDate ? new Date(editingCoupon.expiryDate).toISOString().split('T')[0] : ''
      );
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, editingCoupon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !minOrder) return;

    onSubmit({
      ...(editingCoupon ? { id: editingCoupon.id } : {}),
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrder: Number(minOrder),
      maxDiscount: type === 'PERCENT' && maxDiscount ? Number(maxDiscount) : undefined,
      status,
      expiryDate: expiryDate
        ? new Date(expiryDate).toISOString()
        : isEditMode
        ? undefined
        : new Date(Date.now() + 90 * 86400000).toISOString(),
    });

    resetForm();
    onClose();
  };

  const modalTitle = isEditMode
    ? `${t('editCoupon')} #${editingCoupon?.code}`
    : t('createCoupon');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-medium">
          {isEditMode ? (
            <Edit3 className="h-5 w-5 shrink-0 text-indigo-500" />
          ) : (
            <Ticket className="h-5 w-5 shrink-0 text-indigo-500" />
          )}
          {isEditMode ? t('couponNoteEdit') : t('couponNoteCreate')}
        </div>

        <Input
          label={t('couponCode')}
          placeholder={t('couponCodePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomSelect
              label={t('couponType')}
              value={type}
              onChange={setType}
              options={[
                { value: 'FIXED', label: t('fixedType') },
                { value: 'PERCENT', label: t('percentType') },
              ]}
            />
          </div>

          <Input
            label={type === 'FIXED' ? t('discountAmount') : t('discountPercent')}
            type="number"
            placeholder={type === 'FIXED' ? '50000' : '15'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('minOrderValue')}
            type="number"
            placeholder="500000"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            required
          />

          <div>
            <CustomSelect
              label={t('initialStatus')}
              value={status}
              onChange={setStatus}
              options={[
                { value: 'ACTIVE', label: t('activeStatus') },
                { value: 'DISABLED', label: t('disabledStatus') },
                ...(isEditMode ? [{ value: 'EXPIRED', label: t('expiredStatus') }] : []),
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label={t('maxDiscountLabel')}
              type="number"
              placeholder={type === 'FIXED' ? t('notApplicableFixed') : 'VD: 200000'}
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              disabled={type === 'FIXED'}
              className={type === 'FIXED' ? 'opacity-50 cursor-not-allowed' : ''}
            />
            {type === 'FIXED' && (
              <p className="text-[11px] text-slate-400 mt-1">
                {t('percentOnly')}
              </p>
            )}
          </div>

          <Input
            label={t('expiryDate')}
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading} className="gap-2">
            {isEditMode ? (
              <>
                <Save className="h-4 w-4" />
                {t('editVoucher')}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {t('createVoucher')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
