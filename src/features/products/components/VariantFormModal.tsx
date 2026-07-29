import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "../../../lib/i18n";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  Calculator,
  TrendingUp,
  Sparkles,
  Upload,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  uploadSingleImageApi,
  uploadMultipleImagesApi,
  deleteImageApi,
} from "../../../services/uploadService";
import { getFeeConfigApi } from "../../../services/settingsService";
import { useNotification } from "../../../lib/notification";
import { generateAutoSku } from "../../../utils/skuHelper";
import type { ProductVariant } from "../../../types";

interface VariantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  editingVariant?: ProductVariant | null;
  productId: string;
  categoryName?: string;
}

export const VariantFormModal: React.FC<VariantFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingVariant,
  productId,
  categoryName,
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

  useEffect(() => {
    if (isOpen) {
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
    }

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
      setSku(generateAutoSku(categoryName));
      setSize("");
      setColor("");
      setStock("10");
      setPrice("");
      setOriginalPriceCNY("");
      setWeight("");
      setImage("");
      setImages([]);
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
          showNotification(t('variantAdded') || 'Variant image uploaded!', "success");
        }
      } else {
        const resList = await uploadMultipleImagesApi(filesArray);
        if (resList && resList.length > 0) {
          const newUrls = resList.map((r) => r.url);
          const updated = [...images, ...newUrls];
          setImages(updated);
          if (!image && newUrls[0]) setImage(newUrls[0]);
          showNotification(
            `${newUrls.length} variant images uploaded!`,
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
        showNotification(t('variantDeleted') || 'Image deleted!', "success");
      } catch (err) {
        console.warn("Image deletion failed:", err);
        showNotification("Image removed from list!", "info");
      }
    } else {
      showNotification("Image deleted successfully!", "success");
    }
  };

  // Real-time Taobao import cost & profit calculations
  const cny = parseFloat(originalPriceCNY) || 0;
  const rate = parseFloat(exchangeRate) || 0;
  const kg = parseFloat(weight) || 0;
  const shipPerKg = parseFloat(shippingFeePerKg) || 0;

  const rawShip = kg * shipPerKg;
  const shipVND = Math.round(rawShip); // Phí ship = Số kg * Phí ship per kg
  const totalCostVND = Math.round(cny * rate + rawShip); // Giá gốc về kho = (Giá Tệ * Tỷ giá) + Phí ship
  const sellingVND = parseFloat(price) || 0;
  const profitVND = Math.round(sellingVND - totalCostVND);
  const profitMargin =
    sellingVND > 0 ? ((profitVND / sellingVND) * 100).toFixed(1) : "0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      image: image || images[0] || null,
      images: images.length > 0 ? images : (image ? [image] : []),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
            onChange={(e) => setSize(e.target.value)}
            placeholder="S, M, L, XL..."
          />
          <Input
            label={t('colorLabel')}
            value={color}
            onChange={(e) => setColor(e.target.value)}
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

        {/* Real-time Taobao Profit & Cost Section */}
        <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Calculator className="h-4 w-4" />
              {t('initialVariant') || 'China Import Profit Calculator'}
            </h4>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label={t('originCostCNY')}
              type="number"
              step="0.01"
              value={originalPriceCNY}
              onChange={(e) => setOriginalPriceCNY(e.target.value)}
              placeholder="E.g. 45 (CNY)"
            />
            <Input
              label={t('exchangeRateLabel')}
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="3,500đ"
              disabled
            />
            <Input
              label={t('weightKg')}
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="E.g. 0.5 (kg)"
            />
            <Input
              label={t('shippingCnFee')}
              type="number"
              value={shippingFeePerKg}
              onChange={(e) => setShippingFeePerKg(e.target.value)}
              placeholder="E.g. 28000"
              disabled
            />
          </div>

          {/* Realtime Profit Card Summary */}
          {cny > 0 && (
            <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">
                  {t('shippingFeeCalc')}
                </span>
                <strong className="text-slate-900 dark:text-white font-bold text-xs">
                  {shipVND.toLocaleString()} đ ({kg}kg)
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">
                  {t('totalLandingCost')}
                </span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  {totalCostVND.toLocaleString()} đ
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">
                  {t('estimatedProfit')}
                </span>
                <strong
                  className={`font-bold text-xs ${profitVND >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {profitVND >= 0 ? "+" : ""}
                  {profitVND.toLocaleString()} đ
                </strong>
              </div>
              <div className="flex items-center">
                <Badge
                  variant={
                    parseFloat(profitMargin) >= 30
                      ? "success"
                      : parseFloat(profitMargin) > 0
                        ? "info"
                        : "danger"
                  }
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('profitRate', { margin: profitMargin })}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t('sellingPriceVND')}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="E.g. 250000"
            required
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
