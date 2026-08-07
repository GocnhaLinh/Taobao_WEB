import React, { useCallback } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { RefreshCw, ShoppingBag } from 'lucide-react';
import { useOrders } from './hooks/useOrders';
import { OrderStatCards } from './components/OrderStatCards';
import { OrderFilter } from './components/OrderFilter';
import { OrderRowCard } from './components/OrderRowCard';
import { OrderDetailModal } from './components/OrderDetailModal';
import { Pagination } from '../../../components/ui/Pagination';
import { Button } from '../../../components/ui/Button';
import type { Order } from './types';

export const OrdersFeature: React.FC = () => {
  const { t } = useTranslation();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    selectedOrder,
    setSelectedOrder,
    displayOrders,
    paginatedOrders,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalOrdersCount,
    metrics,
    isLoading,
    refetch,
  } = useOrders();

  const handleSelectOrder = useCallback(
    (order: Order) => {
      setSelectedOrder(order);
    },
    [setSelectedOrder]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
  }, [setSelectedOrder]);

  const handleRefreshModal = useCallback(() => {
    refetch();
    setSelectedOrder(null);
  }, [refetch, setSelectedOrder]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-2 duration-500 min-w-0 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500 shrink-0" />
            <span className="truncate">{t('allClientOrders')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-none">
            {t('orderLifecycleDesc')}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          className="self-start sm:self-auto shrink-0 font-semibold"
        >
          <RefreshCw className={`h-4 w-4 text-indigo-500 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      {/* Metric Stat Cards */}
      <OrderStatCards metrics={metrics} />

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
          />
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto text-indigo-500" />
            <p className="font-semibold">{t('loadingOrders')}</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-slate-400 animate-in fade-in duration-300">
            <ShoppingBag className="h-12 w-12 mx-auto stroke-1 text-slate-500" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">{t('emptyOrdersTitle')}</h4>
            <p className="text-xs max-w-sm mx-auto">
              {t('emptyOrdersHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 min-w-0">
            {paginatedOrders.map((ord, index) => (
              <div key={ord.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-w-0" style={{ animationDelay: `${index * 40}ms` }}>
                <OrderRowCard
                  order={ord}
                  onSelect={handleSelectOrder}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && totalOrdersCount > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalOrdersCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel={t('ordersCountLabel')}
          />
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={handleCloseModal}
        onRefresh={handleRefreshModal}
      />
    </div>
  );
};
