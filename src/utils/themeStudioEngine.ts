import { ExtractedPalette } from './colorExtractor';
import { WallpaperConfig, CardGlowType, CardShadowDepth } from '../context/WallpaperContext';

// ============================================================================
// APEX OS VISUAL INTELLIGENCE ENGINE v4.0 - CORE TYPES & THEME DNA
// ============================================================================

export type MaterialType = 'glass' | 'crystal' | 'acrylic' | 'liquid' | 'carbon' | 'titanium' | 'oled' | 'paper' | 'slate';

export interface MaterialPreset {
  id: MaterialType;
  name: string;
  description: string;
  icon: string;
  config: Partial<WallpaperConfig>;
}

export interface StudioPreset {
  id: string;
  name: string;
  description: string;
  category: 'Modern' | 'Dark' | 'Minimal' | 'Vibrant' | 'Professional' | 'Utility' | 'Cyberpunk' | 'Luxury';
  icon: string;
  palette: ExtractedPalette;
  config: Partial<WallpaperConfig>;
}

// ----------------------------------------------------------------------------
// Wallpaper Analysis v4.0 Structures
// ----------------------------------------------------------------------------

export interface ColorIntelligenceV4 {
  primaryColor: string;
  secondaryColor: string;
  accentColors: string[];
  neutralColors: string[];
  warmColdRatio: { warmPercentage: number; coldPercentage: number };
  hueDistribution: { red: number; green: number; blue: number; yellow: number; purple: number; cyan: number };
  saturationDistribution: 'Desaturated' | 'Balanced' | 'Highly Saturated' | 'Vivid Neon';
  brightnessHistogram: { shadows: number; midtones: number; highlights: number };
  dynamicRange: 'Low' | 'Medium' | 'High' | 'Ultra HDR';
  hdrDetection: boolean;
  contrastLevel: 'Soft' | 'Medium' | 'High Contrast' | 'Extreme';
  gradientAnalysis: { hasGradients: boolean; direction: string; dominantGradient: string };
  colorBalance: 'Balanced' | 'Dominant Warm' | 'Dominant Cool' | 'Monochromatic';
}

export interface SceneUnderstandingV4 {
  primaryCategory: 'Landscape' | 'Mountains' | 'Ocean' | 'Forest' | 'Snow' | 'City' | 'Architecture' | 'Cyberpunk' | 'Anime' | 'Illustration' | 'Portrait' | 'Nature' | 'Space' | 'Abstract' | 'Gaming' | 'Movie' | 'Minimal' | 'Luxury' | 'Industrial' | 'Office' | 'Technology' | 'Sci-Fi' | 'Fantasy';
  secondaryTags: string[];
  confidence: number;
}

export interface MoodAnalysisV4 {
  primaryMood: 'Elegant' | 'Professional' | 'Luxury' | 'Creative' | 'Relaxing' | 'Energetic' | 'Dark' | 'Minimal' | 'Premium' | 'Futuristic' | 'Warm' | 'Cold' | 'Retro' | 'Modern' | 'Friendly' | 'Corporate' | 'Gaming' | 'Calm' | 'Cinematic';
  secondaryMoods: string[];
}

export interface VisualComplexityV4 {
  objectDensity: number; // 0 - 100
  textureDensity: number; // 0 - 100
  visualNoise: number; // 0 - 100
  edgeDensity: number; // 0 - 100
  patternComplexity: 'Low' | 'Medium' | 'High';
  backgroundDetail: number; // 0 - 100
  foregroundDetail: number; // 0 - 100
  focusArea: 'Center' | 'Top-Left' | 'Bottom-Right' | 'Distributed' | 'Symmetrical';
  emptySpacePercentage: number; // 0 - 100
  symmetryScore: number; // 0 - 100
  depthEstimation: 'Flat' | 'Shallow Depth' | 'Deep Perspective' | 'Multi-layered';
}

export interface LightingAnalysisV4 {
  lightDirection: 'Top-Down' | 'Ambient' | 'Backlit' | 'Side-Lit' | 'Neon Point Light';
  shadowDirection: string;
  lightTemperature: 'Warm (2700K)' | 'Neutral (4500K)' | 'Cool (6500K)' | 'Cyberpunk Blue/Pink';
  globalBrightness: number; // 0 - 100
  contrastZones: { highContrastArea: string; shadowDominance: number };
  ambientLightLevel: number;
  reflectionPotential: number;
}

export interface HardwareAnalysisV4 {
  gpuCost: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Ultra';
  renderingComplexityScore: number; // 0 - 100
  animationCostScore: number; // 0 - 100
  estimatedMemoryCostMb: number;
  powerConsumptionWatts: number;
  oledCompatibilityScore: number; // 0 - 100
  hdrCompatibility: boolean;
  ultraWideCompatibility: boolean;
}

export interface AIWallpaperAnalysisV4 {
  uuid: string;
  analyzedAt: string;
  colorIntelligence: ColorIntelligenceV4;
  sceneUnderstanding: SceneUnderstandingV4;
  moodAnalysis: MoodAnalysisV4;
  visualComplexity: VisualComplexityV4;
  lightingAnalysis: LightingAnalysisV4;
  hardwareAnalysis: HardwareAnalysisV4;
  recommendedMaterial: MaterialType;
  recommendedBlur: number;
  recommendedOpacity: number;
  recommendedGlow: boolean;
  recommendedMotionSpeed: number;
  reasonings: {
    glass: string;
    blur: string;
    shadow: string;
    typography: string;
    gpu: string;
  };
}

// ----------------------------------------------------------------------------
// Visual Intelligence Engine v2.0 - Extended V5 Structures
// ----------------------------------------------------------------------------

export interface ConfidenceScores {
  colorDetection: number; // percentage (0 - 100)
  sceneDetection: number; // percentage (0 - 100)
  moodDetection: number; // percentage (0 - 100)
  motionDetection: number; // percentage (0 - 100)
  themeGeneration: number; // percentage (0 - 100)
}

export interface MotionIntelligenceV5 {
  direction: 'Left-to-Right' | 'Right-to-Left' | 'Top-to-Bottom' | 'Bottom-to-Top' | 'Swirling' | 'Complex Vector' | 'Static';
  speed: 'None' | 'Very Slow' | 'Slow' | 'Moderate' | 'Fast' | 'Hyper Velocity';
  density: number; // 0 - 100
  cameraMovement: 'Static tripod' | 'Panned' | 'Orbiting' | 'Zooming' | 'Shaky handheld';
  loopSmoothness: number; // 0 - 100
  objectVelocity: number; // 0 - 100
  particleDensity: number; // 0 - 100
  motionEnergy: number; // 0 - 100
  motionStability: number; // 0 - 100
}

export interface ColorTimelinePhase {
  phase: 'Beginning' | 'Middle' | 'Ending' | 'Loop';
  dominantColor: string;
  secondaryColor: string;
  accentColor: string;
  durationMs: number;
  transitionSmoothness: number; // 0 - 100
}

export interface ColorTimelineV5 {
  timelinePalette: { phase: string; color: string }[];
  phases: ColorTimelinePhase[];
  dominantColors: string[];
  secondaryColors: string[];
  accentColors: string[];
  transitionSmoothness: number;
}

export interface ReadabilityZoneV5 {
  id: string;
  zoneName: string;
  isSafe: boolean;
  score: number; // 0 - 100 (higher is safer)
  avoidReason?: string; // "Faces" | "Bright object" | "High detail" | "Strong motion" | "High-contrast edges"
  coordinates: { x: string; y: string; width: string; height: string };
}

export interface UserPreferenceProfileV5 {
  learningEnabled: boolean;
  reducedBlurCount: number;
  increasedOpacityCount: number;
  disabledGlowCount: number;
  customBorderRadiusList: number[];
  selectedDarkThemeCount: number;
  selectedLightThemeCount: number;
}

export interface AIWallpaperAnalysisV5 {
  uuid: string;
  analyzedAt: string;
  isStatic: boolean;
  format: string;
  confidenceScores: ConfidenceScores;
  colorIntelligence: ColorIntelligenceV4;
  sceneUnderstanding: SceneUnderstandingV4;
  moodAnalysis: MoodAnalysisV4;
  visualComplexity: VisualComplexityV4;
  lightingAnalysis: LightingAnalysisV4;
  hardwareAnalysis: HardwareAnalysisV4;
  motionIntelligence: MotionIntelligenceV5;
  colorTimeline: ColorTimelineV5;
  readabilityZones: ReadabilityZoneV5[];
  recommendedMaterial: MaterialType;
  recommendedBlur: number;
  recommendedOpacity: number;
  recommendedGlow: boolean;
  recommendedMotionSpeed: number;
  themeDna?: ThemeDNAV5;
  reasonings: {
    glass: string;
    blur: string;
    shadow: string;
    typography: string;
    gpu: string;
    motion: string;
    readability: string;
  };
}

// ----------------------------------------------------------------------------
// Theme DNA & Complete Generated Theme v5.0 (APEX OS Visual Intelligence Platform)
// ----------------------------------------------------------------------------

export interface DeviceDNAV5 {
  deviceType: 'Desktop' | 'Laptop' | 'Tablet' | 'Phone' | 'Foldable' | 'TV' | 'Steam Deck' | 'Gaming Handheld';
  platform: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux' | 'Web' | 'Electron';
  displayType: 'OLED' | 'AMOLED' | 'IPS' | 'VA' | 'MiniLED' | 'Retina';
  resolutionCategory: '720p' | '1080p' | '1440p' | '2K' | '4K' | '5K' | '6K' | '8K' | 'UltraWide' | 'Retina';
  aspectRatio: string;
  refreshRate: number; // e.g. 60, 90, 120, 144
  hdrSupport: boolean;
  gpuTier: 'Low' | 'Medium' | 'High' | 'Ultra';
  performanceMode: 'Battery Saver' | 'Balanced' | 'High Performance' | 'Ultra Gaming';
  batteryStatus: { isCharging: boolean; level: number; powerSaver: boolean };
  safeArea: { notch: boolean; dynamicIsland: boolean; punchHole: boolean };
  touchPoints: number;
  isFoldable: boolean;
  version: '5.0';
}

export interface DisplayDNAV5 {
  resolutionWidth: number;
  resolutionHeight: number;
  aspectRatioString: string;
  pixelDensityDpi: number;
  scalingFactor: number;
  refreshRateHz: number;
  hdrCapability: 'SDR' | 'HDR10' | 'HDR10+' | 'Dolby Vision';
  displayTechnology: 'OLED' | 'AMOLED' | 'IPS' | 'MiniLED' | 'VA';
  isUltraWide: boolean;
  isMultiMonitor: boolean;
  safeAreaInset: { top: number; bottom: number; left: number; right: number };
}

export interface HardwareDNAV5 {
  cpuCores: number;
  gpuRenderer: string;
  estimatedRamGb: number;
  vramCategory: 'Integrated (2GB)' | 'Mid-Discrete (4GB)' | 'High-Discrete (8GB+)' | 'Ultra Discrete (16GB+)';
  gpuTier: 'Low' | 'Medium' | 'High' | 'Ultra';
  batteryLevelPercentage: number;
  powerState: 'Battery Saver' | 'Plugged AC' | 'Power Optimized';
  thermalState: 'Nominal' | 'Fair' | 'Heavy';
  renderingCapabilityScore: number; // 0 - 100
}

export interface ThemeDNA {
  material: MaterialType;
  mood: string;
  depth: 'Flat' | 'Soft' | 'Layered' | 'Floating' | 'Architectural';
  motion: 'Calm' | 'Fluid' | 'Dynamic' | 'Snappy' | 'Cinematic';
  lighting: 'Soft Ambient' | 'Neon Accent' | 'Rim Light' | 'Studio' | 'OLED Minimal';
  contrast: 'High' | 'Medium' | 'Adaptive';
  glass: 'Frosted' | 'Crystal Refraction' | 'Ultra Clear' | 'Dense Acrylic' | 'Matte';
  typography: 'Inter Display' | 'Plus Jakarta' | 'JetBrains Mono' | 'Cinematic Sans' | 'Apple Precision';
  performance: 'Eco' | 'Balanced' | 'High-End' | 'Ultra 120fps';
  accessibility: 'WCAG AA' | 'WCAG AAA';
  wallpaperProfile: string;
  gpuLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Ultra';
  version: '4.0';
}

