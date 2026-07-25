import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import {
  Upload,
  Trash2,
  CheckCircle2,
  Calculator,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  uploadSingleImageApi,
  uploadMultipleImagesApi,
  deleteImageApi,
} from '../../../services/uploadService';
import { getFeeConfigApi } from '../../../services/settingsService';
import { useNotification } from '../../../lib/notification';
import { generateAutoSku } from '../../../utils/skuHelper';
import type { Product, Category, Brand } from '../../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  editingProduct?: Product | null;
  categories: Category[];
  brands: Brand[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingProduct,
  categories,
  brands,
}) => {
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initial Variant fields (for creating new product with 1 variant & China Profit tool)
  const [variantSku, setVariantSku] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [variantOriginalPriceCNY, setVariantOriginalPriceCNY] = useState('');
  const [variantExchangeRate, setVariantExchangeRate] = useState('');
  const [variantWeight, setVariantWeight] = useState('');
  const [variantShippingFeePerKg, setVariantShippingFeePerKg] = useState('');
  const [variantStock, setVariantStock] = useState('10');
  const [variantSize, setVariantSize] = useState('');
  const [variantColor, setVariantColor] = useState('');

  // Fetch Fee Config on Modal Open
  useEffect(() => {
    if (!isOpen) return;

    getFeeConfigApi()
      .then((cfg) => {
        if (cfg) {
          if (cfg.exchangeRate) setVariantExchangeRate(cfg.exchangeRate.toString());
          if (cfg.shippingCnPerKg) setVariantShippingFeePerKg(cfg.shippingCnPerKg.toString());
        }
      })
      .catch((err) => console.warn('Could not fetch fee config:', err));

    if (editingProduct) {
      setProductName(editingProduct.productName || '');
      setCategoryId(editingProduct.categoryId || (categories[0]?.id || ''));
      setBrandId(editingProduct.brandId || '');
      setDescription(editingProduct.description || '');
      setThumbnail(editingProduct.thumbnail || '');
      const existingImgs = (editingProduct.images || []).map((img) => img.imageUrl);
      if (editingProduct.thumbnail && !existingImgs.includes(editingProduct.thumbnail)) {
        existingImgs.unshift(editingProduct.thumbnail);
      }
      setImages(existingImgs);
      setVariantSku('');
      setVariantPrice('');
      setVariantOriginalPriceCNY('');
      setVariantWeight('');
      setVariantStock('10');
      setVariantSize('');
      setVariantColor('');
    } else {
      const initCatId = categories[0]?.id || '';
      const initCat = categories.find((c) => c.id === initCatId);
      setProductName('');
      setCategoryId(initCatId);
      setBrandId('');
      setDescription('');
      setThumbnail('');
      setImages([]);
      setVariantSku(generateAutoSku(initCat?.name));
      setVariantPrice('');
      setVariantOriginalPriceCNY('');
      setVariantWeight('');
      setVariantStock('10');
      setVariantSize('');
      setVariantColor('');
    }
  }, [editingProduct, isOpen, categories, brands]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const filesArray = Array.from(filesList);
    setIsUploading(true);

    try {
      if (filesArray.length === 1) {
        const res = await uploadSingleImageApi(filesArray[0]);
        if (res && res.url) {
          const updated = [...images, res.url];
          setImages(updated);
          if (!thumbnail) setThumbnail(res.url);
          showNotification('Tải ảnh sản phẩm lên thành công!', 'success');
        }
      } else {
        const resList = await uploadMultipleImagesApi(filesArray);
        if (resList && resList.length > 0) {
          const newUrls = resList.map((r) => r.url);
          const updated = [...images, ...newUrls];
          setImages(updated);
          if (!thumbnail && newUrls[0]) setThumbnail(newUrls[0]);
          showNotification(`Đã tải lên thành công ${newUrls.length} ảnh sản phẩm!`, 'success');
        }
      }
    } catch (err: any) {
      showNotification(err.message || 'Lỗi tải ảnh sản phẩm lên', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (urlToRemove: string) => {
    const nextImages = images.filter((img) => img !== urlToRemove);
    setImages(nextImages);

    if (thumbnail === urlToRemove) {
      setThumbnail(nextImages[0] || '');
    }

    if (urlToRemove.includes('cloudinary.com') || urlToRemove.includes('res.cloudinary.com')) {
      try {
        await deleteImageApi(urlToRemove);
        showNotification('Đã xóa ảnh thành công!', 'success');
      } catch (err) {
        console.warn('Xóa ảnh thất bại:', err);
        showNotification('Đã gỡ ảnh khỏi danh sách!', 'info');
      }
    } else {
      showNotification('Đã xóa ảnh thành công!', 'success');
    }
  };

  // Live Profit Calculation for Initial Variant
  const cny = parseFloat(variantOriginalPriceCNY) || 0;
  const rate = parseFloat(variantExchangeRate) || 0;
  const kg = parseFloat(variantWeight) || 0;
  const perKg = parseFloat(variantShippingFeePerKg) || 0;

  const rawShip = kg * perKg;
  const shipVND = Math.round(rawShip);
  const totalCostVND = Math.round(cny * rate + rawShip);
  const sellingVND = parseFloat(variantPrice) || 0;
  const profitVND = Math.round(sellingVND - totalCostVND);
  const profitMargin = sellingVND > 0 ? ((profitVND / sellingVND) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const finalThumbnail = thumbnail || images[0] || null;

    onSubmit({
      productName,
      slug: slug || `sp-${Date.now()}`,
      categoryId,
      brandId: brandId || null,
      description: description || null,
      thumbnail: finalThumbnail,
      images: images.length > 0 ? images : (finalThumbnail ? [finalThumbnail] : []),
      ...(!editingProduct
        ? {
            initialVariant: {
              sku: variantSku.trim() || generateAutoSku(categories.find((c) => c.id === categoryId)?.name),
              price: sellingVND,
              originalPriceCNY: cny > 0 ? cny : undefined,
              // KHÔNG gửi exchangeRate — backend tự resolve từ fee config hệ thống
              // tránh sai lệch nếu tỷ giá thay đổi giữa lúc mở modal và lúc submit
              weight: kg > 0 ? kg : undefined,
              // KHÔNG gửi shippingCostVND — backend tự tính: weight × shippingCnPerKg
              stock: variantStock ? Number(variantStock) : 10,
              size: variantSize.trim() || undefined,
              color: variantColor.trim() || undefined,
              image: finalThumbnail,
              images: images.length > 0 ? images : (finalThumbnail ? [finalThumbnail] : []),
            },
          }
        : {}),
    });
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const brandOptions = [
    { value: '', label: '-- Không chọn --' },
    ...brands.map((b) => ({
      value: b.id,
      label: b.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
      maxWidth="5xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading || isUploading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading || isUploading}
            onClick={handleSubmit}
            className="flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên Sản Phẩm *"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Ví dụ: Áo khoác da Nam Taobao cao cấp"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomSelect
            label="Danh mục *"
            value={categoryId}
            onChange={(newCatId) => {
              setCategoryId(newCatId);
              if (!editingProduct) {
                const cat = categories.find((c) => c.id === newCatId);
                setVariantSku(generateAutoSku(cat?.name));
              }
            }}
            options={categoryOptions}
            placeholder="-- Chọn danh mục --"
          />

          <CustomSelect
            label="Thương hiệu"
            value={brandId}
            onChange={(newBrandId) => setBrandId(newBrandId)}
            options={brandOptions}
            placeholder="-- Không chọn --"
          />
        </div>

        {/* Multi-Image Upload Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Hình ảnh sản phẩm (Tải lên 1 hoặc nhiều ảnh)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                className="shrink-0 text-xs"
              >
                {!isUploading && <Upload className="h-4 w-4 mr-1.5 text-indigo-500" />}
                {isUploading ? 'Đang tải ảnh...' : 'Tải nhiều ảnh từ máy'}
              </Button>

              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Hoặc dán URL ảnh (https://...)"
                  value={thumbnail}
                  onChange={(e) => {
                    setThumbnail(e.target.value);
                    if (e.target.value && !images.includes(e.target.value)) {
                      setImages((prev) => [...prev, e.target.value]);
                    }
                  }}
                />
              </div>
            </div>

            {/* Uploaded Images Gallery Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2.5 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-white/10">
                {images.map((imgUrl, index) => {
                  const isMain = thumbnail === imgUrl;
                  return (
                    <div
                      key={index}
                      onClick={() => setThumbnail(imgUrl)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                        isMain
                          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-400'
                      }`}
                    >
                      <img src={imgUrl} alt={`ProdImg ${index}`} className="w-full h-full object-cover" />

                      {isMain && (
                        <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Chính
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(imgUrl);
                        }}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-600 shadow transition-all"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mô tả sản phẩm
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 text-sm font-medium bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Mô tả chi tiết sản phẩm..."
          />
        </div>

        {/* Initial Variant & China Profit Calculator Section (Identical to VariantFormModal) */}
        {!editingProduct && (
          <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Calculator className="h-4 w-4" />
                Biến thể ban đầu & Công cụ tính Lợi Nhuận
              </h4>
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                label="Giá bán thị trường (VNĐ) *"
                type="number"
                value={variantPrice}
                onChange={(e) => setVariantPrice(e.target.value)}
                placeholder="Ví dụ: 250000"
                required
              />
              <Input
                label="Giá gốc NDT (¥ Trung)"
                type="number"
                step="0.01"
                value={variantOriginalPriceCNY}
                onChange={(e) => setVariantOriginalPriceCNY(e.target.value)}
                placeholder="Ví dụ: 45 (Tệ)"
              />
              <Input
                label="Tỷ giá NDT ➔ VNĐ"
                type="number"
                value={variantExchangeRate}
                onChange={(e) => setVariantExchangeRate(e.target.value)}
                placeholder="3,500đ"
                disabled
              />
              <Input
                label="Cân nặng (kg)"
                type="number"
                step="0.01"
                value={variantWeight}
                onChange={(e) => setVariantWeight(e.target.value)}
                placeholder="Ví dụ: 0.5 (kg)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                label="Phí Vận chuyển TQ ➔ VN"
                type="number"
                value={variantShippingFeePerKg}
                onChange={(e) => setVariantShippingFeePerKg(e.target.value)}
                placeholder="Ví dụ: 28000"
                disabled
              />
              <div className="relative">
                <Input
                  label="Mã SKU (Tự động tạo)"
                  value={variantSku}
                  onChange={(e) => setVariantSku(e.target.value)}
                  placeholder="SKU-GIAY-123456"
                  disabled
                  className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed font-mono font-semibold pr-9"
                />
                {!editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      const cat = categories.find((c) => c.id === categoryId);
                      setVariantSku(generateAutoSku(cat?.name));
                    }}
                    className="absolute right-2 top-7 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Tạo lại mã SKU mới"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Input
                label="Size / Kích thước"
                value={variantSize}
                onChange={(e) => setVariantSize(e.target.value)}
                placeholder="Ví dụ: S, M, XL..."
              />
              <Input
                label="Màu sắc"
                value={variantColor}
                onChange={(e) => setVariantColor(e.target.value)}
                placeholder="Ví dụ: Đen, Trắng..."
              />
            </div>

            {cny > 0 && (
              <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Phí Vận chuyển TQ➔VN:</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-xs">
                    {shipVND.toLocaleString()} đ ({kg}kg)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Giá gốc về kho VN:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    {totalCostVND.toLocaleString()} đ
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Lợi nhuận ước tính:</span>
                  <strong className={`font-bold text-xs ${profitVND >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {profitVND >= 0 ? '+' : ''}{profitVND.toLocaleString()} đ
                  </strong>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant={
                      parseFloat(profitMargin) >= 30
                        ? 'success'
                        : parseFloat(profitMargin) > 0
                          ? 'info'
                          : 'danger'
                    }
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Tỷ suất: {profitMargin}%
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};
