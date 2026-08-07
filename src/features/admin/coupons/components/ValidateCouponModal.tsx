import React, { useState } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { validateCouponApi } from '../api/coupon.api';
import type { ValidateCouponResponse } from '../types';
import { CheckCircle2, AlertCircle, Search, Calculator } from 'lucide-react';

interface ValidateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidateCouponModal: React.FC<ValidateCouponModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidateCouponResponse | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !orderValue) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await validateCouponApi({
        code: code.trim().toUpperCase(),
        orderValue: Number(orderValue),
      });
      setResult(res);
    } catch (err: any) {
      setResult({
        valid: false,
        message: err.response?.data?.error || err.message || 'Invalid coupon code or verification error.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('validateCouponTitle')}>
      <form onSubmit={handleValidate} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-medium">
          <Calculator className="h-5 w-5 shrink-0 text-indigo-500" />
          {t('validateCouponDesc')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('validateCouponCode')}
            placeholder={t('validateCouponCodePlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Input
            label={t('validateOrderValue')}
            type="number"
            placeholder={t('validateOrderValuePlaceholder')}
            value={orderValue}
            onChange={(e) => setOrderValue(e.target.value)}
            required
          />
        </div>

        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
          className="w-full gap-2 justify-center"
        >
          <Search className="h-4 w-4" />
          {isLoading ? t('checkingCoupon') : t('checkCoupon')}
        </Button>

        {/* Result Area */}
        {result && (
          <div
            className={`p-4 rounded-2xl border space-y-3 transition-all animate-in fade-in duration-200 ${
              result.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {result.valid ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {result.valid ? t('validCoupon') : t('invalidCoupon')}
                </h4>
                <p className="text-xs font-medium mt-0.5 opacity-90">
                  {result.valid ? t('validCouponDesc') : result.message}
                </p>
              </div>
            </div>

            {result.valid && result.coupon && (
              <div className="pt-3 border-t border-emerald-500/20 text-xs grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200 font-medium">
                <div>
                  <span className="text-slate-400 block text-[11px]">{t('discountType')}</span>
                  <span className="font-bold uppercase">{result.coupon.discountType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{t('discountLevel')}</span>
                  <span className="font-bold text-emerald-500">
                    {result.coupon.discountType === 'percent' || result.coupon.discountType === 'PERCENT'
                      ? `${result.coupon.discountValue}%`
                      : `${result.coupon.discountValue.toLocaleString()} ₫`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{t('minOrderLabel')}</span>
                  <span>{result.coupon.minOrderValue.toLocaleString()} ₫</span>
                </div>
                {result.coupon.maxDiscount && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t('maxDiscountDetail')}</span>
                    <span>{result.coupon.maxDiscount.toLocaleString()} ₫</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};

