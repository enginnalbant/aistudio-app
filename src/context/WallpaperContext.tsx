import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ExtractedPalette, getDefaultPalette } from '../utils/colorExtractor';

export type WallpaperSourceType = 'preset' | 'image' | 'video' | 'particles' | 'lively';

export interface WallpaperPreset {
  id: string;
  name: string;
  category: 'Lively & Motion' | 'Abstract' | 'Minimalist' | 'Cyberpunk';
  previewUrl: string;
  palette: ExtractedPalette;
  videoUrl?: string;
  particlesColor?: string;
}

export type GlowAnimationType = 'pulse' | 'breath' | 'orbit' | 'wave' | 'static' | 'cyber-scan';
export type GlowShapeType = 'corner-orbs' | 'center-radial' | 'perimeter-edge' | 'split-beams' | 'nebula-field';
export type GlowColorModeType = 'primary' | 'secondary' | 'dual-gradient' | 'tri-blend';
export type MouseGlowType = 'radial-aura' | 'spotlight' | 'ring-halo' | 'sparkle-flare';

export type CardGlowType = 'none' | 'neon-border' | 'pulse-border' | 'rainbow-border' | 'rainbow-flow';
export type CardShadowDepth = 'flat' | 'subtle' | 'medium' | 'deep-3d' | 'floating-glow';

export interface WallpaperConfig {
  sourceType: WallpaperSourceType;
  presetId?: string;
  customWallpaperId?: string;  // Unique ID of the custom wallpaper stored in IndexedDB
  mediaUrl?: string;           // Object URL or Data URL for custom upload/video
  previewUrl?: string;
  rawFileName?: string;
  mimeType?: string;           // Media mime type (video/mp4, image/png, text/html)
  overlayOpacity: number;      // 0 - 90 %
  blurAmount: number;          // 0 - 40 px
  brightness: number;          // 50 - 150 %
  saturation: number;          // 50 - 200 %
  parallaxEnabled: boolean;    // Mouse movement response
  playbackSpeed: number;       // 0.5x - 2.0x for video/mlw
  isMuted: boolean;            // Audio state for lively videos
  autoSyncTheme: boolean;      // Sync wallpaper extracted color palette to OS theme
  activePalette: ExtractedPalette;

  // GLOW & ATMOSPHERIC EFFECTS
  glowEnabled: boolean;              // Master switch for glow effects
  glowType: GlowAnimationType;       // Animation technique
  glowShape: GlowShapeType;          // Placement layout
  glowIntensity: number;             // Opacity 10 - 100%
  glowRadius: number;                // Blur size spread 20 - 100vw
  glowColorMode: GlowColorModeType;  // Palette blend strategy
  mouseGlowEnabled: boolean;         // Glowing radial cursor effect
  mouseGlowType: MouseGlowType;      // Shape/type of cursor glow
  mouseGlowSize: number;             // Size 150 - 600px

  // CARD & WIDGET CUSTOMIZATION
  cardBlurAmount: number;            // 0 - 60 px
  cardBgOpacity: number;             // 0 - 90 %
  cardBorderRadius: number;          // 0 - 36 px
  cardBorderWidth: number;           // 0 - 4 px
  cardBorderOpacity: number;         // 0 - 100 %
  cardGlowEffect: CardGlowType;      // 'none' | 'neon-border' | 'pulse-border' | 'rainbow-border' | 'rainbow-flow'
  cardShadowDepth: CardShadowDepth;   // 'flat' | 'subtle' | 'medium' | 'deep-3d' | 'floating-glow'

  // DETAILED LAYER SPECIFIC CARD CUSTOMIZATIONS
  // 1. Structural Frames (Header, Sidebar, Main Content Area)
  headerBlurAmount?: number;         // 0 - 60 px
  headerBgOpacity?: number;          // 0 - 90 %
  sidebarBlurAmount?: number;        // 0 - 60 px
  sidebarBgOpacity?: number;         // 0 - 90 %
  contentBlurAmount?: number;        // 0 - 60 px
  contentBgOpacity?: number;         // 0 - 90 %

