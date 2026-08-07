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
    <div className="p-3.5 sm:p-5 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-xs hover:border-indigo-500/30 transition-all space-y-3.5 sm:space-y-4">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start">
        <div className="flex gap-2.5 sm:gap-3 min-w-0">
          {/* Thumbnail */}
          <div
            onClick={() => onViewDetail?.(product)}
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0 border border-slate-200 dark:border-white/10 cursor-pointer group/thumb relative"
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
                <Package className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5 sm:mb-1">
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
              className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-0.5 line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={t('clickToViewDetail')}
            >
              {product.productName}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
              /{product.slug}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        {isDeletedTab ? (
          <div className="flex items-center gap-2 self-start flex-wrap">
            <TrashCountdownBar
              deletedAt={product.deletedAt}
              fallbackDate={product.updatedAt}
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
          <div className="flex items-center gap-1 sm:gap-1.5 self-start flex-wrap w-full sm:w-auto justify-end">
            <Button
              variant={variants.length === 0 ? "primary" : "outline"}
              size="sm"
              onClick={() => onBulkAddVariant ? onBulkAddVariant(product.id) : onAddVariant(product.id)}
              title="Tạo hàng loạt biến thể"
              className="text-xs px-2.5 sm:px-3"
            >
              <Plus className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Tạo hàng loạt</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditProduct(product)}
              title={t('edit')}
              className="px-2.5 sm:px-3"
            >
              <Edit2 className="h-3.5 w-3.5 text-indigo-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteProduct(product)}
              title={t('softDelete')}
              className="px-2.5 sm:px-3"
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
                    className="p-2.5 sm:p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 hover:border-indigo-500/30 transition-all"
                  >
                    {/* Left: SKU & Attributes */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Row 1: SKU Badge on Left, Status Eye Icon on Far Right */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        <Badge
                          variant="neutral"
                          className="font-mono text-[10px] tracking-wide"
                        >
                          {v.sku}
                        </Badge>
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
                      </div>

                      {/* Row 2: Size, Color, Stock (Centered & Justified Space-Between) */}
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 w-full pt-0.5">
                        {v.size && (
                          <span>
                            {t('size')}: <strong className="text-slate-900 dark:text-white">{v.size}</strong>
                          </span>
                        )}
                        {v.color && (
                          <span>
                            {t('color')}: <strong className="text-slate-900 dark:text-white">{v.color}</strong>
                          </span>
                        )}
                        <span className="text-slate-500 dark:text-slate-400">
                          {t('stock')}: <strong className="text-slate-900 dark:text-white">{v.stock}</strong>
                        </span>
                      </div>
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

                      {/* Variant Action Buttons */}
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

