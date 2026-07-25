import React from 'react';
import { useTranslation, type Language } from '../../lib/i18n';
import vnFlag from '../../assets/VN.png';
import elFlag from '../../assets/EL.png';
import cnFlag from '../../assets/CN.png';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const languages: { code: Language; label: string; flagImg: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', flagImg: vnFlag },
    { code: 'en', label: 'English', flagImg: elFlag },
    { code: 'zh', label: '中文', flagImg: cnFlag },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-white/10 rounded-xl border border-slate-300/40 dark:border-white/10 shrink-0">
      {languages.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`p-1 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isActive
                ? 'bg-white dark:bg-indigo-600 shadow-sm border border-slate-300 dark:border-indigo-400 scale-110'
                : 'opacity-60 hover:opacity-100 hover:bg-white/40 dark:hover:bg-white/10'
            }`}
            title={lang.label}
          >
            <img
              src={lang.flagImg}
              alt={lang.label}
              width={20}
              height={14}
              className="h-3.5 w-5 object-cover rounded-xs"
            />
          </button>
        );
      })}
    </div>
  );
};
