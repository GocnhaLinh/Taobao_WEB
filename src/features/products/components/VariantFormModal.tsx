import React, { useState, useEffect, useRef } from "react";
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
          showNotification("Tải ảnh biến thể lên thành công!", "success");
        }
      } else {
        const resList = await uploadMultipleImagesApi(filesArray);
        if (resList && resList.length > 0) {
          const newUrls = resList.map((r) => r.url);
          const updated = [...images, ...newUrls];
          setImages(updated);
          if (!image && newUrls[0]) setImage(newUrls[0]);
          showNotification(
            `Đã tải lên thành công ${newUrls.length} ảnh biến thể!`,
            "success",
          );
        }
      }
    } catch (err: any) {
      showNotification(err.message || "Lỗi tải ảnh biến thể", "error");
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
        showNotification("Đã xóa ảnh thành công!", "success");
      } catch (err) {
        console.warn("Xóa ảnh thất bại:", err);
        showNotification("Đã gỡ ảnh khỏi danh sách!", "info");
      }
    } else {
      showNotification("Đã xóa ảnh thành công!", "success");
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
          ? "Chỉnh sửa Phiên bản Sản phẩm"
          : "Thêm Phiên bản mới & Tính Lợi Nhuận"
      }
      maxWidth="5xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isUploading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading || isUploading}
          >
            {editingVariant ? "Cập nhật biến thể" : "Thêm biến thể"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Variant Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Input
              label="Mã SKU (Tự động tạo) *"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="SKU-GIAY-123456"
              disabled
              required
              className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed font-mono font-semibold pr-9"
            />
            {!editingVariant && (
              <button
                type="button"
                onClick={() => setSku(generateAutoSku(categoryName))}
                className="absolute right-2 top-7 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Tạo lại mã SKU mới"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
          <Input
            label="Kích thước (Size)"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="S, M, L, XL..."
          />
          <Input
            label="Màu sắc (Color)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Đen, Trắng, Đỏ..."
          />
        </div>

        {/* Variant Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Hình ảnh phiên bản (Tải lên 1 hoặc nhiều ảnh)
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
                {isUploading ? "Đang tải ảnh..." : "Tải nhiều ảnh từ máy"}
              </Button>

              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Hoặc dán URL ảnh biến thể (https://...)"
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

        {/* Real-time Taobao Profit & Cost Section */}
        <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Calculator className="h-4 w-4" />
              Công cụ tính Lợi Nhuận nhập hàng Trung Quốc
            </h4>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label="Giá gốc NDT (¥ Trung)"
              type="number"
              step="0.01"
              value={originalPriceCNY}
              onChange={(e) => setOriginalPriceCNY(e.target.value)}
              placeholder="Ví dụ: 45 (Tệ)"
            />
            <Input
              label="Tỷ giá NDT ➔ VNĐ"
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="3,500đ"
              disabled
            />
            <Input
              label="Cân nặng (kg)"
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ví dụ: 0.5 (kg)"
            />
            <Input
              label="Phí Vận chuyển TQ ➔ VN"
              type="number"
              value={shippingFeePerKg}
              onChange={(e) => setShippingFeePerKg(e.target.value)}
              placeholder="Ví dụ: 28000"
              disabled
            />
          </div>

          {/* Realtime Profit Card Summary */}
          {cny > 0 && (
            <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">
                  Phí Vận chuyển TQ➔VN:
                </span>
                <strong className="text-slate-900 dark:text-white font-bold text-xs">
                  {shipVND.toLocaleString()} đ ({kg}kg)
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">
                  Giá gốc về kho VN:
                </span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  {totalCostVND.toLocaleString()} đ
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">
                  Lợi nhuận ước tính:
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
                  Tỷ suất: {profitMargin}%
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Giá bán ra thị trường Việt (VNĐ) *"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ví dụ: 250000"
            required
          />
          <Input
            label="Số lượng Tồn kho *"
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