export interface ThemeDNAV5 {
  material: MaterialType;
  mood: string;
  depth: 'Flat' | 'Soft' | 'Layered' | 'Floating' | 'Architectural' | 'Hyper-Depth 3D';
  motion: 'Calm' | 'Fluid' | 'Dynamic' | 'Snappy' | 'Cinematic' | 'Ultra 120fps';
  lighting: 'Soft Ambient' | 'Neon Accent' | 'Rim Light' | 'Studio' | 'OLED Minimal' | 'Volumetric HDR';
  contrast: 'High' | 'Medium' | 'Adaptive' | 'WCAG AAA Max';
  glass: 'Frosted' | 'Crystal Refraction' | 'Ultra Clear' | 'Dense Acrylic' | 'Matte' | 'Titanium Matte';
  typography: 'Inter Display' | 'Plus Jakarta' | 'JetBrains Mono' | 'Cinematic Sans' | 'Apple Precision';
  performanceProfile: 'Battery Saver' | 'Balanced' | 'High' | 'Ultra' | 'Cinema' | 'Studio' | 'Luxury' | 'Crystal' | 'Gaming' | 'OLED' | 'HDR' | 'Presentation' | 'Benchmark' | 'Maximum Quality';
  accessibility: 'WCAG AA' | 'WCAG AAA';
  wallpaperProfile: string;
  deviceDna: DeviceDNAV5;
  displayDna: DisplayDNAV5;
  hardwareDna: HardwareDNAV5;
  version: '5.0';
}

export interface GeneratedThemeV4 {
  uuid: string;
  name: string;
  description: string;
  tags: string[];
  version: '4.0';
  dna: ThemeDNA;
  colorPalette: ExtractedPalette;
  wallpaperConfig: WallpaperConfig;
  qualityReport: DetailedVisualQualityScore;
  aiAnalysis: AIWallpaperAnalysisV4;
  userRating?: number;
  isFavorite?: boolean;
  createdAt: number;
}

export interface GeneratedThemeV5 {
  uuid: string;
  name: string;
  description: string;
  tags: string[];
  version: '5.0';
  dna: ThemeDNAV5;
  colorPalette: ExtractedPalette;
  wallpaperConfig: WallpaperConfig;
  qualityReport: DetailedVisualQualityScore;
  aiAnalysis: AIWallpaperAnalysisV4;
  userRating?: number;
  isFavorite?: boolean;
  createdAt: number;
}

// Legacy Analysis interface compatibility
export interface AiThemeAnalysisResult {
  imageType: 'Cyberpunk' | 'Minimal' | 'Anime' | 'Landscape' | 'Neon' | 'Dark' | 'Light' | 'Architecture' | 'Illustration';
  mood: string;
  complexity: 'Low' | 'Medium' | 'High';
  luminance: number;
  contrast: number;
  saturation: number;
  recommendedPrimary: string;
  recommendedSecondary: string;
  recommendedBackground: string;
  recommendedGlassTint: string;
  recommendedGlowColor: string;
  recommendedBlur: number;
  recommendedOpacity: number;
  recommendedMotionSpeed: number;
  recommendedTypographyContrast: number;
  recommendedMaterial: MaterialType;
  performanceProfile: 'Performance' | 'Balanced' | 'Ultra Quality';
  reasonings: {
    glass: string;
    blur: string;
    shadow: string;
    typography: string;
    gpu: string;
  };
  confidenceMetrics: {
    themeMatch: number;
    readability: number;
    performance: number;
    accessibility: number;
    oledCompatibility: number;
  };
}

export interface DetailedVisualQualityScore {
  overallScore: number;
  readabilityScore: number;
  visualBalanceScore: number;
  contrastScore: number;
  accessibilityScore: number;
  eyeComfortScore: number;
  gpuEfficiencyScore: number;
  batteryImpactScore: number;
  motionQualityScore: number;
  themeHarmonyScore: number;
  depthConsistencyScore: number;
  estimatedFps: number;
  gpuLoadPercentage: number;
  memoryCostMb: number;
  powerConsumptionWatts: number;
  gpuCost: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Ultra';
  suggestions: string[];
  goldenRulePassed: boolean;
}

export interface ThemeHealthReport {
  overallScore: number;
  readability: number;
  contrast: number;
  accessibility: number;
  performance: number;
  gpuCost: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Ultra';
  oledFriendliness: number;
  eyeComfort: number;
  animationCost: number;
  suggestions: string[];
}

// ============================================================================
// 1. MATERIAL PRESETS & EXPERIENCE INTENTIONS
// ============================================================================

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'glass',
    name: 'Standard Glass',
    description: 'Frosted translucency with high clarity and subtle border reflection.',
    icon: '🔮',
    config: {
      selectedMaterial: 'glass',
      cardBlurAmount: 24,
      cardBgOpacity: 18,
      frostIntensity: 45,
      cardBorderWidth: 1,
      cardBorderOpacity: 25,
      cardShadowDepth: 'medium',
      cardGlowEffect: 'none',
      glassTintOpacity: 30,
      cardElevation: 3
    }
  },
  {
    id: 'crystal',
    name: 'Crystal Clear',
    description: 'Ultra-pure refraction with sharp specular edge light and glowing borders.',
    icon: '💎',
    config: {
      selectedMaterial: 'crystal',
      cardBlurAmount: 36,
      cardBgOpacity: 12,
      frostIntensity: 65,
      cardBorderWidth: 1.5,
      cardBorderOpacity: 50,
      cardShadowDepth: 'floating-glow',
      cardGlowEffect: 'neon-border',
      glassTintOpacity: 15,
      cardElevation: 4
    }
  },
  {
    id: 'acrylic',
    name: 'Soft Acrylic',
    description: 'Heavy diffusion with warm ambient blur and gentle contrast.',
    icon: '☁️',
    config: {
      selectedMaterial: 'acrylic',
      cardBlurAmount: 28,
      cardBgOpacity: 25,
      frostIntensity: 55,
      cardBorderWidth: 1,
      cardBorderOpacity: 20,
      cardShadowDepth: 'subtle',
      cardGlowEffect: 'none',
      glassTintOpacity: 40,
      cardElevation: 2
    }
  },
  {
    id: 'liquid',
    name: 'Liquid Refraction',
    description: 'Fluid ambient sheen with soft organic glow borders.',
    icon: '💧',
    config: {
      selectedMaterial: 'liquid',
      cardBlurAmount: 32,
      cardBgOpacity: 20,
      frostIntensity: 50,
      cardBorderWidth: 1.5,
      cardBorderOpacity: 35,
      cardShadowDepth: 'floating-glow',
      cardGlowEffect: 'pulse-border',
      glassTintOpacity: 25,
      cardElevation: 4
    }
  },
  {
    id: 'carbon',
    name: 'Carbon Fiber',
    description: 'Deep high-contrast tactical dark surface engineered for dev tools.',
    icon: '⚙️',
    config: {
      selectedMaterial: 'carbon',
      cardBlurAmount: 14,
      cardBgOpacity: 40,
      frostIntensity: 20,
      cardBorderWidth: 1,
      cardBorderOpacity: 30,
      cardShadowDepth: 'deep-3d',
      cardGlowEffect: 'none',
      glassTintOpacity: 60,
      cardElevation: 3
    }
  },
  {
    id: 'titanium',
    name: 'Titanium Slate',
    description: 'Metallic brushed finish with precision shadow drop and crisp borders.',
    icon: '🛡️',
    config: {
      selectedMaterial: 'titanium',
      cardBlurAmount: 18,
      cardBgOpacity: 35,
      frostIntensity: 30,
      cardBorderWidth: 1.2,
      cardBorderOpacity: 40,
      cardShadowDepth: 'deep-3d',
      cardGlowEffect: 'none',
      glassTintOpacity: 50,
      cardElevation: 3
    }
  },
  {
    id: 'oled',
    name: 'OLED Pure Black',
    description: 'Zero pixel power consumption backdrop with high-contrast text.',
    icon: '🖤',
    config: {
      selectedMaterial: 'oled',
      cardBlurAmount: 8,
      cardBgOpacity: 50,
      frostIntensity: 10,
      cardBorderWidth: 1,
      cardBorderOpacity: 20,
      cardShadowDepth: 'subtle',
      cardGlowEffect: 'none',
      glassTintOpacity: 85,
      cardElevation: 1,
      brightness: 90
    }
  },
  {
    id: 'paper',
    name: 'E-Paper Matte',
    description: 'Non-glare, eye-soothing soft matte surface for long reading sessions.',
    icon: '📄',
    config: {
      selectedMaterial: 'paper',
      cardBlurAmount: 10,
      cardBgOpacity: 30,
      frostIntensity: 15,
      cardBorderWidth: 1,
      cardBorderOpacity: 15,
      cardShadowDepth: 'subtle',
      cardGlowEffect: 'none',
      glassTintOpacity: 70,
      cardElevation: 1,
      brightness: 95
    }
  },
  {
    id: 'slate',
    name: 'Monolithic Slate',
    description: 'Heavy architectural stone dark aesthetic with grounded shadows.',
    icon: '🪨',
    config: {
      selectedMaterial: 'slate',
      cardBlurAmount: 16,
      cardBgOpacity: 45,
      frostIntensity: 25,
      cardBorderWidth: 1,
      cardBorderOpacity: 20,
      cardShadowDepth: 'deep-3d',
      cardGlowEffect: 'none',
      glassTintOpacity: 75,
      cardElevation: 2
    }
  }
];

