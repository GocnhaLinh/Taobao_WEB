import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Trash2, Edit2 } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  className = '',
  size = 'md',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-xl'
      : 'px-4 py-2.5 text-sm rounded-2xl';

  return (
    <div className={`relative space-y-1.5 ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Box */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm ${
            disabled ? 'opacity-60 cursor-not-allowed bg-slate-200/60' : 'cursor-pointer'
          } ${sizeClasses}`}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon && <span>{selectedOption.icon}</span>}
            <span className={`truncate ${!selectedOption ? 'text-slate-400 dark:text-slate-500' : ''}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
              isOpen ? 'rotate-180 text-indigo-500' : ''
            }`}
          />
        </button>

        {/* Soft Rounded Custom Dropdown Popover */}
        {isOpen && !disabled && (
          <div className="absolute right-0 left-0 mt-2 py-1.5 bg-white/95 dark:bg-slate-900/95 border border-pink-200/80 dark:border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 min-w-[160px] max-h-60 overflow-y-auto no-scrollbar">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              const hasActions = opt.onDelete || opt.onEdit;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`group w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50/60 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && <span>{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </span>

                  <div className="flex items-center gap-1 shrink-0 ml-2 relative">
                    {opt.onEdit && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsOpen(false);
                          opt.onEdit?.();
                        }}
                        title="Sửa nhãn này"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 rounded-md transition-opacity cursor-pointer z-10"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {opt.onDelete && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsOpen(false);
                          opt.onDelete?.();
                        }}
                        title="Xóa nhãn này"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-md transition-opacity cursor-pointer z-10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {isSelected && (
                      <Check
                        className={`h-3.5 w-3.5 text-indigo-500 shrink-0 ${
                          hasActions ? 'group-hover:opacity-0 transition-opacity' : ''
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
