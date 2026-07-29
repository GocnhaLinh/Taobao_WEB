import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  rightElement,
  className = "",
  id,
  ...props
}) => {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border text-slate-900 dark:text-white rounded-2xl px-4 py-2.5 text-sm font-medium transition-all focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            icon ? "pl-10" : ""
          } ${
            rightElement ? "pr-10" : ""
          } ${
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              : "border-slate-300 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] font-medium text-rose-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
