export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  creationDate: string;
  version: string;
  isFavorite: boolean;
  isCustom: boolean;
  
  // Core colors
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  sidebar: string;
  header: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  
  // Custom metadata types
  formatType?: 'HEX' | 'RGB' | 'RGBA' | 'HSL' | 'HSV' | 'LAB' | 'OKLCH';
  gradient?: string; // CSS gradient string
  glassTint?: string; // rgba glass color
  glowColor?: string; // glowing border/radial color
  shadowColor?: string; // custom shadow
  
  // Chart & FX
  chartColors: string[];
  glowColors: string[];
  shadowColors: string[];
}

export interface TypographyLevel {
  fontSize: string;     // e.g. "48px" or "3rem"
  lineHeight: string;   // e.g. "1.2" or "1.5"
  fontWeight: string;   // e.g. "400" or "bold"
  letterSpacing: string;// e.g. "0.05em" or "-0.02em"
  fontFamily: string;   // e.g. "Inter, sans-serif"
  textTransform?: string; // e.g. "uppercase"
}

export interface TypographyTree {
  displayXl: TypographyLevel;
  displayL: TypographyLevel;
  displayM: TypographyLevel;
  headingXl: TypographyLevel;
  headingL: TypographyLevel;
  headingM: TypographyLevel;
  headingS: TypographyLevel;
  bodyLarge: TypographyLevel;
  bodyMedium: TypographyLevel;
  bodySmall: TypographyLevel;
  caption: TypographyLevel;
  label: TypographyLevel;
  button: TypographyLevel;
  tooltip: TypographyLevel;
  navigation: TypographyLevel;
  sidebar: TypographyLevel;
  chart: TypographyLevel;
  notification: TypographyLevel;
  code: TypographyLevel;
}

export interface FontCollection {
  id: string;
  name: string;
  family: string;
  weights: string[];
  styles: string[];
  isMonospace: boolean;
  isFavorite: boolean;
  isInstalled: boolean;
  isEnabled: boolean;
  isCustom: boolean;
  
  // Metadata for imported/scanned fonts
  variableAxes?: string[];
  characterSupport?: string;
  languageSupport?: string[];
  license?: string;
  preview?: string; // sample text
  
  // Optional custom typography tree override
  typographyTree?: TypographyTree;
}

export interface AIRecommendation {
  recommendedPaletteId: string;
  recommendedFontId: string;
  compatibilityScore: number;
  readabilityScore: number;
  contrastScore: number;
  visualHarmonyScore: number;
  reason: string;
}

export interface ThemeAssetSettings {
  selectedPaletteId: string;
  selectedFontId: string;
  customPaletteOverrides?: Partial<ColorPalette>;
  customTypographyOverrides?: Partial<TypographyTree>;
  overrideMode: 'ai' | 'builtIn' | 'imported' | 'custom' | 'manual';
  aiRecommendation?: AIRecommendation;
}
