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
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Event sistemi
const listeners: { [key: string]: ((val: any) => void)[] } = {};

// Bağımlılık Motoru
const checkDependencies = (key: string, newValue: any, settings: Settings) => {
  // Örnek: if 2FA = enabled: require phone OR authenticator
  if (key === 'security.2fa.enabled' && newValue === true) {
    const phone = settings['user.phone']?.value;
    const authApp = settings['security.2fa.authenticator']?.value;
    if (!phone && !authApp) {
      throw new Error("2FA için telefon numarası veya authenticator uygulaması gerekli.");
    }
  }
};

// Başlangıç Ayarları (Profesyonel Kullanıcı Hesap Ayarları)
const initialSettings: Settings = {
  // 1. Profil & Hesap
  'user.profile.full_name': { key: 'user.profile.full_name', value: 'Engin Nalbant', type: 'string', scope: 'user', default: '' },
  'user.account.email': { key: 'user.account.email', value: 'enginnalbant9@gmail.com', type: 'string', scope: 'user', default: '' },
  'user.account.plan': { key: 'user.account.plan', value: 'Pro', type: 'string', scope: 'user', default: 'Free' },

  // 2. Görünüm/Tema
  'theme.mode': { key: 'theme.mode', value: 'system', type: 'enum', scope: 'user', default: 'system', validation: ['light', 'dark', 'system'] },
  'sidebar_position': { key: 'sidebar_position', value: 'left', type: 'enum', scope: 'user', default: 'left', validation: ['left', 'right', 'bottom'] },
  'ui.settings_panel_position': { key: 'ui.settings_panel_position', value: 'right', type: 'enum', scope: 'user', default: 'right', validation: ['left', 'right', 'bottom'] },
  'theme.accent_color': { key: 'theme.accent_color', value: '#2563eb', type: 'string', scope: 'user', default: '#2563eb' },

  // 3. Uygulama Ayarları
  'app.language': { key: 'app.language', value: 'tr', type: 'enum', scope: 'user', default: 'tr', validation: ['tr', 'en'] },
  'app.notifications.enabled': { key: 'app.notifications.enabled', value: true, type: 'boolean', scope: 'user', default: true },

  // 4. Yedekleme/Güvenlik
  'security.2fa.enabled': { key: 'security.2fa.enabled', value: false, type: 'boolean', scope: 'user', default: false },
  'security.backup.auto_enabled': { key: 'security.backup.auto_enabled', value: true, type: 'boolean', scope: 'user', default: true },

  // 5. Admin Panel
  'admin.maintenance_mode': { key: 'admin.maintenance_mode', value: false, type: 'boolean', scope: 'user', default: false },
  'admin.access_level': { key: 'admin.access_level', value: 'admin', type: 'enum', scope: 'user', default: 'user', validation: ['user', 'admin'] },
  
  // 6. Modül Yönetimi (Eski)
  'modules.dashboard.active': { key: 'modules.dashboard.active', value: true, type: 'boolean', scope: 'user', default: true },
  'modules.analytics.active': { key: 'modules.analytics.active', value: true, type: 'boolean', scope: 'user', default: true },
  'modules.projects.active': { key: 'modules.projects.active', value: true, type: 'boolean', scope: 'user', default: true },
  'modules.team.active': { key: 'modules.team.active', value: false, type: 'boolean', scope: 'user', default: false },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Scope bazlı ayar getirme (Session > User > Tenant > Global)
  const getSetting = (key: string) => {
    // Basitleştirilmiş scope lookup
    return settings[key]?.value ?? settings[key]?.default;
  };

  const onSettingChange = (key: string, callback: (newValue: any) => void) => {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
  };

  const updateSetting = async (key: string, newValue: any) => {
    // 1. Bağımlılık Kontrolü
    checkDependencies(key, newValue, settings);

    // 2. Audit Log (Simülasyon)
    console.log(`[AUDIT LOG] ${new Date().toISOString()} - Setting ${key} changed to ${newValue}`);

    // 3. State Güncelleme
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value: newValue, updated_at: new Date().toISOString() }
    }));

    // 4. Event Fırlatma
    if (listeners[key]) {
      listeners[key].forEach(cb => cb(newValue));
    }
  };

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
      } else {
        root.classList.remove('dark');
      }
    };

    const currentMode = settings['theme.mode']?.value || 'system';
    applyTheme(currentMode);

    // Sistem teması değişikliğini dinle
    if (currentMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings['theme.mode']?.value]);

  return (
    <SettingsContext.Provider value={{ settings, getSetting, updateSetting, onSettingChange, isLoading }}>
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
