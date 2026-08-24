import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface UiBadgeProps {
  children: React.ReactNode;
  variant?: 'indigo' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  dot?: boolean;
  className?: string;
}

export const UiBadge: React.FC<UiBadgeProps> = ({
  children,
  variant = 'indigo',
  size = 'sm',
  icon: Icon,
  dot = false,
  className = ''
}) => {
  const variants = {
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    slate: 'bg-white/10 text-slate-300 border-white/10',
  };

  const dotColors = {
    indigo: 'bg-indigo-400',
    purple: 'bg-purple-400',
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    slate: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      {Icon && <Icon size={size === 'sm' ? 11 : 13} />}
      <span>{children}</span>
    </span>
  );
};
