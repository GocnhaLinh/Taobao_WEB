import React, { useState } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { Ticket, Plus } from 'lucide-react';
import type { CouponItem } from './CouponCard';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (coupon: CouponItem) => void;
}

export const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [type, setType] = useState('FIXED');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  // BUG CP3 FIX: Thêm field status — trước đây hardcode 'ACTIVE', không tạo được DISABLED
  const [status, setStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');

  const resetForm = () => {
    setCode('');
    setType('FIXED');
    setValue('');
    setMinOrder('');
    setMaxDiscount('');
    setExpiryDate('');
    setStatus('ACTIVE');
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !minOrder) return;

    const newCoupon: CouponItem = {
      id: `cp_${Date.now()}`,
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrder: Number(minOrder),
      // maxDiscount chỉ áp dụng cho PERCENT
      maxDiscount: type === 'PERCENT' && maxDiscount ? Number(maxDiscount) : undefined,
      // BUG CP3 FIX: dùng status từ state thay vì hardcode 'ACTIVE'
      status,
      expiryDate: expiryDate
        ? new Date(expiryDate).toISOString()
        : new Date(Date.now() + 90 * 86400000).toISOString(),
      usageCount: 0,
    };

    onCreate(newCoupon);
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('createCoupon')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-medium">
          <Ticket className="h-5 w-5 shrink-0 text-indigo-500" />
          {t('couponNoteCreate')}
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

          {/* BUG CP3 FIX: Thêm field chọn Status khi tạo mới */}
          <div>
            <CustomSelect
              label={t('initialStatus')}
              value={status}
              onChange={(v) => setStatus(v as 'ACTIVE' | 'DISABLED')}
              options={[
                { value: 'ACTIVE', label: t('activeNowLabel') },
                { value: 'DISABLED', label: t('disabledNowLabel') },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* maxDiscount: luôn hiển thị, disabled khi type=FIXED */}
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
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('createVoucher')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

