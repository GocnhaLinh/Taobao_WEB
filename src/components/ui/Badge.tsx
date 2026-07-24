import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25',
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/25',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
