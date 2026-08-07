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

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <LoadingState
        size="lg"
        variant={activeVariant}
        text={t('loadingData')}
        subtext={t('preparingPage')}
      />
    </div>
  );
};
