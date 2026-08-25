import React from 'react';
import { motion } from 'motion/react';
import { FocusLightColor, FocusLightIntensity, FocusLightSpeed } from '../../types/navigation';

export interface RotatingFocusBorderProps {
  children: React.ReactNode;
  color?: FocusLightColor;
  customColorHex?: string;
  speed?: FocusLightSpeed;
  intensity?: FocusLightIntensity;
  enabled?: boolean;
  className?: string;
  borderRadius?: number;
}

export const RotatingFocusBorder: React.FC<RotatingFocusBorderProps> = ({
  children,
  color = 'cyan',
  customColorHex,
  speed = 'normal',
  intensity = 'vivid',
  enabled = true,
  className = '',
  borderRadius = 20,
}) => {
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  // Duration mapping
  const speedDurationMap: Record<FocusLightSpeed, number> = {
    fast: 2.2,
    normal: 4.5,
    slow: 7.5,
  };

  // Color gradient mapping
  const colorGradientMap: Record<FocusLightColor, string> = {
    cyan: 'conic-gradient(from 0deg, transparent 0%, #00E5FF 30%, #3B82F6 50%, #00E5FF 70%, transparent 100%)',
    emerald: 'conic-gradient(from 0deg, transparent 0%, #10B981 30%, #34D399 50%, #10B981 70%, transparent 100%)',
    purple: 'conic-gradient(from 0deg, transparent 0%, #A855F7 30%, #C084FC 50%, #A855F7 70%, transparent 100%)',
    amber: 'conic-gradient(from 0deg, transparent 0%, #F59E0B 30%, #FBBF24 50%, #F59E0B 70%, transparent 100%)',
    white: 'conic-gradient(from 0deg, transparent 0%, #FFFFFF 30%, #E2E8F0 50%, #FFFFFF 70%, transparent 100%)',
    rose: 'conic-gradient(from 0deg, transparent 0%, #F43F5E 30%, #FB7185 50%, #F43F5E 70%, transparent 100%)',
    rainbow: 'conic-gradient(from 0deg, #00E5FF, #A855F7, #F43F5E, #F59E0B, #10B981, #00E5FF)',
  };

  // Intensity glow mapping
  const intensityGlowMap: Record<FocusLightIntensity, string> = {
    soft: 'blur-xs opacity-60',
    vivid: 'blur-sm opacity-90 shadow-[0_0_20px_rgba(0,229,255,0.4)]',
    beam: 'blur-md opacity-100 shadow-[0_0_35px_rgba(0,229,255,0.7)] scale-[1.02]',
  };

  let gradient = colorGradientMap[color] || colorGradientMap.cyan;
  if (customColorHex) {
    gradient = `conic-gradient(from 0deg, transparent 0%, ${customColorHex} 30%, #ffffff 50%, ${customColorHex} 70%, transparent 100%)`;
  }

  const duration = speedDurationMap[speed] || 4.5;
  const glowClass = intensityGlowMap[intensity] || intensityGlowMap.vivid;

  return (
    <div
      className={`relative p-[2px] overflow-hidden ${className}`}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      {/* 360-Degree Rotating Beam Layer */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration, ease: 'linear' }}
        style={{
          background: gradient,
          width: '250%',
          height: '250%',
          position: 'absolute',
          top: '-75%',
          left: '-75%',
          zIndex: 0,
        }}
        className={glowClass}
      />

      {/* Inner Liquid Glass Card Container */}
      <div
        className="relative z-10 w-full h-full"
        style={{ borderRadius: `${Math.max(4, borderRadius - 2)}px` }}
      >
        {children}
      </div>
    </div>
  );
};
