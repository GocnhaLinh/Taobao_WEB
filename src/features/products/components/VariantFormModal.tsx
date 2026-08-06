import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "../../../lib/i18n";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import {
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  uploadSingleImageApi,
  uploadMultipleImagesApi,
  deleteImageApi,
} from "../../../services/uploadService";
import { getFeeConfigApi } from "../../../services/settingsService";
import { useNotification } from "../../../lib/notification";
import { generateAutoSku } from "../../../utils/skuHelper";
import { VariantProfitCalculator } from "./VariantProfitCalculator";
import type { ProductVariant } from "../../../types";

interface VariantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  editingVariant?: ProductVariant | null;
  productId: string;
  categoryName?: string;
  /** Danh sách variants hiện có của product để kiểm tra trùng (size+color) */
  existingVariants?: ProductVariant[];
}

export const VariantFormModal: React.FC<VariantFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingVariant,
  productId,
  categoryName,
  existingVariants: existingVariantsProp,
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sku, setSku] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState("10");
  const [price, setPrice] = useState("");

  const [originalPriceCNY, setOriginalPriceCNY] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [weight, setWeight] = useState("");
  const [shippingFeePerKg, setShippingFeePerKg] = useState("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [applyImageToSameColor, setApplyImageToSameColor] = useState(false);
  const [duplicateComboError, setDuplicateComboError] = useState<string | null>(null);

  // Danh sách variants hiện có để kiểm tra trùng (size+color)
  const existingVariants: ProductVariant[] = existingVariantsProp || [];

  // Theo dõi unsaved changes để confirm trước khi đóng
  const hasUnsavedData = useMemo(() =>
    !editingVariant && (
      size.trim() || color.trim() || price ||
      originalPriceCNY || weight || images.length > 0
    ),
    [editingVariant, size, color, price, originalPriceCNY, weight, images.length]
  );

  const handleCloseConfirm = useCallback(() => {
    if (hasUnsavedData && !window.confirm('Bạn có muốn hủy các thay đổi chưa lưu không?')) return;
    onClose();
  }, [hasUnsavedData, onClose]);

  // Kiểm tra trùng realtime khi user nhập size/color
  useEffect(() => {
    if (editingVariant || !size || !color || existingVariants.length === 0) {
      setDuplicateComboError(null);
      return;
    }
    const isDuplicate = existingVariants.some(
      (v: ProductVariant) =>
        v.status !== 'DELETED' &&
        (v.size || null) === (size || null) &&
        (v.color || null) === (color || null)
    );
    setDuplicateComboError(isDuplicate ? `Biến thể (size: "${size}", màu: "${color}") đã tồn tại!` : null);
  }, [size, color, editingVariant, existingVariants]);

  const resetForm = () => {
    setSku(generateAutoSku(categoryName));
    setSize("");
    setColor("");
    setStock("10");
    setPrice("");

    setOriginalPriceCNY("");
    setExchangeRate("");
    setWeight("");
    setShippingFeePerKg("");
    setImage("");
    setImages([]);
    setIsUploading(false);
    setApplyImageToSameColor(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    getFeeConfigApi()
      .then((cfg) => {
        if (cfg) {
          if (cfg.shippingCnPerKg) {
            setShippingFeePerKg(cfg.shippingCnPerKg.toString());
          }
          if (cfg.exchangeRate) {
            // Luôn fill tỷ giá hệ thống vào state feeExchangeRate để dùng làm fallback
            // Nếu là Create mới hoặc Edit biến thể cũ chưa có tỷ giá → auto-fill vào ô input
            if (!editingVariant || !editingVariant.exchangeRate) {
              setExchangeRate(cfg.exchangeRate.toString());
            }
          }
        }
      })
      .catch((err) => console.warn("Could not fetch fee config:", err));

    if (editingVariant) {
      setSku(editingVariant.sku || "");
      setSize(editingVariant.size || "");
      setColor(editingVariant.color || "");
      setStock(editingVariant.stock?.toString() || "0");
      setPrice(editingVariant.price?.toString() || "");

      setOriginalPriceCNY(editingVariant.originalPriceCNY?.toString() || "");
      // Nếu biến thể đã có tỷ giá thì dùng, nếu không sẽ được fill bởi getFeeConfigApi() ở trên
      setExchangeRate(editingVariant.exchangeRate?.toString() || "");
      setWeight(editingVariant.weight?.toString() || "");
      if (editingVariant.weight && editingVariant.shippingCostVND) {
        const perKg = Math.round(
          editingVariant.shippingCostVND / editingVariant.weight,
        );
        setShippingFeePerKg(perKg > 0 ? perKg.toString() : "");
      }
      const initialImgs =
        editingVariant.images && editingVariant.images.length > 0
          ? editingVariant.images
          : editingVariant.image
          ? [editingVariant.image]
          : [];
      setImage(editingVariant.image || initialImgs[0] || "");
      setImages(initialImgs);
    } else {
      resetForm();
    }
  }, [editingVariant, isOpen, categoryName]);

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
          if (!image) setImage(res.url);
          showNotification('📸 Ảnh biến thể đã tải lên thành công!', "success");
        }
      } else {
        const resList = await uploadMultipleImagesApi(filesArray);
        if (resList && resList.length > 0) {
          const newUrls = resList.map((r) => r.url);
          const updated = [...images, ...newUrls];
          setImages(updated);
          if (!image && newUrls[0]) setImage(newUrls[0]);
          showNotification(
            `📸 ${newUrls.length} ảnh biến thể đã tải lên!`,
            "success",
          );
        }
      }
    } catch (err: any) {
      showNotification(err.message || "Variant image error", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (urlToRemove: string) => {
    const nextImages = images.filter((img) => img !== urlToRemove);
    setImages(nextImages);

    if (image === urlToRemove) {
      setImage(nextImages[0] || "");
    }

    if (
      urlToRemove.includes("cloudinary.com") ||
      urlToRemove.includes("res.cloudinary.com")
    ) {
      try {
        await deleteImageApi(urlToRemove);
        showNotification('🗑️ Ảnh đã được xóa khỏi Cloudinary!', "success");
      } catch (err) {
        console.warn("Image deletion failed:", err);
        showNotification("📋 Ảnh đã xóa khỏi danh sách!", "info");
      }
    } else {
      showNotification("🗑️ Ảnh đã xóa thành công!", "success");
    }
  };

  // Real-time Taobao import cost & profit calculations
  const cny = parseFloat(originalPriceCNY) || 0;
  const rate = parseFloat(exchangeRate) || 0;
  const kg = parseFloat(weight) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (duplicateComboError) {
      showNotification(`⚠️ ${duplicateComboError}`, 'error');
      return;
    }

    const finalImage = image || images[0] || null;
    const finalImages = images.length > 0 ? images : (image ? [image] : []);
    onSubmit({
      productId,
      sku,
      size: size || null,
      color: color || null,
      stock: parseInt(stock, 10) || 0,
      price: parseFloat(price) || 0,

      originalPriceCNY: cny > 0 ? cny : null,
      // Gửi undefined thay vì null khi không có tỷ giá → Backend sẽ tự động lấy tỷ giá hệ thống
      exchangeRate: rate > 0 ? rate : undefined,
      weight: kg > 0 ? kg : null,
      // KHÔNG gửi shippingCostVND, totalCostVND, profitVND:
      // Backend tự tính lại từ fee config hệ thống (weight × shippingCnPerKg)
      // → tránh sai lệch khi shippingFeePerKg trên UI bị stale so với DB
      image: finalImage,
      images: finalImages,
      // Flag để parent tự động áp ảnh cho các biến thể cùng màu
      ...(applyImageToSameColor && color.trim() ? {
        applyImageToSameColor: true,
        bulkColor: color.trim(),
        bulkImage: finalImage,
        bulkImages: finalImages,
      } : {}),
    });
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseConfirm}
      title={
        editingVariant
          ? (t('editVariant') || 'Edit Variant')
          : (t('addVariant') || 'Add Variant & Profit')
      }
      maxWidth="5xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isUploading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading || isUploading}
          >
            {editingVariant ? t('update') : t('addVariant')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Variant Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label={t('skuCode')}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU-GIAY-123456"
            disabled
            required
            className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed font-mono font-semibold"
            rightElement={
              !editingVariant ? (
                <button
                  type="button"
                  onClick={() => setSku(generateAutoSku(categoryName))}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title={t('regenerateSku')}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              ) : undefined
            }
          />
          <Input
            label={t('sizeLabel')}
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              setDuplicateComboError(null);
            }}
            placeholder="S, M, L, XL..."
          />
          <Input
            label={t('colorLabel')}
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              setDuplicateComboError(null);
            }}
            placeholder="Đen, Trắng, Đỏ..."
          />
        </div>

        {/* Variant Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('productImages')}
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
                {!isUploading && (
                  <Upload className="h-4 w-4 mr-1.5 text-indigo-500" />
                )}
                {isUploading ? t('uploading') : t('uploadImages')}
              </Button>

              <div className="flex-1 min-w-0">
                <Input
                  placeholder={t('orPasteImageUrl')}
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    if (e.target.value && !images.includes(e.target.value)) {
                      setImages((prev) => [...prev, e.target.value]);
                    }
                  }}
                />
              </div>
            </div>

            {/* Checkbox: Áp ảnh cho tất cả biến thể cùng màu */}
            {images.length > 0 && color.trim() && (
              <label className="flex items-center gap-2 px-1 py-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={applyImageToSameColor}
                  onChange={(e) => setApplyImageToSameColor(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  🎨 Áp dụng ảnh này cho tất cả biến thể màu <strong className="text-indigo-600 dark:text-indigo-400">"{color}"</strong>
                </span>
              </label>
            )}

            {/* Uploaded Variant Images Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2.5 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-white/10">
                {images.map((imgUrl, index) => {
                  const isMain = image === imgUrl;
                  return (
                    <div
                      key={index}
                      onClick={() => setImage(imgUrl)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                        isMain
                          ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                          : "border-slate-200 dark:border-white/10 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`VarImg ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(imgUrl);
                        }}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-600 shadow transition-all"
                        title={t('deleteImage')}
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

        {/* Duplicate combo warning */}
        {duplicateComboError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/30 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">⚠️ Biến thể bị trùng</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{duplicateComboError}</p>
            </div>
          </div>
        )}

        {/* Real-time Taobao Profit & Cost Section */}
        <VariantProfitCalculator
          values={{
            originalPriceCNY,
            exchangeRate,
            weight,
            shippingFeePerKg,
            price,
          }}
          onChange={(field, value) => {
            switch (field) {
              case 'originalPriceCNY': setOriginalPriceCNY(value); break;
              case 'exchangeRate': setExchangeRate(value); break;
              case 'weight': setWeight(value); break;
              case 'shippingFeePerKg': setShippingFeePerKg(value); break;
              case 'price': setPrice(value); break;
            }
          }}
        />

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t('sellingPriceVND')}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="250000"
            required
            currency
          />
          <Input
            label={`${t('stock')} *`}
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="100"
            required
          />
        </div>
      </form>
    </Modal>
  );
};