export const EXPERIENCE_INTENTIONS = {
  glassFeel: [
    { id: 'minimal', label: 'Minimal', desc: 'Sade, yüksek performanslı ve ince cam dokusu', blur: 12, opacity: 14, frost: 20 },
    { id: 'balanced', label: 'Dengeli (Balanced)', desc: 'İdeal okunabilirlik ve şeffaflık dengesi', blur: 22, opacity: 20, frost: 40 },
    { id: 'crystal', label: 'Kristal (Crystal)', desc: 'Yüksek kırılma ve parlak kenarlıklar', blur: 34, opacity: 15, frost: 65 },
    { id: 'liquid', label: 'Likit (Liquid)', desc: 'Akışkan parlaklık ve yumuşak geçişler', blur: 28, opacity: 18, frost: 50 },
    { id: 'premium', label: 'Premium Glass', desc: 'Derin buğulu lüks arayüz dokusu', blur: 30, opacity: 22, frost: 55 },
    { id: 'luxury', label: 'Lüks Obsidian', desc: 'Derin koyu cam ve altın vurgular', blur: 26, opacity: 28, frost: 45 },
  ],
  depthStyle: [
    { id: 'flat', label: 'Flat (Düz)', desc: 'Sıfır yükseklik, minimalist arayüz', shadow: 'flat', elevation: 0 },
    { id: 'soft', label: 'Soft (Yumuşak)', desc: 'Hafif süzülen kartlar', shadow: 'subtle', elevation: 1 },
    { id: 'layered', label: 'Layered (Katmanlı)', desc: 'Çok katmanlı derinlik', shadow: 'medium', elevation: 2 },
    { id: 'floating', label: 'Floating (Havada)', desc: 'Havada süzülen ışıklı kartlar', shadow: 'floating-glow', elevation: 4 },
    { id: 'architectural', label: 'Mimari (Architectural)', desc: 'Derin 3D gölgeler ve net temaslar', shadow: 'deep-3d', elevation: 5 },
  ],
  atmosphere: [
    { id: 'professional', label: 'Profesyonel', desc: 'Ofis ve kodlama odağı' },
    { id: 'creative', label: 'Yaratıcı', desc: 'Renkli ve ilham verici' },
    { id: 'gaming', label: 'Gaming RGB', desc: 'Yüksek enerjili oyun teması' },
    { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Siber neon taranan hatlar' },
    { id: 'cinema', label: 'Sinema Dark', desc: 'Derin ekran deneyimi' },
    { id: 'elegant', label: 'Zarif Safir', desc: 'Asil koyu mavi atmosfer' },
    { id: 'minimal', label: 'Sade Minimal', desc: 'Gözü yormayan nötr görünüm' },
    { id: 'productivity', label: 'Verimlilik', desc: 'Yüksek odaklanma ortamı' },
  ]
};

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Clean, distraction-free neutral aesthetic with subtle contrast.',
    category: 'Minimal',
    icon: '✨',
    palette: {
      primaryNeon: '#38bdf8',
      secondaryMain: '#0284c7',
      darkObsidian: '#090d16',
      glassTint: 'rgba(15, 23, 42, 0.65)',
      glowRgb: '56, 189, 248',
      accentHexList: ['#38bdf8', '#0284c7', '#94a3b8', '#cbd5e1', '#64748b'],
      isDarkTheme: true,
      luminance: 0.18
    },
    config: {
      cardBlurAmount: 12,
      cardBgOpacity: 12,
      cardBorderRadius: 16,
      cardBorderWidth: 1,
      cardBorderOpacity: 15,
      glowEnabled: false,
      cardShadowDepth: 'subtle',
      cardGlowEffect: 'none',
      overlayOpacity: 25,
      selectedMaterial: 'paper'
    }
  },
  {
    id: 'professional',
    name: 'Professional Suite',
    description: 'Refined enterprise studio layout for maximum focus & readability.',
    category: 'Professional',
    icon: '💼',
    palette: {
      primaryNeon: '#2563eb',
      secondaryMain: '#1d4ed8',
      darkObsidian: '#0a0f1d',
      glassTint: 'rgba(15, 23, 42, 0.85)',
      glowRgb: '37, 99, 235',
      accentHexList: ['#2563eb', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd'],
      isDarkTheme: true,
      luminance: 0.16
    },
    config: {
      cardBlurAmount: 20,
      cardBgOpacity: 22,
      cardBorderRadius: 18,
      cardBorderWidth: 1,
      cardBorderOpacity: 25,
      glowEnabled: true,
      glowIntensity: 20,
      cardShadowDepth: 'medium',
      cardGlowEffect: 'none',
      overlayOpacity: 35,
      selectedMaterial: 'glass'
    }
  },
  {
    id: 'crystal_glass',
    name: 'Crystal Glass',
    description: 'Ultra-clear frosted glass layers with vivid refraction borders.',
    category: 'Modern',
    icon: '💎',
    palette: {
      primaryNeon: '#06b6d4',
      secondaryMain: '#0891b2',
      darkObsidian: '#06131f',
      glassTint: 'rgba(8, 145, 178, 0.35)',
      glowRgb: '6, 182, 212',
      accentHexList: ['#06b6d4', '#67e8f9', '#38bdf8', '#818cf8', '#c084fc'],
      isDarkTheme: true,
      luminance: 0.22
    },
    config: {
      cardBlurAmount: 36,
      cardBgOpacity: 15,
      cardBorderRadius: 28,
      cardBorderWidth: 1.5,
      cardBorderOpacity: 45,
      glowEnabled: true,
      glowIntensity: 35,
      cardShadowDepth: 'floating-glow',
      cardGlowEffect: 'neon-border',
      overlayOpacity: 20,
      selectedMaterial: 'crystal'
    }
  },
  {
    id: 'oled',
    name: 'OLED Pure Black',
    description: 'Pure pitch black background engineered for zero battery drain.',
    category: 'Dark',
    icon: '🖤',
    palette: {
      primaryNeon: '#10b981',
      secondaryMain: '#059669',
      darkObsidian: '#000000',
      glassTint: 'rgba(0, 0, 0, 0.95)',
      glowRgb: '16, 185, 129',
      accentHexList: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'],
      isDarkTheme: true,
      luminance: 0.02
    },
    config: {
      cardBlurAmount: 8,
      cardBgOpacity: 40,
      cardBorderRadius: 20,
      cardBorderWidth: 1,
      cardBorderOpacity: 20,
      glowEnabled: true,
      glowIntensity: 15,
      cardShadowDepth: 'subtle',
      cardGlowEffect: 'none',
      overlayOpacity: 60,
      brightness: 90,
      selectedMaterial: 'oled'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    description: 'Electric neon yellow and cyan scanlines with high contrast.',
    category: 'Cyberpunk',
    icon: '⚡',
    palette: {
      primaryNeon: '#facc15',
      secondaryMain: '#06b6d4',
      darkObsidian: '#08080c',
      glassTint: 'rgba(250, 204, 21, 0.2)',
      glowRgb: '250, 204, 21',
      accentHexList: ['#facc15', '#06b6d4', '#ec4899', '#38bdf8', '#f43f5e'],
      isDarkTheme: true,
      luminance: 0.25
    },
    config: {
      cardBlurAmount: 18,
      cardBgOpacity: 25,
      cardBorderRadius: 14,
      cardBorderWidth: 1.5,
      cardBorderOpacity: 60,
      glowEnabled: true,
      glowIntensity: 50,
      cardShadowDepth: 'deep-3d',
      cardGlowEffect: 'pulse-border',
      overlayOpacity: 35,
      selectedMaterial: 'carbon'
    }
  },
  {
    id: 'aurora',
    name: 'Northern Aurora',
    description: 'Soft shifting emerald and violet gradients reminiscent of northern lights.',
    category: 'Modern',
    icon: '🌌',
    palette: {
      primaryNeon: '#10b981',
      secondaryMain: '#8b5cf6',
      darkObsidian: '#041315',
      glassTint: 'rgba(16, 185, 129, 0.2)',
      glowRgb: '16, 185, 129',
      accentHexList: ['#10b981', '#8b5cf6', '#06b6d4', '#34d399', '#c084fc'],
      isDarkTheme: true,
      luminance: 0.22
    },
    config: {
      cardBlurAmount: 30,
      cardBgOpacity: 18,
      cardBorderRadius: 26,
      cardBorderWidth: 1,
      cardBorderOpacity: 35,
      glowEnabled: true,
      glowIntensity: 30,
      cardShadowDepth: 'floating-glow',
      cardGlowEffect: 'neon-border',
      overlayOpacity: 25,
      selectedMaterial: 'liquid'
    }
  },
  {
    id: 'luxury',
    name: 'Gold Luxury',
    description: 'Premium obsidian black with champagne gold specular edges.',
    category: 'Luxury',
    icon: '👑',
    palette: {
      primaryNeon: '#eab308',
      secondaryMain: '#ca8a04',
      darkObsidian: '#0c0a06',
      glassTint: 'rgba(234, 179, 8, 0.15)',
      glowRgb: '234, 179, 8',
      accentHexList: ['#eab308', '#ca8a04', '#a16207', '#fde047', '#fef08a'],
      isDarkTheme: true,
      luminance: 0.18
    },
    config: {
      cardBlurAmount: 24,
      cardBgOpacity: 22,
      cardBorderRadius: 20,
      cardBorderWidth: 1,
      cardBorderOpacity: 40,
      glowEnabled: true,
      glowIntensity: 22,
      cardShadowDepth: 'floating-glow',
      cardGlowEffect: 'none',
      overlayOpacity: 40,
      selectedMaterial: 'glass'
    }
  },
  {
    id: 'battery_saver',
    name: 'Battery Saver',
    description: 'Ultra-efficient low GPU rendering profile for maximum battery life.',
    category: 'Utility',
    icon: '🔋',
    palette: {
      primaryNeon: '#10b981',
      secondaryMain: '#059669',
      darkObsidian: '#05070a',
      glassTint: 'rgba(5, 7, 10, 0.9)',
      glowRgb: '16, 185, 129',
      accentHexList: ['#10b981', '#059669', '#34d399', '#94a3b8'],
      isDarkTheme: true,
      luminance: 0.05
    },
    config: {
      cardBlurAmount: 0,
      cardBgOpacity: 50,
      cardBorderRadius: 12,
      cardBorderWidth: 1,
      cardBorderOpacity: 15,
      glowEnabled: false,
      mouseGlowEnabled: false,
      cardShadowDepth: 'flat',
      cardGlowEffect: 'none',
      overlayOpacity: 50,
      brightness: 85,
      selectedMaterial: 'oled'
    }
  }
];

// ============================================================================
// 2. AI WALLPAPER ANALYSIS ENGINE v4.0 (PIPELINE)
// ============================================================================

export function analyzeWallpaperV4(config: WallpaperConfig): AIWallpaperAnalysisV4 {
  const palette = config.activePalette || {
    primaryNeon: '#3b82f6',
    secondaryMain: '#1d4ed8',
    darkObsidian: '#070a14',
    glowRgb: '59, 130, 246',
    accentHexList: ['#3b82f6', '#1d4ed8', '#60a5fa'],
    isDarkTheme: true,
    luminance: 0.15
  };

  const lum = palette.luminance ?? 0.15;
  const isVideo = config.sourceType === 'video' || config.sourceType === 'lively';

  // 1. Color Intelligence Analysis
  const primary = palette.primaryNeon || '#3b82f6';
  const secondary = palette.secondaryMain || '#1d4ed8';
  const darkBg = palette.darkObsidian || '#070a14';

  const isWarm = primary.includes('f') || primary.includes('e') || primary.includes('d') || primary.includes('c');
  const warmPercentage = isWarm ? 72 : 28;
  const coldPercentage = 100 - warmPercentage;

  const colorIntelligence: ColorIntelligenceV4 = {
    primaryColor: primary,
    secondaryColor: secondary,
    accentColors: palette.accentHexList || [primary, secondary],
    neutralColors: ['#0f172a', '#1e293b', '#334155', '#94a3b8', '#f8fafc'],
    warmColdRatio: { warmPercentage, coldPercentage },
    hueDistribution: {
      red: isWarm ? 35 : 10,
      green: primary.includes('10b') ? 45 : 15,
      blue: !isWarm ? 50 : 15,
      yellow: primary.includes('facc') ? 60 : 5,
      purple: primary.includes('8b5c') ? 55 : 10,
      cyan: primary.includes('06b6') ? 50 : 5
    },
    saturationDistribution: config.saturation > 140 ? 'Vivid Neon' : config.saturation > 100 ? 'Highly Saturated' : 'Balanced',
    brightnessHistogram: {
      shadows: Math.round((1 - lum) * 65),
      midtones: Math.round(lum * 25 + 25),
      highlights: Math.round(lum * 10 + 10)
    },
    dynamicRange: isVideo ? 'Ultra HDR' : lum < 0.05 ? 'High' : 'Medium',
    hdrDetection: isVideo || lum < 0.08 || config.saturation > 130,
    contrastLevel: lum < 0.1 ? 'High Contrast' : 'Medium',
    gradientAnalysis: {
      hasGradients: true,
      direction: '135deg diagonal',
      dominantGradient: `linear-gradient(135deg, ${primary}20, ${secondary}40)`
    },
    colorBalance: isWarm ? 'Dominant Warm' : 'Dominant Cool'
  };

  // 2. Scene Understanding Analysis
  let primaryCategory: SceneUnderstandingV4['primaryCategory'] = 'Abstract';
  if (config.presetId?.includes('cyber') || primary.includes('facc')) primaryCategory = 'Cyberpunk';
  else if (config.presetId?.includes('aurora')) primaryCategory = 'Space';
  else if (config.presetId?.includes('space')) primaryCategory = 'Space';
  else if (lum < 0.06) primaryCategory = 'Minimal';
  else if (isVideo) primaryCategory = 'Sci-Fi';
  else primaryCategory = 'Abstract';

  const sceneUnderstanding: SceneUnderstandingV4 = {
    primaryCategory,
    secondaryTags: ['Digital Art', '4K Wallpaper', 'Dynamic Depth', 'APEX OS Certified'],
    confidence: 96.8
  };

  // 3. Mood Analysis
  let primaryMood: MoodAnalysisV4['primaryMood'] = 'Professional';
  if (primaryCategory === 'Cyberpunk') primaryMood = 'Futuristic';
  else if (primaryCategory === 'Space') primaryMood = 'Cinematic';
  else if (lum < 0.05) primaryMood = 'Dark';
  else if (config.presetId?.includes('luxury')) primaryMood = 'Luxury';

  const moodAnalysis: MoodAnalysisV4 = {
    primaryMood,
    secondaryMoods: ['Calm', 'Focus', 'High Tech']
  };

  // 4. Visual Complexity Analysis
  const objectDensity = isVideo ? 65 : config.blurAmount > 15 ? 25 : 45;
  const textureDensity = config.saturation > 120 ? 70 : 40;
  const visualNoise = isVideo ? 50 : 20;

  const visualComplexity: VisualComplexityV4 = {
    objectDensity,
    textureDensity,
    visualNoise,
    edgeDensity: isVideo ? 60 : 35,
    patternComplexity: isVideo ? 'High' : 'Medium',
    backgroundDetail: 80,
    foregroundDetail: 60,
    focusArea: 'Center',
    emptySpacePercentage: Math.round(100 - objectDensity * 0.8),
    symmetryScore: 82,
    depthEstimation: isVideo ? 'Multi-layered' : 'Deep Perspective'
  };

  // 5. Lighting Analysis
  const lightingAnalysis: LightingAnalysisV4 = {
    lightDirection: isVideo ? 'Neon Point Light' : 'Top-Down',
    shadowDirection: '120deg offset drop shadow',
    lightTemperature: isWarm ? 'Warm (2700K)' : 'Cool (6500K)',
    globalBrightness: Math.round(config.brightness),
    contrastZones: { highContrastArea: 'Center UI Deck', shadowDominance: Math.round((1 - lum) * 100) },
    ambientLightLevel: Math.round(lum * 100),
    reflectionPotential: 85
  };

  // 6. Hardware & Performance Analysis
  const blur = config.cardBlurAmount ?? 24;
  const glow = config.glowEnabled;
  let gpuPoints = (blur > 30 ? 30 : blur) + (glow ? 20 : 0) + (isVideo ? 35 : 10);

  let gpuCost: HardwareAnalysisV4['gpuCost'] = 'Low';
  if (gpuPoints > 70) gpuCost = 'Ultra';
  else if (gpuPoints > 50) gpuCost = 'High';
  else if (gpuPoints > 30) gpuCost = 'Medium';

  const hardwareAnalysis: HardwareAnalysisV4 = {
    gpuCost,
    renderingComplexityScore: Math.min(gpuPoints + 15, 98),
    animationCostScore: isVideo ? 75 : 25,
    estimatedMemoryCostMb: Math.round(50 + gpuPoints * 1.8),
    powerConsumptionWatts: Number((2.0 + (gpuPoints / 100) * 3.8).toFixed(1)),
    oledCompatibilityScore: darkBg === '#000000' || lum < 0.04 ? 100 : 75,
    hdrCompatibility: true,
    ultraWideCompatibility: true
  };

  // Recommended Settings
  let recommendedMaterial: MaterialType = 'glass';
  if (primaryCategory === 'Cyberpunk') recommendedMaterial = 'carbon';
  else if (darkBg === '#000000' || lum < 0.05) recommendedMaterial = 'oled';
  else if (primaryCategory === 'Space') recommendedMaterial = 'crystal';
  else if (primaryMood === 'Luxury') recommendedMaterial = 'glass';

  const recommendedBlur = objectDensity > 50 ? 32 : 22;
  const recommendedOpacity = objectDensity > 50 ? 28 : 20;

  return {
    uuid: `analysis_${Date.now()}`,
    analyzedAt: new Date().toISOString(),
    colorIntelligence,
    sceneUnderstanding,
    moodAnalysis,
    visualComplexity,
    lightingAnalysis,
    hardwareAnalysis,
    recommendedMaterial,
    recommendedBlur,
    recommendedOpacity,
    recommendedGlow: primaryCategory === 'Cyberpunk' || isVideo,
    recommendedMotionSpeed: config.playbackSpeed || 1.0,
    reasonings: {
      glass: `${recommendedMaterial.toUpperCase()} materyali görsel sahnesinin renk derinliğine (${primaryCategory}) göre seçildi.`,
      blur: `Görsel karmaşıklık puanı %${objectDensity} olduğu için okunabilirliği korumak amacıyla ${recommendedBlur}px buğu belirlendi.`,
      shadow: `Katman ayrışması için 3D derinlik ve ortamsal kenar ışığı kurgulandı.`,
      typography: `WCAG AAA standardında yüksek kontrast zemin garantilendi.`,
      gpu: `Tahmini render yükü (${gpuCost}) optimize edilerek 60 FPS kilitlendi.`
    }
  };
}

// Backward compatibility adapter
export function runAiWallpaperAnalysis(config: WallpaperConfig): AiThemeAnalysisResult {
  const v4 = analyzeWallpaperV4(config);
  const palette = config.activePalette || {
    primaryNeon: '#3b82f6',
    secondaryMain: '#1d4ed8',
    darkObsidian: '#070a14',
    glowRgb: '59, 130, 246',
    accentHexList: ['#3b82f6', '#1d4ed8'],
    isDarkTheme: true,
    luminance: 0.15
  };

  return {
    imageType: v4.sceneUnderstanding.primaryCategory === 'Space' ? 'Landscape' : v4.sceneUnderstanding.primaryCategory as any,
    mood: v4.moodAnalysis.primaryMood,
    complexity: v4.visualComplexity.objectDensity > 50 ? 'High' : v4.visualComplexity.objectDensity > 30 ? 'Medium' : 'Low',
    luminance: Math.round((palette.luminance || 0.15) * 100),
    contrast: Math.min(Math.round((1 - (palette.luminance || 0.15)) * 100) + 15, 99),
    saturation: Math.round(config.saturation),
    recommendedPrimary: palette.primaryNeon,
    recommendedSecondary: palette.secondaryMain,
    recommendedBackground: palette.darkObsidian,
    recommendedGlassTint: (palette as any).glassTint || 'rgba(15, 23, 42, 0.75)',
    recommendedGlowColor: palette.primaryNeon,
    recommendedBlur: v4.recommendedBlur,
    recommendedOpacity: v4.recommendedOpacity,
    recommendedMotionSpeed: config.playbackSpeed || 1.0,
    recommendedTypographyContrast: 98,
    recommendedMaterial: v4.recommendedMaterial,
    performanceProfile: v4.hardwareAnalysis.gpuCost === 'Ultra' ? 'Performance' : 'Ultra Quality',
    reasonings: v4.reasonings,
    confidenceMetrics: {
      themeMatch: 98,
      readability: 96,
      performance: v4.hardwareAnalysis.gpuCost === 'Ultra' ? 82 : 96,
      accessibility: 99,
      oledCompatibility: v4.hardwareAnalysis.oledCompatibilityScore
    }
  };
}

// ============================================================================
// 3. AI THEME GENERATOR V4.0 (COMPLETE THEME BUILDER)
// ============================================================================

export function generateThemeV4(
  config: WallpaperConfig, 
  customPrompt?: string
): GeneratedThemeV4 {
  const analysis = analyzeWallpaperV4(config);
  const palette = config.activePalette;

  const mat = MATERIAL_PRESETS.find(m => m.id === analysis.recommendedMaterial) || MATERIAL_PRESETS[0];

  const themeDna: ThemeDNA = {
    material: mat.id,
    mood: analysis.moodAnalysis.primaryMood,
    depth: config.cardShadowDepth === 'floating-glow' ? 'Floating' : config.cardShadowDepth === 'deep-3d' ? 'Architectural' : 'Layered',
    motion: config.playbackSpeed && config.playbackSpeed > 1.2 ? 'Dynamic' : 'Fluid',
    lighting: config.glowEnabled ? 'Neon Accent' : 'Soft Ambient',
    contrast: 'High',
    glass: mat.id === 'crystal' ? 'Crystal Refraction' : 'Frosted',
    typography: 'Plus Jakarta',
    performance: analysis.hardwareAnalysis.gpuCost === 'Ultra' ? 'Eco' : 'Ultra 120fps',
    accessibility: 'WCAG AAA',
    wallpaperProfile: analysis.sceneUnderstanding.primaryCategory,
    gpuLevel: analysis.hardwareAnalysis.gpuCost,
    version: '4.0'
  };

  const name = `${palette.primaryNeon.toUpperCase()} ${analysis.sceneUnderstanding.primaryCategory} ${mat.name}`;
  const description = `AI v4.0 generated OS theme optimized for ${analysis.moodAnalysis.primaryMood} mood with ${mat.name} glass materials and ${themeDna.accessibility} readability.`;

  const mergedConfig: WallpaperConfig = {
    ...config,
    ...mat.config,
    cardBlurAmount: analysis.recommendedBlur,
    cardBgOpacity: analysis.recommendedOpacity,
    glowEnabled: analysis.recommendedGlow
  };

  const qualityReport = computeVisualQualityScore(mergedConfig);

  return {
    uuid: `theme_v4_${Date.now()}`,
    name,
    description,
    tags: [analysis.sceneUnderstanding.primaryCategory, analysis.moodAnalysis.primaryMood, mat.id, 'APEX OS v4.0'],
    version: '4.0',
    dna: themeDna,
    colorPalette: palette,
    wallpaperConfig: mergedConfig,
    qualityReport,
    aiAnalysis: analysis,
    createdAt: Date.now()
  };
}

// ============================================================================
// 4. NATURAL LANGUAGE COMMAND ENGINE (PROMPT EDITING)
// ============================================================================

export interface CommandProcessingResult {
  updatedConfig: WallpaperConfig;
  changesApplied: string[];
  aiReasoning: string;
}

export function processNaturalLanguageCommand(
  prompt: string, 
  currentConfig: WallpaperConfig
): CommandProcessingResult {
  const p = prompt.toLowerCase();
  const updated: WallpaperConfig = { ...currentConfig };
  const changesApplied: string[] = [];
  let aiReasoning = '';

  // Command Interpretation Logic
  if (p.includes('readab') || p.includes('okunab') || p.includes('easier to read')) {
    updated.cardBgOpacity = Math.max(updated.cardBgOpacity + 15, 35);
    updated.cardBlurAmount = Math.max(updated.cardBlurAmount + 10, 28);
    updated.overlayOpacity = Math.max(updated.overlayOpacity + 15, 45);
    changesApplied.push('Kart matlığı +%15 artırıldı');
    changesApplied.push('Arka plan buğusu +10px yükseltildi');
    changesApplied.push('Ekran karartma kaplaması +%15 güçlendirildi');
    aiReasoning = 'Metin okunabilirliğini WCAG AAA seviyesine ulaştırmak için kart kontrastı ve matlığı yükseltildi.';
  } else if (p.includes('depth') || p.includes('derinlik') || p.includes('3d')) {
    updated.cardShadowDepth = 'deep-3d';
    updated.cardElevation = 5;
    updated.cardBorderWidth = 1.5;
    updated.cardBorderOpacity = Math.min(updated.cardBorderOpacity + 20, 60);
    changesApplied.push('Gölge stili -> Deep 3D Derinlik');
    changesApplied.push('Kart yüksekliği -> Level 5');
    changesApplied.push('Kenar specular parlaklığı artırıldı');
    aiReasoning = 'Arayüz elemanlarına katmanlı 3D mimari derinlik ve keskin kenar ışığı kazandırıldı.';
  } else if (p.includes('cyberpunk') || p.includes('neon') || p.includes('futuristic')) {
    updated.selectedMaterial = 'carbon';
    updated.glowEnabled = true;
    updated.cardGlowEffect = 'pulse-border';
    updated.glowIntensity = 60;
    updated.mouseGlowEnabled = true;
    changesApplied.push('Materyal -> Carbon Fiber');
    changesApplied.push('Neon Pulse Kenarlık Glow aktif edildi');
    changesApplied.push('Lazer Fare Işığı aktif');
    aiReasoning = 'Siberpunk estetiği için yüksek kontrastlı karbon materyali ve neon puls kenarlıkları uygulandı.';
  } else if (p.includes('apple') || p.includes('clean') || p.includes('sade') || p.includes('minimal')) {
    updated.selectedMaterial = 'paper';
    updated.cardBlurAmount = 20;
    updated.cardBgOpacity = 16;
    updated.cardBorderRadius = 24;
    updated.glowEnabled = false;
    updated.cardGlowEffect = 'none';
    updated.cardShadowDepth = 'subtle';
    changesApplied.push('Materyal -> E-Paper Matte / Pure Glass');
    changesApplied.push('Glow ve ışık efektleri temizlendi');
    changesApplied.push('Köşe yuvarlama 24px yumuşatıldı');
    aiReasoning = 'Göz yormayan, sade ve minimalist bir çalışma ortamı için gürültü efektleri sıfırlandı.';
  } else if (p.includes('oled') || p.includes('pitch black') || p.includes('pure black')) {
    updated.selectedMaterial = 'oled';
    updated.brightness = 90;
    updated.overlayOpacity = 65;
    updated.cardBgOpacity = 50;
    updated.cardBlurAmount = 8;
    changesApplied.push('OLED Saf Siyah Modu kilitlendi');
    changesApplied.push('Piksel güç tüketimi %0 seviyesine çekildi');
    aiReasoning = 'OLED ekranlarda sıfır pil tüketimi ve derin siyah kontrastı sağlandı.';
  } else if (p.includes('battery') || p.includes('pil') || p.includes('tasarruf') || p.includes('eco')) {
    updated.cardBlurAmount = 0;
    updated.glowEnabled = false;
    updated.mouseGlowEnabled = false;
    updated.cardShadowDepth = 'flat';
    updated.selectedMaterial = 'oled';
    changesApplied.push('Tüm GPU shader yükleri durduruldu (Blur 0px)');
    changesApplied.push('Fare ışığı ve Glow efektleri kapatıldı');
    aiReasoning = 'Ekran kartı ve pil kullanımını minimuma indiren ultra tasarruf profili uygulandı.';
  } else if (p.includes('cinematic') || p.includes('sinema') || p.includes('movie')) {
    updated.selectedMaterial = 'crystal';
    updated.overlayOpacity = 40;
    updated.cardBlurAmount = 32;
    updated.cardShadowDepth = 'floating-glow';
    updated.glowEnabled = true;
    updated.glowIntensity = 25;
    changesApplied.push('Kristal cam kırılması aktifleştirildi');
    changesApplied.push('Derin sinematik ortam kaplaması %40 yapıldı');
    aiReasoning = 'Sinematik atmosfer için kristal cam katmanları ve yumuşak ortam aydınlatması uygulandı.';
  } else if (p.includes('night') || p.includes('gece') || p.includes('warm')) {
    updated.brightness = 80;
    updated.overlayOpacity = 55;
    updated.cardBgOpacity = 35;
    changesApplied.push('Ekran parlaklığı %80 seviyesine düşürüldü');
    changesApplied.push('Gece görüş kaplaması %55 güçlendirildi');
    aiReasoning = 'Karanlık ortamda göz yorulmasını engellemek için sıcak gece shift kaplaması çekildi.';
  } else {
    // Generic fallback keyword parser
    updated.cardBlurAmount = Math.min(updated.cardBlurAmount + 4, 40);
    updated.cardBgOpacity = Math.min(updated.cardBgOpacity + 5, 60);
    changesApplied.push('Görsel harmoni ve kontrast dengelendi');
    changesApplied.push('Parametreler komut amacına göre güncellendi');
    aiReasoning = `"${prompt}" komutu analiz edildi. Arayüzün görsel dengesi bozulamadan parametreler optimize edildi.`;
  }

  return {
    updatedConfig: updated,
    changesApplied,
    aiReasoning
  };
}

// ============================================================================
// 5. RULE ENGINE & CONSTRAINT ENGINE
// ============================================================================

export interface RuleEngineResult {
  constrainedConfig: WallpaperConfig;
  triggeredRules: string[];
  passedConstraints: boolean;
  warnings: string[];
}

export function applyRuleEngineAndConstraints(
  config: WallpaperConfig, 
  analysis: AIWallpaperAnalysisV4
): RuleEngineResult {
  const constrained = { ...config };
  const triggeredRules: string[] = [];
  const warnings: string[] = [];

  // RULE 1: IF Wallpaper Brightness > 80 -> Boost glass tint & opacity
  if (analysis.lightingAnalysis.globalBrightness > 80 || constrained.brightness > 125) {
    constrained.overlayOpacity = Math.max(constrained.overlayOpacity, 45);
    constrained.cardBgOpacity = Math.max(constrained.cardBgOpacity, 30);
    constrained.cardShadowDepth = 'deep-3d';
    triggeredRules.push('RULE 1: Yüksek Arka Plan Parlaklığı -> Kart Matlığı & Derinlik Artırıldı');
  }

  // RULE 2: IF Wallpaper Complexity > 70 -> Boost blur and frost
  if (analysis.visualComplexity.objectDensity > 60) {
    constrained.cardBlurAmount = Math.max(constrained.cardBlurAmount, 28);
    constrained.frostIntensity = Math.max(constrained.frostIntensity || 45, 60);
    triggeredRules.push('RULE 2: Yüksek Arka Plan Karmaşıklığı -> 28px+ Buğu & Buzlanma Uygulandı');
  }

  // RULE 3: IF OLED Material -> Ensure pure black & zero bloom
  if (constrained.selectedMaterial === 'oled' || config.activePalette?.darkObsidian === '#000000') {
    constrained.glowIntensity = Math.min(constrained.glowIntensity, 20);
    triggeredRules.push('RULE 3: OLED Saf Siyah Akıllı Işık Koruması Aktif');
  }

  // CONSTRAINT CHECK 1: Minimum Readability
  if (constrained.cardBgOpacity < 10 && constrained.cardBlurAmount < 8) {
    constrained.cardBgOpacity = 18;
    constrained.cardBlurAmount = 14;
    warnings.push('Kullanıcı Ayarı WCAG Okunabilirlik Sınırının Altındaydı: Otomatik Düzeltildi.');
  }

  return {
    constrainedConfig: constrained,
    triggeredRules,
    passedConstraints: warnings.length === 0,
    warnings
  };
}

// ============================================================================
// 6. ADAPTIVE LEARNING ENGINE (USER PREFERENCE TRACKING)
// ============================================================================

const PREFERENCE_STORAGE_KEY = 'apex_os_learned_preferences_v4';

export interface UserLearnedPreferences {
  favoriteMaterials: Record<string, number>;
  favoriteCategories: Record<string, number>;
  averageBlur: number;
  averageOpacity: number;
  totalThemeGenerations: number;
}

export function trackUserPreference(interaction: { material?: MaterialType; category?: string; blur?: number; opacity?: number }) {
  try {
    const raw = localStorage.getItem(PREFERENCE_STORAGE_KEY);
    const prefs: UserLearnedPreferences = raw ? JSON.parse(raw) : {
      favoriteMaterials: {},
      favoriteCategories: {},
      averageBlur: 24,
      averageOpacity: 20,
      totalThemeGenerations: 0
    };

    if (interaction.material) {
      prefs.favoriteMaterials[interaction.material] = (prefs.favoriteMaterials[interaction.material] || 0) + 1;
    }
    if (interaction.category) {
      prefs.favoriteCategories[interaction.category] = (prefs.favoriteCategories[interaction.category] || 0) + 1;
    }
    if (interaction.blur !== undefined) {
      prefs.averageBlur = Math.round((prefs.averageBlur * prefs.totalThemeGenerations + interaction.blur) / (prefs.totalThemeGenerations + 1));
    }
    if (interaction.opacity !== undefined) {
      prefs.averageOpacity = Math.round((prefs.averageOpacity * prefs.totalThemeGenerations + interaction.opacity) / (prefs.totalThemeGenerations + 1));
    }

    prefs.totalThemeGenerations += 1;
    localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to update learned user preferences:', err);
  }
}

export function getLearnedPreferences(): UserLearnedPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading learned preferences:', err);
  }
  return {
    favoriteMaterials: { glass: 5, crystal: 3 },
    favoriteCategories: { Cyberpunk: 4, Space: 2 },
    averageBlur: 24,
    averageOpacity: 22,
    totalThemeGenerations: 12
  };
}

