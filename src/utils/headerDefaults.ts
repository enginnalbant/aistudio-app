import { HeaderPreferences, HeaderProfile } from '../types/header';
import { GLASS_PRESETS } from './navigationDefaults';

export const DEFAULT_HEADER_LAYOUT = {
  height: 56,
  outerMargin: 12,
  cornerRadius: 16,
  paddingX: 16,
  gap: 8,
};

export const DEFAULT_HEADER_APPEARANCE = {
  density: 'comfortable' as const,
  iconSize: 16,
  tooltipsEnabled: true,
  showMobileLogo: true,
};

export const DEFAULT_HEADER_WIDGETS: Record<string, boolean> = {
  homeButton: true,
  searchBar: true,
  mobileLogo: true,
  environmentalWidget: true,
  fpsSelector: true,
  languageSelector: true,
  themeToggle: true,
  notifications: true,
  calendar: true,
  wallpaperWizard: true,
  headerStudioButton: true,
};

export const DEFAULT_HEADER_WIDGET_ORDER = [
  'environmentalWidget',
  'fpsSelector',
  'languageSelector',
  'themeToggle',
  'notifications',
  'calendar',
  'wallpaperWizard',
  'headerStudioButton',
];

export const BUILTIN_HEADER_PROFILES: HeaderProfile[] = [
  {
    id: 'default-glass',
    name: 'Liquid Glass Standard',
    description: 'Buzlu cam dokusu, tüm fonksiyonel araçlar ve dengeli marjlar.',
    iconName: 'Sparkles',
    layout: { ...DEFAULT_HEADER_LAYOUT },
    glassConfig: { ...GLASS_PRESETS.minimal },
    widgets: { ...DEFAULT_HEADER_WIDGETS },
    widgetOrder: [...DEFAULT_HEADER_WIDGET_ORDER],
    appearance: { ...DEFAULT_HEADER_APPEARANCE },
  },
  {
    id: 'minimal-compact',
    name: 'Ultra Minimalist',
    description: 'Daha ince yükseklik, sadece arama ve bildirimler görünür.',
    iconName: 'Minimize2',
    layout: {
      height: 48,
      outerMargin: 8,
      cornerRadius: 12,
      paddingX: 12,
      gap: 6,
    },
    glassConfig: { ...GLASS_PRESETS['ultra-thin'] },
    widgets: {
      homeButton: true,
      searchBar: true,
      mobileLogo: false,
      environmentalWidget: false,
      fpsSelector: false,
      languageSelector: false,
      themeToggle: true,
      notifications: true,
      calendar: false,
      wallpaperWizard: false,
      headerStudioButton: true,
    },
    widgetOrder: ['themeToggle', 'notifications', 'headerStudioButton'],
    appearance: {
      density: 'compact',
      iconSize: 14,
      tooltipsEnabled: true,
      showMobileLogo: false,
    },
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon Glass',
    description: 'Yüksek kırılma ve doygunlukla parıldayan cyberpunk tema.',
    iconName: 'Zap',
    layout: {
      height: 60,
      outerMargin: 16,
      cornerRadius: 20,
      paddingX: 20,
      gap: 10,
    },
    glassConfig: { ...GLASS_PRESETS.frosted, saturation: 160, borderOpacity: 40 },
    widgets: { ...DEFAULT_HEADER_WIDGETS },
    widgetOrder: [...DEFAULT_HEADER_WIDGET_ORDER],
    appearance: { ...DEFAULT_HEADER_APPEARANCE },
  },
  {
    id: 'executive-pro',
    name: 'Executive Workspace',
    description: 'Genişletilmiş yüksek kalite yüzey, FPS ve çevresel araçlar ön planda.',
    iconName: 'Sliders',
    layout: {
      height: 64,
      outerMargin: 16,
      cornerRadius: 22,
      paddingX: 24,
      gap: 12,
    },
    glassConfig: { ...GLASS_PRESETS.thick },
    widgets: { ...DEFAULT_HEADER_WIDGETS },
    widgetOrder: [...DEFAULT_HEADER_WIDGET_ORDER],
    appearance: {
      density: 'spacious',
      iconSize: 18,
      tooltipsEnabled: true,
      showMobileLogo: true,
    },
  },
];

export const DEFAULT_HEADER_PREFERENCES: HeaderPreferences = {
  version: 1,
  applyMode: 'live',
  activeProfileId: 'default-glass',
  layout: { ...DEFAULT_HEADER_LAYOUT },
  glassConfig: { ...GLASS_PRESETS.minimal },
  widgets: { ...DEFAULT_HEADER_WIDGETS },
  widgetOrder: [...DEFAULT_HEADER_WIDGET_ORDER],
  appearance: { ...DEFAULT_HEADER_APPEARANCE },
  customProfiles: [],
};
