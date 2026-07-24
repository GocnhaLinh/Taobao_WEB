import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../lib/theme';

export const ThemeSettingCard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
        {theme === 'dark' ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
        Giao diện ứng dụng (Theme)
      </h3>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 gap-4">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Chế độ hiển thị</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trạng thái hiện tại: <Badge variant="info">{theme.toUpperCase()} MODE</Badge>
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={toggleTheme}>
          Chuyển sang {theme === 'dark' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
        </Button>
      </div>
    </div>
  );
};
