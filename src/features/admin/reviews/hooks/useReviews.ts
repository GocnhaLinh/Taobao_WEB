import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useManualRefresh } from '../../../../hooks/useManualRefresh';
import { fetchReviewsApi } from '../api/review.api';
import type { ReviewData, UseReviewsReturn } from '../types';
import { calculateReviewMetrics, filterReviews } from '../utils/review.utils';

export const useReviews = (): UseReviewsReturn => {
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, ratingFilter, pageSize]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reviews', debouncedSearch],
    queryFn: () => fetchReviewsApi(),
    retry: 1,
  });

  const rawReviews: ReviewData[] = data?.reviews || [];

  const filtered = useMemo(() => {
    return filterReviews(rawReviews, debouncedSearch, ratingFilter);
  }, [rawReviews, debouncedSearch, ratingFilter]);

  const metrics = useMemo(() => {
    return calculateReviewMetrics(rawReviews);
  }, [rawReviews]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const { isRefreshing, handleRefresh } = useManualRefresh(refetch, 1000);

  return {
    ratingFilter,
    setRatingFilter,
    searchTerm,
    setSearchTerm,
    reviews: filtered,
    metrics,
    isLoading,
    isRefreshing,
    handleRefresh,
    refetch,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
  };
};
