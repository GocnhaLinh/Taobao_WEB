import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { Modal } from '../../../../components/ui/Modal';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import {
  Package,
  Tag,
  TrendingUp,
  Edit2,
  Plus,
  Star,
  ShoppingBag,
  Image as ImageIcon,
  Info,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Layers,
  Loader2,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Product, ProductVariant } from '../../../../types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEditProduct?: (p: Product) => void;
  onAddVariant?: (productId: string) => void;
  onEditVariant?: (v: ProductVariant) => void;
  onBulkAddVariant?: (productId: string) => void;
  onInlineUpdateVariant?: (id: string, data: Partial<ProductVariant>) => void;
  onToggleVariant?: (v: ProductVariant) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onEditProduct,
  onAddVariant,
  onEditVariant,
  onBulkAddVariant,
  onInlineUpdateVariant,
  onToggleVariant,
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Collect all unique images from product thumbnail, detail images array & variants
  const allImages = React.useMemo(() => {
    if (!product) return [];
    const list: { url: string; label: string }[] = [];

    if (product.thumbnail) {
      list.push({ url: product.thumbnail, label: t('mainImage') || 'Chính (Thumbnail)' });
    }

    if (product.images && product.images.length > 0) {
      product.images.forEach((img, idx) => {
        if (img.imageUrl && !list.some((item) => item.url === img.imageUrl)) {
          list.push({ url: img.imageUrl, label: `Product Image #${idx + 1}` });
        }
      });
    }

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        const attr = [v.size ? `${t('size')} ${v.size}` : '', v.color ? `${t('color')} ${v.color}` : ''].filter(Boolean).join(' - ');
        const labelBase = `${t('variant')} ${v.sku}${attr ? ` (${attr})` : ''}`;

        if (v.image && !list.some((item) => item.url === v.image)) {
          list.push({
            url: v.image,
            label: labelBase,
          });
        }

        if (v.images && Array.isArray(v.images) && v.images.length > 0) {
          v.images.forEach((imgUrl, imgIdx) => {
            if (imgUrl && !list.some((item) => item.url === imgUrl)) {
              list.push({
                url: imgUrl,
                label: `${labelBase} - Image #${imgIdx + 1}`,
              });
            }
          });
        }
      });
    }

    return list;
  }, [product, t]);

  useEffect(() => {
    if (allImages.length > 0) {
      setSelectedImage(allImages[0].url);
    } else {
      setSelectedImage('');
    }
  }, [allImages]);

  // Inline edit states
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [editStockValue, setEditStockValue] = useState('');
  /** Track loading state for inline saves per variant */
  const [savingInlineIds, setSavingInlineIds] = useState<Set<string>>(new Set());

  const handleInlineEditPrice = useCallback((variantId: string, currentPrice: number) => {
    setEditingPriceId(variantId);
    setEditPriceValue(currentPrice.toString());
  }, []);

  const handleInlineEditStock = useCallback((variantId: string, currentStock: number) => {
    setEditingStockId(variantId);
    setEditStockValue(currentStock.toString());
  }, []);

  // Clear saving state when product data refreshes (mutation succeeded)
  useEffect(() => {
    if (savingInlineIds.size > 0) {
      setSavingInlineIds(new Set());
    }
  }, [product?.variants?.length]);

  const handleSavePrice = useCallback((variantId: string) => {
    const newPrice = parseFloat(editPriceValue);
    if (!isNaN(newPrice) && newPrice >= 0 && onInlineUpdateVariant) {
      setSavingInlineIds(prev => new Set(prev).add(variantId));
      onInlineUpdateVariant(variantId, { price: newPrice });
    }
    setEditingPriceId(null);
    setEditPriceValue('');
  }, [editPriceValue, onInlineUpdateVariant]);

  const handleSaveStock = useCallback((variantId: string) => {
    const newStock = parseInt(editStockValue, 10);
    if (!isNaN(newStock) && newStock >= 0 && onInlineUpdateVariant) {
      setSavingInlineIds(prev => new Set(prev).add(variantId));
      onInlineUpdateVariant(variantId, { stock: newStock });
    }
    setEditingStockId(null);
    setEditStockValue('');
  }, [editStockValue, onInlineUpdateVariant]);

  const [variantSearch, setVariantSearch] = useState('');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keyboard navigation for full-screen Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  useEffect(() => {
    if (!isOpen) {
      setIsLightboxOpen(false);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped Left -> Next Image
        setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      } else {
        // Swiped Right -> Prev Image
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      }
    }
    setTouchStartX(null);
  };

  // Filter variants by search query (MUST be before early return - hooks rule)
  const variantSearchQuery = variantSearch;
  const activeVariants = (product?.variants || []).filter((v) => v.status !== 'DELETED');
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

  const filteredVariants = useMemo(() => {
    if (!variantSearchQuery.trim()) return activeVariants;
    const q = variantSearchQuery.toLowerCase();
    return activeVariants.filter(
      (v) =>
        v.sku.toLowerCase().includes(q) ||
        (v.size || '').toLowerCase().includes(q) ||
        (v.color || '').toLowerCase().includes(q) ||
        v.price.toString().includes(q) ||
        (v.stock || 0).toString().includes(q)
    );
  }, [activeVariants, variantSearchQuery]);

  if (!product) return null;

  const openLightbox = () => {
    if (!selectedImage || allImages.length === 0) return;
    const idx = allImages.findIndex((img) => img.url === selectedImage);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setIsLightboxOpen(true);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('productProfitManagement') || 'Product Details & Variants'}
        maxWidth="5xl"
        footer={
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
            <div className="text-xs text-slate-500 font-mono truncate max-w-full sm:max-w-xs">ID: {product.id}</div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onEditProduct && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEditProduct(product);
                  }}
                  className="flex-1 sm:flex-initial text-xs whitespace-nowrap"
                >
                  <Edit2 className="h-4 w-4 mr-1.5 text-indigo-500 shrink-0" />
                  {t('edit') || 'Edit'}
                </Button>
              )}
              {onBulkAddVariant && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onBulkAddVariant(product.id);
                  }}
                  className="flex-1 sm:flex-initial text-xs whitespace-nowrap"
                >
                  <Layers className="h-4 w-4 mr-1.5 text-purple-500 shrink-0" />
                  Tạo hàng loạt
                </Button>
              )}
              {onAddVariant && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onAddVariant(product.id);
                  }}
                  className="flex-1 sm:flex-initial text-xs whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1.5 shrink-0" />
                  {t('addVariant')}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-3xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && <Badge variant="info">{product.category.name}</Badge>}
                {product.brand && <Badge variant="neutral">{product.brand.name}</Badge>}
                {product.status === 'DELETED' ? (
                  <Badge variant="danger">🗑️ {t('inTrash')}</Badge>
                ) : activeVariants.length === 0 || product.status === 'INACTIVE' ? (
                  <Badge variant="danger" className="animate-pulse">
                    ⚠️ {t('noVariants')}
                  </Badge>
                ) : (
                  <Badge variant="success">✓ {t('active')}</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1 font-semibold">
                  <ShoppingBag className="h-4 w-4 text-indigo-500" />
                  {t('soldCount')}: <strong className="text-slate-900 dark:text-white">{product.soldCount || 0}</strong>
                </span>
                {product.ratingAverage !== undefined && (
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400" />
                    {product.ratingAverage.toFixed(1)} / 5.0
                  </span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {product.productName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                Slug: <span className="bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded-md">/{product.slug}</span>
              </p>
            </div>
          </div>

          {/* Media & Images Gallery Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-500" />
              {t('productImagesTitle') || 'Hình ảnh sản phẩm'} ({allImages.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Preview Box (Clickable for Fullscreen Lightbox) */}
              <div
                onClick={openLightbox}
                className="md:col-span-2 h-[380px] bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex items-center justify-center p-2 relative group shadow-lg cursor-pointer select-none"
              >
                {selectedImage ? (
                  <>
                    {/* Corner Main Badge if selected image is Thumbnail */}
                    {selectedImage === product.thumbnail && (
                      <div className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-indigo-600/90 backdrop-blur-md text-white rounded-xl text-[11px] font-bold shadow-md flex items-center gap-1.5 border border-indigo-400/30">
                        <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                        {t('mainImage') || 'Chính'}
                      </div>
                    )}

                    {/* Fullscreen Expand Hint Badge */}
                    <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 text-[11px] font-semibold border border-white/10">
                      <Maximize2 className="h-3.5 w-3.5 text-indigo-400" />
                      Phóng to xem ảnh
                    </div>

                    {/* Clean Foreground Image */}
                    <img
                      src={selectedImage}
                      alt={product.productName}
                      className="relative z-10 max-h-full max-w-full object-contain rounded-2xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Package className="h-12 w-12" />
                    <span className="text-xs font-medium">No images</span>
                  </div>
                )}
              </div>

            {/* Thumbnail Selection List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {allImages.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                  No images available.
                </div>
              ) : (
                allImages.map((item, index) => {
                  const isSelected = selectedImage === item.url;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(item.url)}
                      className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={`Thumb ${index}`}
                        className="h-12 w-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.label}
                        </p>
                        <span className="text-[10px] text-indigo-500 font-mono">{t('clickToViewDetail')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-500" />
              {t('productDescription')}
            </h4>
            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* Variants Breakdown List */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-500" />
              {t('variantsList')} ({filteredVariants.length}/{activeVariants.length})
            </h4>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Tìm SKU, size, màu..."
                  value={variantSearch}
                  onChange={(e) => setVariantSearch(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
                {variantSearch && (
                  <button
                    type="button"
                    onClick={() => setVariantSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {t('stock')}: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{totalStock}</strong>
              </span>
            </div>
          </div>

          {filteredVariants.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed">
              {variantSearch ? `Không tìm thấy biến thể phù hợp với "${variantSearch}"` : t('noVariants')}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVariants.map((v) => {
                const margin =
                  v.price > 0 && v.profitVND !== undefined && v.profitVND !== null
                    ? ((v.profitVND / v.price) * 100).toFixed(1)
                    : null;

                return (
                  <div
                    key={v.id}
                    className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl space-y-3 shadow-xs hover:border-indigo-500/30 transition-all"
                  >
                    {/* Top Row: Variant Info Header */}
                    <div className="pb-3 border-b border-slate-100 dark:border-white/5 space-y-2">
                      {/* Line 1: SKU on left, Status + Sửa Button on right */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {v.image && (
                            <img
                              src={v.image}
                              alt={v.sku}
                              className="h-6 w-6 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0"
                            />
                          )}
                          <Badge variant="neutral" className="font-mono text-xs truncate">
                            {v.sku}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Status toggle badge */}
                          <span
                            onClick={() => onToggleVariant?.(v)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
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

                          {onEditVariant && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onClose();
                                onEditVariant(v);
                              }}
                              className="shrink-0 text-xs px-2 py-1 h-auto"
                            >
                              <Edit2 className="h-3.5 w-3.5 sm:mr-1 text-indigo-500" />
                              <span className="hidden sm:inline">{t('edit')}</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Line 2: Size, Màu, Tồn kho cùng 1 hàng */}
                      <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 flex-wrap">
                        {v.size && <span>Size: <strong className="font-semibold">{v.size}</strong></span>}
                        {v.color && <span>Màu: <strong className="font-semibold">{v.color}</strong></span>}

                        {/* Tồn kho Inline Edit */}
                        {editingStockId === v.id ? (
                          <span className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(e.target.value)}
                              onBlur={() => handleSaveStock(v.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveStock(v.id);
                                if (e.key === 'Escape') setEditingStockId(null);
                              }}
                              className="w-16 px-1.5 py-0.5 text-xs font-bold text-center bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              autoFocus
                            />
                            {savingInlineIds.has(v.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSaveStock(v.id)}
                                className="p-0.5 text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                              >
                                <Save className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ) : (
                          <span
                            onClick={() => handleInlineEditStock(v.id, v.stock)}
                            className="text-xs text-slate-500 cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-1.5 py-0.5 rounded-md transition-all group whitespace-nowrap"
                            title="Click để sửa tồn kho"
                          >
                            {savingInlineIds.has(v.id) ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                                Đang lưu...
                              </span>
                            ) : (
                              <>Tồn kho: <strong>{v.stock}</strong>
                              <Edit2 className="h-2.5 w-2.5 ml-0.5 inline opacity-0 group-hover:opacity-100 text-indigo-400" /></>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financial Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('originCost')} (¥)</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {v.originalPriceCNY ? `¥${v.originalPriceCNY}` : 'N/A'}
                          {v.exchangeRate ? ` (${v.exchangeRate.toLocaleString()}đ)` : ''}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('shippingCnFee')}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {v.shippingCostVND ? `${v.shippingCostVND.toLocaleString()}đ` : '0đ'}
                          {v.weight ? ` (${v.weight}kg)` : ''}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('capitalCost')}</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {v.totalCostVND ? `${v.totalCostVND.toLocaleString()}đ` : 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('marketPrice')}</span>
                        {editingPriceId === v.id ? (
                          <span className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              value={editPriceValue}
                              onChange={(e) => setEditPriceValue(e.target.value)}
                              onBlur={() => handleSavePrice(v.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePrice(v.id);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              className="w-24 px-1.5 py-0.5 text-xs font-bold text-center bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              autoFocus
                            />
                            {savingInlineIds.has(v.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin text-indigo-500 shrink-0" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSavePrice(v.id)}
                                className="p-0.5 text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                              >
                                <Save className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ) : (
                          <span
                            onClick={() => handleInlineEditPrice(v.id, v.price)}
                            className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-1.5 py-0.5 rounded-md transition-all group"
                            title="Click để sửa giá"
                          >
                            {savingInlineIds.has(v.id) ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                                Đang lưu...
                              </span>
                            ) : (
                              <>{v.price.toLocaleString()}đ
                              <Edit2 className="h-2.5 w-2.5 ml-0.5 inline opacity-0 group-hover:opacity-100 text-indigo-400" /></>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Profit Summary */}
                    {v.profitVND !== undefined && v.profitVND !== null && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs pt-1 px-1">
                        <span className="text-slate-500">{t('estimatedProfit')}</span>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className={`font-extrabold whitespace-nowrap ${v.profitVND >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {v.profitVND >= 0 ? '+' : ''}{v.profitVND.toLocaleString()}đ
                          </span>
                          {margin && (
                            <Badge variant={parseFloat(margin) >= 30 ? 'success' : parseFloat(margin) > 0 ? 'info' : 'danger'}>
                              <TrendingUp className="h-3 w-3 mr-1 shrink-0" />
                              {t('profitRate', { margin: margin || '0' })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>

      {/* Facebook-style Full-screen Lightbox Gallery */}
      {isLightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-6 py-3 bg-gradient-to-b from-black/90 to-transparent z-30 w-full">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="px-2.5 py-1 bg-white/10 text-white rounded-full text-xs font-mono font-bold tracking-wide border border-white/10 shrink-0">
                {lightboxIndex + 1} / {allImages.length}
              </span>
              {allImages[lightboxIndex]?.url === product.thumbnail && (
                <div className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  <span className="hidden sm:inline">{t('mainImage') || 'Chính'}</span>
                </div>
              )}
              <span className="text-xs font-medium text-slate-300 truncate min-w-0 flex-1">
                {allImages[lightboxIndex]?.label}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 sm:p-2.5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer border border-white/10 shadow-lg shrink-0"
              title="Đóng (Esc)"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Main Image Container & Navigation Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center p-2 sm:p-8 touch-pan-y select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Arrow Button (Hidden on Mobile, Visible on Desktop) */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="hidden sm:flex absolute left-8 z-30 p-3.5 bg-black/50 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/10 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95 shrink-0 items-center justify-center"
                title="Ảnh trước (Mũi tên Trái)"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}

            {/* Centered Image */}
            <div className="relative max-h-[75vh] sm:max-h-[80vh] max-w-[95vw] sm:max-w-[90vw] flex items-center justify-center">
              <img
                src={allImages[lightboxIndex]?.url}
                alt={allImages[lightboxIndex]?.label || product.productName}
                className="max-h-[75vh] sm:max-h-[80vh] max-w-[95vw] sm:max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-300 pointer-events-auto"
              />
            </div>

            {/* Right Arrow Button (Hidden on Mobile, Visible on Desktop) */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="hidden sm:flex absolute right-8 z-30 p-3.5 bg-black/50 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/10 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95 shrink-0 items-center justify-center"
                title="Ảnh tiếp theo (Mũi tên Phải)"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-2 overflow-x-auto z-30 max-w-full no-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`h-14 w-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    idx === lightboxIndex
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-110'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                  }`}
                >
                  <img src={img.url} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

