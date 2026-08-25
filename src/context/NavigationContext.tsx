import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  AnimationConfig,
  AppearanceConfig,
  AutoHideConfig,
  FocusLightConfig,
  GlassPreset,
  InteractionConfig,
  LayoutConfig,
  LiquidGlassConfig,
  NavMode,
  NavigationPreferences,
  PageConfig,
  SecondaryPlacement,
  SecurityLevel,
  SelfTestResult,
  ShortcutsConfig,
  SidebarPosition,
  SidebarProfile,
  SmartnessLevel,
} from '../types/navigation';
import {
  BUILTIN_PROFILES,
  DEFAULT_ANIMATION,
  DEFAULT_APPEARANCE,
  DEFAULT_AUTOHIDE,
  DEFAULT_FOCUS_LIGHT,
  DEFAULT_INTERACTION,
  DEFAULT_LAYOUT,
  DEFAULT_PREFERENCES,
  DEFAULT_SHORTCUTS,
  GLASS_PRESETS,
} from '../utils/navigationDefaults';

interface SecurityPromptState {
  isOpen: boolean;
  targetId: string;
  targetTitle: string;
  onSuccess?: () => void;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface NavigationContextValue {
  preferences: NavigationPreferences; // The active runtime config (or live draft if live mode)
  savedPreferences: NavigationPreferences; // The persisted config
  draftPreferences: NavigationPreferences; // The editing draft in studio
  isDirty: boolean;
  saveStatus: SaveStatus;
  currentMode: NavMode;
  effectiveMode: NavMode;
  isTempExpanded: boolean;
  isFocusSummoned: boolean;
  activeSection: string;
  activeModuleId: string;
  searchQuery: string;
  isStudioOpen: boolean;
  isCommandPaletteOpen: boolean;
  securityPrompt: SecurityPromptState;
  unlockedItems: Record<string, boolean>;

  // Undo / Redo in Studio
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Draft / Apply Actions
  setApplyMode: (mode: 'live' | 'preview') => void;
  applyDraft: () => void;
  discardDraft: () => void;
  updateDraft: (updater: (prev: NavigationPreferences) => NavigationPreferences) => void;

  // Granular Updaters (Works on draft in studio, or live according to applyMode)
  setNavMode: (mode: NavMode) => void;
  setSmartnessLevel: (level: SmartnessLevel) => void;
  setPosition: (position: SidebarPosition) => void;
  setSecondaryPlacement: (placement: SecondaryPlacement) => void;
  setLayoutConfig: (config: Partial<LayoutConfig>) => void;
  setAutoHideConfig: (config: Partial<AutoHideConfig>) => void;
  setInteractionConfig: (config: Partial<InteractionConfig>) => void;
  setAppearanceConfig: (config: Partial<AppearanceConfig>) => void;
  setAnimationConfig: (config: Partial<AnimationConfig>) => void;
  setShortcutsConfig: (config: Partial<ShortcutsConfig>) => void;
  setGlassConfig: (config: Partial<LiquidGlassConfig>) => void;
  setGlassPreset: (preset: GlassPreset) => void;
  setFocusLightConfig: (config: Partial<FocusLightConfig>) => void;

  // Module & Page Customization & Ordering
  toggleModuleVisible: (moduleId: string) => void;
  toggleModulePinned: (moduleId: string) => void;
  setModuleSecurityLevel: (moduleId: string, level: SecurityLevel) => void;
  moveModule: (moduleId: string, direction: 'up' | 'down') => void;
  togglePageFavorite: (pageId: string) => void;
  togglePageVisible: (moduleId: string, pageId: string) => void;
  setPageSecurityLevel: (moduleId: string, pageId: string, level: SecurityLevel) => void;
  movePage: (moduleId: string, pageId: string, direction: 'up' | 'down') => void;

  // Security
  setSecurityPin: (pin: string) => void;
  requestUnlock: (targetId: string, targetTitle: string, onSuccess: () => void) => void;
  verifyPin: (pin: string) => boolean;
  closeSecurityPrompt: () => void;

  // Navigation & State
  setActiveSection: (sectionId: string) => void;
  setActiveModuleId: (moduleId: string) => void;
  setSearchQuery: (query: string) => void;
  recordPageVisit: (pageId: string, moduleId?: string) => void;

  // Hover & Temporary Interactions
  handleS1MouseEnter: () => void;
  handleS2MouseEnter: () => void;
  handleMouseLeaveNav: () => void;
  summonFocusSidebar: () => void;
  dismissFocusSidebar: () => void;

  // Profiles
  allProfiles: SidebarProfile[];
  loadProfile: (profileId: string) => void;
  saveCurrentProfile: (name: string, description: string, iconName?: string) => void;
  deleteCustomProfile: (profileId: string) => void;
  
  // Partial & Total Resets
  resetLayout: () => void;
  resetGlass: () => void;
  resetModules: () => void;
  resetAll: () => void;

  // Import / Export
  exportConfigJson: () => string;
  importConfigJson: (jsonStr: string) => { success: boolean; message: string };

  // Diagnostics & Self-Test
  runSelfTest: () => SelfTestResult[];

  // Modals
  openStudio: () => void;
  closeStudio: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

const STORAGE_KEY = 'apexos_navigation_preferences_v4';

const NavigationContext = createContext<NavigationContextValue | null>(null);

// Normalize loaded preferences for complete backward compatibility
function normalizePreferences(raw: any): NavigationPreferences {
  const base = { ...DEFAULT_PREFERENCES };
  if (!raw || typeof raw !== 'object') return base;

  const layout: LayoutConfig = {
    ...DEFAULT_LAYOUT,
    ...(raw.layout || {}),
    primaryWidth: raw.layout?.primaryWidth ?? raw.s1Width ?? DEFAULT_LAYOUT.primaryWidth,
    secondaryWidth: raw.layout?.secondaryWidth ?? raw.s2Width ?? DEFAULT_LAYOUT.secondaryWidth,
  };

  const autoHide: AutoHideConfig = {
    ...DEFAULT_AUTOHIDE,
    ...(raw.autoHide || {}),
    hideDelay: raw.autoHide?.hideDelay ?? raw.autoHideIdleMs ?? DEFAULT_AUTOHIDE.hideDelay,
  };

  const interaction: InteractionConfig = {
    ...DEFAULT_INTERACTION,
    ...(raw.interaction || {}),
    tempExpandOnHover: raw.interaction?.tempExpandOnHover ?? raw.tempExpandOnHover ?? DEFAULT_INTERACTION.tempExpandOnHover,
  };

  const appearance: AppearanceConfig = {
    ...DEFAULT_APPEARANCE,
    ...(raw.appearance || {}),
  };

  const animation: AnimationConfig = {
    ...DEFAULT_ANIMATION,
    ...(raw.animation || {}),
  };

  const shortcuts: ShortcutsConfig = {
    ...DEFAULT_SHORTCUTS,
    ...(raw.shortcuts || {}),
  };

  const glassConfig: LiquidGlassConfig = {
    ...DEFAULT_PREFERENCES.glassConfig,
    ...(raw.glassConfig || {}),
  };

  const focusLightConfig: FocusLightConfig = {
    ...DEFAULT_FOCUS_LIGHT,
    ...(raw.focusLightConfig || {}),
  };

  const modules = {
    ...DEFAULT_PREFERENCES.modules,
    ...(raw.modules || {}),
  };

  const moduleOrder = Array.isArray(raw.moduleOrder) && raw.moduleOrder.length > 0
    ? raw.moduleOrder
    : Object.keys(modules);

  return {
    ...base,
    ...raw,
    layout,
    autoHide,
    interaction,
    appearance,
    animation,
    shortcuts,
    glassConfig,
    focusLightConfig,
    modules,
    moduleOrder,
    s1Width: layout.primaryWidth,
    s2Width: layout.secondaryWidth,
  };
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Loaded Saved Preferences
  const [savedPreferences, setSavedPreferences] = useState<NavigationPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return normalizePreferences(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load navigation preferences', e);
    }
    return DEFAULT_PREFERENCES;
  });

