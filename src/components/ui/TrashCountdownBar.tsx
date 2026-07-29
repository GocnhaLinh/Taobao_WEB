import React, { useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export interface TrashCountdownBarProps {
  deletedAt?: string;
  fallbackDate?: string;
  maxDays?: number;
  variant?: 'card' | 'compact';
  className?: string;
}

export const TrashCountdownBar: React.FC<TrashCountdownBarProps> = React.memo(({
  deletedAt,
  fallbackDate,
  maxDays = 30,
  variant = 'card',
  className = '',
}) => {
  const { t } = useTranslation();

  const { remainingDays, progress, isUrgent } = useMemo(() => {
    const targetDateStr = deletedAt || fallbackDate;
    if (!targetDateStr) {
      return { remainingDays: maxDays, progress: 0, isUrgent: false };
    }
    const deleteTime = new Date(targetDateStr).getTime();
    if (isNaN(deleteTime)) {
      return { remainingDays: maxDays, progress: 0, isUrgent: false };
    }
    const now = Date.now();
    const diffMs = Math.max(0, now - deleteTime);

    // Continuous floating-point days elapsed (e.g., 1.25 days = 30 hours)
    const elapsedDaysFloat = diffMs / (1000 * 60 * 60 * 24);
    const fullDaysPassed = Math.floor(elapsedDaysFloat);
    const remaining = Math.max(0, maxDays - fullDaysPassed);

    // Percentage elapsed based on exact time (e.g., 1 day / 30 days = 3.33% -> 3%)
    let pct = (elapsedDaysFloat / maxDays) * 100;
    // Show at least 1% if deleted over 1 hour ago so user visually sees movement
    if (diffMs > 1000 * 60 * 60 && pct < 1) {
      pct = 1;
    }
    const roundedPct = Math.min(100, Math.max(0, Math.round(pct)));

    return {
      remainingDays: remaining,
      progress: roundedPct,
      isUrgent: remaining <= 5,
    };
  }, [deletedAt, fallbackDate, maxDays]);

  if (!deletedAt && !fallbackDate) return null;

  // Determine dynamic color scheme based on remaining days
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  let bgColor = 'bg-emerald-500/10 border-emerald-500/20';

  if (remainingDays <= 5) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-600 dark:text-rose-400';
    bgColor = 'bg-rose-500/15 border-rose-500/30';
  } else if (remainingDays <= 15) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600 dark:text-amber-400';
    bgColor = 'bg-amber-500/15 border-amber-500/30';
  }

  const labelText = isUrgent
    ? t('aboutToDelete', { days: remainingDays })
    : t('autoDeleteInDays', { days: remainingDays });

  if (variant === 'compact') {
    return (
      <div
        className={`px-2.5 py-1 rounded-xl border text-[10px] flex items-center gap-2 transition-all ${bgColor} ${textColor} ${className}`}
      >
        {isUrgent ? (
          <AlertTriangle className="h-3 w-3 shrink-0 animate-bounce text-rose-500" />
        ) : (
          <Clock className="h-3 w-3 shrink-0" />
        )}
        <span className="font-semibold whitespace-nowrap">{labelText}</span>
        <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden shrink-0">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[9px] font-mono opacity-80">{progress}%</span>
      </div>
    );
  }

  // Card Variant (Full Width Bar)
  return (
    <div
      className={`px-3 py-2 rounded-xl border ${bgColor} space-y-1.5 transition-all ${className}`}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className={`flex items-center gap-1 font-semibold ${textColor}`}>
          {isUrgent ? (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 animate-bounce text-rose-500" />
          ) : (
            <Clock className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{labelText}</span>
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">
          {progress}%
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

TrashCountdownBar.displayName = 'TrashCountdownBar';