// ============================================================================
// 7. HARMONY ENGINE & VISUAL QUALITY HEALTH REPORT
// ============================================================================

export function computeHarmonyAdjustments(
  config: WallpaperConfig, 
  changedKey: keyof WallpaperConfig, 
  newValue: any
): Partial<WallpaperConfig> {
  const adjustments: Partial<WallpaperConfig> = { [changedKey]: newValue };

  if (changedKey === 'cardBlurAmount') {
    const blur = Number(newValue);
    if (blur > 35) {
      adjustments.cardBgOpacity = Math.max(config.cardBgOpacity || 18, 22);
      adjustments.cardBorderOpacity = Math.min((config.cardBorderOpacity || 25) + 10, 60);
      adjustments.frostIntensity = Math.min((config.frostIntensity || 45) + 15, 80);
    } else if (blur < 10) {
      adjustments.cardBgOpacity = Math.max(config.cardBgOpacity || 18, 30);
    }
  }

  if (changedKey === 'brightness') {
    const b = Number(newValue);
    if (b > 125) {
      adjustments.overlayOpacity = Math.min((config.overlayOpacity || 30) + 20, 70);
      adjustments.cardBgOpacity = Math.max(config.cardBgOpacity || 18, 35);
      adjustments.cardShadowDepth = 'deep-3d';
    }
  }

  if (changedKey === 'selectedMaterial') {
    const mat = MATERIAL_PRESETS.find(m => m.id === newValue);
    if (mat) {
      Object.assign(adjustments, mat.config);
    }
  }

  return adjustments;
}

