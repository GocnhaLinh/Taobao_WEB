import { useState, useCallback } from 'react';

/**
 * Custom hook to handle manual data refetching with a smooth minimum delay.
 * 
 * @param refetchFn Function to trigger data refetching (e.g., queryClient.invalidateQueries or query refetch)
 * @param delayMs Minimum delay in milliseconds for visual indicator feedback (default: 1000ms)
 */
export function useManualRefresh(
  refetchFn: () => Promise<any> | void,
  delayMs: number = 1000
) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        Promise.resolve(refetchFn()),
        new Promise((resolve) => setTimeout(resolve, delayMs)),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchFn, delayMs]);

  return {
    isRefreshing,
    handleRefresh,
  };
}
