import React, { useState } from "react";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  Coins,
  Truck,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "../../../../lib/i18n";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import type { Product, ProductVariant } from "../../../../types";

import { TrashCountdownBar } from "../../../../components/ui/TrashCountdownBar";

interface ProductCardProps {
  product: Product;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (p: Product) => void;
  onAddVariant: (productId: string) => void;
  onEditVariant: (v: ProductVariant) => void;
  onDeleteVariant: (v: ProductVariant) => void;
  onToggleVariant?: (v: ProductVariant) => void;
  onBulkAddVariant?: (productId: string) => void;
  onViewDetail?: (p: Product) => void;
  isDeletedTab?: boolean;
  onRestoreProduct?: (p: Product) => void;
  onForceDeleteProduct?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onEditProduct,
  onDeleteProduct,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onToggleVariant,
  onBulkAddVariant,
  onViewDetail,
  isDeletedTab = false,
  onRestoreProduct,
  onForceDeleteProduct,
}) => {
  const { t } = useTranslation();
  const [showVariants, setShowVariants] = useState(true);

  const variants = (product.variants || []).filter(
    (v) => v.status !== "DELETED",
  );

  return (
    <div className="p-5 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl shadow-xs hover:border-indigo-500/30 transition-all space-y-4">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex gap-3 min-w-0">
          {/* Thumbnail */}
          <div
            onClick={() => onViewDetail?.(product)}
            className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0 border border-slate-200 dark:border-white/10 cursor-pointer group/thumb relative"
            title={t('clickToViewDetail')}
          >
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.productName}
                className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <Package className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {product.category && (
                <Badge variant="info">{product.category.name}</Badge>
              )}
              {product.brand && (
                <Badge variant="neutral">{product.brand.name}</Badge>
              )}

              {isDeletedTab ? (
                <Badge variant="danger" className="font-semibold">
                  🗑️ {t('inTrash')}
                </Badge>
              ) : variants.length === 0 || product.status === "INACTIVE" ? (
                <Badge variant="danger" className="font-semibold animate-pulse">
                  ⚠️ {t('noVariants')}
                </Badge>
              ) : (
                <Badge variant="success">✓ {t('active')}</Badge>
              )}
            </div>
            <h3
              onClick={() => onViewDetail?.(product)}
              className="font-bold text-slate-900 dark:text-white text-base mt-1 line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={t('clickToViewDetail')}
            >
              {product.productName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              /{product.slug}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        {isDeletedTab ? (
          <div className="flex items-center gap-2 self-end sm:self-start flex-wrap">
            <TrashCountdownBar
              deletedAt={product.deletedAt}
              fallbackDate={(product as any).updatedAt}
              variant="compact"
            />
            <button
              type="button"
              onClick={() => onRestoreProduct?.(product)}
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer"
              title={t('restore')}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onForceDeleteProduct?.(product)}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
              title={t('hardDelete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 self-end sm:self-start">
            <Button
              variant={variants.length === 0 ? "primary" : "outline"}
              size="sm"
              onClick={() => onBulkAddVariant ? onBulkAddVariant(product.id) : onAddVariant(product.id)}
              title="Tạo hàng loạt biến thể"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Tạo hàng loạt
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditProduct(product)}
            >
              <Edit2 className="h-3.5 w-3.5 text-indigo-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteProduct(product)}
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl">
          {product.description}
        </p>
      )}

      {/* Variants Collapsible Section */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
        <div
          onClick={() => setShowVariants(!showVariants)}
          className="flex items-center justify-between cursor-pointer py-1"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('variantsList')} ({variants.length})
            </span>
          </div>
          {showVariants ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>

        {showVariants && (
          <div className="space-y-2.5 mt-2">
            {variants.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl">
                {t('noVariants')}
              </div>
            ) : (
              variants.map((v) => {
                const margin =
                  v.price > 0 &&
                  v.profitVND !== undefined &&
                  v.profitVND !== null
                    ? ((v.profitVND / v.price) * 100).toFixed(1)
                    : null;

                return (
                  <div
                    key={v.id}
                    className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-indigo-500/30 transition-all"
                  >
                    {/* Left: SKU, Attributes */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <span
                          onClick={() => onToggleVariant?.(v)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            v.status === 'ACTIVE'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                          }`}
                          title={v.status === 'ACTIVE' ? 'Nhấn để ẩn biến thể' : 'Nhấn để kích hoạt biến thể'}
                        >
                          {v.status === 'ACTIVE' ? (
                            <><Eye className="h-3 w-3" /> <span className="hidden sm:inline">{t('active')}</span></>
                          ) : (
                            <><EyeOff className="h-3 w-3" /> <span className="hidden sm:inline">{t('disabled')}</span></>
                          )}
                        </span>
                        <Badge
                          variant="neutral"
                          className="font-mono text-[10px]"
                        >
                          {v.sku}
                        </Badge>
                        {v.size && (
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {t('size')}: {v.size}
                          </span>
                        )}
                        {v.color && (
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {t('color')}: {v.color}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          {t('stock')}: <strong>{v.stock}</strong>
                        </span>
                      </div>

                      {/* Cost & Profit Info */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap pt-1">
                        {v.originalPriceCNY && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <Coins className="h-3 w-3" />
                            {t('originCost')}: ¥{v.originalPriceCNY}{v.exchangeRate ? ` (rate: ${v.exchangeRate.toLocaleString()})` : ''}
                          </span>
                        )}
                        {v.weight !== undefined && v.weight !== null && v.weight > 0 && (
                          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                            <Truck className="h-3 w-3" />
                            {t('weight')}: {v.weight}kg {v.shippingCostVND ? `(+${v.shippingCostVND.toLocaleString()}đ ${t('shippingCnFee')})` : ''}
                          </span>
                        )}
                        {v.totalCostVND && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold bg-indigo-50 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-white/10">
                            {t('capitalCost')}: <strong className="text-indigo-600 dark:text-indigo-400">{v.totalCostVND.toLocaleString()} đ</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Selling Price, Profit Margin & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-white/5">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          {t('marketPrice')}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {v.price.toLocaleString()} đ
                        </span>

                        {v.profitVND !== undefined && v.profitVND !== null && (
                          <div className="flex items-center justify-start md:justify-end gap-1.5 mt-0.5">
                            <span
                              className={`text-xs font-bold whitespace-nowrap ${v.profitVND >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                            >
                              {v.profitVND >= 0 ? '+' : ''}{v.profitVND.toLocaleString()}đ
                            </span>
                            {margin && (
                              <Badge
                                variant={
                                  parseFloat(margin) >= 30
                                    ? "success"
                                    : parseFloat(margin) > 0
                                      ? "info"
                                      : "danger"
                                }
                              >
                                {margin}%
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Variant Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditVariant(v)}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-indigo-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteVariant(v)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
});

