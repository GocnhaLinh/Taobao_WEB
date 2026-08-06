import React from "react";
import type { BrandItemProps } from "../types";
import { BrandCard } from "./BrandCard";
import { BrandRow } from "./BrandRow";

export const BrandItem: React.FC<BrandItemProps> = ({
  brand,
  isTrashView,
  viewMode,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  if (viewMode === "card") {
    return (
      <BrandCard
        brand={brand}
        isTrashView={isTrashView}
        onEdit={onEdit}
        onSoftDelete={onSoftDelete}
        onRestore={onRestore}
        onHardDelete={onHardDelete}
      />
    );
  }

  return (
    <BrandRow
      brand={brand}
      isTrashView={isTrashView}
      onEdit={onEdit}
      onSoftDelete={onSoftDelete}
      onRestore={onRestore}
      onHardDelete={onHardDelete}
    />
  );
};
