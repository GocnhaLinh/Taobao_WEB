import React from 'react';
import { useTranslation } from '../../../lib/i18n';
import { useReviews } from './hooks/useReviews';
import { ReviewCard, type ReviewItem } from './components/ReviewCard';
import { ReviewFilter } from './components/ReviewFilter';
import { LoadingState } from '../../../components/common/LoadingState';
import { Pagination } from '../../../components/ui/Pagination';
import { Star, MessageSquare, RefreshCw } from 'lucide-react';

export const ReviewsFeature: React.FC = () => {
  const { t } = useTranslation();
  const {
    reviews: rawReviews,
    isLoading,
    isRefreshing,
    handleRefresh,
    searchTerm,
    setSearchTerm,
    ratingFilter,
    setRatingFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
  } = useReviews();

  const reviews: ReviewItem[] = rawReviews.map((r) => ({
    id: r.id,
    user: r.user?.fullName || r.userId || t('anonymousUser'),
    rating: r.rating,
    comment: r.comment || t('noComment'),
    product: r.product?.productName || r.productId || t('taobaoProduct'),
  }));

  const paginatedReviews = reviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="h-7 w-7 text-indigo-500" />
            {t('reviewManagement')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('reviewDesc')}</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-sm font-semibold shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </button>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Reusable Review Filter Component */}
        <ReviewFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          ratingFilter={ratingFilter}
          setRatingFilter={setRatingFilter}
          totalCount={reviews.length}
        />

        {isLoading || isRefreshing ? (
          <LoadingState text={t('loadingReviews')} />
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-slate-400 animate-in fade-in duration-300">
            <Star className="h-12 w-12 mx-auto stroke-1 text-amber-400" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">{t('noReviews')}</h4>
            <p className="text-xs max-w-sm mx-auto">
              {t('noReviewsHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {paginatedReviews.map((rev, index) => (
                <div key={rev.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 60}ms` }}>
                  <ReviewCard review={rev} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  totalItems={totalItems}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
