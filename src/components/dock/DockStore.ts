import { useState, useEffect } from 'react';

export interface DockUsageRecord {
  moduleId: string;
  hour: number;
  dayOfWeek: number;
  timestamp: number;
}

export type DockProfile = 'work' | 'personal' | 'finance' | 'production' | 'admin';

export interface DockState {
  profile: DockProfile;
  dockSlots: string[];
  recentModules: string[];
  analytics: DockUsageRecord[];
  isCustomizing: boolean;
}

const DEFAULT_SLOTS: Record<DockProfile, string[]> = {
  work: ['notes-dashboard', 'notes-todo', 'contacts-list', 'recon-dashboard'],
  personal: ['notes-books', 'bulletin-dashboard', 'notes-bookmarks', 'notes-quick'],
  finance: ['finance-dashboard', 'finance-incomes', 'finance-expenses', 'finance-subscriptions'],
  production: ['stocks-dashboard', 'fason-dashboard', 'purchasing-dashboard', 'recon-dashboard'],
  admin: ['finance-analytics', 'finance-reports', 'stocks-dashboard', 'contacts-list']
};

export class DockStore {
  private static instance: DockStore;
  private listeners: Set<() => void> = new Set();

  private state: DockState = {
    profile: 'finance',
    dockSlots: DEFAULT_SLOTS.finance,
    recentModules: [],
    analytics: [],
    isCustomizing: false
  };

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): DockStore {
    if (!DockStore.instance) {
      DockStore.instance = new DockStore();
    }
    return DockStore.instance;
  }

  private loadFromStorage() {
    try {
      const profile = localStorage.getItem('apex_dock_profile') as DockProfile || 'finance';
      const savedSlots = localStorage.getItem(`apex_dock_slots_${profile}`);
      const recent = localStorage.getItem('apex_recent_modules');
      const analytics = localStorage.getItem('apex_dock_analytics');

      this.state = {
        profile,
        dockSlots: savedSlots ? JSON.parse(savedSlots) : DEFAULT_SLOTS[profile],
        recentModules: recent ? JSON.parse(recent) : ['finance-dashboard', 'notes-dashboard'],
        analytics: analytics ? JSON.parse(analytics) : [],
        isCustomizing: false
      };
    } catch {
      // safe fallback
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('apex_dock_profile', this.state.profile);
      localStorage.setItem(`apex_dock_slots_${this.state.profile}`, JSON.stringify(this.state.dockSlots));
      localStorage.setItem('apex_recent_modules', JSON.stringify(this.state.recentModules));
      localStorage.setItem('apex_dock_analytics', JSON.stringify(this.state.analytics));
    } catch {}
  }

  public getState(): DockState {
    return { ...this.state };
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.saveToStorage();
    this.listeners.forEach(l => l());
  }

  public setProfile(profile: DockProfile) {
    this.state.profile = profile;
    const savedSlots = localStorage.getItem(`apex_dock_slots_${profile}`);
    this.state.dockSlots = savedSlots ? JSON.parse(savedSlots) : DEFAULT_SLOTS[profile];
    this.emit();
  }

  public updateSlot(index: number, moduleId: string) {
    const newSlots = [...this.state.dockSlots];
    newSlots[index] = moduleId;
    this.state.dockSlots = newSlots;
    this.emit();
  }

  public resetSlots() {
    this.state.dockSlots = DEFAULT_SLOTS[this.state.profile];
    this.emit();
  }

  public logUsage(moduleId: string) {
    const now = new Date();
    const newRecord: DockUsageRecord = {
      moduleId,
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      timestamp: now.getTime()
    };

    // Cap analytics record count to 200
    const filteredAnalytics = [newRecord, ...this.state.analytics].slice(0, 200);
    this.state.analytics = filteredAnalytics;

    // Update recents
    const filteredRecents = this.state.recentModules.filter(m => m !== moduleId);
    this.state.recentModules = [moduleId, ...filteredRecents].slice(0, 6);

    this.emit();
  }

  /**
   * Smart AI / Siri suggestions logic based on time, calendar context, and past habits
   */
  public getSiriSuggestion(): { moduleId: string; confidence: number; reason: string } {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // 1. Evaluate historical statistics
    const stats: Record<string, number> = {};
    let totalContextHits = 0;

    this.state.analytics.forEach(rec => {
      let weight = 1;
      // Weight matches for current hour-range
      if (Math.abs(rec.hour - hour) <= 2) weight += 2;
      // Weight matches for weekday/weekend profile
      const isRecWeekend = rec.dayOfWeek === 0 || rec.dayOfWeek === 6;
      const isNowWeekend = day === 0 || day === 6;
      if (isRecWeekend === isNowWeekend) weight += 1.5;

      stats[rec.moduleId] = (stats[rec.moduleId] || 0) + weight;
      totalContextHits += weight;
    });

    const topModule = Object.entries(stats).sort((a, b) => b[1] - a[1])[0];

    if (topModule && topModule[1] > 3) {
      const conf = Math.min(Math.round((topModule[1] / totalContextHits) * 100), 98);
      return {
        moduleId: topModule[0],
        confidence: conf,
        reason: hour < 12 ? 'Sabah rutinlerinize göre önerildi' : hour < 18 ? 'Gün içi kullanım alışkanlıklarınız' : 'Akşam kullanım tercihleriniz'
      };
    }

    // 2. Rules-based smart default fallback
    if (day === 0 || day === 6) {
      return { moduleId: 'bulletin-dashboard', confidence: 75, reason: 'Hafta sonu bülten ve haber okuma önerisi' };
    }
    if (hour >= 8 && hour < 12) {
      return { moduleId: 'finance-dashboard', confidence: 80, reason: 'Güne finansal durumunuzu kontrol ederek başlayın' };
    }
    if (hour >= 18 && hour < 23) {
      return { moduleId: 'notes-dashboard', confidence: 85, reason: 'Akşam notlarınızı ve günlük görevlerinizi gözden geçirin' };
    }

    return { moduleId: 'finance-dashboard', confidence: 60, reason: 'Genel kullanım analizi' };
  }

  /**
   * Checks if a module hasn't been accessed for an extended duration (e.g., 10 days)
   */
  public getUnusedWarnings(): string[] {
    const now = Date.now();
    const limit = 10 * 24 * 60 * 60 * 1000; // 10 days
    const warnings: string[] = [];

    // Check key modules
    const modulesToCheck = ['finance-dashboard', 'notes-dashboard', 'stocks-dashboard', 'bulletin-dashboard'];
    modulesToCheck.forEach(m => {
      const lastAccess = this.state.analytics.find(a => a.moduleId === m);
      if (!lastAccess || (now - lastAccess.timestamp > limit)) {
        warnings.push(m);
      }
    });

    return warnings;
  }
}

export const useDockStore = () => {
  const store = DockStore.getInstance();
  const [state, setState] = useState<DockState>(store.getState());

  useEffect(() => {
    return store.subscribe(() => {
      setState(store.getState());
    });
  }, []);

  return {
    ...state,
    setProfile: (p: DockProfile) => store.setProfile(p),
    updateSlot: (idx: number, modId: string) => store.updateSlot(idx, modId),
    resetSlots: () => store.resetSlots(),
    logUsage: (modId: string) => store.logUsage(modId),
    getSiriSuggestion: () => store.getSiriSuggestion(),
    getUnusedWarnings: () => store.getUnusedWarnings()
  };
};
