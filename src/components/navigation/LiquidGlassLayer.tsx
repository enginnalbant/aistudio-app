import React from 'react';
import { LiquidGlassConfig } from '../../types/navigation';

export function getLiquidGlassStyle(config: LiquidGlassConfig, isHighContrast = false): React.CSSProperties {
  // Quality adjustments
  let effectiveBlur = config.blur ?? 20;
  if (config.quality === 'performance') {
    effectiveBlur = Math.min(effectiveBlur, 10);
  } else if (config.quality === 'ultra') {
    effectiveBlur = Math.round(effectiveBlur * 1.25);
  }

  const blurVal = `${effectiveBlur}px`;
  const opacityVal = (config.opacity ?? 65) / 100; // 0.0 to 1.0
  const borderOpacityVal = ((config.borderOpacity ?? 25) / 100).toFixed(2);
  const borderWidthVal = `${config.borderWidth ?? 1}px`;
  const borderRadiusVal = `${config.borderRadius ?? 16}px`;
  const brightnessVal = `${config.brightness ?? 105}%`;
  const saturationVal = `${config.saturation ?? 125}%`;

  // Real Liquid Glass tint - Translucent Ice Crystal White (No black/charcoal tint!)
  // Glass base translucency is pure ice crystal white tint scaled by opacity
  const glassAlpha = (0.04 + opacityVal * 0.18).toFixed(2);
  const baseBg = `rgba(255, 255, 255, ${glassAlpha})`;

  // Multi-layered Liquid Prism Refraction Gradient (Specular top shine + subtle cyan/violet light dispersion)
  const topLinearGradient = `linear-gradient(135deg, rgba(255, 255, 255, ${(Number(borderOpacityVal) * 0.45 + 0.12).toFixed(2)}) 0%, rgba(240, 248, 255, ${(opacityVal * 0.08).toFixed(2)}) 35%, rgba(0, 229, 255, 0.06) 70%, rgba(168, 85, 247, 0.05) 100%)`;

  // Light response highlight
  let lightHighlight = '';
  if (config.lightResponse === 'subtle') {
    lightHighlight = ', radial-gradient(circle at 35% 0%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)';
  } else if (config.lightResponse === 'standard') {
    lightHighlight = ', radial-gradient(circle at 30% 0%, rgba(255, 255, 255, 0.32) 0%, transparent 75%), radial-gradient(circle at 80% 100%, rgba(0, 229, 255, 0.1) 0%, transparent 60%)';
  }

  // Shadow based on shadowDepth and quality
  let shadowCss = 'none';
  if (config.shadowDepth === 'subtle') {
    shadowCss = `0 10px 30px -5px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)`;
  } else if (config.shadowDepth === 'medium') {
    shadowCss = `0 16px 40px -8px rgba(0, 0, 0, 0.35), 0 6px 16px rgba(0, 0, 0, 0.2)`;
  } else if (config.shadowDepth === 'deep') {
    shadowCss = `0 24px 60px -10px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.25)`;
  }

  if (config.quality === 'performance') {
    shadowCss = '0 4px 14px rgba(0, 0, 0, 0.2)';
  }

  // Pure liquid crystal top rim specular reflection & inner bevel glass edge
  const topSpecular = `inset 0 1px 2px 0 rgba(255, 255, 255, ${Math.min(1.0, Math.max(0.35, Number(borderOpacityVal) * 2.0)).toFixed(2)})`;
  const innerEdgeBevel = `inset 0 0 0 1px rgba(255, 255, 255, ${(Number(borderOpacityVal) * 0.4 + 0.08).toFixed(2)})`;

  const finalShadow = shadowCss !== 'none'
    ? `${shadowCss}, ${topSpecular}, ${innerEdgeBevel}`
    : `${topSpecular}, ${innerEdgeBevel}`;

  return {
    backdropFilter: `blur(${blurVal}) saturate(${saturationVal}) brightness(${brightnessVal}) contrast(104%)`,
    WebkitBackdropFilter: `blur(${blurVal}) saturate(${saturationVal}) brightness(${brightnessVal}) contrast(104%)`,
    backgroundColor: baseBg,
    backgroundImage: lightHighlight
      ? `${topLinearGradient}${lightHighlight}`
      : topLinearGradient,
    borderWidth: borderWidthVal,
    borderStyle: (config.borderWidth ?? 1) > 0 ? 'solid' : 'none',
    borderColor: `rgba(255, 255, 255, ${borderOpacityVal})`,
    borderRadius: borderRadiusVal,
    boxShadow: finalShadow,
  };
}