  // 2. Menu & Page Layer Cards
  menuCardBlurAmount?: number;       // 0 - 60 px
  menuCardBgOpacity?: number;        // 0 - 90 %
  menuCardBorderOpacity?: number;    // 0 - 100 %

  // 3. Top-Level Overlays (Pop-up, Modals, Tables, Lists, Components, Charts)
  popupBlurAmount?: number;          // 0 - 60 px
  popupBgOpacity?: number;           // 0 - 95 %
  popupBorderOpacity?: number;       // 0 - 100 %
  popupShadowDepth?: CardShadowDepth;
  popupGlowEffect?: CardGlowType;

  // STUDIO MASTER SETTINGS & V3.0 VISUAL ENGINE
  studioMode?: 'basic' | 'pro';
  studioStage?: number;
  experienceLevel?: 'experience' | 'smart' | 'expert';
  experienceIntentions?: {
    glassFeel: 'minimal' | 'balanced' | 'crystal' | 'liquid' | 'premium' | 'luxury';
    depthStyle: 'flat' | 'soft' | 'layered' | 'floating' | 'architectural';
    atmosphere: 'professional' | 'creative' | 'gaming' | 'cyberpunk' | 'cinema' | 'elegant' | 'minimal' | 'productivity';
  };
  selectedMaterial?: 'glass' | 'crystal' | 'acrylic' | 'liquid' | 'carbon' | 'titanium' | 'oled' | 'paper' | 'slate';
  autoHarmonyEngine?: boolean;
  readabilityEngineActive?: boolean;
  focusEngineActive?: boolean;
  cursorLightingActive?: boolean;

  frostIntensity?: number;           // 0 - 100%
  glassTintOpacity?: number;         // 0 - 100%
  ambientLightingIntensity?: number; // 0 - 100%
  borderGlowIntensity?: number;      // 0 - 100%
  shadowSpread?: number;             // 0 - 50px
  shadowOpacity?: number;            // 0 - 100%
  cardElevation?: number;            // 0 - 5
  animationSpeedMs?: number;         // 100 - 500ms
  motionIntensity?: number;          // 0 - 100%
  iconStyle?: 'modern' | 'neon' | 'glass';
  iconSize?: number;

