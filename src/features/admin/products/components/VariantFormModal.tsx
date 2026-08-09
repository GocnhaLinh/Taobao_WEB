import React, { useState } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { ConfirmModal } from "../../../../components/ui/ConfirmModal";
import {
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { generateAutoSku } from "../../../../utils/skuHelper";
import { VariantProfitCalculator } from "./VariantProfitCalculator";
import { useVariantFormModal } from "../hooks/useVariantFormModal";
import type { VariantFormModalProps } from "../types/product.types";

export const VariantFormModal: React.FC<VariantFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingVariant,
  productId,
  categoryName,
  existingVariants,
}) => {
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const {
    t,
    fileInputRef,
    sku,
    setSku,
    size,
    setSize,
    color,
    setColor,
    stock,
    setStock,
    price,
    setPrice,
    originalPriceCNY,
    setOriginalPriceCNY,
    exchangeRate,
    setExchangeRate,
    weight,
    setWeight,
    shippingFeePerKg,
    setShippingFeePerKg,
    image,
    setImage,
    images,
    setImages,
    isUploading,
    applyImageToSameColor,
    setApplyImageToSameColor,
    duplicateComboError,
    setDuplicateComboError,
    cleanupSessionImages,
    hasUploadedImages,
    handleFileChange,
    handleRemoveImage,
    handleSubmit,
  } = useVariantFormModal({
    isOpen,
    onClose,
    onSubmit,
    editingVariant,
    productId,
    categoryName,
    existingVariants,
  });

  const handleAttemptClose = () => {
    if (hasUploadedImages()) {
      setIsCancelConfirmOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleAttemptClose}
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
              onClick={handleAttemptClose}
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

            {/* Uploading Progress Status Banner */}
            {isUploading && (
              <div className="flex items-center gap-2.5 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 animate-in fade-in duration-200">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="font-medium">⚡ Đang nén & tải ảnh lên Cloudinary, vui lòng chờ trong giây lát...</span>
              </div>
            )}

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

            {/* Uploaded Variant Images Preview & Loading Skeleton */}
            {(images.length > 0 || isUploading) && (
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

                {isUploading && (
                  <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-indigo-400/80 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/30 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin mb-1 text-indigo-500" />
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">Đang tải ảnh...</span>
                  </div>
                )}
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

    <ConfirmModal
      isOpen={isCancelConfirmOpen}
      onClose={() => setIsCancelConfirmOpen(false)}
      onConfirm={async () => {
        setIsCancelConfirmOpen(false);
        await cleanupSessionImages();
        onClose();
      }}
      title={t('confirmCancelTitle') || 'Xác nhận hủy thay đổi'}
      description={t('confirmCancelDesc') || 'Bạn có các thay đổi hoặc ảnh vừa tải lên chưa lưu. Tất cả ảnh chưa lưu sẽ tự động bị xóa khỏi Cloudinary.'}
      confirmText={t('confirmCancelBtn') || 'Hủy thay đổi'}
      cancelText={t('keepEditingBtn') || 'Tiếp tục chỉnh sửa'}
      variant="warning"
    />
  </>
  );
};
