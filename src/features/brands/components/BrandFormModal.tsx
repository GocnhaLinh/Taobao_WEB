import React, { useState, useEffect, useRef } from "react";
import type { Brand } from "../../../types";
import { useTranslation } from "../../../lib/i18n";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Award, Upload, X } from "lucide-react";
import {
  uploadSingleImageApi,
  deleteImageApi,
} from "../../../services/uploadService";
import { useNotification } from "../../../lib/notification";

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    logo?: string;
    description?: string;
  }) => void;
  initialData?: Brand | null;
  isLoading?: boolean;
}

export const BrandFormModal: React.FC<BrandFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [imgError, setImgError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);

  const resetForm = () => {
    setName("");
    setLogo("");
    setDescription("");
    setImgError(false);
    setIsUploading(false);
    setIsDeletingLogo(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setLogo(initialData.logo || "");
        setDescription(initialData.description || "");
        setImgError(false);
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification(
        "Please select a valid image file (PNG, JPG, WEBP).",
        "error",
      );
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadSingleImageApi(file);
      if (res && res.url) {
        setLogo(res.url);
        setImgError(false);
        showNotification(t('brandCreated') || "Logo uploaded successfully!", "success");
      }
    } catch (error: any) {
      showNotification(
        error.message || "Logo upload failed, please try again.",
        "error",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!logo) return;

    const logoToDelete = logo;
    setLogo("");
    setImgError(false);

    // Call delete API if logo is an uploaded image URL
    if (
      logoToDelete.includes("cloudinary.com") ||
      logoToDelete.includes("res.cloudinary.com")
    ) {
      try {
        setIsDeletingLogo(true);
        await deleteImageApi(logoToDelete);
        showNotification("Logo removed successfully!", "success");
      } catch (err: any) {
        console.warn("Failed to delete image from server:", err);
      } finally {
        setIsDeletingLogo(false);
      }
    } else {
      showNotification("Logo removed successfully!", "success");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      logo: logo.trim() || undefined,
      description: description.trim() || undefined,
    });
    resetForm();
  };

  const modalTitle = initialData
    ? t('editBrandTitle')
    : t('addBrandTitle');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isUploading || isDeletingLogo}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={isUploading || isDeletingLogo}
          >
            {initialData ? t('updateBrand') : t('saveBrand')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand Name Input */}
        <Input
          label={t('brandName')}
          placeholder={t('brandNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Logo Upload Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('brandLogo')}
          </label>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="space-y-2.5">
            {/* Upload Button & URL Row */}
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                disabled={isDeletingLogo}
                className="shrink-0 text-xs"
              >
                {!isUploading && (
                  <Upload className="h-4 w-4 mr-1.5 text-indigo-500" />
                )}
                {isUploading ? t('uploading') : t('uploadBrandImage')}
              </Button>

              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Or paste logo URL (https://...)"
                  value={logo}
                  onChange={(e) => {
                    setLogo(e.target.value);
                    setImgError(false);
                  }}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Live Logo Preview Box */}
            {logo ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {!imgError ? (
                      <img
                        src={logo}
                        alt="Preview"
                        onError={() => setImgError(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Award className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {imgError ? t('brandLogoInvalid') : t('brandLogoReady')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate max-w-[200px] sm:max-w-[260px]">
                      {logo}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={isDeletingLogo}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  title={t('deleteImage') || "Remove logo from server"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Click <strong>"Upload file"</strong> to select a logo image from your device, or paste a URL directly.
              </p>
            )}
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('brandDescription')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a short description about the brand's origin and products..."
            rows={3}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
