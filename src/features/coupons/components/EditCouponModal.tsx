import React, { useState, useEffect } from 'react';
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
  const [code, setCode] = useState('');
  const [type, setType] = useState('FIXED');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setType(coupon.type);
      setValue(coupon.value.toString());
      setMinOrder(coupon.minOrder.toString());
      setMaxDiscount(coupon.maxDiscount ? coupon.maxDiscount.toString() : '');
      setStatus(coupon.status);
      setExpiryDate(coupon.expiryDate ? coupon.expiryDate : '');
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
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      status,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chỉnh Sửa Mã Giảm Giá #${coupon.code}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-medium">
          <Edit3 className="h-5 w-5 shrink-0 text-indigo-500" />
          Thay đổi các thông số của mã voucher trực tiếp trên hệ thống.
        </div>

        <Input
          label="Mã Voucher (Code) *"
          placeholder="VD: TAOBAO2026"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomSelect
              label="Loại Voucher *"
              value={type}
              onChange={setType}
              options={[
                { value: 'FIXED', label: 'Giảm số tiền cố định (₫)' },
                { value: 'PERCENT', label: 'Giảm theo phần trăm (%)' },
              ]}
            />
          </div>

          <Input
            label={type === 'FIXED' ? 'Số tiền giảm (VNĐ) *' : 'Tỷ lệ giảm (%) *'}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Giá trị đơn tối thiểu (VNĐ) *"
            type="number"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            required
          />

          <div>
            <CustomSelect
              label="Trạng thái *"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'ACTIVE', label: 'Hoạt động (ACTIVE)' },
                { value: 'DISABLED', label: 'Không hoạt động (DISABLED)' },
                { value: 'EXPIRED', label: 'Hết hạn (EXPIRED)' },
              ]}
            />
          </div>
        </div>

        {type === 'PERCENT' && (
          <Input
            label="Giảm tối đa (VNĐ)"
            type="number"
            placeholder="VD: 200000"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Cập Nhật Voucher
          </Button>
        </div>
      </form>
    </Modal>
  );
};
