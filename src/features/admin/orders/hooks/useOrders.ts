import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../../hooks/useDebounce';
import { getOrdersApi } from '../api/order.api';
import type { Order, UseOrdersReturn } from '../types';
import { calculateOrderMetrics } from '../utils/order.utils';

export const useOrders = (allowedStatuses?: string[]): UseOrdersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  // Mặc định hiển thị đơn "Đợi đặt hàng" (PENDING_ORDER) trước — admin xử lý việc cần làm ngay.
  // Page Kho (không có PENDING_ORDER trong allowedStatuses) vẫn mặc định "Tất cả trạng thái".
  const defaultStatus = allowedStatuses?.includes('PENDING_ORDER') ? 'PENDING_ORDER' : 'ALL';
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatus);
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Reset về trang 1 khi bộ lọc / kích thước trang thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter, pageSize]);

  const hasAllowedStatuses = allowedStatuses && allowedStatuses.length > 0;

  const { data, isLoading, refetch } = useQuery({
    // allowedStatuses (phạm vi page) + statusFilter + search/payment + trang nằm trong key
    // → mỗi tổ hợp có cache riêng. BẮT BUỘC đưa statusFilter vào key vì lọc đang chạy server-side:
    // nếu thiếu, đổi dropdown trạng thái sẽ không kích hoạt refetch (react-query trả cache cũ).
    queryKey: [
      'orders',
      hasAllowedStatuses ? allowedStatuses.join(',') : 'none',
      statusFilter,
      debouncedSearch,
      paymentFilter,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      getOrdersApi({
        search: debouncedSearch || undefined,
        // Page có allowedStatuses → server lọc sẵn theo danh sách trạng thái này,
        // kết hợp statusFilter nếu admin chọn 1 trạng thái cụ thể trong dropdown.
        status: hasAllowedStatuses
          ? statusFilter !== 'ALL'
            ? statusFilter
            : allowedStatuses.join(',')
          : statusFilter !== 'ALL'
            ? statusFilter
            : undefined,
        // Metrics luôn tính theo phạm vi trang (allowedStatuses), KHÔNG theo dropdown trạng thái
        // → card thống kê hiện số liệu toàn bộ của page dù đang lọc danh sách theo 1 trạng thái.
        metricsStatus: hasAllowedStatuses ? allowedStatuses.join(',') : undefined,
        paymentStatus: paymentFilter !== 'ALL' ? paymentFilter : undefined,
        page: currentPage,
        limit: pageSize,
      }),
    retry: 1,
    // Tự refetch khi quay lại page → 2 page luôn đồng bộ với trạng thái mới nhất
    refetchOnMount: 'always',
  });

  // Server đã lọc + phân trang — client không filter lại nữa
  const orders: Order[] = data?.orders || [];

  const totalPages = Math.max(1, data?.totalPages || 1);

  // Derived state: Tự điều chỉnh trang hợp lệ ngay trong render phase không qua useEffect (rerender-derived-state-no-effect)
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  if (effectiveCurrentPage !== currentPage && data) {
    setCurrentPage(effectiveCurrentPage);
  }

  // Metrics do server tính trên toàn bộ đơn khớp bộ lọc (không phân trang)
  const metrics = useMemo(() => {
    if (data?.metrics) return data.metrics;
    // Fallback an toàn khi server cũ chưa trả metrics
    return calculateOrderMetrics(data?.orders || []);
  }, [data]);

  return {
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
    totalOrdersCount: data?.total || 0,
    metrics,
    isLoading,
    refetch,
  };
};
