import React from 'react';
import { LoadingState, resolveLoadingVariant } from './LoadingState';
import { useTranslation } from '../../lib/i18n';
import { useTheme } from '../../lib/theme';

interface PageLoaderProps {
  variant?: 'dark' | 'pink';
}

export const PageLoader: React.FC<PageLoaderProps> = ({ variant }) => {
  const { t } = useTranslation();
  let themeName: string | undefined = undefined;
  try {
    const { theme } = useTheme();
    themeName = theme;
  } catch (e) {
    // Ignore error if rendered outside ThemeProvider
  }

  const activeVariant = resolveLoadingVariant(variant, themeName);
  const isPink = activeVariant === 'pink';

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-sm p-8 rounded-3xl backdrop-blur-2xl border shadow-2xl flex flex-col items-center justify-center text-center ${
        isPink
          ? 'bg-white/90 dark:bg-pink-950/40 border-pink-200 dark:border-pink-500/30 shadow-pink-500/10'
          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 shadow-indigo-500/5'
      }`}>
        <LoadingState
          size="lg"
          variant={activeVariant}
          text={t('loadingData')}
          subtext={t('preparingPage')}
        />
      </div>
    </div>
  );
};
