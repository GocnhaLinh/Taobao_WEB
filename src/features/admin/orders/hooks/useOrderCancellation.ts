import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../../../../lib/i18n';
import { getOrderByIdApi, updateCancellationStatusApi } from '../api/order.api';
import type { UseOrderCancellationParams, UseOrderCancellationReturn } from '../types';

/**
 * Quản lý luồng hủy đơn & hoàn tiền trong OrderDetailModal:
 * - Dùng React Query fetch & cache chi tiết đầy đủ khi mở modal
 * - Dùng useMutation đổi trạng thái yêu cầu hủy/hoàn tiền và tự động invalidate cache
 * - Mở/đóng modal hủy đơn + làm mới sau khi hủy thành công
 */
export const useOrderCancellation = ({
  order,
  isOpen,
  onListRefresh,
}: UseOrderCancellationParams): UseOrderCancellationReturn => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationError, setCancellationError] = useState<string | null>(null);

  // Tận dụng React Query để fetch & cache chi tiết đầy đủ của Order khi Modal mở
  const { data: fullOrder = null, refetch: refreshOrder } = useQuery({
    queryKey: ['order-detail', order?.id],
    queryFn: () => getOrderByIdApi(order!.id),
    enabled: Boolean(order?.id && isOpen),
    staleTime: 1000 * 30, // Cache trong 30s
  });

  // Derived state: Ưu tiên chi tiết đầy đủ vừa fetch từ server
  const currentOrder = fullOrder && fullOrder.id === order?.id ? fullOrder : order;

  // Mutation cập nhật trạng thái hủy đơn với automatic invalidation
  const updateStatusMutation = useMutation({
    mutationFn: ({ cancellationId, status }: { cancellationId: string; status: string }) =>
      updateCancellationStatusApi(cancellationId, status),
    onSuccess: () => {
      setCancellationError(null);
      if (order?.id) {
        queryClient.invalidateQueries({ queryKey: ['order-detail', order.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (onListRefresh) onListRefresh();
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setCancellationError(errorObj?.response?.data?.error || errorObj?.message || t('orderUpdateFailed'));
    },
  });

  const handleChangeCancellationStatus = useCallback(
    async (cancellationId: string, status: string) => {
      if (!order) return;
      updateStatusMutation.mutate({ cancellationId, status });
    },
    [order, updateStatusMutation],
  );

  const handleCancelSuccess = useCallback(() => {
    if (!order) return;
    setIsCancelModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['order-detail', order.id] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    if (onListRefresh) onListRefresh();
  }, [order, onListRefresh, queryClient]);

  return {
    isCancelModalOpen,
    setIsCancelModalOpen,
    fullOrder,
    currentOrder,
    updatingCancellationId: updateStatusMutation.isPending
      ? updateStatusMutation.variables?.cancellationId || null
      : null,
    cancellationError,
    handleChangeCancellationStatus,
    handleCancelSuccess,
    refreshOrder: async () => {
      await refreshOrder();
    },
  };
};
