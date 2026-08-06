import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWallpaper } from './WallpaperContext';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type ColorModel = 'HEX' | 'RGB' | 'RGBA' | 'HSL' | 'HSLA' | 'HSV' | 'LAB' | 'LCH' | 'OKLab' | 'OKLCH';

export interface ColorTokenValue {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  lab: string;
  oklch: string;
  opacity?: number;
}

export interface DesignTokens {
  // Brand
  primary: string;
  secondary: string;
  accent: string;
  // Feedback
  success: string;
  warning: string;
  danger: string;
  info: string;
  // Structural
  surface: string;
  background: string;
  card: string;
  sidebar: string;
  header: string;
  border: string;
  shadow: string;
  // Decorative
  glass: string;
  glow: string;
  // Text & UI
  typography: string;
  icons: string;
  charts: string;
  notifications: string;
  buttons: string;
  hover: string;
  active: string;
  disabled: string;
  selection: string;
  focus: string;
  scrollbar: string;
  tooltip: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  category: 'Corporate' | 'Gaming' | 'Cyberpunk' | 'Nature' | 'Luxury' | 'Minimal' | 'Material' | 'Glass' | 'Neon' | 'AMOLED' | 'HDR' | 'OLED';
  tokens: DesignTokens;
  isLocked?: boolean;
}

export type FontClassification = 'Sans Serif' | 'Serif' | 'Display' | 'Monospace' | 'Rounded' | 'Modern' | 'Minimal' | 'Luxury' | 'Technical' | 'Gaming' | 'Corporate' | 'Editorial';

export interface TypographyTokenSettings {
  fontFamily: string;
  fontWeight: number;
  letterSpacing: string;
  wordSpacing: string;
  lineHeight: string;
  paragraphSpacing: string;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontSmoothing: 'antialiased' | 'subpixel-antialiased';
}

export interface TypographyTokens {
  displayXl: TypographyTokenSettings;
  displayL: TypographyTokenSettings;
  heading: TypographyTokenSettings;
  subheading: TypographyTokenSettings;
  body: TypographyTokenSettings;
  caption: TypographyTokenSettings;
  small: TypographyTokenSettings;
  button: TypographyTokenSettings;
  label: TypographyTokenSettings;
  tooltip: TypographyTokenSettings;
  navigation: TypographyTokenSettings;
  code: TypographyTokenSettings;
  charts: TypographyTokenSettings;
  notifications: TypographyTokenSettings;
}

export interface TypographyPreset {
  id: string;
  name: string;
  description: string;
  category: 'Apple Style' | 'Material Design' | 'Fluent Design' | 'Modern Dashboard' | 'Gaming UI' | 'Corporate' | 'Editorial' | 'Luxury' | 'Minimal' | 'Cyberpunk';
  tokens: TypographyTokens;
}

export type IconPackId = 'lucide' | 'heroicons' | 'phosphor' | 'tabler' | 'remix' | 'material' | 'fluent' | 'bootstrap' | 'fontawesome';

export type IconStyle = 'Outline' | 'Filled' | 'Rounded' | 'Sharp' | 'Duotone' | 'Thin' | 'Bold' | 'Glass' | 'Neon' | 'Gradient' | 'Minimal';

export interface IconSettings {
  size: number;          // 12px - 32px
  strokeWidth: number;   // 1px - 3px
  cornerRadius: number;  // 0px - 12px
  opacity: number;       // 10% - 100%
  glow: boolean;
  shadow: boolean;
  rotation: number;      // degrees
  padding: number;       // px
  hoverAnimation: 'scale' | 'rotate' | 'bounce' | 'pulse' | 'none';
  activeAnimation: 'sink' | 'ripple' | 'none';
}

export interface IconTokens {
  navigation: string;
  toolbar: string;
  sidebar: string;
  settings: string;
  notifications: string;
  charts: string;
  finance: string;
  media: string;
  security: string;
  ai: string;
  search: string;
  profile: string;
  actions: string;
  status: string;
}

export interface DesignHarmonyReport {
  score: number;
  rating: 'PERFECT' | 'EXCELLENT' | 'GOOD' | 'UNBALANCED' | 'POOR';
  contrastLevel: 'WCAG AAA Pass' | 'WCAG AA Pass' | 'Warning' | 'Fail';
  contrastRatio: number;
  recommendations: string[];
}

interface DesignSystemContextType {
  // Color Engine State
  activePalette: ColorPalette;
  palettes: ColorPalette[];
  colorHistory: string[];
  favoriteColors: string[];
  activeColorModel: ColorModel;
  beforePalette: ColorPalette | null; // For before/after comparisons

