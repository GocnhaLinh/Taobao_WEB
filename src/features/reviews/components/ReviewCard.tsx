import React from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';

export interface ReviewItem {
  id: string;
  user: string;
  rating: number;
  comment: string;
  product: string;
}

interface ReviewCardProps {
  review: ReviewItem;
}

export const ReviewCard: React.FC<ReviewCardProps> = React.memo(({ review }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-slate-900 dark:text-white font-bold text-sm">{review.user}</h4>
        <div className="flex items-center text-amber-400 gap-1 text-xs font-bold">
          <Star className="h-4 w-4 fill-amber-400" />
          <span>{review.rating}/5</span>
        </div>
      </div>
      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{t('taobaoProduct')}: {review.product}</p>
      <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{review.comment}"</p>
    </div>
  );
});