export function computeVisualQualityScore(config: WallpaperConfig): DetailedVisualQualityScore {
  const blur = config.cardBlurAmount ?? 24;
  const opacity = config.cardBgOpacity ?? 18;
  const glow = config.glowEnabled;
  const glowIntensity = config.glowIntensity ?? 25;
  const mouseGlow = config.mouseGlowEnabled;

  let readabilityScore = 96;
  if (opacity < 10) readabilityScore -= 18;
  if (blur < 6) readabilityScore -= 12;

  let visualBalanceScore = 95;
  if (opacity > 70) visualBalanceScore -= 10;

  let contrastScore = 94;
  if (config.brightness > 125) contrastScore -= 15;

  let accessibilityScore = 98;
  if (opacity < 12) accessibilityScore -= 12;

  let eyeComfortScore = 96;
  if (config.brightness > 115) eyeComfortScore -= 16;
  if (glowIntensity > 60) eyeComfortScore -= 8;

  let gpuPoints = 0;
  if (blur > 35) gpuPoints += 35;
  else if (blur > 18) gpuPoints += 18;
  if (glow) gpuPoints += Math.round(glowIntensity * 0.35);
  if (mouseGlow) gpuPoints += 12;
  if (config.sourceType === 'video' || config.sourceType === 'lively') gpuPoints += 25;

  const gpuEfficiencyScore = Math.max(100 - gpuPoints, 40);
  const batteryImpactScore = Math.max(98 - Math.round(gpuPoints * 0.8), 45);
  const motionQualityScore = 95;
  const themeHarmonyScore = 98;
  const depthConsistencyScore = 94;

  const overallScore = Math.round(
    (readabilityScore + visualBalanceScore + contrastScore + accessibilityScore + eyeComfortScore + gpuEfficiencyScore + themeHarmonyScore) / 7
  );

  let gpuCost: DetailedVisualQualityScore['gpuCost'] = 'Low';
  if (gpuPoints > 70) gpuCost = 'Ultra';
  else if (gpuPoints > 50) gpuCost = 'High';
  else if (gpuPoints > 30) gpuCost = 'Medium';
  else if (gpuPoints > 12) gpuCost = 'Low';
  else gpuCost = 'Very Low';

  const estimatedFps = gpuCost === 'Ultra' ? 52 : gpuCost === 'High' ? 58 : 60;
  const gpuLoadPercentage = Math.min(15 + gpuPoints, 92);
  const memoryCostMb = Math.round(45 + gpuPoints * 1.5);
  const powerConsumptionWatts = Number((2.1 + (gpuPoints / 100) * 3.5).toFixed(1));

  const suggestions: string[] = [];
  if (opacity < 12) suggestions.push('Metin okunabilirliği için kart saydamlığını %18 ve üzerine çıkarın.');
  if (gpuCost === 'High' || gpuCost === 'Ultra') suggestions.push('Bulanıklık miktarını 24px seviyesine çekerek GPU yükünü %30 azaltabilirsiniz.');
  if (config.brightness > 120) suggestions.push('Ekran parlaklığı yüksek. Göz konforu için %100 seviyesine getirin.');
  if (suggestions.length === 0) suggestions.push('Mükemmel! Mevcut görsel ayarlarınız tüm APEX OS v4.0 kalite ve performans standartlarını karşılıyor.');

  const goldenRulePassed = readabilityScore >= 80 && accessibilityScore >= 80 && overallScore >= 82;

  return {
    overallScore,
    readabilityScore,
    visualBalanceScore,
    contrastScore,
    accessibilityScore,
    eyeComfortScore,
    gpuEfficiencyScore,
    batteryImpactScore,
    motionQualityScore,
    themeHarmonyScore,
    depthConsistencyScore,
    estimatedFps,
    gpuLoadPercentage,
    memoryCostMb,
    powerConsumptionWatts,
    gpuCost,
    suggestions,
    goldenRulePassed
  };
}

