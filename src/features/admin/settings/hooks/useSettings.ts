import { useQuery } from '@tanstack/react-query';
import { useManualRefresh } from '../../../../hooks/useManualRefresh';
import { getFeeConfigApi } from '../api/settings.api';
import type { UseSettingsReturn } from '../types';

export const useSettings = (): UseSettingsReturn => {
  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ['settings-fees'],
    queryFn: getFeeConfigApi,
    retry: 1,
  });

  const { isRefreshing, handleRefresh } = useManualRefresh(refetch, 1000);

  return {
    config,
    isLoading,
    isRefreshing,
    handleRefresh,
    refetch,
  };
};
