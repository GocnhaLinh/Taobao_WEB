import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "../../../../lib/i18n";
import { Modal } from "../../../../components/ui/Modal";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import { Upload, Trash2, CheckCircle2, RefreshCw } from "lucide-react";
import {
  uploadSingleImageApi,
  uploadMultipleImagesApi,
  deleteImageApi,
} from "../../../../services/uploadService";
import { getFeeConfigApi } from "../../../../services/settingsService";
import { useNotification } from "../../../../lib/notification";
import { generateAutoSku } from "../../../../utils/skuHelper";
import { VariantProfitCalculator } from "./VariantProfitCalculator";
import type { Product, Category, Brand } from "../../../../types";

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
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initial Variant fields (for creating new product with 1 variant & China Profit tool)
  const [variantSku, setVariantSku] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantOriginalPriceCNY, setVariantOriginalPriceCNY] = useState("");
  const [variantExchangeRate, setVariantExchangeRate] = useState("");
  const [variantWeight, setVariantWeight] = useState("");
  const [variantShippingFeePerKg, setVariantShippingFeePerKg] = useState("");
  const [variantStock, setVariantStock] = useState("10");
  const [variantSize, setVariantSize] = useState("");
  const [variantColor, setVariantColor] = useState("");
  // Initial variant images (separate from product images)
  const [variantImage, setVariantImage] = useState("");
  const [variantImages, setVariantImages] = useState<string[]>([]);
  const variantFileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    const initCatId = categories[0]?.id || "";
    const initCat = categories.find((c) => c.id === initCatId);
    setProductName("");
    setCategoryId(initCatId);
    setBrandId("");
    setDescription("");
    setThumbnail("");
    setImages([]);
    setIsUploading(false);
    setVariantSku(generateAutoSku(initCat?.name));
    setVariantPrice("");
    setVariantOriginalPriceCNY("");
    setVariantWeight("");
    setVariantStock("10");
    setVariantSize("");
    setVariantColor("");
    setVariantImage("");
    setVariantImages([]);
  };

  // Fetch Fee Config on Modal Open
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    getFeeConfigApi()
      .then((cfg) => {
        if (cfg) {
          if (cfg.exchangeRate)
            setVariantExchangeRate(cfg.exchangeRate.toString());
          if (cfg.shippingCnPerKg)
            setVariantShippingFeePerKg(cfg.shippingCnPerKg.toString());
        }
      })
      .catch((err) => console.warn("Could not fetch fee config:", err));

    if (editingProduct) {
      setProductName(editingProduct.productName || "");
      setCategoryId(editingProduct.categoryId || categories[0]?.id || "");
      setBrandId(editingProduct.brandId || "");
      setDescription(editingProduct.description || "");
      setThumbnail(editingProduct.thumbnail || "");
      const existingImgs = (editingProduct.images || []).map(
        (img) => img.imageUrl,
      );
      if (
        editingProduct.thumbnail &&
        !existingImgs.includes(editingProduct.thumbnail)
      ) {
        existingImgs.unshift(editingProduct.thumbnail);
      }
      setImages(existingImgs);
      setVariantSku("");
      setVariantPrice("");
      setVariantOriginalPriceCNY("");
      setVariantWeight("");
      setVariantStock("10");
      setVariantSize("");
      setVariantColor("");
      setVariantImage("");
      setVariantImages([]);
    } else {
      resetForm();
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
          showNotification(
            t("productAddedSuccess") || "Image uploaded successfully!",
            "success",
          );
        }
      } else {
        const resList = await uploadMultipleImagesApi(filesArray);
        if (resList && resList.length > 0) {
          const newUrls = resList.map((r) => r.url);
          const updated = [...images, ...newUrls];
          setImages(updated);
          if (!thumbnail && newUrls[0]) setThumbnail(newUrls[0]);
          showNotification(
            `${newUrls.length} product images uploaded!`,
            "success",
          );
        }
      }
    } catch (err: any) {
      showNotification(err.message || "Image upload failed", "error");
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

    if (thumbnail === urlToRemove) {
      setThumbnail(nextImages[0] || "");
    }

    if (
      urlToRemove.includes("cloudinary.com") ||
      urlToRemove.includes("res.cloudinary.com")
    ) {
      try {
        await deleteImageApi(urlToRemove);
        showNotification(
          t("productAddedFailed") || "Image removed!",
          "success",
        );
      } catch (err) {
        console.warn("Image deletion failed:", err);
        showNotification("Image removed from list!", "info");
      }
    } else {
      showNotification("Image deleted successfully!", "success");
    }
  };

  const cny = parseFloat(variantOriginalPriceCNY) || 0;
  const kg = parseFloat(variantWeight) || 0;
  const sellingVND = parseFloat(variantPrice) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = productName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const finalThumbnail = thumbnail || images[0] || null;

    onSubmit({
      productName,
      slug: slug || `sp-${Date.now()}`,
      categoryId,
      brandId: brandId || null,
      description: description || null,
      thumbnail: finalThumbnail,
      images:
        images.length > 0 ? images : finalThumbnail ? [finalThumbnail] : [],
      ...(!editingProduct
        ? {
            initialVariant: {
              sku:
                variantSku.trim() ||
                generateAutoSku(
                  categories.find((c) => c.id === categoryId)?.name,
                ),
              price: sellingVND,
              originalPriceCNY: cny > 0 ? cny : undefined,
              // KHÔNG gửi exchangeRate — backend tự resolve từ fee config hệ thống
              // tránh sai lệch nếu tỷ giá thay đổi giữa lúc mở modal và lúc submit
              weight: kg > 0 ? kg : undefined,
              // KHÔNG gửi shippingCostVND — backend tự tính: weight × shippingCnPerKg
              stock: variantStock ? Number(variantStock) : 10,
              size: variantSize.trim() || undefined,
              color: variantColor.trim() || undefined,
              image: variantImage || finalThumbnail || undefined,
              images:
                variantImages.length > 0
                  ? variantImages
                  : variantImage
                    ? [variantImage]
                    : undefined,
            },
          }
        : {}),
    });
    resetForm();
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const brandOptions = [
    { value: "", label: t("noBrand") },
    ...brands.map((b) => ({
      value: b.id,
      label: b.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingProduct
          ? t("editProduct") || "Edit Product"
          : t("addProduct") || "Add Product"
      }
      maxWidth="5xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading || isUploading}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading || isUploading}
            onClick={handleSubmit}
            className="flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {editingProduct ? t("saveChanges") : t("addProduct")}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("productName")}
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder={t("productNamePlaceholder")}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomSelect
            label={t("category")}
            value={categoryId}
            onChange={(newCatId) => {
              setCategoryId(newCatId);
              if (!editingProduct) {
                const cat = categories.find((c) => c.id === newCatId);
                setVariantSku(generateAutoSku(cat?.name));
              }
            }}
            options={categoryOptions}
            placeholder={
              t("selectTargetPlaceholder") || "-- Select category --"
            }
          />

          <CustomSelect
            label={t("brand")}
            value={brandId}
            onChange={(newBrandId) => setBrandId(newBrandId)}
            options={brandOptions}
            placeholder={t("noBrand")}
          />
        </div>

        {/* Multi-Image Upload Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {t("productImages")}
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
                {isUploading ? t("uploading") : t("uploadImages")}
              </Button>

              <div className="flex-1 min-w-0">
                <Input
                  placeholder={t("orPasteImageUrl")}
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
                          ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                          : "border-slate-200 dark:border-white/10 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`ProdImg ${index}`}
                        className="w-full h-full object-cover"
                      />

                      {isMain && (
                        <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow">
                          <CheckCircle2 className="h-2.5 w-2.5" />{" "}
                          {t("mainImage")}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(imgUrl);
                        }}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-600 shadow transition-all"
                        title={t("deleteImage")}
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
            {t("productDescription")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 text-sm font-medium bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder={t("descriptionPlaceholder")}
          />
        </div>

        {/* Initial Variant & China Profit Calculator Section */}
        {!editingProduct && (
          <div className="space-y-3">
            <VariantProfitCalculator
              values={{
                originalPriceCNY: variantOriginalPriceCNY,
                exchangeRate: variantExchangeRate,
                weight: variantWeight,
                shippingFeePerKg: variantShippingFeePerKg,
                price: variantPrice,
              }}
              onChange={(field, value) => {
                switch (field) {
                  case "originalPriceCNY":
                    setVariantOriginalPriceCNY(value);
                    break;
                  case "exchangeRate":
                    setVariantExchangeRate(value);
                    break;
                  case "weight":
                    setVariantWeight(value);
                    break;
                  case "shippingFeePerKg":
                    setVariantShippingFeePerKg(value);
                    break;
                  case "price":
                    setVariantPrice(value);
                    break;
                }
              }}
            />

            {/* Variant Image Upload Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {(t as any)("variantImage") || "Ảnh biến thể (tùy chọn)"}
              </label>
              <input
                type="file"
                ref={variantFileInputRef}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const res = await uploadSingleImageApi(file);
                    if (res?.url) {
                      const updated = [...variantImages, res.url];
                      setVariantImages(updated);
                      if (!variantImage) setVariantImage(res.url);
                      showNotification(
                        "📸 Ảnh biến thể đã tải lên!",
                        "success",
                      );
                    }
                  } catch (err: any) {
                    showNotification(err.message || "Upload thất bại", "error");
                  }
                  if (variantFileInputRef.current)
                    variantFileInputRef.current.value = "";
                }}
                accept="image/*"
                className="hidden"
              />
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => variantFileInputRef.current?.click()}
                  className="shrink-0 text-xs"
                >
                  <Upload className="h-4 w-4 mr-1.5 text-indigo-500" />
                  {t("uploadImages")}
                </Button>
                <div className="flex-1 min-w-0">
                  <Input
                    placeholder={t("orPasteImageUrl")}
                    value={variantImage}
                    onChange={(e) => {
                      setVariantImage(e.target.value);
                      if (
                        e.target.value &&
                        !variantImages.includes(e.target.value)
                      ) {
                        setVariantImages((prev) => [...prev, e.target.value]);
                      }
                    }}
                  />
                </div>
              </div>
              {variantImages.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2 p-2.5 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-white/10">
                  {variantImages.map((url, idx) => {
                    const isMain = variantImage === url;
                    return (
                      <div
                        key={idx}
                        onClick={() => setVariantImage(url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                          isMain
                            ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                            : "border-slate-200 dark:border-white/10 hover:border-slate-400"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`VarImg ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = variantImages.filter((u) => u !== url);
                            setVariantImages(next);
                            if (variantImage === url)
                              setVariantImage(next[0] || "");
                          }}
                          className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-600 shadow transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Extra fields: SKU, Size, Color */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                label={t("skuCode")}
                value={variantSku}
                onChange={(e) => setVariantSku(e.target.value)}
                placeholder="SKU-GIAY-123456"
                disabled
                className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed font-mono font-semibold"
                rightElement={
                  !editingProduct ? (
                    <button
                      type="button"
                      onClick={() => {
                        const cat = categories.find((c) => c.id === categoryId);
                        setVariantSku(generateAutoSku(cat?.name));
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      title={t("regenerateSku")}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  ) : undefined
                }
              />
              <Input
                label={t("sizeLabel")}
                value={variantSize}
                onChange={(e) => setVariantSize(e.target.value)}
                placeholder="S, M, L, XL..."
              />
              <Input
                label={t("colorLabel")}
                value={variantColor}
                onChange={(e) => setVariantColor(e.target.value)}
                placeholder="Black, White, Red..."
              />
              <Input
                label={(t("stock") || "Kho") + " *"}
                type="number"
                value={variantStock}
                onChange={(e) => setVariantStock(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

