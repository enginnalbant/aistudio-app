import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  HeaderPreferences,
  HeaderProfile,
  HeaderLayoutConfig,
  HeaderAppearanceConfig,
  HeaderSelfTestResult,
} from '../types/header';
import { LiquidGlassConfig, GlassPreset } from '../types/navigation';
import {
  BUILTIN_HEADER_PROFILES,
  DEFAULT_HEADER_APPEARANCE,
  DEFAULT_HEADER_LAYOUT,
  DEFAULT_HEADER_PREFERENCES,
  DEFAULT_HEADER_WIDGET_ORDER,
  DEFAULT_HEADER_WIDGETS,
} from '../utils/headerDefaults';
import { GLASS_PRESETS } from '../utils/navigationDefaults';

export type HeaderSaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface HeaderContextValue {
  preferences: HeaderPreferences;
  savedPreferences: HeaderPreferences;
  draftPreferences: HeaderPreferences;
  isDirty: boolean;
  saveStatus: HeaderSaveStatus;
  isHeaderStudioOpen: boolean;

  // Studio Controls
  openHeaderStudio: () => void;
  closeHeaderStudio: () => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Draft & Apply
  setApplyMode: (mode: 'live' | 'preview') => void;
  applyDraft: () => void;
  discardDraft: () => void;
  updateDraft: (updater: (prev: HeaderPreferences) => HeaderPreferences) => void;

  // Granular Updaters
  setLayoutConfig: (config: Partial<HeaderLayoutConfig>) => void;
  setGlassConfig: (config: Partial<LiquidGlassConfig>) => void;
  setGlassPreset: (preset: GlassPreset) => void;
  toggleWidgetVisible: (widgetId: string) => void;
  moveWidget: (widgetId: string, direction: 'left' | 'right') => void;
  setAppearanceConfig: (config: Partial<HeaderAppearanceConfig>) => void;

  // Profiles
  allProfiles: HeaderProfile[];
  loadProfile: (profileId: string) => void;
  saveCurrentProfile: (name: string, description: string, iconName?: string) => void;
  deleteCustomProfile: (profileId: string) => void;

  // Resets
  resetLayout: () => void;
  resetGlass: () => void;
  resetWidgets: () => void;
  resetAll: () => void;

  // Import / Export
  exportConfigJson: () => string;
  importConfigJson: (jsonStr: string) => { success: boolean; message: string };

  // Diagnostics
  runSelfTest: () => HeaderSelfTestResult[];
}

const STORAGE_KEY = 'apexos_header_preferences_v1';

const HeaderContext = createContext<HeaderContextValue | null>(null);

