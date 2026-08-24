import React from 'react';
import { LucideIcon } from 'lucide-react';
import { tokens } from '../../theme/tokens';

export interface UiCardProps {
  title: string;
  subtitle?: string;
  snippet?: string;
  icon?: LucideIcon | React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose';
  selected?: boolean;
  starred?: boolean;
  updatedAt?: string;
  tags?: string[];
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const UiCard: React.FC<UiCardProps> = ({
  title,
  subtitle,
  snippet,
  icon: Icon,
  badge,
  badgeVariant = 'indigo',
  selected = false,
  starred = false,
  updatedAt,
  tags,
  onClick,
  className = '',
  children
}) => {
  const badgeStyles = {
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const IconComponent = Icon as React.ComponentType<{ size?: number; className?: string }>;
    return <IconComponent size={16} className="text-indigo-400" />;
  };

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
        selected
          ? tokens.colors.surface.cardSelected
          : tokens.colors.surface.card
      } ${className}`}
    >
      {selected && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
      )}

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                {renderIcon()}
              </div>
            )}
            <h4 className={`text-xs font-bold tracking-tight line-clamp-1 ${selected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {starred && <span className="text-amber-400 text-xs">★</span>}
            {badge !== undefined && (
              <span className={`text-[9px] font-mono font-bold border px-1.5 py-0.2 rounded-full ${badgeStyles[badgeVariant]}`}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-[11px] font-medium text-indigo-300/80 line-clamp-1">
            {subtitle}
          </p>
        )}

        {snippet && (
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
            {snippet}
          </p>
        )}

        {children && <div className="pt-2">{children}</div>}

        {(tags || updatedAt) && (
          <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500 font-mono border-t border-white/5">
            <div className="flex items-center gap-1 flex-wrap">
              {tags?.map((t, idx) => (
                <span key={idx} className="bg-white/5 text-slate-300 px-1.5 py-0.2 rounded border border-white/5">
                  {t}
                </span>
              ))}
            </div>
            {updatedAt && <span>{updatedAt}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
