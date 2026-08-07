import React from "react";
import { Archive, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { LoadingState } from "../../../../components/common/LoadingState";
import { useTranslation } from "../../../../lib/i18n";
import type { CategoryTableProps } from "../types";
import { CategoryItem } from "./CategoryItem";

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  labelsMap,
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
    return <LoadingState text={t("loadingCategories")} />;
  }

  if (categories.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3 animate-in fade-in duration-300">
        <Archive className="h-10 w-10 opacity-30" />
        <span>
          {activeTab === "ACTIVE"
            ? t("emptyActiveCategories")
            : t("emptyTrashCategories")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CategoryItem
                category={cat}
                labelsMap={labelsMap}
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
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CategoryItem
                category={cat}
                labelsMap={labelsMap}
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
