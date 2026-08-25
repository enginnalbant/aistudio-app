import { LiquidGlassConfig, GlassPreset } from './navigation';

export interface HeaderWidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export type HeaderDensity = 'compact' | 'comfortable' | 'spacious';

export interface HeaderLayoutConfig {
  height: number; // 44 - 80 px
  outerMargin: number; // 0 - 24 px
  cornerRadius: number; // 8 - 32 px
  paddingX: number; // 8 - 32 px
  gap: number; // 4 - 20 px
}

export interface HeaderAppearanceConfig {
  density: HeaderDensity;
  iconSize: number; // 14 - 22 px
  tooltipsEnabled: boolean;
  showMobileLogo: boolean;
}

export interface HeaderProfile {
  id: string;
  name: string;
  description: string;
  iconName: string;
  layout: HeaderLayoutConfig;
  glassConfig: LiquidGlassConfig;
  widgets: Record<string, boolean>;
  widgetOrder: string[];
  appearance: HeaderAppearanceConfig;
  isCustom?: boolean;
}

export interface HeaderPreferences {
  version: number;
  applyMode: 'live' | 'preview';
  activeProfileId: string;
  layout: HeaderLayoutConfig;
  glassConfig: LiquidGlassConfig;
  widgets: Record<string, boolean>;
  widgetOrder: string[];
  appearance: HeaderAppearanceConfig;
  customProfiles: HeaderProfile[];
}

export interface HeaderSelfTestResult {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
}