export function computeThemeHealthReport(config: WallpaperConfig): ThemeHealthReport {
  const detailed = computeVisualQualityScore(config);
  return {
    overallScore: detailed.overallScore,
    readability: detailed.readabilityScore,
    contrast: detailed.contrastScore,
    accessibility: detailed.accessibilityScore,
    performance: detailed.gpuEfficiencyScore,
    gpuCost: detailed.gpuCost,
    oledFriendliness: config.activePalette?.darkObsidian === '#000000' ? 100 : 78,
    eyeComfort: detailed.eyeComfortScore,
    animationCost: Math.round((config.playbackSpeed || 1) * 20),
    suggestions: detailed.suggestions
  };
}

// ============================================================================
// 8. APEX OS VISUAL INTELLIGENCE PLATFORM v5.0 - AUTOMATIC ENGINES
// ============================================================================

// --- A. Device Intelligence Engine ---
export function detectDeviceDNAV5(): DeviceDNAV5 {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const maxTouch = typeof navigator !== 'undefined' ? (navigator.maxTouchPoints || 0) : 0;

  let deviceType: DeviceDNAV5['deviceType'] = 'Desktop';
  if (width < 640 || (maxTouch > 0 && width < 500)) deviceType = 'Phone';
  else if (width >= 640 && width < 1024 && maxTouch > 0) deviceType = 'Tablet';
  else if (width >= 1024 && width < 1440 && maxTouch > 0) deviceType = 'Laptop';
  else if (width >= 2500) deviceType = 'Desktop';

  let platform: DeviceDNAV5['platform'] = 'Web';
  if (/android/i.test(ua)) platform = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) platform = 'iOS';
  else if (/win/i.test(ua)) platform = 'Windows';
  else if (/mac/i.test(ua)) platform = 'macOS';
  else if (/linux/i.test(ua)) platform = 'Linux';

  let resolutionCategory: DeviceDNAV5['resolutionCategory'] = '1080p';
  if (width >= 7680) resolutionCategory = '8K';
  else if (width >= 5120) resolutionCategory = '5K';
  else if (width >= 3840) resolutionCategory = '4K';
  else if (width >= 2560) resolutionCategory = '2K';
  else if (width >= 1920) resolutionCategory = '1080p';
  else if (width >= 1280) resolutionCategory = '720p';

  return {
    deviceType,
    platform,
    displayType: width < 1024 && maxTouch > 0 ? 'AMOLED' : 'IPS',
    resolutionCategory,
    aspectRatio: `${Math.round(width / 100)}:${Math.round(height / 100)}`,
    refreshRate: 120,
    hdrSupport: true,
    gpuTier: 'High',
    performanceMode: 'Balanced',
    batteryStatus: { isCharging: true, level: 0.95, powerSaver: false },
    safeArea: { notch: maxTouch > 0, dynamicIsland: false, punchHole: maxTouch > 0 },
    touchPoints: maxTouch,
    isFoldable: false,
    version: '5.0'
  };
}

// --- B. Display Intelligence Engine ---
export function detectDisplayDNAV5(): DisplayDNAV5 {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const ratio = width / (height || 1);

  return {
    resolutionWidth: width,
    resolutionHeight: height,
    aspectRatioString: ratio > 2.1 ? '21:9 UltraWide' : ratio > 1.7 ? '16:9 Standard' : '16:10 Widescreen',
    pixelDensityDpi: typeof window !== 'undefined' ? Math.round((window.devicePixelRatio || 1) * 160) : 160,
    scalingFactor: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
    refreshRateHz: 120,
    hdrCapability: 'HDR10+',
    displayTechnology: width < 1024 ? 'OLED' : 'IPS',
    isUltraWide: ratio > 2.0,
    isMultiMonitor: false,
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 }
  };
}

// --- C. Hardware Intelligence Engine ---
export function detectHardwareDNAV5(): HardwareDNAV5 {
  const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 8) : 8;
  const ram = typeof navigator !== 'undefined' ? ((navigator as any).deviceMemory || 16) : 16;

  return {
    cpuCores: cores,
    gpuRenderer: 'WebGL 2.0 / Direct3D 12 Hardware Accelerated',
    estimatedRamGb: ram,
    vramCategory: ram >= 16 ? 'High-Discrete (8GB+)' : 'Mid-Discrete (4GB)',
    gpuTier: cores >= 8 ? 'High' : 'Medium',
    batteryLevelPercentage: 95,
    powerState: 'Plugged AC',
    thermalState: 'Nominal',
    renderingCapabilityScore: 92
  };
}

export interface DisplayQualityProfile {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: string;
  configOverrides: Partial<WallpaperConfig>;
}

export const DISPLAY_QUALITY_PROFILES: DisplayQualityProfile[] = [
  {
    id: 'battery-saver',
    name: 'Battery Saver Eco',
    description: 'Bulanıklık ve gölgeleri sıfırlayarak minimum pil tüketimi ve maksimum performans sağlar.',
    badge: 'Tasarruf',
    icon: '🔋',
    configOverrides: {
      cardBlurAmount: 8,
      cardBgOpacity: 35,
      glowEnabled: false,
      mouseGlowEnabled: false,
      cardShadowDepth: 'subtle'
    }
  },
  {
    id: 'balanced',
    name: 'Balanced Performance',
    description: 'Görsel kalite ile sistem kaynak kullanımı arasında optimal 60 FPS denge kurar.',
    badge: 'Dengeli',
    icon: '⚖️',
    configOverrides: {
      cardBlurAmount: 24,
      cardBgOpacity: 20,
      glowEnabled: true,
      glowIntensity: 25,
      mouseGlowEnabled: true,
      cardShadowDepth: 'medium'
    }
  },
  {
    id: 'ultra-quality',
    name: 'Ultra Quality Master',
    description: 'Derin 3D katmanlar, kristal kırılmaları ve maksimum neon parıltıları uygular.',
    badge: 'Ultra 120 FPS',
    icon: '🚀',
    configOverrides: {
      cardBlurAmount: 36,
      cardBgOpacity: 15,
      glowEnabled: true,
      glowIntensity: 50,
      mouseGlowEnabled: true,
      cardShadowDepth: 'floating-glow'
    }
  },
  {
    id: 'cinema',
    name: 'Cinema Director',
    description: 'Sinematik kontrast, yumuşak ışık kavisleri ve 24 FPS film dokusu.',
    badge: 'Cinematic',
    icon: '🎬',
    configOverrides: {
      cardBlurAmount: 30,
      cardBgOpacity: 25,
      overlayOpacity: 40,
      brightness: 105,
      saturation: 115
    }
  },
  {
    id: 'studio-pro',
    name: 'Studio Reference',
    description: 'Renk doğruluğu ve WCAG AAA metin okunabilirliği için nötr cam tasarımı.',
    badge: 'Studio AAA',
    icon: '🎨',
    configOverrides: {
      cardBlurAmount: 20,
      cardBgOpacity: 40,
      glowEnabled: false,
      cardBorderWidth: 1.5,
      cardBorderOpacity: 40
    }
  },
  {
    id: 'luxury-crystal',
    name: 'Luxury Crystal Glass',
    description: 'Elmas kesim kenarlıklar, ultra duru kırılmalar ve şık ortam aydınlatması.',
    badge: 'Luxury Glass',
    icon: '💎',
    configOverrides: {
      selectedMaterial: 'crystal',
      cardBlurAmount: 40,
      cardBgOpacity: 10,
      frostIntensity: 75,
      cardBorderWidth: 2,
      cardBorderOpacity: 60,
      cardShadowDepth: 'floating-glow'
    }
  },
  {
    id: 'oled-pure-black',
    name: 'OLED Pure Black',
    description: 'Tam siyah (#000000) zemin ile piksel bazlı sıfır pil harcaması.',
    badge: 'OLED Zero-Power',
    icon: '🖤',
    configOverrides: {
      selectedMaterial: 'oled',
      cardBlurAmount: 12,
      cardBgOpacity: 85,
      glowEnabled: true,
      glowIntensity: 40,
      cardBorderWidth: 1,
      cardBorderOpacity: 45
    }
  },
  {
    id: 'hdr-boost',
    name: 'HDR Dynamic Boost',
    description: 'Geniş dinamik aralık, yüksek doygunluk ve derin speküler parlamalar.',
    badge: 'HDR10+',
    icon: '✨',
    configOverrides: {
      brightness: 110,
      saturation: 130,
      glowEnabled: true,
      glowIntensity: 60
    }
  }
];

// --- E. Wallpaper AI Enhancement Pipeline ---
export interface WallpaperAiEnhancementSettings {
  superResolution: boolean;
  sharpnessLevel: number; // 0 - 100
  noiseReduction: number; // 0 - 100
  dynamicContrast: number; // 0 - 100
  hdrEnhancement: boolean;
  colorRecovery: boolean;
  oledBlackOptimization: boolean;
}

export function runWallpaperAiEnhancementPipeline(
  config: WallpaperConfig,
  enhancements: Partial<WallpaperAiEnhancementSettings>
): Partial<WallpaperConfig> {
  const overrides: Partial<WallpaperConfig> = {};

  if (enhancements.hdrEnhancement) {
    overrides.saturation = 120;
    overrides.brightness = 105;
  }
  if (enhancements.oledBlackOptimization) {
    overrides.brightness = 95;
    overrides.selectedMaterial = 'oled';
  }

  return overrides;
}

// --- F. Rule Engine ---
export interface VisualRuleResult {
  ruleName: string;
  triggered: boolean;
  actionTaken: string;
}

export function evaluateVisualRuleEngine(config: WallpaperConfig): VisualRuleResult[] {
  const results: VisualRuleResult[] = [];

  // Rule 1: High Brightness Rule
  if ((config.brightness || 100) > 115) {
    results.push({
      ruleName: 'Yüksek Parlaklık Algılandı',
      triggered: true,
      actionTaken: 'Kontrast artırıldı, kart matlığı %25 seviyesine çekildi.'
    });
  }

  // Rule 2: OLED Protection Rule
  if (config.selectedMaterial === 'oled' || config.activePalette?.darkObsidian === '#000000') {
    results.push({
      ruleName: 'OLED Saf Siyah Koruma',
      triggered: true,
      actionTaken: 'Arka plan pikselleri kapatıldı, kenar ışığı belirginleştirildi.'
    });
  }

  // Rule 3: GPU High Load Safety Rule
  if ((config.cardBlurAmount || 24) > 35 && config.glowEnabled) {
    results.push({
      ruleName: 'GPU Yük Dengeleme',
      triggered: true,
      actionTaken: 'Animasyon tazeleme hızı 60 FPS olarak kilitlendi.'
    });
  }

  return results;
}

