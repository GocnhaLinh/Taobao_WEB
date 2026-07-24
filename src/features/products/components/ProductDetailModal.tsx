import React, { useState, useEffect } from 'react';
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
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Collect all unique images from product thumbnail, detail images array & variants
  const allImages = React.useMemo(() => {
    if (!product) return [];
    const list: { url: string; label: string }[] = [];

    if (product.thumbnail) {
      list.push({ url: product.thumbnail, label: 'Ảnh chính (Thumbnail)' });
    }

    if (product.images && product.images.length > 0) {
      product.images.forEach((img, idx) => {
        if (img.imageUrl && !list.some((item) => item.url === img.imageUrl)) {
          list.push({ url: img.imageUrl, label: `Ảnh sản phẩm #${idx + 1}` });
        }
      });
    }

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        const attr = [v.size ? `Size ${v.size}` : '', v.color ? `Màu ${v.color}` : ''].filter(Boolean).join(' - ');
        const labelBase = `Biến thể ${v.sku}${attr ? ` (${attr})` : ''}`;

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
                label: `${labelBase} - Ảnh #${imgIdx + 1}`,
              });
            }
          });
        }
      });
    }

    return list;
  }, [product]);

  useEffect(() => {
    if (allImages.length > 0) {
      setSelectedImage(allImages[0].url);
    } else {
      setSelectedImage('');
    }
  }, [allImages]);

  if (!product) return null;

  const activeVariants = (product.variants || []).filter((v) => v.status !== 'DELETED');
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Sản Phẩm & Thống Kê Phiên Bản"
      maxWidth="5xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 font-mono">ID: {product.id}</div>
          <div className="flex gap-2">
            {onEditProduct && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEditProduct(product);
                }}
              >
                <Edit2 className="h-4 w-4 mr-1.5 text-indigo-500" />
                Chỉnh sửa sản phẩm
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
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm biến thể
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
                <Badge variant="danger">🗑️ Trong Thùng rác</Badge>
              ) : activeVariants.length === 0 || product.status === 'INACTIVE' ? (
                <Badge variant="danger" className="animate-pulse">
                  ⚠️ Chưa có biến thể (Chưa hoạt động)
                </Badge>
              ) : (
                <Badge variant="success">✓ Đang hoạt động</Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 font-semibold">
                <ShoppingBag className="h-4 w-4 text-indigo-500" />
                Đã bán: <strong className="text-slate-900 dark:text-white">{product.soldCount || 0}</strong>
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
            Bộ Sưu Tập Hình Ảnh Sản Phẩm ({allImages.length} ảnh)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Preview Box */}
            <div className="md:col-span-2 h-[380px] bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex items-center justify-center p-2 relative group shadow-lg">
              {selectedImage ? (
                <>
                  {/* Ambient Blurred Background to eliminate blank white space */}
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125 pointer-events-none transition-all duration-500"
                    style={{ backgroundImage: `url(${selectedImage})` }}
                  />

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
                  <span className="text-xs font-medium">Chưa có hình ảnh nào</span>
                </div>
              )}

              {selectedImage && (
                <div className="absolute bottom-3 left-3 right-3 z-20 p-2.5 bg-slate-950/80 backdrop-blur-md rounded-2xl text-[11px] text-white truncate font-semibold border border-white/10 flex items-center justify-between">
                  <span className="truncate">{allImages.find((img) => img.url === selectedImage)?.label || 'Xem ảnh'}</span>
                  <span className="text-[10px] text-indigo-400 font-mono shrink-0 ml-2">HD Preview</span>
                </div>
              )}
            </div>

            {/* Thumbnail Selection List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {allImages.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                  Chưa có ảnh đại diện hoặc ảnh biến thể.
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
                        <span className="text-[10px] text-indigo-500 font-mono">Bấm để phóng to</span>
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
              Mô Tả Sản Phẩm
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
              Danh Sách Phiên Bản & Tính Toán Lợi Nhuận ({activeVariants.length})
            </h4>
            <span className="text-xs text-slate-500">
              Tổng tồn kho: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{totalStock}</strong>
            </span>
          </div>

          {activeVariants.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed">
              Chưa có phiên bản nào cho sản phẩm này.
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
                          Sửa biến thể
                        </Button>
                      )}
                    </div>

                    {/* Financial Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Giá gốc NDT (¥)</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {v.originalPriceCNY ? `¥${v.originalPriceCNY}` : 'N/A'}
                          {v.exchangeRate ? ` (${v.exchangeRate.toLocaleString()}đ)` : ''}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phí Ship TQ➔VN</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {v.shippingCostVND ? `${v.shippingCostVND.toLocaleString()}đ` : '0đ'}
                          {v.weight ? ` (${v.weight}kg)` : ''}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Giá vốn về kho VN</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {v.totalCostVND ? `${v.totalCostVND.toLocaleString()}đ` : 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Giá bán thị trường</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {v.price.toLocaleString()}đ
                        </span>
                      </div>
                    </div>

                    {/* Profit Summary */}
                    {v.profitVND !== undefined && v.profitVND !== null && (
                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <span className="text-slate-500">Lợi nhuận ước tính trên mỗi sản phẩm bán ra:</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-extrabold ${v.profitVND >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {v.profitVND >= 0 ? '+' : ''}{v.profitVND.toLocaleString()}đ
                          </span>
                          {margin && (
                            <Badge variant={parseFloat(margin) >= 30 ? 'success' : parseFloat(margin) > 0 ? 'info' : 'danger'}>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Tỷ suất {margin}%
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
  );
};