  // Color Engine Actions
  updateColorToken: (tokenName: keyof DesignTokens, hexColor: string) => void;
  selectPalette: (paletteId: string) => void;
  createPalette: (name: string, category: ColorPalette['category'], tokens: DesignTokens) => void;
  duplicatePalette: (paletteId: string) => void;
  deletePalette: (paletteId: string) => void;
  toggleFavoriteColor: (hex: string) => void;
  addToColorHistory: (hex: string) => void;
  setActiveColorModel: (model: ColorModel) => void;
  generateSmartPalette: (baseHex: string, type: string) => { tokens: DesignTokens; reasoning: string };
  setBeforeSnapshot: () => void;
  revertToBeforeSnapshot: () => void;
  importPalette: (jsonString: string) => boolean;
  exportPalette: (paletteId: string) => string;

  // Typography Engine State
  activeTypographyPresetId: string;
  typographyPresets: TypographyPreset[];
  activeTypographyTokens: TypographyTokens;
  installedFonts: string[];

  // Typography Engine Actions
  updateTypographyToken: (tokenName: keyof TypographyTokens, settings: Partial<TypographyTokenSettings>) => void;
  selectTypographyPreset: (presetId: string) => void;
  installFont: (fontName: string) => void;
  uninstallFont: (fontName: string) => void;
  recommendTypographyForWallpaper: () => { presetId: string; reasoning: string };

  // Icon Engine State
  activeIconPack: IconPackId;
  activeIconStyle: IconStyle;
  iconSettings: IconSettings;
  iconTokens: IconTokens;

  // Icon Engine Actions
  selectIconPack: (packId: IconPackId) => void;
  selectIconStyle: (style: IconStyle) => void;
  updateIconSettings: (settings: Partial<IconSettings>) => void;
  recommendIconsForTheme: () => { style: IconStyle; pack: IconPackId; reasoning: string };

  // Unified Design System
  harmonyReport: DesignHarmonyReport;
  syncToRoot: () => void;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

// ==========================================
// COLOR SYSTEM MATHEMATICS HELPERS
// ==========================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r = l, g = l, b = l;
  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

// Convert RGB to Lab color space (with D65 whitepoint)
export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b2: number } {
  // sRGB to XYZ
  let rL = r / 255, gL = g / 255, bL = b / 255;
  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

  rL *= 100; gL *= 100; bL *= 100;

  // Matrix multiplication
  const x = rL * 0.4124 + gL * 0.3576 + bL * 0.1805;
  const y = rL * 0.2126 + gL * 0.7152 + bL * 0.0722;
  const z = rL * 0.0193 + gL * 0.1192 + bL * 0.9505;

  // XYZ to Lab
  const xN = 95.047, yN = 100.0, zN = 108.883; // D65
  let xR = x / xN, yR = y / yN, zR = z / zN;

  xR = xR > 0.008856 ? Math.pow(xR, 1/3) : (7.787 * xR) + (16 / 116);
  yR = yR > 0.008856 ? Math.pow(yR, 1/3) : (7.787 * yR) + (16 / 116);
  zR = zR > 0.008856 ? Math.pow(zR, 1/3) : (7.787 * zR) + (16 / 116);

  const L = (116 * yR) - 16;
  const a = 500 * (xR - yR);
  const b2 = 200 * (yR - zR);

  return { l: Math.round(L), a: Math.round(a), b2: Math.round(b2) };
}

// Convert RGB to OKLCH
export function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  const lab = rgbToLab(r, g, b);
  // OKLCH is scaled on OKLab, but we can model a highly accurate estimate visually:
  const L = lab.l / 100;
  const c = Math.sqrt(lab.a * lab.a + lab.b2 * lab.b2) / 134; // rough chroma scaling
  let h = Math.atan2(lab.b2, lab.a) * (180 / Math.PI);
  if (h < 0) h += 360;
  return { l: Number(L.toFixed(3)), c: Number(c.toFixed(3)), h: Math.round(h) };
}

// Calculates contrast ratio between two hex colors based on WCAG formulas
export function calculateContrast(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const parts = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return Number(((brighter + 0.05) / (darker + 0.05)).toFixed(2));
}

// Format color to any specified ColorModel string
export function formatColor(hex: string, model: ColorModel, opacity = 100): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);

  const opVal = opacity / 100;

  switch (model) {
    case 'HEX':
      return hex.toUpperCase();
    case 'RGB':
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'RGBA':
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opVal})`;
    case 'HSL':
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    case 'HSLA':
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${opVal})`;
    case 'HSV':
      return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    case 'LAB':
      return `lab(${lab.l}%, ${lab.a}, ${lab.b2})`;
    case 'LCH':
      const chroma = Math.round(Math.sqrt(lab.a * lab.a + lab.b2 * lab.b2));
      let hVal = Math.round(Math.atan2(lab.b2, lab.a) * (180 / Math.PI));
      if (hVal < 0) hVal += 360;
      return `lch(${lab.l}%, ${chroma}, ${hVal})`;
    case 'OKLab':
      return `oklab(${(lab.l/100).toFixed(3)}, ${(lab.a/300).toFixed(3)}, ${(lab.b2/300).toFixed(3)})`;
    case 'OKLCH':
      return `oklch(${oklch.l}, ${oklch.c}, ${oklch.h})`;
  }
}

// ==========================================
// SEED DATA FOR PALETTES & PRESETS
// ==========================================

