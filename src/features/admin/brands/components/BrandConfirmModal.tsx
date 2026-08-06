import React from "react";
import { useTranslation } from "../../../../lib/i18n";
import { Modal } from "../../../../components/ui/Modal";
import { Button } from "../../../../components/ui/Button";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

import type { BrandConfirmModalProps } from "../types";

export const BrandConfirmModal: React.FC<BrandConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  brand,
  type,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  if (!brand) return null;

  const getContent = () => {
    switch (type) {
      case "SOFT_DELETE":
        return {
          title: t("brandConfirmSoftDeleteTitle"),
          icon: <Trash2 className="h-6 w-6 text-amber-500" />,
          bgColor: "bg-amber-500/10 border-amber-500/20",
          message: (
            <span>
              {t("brandConfirmSoftDeleteDesc", { name: brand.name }) ||
                `Move "${brand.name}" to Trash?`}
            </span>
          ),
          confirmButtonText: t("confirmDeleteProductBtn"),
          confirmVariant: "danger" as const,
        };
      case "RESTORE":
        return {
          title: t("brandConfirmRestoreTitle"),
          icon: <RotateCcw className="h-6 w-6 text-emerald-500" />,
          bgColor: "bg-emerald-500/10 border-emerald-500/20",
          message: (
            <span>
              {t("brandConfirmRestoreDesc", { name: brand.name }) ||
                `Restore "${brand.name}"?`}
            </span>
          ),
          confirmButtonText: t("warehouseConfirmRestoreBtn"),
          confirmVariant: "primary" as const,
        };
      case "HARD_DELETE":
        return {
          title: t("brandConfirmHardDeleteTitle"),
          icon: <AlertTriangle className="h-6 w-6 text-rose-500" />,
          bgColor: "bg-rose-500/10 border-rose-500/20",
          message: (
            <span>
              {t("brandConfirmHardDeleteDesc", { name: brand.name }) ||
                `Permanently delete "${brand.name}"?`}
            </span>
          ),
          confirmButtonText: t("confirmForceDeleteProductBtn"),
          confirmVariant: "danger" as const,
        };
    }
  };

  const { title, icon, bgColor, message, confirmButtonText, confirmVariant } =
    getContent();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmButtonText}
          </Button>
        </>
      }
    >
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300 ${bgColor}`}
      >
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="leading-relaxed">{message}</div>
      </div>
    </Modal>
  );
};
