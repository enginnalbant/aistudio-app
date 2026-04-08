import Fuse from 'fuse.js';

export type SearchItemType = 'page' | 'note' | 'task' | 'command' | 'setting' | 'stock' | 'account' | 'shipment' | 'purchase';

export interface SearchItem {
  id: string;
  type: SearchItemType;
  title: string;
  subtitle?: string;
  content?: string;
  keywords?: string[];
  icon?: string;
  payload?: any;
}

export const STATIC_SEARCH_INDEX: SearchItem[] = [
  { id: 'dash', type: 'page', title: 'Merkezi Dashboard', icon: 'LayoutDashboard' },
  { id: 'jobs-dash', type: 'page', title: 'İşler Dashboard', icon: 'Briefcase' },
  { id: 'jobs-open', type: 'page', title: 'Açık İşler', icon: 'Briefcase' },
  { id: 'jobs-all', type: 'page', title: 'Tüm İşler', icon: 'Briefcase' },
  { id: 'stocks', type: 'page', title: 'Stoklar', icon: 'Package' },
  { id: 'accounts', type: 'page', title: 'Cariler', icon: 'Users' },
  { id: 'reports', type: 'page', title: 'Raporlar', icon: 'BarChart2' },
  { id: 'planner', type: 'page', title: 'Planlama', icon: 'Calendar' },
  { id: 'shipment', type: 'page', title: 'Sevkiyat', icon: 'Truck' },
  { id: 'purchasing', type: 'page', title: 'Satınalma', icon: 'ShoppingCart' },
  { id: 'budget', type: 'page', title: 'Bütçe', icon: 'DollarSign' },
  { id: 'calendar', type: 'page', title: 'Takvim', icon: 'Calendar' },
  { id: 'media', type: 'page', title: 'Medya', icon: 'Image' },
  { id: 'monitor', type: 'page', title: 'Sistem Monitörü', icon: 'Activity' },
  { id: 'settings', type: 'page', title: 'Ayarlar', icon: 'Settings' },
  { id: 'ai', type: 'page', title: 'AI Asistan', icon: 'Zap' },
  { id: 'notifications', type: 'page', title: 'Bildirimler', icon: 'Bell' },
  { id: 'cmd-new-job', type: 'command', title: 'Yeni İş Oluştur', icon: 'Plus', payload: { action: 'create-job' } },
  { id: 'cmd-new-stock', type: 'command', title: 'Yeni Stok Ekle', icon: 'Plus', payload: { action: 'create-stock' } },
  { id: 'cmd-new-account', type: 'command', title: 'Yeni Cari Ekle', icon: 'Plus', payload: { action: 'create-account' } },
  { id: 'cmd-new-plan', type: 'command', title: 'Yeni Plan Oluştur', icon: 'Plus', payload: { action: 'create-plan' } },
  { id: 'cmd-new-shipment', type: 'command', title: 'Yeni Sevkiyat Ekle', icon: 'Plus', payload: { action: 'create-shipment' } },
  { id: 'cmd-new-purchase', type: 'command', title: 'Yeni Satınalma Talebi', icon: 'Plus', payload: { action: 'create-purchase' } },
  { id: 'cmd-theme', type: 'command', title: 'Karanlık/Açık Tema', icon: 'Moon', payload: { action: 'toggle-theme' } },
  { id: 'cmd-settings', type: 'command', title: 'Ayarlara Git', icon: 'Settings', payload: { action: 'go-settings' } },
  { id: 'cmd-logout', type: 'command', title: 'Çıkış Yap', icon: 'LogOut', payload: { action: 'logout' } },
  { id: 'cmd-refresh', type: 'command', title: 'Sistemi Yenile', icon: 'RefreshCw', payload: { action: 'refresh' } },
];

export const buildFuseIndex = (items: SearchItem[]) => {
  return new Fuse(items, {
    keys: ['title', 'subtitle', 'content', 'keywords'],
    threshold: 0.3,
  });
};

export const parseQueryPrefix = (query: string) => {
  const prefixMap: Record<string, SearchItemType> = {
    'cmd:': 'command',
    'page:': 'page',
    'stock:': 'stock',
    'note:': 'note',
    'task:': 'task',
  };

  for (const [prefix, type] of Object.entries(prefixMap)) {
    if (query.toLowerCase().startsWith(prefix)) {
      return { typeFilter: type, text: query.slice(prefix.length).trim() };
    }
  }
  return { typeFilter: undefined, text: query.trim() };
};

export const getRecentSearches = (): SearchItem[] => {
  const recent = localStorage.getItem('nexus-recent-searches');
  return recent ? JSON.parse(recent) : [];
};

export const saveRecentSearch = (item: SearchItem) => {
  const recent = getRecentSearches();
  const updated = [item, ...recent.filter(i => i.id !== item.id)].slice(0, 5);
  localStorage.setItem('nexus-recent-searches', JSON.stringify(updated));
};

export interface SearchField {
  key: string;
  value: string;
}

export const parseSearchTerm = (term: string) => {
  const parts = term.split(/\s+/);
  const filters: SearchField[] = [];
  const keywords: string[] = [];

  parts.forEach(part => {
    if (part.includes(':')) {
      const [key, value] = part.split(':');
      if (key && value) {
        filters.push({ key: key.toLowerCase(), value: value.toLowerCase() });
      } else {
        keywords.push(part.toLowerCase());
      }
    } else if (part) {
      keywords.push(part.toLowerCase());
    }
  });

  return { filters, keywords };
};

export const smartFilter = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  prefixMap: Record<string, keyof T | ((item: T) => string)>
) => {
  if (!Array.isArray(items)) return [];
  if (!searchTerm.trim()) return items;

  const { filters, keywords } = parseSearchTerm(searchTerm);

  return items.filter(item => {
    const matchesKeywords = keywords.every(kw => {
      return searchFields.some(field => {
        const val = item[field];
        if (typeof val === 'string') return val.toLowerCase().includes(kw);
        if (typeof val === 'number') return val.toString().includes(kw);
        return false;
      });
    });

    if (!matchesKeywords && keywords.length > 0) return false;

    const matchesFilters = filters.every(f => {
      const fieldKey = prefixMap[f.key];
      if (!fieldKey) return true;

      if (typeof fieldKey === 'function') {
        return fieldKey(item).toLowerCase().includes(f.value);
      }

      const val = item[fieldKey as keyof T];
      if (typeof val === 'string') return val.toLowerCase().includes(f.value);
      if (typeof val === 'number') return val.toString().includes(f.value);
      return false;
    });

    return matchesFilters;
  });
};
