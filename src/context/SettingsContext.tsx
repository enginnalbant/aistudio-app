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

interface SystemAdvice {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  actionKey?: string;
  actionValue?: any;
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

  // Advanced Diagnostics & System parameters
  getStorageUsage: () => { usedBytes: number; totalBytes: number; keyCount: number };
  clearSystemCache: () => void;
  getSystemHealthAdvice: () => SystemAdvice[];
  executeAiCommand: (command: string) => { success: boolean; message: string; modifiedKeys: string[] };
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

  const threeWayCombinations = [
    { indices: [6, 7, 1], w: [0.4, 0.3, 0.3], name: 'Peros Meltemi', type: "3'lü Karışım" },
    { indices: [3, 4, 5], w: [0.4, 0.4, 0.2], name: 'Volkan Külü', type: "3'lü Karışım" },
    { indices: [9, 6, 1], w: [0.3, 0.3, 0.4], name: 'Buzul Yeşili', type: "3'lü Karışım" },
    { indices: [10, 3, 5], w: [0.4, 0.3, 0.3], name: 'Sonbahar Yaprağı', type: "3'lü Karışım" },
    { indices: [8, 7, 1], w: [0.5, 0.3, 0.2], name: 'Gece Gezegeni', type: "3'lü Karışım" },
    { indices: [0, 6, 9], w: [0.4, 0.3, 0.3], name: 'Atlantis', type: "3'lü Karışım" },
    { indices: [0, 3, 7], w: [0.4, 0.3, 0.3], name: 'Karanlık Nebula', type: "3'lü Karışım" },
    { indices: [2, 10, 1], w: [0.3, 0.4, 0.3], name: 'Keten Dokusu', type: "3'lü Karışım" },
    { indices: [6, 9, 5], w: [0.4, 0.4, 0.2], name: 'Limon Otu', type: "3'lü Karışım" },
    { indices: [3, 7, 1], w: [0.3, 0.3, 0.4], name: 'Gül Kurusu', type: "3'lü Karışım" },
    { indices: [10, 9, 1], w: [0.4, 0.2, 0.4], name: 'Ada Toprağı', type: "3'lü Karışım" },
    { indices: [8, 6, 9], w: [0.4, 0.3, 0.3], name: 'Derin Doğa', type: "3'lü Karışım" },
    { indices: [7, 4, 1], w: [0.3, 0.3, 0.4], name: 'Somon Lavanta', type: "3'lü Karışım" },
    { indices: [8, 3, 5], w: [0.4, 0.3, 0.3], name: 'Kozmik Şafak', type: "3'lü Karışım" },
    { indices: [10, 4, 2], w: [0.4, 0.4, 0.2], name: 'Kızıl Toprak', type: "3'lü Karışım" },
    { indices: [0, 8, 3], w: [0.4, 0.4, 0.2], name: 'Kraliyet Ateşi', type: "3'lü Karışım" },
    { indices: [9, 10, 5], w: [0.4, 0.3, 0.3], name: 'Zeytin Bahçesi', type: "3'lü Karışım" },
    { indices: [6, 7, 2], w: [0.4, 0.4, 0.2], name: 'Gümüş Gece', type: "3'lü Karışım" },
    { indices: [3, 9, 5], w: [0.3, 0.3, 0.4], name: 'Tropikal Bahçe', type: "3'lü Karışım" },
    { indices: [10, 7, 1], w: [0.4, 0.3, 0.3], name: 'Sıcak Vizon', type: "3'lü Karışım" },
    { indices: [8, 9, 2], w: [0.4, 0.4, 0.2], name: 'Arktik Yosun', type: "3'lü Karışım" },
    { indices: [4, 9, 1], w: [0.3, 0.3, 0.4], name: 'Fesleğen Portakal', type: "3'lü Karışım" },
    { indices: [3, 8, 1], w: [0.3, 0.4, 0.3], name: 'Puslu Çilek', type: "3'lü Karışım" },
    { indices: [6, 10, 1], w: [0.4, 0.3, 0.3], name: 'Kumlu Deniz', type: "3'lü Karışım" },
  ];