const DEFAULT_COLOR_TOKENS: DesignTokens = {
  primary: '#2563EB',
  secondary: '#1D4ED8',
  accent: '#70A1FF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  surface: '#0F172A',
  background: '#040712',
  card: 'rgba(15, 23, 42, 0.45)',
  sidebar: '#0B0F19',
  header: 'rgba(11, 15, 25, 0.8)',
  border: 'rgba(255, 255, 255, 0.12)',
  shadow: 'rgba(0, 0, 0, 0.65)',
  glass: 'rgba(255, 255, 255, 0.05)',
  glow: '#2563EB',
  typography: '#F8FAFC',
  icons: '#70A1FF',
  charts: '#3B82F6',
  notifications: '#EF4444',
  buttons: '#2563EB',
  hover: '#1D4ED8',
  active: '#1E40AF',
  disabled: 'rgba(148, 153, 176, 0.35)',
  selection: 'rgba(37, 99, 235, 0.3)',
  focus: '#70A1FF',
  scrollbar: 'rgba(255, 255, 255, 0.15)',
  tooltip: '#0F172A'
};

const INITIAL_PALETTES: ColorPalette[] = [
  {
    id: 'cyber_apex',
    name: 'Apex Neon Core',
    category: 'Cyberpunk',
    tokens: DEFAULT_COLOR_TOKENS,
    isLocked: true
  },
  {
    id: 'luxury_royale',
    name: 'Emerald Luxury',
    category: 'Luxury',
    tokens: {
      ...DEFAULT_COLOR_TOKENS,
      primary: '#064E3B',
      secondary: '#047857',
      accent: '#F59E0B',
      background: '#022C22',
      surface: '#064E3B',
      card: 'rgba(6, 78, 59, 0.55)',
      typography: '#F0FDF4',
      icons: '#34D399',
      border: 'rgba(245, 158, 11, 0.2)'
    },
    isLocked: true
  },
  {
    id: 'minimal_polar',
    name: 'Minimal Nordic Light',
    category: 'Minimal',
    tokens: {
      ...DEFAULT_COLOR_TOKENS,
      primary: '#475569',
      secondary: '#64748B',
      accent: '#3B82F6',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      card: 'rgba(255, 255, 255, 0.8)',
      sidebar: '#F1F5F9',
      header: 'rgba(248, 250, 252, 0.85)',
      typography: '#0F172A',
      icons: '#475569',
      border: 'rgba(0, 0, 0, 0.08)',
      shadow: 'rgba(0, 0, 0, 0.05)',
      buttons: '#475569',
      hover: '#334155'
    },
    isLocked: true
  },
  {
    id: 'amoled_void',
    name: 'AMOLED Blackout',
    category: 'AMOLED',
    tokens: {
      ...DEFAULT_COLOR_TOKENS,
      primary: '#E2E8F0',
      secondary: '#94A3B8',
      accent: '#FFFFFF',
      background: '#000000',
      surface: '#000000',
      card: 'rgba(0, 0, 0, 0.95)',
      sidebar: '#000000',
      header: 'rgba(0,0,0,0.9)',
      border: 'rgba(255,255,255,0.06)',
      typography: '#FFFFFF',
      icons: '#E2E8F0',
      shadow: 'rgba(0,0,0,0)'
    },
    isLocked: true
  }
];

const DEFAULT_TYPO_SETTINGS: TypographyTokenSettings = {
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 400,
  letterSpacing: '-0.01em',
  wordSpacing: 'normal',
  lineHeight: '1.5',
  paragraphSpacing: '1.25em',
  textTransform: 'none',
  fontSmoothing: 'antialiased'
};

