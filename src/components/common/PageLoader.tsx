import React from 'react';
import { LoadingState } from './LoadingState';
import { useTranslation } from '../../lib/i18n';

interface PageLoaderProps {
  variant?: 'dark' | 'pink';
}

export const PageLoader: React.FC<PageLoaderProps> = ({ variant = 'dark' }) => {
  const { t } = useTranslation();

  const isPink = variant === 'pink';

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-sm p-8 rounded-3xl backdrop-blur-2xl border shadow-2xl flex flex-col items-center justify-center text-center ${
        isPink
          ? 'bg-gradient-to-br from-pink-950/50 via-rose-950/40 to-slate-950/60 border-pink-500/30 shadow-pink-500/10'
          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 shadow-indigo-500/5'
      }`}>
        <LoadingState
          size="lg"
          variant={variant}
          text={t('loadingData')}
          subtext={t('preparingPage')}
        />
      </div>
    </div>
  );
};