  // VISUAL INTELLIGENCE ENGINE V2.0 FIELDS
  colorTimeline?: any;
  themeDna?: any;
  motionIntelligence?: any;
  confidenceScores?: any;
  readabilityZones?: any;
  learningEnabled?: boolean;
  liveAdaptiveThemeEnabled?: boolean;
  fontPreset?: string;
  displayMode?: string;
  smartAiFitEnabled?: boolean;
  moveX?: number;
  moveY?: number;
  scale?: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  cropMode?: string;
  parallaxEnabled?: boolean;
  parallaxMode?: string;
  parallaxIntensity?: number;
  parallaxSensitivity?: number;
  parallaxMaxOffset?: number;
  parallaxSmoothness?: number;
  responsiveRules?: Record<string, any>;
  performanceMetadata?: any;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'cyber_obsidian',
    name: 'Cyber Obsidian Neon',
    category: 'Cyberpunk',
    previewUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
    palette: {
      primaryNeon: '#3b82f6',
      secondaryMain: '#1d4ed8',
      darkObsidian: '#070a14',
      glassTint: 'rgba(15, 23, 42, 0.75)',
      glowRgb: '59, 130, 246',
      accentHexList: ['#3b82f6', '#1d4ed8', '#60a5fa', '#38bdf8', '#818cf8', '#a855f7'],
      isDarkTheme: true,
      luminance: 0.15
    },
    particlesColor: '#3b82f6'
  },
  {
    id: 'lively_aurora',
    name: 'Northern Aurora Mesh',
    category: 'Lively & Motion',
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    palette: {
      primaryNeon: '#10b981',
      secondaryMain: '#059669',
      darkObsidian: '#041512',
      glassTint: 'rgba(6, 78, 59, 0.75)',
      glowRgb: '16, 185, 129',
      accentHexList: ['#10b981', '#06b6d4', '#8b5cf6', '#34d399', '#2dd4bf', '#a7f3d0'],
      isDarkTheme: true,
      luminance: 0.25
    },
    particlesColor: '#10b981'
  },
  {
    id: 'deep_space',
    name: 'Deep Nebula & Stardust',
    category: 'Abstract',
    previewUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    palette: {
      primaryNeon: '#8b5cf6',
      secondaryMain: '#6d28d9',
      darkObsidian: '#0b0716',
      glassTint: 'rgba(46, 16, 101, 0.75)',
      glowRgb: '139, 92, 246',
      accentHexList: ['#8b5cf6', '#ec4899', '#3b82f6', '#c084fc', '#f472b6', '#60a5fa'],
      isDarkTheme: true,
      luminance: 0.18
    },
    particlesColor: '#8b5cf6'
  },
  {
    id: 'solar_flare',
    name: 'Solar Crimson Flare',
    category: 'Abstract',
    previewUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    palette: {
      primaryNeon: '#f43f5e',
      secondaryMain: '#e11d48',
      darkObsidian: '#140508',
      glassTint: 'rgba(136, 19, 55, 0.75)',
      glowRgb: '244, 63, 94',
      accentHexList: ['#f43f5e', '#f97316', '#eab308', '#fb7185', '#fdba74', '#fde047'],
      isDarkTheme: true,
      luminance: 0.22
    },
    particlesColor: '#f43f5e'
  },
  {
    id: 'emerald_matrix',
    name: 'Matrix Cyber Pulse',
    category: 'Cyberpunk',
    previewUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    palette: {
      primaryNeon: '#22c55e',
      secondaryMain: '#15803d',
      darkObsidian: '#021206',
      glassTint: 'rgba(20, 83, 45, 0.75)',
      glowRgb: '34, 197, 94',
      accentHexList: ['#22c55e', '#10b981', '#84cc16', '#4ade80', '#2dd4bf', '#a3e635'],
      isDarkTheme: true,
      luminance: 0.2
    },
    particlesColor: '#22c55e'
  },
  {
    id: 'synthwave_sunset',
    name: 'Synthwave Neon Grid',
    category: 'Cyberpunk',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    palette: {
      primaryNeon: '#06b6d4',
      secondaryMain: '#0284c7',
      darkObsidian: '#080d1a',
      glassTint: 'rgba(14, 116, 144, 0.75)',
      glowRgb: '6, 182, 212',
      accentHexList: ['#06b6d4', '#ec4899', '#8b5cf6', '#67e8f9', '#f472b6', '#a78bfa'],
      isDarkTheme: true,
      luminance: 0.23
    },
    particlesColor: '#06b6d4'
  }
];

export const defaultWallpaperConfig: WallpaperConfig = {
  sourceType: 'preset',
  presetId: 'cyber_obsidian',
  overlayOpacity: 35,
  blurAmount: 0,
  brightness: 100,
  saturation: 100,
  parallaxEnabled: true,
  playbackSpeed: 1.0,
  isMuted: true,
  autoSyncTheme: true,
  activePalette: WALLPAPER_PRESETS[0].palette,

  // Glow defaults
  glowEnabled: true,
  glowType: 'pulse',
  glowShape: 'corner-orbs',
  glowIntensity: 25,
  glowRadius: 55,
  glowColorMode: 'dual-gradient',
  mouseGlowEnabled: true,
  mouseGlowType: 'radial-aura',
  mouseGlowSize: 400,

  // Card defaults
  cardBlurAmount: 24,
  cardBgOpacity: 18,
  cardBorderRadius: 24,
  cardBorderWidth: 1,
  cardBorderOpacity: 25,
  cardGlowEffect: 'none',
  cardShadowDepth: 'deep-3d',

  // Studio Master Defaults v3.0
  studioMode: 'basic',
  studioStage: 1,
  experienceLevel: 'experience',
  experienceIntentions: {
    glassFeel: 'balanced',
    depthStyle: 'layered',
    atmosphere: 'professional'
  },
  selectedMaterial: 'glass',
  autoHarmonyEngine: true,
  readabilityEngineActive: true,
  focusEngineActive: true,
  cursorLightingActive: true,

  frostIntensity: 45,
  glassTintOpacity: 30,
  ambientLightingIntensity: 35,
  borderGlowIntensity: 25,
  shadowSpread: 25,
  shadowOpacity: 65,
  cardElevation: 3,
  animationSpeedMs: 200,
  motionIntensity: 50,
  learningEnabled: true,
  liveAdaptiveThemeEnabled: true,
};

