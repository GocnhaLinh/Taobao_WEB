import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "../../../../lib/i18n";
import {
  uploadSingleImageApi,
  uploadMultipleImagesApi,
  deleteImageApi,
} from "../../../../services/uploadService";
import { getFeeConfigApi } from "../../settings/api/settings.api";
import { useNotification } from "../../../../lib/notification";
import { generateAutoSku } from "../../../../utils/skuHelper";
import type { ProductVariant } from "../../../../types";
import type {
  UseVariantFormModalParams,
  UseVariantFormModalReturn,
} from "../types/product.types";

export const useVariantFormModal = ({
  isOpen,
  onSubmit,
  editingVariant,
  productId,
  categoryName,
  existingVariants: existingVariantsProp,
}: UseVariantFormModalParams): UseVariantFormModalReturn => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track Cloudinary image URLs uploaded during this modal session
  const sessionUploadedCloudinaryUrlsRef = useRef<Set<string>>(new Set());

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

  const existingVariants: ProductVariant[] = existingVariantsProp || [];

  const hasUploadedImages = useCallback((): boolean => {
    return sessionUploadedCloudinaryUrlsRef.current.size > 0;
  }, []);

  const cleanupSessionImages = useCallback(async () => {
    const urls = Array.from(sessionUploadedCloudinaryUrlsRef.current);
    sessionUploadedCloudinaryUrlsRef.current.clear();
    if (urls.length > 0) {
      await Promise.all(
        urls.map((url) =>
          deleteImageApi(url).catch((err) =>
            console.warn("Failed to cleanup session image on cancel:", url, err)
          )
        )
      );
    }
  }, []);

  useEffect(() => {
    if (editingVariant || !size || !color || existingVariants.length === 0) {
      setDuplicateComboError(null);
      return;
    }
    const isDuplicate = existingVariants.some(
      (v: ProductVariant) =>
        v.status !== "DELETED" &&
        (v.size || null) === (size || null) &&
        (v.color || null) === (color || null)
    );
    setDuplicateComboError(
      isDuplicate
        ? t("variantDuplicateExist", { size: size || "N/A", color: color || "N/A" })
        : null
    );
  }, [size, color, editingVariant, existingVariants, t]);

  const resetForm = useCallback(() => {
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
    sessionUploadedCloudinaryUrlsRef.current.clear();
  }, [categoryName]);

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
      setExchangeRate(editingVariant.exchangeRate?.toString() || "");
      setWeight(editingVariant.weight?.toString() || "");
      if (editingVariant.weight && editingVariant.shippingCostVND) {
        const perKg = Math.round(
          editingVariant.shippingCostVND / editingVariant.weight
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
  }, [editingVariant, isOpen, categoryName, resetForm]);

  const trackUploadedUrl = (url: string) => {
    if (url && (url.includes("cloudinary.com") || url.includes("res.cloudinary.com"))) {
      sessionUploadedCloudinaryUrlsRef.current.add(url);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const filesArray = Array.from(filesList);
    setIsUploading(true);

    try {
      if (filesArray.length === 1) {
        const res = await uploadSingleImageApi(filesArray[0]);
        if (res && res.url) {
          trackUploadedUrl(res.url);
          const updated = [...images, res.url];
          setImages(updated);
          if (!image) setImage(res.url);
          showNotification(t("imageUploadSuccess"), "success");
        }
      } else {
        const resList = await uploadMultipleImagesApi(filesArray);
        if (resList && resList.length > 0) {
          const newUrls = resList.map((r) => {
            trackUploadedUrl(r.url);
            return r.url;
          });
          const updated = [...images, ...newUrls];
          setImages(updated);
          if (!image && newUrls[0]) setImage(newUrls[0]);
          showNotification(
            t("imagesUploadSuccess", { count: newUrls.length }),
            "success"
          );
        }
      }
    } catch (err: any) {
      showNotification(err.message || t("imageUploadFailed"), "error");
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

    if (sessionUploadedCloudinaryUrlsRef.current.has(urlToRemove)) {
      sessionUploadedCloudinaryUrlsRef.current.delete(urlToRemove);
    }

    if (
      urlToRemove.includes("cloudinary.com") ||
      urlToRemove.includes("res.cloudinary.com")
    ) {
      try {
        await deleteImageApi(urlToRemove);
        showNotification(t("imageCloudinaryDeleteSuccess"), "success");
      } catch (err) {
        console.warn("Image deletion failed:", err);
        showNotification(t("imageRemovedFromList"), "info");
      }
    } else {
      showNotification(t("imageDeleteSuccess"), "success");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (duplicateComboError) {
      showNotification(`⚠️ ${duplicateComboError}`, "error");
      return;
    }

    const cny = parseFloat(originalPriceCNY) || 0;
    const rate = parseFloat(exchangeRate) || 0;
    const kg = parseFloat(weight) || 0;

    const finalImage = image || images[0] || null;
    const finalImages = images.length > 0 ? images : image ? [image] : [];

    // Form successfully submitted -> keep these images, clear session tracking
    sessionUploadedCloudinaryUrlsRef.current.clear();

    onSubmit({
      productId,
      sku,
      size: size || null,
      color: color || null,
      stock: parseInt(stock, 10) || 0,
      price: parseFloat(price) || 0,

      originalPriceCNY: cny > 0 ? cny : null,
      exchangeRate: rate > 0 ? rate : undefined,
      weight: kg > 0 ? kg : null,
      image: finalImage,
      images: finalImages,
      ...(applyImageToSameColor && color.trim()
        ? {
            applyImageToSameColor: true,
            bulkColor: color.trim(),
            bulkImage: finalImage,
            bulkImages: finalImages,
          }
        : {}),
    });
    resetForm();
  };

  return {
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
    resetForm,
  };
};