function normalizeHeaderPreferences(raw: any): HeaderPreferences {
  const base = { ...DEFAULT_HEADER_PREFERENCES };
  if (!raw || typeof raw !== 'object') return base;

  const layout: HeaderLayoutConfig = {
    ...DEFAULT_HEADER_LAYOUT,
    ...(raw.layout || {}),
  };

  const glassConfig: LiquidGlassConfig = {
    ...DEFAULT_HEADER_PREFERENCES.glassConfig,
    ...(raw.glassConfig || {}),
  };

  const appearance: HeaderAppearanceConfig = {
    ...DEFAULT_HEADER_APPEARANCE,
    ...(raw.appearance || {}),
  };

  const widgets = {
    ...DEFAULT_HEADER_WIDGETS,
    ...(raw.widgets || {}),
  };

  const widgetOrder = Array.isArray(raw.widgetOrder) && raw.widgetOrder.length > 0
    ? raw.widgetOrder
    : [...DEFAULT_HEADER_WIDGET_ORDER];

  return {
    ...base,
    ...raw,
    layout,
    glassConfig,
    widgets,
    widgetOrder,
    appearance,
  };
}

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedPreferences, setSavedPreferences] = useState<HeaderPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return normalizeHeaderPreferences(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load header preferences', e);
    }
    return DEFAULT_HEADER_PREFERENCES;
  });

  const [draftPreferences, setDraftPreferences] = useState<HeaderPreferences>(savedPreferences);
  const [history, setHistory] = useState<HeaderPreferences[]>([savedPreferences]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<HeaderSaveStatus>('saved');
  const [isHeaderStudioOpen, setIsHeaderStudioOpen] = useState<boolean>(false);

  const isLiveApply = draftPreferences.applyMode === 'live';
  const preferences = isLiveApply ? draftPreferences : savedPreferences;
  const isDirty = useMemo(
    () => JSON.stringify(savedPreferences) !== JSON.stringify(draftPreferences),
    [savedPreferences, draftPreferences]
  );

  // Sync Header CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    const l = preferences.layout || DEFAULT_HEADER_LAYOUT;
    root.style.setProperty('--header-height', `${l.height}px`);
    root.style.setProperty('--header-outer-margin', `${l.outerMargin}px`);
    root.style.setProperty('--header-corner-radius', `${l.cornerRadius}px`);
    root.style.setProperty('--header-padding-x', `${l.paddingX}px`);
    root.style.setProperty('--header-gap', `${l.gap}px`);
  }, [preferences.layout]);

  const persistPreferences = useCallback((prefsToSave: HeaderPreferences) => {
    setSaveStatus('saving');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave));
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save header preferences', e);
      setSaveStatus('error');
    }
  }, []);

  const updateDraft = useCallback((updater: (prev: HeaderPreferences) => HeaderPreferences) => {
    setDraftPreferences((prev) => {
      const next = updater(prev);
      setHistory((h) => {
        const sliced = h.slice(0, historyIndex + 1);
        return [...sliced, next];
      });
      setHistoryIndex((i) => i + 1);

      if (next.applyMode === 'live') {
        setSavedPreferences(next);
        persistPreferences(next);
      }
      return next;
    });
  }, [historyIndex, persistPreferences]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setDraftPreferences(target);
      if (target.applyMode === 'live') {
        setSavedPreferences(target);
        persistPreferences(target);
      }
    }
  }, [historyIndex, history, persistPreferences]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setDraftPreferences(target);
      if (target.applyMode === 'live') {
        setSavedPreferences(target);
        persistPreferences(target);
      }
    }
  }, [historyIndex, history, persistPreferences]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const applyDraft = useCallback(() => {
    setSavedPreferences(draftPreferences);
    persistPreferences(draftPreferences);
  }, [draftPreferences, persistPreferences]);

  const discardDraft = useCallback(() => {
    setDraftPreferences(savedPreferences);
  }, [savedPreferences]);

  const setApplyMode = useCallback((mode: 'live' | 'preview') => {
    updateDraft((prev) => ({ ...prev, applyMode: mode }));
  }, [updateDraft]);

  const setLayoutConfig = useCallback((config: Partial<HeaderLayoutConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      layout: { ...prev.layout, ...config },
    }));
  }, [updateDraft]);

  const setGlassConfig = useCallback((config: Partial<LiquidGlassConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      glassConfig: {
        ...prev.glassConfig,
        ...config,
        preset: config.preset || 'custom',
      },
    }));
  }, [updateDraft]);

  const setGlassPreset = useCallback((preset: GlassPreset) => {
    const presetConfig = GLASS_PRESETS[preset] || GLASS_PRESETS.minimal;
    updateDraft((prev) => ({
      ...prev,
      glassConfig: { ...presetConfig },
    }));
  }, [updateDraft]);

  const toggleWidgetVisible = useCallback((widgetId: string) => {
    updateDraft((prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: !prev.widgets[widgetId],
      },
    }));
  }, [updateDraft]);

  const moveWidget = useCallback((widgetId: string, direction: 'left' | 'right') => {
    updateDraft((prev) => {
      const order = [...prev.widgetOrder];
      const idx = order.indexOf(widgetId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= order.length) return prev;

      const temp = order[idx];
      order[idx] = order[targetIdx];
      order[targetIdx] = temp;

      return {
        ...prev,
        widgetOrder: order,
      };
    });
  }, [updateDraft]);

  const setAppearanceConfig = useCallback((config: Partial<HeaderAppearanceConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...config },
    }));
  }, [updateDraft]);

  const allProfiles = useMemo(() => [
    ...BUILTIN_HEADER_PROFILES,
    ...preferences.customProfiles,
  ], [preferences.customProfiles]);

  const loadProfile = useCallback((profileId: string) => {
    const target = allProfiles.find((p) => p.id === profileId);
    if (!target) return;

    updateDraft((prev) => ({
      ...prev,
      activeProfileId: profileId,
      layout: { ...target.layout },
      glassConfig: { ...target.glassConfig },
      widgets: { ...target.widgets },
      widgetOrder: [...target.widgetOrder],
      appearance: { ...target.appearance },
    }));
  }, [allProfiles, updateDraft]);

  const saveCurrentProfile = useCallback((name: string, description: string, iconName = 'Sparkles') => {
    const newProfile: HeaderProfile = {
      id: `custom-header-${Date.now()}`,
      name,
      description,
      iconName,
      layout: { ...preferences.layout },
      glassConfig: { ...preferences.glassConfig },
      widgets: { ...preferences.widgets },
      widgetOrder: [...preferences.widgetOrder],
      appearance: { ...preferences.appearance },
      isCustom: true,
    };

    updateDraft((prev) => ({
      ...prev,
      customProfiles: [...prev.customProfiles, newProfile],
      activeProfileId: newProfile.id,
    }));
  }, [preferences, updateDraft]);

  const deleteCustomProfile = useCallback((profileId: string) => {
    updateDraft((prev) => ({
      ...prev,
      customProfiles: prev.customProfiles.filter((p) => p.id !== profileId),
      activeProfileId: prev.activeProfileId === profileId ? 'default-glass' : prev.activeProfileId,
    }));
  }, [updateDraft]);

  const resetLayout = useCallback(() => {
    updateDraft((prev) => ({
      ...prev,
      layout: { ...DEFAULT_HEADER_LAYOUT },
    }));
  }, [updateDraft]);

  const resetGlass = useCallback(() => {
    updateDraft((prev) => ({
      ...prev,
      glassConfig: { ...GLASS_PRESETS.minimal },
    }));
  }, [updateDraft]);

  const resetWidgets = useCallback(() => {
    updateDraft((prev) => ({
      ...prev,
      widgets: { ...DEFAULT_HEADER_WIDGETS },
      widgetOrder: [...DEFAULT_HEADER_WIDGET_ORDER],
    }));
  }, [updateDraft]);

  const resetAll = useCallback(() => {
    setSavedPreferences(DEFAULT_HEADER_PREFERENCES);
    setDraftPreferences(DEFAULT_HEADER_PREFERENCES);
    setHistory([DEFAULT_HEADER_PREFERENCES]);
    setHistoryIndex(0);
    localStorage.removeItem(STORAGE_KEY);
    setSaveStatus('saved');
  }, []);

  const exportConfigJson = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  const importConfigJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Geçersiz JSON formatı.' };
      }
      const normalized = normalizeHeaderPreferences(parsed);
      setDraftPreferences(normalized);
      setSavedPreferences(normalized);
      persistPreferences(normalized);
      return { success: true, message: 'Header yapılandırması başarıyla içe aktarıldı.' };
    } catch (e: any) {
      return { success: false, message: `JSON ayrıştırma hatası: ${e.message}` };
    }
  }, [persistPreferences]);

  const runSelfTest = useCallback((): HeaderSelfTestResult[] => {
    const results: HeaderSelfTestResult[] = [];

    results.push({
      id: 'store',
      name: 'Header Store & State',
      status: preferences.layout && preferences.glassConfig ? 'passed' : 'failed',
      message: 'Header state store aktif.',
    });

    results.push({
      id: 'glass',
      name: 'Header Liquid Glass Engine',
      status: preferences.glassConfig.blur > 0 ? 'passed' : 'warning',
      message: `Preset: ${preferences.glassConfig.preset}, Blur: ${preferences.glassConfig.blur}px`,
    });

    results.push({
      id: 'widgets',
      name: 'Header Widget Registry',
      status: Object.keys(preferences.widgets).length > 0 ? 'passed' : 'failed',
      message: `${Object.keys(preferences.widgets).length} Araç kayıtlı.`,
    });

    return results;
  }, [preferences]);

  const openHeaderStudio = useCallback(() => setIsHeaderStudioOpen(true), []);
  const closeHeaderStudio = useCallback(() => setIsHeaderStudioOpen(false), []);

  return (
    <HeaderContext.Provider
      value={{
        preferences,
        savedPreferences,
        draftPreferences,
        isDirty,
        saveStatus,
        isHeaderStudioOpen,
        openHeaderStudio,
        closeHeaderStudio,

        undo,
        redo,
        canUndo,
        canRedo,

        setApplyMode,
        applyDraft,
        discardDraft,
        updateDraft,

        setLayoutConfig,
        setGlassConfig,
        setGlassPreset,
        toggleWidgetVisible,
        moveWidget,
        setAppearanceConfig,

        allProfiles,
        loadProfile,
        saveCurrentProfile,
        deleteCustomProfile,

        resetLayout,
        resetGlass,
        resetWidgets,
        resetAll,

        exportConfigJson,
        importConfigJson,
        runSelfTest,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};