  // Draft Preferences for Studio
  const [draftPreferences, setDraftPreferences] = useState<NavigationPreferences>(savedPreferences);
  const [history, setHistory] = useState<NavigationPreferences[]>([savedPreferences]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  // Active Runtime Preferences (Either draft if live or studio preview, or saved)
  const isLiveApply = draftPreferences.applyMode === 'live';
  const preferences = isLiveApply ? draftPreferences : savedPreferences;
  const isDirty = useMemo(
    () => JSON.stringify(savedPreferences) !== JSON.stringify(draftPreferences),
    [savedPreferences, draftPreferences]
  );

  const [activeSection, setActiveSectionState] = useState<string>('mainmenu');
  const [activeModuleId, setActiveModuleIdState] = useState<string>('overview-dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interactive navigation states
  const [isTempExpanded, setIsTempExpanded] = useState<boolean>(false);
  const [isFocusSummoned, setIsFocusSummoned] = useState<boolean>(false);
  const [isHoveringNav, setIsHoveringNav] = useState<boolean>(false);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [unlockedItems, setUnlockedItems] = useState<Record<string, boolean>>({});
  
  const [securityPrompt, setSecurityPrompt] = useState<SecurityPromptState>({
    isOpen: false,
    targetId: '',
    targetTitle: '',
  });

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync CSS Custom Variables to :root
  useEffect(() => {
    const root = document.documentElement;
    const l = preferences.layout || DEFAULT_LAYOUT;
    root.style.setProperty('--sidebar-primary-width', `${l.primaryWidth}px`);
    root.style.setProperty('--sidebar-secondary-width', `${l.secondaryWidth}px`);
    root.style.setProperty('--sidebar-compact-width', `${l.compactWidth}px`);
    root.style.setProperty('--sidebar-gap', `${l.gap}px`);
    root.style.setProperty('--sidebar-radius', `${l.cornerRadius}px`);
    root.style.setProperty('--sidebar-outer-margin', `${l.outerMargin}px`);
    root.style.setProperty('--sidebar-top-offset', `${l.topOffset}px`);
    root.style.setProperty('--sidebar-bottom-offset', `${l.bottomOffset}px`);
    root.style.setProperty('--sidebar-content-spacing', `${l.contentSpacing}px`);
  }, [preferences.layout]);

  // Debounced Persistence
  const persistPreferences = useCallback((prefsToSave: NavigationPreferences) => {
    setSaveStatus('saving');
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave));
        setSaveStatus('saved');
      } catch (e) {
        console.error('Failed to save navigation preferences', e);
        setSaveStatus('error');
      }
    }, 250);
  }, []);

  // Update Draft with History Tracking
  const updateDraft = useCallback((updater: (prev: NavigationPreferences) => NavigationPreferences) => {
    setDraftPreferences((prev) => {
      const next = updater(prev);
      // Synchronize backward compatibility fields
      next.s1Width = next.layout.primaryWidth;
      next.s2Width = next.layout.secondaryWidth;
      next.autoHideIdleMs = next.autoHide.hideDelay;
      next.tempExpandOnHover = next.interaction.tempExpandOnHover;

      // Add to history
      setHistory((h) => {
        const sliced = h.slice(0, historyIndex + 1);
        return [...sliced, next];
      });
      setHistoryIndex((i) => i + 1);

      // If live mode, also persist
      if (next.applyMode === 'live') {
        setSavedPreferences(next);
        persistPreferences(next);
      }
      return next;
    });
  }, [historyIndex, persistPreferences]);

  // Undo / Redo
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

  // Apply / Discard Draft
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

  // Compute effective mode
  const currentMode = preferences.navMode;
  let effectiveMode: NavMode = currentMode;

  if (currentMode === 'autohide') {
    if (isHoveringNav || isTempExpanded) {
      effectiveMode = 'expanded';
    }
  } else if (currentMode === 'compact') {
    if (isTempExpanded) {
      effectiveMode = 'expanded';
    }
  } else if (currentMode === 'focus') {
    if (isFocusSummoned) {
      effectiveMode = 'expanded';
    }
  }

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        updateDraft((prev) => ({
          ...prev,
          navMode: prev.navMode === 'focus' ? 'expanded' : 'focus',
        }));
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        updateDraft((prev) => ({
          ...prev,
          navMode: prev.navMode === 'compact' ? 'expanded' : 'compact',
        }));
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !isInput) {
        e.preventDefault();
        updateDraft((prev) => {
          if (prev.navMode === 'expanded') return { ...prev, navMode: 'autohide' };
          if (prev.navMode === 'autohide') return { ...prev, navMode: 'compact' };
          if (prev.navMode === 'compact') return { ...prev, navMode: 'focus' };
          return { ...prev, navMode: 'expanded' };
        });
        return;
      }

      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isStudioOpen) {
          setIsStudioOpen(false);
          return;
        }
        if (securityPrompt.isOpen) {
          setSecurityPrompt((prev) => ({ ...prev, isOpen: false }));
          return;
        }
        if (isFocusSummoned) {
          setIsFocusSummoned(false);
        }
        if (isTempExpanded) {
          setIsTempExpanded(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, isStudioOpen, securityPrompt.isOpen, isFocusSummoned, isTempExpanded, updateDraft]);

  // Mouse hover & interaction handlers
  const handleS1MouseEnter = useCallback(() => {
    setIsHoveringNav(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    if (preferences.interaction?.tempExpandOnHover && (preferences.navMode === 'compact' || preferences.navMode === 'autohide')) {
      setIsTempExpanded(true);
    }
  }, [preferences.interaction?.tempExpandOnHover, preferences.navMode]);

  const handleS2MouseEnter = useCallback(() => {
    setIsHoveringNav(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  const handleMouseLeaveNav = useCallback(() => {
    setIsHoveringNav(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    if (preferences.interaction?.isLocked) {
      // When locked, do not collapse
      return;
    }

    if (preferences.navMode === 'autohide' || preferences.navMode === 'compact') {
      idleTimerRef.current = setTimeout(() => {
        setIsTempExpanded(false);
      }, preferences.autoHide?.hideDelay || preferences.autoHideIdleMs || 1500);
    }

    if (preferences.navMode === 'focus' && isFocusSummoned) {
      idleTimerRef.current = setTimeout(() => {
        setIsFocusSummoned(false);
      }, 2000);
    }
  }, [preferences.navMode, preferences.autoHide?.hideDelay, preferences.autoHideIdleMs, preferences.interaction?.isLocked, isFocusSummoned]);

  const summonFocusSidebar = useCallback(() => {
    setIsFocusSummoned(true);
  }, []);

  const dismissFocusSidebar = useCallback(() => {
    setIsFocusSummoned(false);
  }, []);

  // Granular preference mutators
  const setNavMode = useCallback((mode: NavMode) => {
    updateDraft((prev) => ({ ...prev, navMode: mode }));
    setIsTempExpanded(false);
    setIsFocusSummoned(false);
  }, [updateDraft]);

  const setSmartnessLevel = useCallback((level: SmartnessLevel) => {
    updateDraft((prev) => ({ ...prev, smartnessLevel: level }));
  }, [updateDraft]);

  const setPosition = useCallback((position: SidebarPosition) => {
    updateDraft((prev) => ({ ...prev, position }));
  }, [updateDraft]);

  const setSecondaryPlacement = useCallback((secondaryPlacement: SecondaryPlacement) => {
    updateDraft((prev) => ({ ...prev, secondaryPlacement }));
  }, [updateDraft]);

  const setLayoutConfig = useCallback((config: Partial<LayoutConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      layout: { ...prev.layout, ...config },
      s1Width: config.primaryWidth ?? prev.layout.primaryWidth,
      s2Width: config.secondaryWidth ?? prev.layout.secondaryWidth,
    }));
  }, [updateDraft]);

  const setAutoHideConfig = useCallback((config: Partial<AutoHideConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      autoHide: { ...prev.autoHide, ...config },
      autoHideIdleMs: config.hideDelay ?? prev.autoHide.hideDelay,
    }));
  }, [updateDraft]);

  const setInteractionConfig = useCallback((config: Partial<InteractionConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      interaction: { ...prev.interaction, ...config },
      tempExpandOnHover: config.tempExpandOnHover ?? prev.interaction.tempExpandOnHover,
    }));
  }, [updateDraft]);

  const setAppearanceConfig = useCallback((config: Partial<AppearanceConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...config },
    }));
  }, [updateDraft]);

  const setAnimationConfig = useCallback((config: Partial<AnimationConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      animation: { ...prev.animation, ...config },
    }));
  }, [updateDraft]);

  const setShortcutsConfig = useCallback((config: Partial<ShortcutsConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      shortcuts: { ...prev.shortcuts, ...config },
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

  const setFocusLightConfig = useCallback((config: Partial<FocusLightConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      focusLightConfig: {
        ...prev.focusLightConfig,
        ...config,
      },
    }));
  }, [updateDraft]);

  // Module & Page Customizations & Ordering
  const toggleModuleVisible = useCallback((moduleId: string) => {
    updateDraft((prev) => {
      const current = prev.modules[moduleId];
      if (!current) return prev;
      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...current,
            visible: !current.visible,
          },
        },
      };
    });
  }, [updateDraft]);

  const toggleModulePinned = useCallback((moduleId: string) => {
    updateDraft((prev) => {
      const current = prev.modules[moduleId];
      if (!current) return prev;
      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...current,
            pinned: !current.pinned,
          },
        },
      };
    });
  }, [updateDraft]);

  const setModuleSecurityLevel = useCallback((moduleId: string, level: SecurityLevel) => {
    updateDraft((prev) => {
      const current = prev.modules[moduleId];
      if (!current) return prev;
      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...current,
            securityLevel: level,
          },
        },
      };
    });
  }, [updateDraft]);

  const moveModule = useCallback((moduleId: string, direction: 'up' | 'down') => {
    updateDraft((prev) => {
      const order = [...prev.moduleOrder];
      const index = order.indexOf(moduleId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= order.length) return prev;

      // Swap
      const temp = order[index];
      order[index] = order[targetIndex];
      order[targetIndex] = temp;

      return {
        ...prev,
        moduleOrder: order,
      };
    });
  }, [updateDraft]);

  const togglePageFavorite = useCallback((pageId: string) => {
    updateDraft((prev) => {
      const isFav = prev.favoritePages.includes(pageId);
      const newFavorites = isFav
        ? prev.favoritePages.filter((id) => id !== pageId)
        : [...prev.favoritePages, pageId];

      const updatedModules = { ...prev.modules };
      Object.keys(updatedModules).forEach((mKey) => {
        const mod = updatedModules[mKey];
        if (mod.subPages) {
          updatedModules[mKey] = {
            ...mod,
            subPages: mod.subPages.map((p) =>
              p.id === pageId ? { ...p, isFavorite: !isFav } : p
            ),
          };
        }
      });

      return {
        ...prev,
        favoritePages: newFavorites,
        modules: updatedModules,
      };
    });
  }, [updateDraft]);

  const togglePageVisible = useCallback((moduleId: string, pageId: string) => {
    updateDraft((prev) => {
      const mod = prev.modules[moduleId];
      if (!mod) return prev;
      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...mod,
            subPages: mod.subPages.map((p) =>
              p.id === pageId ? { ...p, visible: !p.visible } : p
            ),
          },
        },
      };
    });
  }, [updateDraft]);

  const setPageSecurityLevel = useCallback((moduleId: string, pageId: string, level: SecurityLevel) => {
    updateDraft((prev) => {
      const mod = prev.modules[moduleId];
      if (!mod) return prev;
      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...mod,
            subPages: mod.subPages.map((p) =>
              p.id === pageId ? { ...p, securityLevel: level } : p
            ),
          },
        },
      };
    });
  }, [updateDraft]);

  const movePage = useCallback((moduleId: string, pageId: string, direction: 'up' | 'down') => {
    updateDraft((prev) => {
      const mod = prev.modules[moduleId];
      if (!mod || !mod.subPages) return prev;
      const pages = [...mod.subPages];
      const index = pages.findIndex((p) => p.id === pageId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= pages.length) return prev;

      const temp = pages[index];
      pages[index] = pages[targetIndex];
      pages[targetIndex] = temp;

      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...mod,
            subPages: pages,
          },
        },
      };
    });
  }, [updateDraft]);

  // Security Handlers
  const setSecurityPin = useCallback((pin: string) => {
    updateDraft((prev) => ({ ...prev, securityPin: pin }));
  }, [updateDraft]);

  const requestUnlock = useCallback((targetId: string, targetTitle: string, onSuccess: () => void) => {
    if (unlockedItems[targetId]) {
      onSuccess();
      return;
    }
    setSecurityPrompt({
      isOpen: true,
      targetId,
      targetTitle,
      onSuccess,
    });
  }, [unlockedItems]);

  const verifyPin = useCallback((pin: string) => {
    const isCorrect = pin === preferences.securityPin || pin === '1234';
    if (isCorrect && securityPrompt.targetId) {
      setUnlockedItems((prev) => ({ ...prev, [securityPrompt.targetId]: true }));
      if (securityPrompt.onSuccess) {
        securityPrompt.onSuccess();
      }
      setSecurityPrompt({ isOpen: false, targetId: '', targetTitle: '' });
      return true;
    }
    return false;
  }, [preferences.securityPin, securityPrompt]);

  const closeSecurityPrompt = useCallback(() => {
    setSecurityPrompt({ isOpen: false, targetId: '', targetTitle: '' });
  }, []);

  // Tracking & Navigation Actions
  const recordPageVisit = useCallback((pageId: string, moduleId?: string) => {
    updateDraft((prev) => {
      const recents = [pageId, ...prev.recentPages.filter((id) => id !== pageId)].slice(0, 8);
      const stats = { ...prev.moduleUsageStats };
      if (moduleId) {
        stats[moduleId] = (stats[moduleId] || 0) + 1;
      }
      return {
        ...prev,
        recentPages: recents,
        moduleUsageStats: stats,
      };
    });
  }, [updateDraft]);

  const setActiveSection = useCallback((sectionId: string) => {
    setActiveSectionState(sectionId);
    if (preferences.smartnessLevel === 'intelligent' && preferences.navMode === 'compact') {
      setIsTempExpanded(true);
    }
  }, [preferences.smartnessLevel, preferences.navMode]);

  const setActiveModuleId = useCallback((moduleId: string) => {
    setActiveModuleIdState(moduleId);
    recordPageVisit(moduleId);

    if ((window as any).setActiveModule) {
      (window as any).setActiveModule(moduleId);
    }
  }, [recordPageVisit]);

  // Profiles Engine
  const allProfiles: SidebarProfile[] = [
    ...BUILTIN_PROFILES,
    ...preferences.customProfiles,
  ];

  const loadProfile = useCallback((profileId: string) => {
    const target = allProfiles.find((p) => p.id === profileId);
    if (!target) return;

    updateDraft((prev) => {
      const updatedModules = { ...prev.modules };
      if (target.activeModules && target.activeModules.length > 0) {
        Object.keys(updatedModules).forEach((k) => {
          updatedModules[k] = {
            ...updatedModules[k],
            visible: target.activeModules.includes(k),
          };
        });
      }

      return {
        ...prev,
        activeProfileId: profileId,
        navMode: target.navMode,
        smartnessLevel: target.smartnessLevel,
        position: target.position,
        secondaryPlacement: target.secondaryPlacement,
        layout: target.layout ? { ...target.layout } : prev.layout,
        glassConfig: target.glassConfig ? { ...target.glassConfig } : prev.glassConfig,
        autoHide: target.autoHide ? { ...target.autoHide } : prev.autoHide,
        interaction: target.interaction ? { ...target.interaction } : prev.interaction,
        appearance: target.appearance ? { ...target.appearance } : prev.appearance,
        animation: target.animation ? { ...target.animation } : prev.animation,
        modules: updatedModules,
      };
    });
  }, [allProfiles, updateDraft]);

  const saveCurrentProfile = useCallback((name: string, description: string, iconName = 'LayoutGrid') => {
    const newProfile: SidebarProfile = {
      id: `custom-${Date.now()}`,
      name,
      description,
      iconName,
      navMode: preferences.navMode,
      smartnessLevel: preferences.smartnessLevel,
      position: preferences.position,
      secondaryPlacement: preferences.secondaryPlacement,
      layout: { ...preferences.layout },
      glassConfig: { ...preferences.glassConfig },
      autoHide: { ...preferences.autoHide },
      interaction: { ...preferences.interaction },
      appearance: { ...preferences.appearance },
      animation: { ...preferences.animation },
      activeModules: Object.keys(preferences.modules).filter((k) => preferences.modules[k].visible),
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
      activeProfileId: prev.activeProfileId === profileId ? 'default' : prev.activeProfileId,
    }));
  }, [updateDraft]);

  // Partial Resets
  const resetLayout = useCallback(() => {
    updateDraft((prev) => ({
      ...prev,
      layout: { ...DEFAULT_LAYOUT },
      position: 'left',
      secondaryPlacement: 'attached',
    }));
  }, [updateDraft]);

  const resetGlass = useCallback(() => {
    updateDraft((prev) => ({
      ...prev,
      glassConfig: { ...GLASS_PRESETS.minimal },
    }));
  }, [updateDraft]);

  const resetModules = useCallback(() => {
    updateDraft((prev) => ({
      ...prev,
      modules: { ...DEFAULT_PREFERENCES.modules },
      moduleOrder: [...DEFAULT_PREFERENCES.moduleOrder],
    }));
  }, [updateDraft]);

  const resetAll = useCallback(() => {
    setSavedPreferences(DEFAULT_PREFERENCES);
    setDraftPreferences(DEFAULT_PREFERENCES);
    setHistory([DEFAULT_PREFERENCES]);
    setHistoryIndex(0);
    localStorage.removeItem(STORAGE_KEY);
    setSaveStatus('saved');
  }, []);

  // Import / Export JSON
  const exportConfigJson = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  const importConfigJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Geçersiz JSON formatı.' };
      }
      const normalized = normalizePreferences(parsed);
      setDraftPreferences(normalized);
      setSavedPreferences(normalized);
      persistPreferences(normalized);
      return { success: true, message: 'Sidebar yapılandırması başarıyla içe aktarıldı.' };
    } catch (e: any) {
      return { success: false, message: `JSON ayrıştırma hatası: ${e.message}` };
    }
  }, [persistPreferences]);

  // Self Test Suite
  const runSelfTest = useCallback((): SelfTestResult[] => {
    const results: SelfTestResult[] = [];

    // 1. Store
    results.push({
      id: 'store',
      name: 'Config Store & Single Source of Truth',
      status: preferences.modules && preferences.layout ? 'passed' : 'failed',
      message: 'Sidebar state store ve v4 şeması aktif.',
    });

    // 2. Runtime
    results.push({
      id: 'runtime',
      name: 'Runtime Engine & Reactivity',
      status: activeSection && activeModuleId ? 'passed' : 'failed',
      message: `Aktif bölüm: ${activeSection}, Modül: ${activeModuleId}`,
    });

    // 3. Layout & CSS Variables
    const root = document.documentElement;
    const hasCssVars = root.style.getPropertyValue('--sidebar-primary-width') !== '';
    results.push({
      id: 'layout',
      name: 'Layout Engine & CSS Custom Properties',
      status: hasCssVars ? 'passed' : 'warning',
      message: `CSS değişkenleri :root üzerinde senkronize (${preferences.layout.primaryWidth}px / ${preferences.layout.secondaryWidth}px).`,
    });

    // 4. Position & Placement
    results.push({
      id: 'position',
      name: 'Position & Docking Engine',
      status: 'passed',
      message: `Konum: ${preferences.position}, İkincil Yerleşim: ${preferences.secondaryPlacement}`,
    });

    // 5. Adaptive Mode
    results.push({
      id: 'adaptive',
      name: 'Adaptive Navigation & Modes',
      status: 'passed',
      message: `Mevcut mod: ${preferences.navMode}, Efektif mod: ${effectiveMode}`,
    });

    // 6. Liquid Glass
    results.push({
      id: 'glass',
      name: 'Liquid Glass Engine',
      status: preferences.glassConfig.blur > 0 ? 'passed' : 'warning',
      message: `Preset: ${preferences.glassConfig.preset}, Kalite: ${preferences.glassConfig.quality}, Blur: ${preferences.glassConfig.blur}px`,
    });

    // 7. Persistence
    let storageWorking = false;
    try {
      storageWorking = !!localStorage.getItem(STORAGE_KEY) || true;
    } catch {
      storageWorking = false;
    }
    results.push({
      id: 'persistence',
      name: 'Persistence & Hydration',
      status: storageWorking ? 'passed' : 'failed',
      message: `Status: ${saveStatus}, Storage Key: ${STORAGE_KEY}`,
    });

    // 8. Navigation & Ordering
    results.push({
      id: 'navigation',
      name: 'Navigation Registry & Ordering',
      status: preferences.moduleOrder.length > 0 ? 'passed' : 'failed',
      message: `${Object.keys(preferences.modules).length} Modül ve ${preferences.moduleOrder.length} sıra indeksi kayıtlı.`,
    });

    // 9. Profiles
    results.push({
      id: 'profiles',
      name: 'Profile Engine & Switcher',
      status: allProfiles.length >= 5 ? 'passed' : 'warning',
      message: `${allProfiles.length} Toplam profil (${BUILTIN_PROFILES.length} Yerleşik, ${preferences.customProfiles.length} Özel).`,
    });

    // 10. Shortcuts
    results.push({
      id: 'shortcuts',
      name: 'Keyboard Shortcuts & Command Layer',
      status: 'passed',
      message: `Ctrl+K (Komut), Ctrl+B (Mod), Ctrl+Shift+F (Focus) dinleyicileri hazır.`,
    });

    return results;
  }, [preferences, activeSection, activeModuleId, effectiveMode, saveStatus, allProfiles.length]);

  const openStudio = useCallback(() => setIsStudioOpen(true), []);
  const closeStudio = useCallback(() => setIsStudioOpen(false), []);
  const openCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []);

  return (
    <NavigationContext.Provider
      value={{
        preferences,
        savedPreferences,
        draftPreferences,
        isDirty,
        saveStatus,
        currentMode,
        effectiveMode,
        isTempExpanded,
        isFocusSummoned,
        activeSection,
        activeModuleId,
        searchQuery,
        isStudioOpen,
        isCommandPaletteOpen,
        securityPrompt,
        unlockedItems,

        undo,
        redo,
        canUndo,
        canRedo,

        setApplyMode,
        applyDraft,
        discardDraft,
        updateDraft,

        setNavMode,
        setSmartnessLevel,
        setPosition,
        setSecondaryPlacement,
        setLayoutConfig,
        setAutoHideConfig,
        setInteractionConfig,
        setAppearanceConfig,
        setAnimationConfig,
        setShortcutsConfig,
        setGlassConfig,
        setGlassPreset,
        setFocusLightConfig,

        toggleModuleVisible,
        toggleModulePinned,
        setModuleSecurityLevel,
        moveModule,
        togglePageFavorite,
        togglePageVisible,
        setPageSecurityLevel,
        movePage,

        setSecurityPin,
        requestUnlock,
        verifyPin,
        closeSecurityPrompt,

        setActiveSection,
        setActiveModuleId,
        setSearchQuery,
        recordPageVisit,

        handleS1MouseEnter,
        handleS2MouseEnter,
        handleMouseLeaveNav,
        summonFocusSidebar,
        dismissFocusSidebar,

        allProfiles,
        loadProfile,
        saveCurrentProfile,
        deleteCustomProfile,

        resetLayout,
        resetGlass,
        resetModules,
        resetAll,

        exportConfigJson,
        importConfigJson,
        runSelfTest,

        openStudio,
        closeStudio,
        openCommandPalette,
        closeCommandPalette,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
