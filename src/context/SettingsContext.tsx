import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  user_name: string;
  user_email: string;
  user_phone: string;
  user_dept: string;
  user_bio: string;
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
  sidebar_default: 'expanded' | 'collapsed';
  font_size: 'small' | 'medium' | 'large';
  compact_mode: boolean;
  glass_intensity: 'low' | 'medium' | 'high';
  notif_email: boolean;
  notif_push: boolean;
  notif_sound: boolean;
  notif_stock: boolean;
  notif_job: boolean;
  notif_payment: boolean;
  security_2fa: boolean;
  security_timeout: number;
  security_login_emails: boolean;
  sys_currency: string;
  sys_date_format: string;
  sys_lang: string;
  sys_autosave: number;
  // New Appearance Settings
  border_radius: 'none' | 'small' | 'medium' | 'large' | 'full';
  sidebar_style: 'glass' | 'solid' | 'gradient';
  card_style: 'flat' | 'raised' | 'glass';
  animation_speed: 'none' | 'slow' | 'normal' | 'fast';
  background_pattern: 'none' | 'dots' | 'grid' | 'mesh';
  font_family: 'sans' | 'mono' | 'serif';
  high_contrast: boolean;
  // Even More Appearance Settings
  sidebar_position: 'left' | 'right';
  header_style: 'glass' | 'solid' | 'floating';
  content_width: 'full' | 'boxed';
  shadow_intensity: 'none' | 'soft' | 'hard';
  glow_effects: boolean;
  // Profile
  user_title: string;
  user_language: string;
  user_timezone: string;
  // Security
  security_ip_whitelist: string;
  security_password_expiry: number;
  security_max_attempts: number;
  security_session_duration: number;
  // Appearance
  ui_density: 'compact' | 'comfortable' | 'spacious';
  color_blind_mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  // Notifications
  notif_desktop: boolean;
  notif_slack: boolean;
  notif_telegram: boolean;
  // System
  sys_performance_mode: 'balanced' | 'high' | 'low';
  sys_debug_mode: boolean;
  sys_api_access: boolean;
  // Backup & Recovery
  backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  backup_retention: number;
  auto_recovery: boolean;
  // Logging
  log_level: 'error' | 'warn' | 'info' | 'debug';
  log_retention_days: number;
  audit_logging: boolean;
  // AI Assistant
  ai_assistant_enabled: boolean;
  ai_model: string;
  ai_voice_enabled: boolean;
  ai_personality: 'professional' | 'friendly' | 'concise';
  // Widgets
  widgets_enabled: boolean;
  widget_transparency: number;
  // Charts
  chart_theme: 'classic' | 'modern' | 'vibrant' | 'monochrome';
  chart_animations: boolean;
  // Background
  background_type: 'default' | '3d-advanced' | 'accent-synced' | 'live-weather';
  // Admin
  admin_maintenance_mode: boolean;
  admin_registration_open: boolean;
  navigation_mode: 'sidebar' | 'dock';
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  user_name: 'Engin Nalbant',
  user_email: 'enginnalbant9@gmail.com',
  user_phone: '+90 555 000 00 00',
  user_dept: 'Yönetim',
  user_bio: 'Sistem Yöneticisi ve Nexus OS Kurucusu.',
  theme: 'light',
  accent_color: '#00F2FF',
  sidebar_default: 'expanded',
  font_size: 'medium',
  compact_mode: false,
  glass_intensity: 'medium',
  notif_email: true,
  notif_push: true,
  notif_sound: true,
  notif_stock: true,
  notif_job: true,
  notif_payment: true,
  security_2fa: false,
  security_timeout: 30,
  security_login_emails: true,
  sys_currency: 'TRY',
  sys_date_format: 'DD.MM.YYYY',
  sys_lang: 'tr',
  sys_autosave: 60,
  border_radius: 'medium',
  sidebar_style: 'glass',
  card_style: 'glass',
  animation_speed: 'normal',
  background_pattern: 'mesh',
  font_family: 'sans',
  high_contrast: false,
  sidebar_position: 'left',
  header_style: 'glass',
  content_width: 'full',
  shadow_intensity: 'soft',
  glow_effects: true,
  user_title: 'Sistem Yöneticisi',
  user_language: 'tr',
  user_timezone: 'UTC+3',
  security_ip_whitelist: '',
  security_password_expiry: 90,
  security_max_attempts: 5,
  security_session_duration: 120,
  ui_density: 'comfortable',
  color_blind_mode: 'none',
  notif_desktop: true,
  notif_slack: false,
  notif_telegram: false,
  sys_performance_mode: 'balanced',
  sys_debug_mode: false,
  sys_api_access: true,
  backup_enabled: true,
  backup_frequency: 'daily',
  backup_retention: 30,
  auto_recovery: true,
  log_level: 'info',
  log_retention_days: 7,
  audit_logging: true,
  ai_assistant_enabled: true,
  ai_model: 'gemini-3-pro-preview',
  ai_voice_enabled: false,
  ai_personality: 'professional',
  widgets_enabled: true,
  widget_transparency: 0.8,
  chart_theme: 'modern',
  chart_animations: true,
  background_type: 'default',
  admin_maintenance_mode: false,
  admin_registration_open: true,
  navigation_mode: 'sidebar',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings');
      }
      // Convert string values from DB to appropriate types
      const typedData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value === 'true') typedData[key] = true;
        else if (value === 'false') typedData[key] = false;
        else if (!isNaN(Number(value)) && key !== 'user_phone' && key !== 'accent_color') typedData[key] = Number(value);
        else typedData[key] = value;
      }

      setSettings(prev => ({ ...prev, ...typedData }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
      root.classList.toggle('light', !systemDark);
    }

    // Apply accent color
    root.style.setProperty('--focus-neon', settings.accent_color);
    
    // Apply font size
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.fontSize = fontSizeMap[settings.font_size];

    // Apply compact mode
    root.classList.toggle('compact-mode', settings.compact_mode);

    // Apply glass intensity
    const intensityMap = { low: '4px', medium: '12px', high: '24px' };
    root.style.setProperty('--glass-blur', intensityMap[settings.glass_intensity]);

    // Apply border radius
    const radiusMap = { none: '0px', small: '4px', medium: '12px', large: '24px', full: '9999px' };
    root.style.setProperty('--border-radius', radiusMap[settings.border_radius]);

    // Apply sidebar style
    root.setAttribute('data-sidebar-style', settings.sidebar_style);

    // Apply card style
    root.setAttribute('data-card-style', settings.card_style);

    // Apply animation speed
    const speedMap = { none: '0s', slow: '0.6s', normal: '0.3s', fast: '0.15s' };
    root.style.setProperty('--transition-speed', speedMap[settings.animation_speed]);

    // Apply background pattern
    root.setAttribute('data-bg-pattern', settings.background_pattern);

    // Apply font family
    const fontMap = { 
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif', 
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      serif: '"Playfair Display", serif'
    };
    root.style.setProperty('--font-family', fontMap[settings.font_family]);

    // Apply high contrast
    root.classList.toggle('high-contrast', settings.high_contrast);

    // Apply sidebar position
    root.setAttribute('data-sidebar-position', settings.sidebar_position);

    // Apply header style
    root.setAttribute('data-header-style', settings.header_style);

    // Apply content width
    root.setAttribute('data-content-width', settings.content_width);

    // Apply shadow intensity
    const shadowMap = { 
      none: 'none', 
      soft: '0 4px 12px rgba(0,0,0,0.05)', 
      hard: '0 8px 24px rgba(0,0,0,0.2)' 
    };
    root.style.setProperty('--shadow-intensity', shadowMap[settings.shadow_intensity]);

    // Apply glow effects
    root.classList.toggle('glow-effects', settings.glow_effects);

  }, [
    settings.theme, 
    settings.accent_color, 
    settings.font_size, 
    settings.compact_mode, 
    settings.glass_intensity,
    settings.border_radius,
    settings.sidebar_style,
    settings.card_style,
    settings.animation_speed,
    settings.background_pattern,
    settings.font_family,
    settings.high_contrast,
    settings.sidebar_position,
    settings.header_style,
    settings.content_width,
    settings.shadow_intensity,
    settings.glow_effects
  ]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
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
