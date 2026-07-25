import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'tr' | 'en';

export interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  tr: {
    // Nav & Modules
    'nav.dashboard': 'Gösterge Paneli',
    'nav.finance': 'Finans',
    'nav.purchasing': 'Satınalma',
    'nav.fason': 'Fason Takibi',
    'nav.stocks': 'Stok Yönetimi',
    'nav.contacts': 'Cari Takibi',
    'nav.recon': 'BA-BS Mutabakat',
    'nav.notes': 'Notlarım',
    'nav.bulletin': 'Bülten & Haberler',
    'nav.calendar': 'Takvim',
    'nav.notifications': 'Bildirimler',
    'nav.settings': 'Ayarlar',
    'nav.menu': 'Menü',
    'nav.library': 'Kütüphane',
    'nav.home': 'Ana Sayfa',

    // Common Actions
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.search': 'Arama yapın...',
    'common.add': 'Yeni Ekle',
    'common.filter': 'Filtrele',
    'common.export': 'Dışa Aktar',
    'common.language': 'Dil / Language',
    'common.turkish': 'Türkçe',
    'common.english': 'English',
    'common.theme': 'Tema',
    'common.dark': 'Koyu Tema',
    'common.light': 'Açık Tema',
    'common.logout': 'Çıkış Yap',
    'common.status': 'Durum',
    'common.total': 'Toplam',
    'common.date': 'Tarih',
    'common.category': 'Kategori',
    'common.description': 'Açıklama',
    'common.amount': 'Tutar',
    'common.currency': 'Para Birimi',
    'common.active': 'Aktif',
    'common.completed': 'Tamamlandı',
    'common.pending': 'Beklemede',
    'common.close': 'Kapat',
    'common.back': 'Geri',

    // Mobile & Device
    'device.androidMode': 'Android Mobil Modu',
    'device.tabletMode': 'Tablet Görünümü',
    'device.desktopMode': 'Masaüstü Görünümü',
    'device.optimizedForAndroid': 'Android & Tablet Tam Uyumlu',
    'device.toggleFrame': 'Cihaz Çerçevesi',

    // Finance & Modules specific
    'finance.incomes': 'Gelirler',
    'finance.expenses': 'Giderler',
    'finance.subscriptions': 'Abonelikler',
    'finance.investments': 'Yatırımlar',
    'finance.reports': 'Raporlar',
    'finance.analytics': 'Analizler',
    
    // Notes & Memos
    'notes.quickMemos': 'Hızlı Notlar',
    'notes.todo': 'Yapılacaklar & Zamanlayıcı',
    'notes.books': 'Okuma Listesi',
    'notes.passwords': 'Parola Kasası',
    'notes.bookmarks': 'Yer İmleri',
    'notes.notebook': 'Not Defterleri',
    'notes.knowledgeGraph': 'Bilgi Haritası',

    // Header & User
    'user.profile': 'Kullanıcı Profili',
    'user.admin': 'Sistem Yöneticisi',
    'app.tagline': 'Akıllı İşletim ve Yönetim Ekosistemi',
  },
  en: {
    // Nav & Modules
    'nav.dashboard': 'Dashboard',
    'nav.finance': 'Finance',
    'nav.purchasing': 'Purchasing',
    'nav.fason': 'Outsourcing',
    'nav.stocks': 'Inventory',
    'nav.contacts': 'Contacts',
    'nav.recon': 'Reconciliation',
    'nav.notes': 'My Notes',
    'nav.bulletin': 'Bulletin & News',
    'nav.calendar': 'Calendar',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.menu': 'Menu',
    'nav.library': 'Library',
    'nav.home': 'Home',

    // Common Actions
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search...',
    'common.add': 'Add New',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.language': 'Language',
    'common.turkish': 'Turkish',
    'common.english': 'English',
    'common.theme': 'Theme',
    'common.dark': 'Dark Mode',
    'common.light': 'Light Mode',
    'common.logout': 'Log Out',
    'common.status': 'Status',
    'common.total': 'Total',
    'common.date': 'Date',
    'common.category': 'Category',
    'common.description': 'Description',
    'common.amount': 'Amount',
    'common.currency': 'Currency',
    'common.active': 'Active',
    'common.completed': 'Completed',
    'common.pending': 'Pending',
    'common.close': 'Close',
    'common.back': 'Back',

    // Mobile & Device
    'device.androidMode': 'Android Mobile Mode',
    'device.tabletMode': 'Tablet View',
    'device.desktopMode': 'Desktop View',
    'device.optimizedForAndroid': 'Fully Android & Tablet Optimized',
    'device.toggleFrame': 'Device Frame',

    // Finance & Modules specific
    'finance.incomes': 'Incomes',
    'finance.expenses': 'Expenses',
    'finance.subscriptions': 'Subscriptions',
    'finance.investments': 'Investments',
    'finance.reports': 'Reports',
    'finance.analytics': 'Analytics',

    // Notes & Memos
    'notes.quickMemos': 'Quick Memos',
    'notes.todo': 'Todos & Timer',
    'notes.books': 'Reading List',
    'notes.passwords': 'Password Vault',
    'notes.bookmarks': 'Bookmarks',
    'notes.notebook': 'Notebooks',
    'notes.knowledgeGraph': 'Knowledge Graph',

    // Header & User
    'user.profile': 'User Profile',
    'user.admin': 'System Administrator',
    'app.tagline': 'Smart Operating System Ecosystem',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('apex_app_language');
    if (saved === 'tr' || saved === 'en') return saved;
    // Auto-detect browser language
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('tr') ? 'tr' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('apex_app_language', lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to TR dictionary if key exists in TR
    if (translations.tr[key]) {
      return translations.tr[key];
    }
    return fallback || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
