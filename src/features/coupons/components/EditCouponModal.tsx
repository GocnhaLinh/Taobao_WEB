import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { Edit3, Save } from 'lucide-react';
import type { CouponItem } from './CouponCard';

interface EditCouponModalProps {
  coupon: CouponItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<CouponItem>) => void;
}

export const EditCouponModal: React.FC<EditCouponModalProps> = ({
  coupon,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [type, setType] = useState('FIXED');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  // BUG CP1 FIX: expiryDate có state nhưng trước đây thiếu input field trong form
  // Chuyển ISO string → "YYYY-MM-DD" để dùng với input type="date"
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setType(coupon.type);
      setValue(coupon.value.toString());
      setMinOrder(coupon.minOrder.toString());
      setMaxDiscount(coupon.maxDiscount ? coupon.maxDiscount.toString() : '');
      setStatus(coupon.status);
      // Chuyển ISO string → YYYY-MM-DD để hiển thị đúng trong input[type=date]
      setExpiryDate(
        coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      );
    }
  }, [coupon]);

  if (!coupon) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !minOrder) return;

    onUpdate(coupon.id, {
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrder: Number(minOrder),
      // BUG CP2 FIX: maxDiscount luôn được gửi (không chỉ khi PERCENT)
      // Nếu type=FIXED → clear về undefined vì không áp dụng
      maxDiscount: type === 'PERCENT' && maxDiscount ? Number(maxDiscount) : undefined,
      status,
      // BUG CP1 FIX: expiryDate được gửi lên, tránh backend set null khi thiếu
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('editCoupon')} #${coupon.code}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-medium">
          <Edit3 className="h-5 w-5 shrink-0 text-indigo-500" />
          {t('couponNoteEdit')}
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
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('minOrderValue')}
            type="number"
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
                { value: 'EXPIRED', label: t('expiredStatus') },
              ]}
            />
          </div>
        </div>

        {/* BUG CP2 FIX: Luôn hiển thị maxDiscount — disabled + hint khi type=FIXED
            Trước đây chỉ show khi type=PERCENT → mất giá trị khi toggle PERCENT↔FIXED */}
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

          {/* BUG CP1 FIX: Thêm input expiryDate vào form — trước đây có state nhưng không có field */}
          <Input
            label={t('expiryDate')}
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {t('editVoucher')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
