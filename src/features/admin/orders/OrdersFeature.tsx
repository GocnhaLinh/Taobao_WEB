import React, { useCallback, useState, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { useManualRefresh } from '../../../hooks/useManualRefresh';
import { RefreshCw, ShoppingBag, PackagePlus } from 'lucide-react';
import { useOrders } from './hooks/useOrders';
import { DEFAULT_ORDER_STATUSES } from './constants';
import { OrderStatCards } from './components/OrderStatCards';
import { OrderFilter } from './components/OrderFilter';
import { OrderRowCard } from './components/OrderRowCard';
import { Pagination } from '../../../components/ui/Pagination';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/common/LoadingState';
import type { Order } from './types';

// Preloadable Lazy Importers (bundle-preload)
const orderDetailImporter = () =>
  import('./components/OrderDetailModal').then((m) => ({
    default: m.OrderDetailModal,
  }));
const createOrderImporter = () =>
  import('./components/CreateOrderModal').then((m) => ({
    default: m.CreateOrderModal,
  }));

const OrderDetailModal = lazy(orderDetailImporter);
const CreateOrderModal = lazy(createOrderImporter);

// Hàm preload khởi chạy ngầm khi hover (bundle-preload)
const preloadOrderDetailModal = () => {
  orderDetailImporter();
};
const preloadCreateOrderModal = () => {
  createOrderImporter();
};

interface OrdersFeatureProps {
  /** Các trạng thái được phép hiển thị trên page này.
   *  Mặc định: PENDING_ORDER / ORDERED / SHIPPING / CANCELLED (page Order cũ).
   *  Page Kho (ARRIVED_WAREHOUSE / COMPLETED) sẽ truyền danh sách riêng. */
  allowedStatuses?: string[];
  /** Đánh dấu đây là page Kho & Hoàn thành → dùng tiêu đề/mô tả riêng */
  warehouseView?: boolean;
}

export const OrdersFeature: React.FC<OrdersFeatureProps> = ({
  allowedStatuses,
  warehouseView = false,
}) => {
  const { t } = useTranslation();

  // Memoize mảng statuses để giữ reference ổn định giữa các lần re-render (rerender-memo)
  const statuses = useMemo(() => {
    return allowedStatuses && allowedStatuses.length > 0
      ? allowedStatuses
      : DEFAULT_ORDER_STATUSES;
  }, [allowedStatuses]);

  const pageTitle = warehouseView
    ? t('warehouseOrdersAll')
    : t('allClientOrders');
  const pageDesc = warehouseView
    ? t('warehouseOrdersDesc')
    : t('orderLifecycleDesc');

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    selectedOrder,
    setSelectedOrder,
    orders,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalOrdersCount,
    metrics,
    isLoading,
    refetch,
  } = useOrders(statuses);

  const { isRefreshing, handleRefresh: handleManualRefresh } =
    useManualRefresh(refetch);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSelectOrder = useCallback(
    (order: Order) => {
      setSelectedOrder(order);
    },
    [setSelectedOrder],
  );

  const handleCreateSuccess = useCallback(
    (created: Order) => {
      setIsCreateModalOpen(false);
      // Làm mới danh sách rồi mở ngay chi tiết đơn vừa tạo
      refetch();
      setSelectedOrder(created);
    },
    [refetch, setSelectedOrder],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
  }, [setSelectedOrder]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-2 duration-500 min-w-0 max-w-full">
      {/* Header Hero Banner */}
      <div className="relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl shadow-sm">
        {/* Decorative glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-3 right-1/4 h-2 w-2 rounded-full bg-indigo-400/40 blur-[1px] pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {pageTitle}
          </h2>
        </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 sm:line-clamp-none">
              {pageDesc}
          </p>
        </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Preload CreateOrderModal khi hover hoặc focus (bundle-preload) */}
        <Button
              variant="primary"
          size="sm"
              onMouseEnter={preloadCreateOrderModal}
              onFocus={preloadCreateOrderModal}
              onClick={() => setIsCreateModalOpen(true)}
              className="font-bold shadow-md shadow-indigo-500/30"
            >
              <PackagePlus className="h-4 w-4 mr-1.5" />
              {t('createOrder')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isLoading || isRefreshing}
              className="font-semibold bg-white/70 dark:bg-slate-800/80 backdrop-blur"
            >
              <RefreshCw
                className={`h-4 w-4 text-indigo-500 mr-1.5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`}
              />
          {t('refresh')}
        </Button>
        </div>
        </div>
        </div>

      {/* Metric Stat Cards — chỉ hiện card cho trạng thái được phép của page này */}
      <OrderStatCards metrics={metrics} allowedStatuses={statuses} />

      {/* Main Container & Filter Controls */}
      <div className="p-3.5 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-3 border-b border-slate-200 dark:border-white/10 min-w-0">
          <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg flex items-center gap-2 shrink-0">
            <ShoppingBag className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-indigo-500" />
            {t('transactionLog')} ({totalOrdersCount})
          </h3>

          <OrderFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            paymentFilter={paymentFilter}
            onPaymentChange={setPaymentFilter}
            totalCount={totalOrdersCount}
            allowedStatuses={statuses}
          />
        </div>

        {/* Orders List — Conditional Rendering & content-visibility cho danh sách dài (rendering-content-visibility) */}
        {isLoading || isRefreshing ? (
          <LoadingState text={t('loadingOrders')} />
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-slate-400 animate-in fade-in duration-300">
            <ShoppingBag className="h-12 w-12 mx-auto stroke-1 text-slate-500" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">
              {t('emptyOrdersTitle')}
            </h4>
            <p className="text-xs max-w-sm mx-auto">{t('emptyOrdersHint')}</p>
        </div>
        ) : (
          <div className="space-y-3 min-w-0">
            {orders.map((ord, index) => (
              <div
                key={ord.id}
                onMouseEnter={preloadOrderDetailModal}
                onFocus={preloadOrderDetailModal}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-w-0 [content-visibility:auto] [contain-intrinsic-size:120px]"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <OrderRowCard order={ord} onSelect={handleSelectOrder} />
        </div>
            ))}
        </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && totalOrdersCount > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalOrdersCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel={t('ordersCountLabel')}
          />
        ) : null}
        </div>

      {/* Lazy Modals bọc trong Suspense */}
      <Suspense fallback={null}>
        {selectedOrder ? (
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={handleCloseModal}
            onRefresh={refetch}
            onListRefresh={refetch}
          />
        ) : null}

        {isCreateModalOpen ? (
          <CreateOrderModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        ) : null}
      </Suspense>
        </div>
  );
};
