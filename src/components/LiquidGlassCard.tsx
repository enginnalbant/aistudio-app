import React from 'react';
import { motion } from 'motion/react';
import { isLiquidGlassSupported, getScrimColor } from '../utils/colorUtils';
import { getLiquidGlassStyle } from './navigation/LiquidGlassLayer';
import { LiquidGlassConfig } from '../types/navigation';

export type LiquidGlassEffect = 'regular' | 'clear' | 'frosted' | 'ultra-thin' | 'thick';

export interface LiquidGlassCardProps {
  children: React.ReactNode;
  effect?: LiquidGlassEffect;
  interactive?: boolean;
  scrimOpacity?: number;
  isDarkTheme?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  borderRadius?: number;
  borderOpacity?: number;
  animated?: boolean;
}

/**
 * LiquidGlassView Core Primitive Component
 * Wraps content in Apple Liquid Glass physics with Scrim contrast protection layer underneath.
 */
export const LiquidGlassView: React.FC<LiquidGlassCardProps> = ({
  children,
  effect = 'regular',
  interactive = false,
  scrimOpacity = 0.15,
  isDarkTheme = true,
  className = '',
  style = {},
  onClick,
  borderRadius = 20,
  borderOpacity = 30,
  animated = true,
}) => {
  const supported = isLiquidGlassSupported();

  // Preset glass config mapped from effect type
  const effectConfigs: Record<LiquidGlassEffect, Partial<LiquidGlassConfig>> = {
    regular: { blur: 24, opacity: 65, saturation: 125, brightness: 105, borderOpacity: borderOpacity, borderRadius },
    clear: { blur: 10, opacity: 25, saturation: 140, brightness: 110, borderOpacity: Math.min(60, borderOpacity + 15), borderRadius },
    frosted: { blur: 45, opacity: 88, saturation: 130, brightness: 98, borderOpacity: Math.min(80, borderOpacity + 20), borderRadius },
    'ultra-thin': { blur: 4, opacity: 15, saturation: 150, brightness: 112, borderOpacity: Math.min(90, borderOpacity + 30), borderRadius },
    thick: { blur: 40, opacity: 90, saturation: 115, brightness: 95, borderOpacity: Math.min(80, borderOpacity + 25), borderRadius },
  };

  const selectedGlassConfig = effectConfigs[effect] || effectConfigs.regular;

  // Generate real liquid glass CSS
  const glassStyle = supported
    ? getLiquidGlassStyle(selectedGlassConfig as LiquidGlassConfig)
    : {
        backgroundColor: isDarkTheme ? 'rgba(20, 24, 33, 0.75)' : 'rgba(255, 255, 255, 0.75)',
        border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}`,
        borderRadius: `${borderRadius}px`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      };

  const scrimBackgroundColor = getScrimColor(isDarkTheme, scrimOpacity);

  const containerMotionProps: any = interactive
    ? {
        whileHover: { scale: 1.018, y: -2 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2, ease: "easeOut" },
      }
    : {};

  return (
    <motion.div
      onClick={onClick}
      {...(animated ? containerMotionProps : {})}
      className={`relative overflow-hidden ${interactive ? 'cursor-pointer select-none' : ''} ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
    >
      {/* 🔮 SCRIM MECHANISM LAYER (Placed directly behind glass to protect contrast) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundColor: scrimBackgroundColor,
          transition: 'background-color 300ms ease-out, opacity 300ms ease-out',
          borderRadius: `${borderRadius}px`,
        }}
      />

      {/* 🥛 LIQUID GLASS SURFACE LAYER */}
      <div
        className="relative z-10 w-full h-full"
        style={glassStyle}
      >
        {children}
      </div>
    </motion.div>
  );
};

/**
 * LiquidGlassCard Component
 * Higher level reusable card for dashboards, modals, widgets and items.
 */
export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = (props) => {
  return <LiquidGlassView {...props} />;
};

/**
 * LiquidGlassContainerView
 * Container for arranging multiple adjacent Liquid Glass cards with unified spacing.
 */
export interface LiquidGlassContainerViewProps {
  children: React.ReactNode;
  spacing?: number;
  className?: string;
  style?: React.CSSProperties;
  direction?: 'row' | 'col';
}

export const LiquidGlassContainerView: React.FC<LiquidGlassContainerViewProps> = ({
  children,
  spacing = 20,
  className = '',
  style = {},
  direction = 'col',
}) => {
  return (
    <div
      className={`flex ${direction === 'row' ? 'flex-row items-center' : 'flex-col'} ${className}`}
      style={{
        gap: `${spacing}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default LiquidGlassCard;