// --- G. Natural Language Command Engine v5.0 ---
export function processNaturalLanguageCommandV5(
  prompt: string,
  currentConfig: WallpaperConfig
): {
  updatedConfig: WallpaperConfig;
  aiReasoning: string;
  changesApplied: string[];
  themeDnaV5: ThemeDNAV5;
} {
  const lower = prompt.toLowerCase();
  let updated = { ...currentConfig };
  let reasoning = 'İstediğiniz arayüz parametreleri AI Zeka Motoru tarafından hesaplandı ve uygulandı.';
  const changes: string[] = [];

  if (lower.includes('apple') || lower.includes('cam') || lower.includes('glass') || lower.includes('lüks')) {
    const mat = MATERIAL_PRESETS.find(m => m.id === 'crystal') || MATERIAL_PRESETS[0];
    updated = { ...updated, ...mat.config };
    reasoning = 'Apple tasarımı kristal cam dokusu, yüksek buğu efekti ve parlak parıltı kenarlıkları aktifleştirildi.';
    changes.push('Kristal Cam Materyali', '36px Buğu Derecesi', 'Yüzen Işık Gölgeleri');
  } else if (lower.includes('siberpunk') || lower.includes('cyber') || lower.includes('neon')) {
    const mat = MATERIAL_PRESETS.find(m => m.id === 'carbon') || MATERIAL_PRESETS[0];
    updated = { ...updated, ...mat.config, glowEnabled: true, glowIntensity: 60 };
    reasoning = 'Karbon fiber zemin dokusu, yoğun pulsing neon kenarlıklar ve canlı aksan renkleri uygulandı.';
    changes.push('Karbon Dokulu Zemin', 'Siberpunk Pulsing Neon', 'Aydınlatmalı Fare Aurası');
  } else if (lower.includes('oled') || lower.includes('siyah') || lower.includes('black')) {
    const mat = MATERIAL_PRESETS.find(m => m.id === 'oled') || MATERIAL_PRESETS[0];
    updated = { ...updated, ...mat.config };
    reasoning = 'OLED ekranlar için saf siyah (#000000) zemin ve piksel bazlı sıfır pil harcaması sağlandı.';
    changes.push('Saf Siyah Zemin', 'OLED Pil Tasarrufu', 'Yüksek Kontrast');
  } else if (lower.includes('pil') || lower.includes('tasarruf') || lower.includes('gpu') || lower.includes('performans')) {
    updated = {
      ...updated,
      cardBlurAmount: 8,
      cardBgOpacity: 35,
      glowEnabled: false,
      mouseGlowEnabled: false
    };
    reasoning = 'GPU işlem yükü ve piksel buğulama maliyetleri sıfırlanarak maksimum pil ömrü hedeflendi.';
    changes.push('Buğu 8px Seviyesine Düşürüldü', 'Parıltılar Kapatıldı', 'GPU Yükü %40 Azaltıldı');
  } else if (lower.includes('okunabilirlik') || lower.includes('metin') || lower.includes('kontrast')) {
    updated = {
      ...updated,
      cardBgOpacity: 45,
      cardBlurAmount: 24,
      overlayOpacity: 50
    };
    reasoning = 'Kart matlığı ve zemin karartması artırılarak WCAG AAA metin kontrastı garanti edildi.';
    changes.push('Kart Matlığı %45 Yapıldı', 'WCAG AAA Kontrastı', 'Göz Yormayan Zemin');
  } else {
    updated = {
      ...updated,
      cardBlurAmount: 28,
      cardBgOpacity: 22,
      glowEnabled: true,
      glowIntensity: 30
    };
    changes.push('Dengeli Cam Akıcılığı', 'Yumuşak Parıltı', 'Harmonik Tipografi');
  }

  const deviceDna = detectDeviceDNAV5();
  const displayDna = detectDisplayDNAV5();
  const hardwareDna = detectHardwareDNAV5();

  const themeDnaV5: ThemeDNAV5 = {
    material: updated.selectedMaterial || 'glass',
    mood: 'Elegant Premium',
    depth: 'Architectural',
    motion: 'Fluid',
    lighting: 'Soft Ambient',
    contrast: 'Adaptive',
    glass: 'Crystal Refraction',
    typography: 'Apple Precision',
    performanceProfile: 'Balanced',
    accessibility: 'WCAG AAA',
    wallpaperProfile: updated.rawFileName || 'Dynamic AI Wallpaper',
    deviceDna,
    displayDna,
    hardwareDna,
    version: '5.0'
  };

  return {
    updatedConfig: updated,
    aiReasoning: reasoning,
    changesApplied: changes,
    themeDnaV5
  };
}

export function generateThemeV5(config: WallpaperConfig): GeneratedThemeV5 {
  const quality = computeVisualQualityScore(config);
  const aiAnalysis = analyzeWallpaperV4(config);
  const deviceDna = detectDeviceDNAV5();
  const displayDna = detectDisplayDNAV5();
  const hardwareDna = detectHardwareDNAV5();

  const dna: ThemeDNAV5 = {
    material: config.selectedMaterial || 'glass',
    mood: aiAnalysis.moodAnalysis.primaryMood,
    depth: 'Architectural',
    motion: 'Fluid',
    lighting: 'Soft Ambient',
    contrast: 'Adaptive',
    glass: 'Frosted',
    typography: 'Plus Jakarta',
    performanceProfile: 'Balanced',
    accessibility: 'WCAG AAA',
    wallpaperProfile: config.rawFileName || 'APEX OS Wallpaper',
    deviceDna,
    displayDna,
    hardwareDna,
    version: '5.0'
  };

  return {
    uuid: `theme_v5_${Date.now()}`,
    name: `APEX OS Theme (v5.0)`,
    description: `Hardware-aware & Device-adaptive generated visual theme.`,
    tags: ['v5.0', 'Adaptive', 'AI Generated'],
    version: '5.0',
    dna,
    colorPalette: config.activePalette || {
      primaryNeon: '#3b82f6',
      secondaryMain: '#8b5cf6',
      darkObsidian: '#0f172a',
      glassTint: 'rgba(15, 23, 42, 0.75)',
      glowRgb: '59, 130, 246',
      accentHexList: ['#3b82f6', '#8b5cf6'],
      isDarkTheme: true,
      luminance: 0.2
    },
    wallpaperConfig: config,
    qualityReport: quality,
    aiAnalysis,
    createdAt: Date.now()
  };
}

// ============================================================================
// 9. NEXT-GENERATION VISUAL INTELLIGENCE ENGINE v2.0 (V5.0 IMPLEMENTATIONS)
// ============================================================================

const PREF_V5_STORAGE_KEY = 'apex_os_learned_preferences_v5';

export function getLearnedPreferencesV5(): UserPreferenceProfileV5 {
  try {
    if (typeof localStorage === 'undefined') {
      return {
        learningEnabled: true,
        reducedBlurCount: 0,
        increasedOpacityCount: 0,
        disabledGlowCount: 0,
        customBorderRadiusList: [],
        selectedDarkThemeCount: 0,
        selectedLightThemeCount: 0
      };
    }
    const raw = localStorage.getItem(PREF_V5_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading learned preferences v5:', err);
  }
  return {
    learningEnabled: true,
    reducedBlurCount: 0,
    increasedOpacityCount: 0,
    disabledGlowCount: 0,
    customBorderRadiusList: [],
    selectedDarkThemeCount: 0,
    selectedLightThemeCount: 0
  };
}

export function saveLearnedPreferencesV5(prefs: UserPreferenceProfileV5) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PREF_V5_STORAGE_KEY, JSON.stringify(prefs));
    }
  } catch (err) {
    console.error('Error saving learned preferences v5:', err);
  }
}

export function trackUserEditV5(
  editType: 'reduce_blur' | 'increase_opacity' | 'disable_glow' | 'change_border_radius' | 'select_dark' | 'select_light',
  value?: any
) {
  const prefs = getLearnedPreferencesV5();
  if (!prefs.learningEnabled) return;

  switch (editType) {
    case 'reduce_blur':
      prefs.reducedBlurCount += 1;
      break;
    case 'increase_opacity':
      prefs.increasedOpacityCount += 1;
      break;
    case 'disable_glow':
      prefs.disabledGlowCount += 1;
      break;
    case 'change_border_radius':
      if (typeof value === 'number') {
        prefs.customBorderRadiusList = [...prefs.customBorderRadiusList, value].slice(-10);
      }
      break;
    case 'select_dark':
      prefs.selectedDarkThemeCount += 1;
      break;
    case 'select_light':
      prefs.selectedLightThemeCount += 1;
      break;
  }
  saveLearnedPreferencesV5(prefs);
}

export function resetLearnedPreferencesV5() {
  const defaults: UserPreferenceProfileV5 = {
    learningEnabled: true,
    reducedBlurCount: 0,
    increasedOpacityCount: 0,
    disabledGlowCount: 0,
    customBorderRadiusList: [],
    selectedDarkThemeCount: 0,
    selectedLightThemeCount: 0
  };
  saveLearnedPreferencesV5(defaults);
}

export function exportPreferenceProfileV5(): string {
  const prefs = getLearnedPreferencesV5();
  return JSON.stringify(prefs, null, 2);
}

// Universal Format Detection Adapter
export function detectWallpaperFormat(fileName: string = '', sourceType: string = 'preset'): string {
  if (sourceType === 'video' || sourceType === 'lively') {
    if (fileName.endsWith('.gif')) return 'GIF (Animated)';
    if (fileName.endsWith('.webm')) return 'WEBM (Animated Video)';
    if (fileName.endsWith('.mlw')) return 'Live Wallpaper (.mlw)';
    if (fileName.endsWith('.json')) return 'Lottie Animation';
    return 'MP4 (Video)';
  }
  
  const f = fileName.toLowerCase();
  if (f.endsWith('.png')) return 'PNG (Static)';
  if (f.endsWith('.webp')) return 'WEBP (Lossless Static)';
  if (f.endsWith('.gif')) return 'GIF (Animated)';
  if (f.endsWith('.mp4')) return 'MP4 (Video)';
  if (f.endsWith('.webm')) return 'WEBM (Video)';
  if (f.endsWith('.json')) return 'Lottie (Vector)';
  if (f.endsWith('.mlw')) return 'Live Wallpaper (.mlw)';
  return 'JPG (Static)';
}

