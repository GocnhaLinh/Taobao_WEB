import React from 'react';
import { OrdersFeature } from '../../features/admin/orders/OrdersFeature';
import { WAREHOUSE_ORDER_STATUSES } from '../../features/admin/orders/constants';

/**
 * Page Đơn hàng — Kho & Hoàn thành:
 * Chỉ hiển thị đơn ở trạng thái ĐÃ ĐẾN KHO (ARRIVED_WAREHOUSE) và HOÀN THÀNH (COMPLETED).
 * Tách khỏi page Order cũ (chờ đặt / đã đặt / vận chuyển / đã hủy).
 */
export const WarehouseOrdersPage: React.FC = () => {
  return <OrdersFeature allowedStatuses={WAREHOUSE_ORDER_STATUSES} warehouseView />;
};
