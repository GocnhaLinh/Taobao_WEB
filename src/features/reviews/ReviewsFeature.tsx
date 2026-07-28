import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../../lib/i18n';
import { fetchReviewsApi } from '../../services/reviewService';
import { ReviewCard, type ReviewItem } from './components/ReviewCard';
import { Star, MessageSquare, RefreshCw } from 'lucide-react';

export const ReviewsFeature: React.FC = () => {
  const { t } = useTranslation();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => fetchReviewsApi(),
    retry: 1,
  });

  const rawReviews = data?.reviews || [];

  const reviews: ReviewItem[] = rawReviews.map((r) => ({
    id: r.id,
    user: r.user?.fullName || r.userId || t('anonymousUser'),
    rating: r.rating,
    comment: r.comment || t('noComment'),
    product: r.product?.productName || r.productId || t('taobaoProduct'),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="h-7 w-7 text-indigo-500" />
            {t('reviewManagement')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('reviewDesc')}</p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-sm font-semibold shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </button>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
          {t('reviewListTitle')}
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            {t('reviewCount', { count: reviews.length })}
          </span>
        </h3>

        {isLoading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto text-indigo-500" />
            <p className="font-semibold">{t('loadingReviews')}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-slate-400">
            <Star className="h-12 w-12 mx-auto stroke-1 text-amber-400" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">{t('noReviews')}</h4>
            <p className="text-xs max-w-sm mx-auto">
              {t('noReviewsHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
