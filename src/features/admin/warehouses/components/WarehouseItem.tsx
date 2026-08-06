import React from 'react';
import type { WarehouseItemProps } from '../types';
import { WarehouseCard } from './WarehouseCard';
import { WarehouseRow } from './WarehouseRow';

export const WarehouseItem: React.FC<WarehouseItemProps> = ({
  warehouse,
  isTrashView,
  viewMode,
  searchQuery,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
}) => {
  if (viewMode === 'card') {
    return (
      <WarehouseCard
        warehouse={warehouse}
        isTrashView={isTrashView}
        searchQuery={searchQuery}
        onEdit={onEdit}
        onSoftDelete={onSoftDelete}
        onRestore={onRestore}
        onHardDelete={onHardDelete}
      />
    );
  }

  return (
    <WarehouseRow
      warehouse={warehouse}
      isTrashView={isTrashView}
      searchQuery={searchQuery}
      onEdit={onEdit}
      onSoftDelete={onSoftDelete}
      onRestore={onRestore}
      onHardDelete={onHardDelete}
    />
  );
};
