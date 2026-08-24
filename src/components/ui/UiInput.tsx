import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface UiInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  actionButton?: React.ReactNode;
}

export const UiInput = React.forwardRef<HTMLInputElement, UiInputProps>(({
  label,
  icon: Icon,
  error,
  actionButton,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon size={15} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-slate-950/60 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all ${
            Icon ? 'pl-9' : ''
          } ${actionButton ? 'pr-12' : ''} ${error ? 'border-rose-500/50 focus:border-rose-500' : ''} ${className}`}
          {...props}
        />
        {actionButton && (
          <div className="absolute right-1.5 flex items-center">
            {actionButton}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[10px] text-rose-400 font-medium">{error}</p>
      )}
    </div>
  );
});

UiInput.displayName = 'UiInput';
