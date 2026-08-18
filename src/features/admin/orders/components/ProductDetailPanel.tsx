import React from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { ImageOff } from 'lucide-react';
import type { OrderItem } from '../types';

/** Panel phụ: Chi tiết sản phẩm (đầy đủ thuộc tính variant) */
export const ProductDetailPanel: React.FC<{ item: OrderItem }> = ({ item }) => {
  const { t } = useTranslation();
  const v = item.variant;
  const thumb =
    v?.image || v?.images?.[0] || v?.product?.thumbnail || v?.product?.images?.[0]?.imageUrl;
  const lineTotal = item.price * item.quantity;

  const attrs: { label: string; value: string }[] = [
    { label: t('skuLabel'), value: v?.sku || '—' },
    { label: t('sizeLabel'), value: v?.size || '—' },
    { label: t('colorLabel'), value: v?.color || '—' },
    { label: t('sellingPrice'), value: `${(v?.price ?? item.price).toLocaleString()} ₫` },
    { label: t('salePriceLabel'), value: v?.salePrice != null ? `${v.salePrice.toLocaleString()} ₫` : '—' },
    { label: t('originCost'), value: v?.originalPriceCNY != null ? `${v.originalPriceCNY.toLocaleString()} ¥` : '—' },
    { label: t('exchangeRateLabel'), value: v?.exchangeRate != null ? `${v.exchangeRate.toLocaleString()} ₫` : '—' },
    { label: t('chinaShipping'), value: v?.shippingCostVND != null ? `${v.shippingCostVND.toLocaleString()} ₫` : '—' },
    { label: t('capitalCost'), value: v?.totalCostVND != null ? `${v.totalCostVND.toLocaleString()} ₫` : '—' },
    { label: t('profit'), value: v?.profitVND != null ? `${v.profitVND.toLocaleString()} ₫` : '—' },
    { label: t('weightKg'), value: v?.weight != null ? `${v.weight} kg` : '—' },
    { label: t('stock'), value: v?.stock != null ? `${v.stock}` : '—' },
  ];
  // Tự động ẩn mục không có dữ liệu (value = '—') để panel luôn gọn, không hiện ô trống
  const visibleAttrs = attrs.filter((a) => a.value !== '—');

  return (
    <div className="space-y-4 text-slate-900 dark:text-white">
      {/* Ảnh + tên */}
      <div className="flex items-start gap-3">
        {thumb ? (
          <img
            src={thumb}
            alt={item.productName}
            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-snug">{item.productName}</p>
          {item.variantName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.variantName}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {t('quantity')}: {item.quantity}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {t('lineTotalLabel')}: {lineTotal.toLocaleString()} ₫
            </span>
          </div>
        </div>
      </div>

      {/* Thông số — chỉ hiện mục có dữ liệu */}
      {visibleAttrs.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {visibleAttrs.map((a) => (
            <div
              key={a.label}
              className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{a.label}</p>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 break-all">{a.value}</p>
            </div>
          ))}
        </div>
      )}

      {v?.images && v.images.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('productImagesTitle')}</p>
          <div className="grid grid-cols-4 gap-2">
            {v.images.slice(0, 8).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${item.productName} ${i + 1}`}
                className="aspect-square rounded-xl object-cover border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
