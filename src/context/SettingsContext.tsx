import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Yeni Ayar Yapısı
interface SettingMetadata {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'enum';
  scope: 'global' | 'tenant' | 'user' | 'session';
  default: any;
  validation?: any[];
  dependencies?: string[];
  updated_at?: string;
  updated_by?: string;
}

interface Settings {
  [key: string]: SettingMetadata;
}

interface SettingsContextType {
  settings: Settings;
  getSetting: (key: string) => any;
  updateSetting: (key: string, newValue: any) => Promise<void>;
  onSettingChange: (key: string, callback: (newValue: any) => void) => void;
  isLoading: boolean;
  activeFont: string;
  setActiveFont: (font: string) => void;
  activeAccent: string;
  setActiveAccent: (colorHex: string) => void;
  activeAccentName: string;
  setActiveAccentName: (name: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Event sistemi
const listeners: { [key: string]: ((val: any) => void)[] } = {};

// Bağımlılık Motoru
const checkDependencies = (key: string, newValue: any, settings: Settings) => {
  if (key === 'security.2fa.enabled' && newValue === true) {
    const phone = settings['user.phone']?.value;
    const authApp = settings['security.2fa.authenticator']?.value;
    if (!phone && !authApp) {
      throw new Error("2FA için telefon numarası veya authenticator uygulaması gerekli.");
    }
  }
};

// 11 Core Primary Colors
export const PRIMARY_COLORS = [
  { name: 'Siyah', hex: '#111111' },
  { name: 'Beyaz', hex: '#FCFBF9' },
  { name: 'Gri', hex: '#7E8A96' },
  { name: 'Kırmızı', hex: '#E12D39' },
  { name: 'Turuncu', hex: '#EA6B23' },
  { name: 'Sarı', hex: '#F1BF33' },
  { name: 'Mavi', hex: '#2B70E2' },
  { name: 'Mor', hex: '#8C3BE2' },
  { name: 'Lacivert', hex: '#1C3175' },
  { name: 'Yeşil', hex: '#269E4C' },
  { name: 'Kahverengi', hex: '#7A4B29' },
];

// Helper to blend HEX colors with mathematically precise weighting
export function blendColors(colors: { hex: string; weight: number }[]): string {
  let totalWeight = 0;
  let r = 0, g = 0, b = 0;

  colors.forEach(c => {
    totalWeight += c.weight;
    // parse hex
    const cleanHex = c.hex.replace('#', '');
    const cr = parseInt(cleanHex.substring(0, 2), 16);
    const cg = parseInt(cleanHex.substring(2, 4), 16);
    const cb = parseInt(cleanHex.substring(4, 6), 16);

    r += cr * c.weight;
    g += cg * c.weight;
    b += cb * c.weight;
  });

  r = Math.round(r / totalWeight);
  g = Math.round(g / totalWeight);
  b = Math.round(b / totalWeight);

  const hexR = Math.min(255, Math.max(0, r)).toString(16).padStart(2, '0');
  const hexG = Math.min(255, Math.max(0, g)).toString(16).padStart(2, '0');
  const hexB = Math.min(255, Math.max(0, b)).toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}`.toUpperCase();
}

// Generate the beautiful, structured 66 intermediate blended colors
export function generateIntermediateColors() {
  const list: { name: string; hex: string; formula: string; type: string }[] = [];
  const C = PRIMARY_COLORS;

  // We need exactly 66 intermediate colors. Let's build them systematically with beautiful, popular, highly harmonious names.
  // Group 1: Two-way blends (2'li Karışımlar) - 30 items
  const twoWayCombinations = [
    { indices: [6, 7], w: [0.5, 0.5], name: 'Okyanus Esintisi', type: "2'li Karışım" }, // Mavi + Mor
    { indices: [3, 4], w: [0.6, 0.4], name: 'Güneş Patlaması', type: "2'li Karışım" }, // Kırmızı + Turuncu
    { indices: [4, 5], w: [0.5, 0.5], name: 'Altın Kehribar', type: "2'li Karışım" }, // Turuncu + Sarı
    { indices: [6, 9], w: [0.5, 0.5], name: 'Turkuaz Dalga', type: "2'li Karışım" }, // Mavi + Yeşil
    { indices: [3, 7], w: [0.4, 0.6], name: 'Mistik Eflatun', type: "2'li Karışım" }, // Kırmızı + Mor
    { indices: [8, 6], w: [0.7, 0.3], name: 'Derin Safir', type: "2'li Karışım" }, // Lacivert + Mavi
    { indices: [9, 5], w: [0.6, 0.4], name: 'Fıstık Yeşili', type: "2'li Karışım" }, // Yeşil + Sarı
    { indices: [10, 5], w: [0.7, 0.3], name: 'Karamel', type: "2'li Karışım" }, // Kahverengi + Sarı
    { indices: [1, 2], w: [0.8, 0.2], name: 'Puslu Alabaster', type: "2'li Karışım" }, // Beyaz + Gri
    { indices: [1, 10], w: [0.9, 0.1], name: 'Sütlü Kahve', type: "2'li Karışım" }, // Beyaz + Kahve
    { indices: [3, 1], w: [0.4, 0.6], name: 'Pudra Pembe', type: "2'li Karışım" }, // Kırmızı + Beyaz
    { indices: [7, 1], w: [0.3, 0.7], name: 'Lila Rüyası', type: "2'li Karışım" }, // Mor + Beyaz
    { indices: [6, 1], w: [0.3, 0.7], name: 'Bebek Mavisi', type: "2'li Karışım" }, // Mavi + Beyaz
    { indices: [9, 1], w: [0.3, 0.7], name: 'Nane Şekeri', type: "2'li Karışım" }, // Yeşil + Beyaz
    { indices: [4, 1], w: [0.3, 0.7], name: 'Şeftali Çiçeği', type: "2'li Karışım" }, // Turuncu + Beyaz
    { indices: [0, 3], w: [0.5, 0.5], name: 'Koyu Bordo', type: "2'li Karışım" }, // Siyah + Kırmızı
    { indices: [0, 9], w: [0.6, 0.4], name: 'Haki Orman', type: "2'li Karışım" }, // Siyah + Yeşil
    { indices: [0, 6], w: [0.5, 0.5], name: 'Gece Mavisi', type: "2'li Karışım" }, // Siyah + Mavi
    { indices: [0, 7], w: [0.5, 0.5], name: 'Mürdüm', type: "2'li Karışım" }, // Siyah + Mor
    { indices: [8, 9], w: [0.5, 0.5], name: 'Zümrüt Deniz', type: "2'li Karışım" }, // Lacivert + Yeşil
    { indices: [8, 10], w: [0.6, 0.4], name: 'Maun Kabuğu', type: "2'li Karışım" }, // Lacivert + Kahverengi
    { indices: [2, 6], w: [0.5, 0.5], name: 'Çelik Gri', type: "2'li Karışım" }, // Gri + Mavi
    { indices: [2, 9], w: [0.4, 0.6], name: 'Adaçayı', type: "2'li Karışım" }, // Gri + Yeşil
    { indices: [2, 3], w: [0.4, 0.6], name: 'Kül Kırmızı', type: "2'li Karışım" }, // Gri + Kırmızı
    { indices: [2, 7], w: [0.4, 0.6], name: 'Puslu Lavanta', type: "2'li Karışım" }, // Gri + Mor
    { indices: [10, 3], w: [0.6, 0.4], name: 'Kiremit Rengi', type: "2'li Karışım" }, // Kahve + Kırmızı
    { indices: [10, 9], w: [0.5, 0.5], name: 'Zeytin Dalı', type: "2'li Karışım" }, // Kahve + Yeşil
    { indices: [6, 5], w: [0.7, 0.3], name: 'Cam Göbeği', type: "2'li Karışım" }, // Mavi + Sarı
    { indices: [7, 5], w: [0.7, 0.3], name: 'Hardal Moru', type: "2'li Karışım" }, // Mor + Sarı
    { indices: [8, 4], w: [0.7, 0.3], name: 'Mercan Lacivert', type: "2'li Karışım" }, // Lacivert + Turuncu
  ];

  // Group 2: Three-way blends (3'lü Karışımlar) - 24 items
  const threeWayCombinations = [
    { indices: [6, 7, 1], w: [0.4, 0.3, 0.3], name: 'Peros Meltemi', type: "3'lü Karışım" }, // Mavi + Mor + Beyaz
    { indices: [3, 4, 5], w: [0.4, 0.4, 0.2], name: 'Volkan Külü', type: "3'lü Karışım" }, // Kırmızı + Turuncu + Sarı
    { indices: [9, 6, 1], w: [0.3, 0.3, 0.4], name: 'Buzul Yeşili', type: "3'lü Karışım" }, // Yeşil + Mavi + Beyaz
    { indices: [10, 3, 5], w: [0.4, 0.3, 0.3], name: 'Sonbahar Yaprağı', type: "3'lü Karışım" }, // Kahve + Kırmızı + Sarı
    { indices: [8, 7, 1], w: [0.5, 0.3, 0.2], name: 'Gece Gezegeni', type: "3'lü Karışım" }, // Lacivert + Mor + Beyaz
    { indices: [0, 6, 9], w: [0.4, 0.3, 0.3], name: 'Atlantis', type: "3'lü Karışım" }, // Siyah + Mavi + Yeşil
    { indices: [0, 3, 7], w: [0.4, 0.3, 0.3], name: 'Karanlık Nebula', type: "3'lü Karışım" }, // Siyah + Kırmızı + Mor
    { indices: [2, 10, 1], w: [0.3, 0.4, 0.3], name: 'Keten Dokusu', type: "3'lü Karışım" }, // Gri + Kahve + Beyaz
    { indices: [6, 9, 5], w: [0.4, 0.4, 0.2], name: 'Limon Otu', type: "3'lü Karışım" }, // Mavi + Yeşil + Sarı
    { indices: [3, 7, 1], w: [0.3, 0.3, 0.4], name: 'Gül Kurusu', type: "3'lü Karışım" }, // Kırmızı + Mor + Beyaz
    { indices: [10, 9, 1], w: [0.4, 0.2, 0.4], name: 'Ada Toprağı', type: "3'lü Karışım" }, // Kahve + Yeşil + Beyaz
    { indices: [8, 6, 9], w: [0.4, 0.3, 0.3], name: 'Derin Doğa', type: "3'lü Karışım" }, // Lacivert + Mavi + Yeşil
    { indices: [7, 4, 1], w: [0.3, 0.3, 0.4], name: 'Somon Lavanta', type: "3'lü Karışım" }, // Mor + Turuncu + Beyaz
    { indices: [8, 3, 5], w: [0.4, 0.3, 0.3], name: 'Kozmik Şafak', type: "3'lü Karışım" }, // Lacivert + Kırmızı + Sarı
    { indices: [10, 4, 2], w: [0.4, 0.4, 0.2], name: 'Kızıl Toprak', type: "3'lü Karışım" }, // Kahve + Turuncu + Gri
    { indices: [0, 8, 3], w: [0.4, 0.4, 0.2], name: 'Kraliyet Ateşi', type: "3'lü Karışım" }, // Siyah + Lacivert + Kırmızı
    { indices: [9, 10, 5], w: [0.4, 0.3, 0.3], name: 'Zeytin Bahçesi', type: "3'lü Karışım" }, // Yeşil + Kahve + Sarı
    { indices: [6, 7, 2], w: [0.4, 0.4, 0.2], name: 'Gümüş Gece', type: "3'lü Karışım" }, // Mavi + Mor + Gri
    { indices: [3, 9, 5], w: [0.3, 0.3, 0.4], name: 'Tropikal Bahçe', type: "3'lü Karışım" }, // Kırmızı + Yeşil + Sarı
    { indices: [10, 7, 1], w: [0.4, 0.3, 0.3], name: 'Sıcak Vizon', type: "3'lü Karışım" }, // Kahve + Mor + Beyaz
    { indices: [8, 9, 2], w: [0.4, 0.4, 0.2], name: 'Arktik Yosun', type: "3'lü Karışım" }, // Lacivert + Yeşil + Gri
    { indices: [4, 9, 1], w: [0.3, 0.3, 0.4], name: 'Fesleğen Portakal', type: "3'lü Karışım" }, // Turuncu + Yeşil + Beyaz
    { indices: [3, 8, 1], w: [0.3, 0.4, 0.3], name: 'Puslu Çilek', type: "3'lü Karışım" }, // Kırmızı + Lacivert + Beyaz
    { indices: [6, 10, 1], w: [0.4, 0.3, 0.3], name: 'Kumlu Deniz', type: "3'lü Karışım" }, // Mavi + Kahve + Beyaz
  ];

  // Group 3: Four-way blends (4'lü Karışımlar) - 12 items
  const fourWayCombinations = [
    { indices: [6, 7, 9, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Egzotik Sualtı', type: "4'lü Karışım" }, // Mavi + Mor + Yeşil + Beyaz
    { indices: [3, 4, 5, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Günbatımı Meltemi', type: "4'lü Karışım" }, // Kırmızı + Turuncu + Sarı + Beyaz
    { indices: [8, 9, 10, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Kozmik Vadi', type: "4'lü Karışım" }, // Lacivert + Yeşil + Kahve + Beyaz
    { indices: [0, 3, 7, 6], w: [0.3, 0.3, 0.2, 0.2], name: 'Süpernova', type: "4'lü Karışım" }, // Siyah + Kırmızı + Mor + Mavi
    { indices: [10, 3, 9, 5], w: [0.3, 0.3, 0.2, 0.2], name: 'Safarid', type: "4'lü Karışım" }, // Kahve + Kırmızı + Yeşil + Sarı
    { indices: [2, 6, 7, 1], w: [0.2, 0.3, 0.3, 0.2], name: 'Gümüş Bulut', type: "4'lü Karışım" }, // Gri + Mavi + Mor + Beyaz
    { indices: [8, 6, 3, 5], w: [0.3, 0.3, 0.2, 0.2], name: 'Altın Galaksi', type: "4'lü Karışım" }, // Lacivert + Mavi + Kırmızı + Sarı
    { indices: [9, 10, 5, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Vaha Rüzgarı', type: "4'lü Karışım" }, // Yeşil + Kahve + Sarı + Beyaz
    { indices: [0, 8, 9, 2], w: [0.3, 0.3, 0.2, 0.2], name: 'Obsidyen Orman', type: "4'lü Karışım" }, // Siyah + Lacivert + Yeşil + Gri
    { indices: [4, 7, 10, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Baharat Yolu', type: "4'lü Karışım" }, // Turuncu + Mor + Kahve + Beyaz
    { indices: [3, 6, 8, 1], w: [0.3, 0.2, 0.3, 0.2], name: 'Derin Koral', type: "4'lü Karışım" }, // Kırmızı + Mavi + Lacivert + Beyaz
    { indices: [7, 9, 2, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Sihirli Vadi', type: "4'lü Karışım" }, // Mor + Yeşil + Gri + Beyaz
  ];

  // Helper mapping index to core color
  const resolveFormula = (indices: number[], weights: number[]) => {
    return indices.map((idx, i) => `${weights[i] * 100}% ${C[idx].name}`).join(' + ');
  };

  // Build twoWay
  twoWayCombinations.forEach(comb => {
    const colorSpec = comb.indices.map((idx, i) => ({ hex: C[idx].hex, weight: comb.w[i] }));
    list.push({
      name: comb.name,
      hex: blendColors(colorSpec),
      formula: resolveFormula(comb.indices, comb.w),
      type: comb.type
    });
  });

  // Build threeWay
  threeWayCombinations.forEach(comb => {
    const colorSpec = comb.indices.map((idx, i) => ({ hex: C[idx].hex, weight: comb.w[i] }));
    list.push({
      name: comb.name,
      hex: blendColors(colorSpec),
      formula: resolveFormula(comb.indices, comb.w),
      type: comb.type
    });
  });

  // Build fourWay
  fourWayCombinations.forEach(comb => {
    const colorSpec = comb.indices.map((idx, i) => ({ hex: C[idx].hex, weight: comb.w[i] }));
    list.push({
      name: comb.name,
      hex: blendColors(colorSpec),
      formula: resolveFormula(comb.indices, comb.w),
      type: comb.type
    });
  });

  return list;
}

// Complete list of 10 modern premium fonts with description and stack mappings
export const PREMIUM_FONTS = [
  { id: 'outfit', name: 'Outfit', stack: '"Outfit", sans-serif', description: 'Modern, geometrik, cana yakın ve estetik bir teknoloji yüzü.' },
  { id: 'inter', name: 'Inter', stack: '"Inter", sans-serif', description: 'Görsel netlik ve okunabilirlik odaklı, endüstri standardı arayüz fontu.' },
  { id: 'geist', name: 'Geist Sans', stack: '"Geist Variable", sans-serif', description: 'Minimalist, neo-grotesk ve premium geliştirici hissi.' },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', stack: '"JetBrains Mono", monospace', description: 'Teknik tablolar, rakamlar ve kod blokları için kusursuz keskinlik.' },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', stack: '"Plus Jakarta Sans", sans-serif', description: 'Modern teknoloji SaaS ve inovatif dijital platform havası.' },
  { id: 'playfair', name: 'Playfair Display', stack: '"Playfair Display", serif', description: 'Eski dünya asaletini yansıtan, lüks ve yüksek kontrastlı serif.' },
  { id: 'syne', name: 'Syne', stack: '"Syne", sans-serif', description: 'Sanatsal, cesur ve yüksek yaratıcılığa sahip karakteristik display.' },
  { id: 'space-grotesk', name: 'Space Grotesk', stack: '"Space Grotesk", sans-serif', description: 'Fütüristik ve eğlenceli, monokromatik uzay çağı geometrisi.' },
  { id: 'manrope', name: 'Manrope', stack: '"Manrope", sans-serif', description: 'Yumuşak, dengeli ve uzun okumalarda gözü yormayan şık tasarım.' },
  { id: 'cinzel', name: 'Cinzel', stack: '"Cinzel", serif', description: 'Antik Roma esintili, klasik oranlara sahip premium lüks serif.' },
];

const initialSettings: Settings = {
  'user.profile.full_name': { key: 'user.profile.full_name', value: 'Engin Nalbant', type: 'string', scope: 'user', default: '' },
  'user.account.email': { key: 'user.account.email', value: 'enginnalbant9@gmail.com', type: 'string', scope: 'user', default: '' },
  'user.account.plan': { key: 'user.account.plan', value: 'Pro', type: 'string', scope: 'user', default: 'Free' },

  'theme.mode': { key: 'theme.mode', value: 'system', type: 'enum', scope: 'user', default: 'system', validation: ['light', 'dark', 'system'] },
  'sidebar_position': { key: 'sidebar_position', value: 'left', type: 'enum', scope: 'user', default: 'left', validation: ['left', 'right', 'bottom'] },
  'ui.settings_panel_position': { key: 'ui.settings_panel_position', value: 'right', type: 'enum', scope: 'user', default: 'right', validation: ['left', 'right', 'bottom'] },
  'theme.accent_color': { key: 'theme.accent_color', value: '#E2725B', type: 'string', scope: 'user', default: '#E2725B' },
  'performance.fps': { key: 'performance.fps', value: 120, type: 'number', scope: 'user', default: 120, validation: [60, 90, 120] },
  'ui.mobile_compact': { key: 'ui.mobile_compact', value: true, type: 'boolean', scope: 'user', default: true },

  'app.language': { key: 'app.language', value: 'tr', type: 'enum', scope: 'user', default: 'tr', validation: ['tr', 'en'] },
  'app.notifications.enabled': { key: 'app.notifications.enabled', value: true, type: 'boolean', scope: 'user', default: true },

  'security.2fa.enabled': { key: 'security.2fa.enabled', value: false, type: 'boolean', scope: 'user', default: false },
  'security.backup.auto_enabled': { key: 'security.backup.auto_enabled', value: true, type: 'boolean', scope: 'user', default: true },

  'admin.maintenance_mode': { key: 'admin.maintenance_mode', value: false, type: 'boolean', scope: 'user', default: false },
  'admin.access_level': { key: 'admin.access_level', value: 'admin', type: 'enum', scope: 'user', default: 'user', validation: ['user', 'admin'] },
  
  'modules.dashboard.active': { key: 'modules.dashboard.active', value: true, type: 'boolean', scope: 'user', default: true },
  'modules.analytics.active': { key: 'modules.analytics.active', value: true, type: 'boolean', scope: 'user', default: true },
  'modules.projects.active': { key: 'modules.projects.active', value: true, type: 'boolean', scope: 'user', default: true },
  'modules.team.active': { key: 'modules.team.active', value: false, type: 'boolean', scope: 'user', default: false },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Custom states for dynamic theme engine
  const [activeFont, setActiveFontState] = useState<string>(() => localStorage.getItem('apex_active_font') || 'inter');
  const [activeAccent, setActiveAccentState] = useState<string>(() => localStorage.getItem('apex_active_accent') || '#E2725B');
  const [activeAccentName, setActiveAccentNameState] = useState<string>(() => localStorage.getItem('apex_active_accent_name') || 'Terracotta');

  const getSetting = (key: string) => {
    return settings[key]?.value ?? settings[key]?.default;
  };

  const onSettingChange = (key: string, callback: (newValue: any) => void) => {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
  };

  const updateSetting = async (key: string, newValue: any) => {
    checkDependencies(key, newValue, settings);
    console.log(`[AUDIT LOG] ${new Date().toISOString()} - Setting ${key} changed to ${newValue}`);

    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value: newValue, updated_at: new Date().toISOString() }
    }));

    if (listeners[key]) {
      listeners[key].forEach(cb => cb(newValue));
    }
  };

  const setActiveFont = (fontId: string) => {
    setActiveFontState(fontId);
    localStorage.setItem('apex_active_font', fontId);
  };

  const setActiveAccent = (colorHex: string) => {
    setActiveAccentState(colorHex);
    localStorage.setItem('apex_active_accent', colorHex);
    // Also sync standard setting
    updateSetting('theme.accent_color', colorHex);
  };

  const setActiveAccentName = (name: string) => {
    setActiveAccentNameState(name);
    localStorage.setItem('apex_active_accent_name', name);
  };

  // Inject Accent Color & Active Font dynamically into the DOM
  useEffect(() => {
    const root = window.document.documentElement;

    // Apply Active Accent Color to CSS variables
    root.style.setProperty('--focus-neon', activeAccent);
    root.style.setProperty('--focus-neon-val', activeAccent);
    root.style.setProperty('--color-accent', activeAccent);

    // Dynamic focus deep and main color scaling
    root.style.setProperty('--focus-main-val', activeAccent);
    root.style.setProperty('--focus-deep-val', activeAccent);

    // Apply Typography
    const fontObj = PREMIUM_FONTS.find(f => f.id === activeFont) || PREMIUM_FONTS[1];
    root.style.setProperty('--font-sans-val', fontObj.stack);
    root.style.setProperty('--font-display-val', fontObj.stack);
    root.style.setProperty('--font-heading', fontObj.stack);

  }, [activeFont, activeAccent]);

  // Tema Değişikliğini Uygula
  useEffect(() => {
    const applyTheme = (mode: string) => {
      const root = window.document.documentElement;
      let theme = mode;
      
      if (mode === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      if (theme === 'dark') {
        root.classList.add('dark');
        root.style.setProperty('--app-bg', '#050505');
        root.style.setProperty('--card-bg', 'rgba(13, 14, 18, 0.8)');
        root.style.setProperty('--border-val', 'rgba(148, 153, 176, 0.15)');
        root.style.setProperty('--text-primary-val', '#F8F9FB');
        root.style.setProperty('--text-secondary-val', '#9499B0');
      } else {
        root.classList.remove('dark');
        // Elegant Warm White / Cream Alabaster
        root.style.setProperty('--app-bg', '#FCFAF7');
        root.style.setProperty('--card-bg', 'rgba(255, 253, 251, 0.9)');
        root.style.setProperty('--border-val', 'rgba(141, 120, 100, 0.12)');
        root.style.setProperty('--text-primary-val', '#272522');
        root.style.setProperty('--text-secondary-val', '#7C7267');
      }
    };

    const currentMode = settings['theme.mode']?.value || 'system';
    applyTheme(currentMode);

    if (currentMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings['theme.mode']?.value]);

  // Mobil Performans & FPS Kalibrasyonu Uygula
  useEffect(() => {
    const fps = settings['performance.fps']?.value || 120;
    const root = window.document.documentElement;
    root.classList.remove('fps-120', 'fps-90', 'fps-60');
    root.classList.add(`fps-${fps}`);
    root.dataset.fps = String(fps);
    root.style.setProperty('--target-fps', `${fps}`);
    root.style.setProperty('--frame-duration', `${(1000 / fps).toFixed(2)}ms`);
  }, [settings['performance.fps']?.value]);

  return (
    <SettingsContext.Provider value={{
      settings,
      getSetting,
      updateSetting,
      onSettingChange,
      isLoading,
      activeFont,
      setActiveFont,
      activeAccent,
      setActiveAccent,
      activeAccentName,
      setActiveAccentName
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
