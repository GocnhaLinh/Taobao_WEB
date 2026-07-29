import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
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
} from 'lucide-react';
import type { Product, ProductVariant } from '../../../types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEditProduct?: (p: Product) => void;
  onAddVariant?: (productId: string) => void;
  onEditVariant?: (v: ProductVariant) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onEditProduct,
  onAddVariant,
  onEditVariant,
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

  if (!product) return null;

  const activeVariants = (product.variants || []).filter((v) => v.status !== 'DELETED');
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

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
              {t('productImages')} ({allImages.length})
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
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-500" />
              {t('variantsList')} ({activeVariants.length})
            </h4>
            <span className="text-xs text-slate-500">
              {t('stock')}: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{totalStock}</strong>
            </span>
          </div>

          {activeVariants.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed">
              {t('noVariants')}
            </div>
          ) : (
            <div className="space-y-3">
              {activeVariants.map((v) => {
                const margin =
                  v.price > 0 && v.profitVND !== undefined && v.profitVND !== null
                    ? ((v.profitVND / v.price) * 100).toFixed(1)
                    : null;

                return (
                  <div
                    key={v.id}
                    className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl space-y-3 shadow-xs hover:border-indigo-500/30 transition-all"
                  >
                    {/* Top Row: Variant Info & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        {v.image && (
                          <img
                            src={v.image}
                            alt={v.sku}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="neutral" className="font-mono text-xs">
                              {v.sku}
                            </Badge>
                            {v.size && <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Size: {v.size}</span>}
                            {v.color && <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Màu: {v.color}</span>}
                            <span className="text-xs text-slate-500">Tồn kho: <strong>{v.stock}</strong></span>
                          </div>
                        </div>
                      </div>

                      {onEditVariant && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onClose();
                            onEditVariant(v);
                          }}
                          className="self-end sm:self-auto text-xs"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                          {t('edit')}
                        </Button>
                      )}
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
                        <span className="font-bold text-slate-900 dark:text-white">
                          {v.price.toLocaleString()}đ
                        </span>
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
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-30">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-mono font-bold tracking-wide border border-white/10">
                {lightboxIndex + 1} / {allImages.length}
              </span>
              {allImages[lightboxIndex]?.url === product.thumbnail && (
                <div className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  {t('mainImage') || 'Chính'}
                </div>
              )}
              <span className="text-xs font-medium text-slate-300 truncate max-w-xs sm:max-w-md">
                {allImages[lightboxIndex]?.label}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer border border-white/10 shadow-lg"
              title="Đóng (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Image Container & Navigation Arrows */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
            {/* Left Arrow Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 sm:left-8 z-30 p-3.5 bg-black/50 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/10 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
                title="Ảnh trước (Mũi tên Trái)"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}

            {/* Centered Image */}
            <div className="relative max-h-[80vh] max-w-[90vw] flex items-center justify-center">
              <img
                src={allImages[lightboxIndex]?.url}
                alt={allImages[lightboxIndex]?.label || product.productName}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-300"
              />
            </div>

            {/* Right Arrow Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 sm:right-8 z-30 p-3.5 bg-black/50 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/10 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
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
