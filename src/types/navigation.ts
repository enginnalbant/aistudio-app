export type NavMode = 'expanded' | 'compact' | 'autohide' | 'focus';
export type SidebarPosition = 'left' | 'right' | 'top' | 'dock' | 'bottom';
export type SecondaryPlacement = 'attached' | 'floating' | 'overlay' | 'docked';
export type SmartnessLevel = 'manual' | 'assisted' | 'adaptive' | 'intelligent';

export type FocusLightColor = 'cyan' | 'emerald' | 'purple' | 'amber' | 'white' | 'rose' | 'rainbow';
export type FocusLightSpeed = 'fast' | 'normal' | 'slow';
export type FocusLightIntensity = 'soft' | 'vivid' | 'beam';

export interface FocusLightConfig {
  color: FocusLightColor;
  customColorHex?: string;
  speed: FocusLightSpeed;
  intensity: FocusLightIntensity;
  enabled: boolean;
}
export type GlassPreset =
  | 'minimal'
  | 'clear'
  | 'deep'
  | 'frosted'
  | 'ultra-thin'
  | 'thin'
  | 'regular'
  | 'thick'
  | 'ultra-thick'
  | 'custom';
export type GlassQuality = 'performance' | 'balanced' | 'quality' | 'ultra';
export type SecurityLevel = 'none' | 'hidden' | 'protected' | 'restricted';
export type NavigationDensity = 'compact' | 'comfortable' | 'spacious' | 'custom';
export type AnimationDuration = 'fast' | 'normal' | 'smooth' | 'custom';

export interface LiquidGlassConfig {
  preset: GlassPreset;
  blur: number; // 0 - 60 px
  opacity: number; // 10 - 100 %
  saturation: number; // 80 - 200 %
  brightness: number; // 70 - 130 %
  noise: number; // 0 - 30 %
  borderWidth: number; // 0 - 4 px
  borderOpacity: number; // 0 - 80 %
  borderRadius: number; // 8 - 32 px
  shadowDepth: 'none' | 'subtle' | 'medium' | 'deep';
  elevation: number; // 1 - 5
  quality: GlassQuality;
  lightResponse: 'off' | 'subtle' | 'standard';
  adaptiveContrast: boolean; // Adapts contrast automatically to wallpaper
}

export interface LayoutConfig {
  primaryWidth: number; // 48 - 96 px
  secondaryWidth: number; // 180 - 360 px
  compactWidth: number; // 44 - 96 px
  gap: number; // 0 - 32 px
  outerMargin: number; // 0 - 24 px
  topOffset: number; // 0 - 32 px
  bottomOffset: number; // 0 - 32 px
  cornerRadius: number; // 8 - 32 px
  contentSpacing: number; // 0 - 32 px
}

export interface AutoHideConfig {
  enabled: boolean;
  hideDelay: number; // ms
  revealDelay: number; // ms
  revealZone: number; // px
  revealOnHover: boolean;
  revealOnNavigation: boolean;
  revealOnKeyboard: boolean;
  edgeReveal: 'off' | 'primary' | 'secondary' | 'both';
}

export interface InteractionConfig {
  idleCollapseMs: number; // 0 = never, 5000, 10000, 20000, 30000, 60000, 300000
  tempExpandOnHover: boolean;
  hoverDelayMs: number;
  collapseDelayMs: number;
  sensitivity: 'low' | 'normal' | 'high';
  isLocked: boolean;
}

export interface AppearanceConfig {
  iconSize: number; // 16, 18, 20, 22, 24
  showLabels: 'icon-only' | 'icon-label' | 'auto';
  density: NavigationDensity;
  showSearch: boolean;
  showHeader: boolean;
  showFooter: boolean;
  tooltipsEnabled: boolean;
  tooltipDelay: number; // ms
}

export interface AnimationConfig {
  enabled: boolean;
  duration: AnimationDuration;
  customDurationMs: number;
  reducedMotion: boolean;
}

export interface ShortcutsConfig {
  togglePrimary: string;
  toggleSecondary: string;
  focusMode: string;
  commandPalette: string;
}

export interface PageConfig {
  id: string;
  moduleId: string;
  label: string;
  iconName: string;
  isFavorite: boolean;
  visible: boolean;
  enabled: boolean;
  securityLevel: SecurityLevel;
  badge?: string | number;
  description?: string;
  order?: number;
}

export interface ModuleConfig {
  id: string;
  title: string;
  shortName: string;
  iconName: string;
  color: string;
  badge?: string | number;
  visible: boolean;
  enabled: boolean;
  pinned: boolean;
  securityLevel: SecurityLevel;
  pinCode?: string;
  subPages: PageConfig[];
  order?: number;
}

export interface SidebarProfile {
  id: string;
  name: string;
  description: string;
  iconName: string;
  navMode: NavMode;
  smartnessLevel: SmartnessLevel;
  position: SidebarPosition;
  secondaryPlacement: SecondaryPlacement;
  layout: LayoutConfig;
  glassConfig: LiquidGlassConfig;
  focusLightConfig?: FocusLightConfig;
  autoHide?: AutoHideConfig;
  interaction?: InteractionConfig;
  appearance?: AppearanceConfig;
  animation?: AnimationConfig;
  activeModules: string[];
  isCustom?: boolean;
}

export interface NavigationPreferences {
  version: number;
  applyMode: 'live' | 'preview';
  activeProfileId: string;
  navMode: NavMode;
  smartnessLevel: SmartnessLevel;
  position: SidebarPosition;
  secondaryPlacement: SecondaryPlacement;
  layout: LayoutConfig;
  autoHide: AutoHideConfig;
  interaction: InteractionConfig;
  appearance: AppearanceConfig;
  animation: AnimationConfig;
  shortcuts: ShortcutsConfig;
  glassConfig: LiquidGlassConfig;
  focusLightConfig: FocusLightConfig;
  modules: Record<string, ModuleConfig>;
  moduleOrder: string[];
  securityPin: string;
  customProfiles: SidebarProfile[];
  recentPages: string[];
  favoritePages: string[];
  moduleUsageStats: Record<string, number>;
  minimumContentWidth: number; // e.g. 640px
  
  // Backward compatibility getters
  s1Width?: number;
  s2Width?: number;
  autoHideIdleMs?: number;
  tempExpandOnHover?: boolean;
}

export interface SelfTestResult {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
}

