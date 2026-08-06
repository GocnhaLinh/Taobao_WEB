import React from "react";
import { Archive, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { useTranslation } from "../../../../lib/i18n";
import type { BrandTableProps } from "../types";
import { BrandItem } from "./BrandItem";

export const BrandTable: React.FC<BrandTableProps> = ({
  brands,
  activeTab,
  viewMode,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  const { t } = useTranslation();
  const isTrashView = activeTab === "TRASH";

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-400 animate-pulse">
        {t("loadingBrands")}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3 animate-in fade-in duration-300">
        <Archive className="h-10 w-10 opacity-30" />
        <span>
          {activeTab === "ACTIVE"
            ? t("emptyActiveBrands")
            : t("emptyTrashBrands")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand, index) => (
            <div
              key={brand.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <BrandItem
                brand={brand}
                isTrashView={isTrashView}
                viewMode="card"
                onEdit={onEdit}
                onSoftDelete={onSoftDelete}
                onRestore={onRestore}
                onHardDelete={onHardDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {brands.map((brand, index) => (
            <div
              key={brand.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <BrandItem
                brand={brand}
                isTrashView={isTrashView}
                viewMode="row"
                onEdit={onEdit}
                onSoftDelete={onSoftDelete}
                onRestore={onRestore}
                onHardDelete={onHardDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between animate-in fade-in duration-200">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("page")}{" "}
            <strong className="text-slate-900 dark:text-white">
              {currentPage}
            </strong>{" "}
            / {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("prev")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                onPageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              {t("next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