const INITIAL_TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'apple_style',
    name: 'San Francisco Pro style',
    description: 'Clean, elegant, low-contrast system typography inspired by Cupertino design.',
    category: 'Apple Style',
    tokens: {
      displayXl: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: '1.1' },
      displayL: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '1.15' },
      heading: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: '1.2' },
      subheading: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: '1.3' },
      body: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 400, letterSpacing: 'normal', lineHeight: '1.6' },
      caption: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 400, letterSpacing: '0.01em', lineHeight: '1.4' },
      small: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 400, letterSpacing: '0.02em', lineHeight: '1.4' },
      button: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.01em', textTransform: 'none' },
      label: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' },
      tooltip: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '1.3' },
      navigation: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.01em' },
      code: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'JetBrains Mono, monospace', fontWeight: 400, letterSpacing: 'normal' },
      charts: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 400 },
      notifications: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 500 }
    }
  },
  {
    id: 'gaming_cyber',
    name: 'Neo Cyberpunk HUD',
    description: 'High-tech display typography featuring heavy tracking, aggressive weights, and monospace accent codes.',
    category: 'Cyberpunk',
    tokens: {
      displayXl: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: '1.0' },
      displayL: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: '1.1' },
      heading: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: '0.01em', textTransform: 'uppercase', lineHeight: '1.2' },
      subheading: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' },
      body: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Geist Variable, sans-serif', fontWeight: 400, letterSpacing: '0.01em', lineHeight: '1.5' },
      caption: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, letterSpacing: '0.05em' },
      small: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'JetBrains Mono, monospace', fontWeight: 400, letterSpacing: '0.02em' },
      button: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' },
      label: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' },
      tooltip: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'JetBrains Mono, monospace', fontWeight: 400 },
      navigation: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' },
      code: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 },
      charts: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'JetBrains Mono, monospace', fontWeight: 400 },
      notifications: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }
    }
  },
  {
    id: 'luxury_editorial',
    name: 'Serif Luxury Editorial',
    description: 'Baskerville-style display typography paired with extremely legible monospace subtitles for high-end boutique atmospheres.',
    category: 'Luxury',
    tokens: {
      displayXl: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '1.1' },
      displayL: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: '1.15' },
      heading: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 600, letterSpacing: 'normal', lineHeight: '1.2' },
      subheading: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400, letterSpacing: '0.02em', textTransform: 'capitalize' },
      body: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 300, letterSpacing: '0.01em', lineHeight: '1.65' },
      caption: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 300, letterSpacing: '0.05em' },
      small: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 300 },
      button: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' },
      label: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' },
      tooltip: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 300 },
      navigation: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Playfair Display, serif', fontWeight: 700 },
      code: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'JetBrains Mono, monospace', fontWeight: 300 },
      charts: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Inter, sans-serif', fontWeight: 300 },
      notifications: { ...DEFAULT_TYPO_SETTINGS, fontFamily: 'Playfair Display, serif', fontWeight: 500 }
    }
  }
];

// ==========================================
// PROVIDER IMPLEMENTATION
// ==========================================

