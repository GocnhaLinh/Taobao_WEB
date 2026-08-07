import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../../hooks/useDebounce';
import { getOrdersApi } from '../api/order.api';
import type { Order, UseOrdersReturn } from '../types';
import { calculateOrderMetrics, filterOrders } from '../utils/order.utils';

export const useOrders = (): UseOrdersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter, pageSize]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', debouncedSearch, statusFilter],
    queryFn: () =>
      getOrdersApi({
        search: debouncedSearch || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
    retry: 1,
  });

  const rawOrders: Order[] = data?.orders || [];

  const displayOrders = useMemo(() => {
    return filterOrders(rawOrders, debouncedSearch, statusFilter, paymentFilter);
  }, [rawOrders, debouncedSearch, statusFilter, paymentFilter]);

  // Paginated subset of displayOrders
  const totalOrdersCount = displayOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrdersCount / pageSize));

  // Ensure currentPage never exceeds totalPages
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return displayOrders.slice(start, start + pageSize);
  }, [displayOrders, validCurrentPage, pageSize]);

  const metrics = useMemo(() => {
    return calculateOrderMetrics(rawOrders);
  }, [rawOrders]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    selectedOrder,
    setSelectedOrder,
    rawOrders,
    displayOrders,
    paginatedOrders,
    currentPage: validCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalOrdersCount,
    metrics,
    isLoading,
    refetch,
  };
};