  const fourWayCombinations = [
    { indices: [6, 7, 9, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Egzotik Sualtı', type: "4'lü Karışım" },
    { indices: [3, 4, 5, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Günbatımı Meltemi', type: "4'lü Karışım" },
    { indices: [8, 9, 10, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Kozmik Vadi', type: "4'lü Karışım" },
    { indices: [0, 3, 7, 6], w: [0.3, 0.3, 0.2, 0.2], name: 'Süpernova', type: "4'lü Karışım" },
    { indices: [10, 3, 9, 5], w: [0.3, 0.3, 0.2, 0.2], name: 'Safarid', type: "4'lü Karışım" },
    { indices: [2, 6, 7, 1], w: [0.2, 0.3, 0.3, 0.2], name: 'Gümüş Bulut', type: "4'lü Karışım" },
    { indices: [8, 6, 3, 5], w: [0.3, 0.3, 0.2, 0.2], name: 'Altın Galaksi', type: "4'lü Karışım" },
    { indices: [9, 10, 5, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Vaha Rüzgarı', type: "4'lü Karışım" },
    { indices: [0, 8, 9, 2], w: [0.3, 0.3, 0.2, 0.2], name: 'Obsidyen Orman', type: "4'lü Karışım" },
    { indices: [4, 7, 10, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Baharat Yolu', type: "4'lü Karışım" },
    { indices: [3, 6, 8, 1], w: [0.3, 0.2, 0.3, 0.2], name: 'Derin Koral', type: "4'lü Karışım" },
    { indices: [7, 9, 2, 1], w: [0.3, 0.3, 0.2, 0.2], name: 'Sihirli Vadi', type: "4'lü Karışım" },
  ];

  const resolveFormula = (indices: number[], weights: number[]) => {
    return indices.map((idx, i) => `${weights[i] * 100}% ${C[idx].name}`).join(' + ');
  };

  twoWayCombinations.forEach(comb => {
    const colorSpec = comb.indices.map((idx, i) => ({ hex: C[idx].hex, weight: comb.w[i] }));
    list.push({
      name: comb.name,
      hex: blendColors(colorSpec),
      formula: resolveFormula(comb.indices, comb.w),
      type: comb.type
    });
  });

  threeWayCombinations.forEach(comb => {
    const colorSpec = comb.indices.map((idx, i) => ({ hex: C[idx].hex, weight: comb.w[i] }));
    list.push({
      name: comb.name,
      hex: blendColors(colorSpec),
      formula: resolveFormula(comb.indices, comb.w),
      type: comb.type
    });
  });

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
  // Profil & Hesap (3)
  'user.profile.full_name': { key: 'user.profile.full_name', value: 'Engin Nalbant', type: 'string', scope: 'user', default: '' },
  'user.account.email': { key: 'user.account.email', value: 'enginnalbant9@gmail.com', type: 'string', scope: 'user', default: '' },
  'user.account.plan': { key: 'user.account.plan', value: 'Pro', type: 'string', scope: 'user', default: 'Free' },

  // Görünüm & Tema (8)
  'theme.mode': { key: 'theme.mode', value: 'system', type: 'enum', scope: 'user', default: 'system', validation: ['light', 'dark', 'system'] },
  'sidebar_position': { key: 'sidebar_position', value: 'left', type: 'enum', scope: 'user', default: 'left', validation: ['left', 'right', 'bottom'] },
  'theme.accent_color': { key: 'theme.accent_color', value: '#3B82F6', type: 'string', scope: 'user', default: '#3B82F6' },
  'theme.high_contrast': { key: 'theme.high_contrast', value: false, type: 'boolean', scope: 'user', default: false },
  'theme.dark_sidebar': { key: 'theme.dark_sidebar', value: true, type: 'boolean', scope: 'user', default: true },
  'theme.glow_effects': { key: 'theme.glow_effects', value: true, type: 'boolean', scope: 'user', default: true },
  'theme.card_border_radius': { key: 'theme.card_border_radius', value: 18, type: 'number', scope: 'user', default: 18 },
  'theme.grid_style': { key: 'theme.grid_style', value: 'cozy', type: 'enum', scope: 'user', default: 'cozy', validation: ['cozy', 'compact', 'spacious'] },

  // Performans & Donanım (5)
  'performance.fps': { key: 'performance.fps', value: 120, type: 'number', scope: 'user', default: 120, validation: [60, 90, 120] },
  'performance.hardware_acceleration': { key: 'performance.hardware_acceleration', value: true, type: 'boolean', scope: 'user', default: true },
  'performance.image_quality': { key: 'performance.image_quality', value: 'high', type: 'enum', scope: 'user', default: 'high', validation: ['low', 'medium', 'high'] },
  'performance.lazy_load_widgets': { key: 'performance.lazy_load_widgets', value: true, type: 'boolean', scope: 'user', default: true },
  'performance.animation_easing': { key: 'performance.animation_easing', value: 'smooth', type: 'enum', scope: 'user', default: 'smooth', validation: ['smooth', 'linear', 'elastic'] },

  // Gelişmiş UI & Düzen (5)
  'ui.mobile_compact': { key: 'ui.mobile_compact', value: true, type: 'boolean', scope: 'user', default: true },
  'ui.animation_speed': { key: 'ui.animation_speed', value: '0.4s', type: 'enum', scope: 'user', default: '0.4s', validation: ['0.2s', '0.4s', '0.8s'] },
  'ui.glass_blur': { key: 'ui.glass_blur', value: 25, type: 'number', scope: 'user', default: 25 },
  'ui.sidebar_default': { key: 'ui.sidebar_default', value: 'expanded', type: 'enum', scope: 'user', default: 'expanded', validation: ['expanded', 'collapsed'] },
  'ui.floating_dock_enabled': { key: 'ui.floating_dock_enabled', value: true, type: 'boolean', scope: 'user', default: true },

  // Finansal Ayarlar (10)
  'finance.default_currency': { key: 'finance.default_currency', value: 'TRY', type: 'enum', scope: 'user', default: 'TRY', validation: ['TRY', 'USD', 'EUR', 'GBP'] },
  'finance.budget_alert_threshold': { key: 'finance.budget_alert_threshold', value: 80, type: 'number', scope: 'user', default: 80 },
  'finance.auto_save_rate': { key: 'finance.auto_save_rate', value: 15, type: 'number', scope: 'user', default: 15 },
  'finance.investment_risk_profile': { key: 'finance.investment_risk_profile', value: 'moderate', type: 'enum', scope: 'user', default: 'moderate', validation: ['conservative', 'moderate', 'aggressive'] },
  'finance.tax_auto_deduct': { key: 'finance.tax_auto_deduct', value: false, type: 'boolean', scope: 'user', default: false },
  'finance.auto_category_rules': { key: 'finance.auto_category_rules', value: true, type: 'boolean', scope: 'user', default: true },
  'finance.ledger_view_mode': { key: 'finance.ledger_view_mode', value: 'advanced', type: 'enum', scope: 'user', default: 'advanced', validation: ['simple', 'advanced'] },
  'finance.saving_target_months': { key: 'finance.saving_target_months', value: 12, type: 'number', scope: 'user', default: 12 },
  'finance.debt_priority': { key: 'finance.debt_priority', value: 'avalanche', type: 'enum', scope: 'user', default: 'avalanche', validation: ['avalanche', 'snowball'] },
  'finance.recurrent_transactions_auto_post': { key: 'finance.recurrent_transactions_auto_post', value: true, type: 'boolean', scope: 'user', default: true },

  // Yapay Zeka (AI) Tercihleri (7)
  'ai.personality': { key: 'ai.personality', value: 'profesyonel', type: 'enum', scope: 'user', default: 'profesyonel', validation: ['profesyonel', 'sarkastik', 'motivasyonel', 'minimalist'] },
  'ai.max_tokens_per_query': { key: 'ai.max_tokens_per_query', value: 1500, type: 'number', scope: 'user', default: 1500 },
  'ai.voice_enabled': { key: 'ai.voice_enabled', value: false, type: 'boolean', scope: 'user', default: false },
  'ai.voice_gender': { key: 'ai.voice_gender', value: 'female', type: 'enum', scope: 'user', default: 'female', validation: ['male', 'female'] },
  'ai.speech_rate': { key: 'ai.speech_rate', value: 1.0, type: 'number', scope: 'user', default: 1.0 },
  'ai.auto_proactive_briefing': { key: 'ai.auto_proactive_briefing', value: true, type: 'boolean', scope: 'user', default: true },
  'ai.gemini_temperature': { key: 'ai.gemini_temperature', value: 0.7, type: 'number', scope: 'user', default: 0.7 },

  // Bildirim Tercihleri (5)
  'app.notifications.enabled': { key: 'app.notifications.enabled', value: true, type: 'boolean', scope: 'user', default: true },
  'app.notifications.sound_enabled': { key: 'app.notifications.sound_enabled', value: true, type: 'boolean', scope: 'user', default: true },
  'app.notifications.email_digest': { key: 'app.notifications.email_digest', value: 'weekly', type: 'enum', scope: 'user', default: 'weekly', validation: ['off', 'daily', 'weekly'] },
  'app.notifications.budget_critical_alerts': { key: 'app.notifications.budget_critical_alerts', value: true, type: 'boolean', scope: 'user', default: true },
  'app.notifications.system_updates': { key: 'app.notifications.system_updates', value: true, type: 'boolean', scope: 'user', default: true },

  // Güvenlik & Sistem (6)
  'app.language': { key: 'app.language', value: 'tr', type: 'enum', scope: 'user', default: 'tr', validation: ['tr', 'en'] },
  'security.2fa.enabled': { key: 'security.2fa.enabled', value: false, type: 'boolean', scope: 'user', default: false },
  'security.backup.auto_enabled': { key: 'security.backup.auto_enabled', value: true, type: 'boolean', scope: 'user', default: true },
  'security.session_timeout_minutes': { key: 'security.session_timeout_minutes', value: 30, type: 'number', scope: 'user', default: 30 },
  'security.ip_lockdown': { key: 'security.ip_lockdown', value: false, type: 'boolean', scope: 'user', default: false },
  'security.strict_cookie_policy': { key: 'security.strict_cookie_policy', value: true, type: 'boolean', scope: 'user', default: true },

  // Veri & Gelişmiş Entegrasyonlar (6)
  'system.sync_rate': { key: 'system.sync_rate', value: 'realtime', type: 'enum', scope: 'user', default: 'realtime', validation: ['realtime', '5min', 'manual'] },
  'system.debug_mode': { key: 'system.debug_mode', value: false, type: 'boolean', scope: 'user', default: false },
  'system.local_storage_encryption': { key: 'system.local_storage_encryption', value: false, type: 'boolean', scope: 'user', default: false },
  'system.auto_export_backup_on_exit': { key: 'system.auto_export_backup_on_exit', value: false, type: 'boolean', scope: 'user', default: false },
  'system.send_telemetry_diagnostics': { key: 'system.send_telemetry_diagnostics', value: true, type: 'boolean', scope: 'user', default: true },
  'system.offline_mode_support': { key: 'system.offline_mode_support', value: true, type: 'boolean', scope: 'user', default: true },

  // --- MODÜLER & SAYFA ÖZEL AYARLAR (50+ ADET EK AYAR) ---

  // Finans Modülü Özelleştirmeleri (12 Ayar)
  'mod.finance.show_cashflow_heatmap': { key: 'mod.finance.show_cashflow_heatmap', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.finance.show_bubble_investments': { key: 'mod.finance.show_bubble_investments', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.finance.show_debt_snowball_chart': { key: 'mod.finance.show_debt_snowball_chart', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.finance.heatmap_resolution': { key: 'mod.finance.heatmap_resolution', value: 'weekly', type: 'enum', scope: 'user', default: 'weekly', validation: ['daily', 'weekly', 'monthly'] },
  'mod.finance.currency_api_refresh_rate_sec': { key: 'mod.finance.currency_api_refresh_rate_sec', value: 300, type: 'number', scope: 'user', default: 300 },
  'mod.finance.ai_recommender_proactivity': { key: 'mod.finance.ai_recommender_proactivity', value: 'high', type: 'enum', scope: 'user', default: 'high', validation: ['low', 'medium', 'high'] },
  'mod.finance.enable_purchase_prioritization': { key: 'mod.finance.enable_purchase_prioritization', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.finance.inflation_index_adjustment': { key: 'mod.finance.inflation_index_adjustment', value: 45.0, type: 'number', scope: 'user', default: 45.0 },
  'mod.finance.saving_interest_simulation': { key: 'mod.finance.saving_interest_simulation', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.finance.include_pending_quotes': { key: 'mod.finance.include_pending_quotes', value: false, type: 'boolean', scope: 'user', default: false },
  'mod.finance.debt_extinguisher_alerts': { key: 'mod.finance.debt_extinguisher_alerts', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.finance.custom_income_taxes_pct': { key: 'mod.finance.custom_income_taxes_pct', value: 20.0, type: 'number', scope: 'user', default: 20.0 },

  // Notlarım Modülü Özelleştirmeleri (10 Ayar)
  'mod.notes.auto_save_delay_ms': { key: 'mod.notes.auto_save_delay_ms', value: 1000, type: 'number', scope: 'user', default: 1000 },
  'mod.notes.enable_encryption': { key: 'mod.notes.enable_encryption', value: false, type: 'boolean', scope: 'user', default: false },
  'mod.notes.encryption_algorithm': { key: 'mod.notes.encryption_algorithm', value: 'AES-256', type: 'enum', scope: 'user', default: 'AES-256', validation: ['AES-256', 'ChaCha20'] },
  'mod.notes.default_notebook_layout': { key: 'mod.notes.default_notebook_layout', value: 'grid', type: 'enum', scope: 'user', default: 'grid', validation: ['grid', 'list', 'masonry'] },
  'mod.notes.voice_transcribe_language': { key: 'mod.notes.voice_transcribe_language', value: 'tr-TR', type: 'enum', scope: 'user', default: 'tr-TR', validation: ['tr-TR', 'en-US'] },
  'mod.notes.allow_quick_memos_on_dock': { key: 'mod.notes.allow_quick_memos_on_dock', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.notes.todo_auto_sort_by_deadline': { key: 'mod.notes.todo_auto_sort_by_deadline', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.notes.todo_remind_hours_before': { key: 'mod.notes.todo_remind_hours_before', value: 24, type: 'number', scope: 'user', default: 24 },
  'mod.notes.ai_summary_length_words': { key: 'mod.notes.ai_summary_length_words', value: 150, type: 'number', scope: 'user', default: 150 },
  'mod.notes.allow_markdown_rendering': { key: 'mod.notes.allow_markdown_rendering', value: true, type: 'boolean', scope: 'user', default: true },

  // Kütüphane Modülü Özelleştirmeleri (10 Ayar)
  'mod.library.reading_progress_tracking_type': { key: 'mod.library.reading_progress_tracking_type', value: 'pages', type: 'enum', scope: 'user', default: 'pages', validation: ['pages', 'percentage', 'chapters'] },
  'mod.library.sync_highlights_cloud': { key: 'mod.library.sync_highlights_cloud', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.library.auto_dark_mode_reader': { key: 'mod.library.auto_dark_mode_reader', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.library.font_size_reader': { key: 'mod.library.font_size_reader', value: 16, type: 'number', scope: 'user', default: 16 },
  'mod.library.line_height_reader': { key: 'mod.library.line_height_reader', value: 1.6, type: 'number', scope: 'user', default: 1.6 },
  'mod.library.enable_dictionary_lookup': { key: 'mod.library.enable_dictionary_lookup', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.library.default_book_category_filter': { key: 'mod.library.default_book_category_filter', value: 'all', type: 'string', scope: 'user', default: 'all' },
  'mod.library.daily_reading_goal_minutes': { key: 'mod.library.daily_reading_goal_minutes', value: 30, type: 'number', scope: 'user', default: 30 },
  'mod.library.allow_audio_narration': { key: 'mod.library.allow_audio_narration', value: false, type: 'boolean', scope: 'user', default: false },
  'mod.library.ai_book_recommendation_count': { key: 'mod.library.ai_book_recommendation_count', value: 5, type: 'number', scope: 'user', default: 5 },

  // Bülten Modülü Özelleştirmeleri (8 Ayar)
  'mod.bulletin.rss_refresh_interval_min': { key: 'mod.bulletin.rss_refresh_interval_min', value: 60, type: 'number', scope: 'user', default: 60 },
  'mod.bulletin.auto_translate_to_turkish': { key: 'mod.bulletin.auto_translate_to_turkish', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.bulletin.sentiment_analysis_sensitivity': { key: 'mod.bulletin.sentiment_analysis_sensitivity', value: 0.8, type: 'number', scope: 'user', default: 0.8 },
  'mod.bulletin.auto_tag_nlp_categorizer': { key: 'mod.bulletin.auto_tag_nlp_categorizer', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.bulletin.maximum_articles_per_feed': { key: 'mod.bulletin.maximum_articles_per_feed', value: 50, type: 'number', scope: 'user', default: 50 },
  'mod.bulletin.strip_obsolete_ads': { key: 'mod.bulletin.strip_obsolete_ads', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.bulletin.summary_bullet_points_count': { key: 'mod.bulletin.summary_bullet_points_count', value: 3, type: 'number', scope: 'user', default: 3 },
  'mod.bulletin.enable_rss_source_diagnostics': { key: 'mod.bulletin.enable_rss_source_diagnostics', value: true, type: 'boolean', scope: 'user', default: true },

  // Görsel Motor, 3D & Efektler (12 Ayar)
  'mod.engine.3d_render_complexity': { key: 'mod.engine.3d_render_complexity', value: 'medium', type: 'enum', scope: 'user', default: 'medium', validation: ['low', 'medium', 'high'] },
  'mod.engine.3d_rotation_speed': { key: 'mod.engine.3d_rotation_speed', value: 1.0, type: 'number', scope: 'user', default: 1.0 },
  'mod.engine.particle_density': { key: 'mod.engine.particle_density', value: 40, type: 'number', scope: 'user', default: 40 },
  'mod.engine.interactive_shaders_enabled': { key: 'mod.engine.interactive_shaders_enabled', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.engine.click_haptic_strength': { key: 'mod.engine.click_haptic_strength', value: 'medium', type: 'enum', scope: 'user', default: 'medium', validation: ['none', 'low', 'medium', 'high'] },
  'mod.engine.confetti_effects_enabled': { key: 'mod.engine.confetti_effects_enabled', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.engine.sound_foley_effects': { key: 'mod.engine.sound_foley_effects', value: false, type: 'boolean', scope: 'user', default: false },
  'mod.engine.page_transitions_style': { key: 'mod.engine.page_transitions_style', value: 'morph', type: 'enum', scope: 'user', default: 'morph', validation: ['morph', 'fade', 'slide', 'none'] },
  'mod.engine.shadow_map_resolution': { key: 'mod.engine.shadow_map_resolution', value: 'medium', type: 'enum', scope: 'user', default: 'medium', validation: ['low', 'medium', 'high'] },
  'mod.engine.hdr_bloom_intensity': { key: 'mod.engine.hdr_bloom_intensity', value: 0.5, type: 'number', scope: 'user', default: 0.5 },
  'mod.engine.vignette_vibe': { key: 'mod.engine.vignette_vibe', value: true, type: 'boolean', scope: 'user', default: true },
  'mod.engine.hover_glow_dynamic_intensity': { key: 'mod.engine.hover_glow_dynamic_intensity', value: 1.0, type: 'number', scope: 'user', default: 1.0 },
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
    updateSetting('theme.accent_color', colorHex);
  };

  const setActiveAccentName = (name: string) => {
    setActiveAccentNameState(name);
    localStorage.setItem('apex_active_accent_name', name);
  };

  // ADVANCED DIAGNOSTICS: Calculate exact LocalStorage usage metrics
  const getStorageUsage = () => {
    let usedBytes = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      const val = localStorage.getItem(k) || '';
      usedBytes += (k.length + val.length) * 2; // ~2 bytes per character
    });
    return {
      usedBytes,
      totalBytes: 5242880, // standard 5MB browser limit
      keyCount: keys.length
    };
  };

  const clearSystemCache = () => {
    const backupKeys = ['supabase.auth.token', 'is_reset_v2', 'apex_active_font', 'apex_active_accent', 'apex_active_accent_name'];
    const backup: Record<string, string> = {};
    backupKeys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v) backup[k] = v;
    });

    localStorage.clear();

    // Restore essential system parameters
    Object.keys(backup).forEach(k => {
      localStorage.setItem(k, backup[k]);
    });

    // Reset settings state to defaults
    setSettings(initialSettings);
  };

  // SYSTEM DIAGNOSTICS: Get active context alerts and suggestions
  const getSystemHealthAdvice = (): SystemAdvice[] => {
    const list: SystemAdvice[] = [];

    // Check 1: Animation speed & FPS
    const fps = getSetting('performance.fps');
    if (fps < 90) {
      list.push({
        id: 'fps_low',
        type: 'info',
        title: 'Ekran Yenileme Hızı Limiti',
        message: 'Arayüz akıcılığını artırmak için FPS ayarını 120 FPS seçeneğine almanızı öneririz.',
        actionLabel: '120 FPS Yap',
        actionKey: 'performance.fps',
        actionValue: 120
      });
    }

    // Check 2: 2FA Authentication
    const mfaEnabled = getSetting('security.2fa.enabled');
    if (!mfaEnabled) {
      list.push({
        id: 'security_mfa',
        type: 'warning',
        title: 'İki Faktörlü Doğrulama Pasif',
        message: 'Hesap ve finansal veri güvenliğinizi maksimum düzeye çıkarmak için 2FA özelliğini aktif edin.',
        actionLabel: 'Güvenliğe Git',
        actionKey: 'security.2fa.enabled',
        actionValue: true
      });
    }

    // Check 3: Budget Alert thresholds
    const budgetAlert = getSetting('finance.budget_alert_threshold');
    if (budgetAlert > 90) {
      list.push({
        id: 'budget_threshold_high',
        type: 'warning',
        title: 'Yüksek Bütçe Toleransı',
        message: 'Bütçe uyarı eşiğiniz %90 gibi yüksek bir seviyede. Bütçe aşımını daha erken engellemek için eşiği %80\'e çekmenizi öneririz.',
        actionLabel: '%80 Yap',
        actionKey: 'finance.budget_alert_threshold',
        actionValue: 80
      });
    }

    // Check 4: LocalStorage usage threshold
    const usage = getStorageUsage();
    const percent = (usage.usedBytes / usage.totalBytes) * 100;
    if (percent > 60) {
      list.push({
        id: 'storage_high',
        type: 'warning',
        title: 'Depolama Alanı Doluyor',
        message: `LocalStorage alanınız %${percent.toFixed(1)} doluluğa ulaştı. Sistem önbelleğini temizleyerek yer açabilirsiniz.`,
        actionLabel: 'Önbelleği Boşalt',
        actionKey: 'system_cache_clear',
        actionValue: true
      });
    } else {
      list.push({
        id: 'system_healthy',
        type: 'success',
        title: 'Sistem Tamamen Kararlı',
        message: 'Tüm bellek, depolama ve senkronizasyon katmanları kusursuz ve kararlı çalışıyor.'
      });
    }

    return list;
  };

  // AI CO-PILOT COMMAND EXECUTION (NLU Engine)
  const executeAiCommand = (command: string): { success: boolean; message: string; modifiedKeys: string[] } => {
    const cmd = command.toLowerCase();
    const modifiedKeys: string[] = [];

    // Rule 1: High performance / fast animations
    if (cmd.includes('hızlı') || cmd.includes('hızlandır') || cmd.includes('performans') || cmd.includes('akıcı')) {
      updateSetting('performance.fps', 120);
      updateSetting('ui.animation_speed', '0.2s');
      updateSetting('performance.hardware_acceleration', true);
      modifiedKeys.push('performance.fps', 'ui.animation_speed', 'performance.hardware_acceleration');
      return {
        success: true,
        message: 'Yapay zeka sistemi maksimum performans moduna aldı! Ekran yenileme hızı 120 FPS olarak ayarlandı, donanım ivmelendirmesi açıldı ve animasyon hızı 0.2s düzeyine çekildi.',
        modifiedKeys
      };
    }

    // Rule 2: Low-glare dark theme / dark mode
    if (cmd.includes('karanlık') || cmd.includes('gece') || cmd.includes('dark')) {
      updateSetting('theme.mode', 'dark');
      modifiedKeys.push('theme.mode');
      return {
        success: true,
        message: 'Yapay zeka göz sağlığınız için Slate Dark gece modunu aktif etti.',
        modifiedKeys
      };
    }

    // Rule 3: Pure Pristine White Light Mode
    if (cmd.includes('açık') || cmd.includes('gündüz') || cmd.includes('light') || cmd.includes('aydınlık') || cmd.includes('beyaz')) {
      updateSetting('theme.mode', 'light');
      modifiedKeys.push('theme.mode');
      return {
        success: true,
        message: 'Yapay zeka asil ve pürüzsüz kusursuz Bembeyaz (Pure White) modunu aktif etti.',
        modifiedKeys
      };
    }

    // Rule 4: Budget thresholds
    if (cmd.includes('bütçe uyar') || cmd.includes('bütçe eşik') || cmd.includes('limit')) {
      const match = cmd.match(/\d+/);
      const val = match ? parseInt(match[0]) : 80;
      updateSetting('finance.budget_alert_threshold', val);
      modifiedKeys.push('finance.budget_alert_threshold');
      return {
        success: true,
        message: `Yapay zeka bütçe kontrol limitini %${val} doluluk seviyesine sabitledi.`,
        modifiedKeys
      };
    }

    // Rule 5: AI Personality shifts
    if (cmd.includes('sarkastik') || cmd.includes('alaycı')) {
      updateSetting('ai.personality', 'sarkastik');
      modifiedKeys.push('ai.personality');
      return {
        success: true,
        message: 'AI Kişiliği "Sarkastik" olarak güncellendi. Hazır ol, artık daha esprili ve iğneleyici cevaplar alacaksın!',
        modifiedKeys
      };
    }

    if (cmd.includes('profesyonel') || cmd.includes('resmi')) {
      updateSetting('ai.personality', 'profesyonel');
      modifiedKeys.push('ai.personality');
      return {
        success: true,
        message: 'AI Kişiliği resmi ve akademik "Profesyonel" tona çekildi.',
        modifiedKeys
      };
    }

    if (cmd.includes('motivasyon') || cmd.includes('coşkulu')) {
      updateSetting('ai.personality', 'motivasyonel');
      modifiedKeys.push('ai.personality');
      return {
        success: true,
        message: 'AI Kişiliği "Motivasyonel" yapıldı. Hedeflerine odaklanman için tam destek buradayız!',
        modifiedKeys
      };
    }

    // Rule 6: High Contrast / Glow effects
    if (cmd.includes('kontrast') || cmd.includes('yüksek kontrast')) {
      updateSetting('theme.high_contrast', true);
      modifiedKeys.push('theme.high_contrast');
      return {
        success: true,
        message: 'Yüksek kontrast modu başarıyla aktif edildi. Metinler ve kenarlıklar artık çok daha belirgin.',
        modifiedKeys
      };
    }

    if (cmd.includes('glow') || cmd.includes('parlama') || cmd.includes('işık efekti')) {
      updateSetting('theme.glow_effects', true);
      modifiedKeys.push('theme.glow_effects');
      return {
        success: true,
        message: 'Estetik neon parlama ve gölge efektleri arayüze entegre edildi.',
        modifiedKeys
      };
    }

    // Rule 7: Font switching via AI
    const fontMatch = PREMIUM_FONTS.find(f => cmd.includes(f.name.toLowerCase()) || cmd.includes(f.id));
    if (fontMatch) {
      setActiveFont(fontMatch.id);
      modifiedKeys.push('activeFont');
      return {
        success: true,
        message: `Yapay zeka arayüz yazı tipini başarıyla '${fontMatch.name}' olarak değiştirdi.`,
        modifiedKeys
      };
    }

    // Rule 8: Color switching via AI
    const allC = [
      ...PRIMARY_COLORS,
      ...generateIntermediateColors()
    ];
    const colorMatch = allC.find(c => cmd.includes(c.name.toLowerCase()));
    if (colorMatch) {
      setActiveAccent(colorMatch.hex);
      setActiveAccentName(colorMatch.name);
      modifiedKeys.push('activeAccent');
      return {
        success: true,
        message: `Yapay zeka sistem vurgu rengini başarıyla '${colorMatch.name}' (${colorMatch.hex}) olarak güncelledi.`,
        modifiedKeys
      };
    }

    return {
      success: false,
      message: 'Komut anlaşılamadı. Lütfen yapmak istediğiniz ayarı doğal dil ile ifade edin. (Örn: "Beyaz temaya geç", "AI kişiliğini sarkastik yap", "Arayüzü hızlandır")',
      modifiedKeys
    };
  };

  // Inject Accent Color & Active Font dynamically into the DOM
  useEffect(() => {
    const root = window.document.documentElement;

    root.style.setProperty('--focus-neon', activeAccent);
    root.style.setProperty('--focus-neon-val', activeAccent);
    root.style.setProperty('--color-accent', activeAccent);
    root.style.setProperty('--focus-main-val', activeAccent);
    root.style.setProperty('--focus-deep-val', activeAccent);

    const fontObj = PREMIUM_FONTS.find(f => f.id === activeFont) || PREMIUM_FONTS[1];
    root.style.setProperty('--font-sans-val', fontObj.stack);
    root.style.setProperty('--font-display-val', fontObj.stack);
    root.style.setProperty('--font-heading', fontObj.stack);

  }, [activeFont, activeAccent]);

  // Inject Advanced UI parameters
  useEffect(() => {
    const root = window.document.documentElement;
    const speed = getSetting('ui.animation_speed') || '0.4s';
    const blur = getSetting('ui.glass_blur') ?? 25;

    root.style.setProperty('--frame-duration', speed);
    root.style.setProperty('--glass-blur-level', `${blur}px`);
  }, [settings['ui.animation_speed']?.value, settings['ui.glass_blur']?.value]);

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
        root.style.setProperty('--app-bg', '#FFFFFF');
        root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.95)');
        root.style.setProperty('--border-val', 'rgba(226, 232, 240, 0.8)');
        root.style.setProperty('--text-primary-val', '#0F172A');
        root.style.setProperty('--text-secondary-val', '#475569');
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
      setActiveAccentName,
      getStorageUsage,
      clearSystemCache,
      getSystemHealthAdvice,
      executeAiCommand
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