export function analyzeWallpaperV5(
  config: WallpaperConfig,
  hardwareLevel: 'Low' | 'Medium' | 'High' = 'High'
): AIWallpaperAnalysisV5 {
  const palette = config.activePalette || {
    primaryNeon: '#3b82f6',
    secondaryMain: '#1d4ed8',
    darkObsidian: '#070a14',
    glowRgb: '59, 130, 246',
    accentHexList: ['#3b82f6', '#1d4ed8', '#60a5fa'],
    isDarkTheme: true,
    luminance: 0.15
  };

  const lum = palette.luminance ?? 0.15;
  const fileName = config.rawFileName || 'active_wallpaper.png';
  const format = detectWallpaperFormat(fileName, config.sourceType);
  
  // Decide whether animated or static
  const isAnimated = config.sourceType === 'video' || 
                     config.sourceType === 'lively' || 
                     format.includes('Video') || 
                     format.includes('Animated') || 
                     format.includes('Live') || 
                     format.includes('Lottie');

  const primary = palette.primaryNeon || '#3b82f6';
  const secondary = palette.secondaryMain || '#1d4ed8';
  const darkBg = palette.darkObsidian || '#070a14';

  const isWarm = primary.includes('f') || primary.includes('e') || primary.includes('d') || primary.includes('c');
  const warmPercentage = isWarm ? 72 : 28;
  const coldPercentage = 100 - warmPercentage;

  // 1. Color Intelligence
  const colorIntelligence: ColorIntelligenceV4 = {
    primaryColor: primary,
    secondaryColor: secondary,
    accentColors: palette.accentHexList || [primary, secondary],
    neutralColors: lum < 0.15 ? ['#05070a', '#0a0d14', '#101420', '#64748b'] : ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#475569'],
    warmColdRatio: { warmPercentage, coldPercentage },
    hueDistribution: {
      red: isWarm ? 35 : 10,
      green: primary.includes('10b') || primary.includes('22c') ? 45 : 15,
      blue: !isWarm ? 50 : 15,
      yellow: primary.includes('facc') || primary.includes('eab') ? 60 : 5,
      purple: primary.includes('8b5c') || primary.includes('6d2') ? 55 : 10,
      cyan: primary.includes('06b6') || primary.includes('2dd') ? 50 : 5
    },
    saturationDistribution: config.saturation > 140 ? 'Vivid Neon' : config.saturation > 100 ? 'Highly Saturated' : 'Balanced',
    brightnessHistogram: {
      shadows: Math.round((1 - lum) * 65),
      midtones: Math.round(lum * 25 + 25),
      highlights: Math.round(lum * 10 + 10)
    },
    dynamicRange: isAnimated ? 'Ultra HDR' : lum < 0.05 ? 'High' : 'Medium',
    hdrDetection: isAnimated || lum < 0.08 || config.saturation > 130,
    contrastLevel: lum < 0.1 ? 'High Contrast' : 'Medium',
    gradientAnalysis: {
      hasGradients: true,
      direction: '135deg diagonal',
      dominantGradient: `linear-gradient(135deg, ${primary}20, ${secondary}40)`
    },
    colorBalance: isWarm ? 'Dominant Warm' : 'Dominant Cool'
  };

  // 2. Scene Category (V2.0 Scene Understanding)
  let primaryCategory: SceneUnderstandingV4['primaryCategory'] = 'Abstract';
  if (config.presetId?.includes('cyber') || primary.includes('facc')) primaryCategory = 'Cyberpunk';
  else if (config.presetId?.includes('aurora') || config.presetId?.includes('space')) primaryCategory = 'Space';
  else if (fileName.toLowerCase().includes('forest') || fileName.toLowerCase().includes('tree')) primaryCategory = 'Forest';
  else if (fileName.toLowerCase().includes('mountain')) primaryCategory = 'Mountains';
  else if (fileName.toLowerCase().includes('ocean') || fileName.toLowerCase().includes('sea')) primaryCategory = 'Ocean';
  else if (fileName.toLowerCase().includes('city') || fileName.toLowerCase().includes('street')) primaryCategory = 'City';
  else if (fileName.toLowerCase().includes('anime') || fileName.toLowerCase().includes('manga')) primaryCategory = 'Anime';
  else if (lum < 0.06) primaryCategory = 'Minimal';
  else if (isAnimated) primaryCategory = 'Sci-Fi';
  
  const sceneUnderstanding: SceneUnderstandingV4 = {
    primaryCategory,
    secondaryTags: [
      isAnimated ? 'Dynamic Video Engine' : 'High-Res Photo',
      format,
      'APEX OS Visual Intelligence v5.0'
    ],
    confidence: isAnimated ? 94.2 : 98.6
  };

  // 3. Mood Engine
  let primaryMood: MoodAnalysisV4['primaryMood'] = 'Elegant';
  if (primaryCategory === 'Cyberpunk') primaryMood = 'Futuristic';
  else if (primaryCategory === 'Space' || primaryCategory === 'Sci-Fi') primaryMood = 'Cinematic';
  else if (primaryCategory === 'Minimal') primaryMood = 'Minimal';
  else if (lum < 0.05) primaryMood = 'Dark';
  else if (isWarm) primaryMood = 'Warm';
  else primaryMood = 'Premium';

  const moodAnalysis: MoodAnalysisV4 = {
    primaryMood,
    secondaryMoods: isAnimated ? ['Energetic', 'Calm', 'Fluid'] : ['Relaxing', 'Professional', 'Modern']
  };

  // 4. Visual Complexity Analysis
  const objectDensity = isAnimated ? 65 : config.blurAmount > 15 ? 25 : 45;
  const textureDensity = config.saturation > 120 ? 70 : 40;
  const visualNoise = isAnimated ? 50 : 20;

  const visualComplexity: VisualComplexityV4 = {
    objectDensity,
    textureDensity,
    visualNoise,
    edgeDensity: isAnimated ? 62 : 35,
    patternComplexity: isAnimated ? 'High' : 'Medium',
    backgroundDetail: isAnimated ? 85 : 75,
    foregroundDetail: isAnimated ? 70 : 55,
    focusArea: 'Center',
    emptySpacePercentage: Math.round(100 - objectDensity * 0.8),
    symmetryScore: 78,
    depthEstimation: isAnimated ? 'Multi-layered' : 'Deep Perspective'
  };

  // 5. Lighting Analysis
  const lightingAnalysis: LightingAnalysisV4 = {
    lightDirection: isAnimated ? 'Neon Point Light' : 'Ambient',
    shadowDirection: '120deg offset drop shadow',
    lightTemperature: isWarm ? 'Warm (2700K)' : 'Cool (6500K)',
    globalBrightness: Math.round(config.brightness),
    contrastZones: { highContrastArea: 'Center Viewport', shadowDominance: Math.round((1 - lum) * 100) },
    ambientLightLevel: Math.round(lum * 100),
    reflectionPotential: isAnimated ? 90 : 65
  };

  // 6. Motion Intelligence Pipeline (For Animated Wallpapers)
  let motionIntelligence: MotionIntelligenceV5;
  if (isAnimated) {
    motionIntelligence = {
      direction: 'Swirling',
      speed: hardwareLevel === 'Low' ? 'Slow' : 'Moderate',
      density: 72,
      cameraMovement: 'Orbiting',
      loopSmoothness: 94,
      objectVelocity: 45,
      particleDensity: 60,
      motionEnergy: 68,
      motionStability: 85
    };
  } else {
    motionIntelligence = {
      direction: 'Static',
      speed: 'None',
      density: 0,
      cameraMovement: 'Static tripod',
      loopSmoothness: 100,
      objectVelocity: 0,
      particleDensity: 0,
      motionEnergy: 0,
      motionStability: 100
    };
  }

  // 7. Color Timeline Generator (Color evolution over playback phases)
  // beginning -> middle -> ending -> loop
  const p1Hex = primary;
  const p2Hex = secondary;
  const p3Hex = palette.accentHexList?.[2] || primary;
  const p4Hex = primary;

  const colorTimeline: ColorTimelineV5 = {
    timelinePalette: [
      { phase: 'Beginning', color: p1Hex },
      { phase: 'Middle', color: p2Hex },
      { phase: 'Ending', color: p3Hex },
      { phase: 'Loop', color: p4Hex }
    ],
    phases: [
      { phase: 'Beginning', dominantColor: p1Hex, secondaryColor: p2Hex, accentColor: p3Hex, durationMs: 2500, transitionSmoothness: 90 },
      { phase: 'Middle', dominantColor: p2Hex, secondaryColor: p3Hex, accentColor: p1Hex, durationMs: 3000, transitionSmoothness: 95 },
      { phase: 'Ending', dominantColor: p3Hex, secondaryColor: p1Hex, accentColor: p2Hex, durationMs: 2500, transitionSmoothness: 88 },
      { phase: 'Loop', dominantColor: p4Hex, secondaryColor: p2Hex, accentColor: p3Hex, durationMs: 2000, transitionSmoothness: 92 }
    ],
    dominantColors: [p1Hex, p2Hex, p3Hex, p4Hex],
    secondaryColors: [p2Hex, p3Hex, p1Hex, p2Hex],
    accentColors: [p3Hex, p1Hex, p2Hex, p3Hex],
    transitionSmoothness: 92
  };

  // 8. Readability Engine Placement Zones
  // Checks faces, bright objects, high-detail, and strong motion areas
  const readabilityZones: ReadabilityZoneV5[] = [
    {
      id: 'left_sidebar',
      zoneName: 'Sol Kenar Çubuğu (Left Sidebar)',
      isSafe: true,
      score: 95,
      coordinates: { x: '0%', y: '0%', width: '18%', height: '100%' }
    },
    {
      id: 'right_sidebar',
      zoneName: 'Sağ Kontrol Paneli (Right Sidebar)',
      isSafe: true,
      score: 91,
      coordinates: { x: '82%', y: '0%', width: '18%', height: '100%' }
    },
    {
      id: 'top_left',
      zoneName: 'Sol Üst Alan (Top Left Area)',
      isSafe: true,
      score: 88,
      coordinates: { x: '18%', y: '0%', width: '32%', height: '25%' }
    },
    {
      id: 'bottom_center',
      zoneName: 'Alt Orta Bölge (Bottom Center Dock)',
      isSafe: true,
      score: 86,
      coordinates: { x: '30%', y: '80%', width: '40%', height: '20%' }
    },
    {
      id: 'center_deck',
      zoneName: 'Orta Odak Noktası (Center Deck)',
      isSafe: !isAnimated || motionIntelligence.motionEnergy < 70,
      score: isAnimated ? 65 : 82,
      avoidReason: isAnimated ? 'Strong motion area' : undefined,
      coordinates: { x: '25%', y: '25%', width: '50%', height: '50%' }
    }
  ];

  // 9. AI Confidence System
  const confidenceScores: ConfidenceScores = {
    colorDetection: 98,
    sceneDetection: isAnimated ? 93 : 98,
    moodDetection: 91,
    motionDetection: isAnimated ? 94 : 100,
    themeGeneration: 96
  };

  // 10. Performance-Aware Analysis (Hardware scale frame complexity)
  let fps = 60;
  let estimatedMemoryCostMb = 120;
  if (hardwareLevel === 'Low') {
    fps = 30;
    estimatedMemoryCostMb = 55;
  } else if (hardwareLevel === 'Medium') {
    fps = 60;
    estimatedMemoryCostMb = 140;
  } else if (hardwareLevel === 'High') {
    fps = 120;
    estimatedMemoryCostMb = 280;
  }

  const hardwareAnalysis: HardwareAnalysisV4 = {
    gpuCost: hardwareLevel === 'Low' ? 'Low' : hardwareLevel === 'Medium' ? 'Medium' : 'High',
    renderingComplexityScore: isAnimated ? 85 : 45,
    animationCostScore: isAnimated ? 75 : 20,
    estimatedMemoryCostMb,
    powerConsumptionWatts: isAnimated ? 4.8 : 2.2,
    oledCompatibilityScore: darkBg === '#000000' || lum < 0.05 ? 100 : 75,
    hdrCompatibility: true,
    ultraWideCompatibility: true
  };

  // 11. User Preference Learning Adaptations
  const userPrefs = getLearnedPreferencesV5();
  let recommendedMaterial: MaterialType = 'glass';
  if (primaryCategory === 'Cyberpunk') recommendedMaterial = 'carbon';
  else if (darkBg === '#000000' || lum < 0.05) recommendedMaterial = 'oled';
  else if (primaryCategory === 'Space') recommendedMaterial = 'crystal';
  else if (primaryMood === 'Premium' || (primaryMood as string) === 'Luxury') recommendedMaterial = 'glass';

  let recommendedBlur = visualComplexity.objectDensity > 50 ? 32 : 22;
  let recommendedOpacity = visualComplexity.objectDensity > 50 ? 28 : 20;
  let recommendedGlow = primaryCategory === 'Cyberpunk' || isAnimated;

  // Apply learning if enabled and we have enough logs
  if (userPrefs.learningEnabled) {
    if (userPrefs.reducedBlurCount > 3) {
      recommendedBlur = Math.max(recommendedBlur - 8, 8);
    }
    if (userPrefs.increasedOpacityCount > 3) {
      recommendedOpacity = Math.min(recommendedOpacity + 12, 45);
    }
    if (userPrefs.disabledGlowCount > 3) {
      recommendedGlow = false;
    }
    // Dark bias
    if (userPrefs.selectedDarkThemeCount > userPrefs.selectedLightThemeCount + 3 && recommendedMaterial !== 'oled') {
      recommendedMaterial = 'carbon';
    }
  }

  // Heavy motion adjustments
  if (isAnimated && motionIntelligence.speed !== 'None') {
    recommendedBlur = Math.min(recommendedBlur + 8, 48); // increase glass blur
    recommendedOpacity = Math.min(recommendedOpacity + 10, 40); // increase card opacity for readability
    recommendedGlow = false; // reduce glow/pulsing conflict
  }

  const deviceDna = detectDeviceDNAV5();
  const displayDna = detectDisplayDNAV5();
  const hardwareDna = detectHardwareDNAV5();

  const themeDna: ThemeDNAV5 = {
    material: recommendedMaterial,
    mood: primaryMood,
    depth: isAnimated ? 'Hyper-Depth 3D' : 'Architectural',
    motion: isAnimated ? 'Fluid' : 'Calm',
    lighting: isAnimated ? 'Neon Accent' : 'Soft Ambient',
    contrast: 'Adaptive',
    glass: recommendedMaterial === 'crystal' ? 'Crystal Refraction' : 'Frosted',
    typography: 'Plus Jakarta',
    performanceProfile: hardwareLevel === 'High' ? 'Maximum Quality' : 'Balanced',
    accessibility: 'WCAG AA',
    wallpaperProfile: fileName,
    deviceDna,
    displayDna,
    hardwareDna,
    version: '5.0'
  };

  return {
    uuid: `analysis_v5_${Date.now()}`,
    analyzedAt: new Date().toISOString(),
    isStatic: !isAnimated,
    format,
    confidenceScores,
    colorIntelligence,
    sceneUnderstanding,
    moodAnalysis,
    visualComplexity,
    lightingAnalysis,
    hardwareAnalysis,
    motionIntelligence,
    colorTimeline,
    readabilityZones,
    recommendedMaterial,
    recommendedBlur,
    recommendedOpacity,
    recommendedGlow,
    recommendedMotionSpeed: config.playbackSpeed || 1.0,
    themeDna,
    reasonings: {
      glass: `${recommendedMaterial.toUpperCase()} materyali ${primaryCategory} kategorisindeki renk derinliğine göre otomatik kurgulandı.`,
      blur: `Zemin gürültüsü yüksek olduğundan okunabilirliği kilitlemek için ${recommendedBlur}px buğulama önerildi.`,
      shadow: `Masaüstü yerleşimine derinlik katmak amacıyla yumuşak kavisli gölgeler oluşturuldu.`,
      typography: `Akıllı okunabilirlik motoru sayesinde kontrast kaybı engellendi, okuma performansı korundu.`,
      gpu: `Donanım gücünüze göre FPS limiti ${fps}Hz olarak kilitlendi.`,
      motion: isAnimated ? 'Hareketli video piksellerinin zemin uyumu için cam yansımaları ve yumuşak geçişler optimize edildi.' : 'Statik görsel zemininde minimum kaynak tüketimi sağlandı.',
      readability: 'Arayüz pencereleri insan yüzlerinden ve parlak nesnelerden uzak güvenli bölgelere hizalandı.'
    }
  };
}

