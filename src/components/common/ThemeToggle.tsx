import React from 'react';
import { Heart, Moon } from 'lucide-react';
import { useTheme } from '../../lib/theme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-pink-50 dark:bg-white/10 hover:bg-pink-100 dark:hover:bg-white/20 transition-all cursor-pointer border border-pink-200 dark:border-white/10 flex items-center justify-center"
      title={theme === 'dark' ? 'Chuyển sang Giao diện Hồng 🌸' : 'Chuyển sang Giao diện Tối 🌙'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Heart className="h-4.5 w-4.5 text-pink-400 fill-pink-400/50" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-pink-600" />
      )}
    </button>
  );
};