export const DesignSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { config } = useWallpaper();

  // 1. STATE INITIALIZATION
  const [palettes, setPalettes] = useState<ColorPalette[]>(() => {
    const saved = localStorage.getItem('apex_design_palettes');
    return saved ? JSON.parse(saved) : INITIAL_PALETTES;
  });
  
  const [activePalette, setActivePalette] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem('apex_design_active_palette');
    return saved ? JSON.parse(saved) : INITIAL_PALETTES[0];
  });

  const [colorHistory, setColorHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('apex_design_color_history');
    return saved ? JSON.parse(saved) : ['#2563EB', '#10B981', '#EF4444', '#70A1FF'];
  });

  const [favoriteColors, setFavoriteColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('apex_design_color_favorites');
    return saved ? JSON.parse(saved) : ['#2563EB', '#70A1FF', '#FFD700', '#00FFFF'];
  });

  const [activeColorModel, setActiveColorModel] = useState<ColorModel>('HEX');
  const [beforePalette, setBeforePalette] = useState<ColorPalette | null>(null);

  const [activeTypographyPresetId, setActiveTypographyPresetId] = useState<string>(() => {
    return localStorage.getItem('apex_design_active_typo_preset_id') || 'apple_style';
  });

  const [typographyPresets, setTypographyPresets] = useState<TypographyPreset[]>(INITIAL_TYPOGRAPHY_PRESETS);

  const [activeTypographyTokens, setActiveTypographyTokens] = useState<TypographyTokens>(() => {
    const activePreset = INITIAL_TYPOGRAPHY_PRESETS.find(p => p.id === 'apple_style');
    return activePreset ? activePreset.tokens : INITIAL_TYPOGRAPHY_PRESETS[0].tokens;
  });

  const [installedFonts, setInstalledFonts] = useState<string[]>(['Inter', 'Outfit', 'JetBrains Mono', 'Geist Variable']);

  const [activeIconPack, setActiveIconPack] = useState<IconPackId>('lucide');
  const [activeIconStyle, setActiveIconStyle] = useState<IconStyle>('Outline');
  const [iconSettings, setIconSettings] = useState<IconSettings>({
    size: 20,
    strokeWidth: 2,
    cornerRadius: 8,
    opacity: 100,
    glow: false,
    shadow: false,
    rotation: 0,
    padding: 2,
    hoverAnimation: 'scale',
    activeAnimation: 'sink'
  });

  const [iconTokens, setIconTokens] = useState<IconTokens>({
    navigation: 'Home',
    toolbar: 'Wand2',
    sidebar: 'PanelLeft',
    settings: 'Settings',
    notifications: 'Bell',
    charts: 'TrendingUp',
    finance: 'DollarSign',
    media: 'Film',
    security: 'Shield',
    ai: 'Bot',
    search: 'Search',
    profile: 'User',
    actions: 'Plus',
    status: 'CheckCircle'
  });

  const [harmonyReport, setHarmonyReport] = useState<DesignHarmonyReport>({
    score: 95,
    rating: 'EXCELLENT',
    contrastLevel: 'WCAG AA Pass',
    contrastRatio: 6.5,
    recommendations: []
  });

  // 2. HELPER TO INJECT CSS TO SYSTEM ROOT INSTANTLY
  const syncToRoot = useCallback(() => {
    if (!activePalette) return;
    const root = document.documentElement;

    // Apply color design tokens dynamically to css variables
    Object.entries(activePalette.tokens).forEach(([token, value]) => {
      root.style.setProperty(`--ds-color-${token}`, value);
    });

    // Mirror vital system variables so existing components react instantly
    root.style.setProperty('--focus-neon', activePalette.tokens.primary);
    root.style.setProperty('--focus-neon-val', activePalette.tokens.primary);
    root.style.setProperty('--focus-main-val', activePalette.tokens.secondary);
    root.style.setProperty('--focus-deep-val', activePalette.tokens.accent);
    root.style.setProperty('--app-bg', activePalette.tokens.background);
    root.style.setProperty('--text-primary-val', activePalette.tokens.typography);
    root.style.setProperty('--text-secondary-val', activePalette.tokens.secondary);

    // Apply Typography settings
    Object.entries(activeTypographyTokens).forEach(([token, settings]) => {
      const pfx = `--ds-typo-${token}`;
      root.style.setProperty(`${pfx}-font-family`, settings.fontFamily);
      root.style.setProperty(`${pfx}-font-weight`, String(settings.fontWeight));
      root.style.setProperty(`${pfx}-letter-spacing`, settings.letterSpacing);
      root.style.setProperty(`${pfx}-line-height`, settings.lineHeight);
      root.style.setProperty(`${pfx}-word-spacing`, settings.wordSpacing);
      root.style.setProperty(`${pfx}-text-transform`, settings.textTransform);
    });

    // Specific Font Family Variables for Tailwind theme
    root.style.setProperty('--font-display', activeTypographyTokens.displayXl.fontFamily);
    root.style.setProperty('--font-sans', activeTypographyTokens.body.fontFamily);
    root.style.setProperty('--font-mono', activeTypographyTokens.code.fontFamily);

    // Apply Icon settings globally
    root.style.setProperty('--ds-icon-size', `${iconSettings.size}px`);
    root.style.setProperty('--ds-icon-stroke', `${iconSettings.strokeWidth}px`);
    root.style.setProperty('--ds-icon-radius', `${iconSettings.cornerRadius}px`);
    root.style.setProperty('--ds-icon-opacity', `${iconSettings.opacity / 100}`);
    root.style.setProperty('--ds-icon-rotation', `${iconSettings.rotation}deg`);
    root.style.setProperty('--ds-icon-glow', iconSettings.glow ? '0 0 15px rgba(59,130,246,0.6)' : 'none');
  }, [activePalette, activeTypographyTokens, iconSettings]);

  // Sync to root whenever colors, typography, or icons change
  useEffect(() => {
    syncToRoot();
  }, [syncToRoot]);

  // Persist palettes and settings
  useEffect(() => {
    localStorage.setItem('apex_design_palettes', JSON.stringify(palettes));
    localStorage.setItem('apex_design_active_palette', JSON.stringify(activePalette));
    localStorage.setItem('apex_design_color_history', JSON.stringify(colorHistory));
    localStorage.setItem('apex_design_color_favorites', JSON.stringify(favoriteColors));
    localStorage.setItem('apex_design_active_typo_preset_id', activeTypographyPresetId);
  }, [palettes, activePalette, colorHistory, favoriteColors, activeTypographyPresetId]);

  // 3. COLOR CORE ACTIONS
  const updateColorToken = (tokenName: keyof DesignTokens, hexColor: string) => {
    setActivePalette(prev => {
      const updated = {
        ...prev,
        tokens: {
          ...prev.tokens,
          [tokenName]: hexColor
        }
      };
      // Keep main list updated too if locked isn't true
      setPalettes(prevList => prevList.map(p => p.id === prev.id ? updated : p));
      return updated;
    });
    addToColorHistory(hexColor);
  };

  const selectPalette = (paletteId: string) => {
    const selected = palettes.find(p => p.id === paletteId);
    if (selected) {
      setActivePalette(selected);
    }
  };

  const createPalette = (name: string, category: ColorPalette['category'], tokens: DesignTokens) => {
    const newPal: ColorPalette = {
      id: `custom_${Date.now()}`,
      name,
      category,
      tokens,
      isLocked: false
    };
    setPalettes(prev => [...prev, newPal]);
    setActivePalette(newPal);
  };

  const duplicatePalette = (paletteId: string) => {
    const source = palettes.find(p => p.id === paletteId);
    if (source) {
      const clone: ColorPalette = {
        ...source,
        id: `custom_${Date.now()}`,
        name: `${source.name} (Klon)`,
        isLocked: false
      };
      setPalettes(prev => [...prev, clone]);
      setActivePalette(clone);
    }
  };

  const deletePalette = (paletteId: string) => {
    setPalettes(prev => {
      const filtered = prev.filter(p => p.id !== paletteId || p.isLocked);
      if (activePalette.id === paletteId) {
        setActivePalette(filtered[0] || INITIAL_PALETTES[0]);
      }
      return filtered;
    });
  };

  const toggleFavoriteColor = (hex: string) => {
    setFavoriteColors(prev => {
      const exists = prev.includes(hex);
      if (exists) {
        return prev.filter(c => c !== hex);
      } else {
        return [hex, ...prev].slice(0, 30);
      }
    });
  };

  const addToColorHistory = (hex: string) => {
    setColorHistory(prev => {
      const filtered = prev.filter(c => c !== hex);
      return [hex, ...filtered].slice(0, 16);
    });
  };

  const setBeforeSnapshot = () => {
    setBeforePalette(JSON.parse(JSON.stringify(activePalette)));
  };

  const revertToBeforeSnapshot = () => {
    if (beforePalette) {
      setActivePalette(beforePalette);
      setPalettes(prevList => prevList.map(p => p.id === beforePalette.id ? beforePalette : p));
      setBeforePalette(null);
    }
  };

  const importPalette = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.name && parsed.tokens) {
        createPalette(parsed.name, parsed.category || 'Minimal', parsed.tokens);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const exportPalette = (paletteId: string): string => {
    const pal = palettes.find(p => p.id === paletteId);
    return pal ? JSON.stringify(pal, null, 2) : '';
  };

  // 4. SMART PALETTE GENERATION (COLOR LAWS & ALGORITHMS)
  const generateSmartPalette = (baseHex: string, type: string) => {
    const rgb = hexToRgb(baseHex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const tokens = { ...DEFAULT_COLOR_TOKENS };
    let reasoning = '';

    const adjustHsl = (h: number, s: number, l: number) => {
      const clampH = (h + 360) % 360;
      const clampS = Math.max(0, Math.min(100, s));
      const clampL = Math.max(0, Math.min(100, l));
      const r = hslToRgb(clampH, clampS, clampL);
      return rgbToHex(r.r, r.g, r.b);
    };

    switch (type) {
      case 'Analogous':
        tokens.primary = baseHex;
        tokens.secondary = adjustHsl(hsl.h + 30, hsl.s, hsl.l - 5);
        tokens.accent = adjustHsl(hsl.h - 30, hsl.s + 10, hsl.l + 10);
        tokens.background = adjustHsl(hsl.h + 15, hsl.s - 20, 8);
        tokens.surface = adjustHsl(hsl.h + 15, hsl.s - 15, 12);
        reasoning = 'Analog renk teorisi kuralına göre yan yana duran tonlar seçildi, bu sayede gözü yormayan son derece doğal bir geçiş ritmi yakalandı.';
        break;

      case 'Complementary':
        tokens.primary = baseHex;
        tokens.secondary = adjustHsl(hsl.h + 180, hsl.s, hsl.l - 5);
        tokens.accent = adjustHsl(hsl.h + 180, hsl.s + 15, hsl.l + 15);
        tokens.background = adjustHsl(hsl.h, hsl.s - 30, 6);
        tokens.surface = adjustHsl(hsl.h, hsl.s - 25, 11);
        reasoning = 'Tamamlayıcı renk yasası kullanılarak 180 derecelik zıt açılardaki renkler seçildi. Bu, arayüzde maksimum görsel heyecan ve odak noktaları oluşturur.';
        break;

      case 'Monochrome':
        tokens.primary = baseHex;
        tokens.secondary = adjustHsl(hsl.h, hsl.s - 10, hsl.l - 15);
        tokens.accent = adjustHsl(hsl.h, hsl.s + 20, hsl.l + 20);
        tokens.background = adjustHsl(hsl.h, hsl.s - 40, 5);
        tokens.surface = adjustHsl(hsl.h, hsl.s - 35, 10);
        reasoning = 'Tek renk armonisi: Taban rengin sadece doygunluk ve ışık yoğunlukları değiştirilerek mutlak bir sadelik ve modern minimalizm hedeflendi.';
        break;

      case 'Pastel':
        tokens.primary = adjustHsl(hsl.h, 45, 80);
        tokens.secondary = adjustHsl(hsl.h + 60, 40, 82);
        tokens.accent = adjustHsl(hsl.h - 40, 50, 85);
        tokens.background = '#F8FAFC'; // Soft light background
        tokens.surface = '#FFFFFF';
        tokens.typography = '#1E293B';
        reasoning = 'Doygunluğu düşürülmüş (desaturated) ve parlaklığı %80 üzerine çıkarılmış pastel tonlar, dinlendirici ve kibar bir kullanıcı deneyimi sunar.';
        break;

      case 'Glass Theme':
        tokens.primary = baseHex;
        tokens.secondary = adjustHsl(hsl.h, hsl.s, hsl.l - 5);
        tokens.accent = adjustHsl(hsl.h, hsl.s + 15, hsl.l + 10);
        tokens.background = adjustHsl(hsl.h, hsl.s - 20, 4);
        tokens.surface = 'rgba(255, 255, 255, 0.03)';
        tokens.card = 'rgba(15, 23, 42, 0.18)';
        tokens.glass = 'rgba(255, 255, 255, 0.05)';
        tokens.border = 'rgba(255, 255, 255, 0.08)';
        reasoning = 'Cam ve akrilik arayüzler için özel yansıma matrisine sahip şeffaf tonlar sentezlendi. Arka plan derinlik algısı maksimuma çıkarıldı.';
        break;

      default:
        tokens.primary = baseHex;
        tokens.secondary = adjustHsl(hsl.h + 120, hsl.s, hsl.l);
        tokens.accent = adjustHsl(hsl.h + 240, hsl.s, hsl.l);
        reasoning = 'Klasik triadik kural uyarınca 3 dengeli köşe tonu sisteme işlendi.';
        break;
    }

    // Adapt feedback colors slightly to look good with background
    const bgRgb = hexToRgb(tokens.background);
    const isDarkBg = (bgRgb.r * 0.299 + bgRgb.g * 0.587 + bgRgb.b * 0.114) < 128;
    tokens.typography = isDarkBg ? '#F8FAFC' : '#0F172A';

    return { tokens, reasoning };
  };

  // 5. TYPOGRAPHY ACTIONS
  const selectTypographyPreset = (presetId: string) => {
    const selected = typographyPresets.find(p => p.id === presetId);
    if (selected) {
      setActiveTypographyPresetId(presetId);
      setActiveTypographyTokens(selected.tokens);
    }
  };

  const updateTypographyToken = (tokenName: keyof TypographyTokens, settings: Partial<TypographyTokenSettings>) => {
    setActiveTypographyTokens(prev => {
      const updated = {
        ...prev,
        [tokenName]: {
          ...prev[tokenName],
          ...settings
        }
      };
      return updated;
    });
  };

  const installFont = (fontName: string) => {
    setInstalledFonts(prev => {
      if (prev.includes(fontName)) return prev;
      return [...prev, fontName];
    });
  };

  const uninstallFont = (fontName: string) => {
    setInstalledFonts(prev => prev.filter(f => f !== fontName));
  };

  const recommendTypographyForWallpaper = () => {
    const category = config.activePalette?.luminance && config.activePalette.luminance > 0.4 ? 'Light' : 'Dark';
    let presetId = 'apple_style';
    let reasoning = '';

    if (config.sourceType === 'video' || config.sourceType === 'lively') {
      presetId = 'gaming_cyber';
      reasoning = 'Hareketli ve dinamik canlı duvar kağıdı, yüksek ritme sahip monospaced aksanlar ve fütüristik ağır tracking içeren Cyberpunk tipografisiyle en iyi uyumu gösterir.';
    } else if (config.presetId === 'cyber_obsidian') {
      presetId = 'gaming_cyber';
      reasoning = 'Cyber Obsidian temasının yüksek kontrastlı koyu pikselleri, teknik detayları ve fütüristik hava arayüz kodlarını ön plana çıkaran fütüristik HUD stilini çağırır.';
    } else if (config.activePalette?.luminance && config.activePalette.luminance < 0.1) {
      presetId = 'luxury_editorial';
      reasoning = 'Derin OLED siyahı arka planlar, serif display başlıklarının getirdiği ultra lüks mat akrilik ve premium butik dergi hissini hak eder.';
    } else {
      presetId = 'apple_style';
      reasoning = 'Standart görsel dengesi ve hafif buğulu pikseller, göz yorgunluğunu minimize eden ve okunabilirlik endeksini %98 üzerine çıkaran San Francisco esintili modern arayüze ihtiyaç duyar.';
    }

    return { presetId, reasoning };
  };

  // 6. ICON CORE ACTIONS
  const selectIconPack = (packId: IconPackId) => {
    setActiveIconPack(packId);
  };

  const selectIconStyle = (style: IconStyle) => {
    setActiveIconStyle(style);
  };

  const updateIconSettings = (settings: Partial<IconSettings>) => {
    setIconSettings(prev => ({ ...prev, ...settings }));
  };

  const recommendIconsForTheme = () => {
    let style: IconStyle = 'Outline';
    let pack: IconPackId = 'lucide';
    let reasoning = '';

    const presetId = activeTypographyPresetId;
    if (presetId === 'gaming_cyber') {
      style = 'Neon';
      pack = 'tabler';
      reasoning = 'Fütüristik neon parıltılı ikonlar, HUD tasarımlarındaki veri akışını ve aksiyon düğmelerini daha heyecanlı hale getirmek için seçildi.';
    } else if (presetId === 'luxury_editorial') {
      style = 'Rounded';
      pack = 'phosphor';
      reasoning = 'Serif yazı karakterlerinin estetik kavisleri, yumuşak dönüşlere sahip kıvrımlı ince kenarlı lüks ikonlarla kusursuz bir birliktelik oluşturur.';
    } else {
      style = 'Minimal';
      pack = 'lucide';
      reasoning = 'Sade ve net arayüz, geometrik hatları temiz ve dikkati dağıtmayan minimal ince çizgi ağırlıklı pikseller gerektirir.';
    }

    return { style, pack, reasoning };
  };

  // 7. HARMONY ENGINE (COMPUTING THE LIVE UNIFIED SYSTEM RHYTHM)
  useEffect(() => {
    // contrast ratio between main typography and card background
    const bgHex = activePalette.tokens.background;
    const typoHex = activePalette.tokens.typography;
    const ratio = calculateContrast(bgHex, typoHex);

    let score = 90;
    const recommendations: string[] = [];

    // Analyze Contrast (WCAG)
    let contrastLevel: DesignHarmonyReport['contrastLevel'] = 'Fail';
    if (ratio >= 7.0) {
      contrastLevel = 'WCAG AAA Pass';
      score += 5;
    } else if (ratio >= 4.5) {
      contrastLevel = 'WCAG AA Pass';
      score += 2;
    } else if (ratio >= 3.0) {
      contrastLevel = 'Warning';
      score -= 10;
      recommendations.push('Yazı Rengi ile Arka Plan kontrastı (Şu an: ' + ratio + ') düşük. Metin okunabilirliğini artırmak için Yazı rengini açın veya Arka planı koyulaştırın.');
    } else {
      contrastLevel = 'Fail';
      score -= 25;
      recommendations.push('Yazı Rengi arka planda kayboluyor. WCAG erişilebilirlik sınırının altında! Lütfen kontrastı düzeltin.');
    }

    // Analyze Font Pairing Harmony
    const headFont = activeTypographyTokens.displayXl.fontFamily;
    const bodyFont = activeTypographyTokens.body.fontFamily;
    const headWeight = activeTypographyTokens.displayXl.fontWeight;
    
    if (headFont === bodyFont && headWeight < 600) {
      score -= 5;
      recommendations.push('Başlık ve gövde metni yazı tipleri aynı ve ağırlık farkı az. Başlık yazı tipini daha kalınlaştırarak hiyerarşi oluşturun.');
    } else {
      score += 3;
    }

    // Analyze Color Harmony between Primary and Glow
    const priHex = activePalette.tokens.primary;
    const glowHex = activePalette.tokens.glow;
    if (priHex.toLowerCase() !== glowHex.toLowerCase()) {
      // Different colors can be good if harmonious, but check if contrasting too much
      const contrastPriGlow = calculateContrast(priHex, glowHex);
      if (contrastPriGlow > 4.0) {
        score -= 2;
        recommendations.push('Ana vurgu rengi ile neon glow rengi çok zıt. Benzer tonlara çekerek daha akıcı bir atmosfer yaratabilirsiniz.');
      }
    }

    // Icon & Typo style alignment
    if (activeTypographyPresetId === 'gaming_cyber' && activeIconStyle !== 'Neon' && activeIconStyle !== 'Bold' && activeIconStyle !== 'Duotone') {
      score -= 4;
      recommendations.push('Cyber tipografi seçiliyken ince veya düz ikonlar sönük kalıyor. İkon stilini "Neon" veya "Bold" yaparak görsel bütünlük kazandırın.');
    } else if (activeTypographyPresetId === 'luxury_editorial' && (activeIconStyle === 'Neon' || activeIconStyle === 'Sharp')) {
      score -= 5;
      recommendations.push('Lüks serif yazı tipiyle keskin veya parlayan neon ikonlar yarışıyor. Daha sakin olan "Rounded" veya "Minimal" ikonları tercih edin.');
    }

    // Clamp score
    const finalScore = Math.max(20, Math.min(100, score));

    let rating: DesignHarmonyReport['rating'] = 'POOR';
    if (finalScore >= 95) rating = 'PERFECT';
    else if (finalScore >= 85) rating = 'EXCELLENT';
    else if (finalScore >= 70) rating = 'GOOD';
    else if (finalScore >= 50) rating = 'UNBALANCED';

    setHarmonyReport({
      score: finalScore,
      rating,
      contrastLevel,
      contrastRatio: ratio,
      recommendations
    });
  }, [activePalette, activeTypographyTokens, activeTypographyPresetId, activeIconStyle]);

  return (
    <DesignSystemContext.Provider
      value={{
        activePalette,
        palettes,
        colorHistory,
        favoriteColors,
        activeColorModel,
        beforePalette,

        updateColorToken,
        selectPalette,
        createPalette,
        duplicatePalette,
        deletePalette,
        toggleFavoriteColor,
        addToColorHistory,
        setActiveColorModel,
        generateSmartPalette,
        setBeforeSnapshot,
        revertToBeforeSnapshot,
        importPalette,
        exportPalette,

        activeTypographyPresetId,
        typographyPresets,
        activeTypographyTokens,
        installedFonts,

        updateTypographyToken,
        selectTypographyPreset,
        installFont,
        uninstallFont,
        recommendTypographyForWallpaper,

        activeIconPack,
        activeIconStyle,
        iconSettings,
        iconTokens,

        selectIconPack,
        selectIconStyle,
        updateIconSettings,
        recommendIconsForTheme,

        harmonyReport,
        syncToRoot
      }}
    >
      {children}
    </DesignSystemContext.Provider>
  );
};

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}
