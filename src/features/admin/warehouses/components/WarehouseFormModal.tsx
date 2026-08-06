import React, { useState, useEffect } from 'react';
import { useTranslation } from "../../../../lib/i18n";
import { Modal } from "../../../../components/ui/Modal";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import {
  Building2,
  Code,
  MapPin,
  Globe,
  Tag,
  Star,
  RefreshCw,
} from "lucide-react";
import {
  generateWarehouseCode,
  extractCodeSuffix,
  randomDigits,
} from "../utils/warehouse.utils";

import type { WarehouseFormModalProps } from "../types";

export const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [supportedProvincesText, setSupportedProvincesText] = useState("");
  const [supportedDistrictsText, setSupportedDistrictsText] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [fixedSuffix, setFixedSuffix] = useState<string>("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const resetForm = () => {
    setFixedSuffix(randomDigits());
    setName("");
    setProvince("");
    setDistrict("");
    setAddress("");
    setSupportedProvincesText("");
    setSupportedDistrictsText("");
    setIsDefault(false);
    setErrors({});
    setTouched({});
  };

  // ─── Reset state when modal opens/closes or initialData changes ───
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const initialSuffix =
          extractCodeSuffix(initialData.code || "") || randomDigits();
        setFixedSuffix(initialSuffix);
        setName(initialData.name || "");
        setProvince(initialData.province || "");
        setDistrict(initialData.district || "");
        setAddress(initialData.address || "");
        setSupportedProvincesText(
          initialData.supportedProvinces
            ? initialData.supportedProvinces.join(", ")
            : "",
        );
        setSupportedDistrictsText(
          initialData.supportedDistricts
            ? initialData.supportedDistricts.join(", ")
            : "",
        );
        setIsDefault(Boolean(initialData.isDefault));
      } else {
        resetForm();
      }
      setErrors({});
      setTouched({});
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  // ─── Tự động cập nhật tiền tố mã kho khi thay đổi Tên hoặc Tỉnh/Thành ───
  // Giữ nguyên số đuôi (fixedSuffix) không đổi khi nhập phím
  useEffect(() => {
    if (isOpen && fixedSuffix) {
      const newCode = generateWarehouseCode(
        name.trim() || "Warehouse",
        province.trim() || "XX",
        fixedSuffix,
      );
      setCode(newCode);
    }
  }, [name, province, fixedSuffix, isOpen]);

  // ─── Bấm nút xoay để sinh ngẫu nhiên số đuôi mới ───────
  const handleRefreshCode = () => {
    setFixedSuffix(randomDigits());
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = t("requiredField") || "Required";
    if (!name.trim()) newErrors.name = t("requiredField") || "Required";
    if (!province.trim()) newErrors.province = t("requiredField") || "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validate on blur
    if (field === "code" && !code.trim()) {
      setErrors((prev) => ({
        ...prev,
        code: t("requiredField") || "Required",
      }));
    }
    if (field === "name" && !name.trim()) {
      setErrors((prev) => ({
        ...prev,
        name: t("requiredField") || "Required",
      }));
    }
    if (field === "province" && !province.trim()) {
      setErrors((prev) => ({
        ...prev,
        province: t("requiredField") || "Required",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const supportedProvinces = supportedProvincesText
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const supportedDistricts = supportedDistrictsText
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    onSubmit({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      province: province.trim(),
      district: district.trim() || undefined,
      address: address.trim() || undefined,
      supportedProvinces:
        supportedProvinces.length > 0 ? supportedProvinces : undefined,
      supportedDistricts:
        supportedDistricts.length > 0 ? supportedDistricts : undefined,
      isDefault,
    });
    resetForm();
  };

  const modalTitle = initialData ? (
    <span className="flex items-center gap-2">
      <Building2 className="h-5 w-5 text-indigo-500" />
      {t("editWarehouseTitle")}
    </span>
  ) : (
    <span className="flex items-center gap-2">
      <Building2 className="h-5 w-5 text-indigo-500" />
      {t("addWarehouseTitle")}
    </span>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {isLoading
              ? t("saving")
              : initialData
                ? t("updateWarehouse")
                : t("saveWarehouse")}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Code & Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t("warehouseCode")}
            value={code}
            icon={<Code className="h-4 w-4" />}
            disabled
            className="opacity-90 border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10 font-mono font-semibold"
            onChange={() => {}}
            rightElement={
              <button
                type="button"
                onClick={handleRefreshCode}
                className="p-1 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-500/15 transition-all cursor-pointer"
                title={t("regenerateSku") || "Regenerate"}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            }
          />
          <Input
            label={t("warehouseName")}
            placeholder={t("warehouseNamePlaceholder")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            onBlur={() => handleBlur("name")}
            error={touched.name && errors.name ? errors.name : undefined}
            icon={<Building2 className="h-4 w-4" />}
            helperText={name.length > 0 ? `${name.length}/100` : undefined}
            maxLength={100}
            required
          />
        </div>

        {/* Province & District Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t("warehouseProvince")}
            placeholder={t("warehouseProvincePlaceholder")}
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              if (errors.province)
                setErrors((prev) => ({ ...prev, province: "" }));
            }}
            onBlur={() => handleBlur("province")}
            error={
              touched.province && errors.province ? errors.province : undefined
            }
            icon={<MapPin className="h-4 w-4" />}
            required
          />
          <Input
            label={t("warehouseDistrict")}
            placeholder={t("warehouseDistrictPlaceholder")}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            icon={<MapPin className="h-4 w-4" />}
          />
        </div>

        {/* Detailed Address */}
        <Input
          label={t("warehouseAddress")}
          placeholder={t("warehouseAddressPlaceholder")}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          icon={<MapPin className="h-4 w-4" />}
        />

        {/* Supported Provinces Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            {t("warehouseSupportedProvinces")}
          </label>
          <Input
            placeholder={t("warehouseSupportedProvincesPlaceholder")}
            value={supportedProvincesText}
            onChange={(e) => setSupportedProvincesText(e.target.value)}
            icon={<Tag className="h-4 w-4" />}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {t("warehouseSupportedProvincesHint")}
          </p>
          {/* Show chips for entered provinces */}
          {supportedProvincesText.trim() && (
            <div className="flex flex-wrap gap-1 mt-2">
              {supportedProvincesText.split(",").map((p, i) => {
                const trimmed = p.trim();
                if (!trimmed) return null;
                return (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium"
                  >
                    {trimmed}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Supported Districts Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            {t("warehouseSupportedDistricts")}
          </label>
          <Input
            placeholder={t("warehouseSupportedDistrictsPlaceholder")}
            value={supportedDistrictsText}
            onChange={(e) => setSupportedDistrictsText(e.target.value)}
            icon={<Tag className="h-4 w-4" />}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {t("warehouseSupportedDistrictsHint")}
          </p>
          {/* Show chips for entered districts */}
          {supportedDistrictsText.trim() && (
            <div className="flex flex-wrap gap-1 mt-2">
              {supportedDistrictsText.split(",").map((d, i) => {
                const trimmed = d.trim();
                if (!trimmed) return null;
                return (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-medium"
                  >
                    {trimmed}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Default Checkbox */}
        <div className="flex items-center gap-2 pt-1 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label
            htmlFor="isDefault"
            className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5"
          >
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {t("warehouseSetDefault")}
          </label>
        </div>
      </form>
    </Modal>
  );
};
