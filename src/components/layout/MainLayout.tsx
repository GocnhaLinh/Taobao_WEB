import React, { useState } from 'react';
import logoImg from '../../assets/logo.jpg';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../common/ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-hidden transition-colors">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2.5">
            <img
              src={logoImg}
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-xl object-cover border border-slate-200 dark:border-white/10"
            />
            <span className="font-wedding text-2xl text-slate-900 dark:text-white leading-normal pt-1.5 inline-block">Góc Nhà Linh</span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Main Content Area - Only the right side panel scrolls, scrollbar is hidden */}
      <main className="flex-1 h-full p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto no-scrollbar">
        {children}
      </main>
    </div>
  );
};
