import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Home,
  Wallet,
  NotebookPen,
  Sliders,
  Sparkles,
  Package,
  Users,
  Scale,
  Rss,
  CheckSquare,
  BookOpen,
  Key,
  Bookmark,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  BarChart3,
  FileBarChart,
  ShoppingBag,
  RotateCcw,
  X,
  Pin,
  FolderOpen,
  ChevronRight,
  Menu,
  AppWindow,
  Flame,
  MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { useDevice } from '../../hooks/useDevice';
import { useDockStore, DockProfile, IndicatorStyle, DockSize, GlassBlur, HapticStrength } from './DockStore';
import { DockItem, triggerHaptic } from './DockItem';
import { QuickActionsMenu } from './QuickActionsMenu';
import { DockCenterButton, AICommandPalette } from './DockCenterButton';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { LauncherDrawer } from './LauncherDrawer';
import clsx from 'clsx';

export interface AppShortcut {
  id: string;
  title: string;
  category: 'finance' | 'inventory' | 'notes' | 'social';
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

interface DockProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  toggleSidebar: () => void;
}

export const Dock: React.FC<DockProps> = ({
  activeModule,
  setActiveModule,
  toggleSidebar
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { settings, updateSetting } = useSettings();
  const { width, screenTier, isTablet, isDesktop } = useDevice();

  // Load state and helper setters from our DockStore
  const dockState = useDockStore();

  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Active folder state: 'finance' | 'notes' | 'inventory' | 'social' | null
  const [activeFolder, setActiveFolder] = useState<'finance' | 'notes' | 'inventory' | 'social' | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingSlotIdx, setEditingSlotIdx] = useState<number | null>(null);
  const [longPressModuleId, setLongPressModuleId] = useState<string | null>(null);
  const [longPressSlotIdx, setLongPressSlotIdx] = useState<number | null>(null);

  // Active hover/touch coordinate for Glass refraction effects
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track module usage in analytics
  useEffect(() => {
    dockState.logUsage(activeModule);
  }, [activeModule]);

  // Catalog of all applications in APEXOS
  const allApps: AppShortcut[] = useMemo(() => [
    // Finans
    { id: 'finance-dashboard', title: t('nav.dashboard', 'Finans Özeti'), category: 'finance', icon: <Wallet size={18} />, color: 'from-blue-500 to-indigo-600' },
    { id: 'finance-incomes', title: t('finance.incomes', 'Gelirler'), category: 'finance', icon: <TrendingUp size={18} />, color: 'from-emerald-500 to-teal-600' },
    { id: 'finance-expenses', title: t('finance.expenses', 'Giderler'), category: 'finance', icon: <TrendingDown size={18} />, color: 'from-rose-500 to-red-600' },
    { id: 'finance-subscriptions', title: t('finance.subscriptions', 'Abonelikler'), category: 'finance', icon: <CreditCard size={18} />, color: 'from-purple-500 to-violet-600' },
    { id: 'finance-investments', title: t('finance.investments', 'Yatırımlar'), category: 'finance', icon: <PiggyBank size={18} />, color: 'from-amber-500 to-yellow-600' },
    { id: 'finance-analytics', title: t('finance.analytics', 'Finansal Analiz'), category: 'finance', icon: <BarChart3 size={18} />, color: 'from-cyan-500 to-blue-600' },
    { id: 'finance-reports', title: t('finance.reports', 'Mali Raporlar'), category: 'finance', icon: <FileBarChart size={18} />, color: 'from-blue-600 to-indigo-800' },

    // Notlar & Görevler
    { id: 'notes-dashboard', title: t('nav.notes', 'Notlar Özeti'), category: 'notes', icon: <NotebookPen size={18} />, color: 'from-orange-500 to-amber-600' },
    { id: 'notes-todo', title: t('notes.todo', 'Yapılacaklar & Sayaç'), category: 'notes', icon: <CheckSquare size={18} />, color: 'from-emerald-500 to-green-600' },
    { id: 'notes-quick', title: t('notes.quickMemos', 'Hızlı Notlar'), category: 'notes', icon: <Sparkles size={18} />, color: 'from-amber-400 to-orange-500' },
    { id: 'notes-passwords', title: t('notes.passwords', 'Parola Kasası'), category: 'notes', icon: <Key size={18} />, color: 'from-rose-500 to-pink-600' },
    { id: 'notes-bookmarks', title: t('notes.bookmarks', 'Yer İmleri'), category: 'notes', icon: <Bookmark size={18} />, color: 'from-blue-400 to-indigo-500' },
    { id: 'notes-books', title: t('notes.books', 'Okuma Listesi'), category: 'notes', icon: <BookOpen size={18} />, color: 'from-teal-400 to-cyan-600' },
    { id: 'library-manga', title: t('nav.manga', 'Manga Kütüphanesi'), category: 'notes', icon: <BookOpen size={18} />, color: 'from-purple-500 to-indigo-600' },

    // Tedarik & Stok
    { id: 'purchasing-dashboard', title: t('nav.purchasing', 'Satınalma'), category: 'inventory', icon: <ShoppingBag size={18} />, color: 'from-amber-500 to-orange-600' },
    { id: 'fason-dashboard', title: t('nav.fason', 'Fason Takibi'), category: 'inventory', icon: <Package size={18} />, color: 'from-teal-500 to-emerald-600' },
    { id: 'stocks-dashboard', title: t('nav.stocks', 'Stok Yönetimi'), category: 'inventory', icon: <Package size={18} />, color: 'from-blue-500 to-cyan-600' },
    { id: 'contacts-list', title: t('nav.contacts', 'Cari Takibi'), category: 'inventory', icon: <Users size={18} />, color: 'from-violet-500 to-purple-700' },
    { id: 'recon-dashboard', title: t('nav.recon', 'BA-BS Mutabakat'), category: 'inventory', icon: <Scale size={18} />, color: 'from-indigo-500 to-blue-700' },

    // Sosyal & Bülten
    { id: 'bulletin-dashboard', title: t('nav.bulletin', 'Bülten & Haberler'), category: 'social', icon: <Rss size={18} />, color: 'from-rose-500 to-orange-500' },
  ], [t]);

  const appMap = useMemo(() => {
    const map = new Map<string, AppShortcut>();
    allApps.forEach(app => map.set(app.id, app));
    return map;
  }, [allApps]);

  // Retrieve active module brand color to dynamically change active indicator & hover aura
  const activeBrandColor = useMemo(() => {
    if (!dockState.dynamicColor) return '#70a1ff'; // default blue
    const activeApp = appMap.get(activeModule);
    if (!activeApp) return '#70a1ff';
    if (activeApp.color.includes('emerald') || activeApp.color.includes('teal')) return '#10b981'; // emerald green
    if (activeApp.color.includes('rose') || activeApp.color.includes('red')) return '#f43f5e'; // rose/red
    if (activeApp.color.includes('purple') || activeApp.color.includes('violet')) return '#8b5cf6'; // purple
    if (activeApp.color.includes('orange') || activeApp.color.includes('amber')) return '#f59e0b'; // amber/orange
    return '#70a1ff'; // default blue
  }, [activeModule, appMap, dockState.dynamicColor]);

  const filteredApps = useMemo(() => {
    let list = allApps;
    if (selectedCategory !== 'all') {
      list = list.filter(a => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
    }
    return list;
  }, [allApps, selectedCategory, searchQuery]);

  // Theme settings
  const isDark = settings['theme.mode']?.value === 'dark' || (settings['theme.mode']?.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Screen resolution factors
  const isXs = screenTier === 'xs' || width < 380;
  const isSm = screenTier === 'sm' || (width >= 380 && width < 640);

  // Responsive padding and spacing according to dockSize
  const dockSizeClass = useMemo(() => {
    const size = dockState.dockSize;
    if (size === 'sm') return "py-1.5 px-2 rounded-[22px]";
    if (size === 'lg') return "py-3.5 px-4 rounded-[32px]";
    return "py-2.5 px-3 rounded-[28px]"; // 'md'
  }, [dockState.dockSize]);

  // Glass blur intensity styling
  const glassBlurStyle = useMemo(() => {
    const blur = dockState.glassBlur;
    if (blur === 'low') return "backdrop-blur-md saturate-120";
    if (blur === 'high') return "backdrop-blur-[40px] saturate-[230%]";
    return "backdrop-blur-[24px] saturate-[180%]"; // 'medium'
  }, [dockState.glassBlur]);

  // Live widget simulation
  const getWidgetValue = (moduleId: string): string | undefined => {
    if (moduleId === 'finance-incomes') return '₺540K';
    if (moduleId === 'notes-todo') return '3 Görev';
    if (moduleId === 'bulletin-dashboard') return '12 Yeni';
    return undefined;
  };

  // Live badge counts
  const getBadgeCount = (moduleId: string): number | undefined => {
    if (moduleId === 'notes-todo') return 1;
    if (moduleId === 'stocks-dashboard') return 3;
    if (moduleId === 'bulletin-dashboard') return 12;
    return undefined;
  };

  const handleFolderClick = (category: 'finance' | 'notes' | 'inventory' | 'social') => {
    triggerHaptic('light');
    setActiveFolder(activeFolder === category ? null : category);
  };

  return (
    <>
      {/* ----------------- SYSTEM-WIDE FLOATING GLASS DOCK BAR (Option C - Hybrid) ----------------- */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden pointer-events-auto select-none flex flex-col items-center gap-2.5 w-[96%] max-w-[480px]">

        {/* Dynamic Indicator Customizer Display Style wrapper */}
        <nav
          className={clsx(
            "w-full bg-white/[0.04] dark:bg-black/[0.45] border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.65)] flex flex-col gap-2 relative overflow-visible transition-all duration-300",
            dockSizeClass,
            glassBlurStyle
          )}
        >
          {/* iOS Liquid light refraction shimmer */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-color-dodge transition-opacity duration-500 rounded-inherit"
            style={{
              background: `radial-gradient(circle 120px at ${mousePos.x - (width / 2) + 180}px 30px, rgba(255,255,255,0.4) 0%, transparent 100%)`
            }}
          />

          {/* Glowing top active border colored according to active module */}
          <div
            className="absolute top-0 left-6 right-6 h-[1.5px] opacity-80 transition-all duration-500"
            style={{
              background: `linear-gradient(to right, transparent, ${activeBrandColor}, transparent)`
            }}
          />

          {/* DOCK COLUMN ROW 1: Smart Folder shortcuts for 100% full-route accessibility */}
          <div className="flex items-center justify-around pb-1 border-b border-white/5 gap-1 shrink-0">
            {/* Folder 1: Finans */}
            <button
              onClick={() => handleFolderClick('finance')}
              className={clsx(
                "flex flex-col items-center justify-center p-1 rounded-xl transition-all relative w-16 active:scale-95",
                activeFolder === 'finance' ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="text-lg">💼</div>
              <span className="text-[8px] font-black tracking-tight text-white/90">Finans</span>
              {activeFolder === 'finance' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
              )}
            </button>

            {/* Folder 2: Notlarım */}
            <button
              onClick={() => handleFolderClick('notes')}
              className={clsx(
                "flex flex-col items-center justify-center p-1 rounded-xl transition-all relative w-16 active:scale-95",
                activeFolder === 'notes' ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="text-lg">📝</div>
              <span className="text-[8px] font-black tracking-tight text-white/90">Notlarım</span>
              {activeFolder === 'notes' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              )}
            </button>

            {/* Folder 3: Envanter & Stok */}
            <button
              onClick={() => handleFolderClick('inventory')}
              className={clsx(
                "flex flex-col items-center justify-center p-1 rounded-xl transition-all relative w-16 active:scale-95",
                activeFolder === 'inventory' ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="text-lg">⚙️</div>
              <span className="text-[8px] font-black tracking-tight text-white/90">Sistem</span>
              {activeFolder === 'inventory' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              )}
            </button>

            {/* Folder 4: Bülten & Sosyal */}
            <button
              onClick={() => handleFolderClick('social')}
              className={clsx(
                "flex flex-col items-center justify-center p-1 rounded-xl transition-all relative w-16 active:scale-95",
                activeFolder === 'social' ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="text-lg">📰</div>
              <span className="text-[8px] font-black tracking-tight text-white/90">Bülten</span>
              {activeFolder === 'social' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
              )}
            </button>
          </div>

          {/* DOCK COLUMN ROW 2: Custom Horizontal Scrollable Strip for Favorites & Recents */}
          <div className="flex items-center gap-3 w-full relative">

            {/* Drag & Drop Reorderable / Swipeable Horizontal Strip */}
            <div className="flex-1 flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth px-1.5 py-1 min-w-0">
              {dockState.dockSlots.map((modId, slotIdx) => {
                const app = appMap.get(modId) || {
                  id: modId,
                  title: 'Modül',
                  icon: <Home size={18} />,
                  color: 'from-blue-500 to-indigo-600',
                  category: 'finance' as const
                };
                const isActive = activeModule === modId;

                return (
                  <div key={`fav-slot-${slotIdx}-${modId}`} className="shrink-0 relative">
                    <DockItem
                      id={modId}
                      title={app.title}
                      icon={app.icon}
                      color={app.color}
                      isActive={isActive}
                      isTabletOrDesktop={isTablet || isDesktop}
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveModule(modId);
                      }}
                      onLongPress={() => {
                        triggerHaptic('medium');
                        setLongPressSlotIdx(slotIdx);
                        setLongPressModuleId(modId);
                      }}
                      widgetValue={getWidgetValue(modId)}
                      badgeCount={getBadgeCount(modId)}
                    />

                    {/* Customizable Indicator Styling support */}
                    {isActive && (
                      <AnimatePresence>
                        {dockState.indicatorStyle === 'dot' && (
                          <motion.div
                            layoutId="active-indicator-dot"
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-lg"
                            style={{ backgroundColor: activeBrandColor, boxShadow: `0 0 10px ${activeBrandColor}` }}
                          />
                        )}
                        {dockState.indicatorStyle === 'pill' && (
                          <motion.div
                            layoutId="active-indicator-pill"
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full shadow-lg"
                            style={{ backgroundColor: activeBrandColor, boxShadow: `0 0 10px ${activeBrandColor}` }}
                          />
                        )}
                        {dockState.indicatorStyle === 'aura' && (
                          <motion.div
                            layoutId="active-indicator-aura"
                            className="absolute inset-0 rounded-[20px] pointer-events-none opacity-20 blur-sm animate-pulse"
                            style={{ backgroundColor: activeBrandColor }}
                          />
                        )}
                        {dockState.indicatorStyle === 'line' && (
                          <motion.div
                            layoutId="active-indicator-line"
                            className="absolute -bottom-1 left-0 right-0 h-[2px]"
                            style={{ backgroundColor: activeBrandColor }}
                          />
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vertical separator line */}
            <div className="w-[1.5px] h-9 bg-white/10 shrink-0 self-center" />

            {/* AI Assistant APEX DOCK Trigger & Customizer Settings triggers */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Dynamic APEX DOCK Button */}
              <DockCenterButton
                onToggleAssistant={() => {
                  triggerHaptic('success');
                  setIsAssistantOpen(true);
                }}
                isOpen={isAssistantOpen}
              />

              {/* Advanced Dock Customizer Settings Button */}
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setIsCustomizerOpen(true);
                }}
                className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 transition-all active:scale-90"
                title="Dock Ayarları"
              >
                <Sliders size={16} className="text-focus-neon animate-pulse" style={{ animationDuration: '3s' }} />
              </button>
            </div>

          </div>
        </nav>
      </div>

      {/* ----------------- INTERACTIVE ACTIVE FOLDER POPUP DIALOGS ----------------- */}
      <AnimatePresence>
        {activeFolder !== null && (
          <div className="fixed inset-0 z-[120] lg:hidden flex items-end justify-center pb-28 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFolder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-[420px] bg-neutral-900/98 border border-white/15 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  <FolderOpen size={14} className="text-focus-neon" />
                  {activeFolder === 'finance' ? 'Finans Klasörü' :
                   activeFolder === 'notes' ? 'Notlarım Klasörü' :
                   activeFolder === 'inventory' ? 'Sistem & Stok Klasörü' : 'Bülten Klasörü'}
                </span>
                <button
                  onClick={() => setActiveFolder(null)}
                  className="p-1 rounded-lg bg-white/5 text-text-secondary hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Grid representation of all apps inside the active folder folder */}
              <div className="grid grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto no-scrollbar py-1">
                {allApps
                  .filter(app => app.category === activeFolder)
                  .map(app => {
                    const isCurrent = activeModule === app.id;
                    return (
                      <button
                        key={`folder-app-${app.id}`}
                        onClick={() => {
                          triggerHaptic('success');
                          setActiveModule(app.id);
                          setActiveFolder(null);
                        }}
                        className={clsx(
                          "flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center group relative active:scale-95",
                          isCurrent
                            ? "bg-focus-neon/25 border-focus-neon text-white"
                            : "bg-white/5 border-white/5 text-text-secondary hover:text-white"
                        )}
                      >
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${app.color} text-white shrink-0 mb-1.5 shadow-md`}>
                          {app.icon}
                        </div>
                        <span className="text-[10px] font-bold leading-tight line-clamp-1">{app.title}</span>
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- INTERACTIVE ADVANCED DOCK SETTINGS SHEET ----------------- */}
      <AnimatePresence>
        {isCustomizerOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomizerOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-h-[90vh] bg-neutral-950 border-t border-focus-neon/30 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden pb-8"
            >
              {/* Sheet header */}
              <div className="p-5 pb-3 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-focus-neon/15 border border-focus-neon/30 text-focus-neon">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-black text-white tracking-tight">
                      Mobil Dock Özelleştirme
                    </h3>
                    <p className="text-[11px] text-text-secondary font-medium">
                      Görsel efektleri, haptik titreşimleri ve aktif göstergeleri dilediğiniz gibi tasarlayın
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCustomizerOpen(false)}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Settings content matrix */}
              <div className="p-5 flex-1 overflow-y-auto space-y-5 custom-scrollbar text-text-primary">

                {/* Setting 1: Indicator style */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-text-secondary uppercase tracking-wider block">
                    1. Aktif Sayfa Göstergesi (Indicator Style)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['dot', 'pill', 'aura', 'line'] as IndicatorStyle[]).map(style => (
                      <button
                        key={`opt-style-${style}`}
                        onClick={() => {
                          triggerHaptic('success');
                          dockState.updateCustomization('indicatorStyle', style);
                        }}
                        className={clsx(
                          "py-2.5 rounded-xl border text-[11px] font-black capitalize transition-all",
                          dockState.indicatorStyle === style
                            ? "bg-focus-neon/20 border-focus-neon text-white"
                            : "bg-white/5 border-white/5 text-text-secondary"
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Setting 2: Dock Sizes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-text-secondary uppercase tracking-wider block">
                    2. Dock Boyutu (Dock Size)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['sm', 'md', 'lg'] as DockSize[]).map(size => (
                      <button
                        key={`opt-size-${size}`}
                        onClick={() => {
                          triggerHaptic('success');
                          dockState.updateCustomization('dockSize', size);
                        }}
                        className={clsx(
                          "py-2.5 rounded-xl border text-[11px] font-black uppercase transition-all",
                          dockState.dockSize === size
                            ? "bg-focus-neon/20 border-focus-neon text-white"
                            : "bg-white/5 border-white/5 text-text-secondary"
                        )}
                      >
                        {size === 'sm' ? 'Küçük' : size === 'md' ? 'Orta' : 'Büyük'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Setting 3: Glass Blur Intensities */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-text-secondary uppercase tracking-wider block">
                    3. Cam Bulanıklığı (Glass Blur Intensity)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as GlassBlur[]).map(blur => (
                      <button
                        key={`opt-blur-${blur}`}
                        onClick={() => {
                          triggerHaptic('success');
                          dockState.updateCustomization('glassBlur', blur);
                        }}
                        className={clsx(
                          "py-2.5 rounded-xl border text-[11px] font-black capitalize transition-all",
                          dockState.glassBlur === blur
                            ? "bg-focus-neon/20 border-focus-neon text-white"
                            : "bg-white/5 border-white/5 text-text-secondary"
                        )}
                      >
                        {blur === 'low' ? 'Hafif' : blur === 'medium' ? 'Orta' : 'Yoğun'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Setting 4: Haptic Vibration Level */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-text-secondary uppercase tracking-wider block">
                    4. Mobil Haptik Titreşim Şiddeti
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['none', 'light', 'medium', 'heavy'] as HapticStrength[]).map(strength => (
                      <button
                        key={`opt-haptic-${strength}`}
                        onClick={() => {
                          triggerHaptic('success');
                          dockState.updateCustomization('hapticStrength', strength);
                        }}
                        className={clsx(
                          "py-2.5 rounded-xl border text-[10px] font-black capitalize transition-all",
                          dockState.hapticStrength === strength
                            ? "bg-focus-neon/20 border-focus-neon text-white"
                            : "bg-white/5 border-white/5 text-text-secondary"
                        )}
                      >
                        {strength === 'none' ? 'Yok' : strength === 'light' ? 'Hafif' : strength === 'medium' ? 'Orta' : 'Güçlü'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Setting 5: Dynamic Active brand coloring */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Dinamik Renk Değişimi</div>
                    <div className="text-[10px] text-text-secondary">Dock çizgisi ve parlamaları aktif modüle göre uyum sağlar</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dockState.dynamicColor}
                    onChange={(e) => {
                      triggerHaptic('medium');
                      dockState.updateCustomization('dynamicColor', e.target.checked);
                    }}
                    className="size-5 accent-focus-neon"
                  />
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- SLOT PICKER CUSTOMIZER MODAL ----------------- */}
      <AnimatePresence>
        {editingSlotIdx !== null && (
          <div className="fixed inset-0 z-[200] lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSlotIdx(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-h-[85vh] bg-neutral-950 border-t border-focus-neon/30 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden pb-6"
            >
              {/* Header */}
              <div className="p-5 pb-3 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-focus-neon/15 border border-focus-neon/30 text-focus-neon">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-black text-white tracking-tight">
                      Dock Slot #{editingSlotIdx + 1} Özelleştir
                    </h3>
                    <p className="text-[11px] text-text-secondary font-medium">
                      Dock barınızdaki bu yuvaya atamak istediğiniz sık kullanılanı seçin
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingSlotIdx(null)}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Slot Options List */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Kullanılabilir Modül & Notlar
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      dockState.resetSlots();
                      setEditingSlotIdx(null);
                    }}
                    className="flex items-center gap-1.5 text-xs text-focus-neon font-bold hover:underline"
                  >
                    <RotateCcw size={12} />
                    <span>Varsayılanlara Sıfırla</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {allApps.map(app => {
                    const isAssigned = dockState.dockSlots[editingSlotIdx] === app.id;

                    return (
                      <button
                        key={`slot-picker-${app.id}`}
                        onClick={() => {
                          triggerHaptic('success');
                          dockState.updateSlot(editingSlotIdx, app.id);
                          setEditingSlotIdx(null);
                        }}
                        className={clsx(
                          "flex items-center justify-between p-3 rounded-2xl border transition-all text-left active:scale-98",
                          isAssigned
                            ? "bg-focus-neon/20 border-focus-neon text-white shadow-lg shadow-focus-neon/10"
                            : "bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${app.color} text-white shrink-0`}>
                            {app.icon}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{app.title}</div>
                            <div className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">{app.category}</div>
                          </div>
                        </div>

                        {isAssigned && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-focus-neon text-black text-xs font-black">
                            <Pin size={12} />
                            <span>Atandı</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- LONG PRESS QUICK ACTIONS MENU ----------------- */}
      <AnimatePresence>
        {longPressModuleId && longPressSlotIdx !== null && (
          <QuickActionsMenu
            moduleId={longPressModuleId}
            slotIndex={longPressSlotIdx}
            onClose={() => {
              setLongPressModuleId(null);
              setLongPressSlotIdx(null);
            }}
            onOpenApp={(id) => {
              setActiveModule(id);
              setLongPressModuleId(null);
              setLongPressSlotIdx(null);
            }}
            onCustomizeSlot={(idx) => {
              setEditingSlotIdx(idx);
              setLongPressModuleId(null);
              setLongPressSlotIdx(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ----------------- SMART AI ASSISTANT DRAWER ----------------- */}
      <AnimatePresence>
        {isAssistantOpen && (
          <AIAssistantDrawer
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            siriSuggestion={dockState.getSiriSuggestion()}
            onNavigate={(id) => {
              setActiveModule(id);
              setIsAssistantOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ----------------- DOCK SEARCH / COMMAND PALETTE (Ctrl+Space) ----------------- */}
      <AnimatePresence>
        {isPaletteOpen && (
          <AICommandPalette
            isOpen={isPaletteOpen}
            onClose={() => setIsPaletteOpen(false)}
            apps={allApps}
            onSelectApp={(id) => {
              setActiveModule(id);
              setIsPaletteOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ----------------- MAIN LAUNCHER DRAWER ----------------- */}
      <AnimatePresence>
        {isLauncherOpen && (
          <LauncherDrawer
            isOpen={isLauncherOpen}
            onClose={() => setIsLauncherOpen(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filteredApps={filteredApps}
            recentModules={dockState.recentModules}
            dockSlots={dockState.dockSlots}
            activeModule={activeModule}
            activeProfile={dockState.profile}
            onSelectModule={(id) => {
              setActiveModule(id);
              setIsLauncherOpen(false);
            }}
            onCustomizeSlot={(idx) => {
              setEditingSlotIdx(idx);
              setIsLauncherOpen(false);
            }}
            onProfileChange={(prof) => dockState.setProfile(prof)}
            allApps={allApps}
            language={language}
            toggleLanguage={toggleLanguage}
            isDark={isDark}
            toggleTheme={() => updateSetting('theme.mode', isDark ? 'light' : 'dark')}
            fps={settings['performance.fps']?.value || 120}
            toggleFps={() => {
              const currentFps = settings['performance.fps']?.value || 120;
              const nextFps = currentFps === 120 ? 90 : currentFps === 90 ? 60 : 120;
              updateSetting('performance.fps', nextFps);
            }}
            toggleSidebar={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  );
};
export default Dock;