export interface ThemeSnapshot {
  id: string;
  name: string;
  timestamp: number;
  config: WallpaperConfig;
}

interface WallpaperContextType {
  config: WallpaperConfig;
  updateConfig: (updates: Partial<WallpaperConfig>) => void;
  applyPaletteToTheme: (palette: ExtractedPalette | any) => void;
  applyTypographyToTheme: (fontFamily: string) => void;
  isWizardOpen: boolean;
  openWizard: () => void;
  closeWizard: () => void;
  resetToDefault: () => void;
  // History & Studio Features
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveSnapshot: (name?: string, customSnapshot?: Partial<ThemeSnapshot>) => void;
  snapshots: ThemeSnapshot[];
  loadSnapshot: (id: string) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'apexos_wallpaper_config_v2';

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WallpaperConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultWallpaperConfig, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load wallpaper config', e);
    }
    return defaultWallpaperConfig;
  });

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [history, setHistory] = useState<WallpaperConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [snapshots, setSnapshots] = useState<ThemeSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('apexos_theme_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setConfig(history[prevIndex]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setConfig(history[nextIndex]);
    }
  }, [historyIndex, history]);

  const saveSnapshot = useCallback((name?: string, customSnapshot?: Partial<ThemeSnapshot>) => {
    const newSnapshot: ThemeSnapshot = {
      id: customSnapshot?.id || `snap_${Date.now()}`,
      name: name || `Tema Anlık Görüntü #${snapshots.length + 1}`,
      timestamp: Date.now(),
      config: { ...config },
      ...customSnapshot
    };
    const updated = [newSnapshot, ...snapshots.filter(s => s.id !== newSnapshot.id)].slice(0, 30);
    setSnapshots(updated);
    try {
      localStorage.setItem('apexos_theme_snapshots', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save theme snapshots', e);
    }
  }, [config, snapshots]);

  const loadSnapshot = useCallback((id: string) => {
    const snap = snapshots.find(s => s.id === id);
    if (snap) {
      setConfig(snap.config);
    }
  }, [snapshots]);

  // Load custom wallpaper blob from database on mount if selected
  useEffect(() => {
    async function loadCustom() {
      if (config.customWallpaperId && config.sourceType !== 'preset') {
        try {
          const { getWallpaper } = await import('../services/wallpaperDb');
          const saved = await getWallpaper(config.customWallpaperId);
          if (saved) {
            const objectUrl = URL.createObjectURL(saved.fileBlob);
            setConfig(prev => ({
              ...prev,
              mediaUrl: objectUrl,
              previewUrl: saved.type === 'image' ? objectUrl : prev.previewUrl,
              activePalette: saved.palette || prev.activePalette
            }));
          }
        } catch (err) {
          console.error('Error restoring custom wallpaper from db:', err);
        }
      }
    }
    loadCustom();
  }, []);

  const applyTypographyToTheme = (fontFamily: string) => {
    if (!fontFamily) return;
    const root = document.documentElement;
    // Clean string formatting like " - Selected"
    const cleanedFont = fontFamily.replace(' - Selected', '');
    
    // Determine the font stack
    let stack = `${cleanedFont}, sans-serif`;
    if (cleanedFont === 'JetBrains Mono' || cleanedFont === 'Fira Code' || cleanedFont === 'Space Mono' || cleanedFont === 'Inconsolata') {
      stack = `${cleanedFont}, monospace`;
    } else if (cleanedFont === 'Playfair Display' || cleanedFont === 'Merriweather' || cleanedFont === 'Lora' || cleanedFont === 'PT Serif') {
      stack = `${cleanedFont}, serif`;
    }
    
    // Apply globally to DesignSystem CSS variables
    root.style.setProperty('--font-sans', stack);
    root.style.setProperty('--font-display', stack);
    
    if (stack.includes('monospace')) {
      root.style.setProperty('--font-mono', stack);
    }
  };

  // Function to inject extracted palette into global CSS root variables
  const applyPaletteToTheme = (palette: ExtractedPalette | any) => {
    if (!palette) return;
    const root = document.documentElement;

    // Primary & Accent variables
    if (palette.primaryNeon) {
      root.style.setProperty('--focus-neon', palette.primaryNeon);
      root.style.setProperty('--focus-neon-val', palette.primaryNeon);
      root.style.setProperty('--accent', palette.primaryNeon);
      // Optional: derive secondary if missing
      root.style.setProperty('--focus-main-val', palette.secondaryMain || palette.primaryNeon);
    }

    // Glowing RGB
    if (palette.glowRgb) {
      root.style.setProperty('--glow-rgb', palette.glowRgb);
    }

    // Background and Surface Colors - Apply comprehensively across the app
    const darkBg = palette.darkObsidian || palette.darkBackground;
    if (darkBg) {
      root.style.setProperty('--app-bg', darkBg);
      root.style.setProperty('--color-void-black', darkBg);
      root.style.setProperty('--skel-dark-val', darkBg);
      root.style.setProperty('--color-skel-dark', darkBg);
    }
    
    // Card and Component Backgrounds
    if (palette.cardBg) {
      root.style.setProperty('--skel-space-val', palette.cardBg);
      root.style.setProperty('--color-bg-card', palette.cardBg);
      root.style.setProperty('--color-skel-space', palette.cardBg);
      root.style.setProperty('--skel-glass-val', palette.cardBg);
    } else if (darkBg) {
      root.style.setProperty('--skel-space-val', darkBg);
      root.style.setProperty('--color-bg-card', darkBg);
      root.style.setProperty('--color-skel-space', darkBg);
    }

    // Border Colors
    if (palette.cardBorder) {
      root.style.setProperty('--skel-metal-val', palette.cardBorder);
      root.style.setProperty('--color-skel-metal', palette.cardBorder);
    }
  };

  // Function to inject card & widget styling root variables
  const applyCardStylesToRoot = (cfg: WallpaperConfig) => {
    const root = document.documentElement;
    const blur = cfg.cardBlurAmount ?? 24;
    const opacity = (cfg.cardBgOpacity ?? 18) / 100;
    const radius = cfg.cardBorderRadius ?? 24;
    const borderWidth = cfg.cardBorderWidth ?? 1;
    const borderOpacity = (cfg.cardBorderOpacity ?? 25) / 100;
    const glowType = cfg.cardGlowEffect ?? 'none';
    const shadowDepth = cfg.cardShadowDepth ?? 'deep-3d';

    root.style.setProperty('--card-custom-blur', `${blur}px`);
    root.style.setProperty('--card-custom-opacity', `${opacity}`);
    root.style.setProperty('--card-custom-radius', `${radius}px`);
    root.style.setProperty('--card-custom-border-width', `${borderWidth}px`);
    root.style.setProperty('--card-custom-border-opacity', `${borderOpacity}`);

    let shadowVal = '0 15px 45px rgba(0,0,0,0.35)';
    if (shadowDepth === 'flat') {
      shadowVal = 'none';
    } else if (shadowDepth === 'subtle') {
      shadowVal = '0 6px 20px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.15)';
    } else if (shadowDepth === 'medium') {
      shadowVal = '0 18px 50px -5px rgba(0,0,0,0.45), 0 8px 18px -6px rgba(0,0,0,0.3), inset 0 1px 1.5px rgba(255,255,255,0.2)';
    } else if (shadowDepth === 'deep-3d') {
      shadowVal = '0 35px 90px -10px rgba(0,0,0,0.75), 0 15px 35px -5px rgba(0,0,0,0.55), inset 0 1.5px 2px rgba(255,255,255,0.35)';
    } else if (shadowDepth === 'floating-glow') {
      const neonHex = cfg.activePalette?.primaryNeon || '#3b82f6';
      shadowVal = `0 45px 110px -15px rgba(0,0,0,0.85), 0 0 50px ${neonHex}66, inset 0 1.5px 2.5px rgba(255,255,255,0.4)`;
    }
    root.style.setProperty('--card-custom-shadow', shadowVal);
    root.setAttribute('data-card-glow', glowType);

    // 1. Header, Sidebar & Content Area Layer Variables
    const headerBlur = cfg.headerBlurAmount ?? blur;
    const headerOpacity = (cfg.headerBgOpacity ?? cfg.cardBgOpacity ?? 18) / 100;
    const sidebarBlur = cfg.sidebarBlurAmount ?? blur;
    const sidebarOpacity = (cfg.sidebarBgOpacity ?? cfg.cardBgOpacity ?? 18) / 100;
    const contentBlur = cfg.contentBlurAmount ?? blur;
    const contentOpacity = (cfg.contentBgOpacity ?? cfg.cardBgOpacity ?? 18) / 100;

    root.style.setProperty('--header-custom-blur', `${headerBlur}px`);
    root.style.setProperty('--header-custom-opacity', `${headerOpacity}`);
    root.style.setProperty('--sidebar-custom-blur', `${sidebarBlur}px`);
    root.style.setProperty('--sidebar-custom-opacity', `${sidebarOpacity}`);
    root.style.setProperty('--content-custom-blur', `${contentBlur}px`);
    root.style.setProperty('--content-custom-opacity', `${contentOpacity}`);

    // 2. Menu & Page Layer Card Variables
    const menuBlur = cfg.menuCardBlurAmount ?? blur;
    const menuOpacity = (cfg.menuCardBgOpacity ?? cfg.cardBgOpacity ?? 18) / 100;
    const menuBorderOpacity = (cfg.menuCardBorderOpacity ?? cfg.cardBorderOpacity ?? 25) / 100;

    root.style.setProperty('--menu-card-custom-blur', `${menuBlur}px`);
    root.style.setProperty('--menu-card-custom-opacity', `${menuOpacity}`);
    root.style.setProperty('--menu-card-custom-border-opacity', `${menuBorderOpacity}`);

    // 3. Floating Overlays (Pop-up, Tables, Lists, Components, Charts)
    const popupBlur = cfg.popupBlurAmount ?? (blur + 8);
    const popupOpacity = (cfg.popupBgOpacity ?? Math.min((cfg.cardBgOpacity ?? 18) + 25, 95)) / 100;
    const popupBorderOpacity = (cfg.popupBorderOpacity ?? 35) / 100;
    const popupShadowDepth = cfg.popupShadowDepth ?? 'floating-glow';

    root.style.setProperty('--popup-custom-blur', `${popupBlur}px`);
    root.style.setProperty('--popup-custom-opacity', `${popupOpacity}`);
    root.style.setProperty('--popup-custom-border-opacity', `${popupBorderOpacity}`);

    let popupShadowVal = '0 25px 75px rgba(0,0,0,0.65)';
    if (popupShadowDepth === 'flat') {
      popupShadowVal = 'none';
    } else if (popupShadowDepth === 'subtle') {
      popupShadowVal = '0 10px 30px rgba(0,0,0,0.3)';
    } else if (popupShadowDepth === 'medium') {
      popupShadowVal = '0 20px 55px rgba(0,0,0,0.45), inset 0 1px 1.5px rgba(255,255,255,0.2)';
    } else if (popupShadowDepth === 'deep-3d') {
      popupShadowVal = '0 38px 95px -10px rgba(0,0,0,0.8), 0 18px 40px -5px rgba(0,0,0,0.6), inset 0 1.5px 2px rgba(255,255,255,0.35)';
    } else if (popupShadowDepth === 'floating-glow') {
      const neonHex = cfg.activePalette?.primaryNeon || '#3b82f6';
      popupShadowVal = `0 45px 110px -10px rgba(0,0,0,0.85), 0 0 55px ${neonHex}77, inset 0 1.5px 2.5px rgba(255,255,255,0.4)`;
    }
    root.style.setProperty('--popup-custom-shadow', popupShadowVal);
    root.setAttribute('data-popup-glow', cfg.popupGlowEffect ?? cfg.cardGlowEffect ?? 'none');
  };

  // Persist to localStorage and sync theme whenever config changes
  useEffect(() => {
    try {
      // Don't save large blob URLs to localStorage to avoid QuotaExceededError
      const safeConfig = { ...config };
      if (safeConfig.mediaUrl && safeConfig.mediaUrl.startsWith('blob:')) {
        // keep mediaUrl in memory state only, save preview or metadata
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeConfig));
    } catch (e) {
      console.warn('Could not save wallpaper config to localStorage:', e);
    }

    if (config.autoSyncTheme && config.activePalette) {
      applyPaletteToTheme(config.activePalette);
    }

    applyCardStylesToRoot(config);
  }, [config]);

  // Live Adaptive Theme Effect: smoothly cycles through the video's color timeline phases
  useEffect(() => {
    if (!config.liveAdaptiveThemeEnabled || !config.colorTimeline || !config.colorTimeline.timelinePalette || config.colorTimeline.timelinePalette.length === 0) {
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      const paletteList = config.colorTimeline.timelinePalette;
      if (paletteList.length === 0) return;
      
      const current = paletteList[index % paletteList.length];
      if (!current || !current.color) return;

      setConfig(prev => {
        if (!prev.activePalette) return prev;
        
        const hex = current.color;
        // Simple hex-to-rgb conversion
        const r = parseInt(hex.slice(1, 3), 16) || 59;
        const g = parseInt(hex.slice(3, 5), 16) || 130;
        const b = parseInt(hex.slice(5, 7), 16) || 246;
        
        const newPalette = {
          ...prev.activePalette,
          primaryNeon: hex,
          glowRgb: `${r}, ${g}, ${b}`
        };
        
        return {
          ...prev,
          activePalette: newPalette
        };
      });
      
      index++;
    }, 3000);

    return () => clearInterval(interval);
  }, [config.liveAdaptiveThemeEnabled, config.colorTimeline]);

  const updateConfig = (updates: Partial<WallpaperConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...updates };

      // If preset changed, update activePalette to preset's palette
      if (updates.presetId && updates.sourceType === 'preset') {
        const preset = WALLPAPER_PRESETS.find(p => p.id === updates.presetId);
        if (preset) {
          updated.activePalette = preset.palette;
        }
      }

      // Add snapshot to history for undo/redo
      setHistory(hPrev => {
        const sliced = hPrev.slice(0, historyIndex + 1);
        return [...sliced, updated].slice(-30);
      });
      setHistoryIndex(hPrev => Math.min(hPrev + 1, 29));

      return updated;
    });
  };

  const resetToDefault = () => {
    setConfig(defaultWallpaperConfig);
    applyPaletteToTheme(defaultWallpaperConfig.activePalette);
  };

  return (
    <WallpaperContext.Provider
      value={{
        config,
        updateConfig,
        applyPaletteToTheme,
        applyTypographyToTheme,
        isWizardOpen,
        openWizard: () => setIsWizardOpen(true),
        closeWizard: () => setIsWizardOpen(false),
        resetToDefault,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        saveSnapshot,
        snapshots,
        loadSnapshot
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
}
