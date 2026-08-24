import React from 'react';
import { LucideIcon } from 'lucide-react';
import { tokens } from '../../theme/tokens';

export interface UiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  badge?: string | number;
}

export const UiButton: React.FC<UiButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  badge,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none";

  const variants = {
    primary: tokens.colors.brand.primary,
    secondary: tokens.colors.brand.secondary,
    ghost: "bg-transparent text-slate-400 hover:text-white border-transparent hover:bg-white/5",
    danger: "bg-rose-600/80 hover:bg-rose-500 text-white border-rose-400/30 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
    gradient: `${tokens.colors.brand.gradient} text-white border-white/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]`,
    outline: "bg-transparent text-indigo-300 hover:text-white border-indigo-500/40 hover:bg-indigo-500/10",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-2 text-xs",
    lg: "px-5 py-2.5 text-sm",
  };

  const iconSizes = {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 18,
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} className="shrink-0" />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} className="shrink-0" />}
          {badge !== undefined && (
            <span className="ml-1 text-[9px] font-mono font-bold bg-white/20 px-1.5 py-0.2 rounded-full border border-white/10">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
};
