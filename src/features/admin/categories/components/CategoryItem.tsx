import React from "react";
import type { CategoryItemProps } from "../types";
import { CategoryCard } from "./CategoryCard";
import { CategoryRow } from "./CategoryRow";

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  labelsMap,
  isTrashView,
  viewMode,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  if (viewMode === "card") {
    return (
      <CategoryCard
        category={category}
        labelsMap={labelsMap}
        isTrashView={isTrashView}
        onEdit={onEdit}
        onSoftDelete={onSoftDelete}
        onRestore={onRestore}
        onHardDelete={onHardDelete}
      />
    );
  }

  return (
    <CategoryRow
      category={category}
      labelsMap={labelsMap}
      isTrashView={isTrashView}
      onEdit={onEdit}
      onSoftDelete={onSoftDelete}
      onRestore={onRestore}
      onHardDelete={onHardDelete}
    />
  );
};
