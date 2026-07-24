import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export const PageLoader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-4 animate-in fade-in duration-200">
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 animate-pulse flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h4 className="text-slate-900 dark:text-white font-bold text-sm">{t('loadingData')}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('preparingPage')}</p>
      </div>
    </div>
  );
};
