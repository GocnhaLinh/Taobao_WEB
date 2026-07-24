import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, Unplug, ZapOff, Sparkles } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cute Animated Disconnected Robot Character */}
        <div className="relative inline-flex items-center justify-center pt-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-indigo-500/20 blur-xl animate-pulse" />

          <div className="relative p-4 rounded-3xl bg-slate-100 dark:bg-slate-900/90 border border-rose-500/40 flex items-center gap-4 shadow-2xl shadow-rose-500/20">
            {/* Cute Head Tilting Robot */}
            <div className="relative flex items-center justify-center animate-head-tilt">
              <svg className="h-14 w-14 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="13" rx="4" fill="currentColor" fillOpacity="0.15" />
                {/* Cute Blinking Eyes */}
                <g className="animate-eye-blink">
                  <circle cx="8.5" cy="10.5" r="1.8" fill="currentColor" />
                  <circle cx="15.5" cy="10.5" r="1.8" fill="currentColor" />
                </g>
                {/* Sad Mouth */}
                <path d="M9.5 15c1.5-1 3.5-1 5 0" strokeLinecap="round" />
                {/* Antenna */}
                <line x1="12" y1="1" x2="12" y2="5" strokeLinecap="round" />
                <circle cx="12" cy="1.5" r="1.5" className="fill-amber-400 text-amber-400 animate-ping" />
              </svg>
              {/* Floating Sparkle */}
              <Sparkles className="h-3.5 w-3.5 text-amber-400 absolute -top-1 -right-1 animate-spark-pop" />
            </div>

            {/* Disconnected Floating Plug & Sparks */}
            <div className="flex flex-col items-center border-l border-slate-200 dark:border-white/10 pl-3.5">
              <div className="flex items-center gap-1.5 animate-plug-float">
                <Unplug className="h-7 w-7 text-amber-500" />
                <ZapOff className="h-4 w-4 text-rose-500 animate-spark-pop" />
              </div>
              <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider mt-1 animate-pulse">
                DISCONNECTED
              </span>
            </div>
          </div>
        </div>

        {/* Main 404 ERROR Heading */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 bg-clip-text text-transparent tracking-tight">
            {t('notFoundTitle')}
          </h1>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase">
            {t('notFoundSubTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
            {t('notFoundDesc')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" className="w-full sm:w-auto" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            {t('backToHome')}
          </Button>

          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('reloadPage')}
          </Button>
        </div>
      </div>
    </div>
  );
};
