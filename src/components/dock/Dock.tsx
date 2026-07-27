import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Home,
  Wallet,
  NotebookPen,
  Grid,
  Zap,
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
  Sliders,
  RotateCcw,
  X,
  Pin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { useDevice } from '../../hooks/useDevice';
import { useDockStore, DockProfile } from './DockStore';
import { DockItem, triggerHaptic } from './DockItem';
import { DockFolder } from './DockFolder';
import { QuickActionsMenu } from './QuickActionsMenu';
import { DockCenterButton, AICommandPalette } from './DockCenterButton';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { LauncherDrawer } from './LauncherDrawer';
import clsx from 'clsx';

// Interface matching the AppShortcut layout
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

const DEFAULT_SLOTS = [
  'finance-dashboard', // Slot 0: Ana Sayfa / Finans Özeti
  'finance-incomes',   // Slot 1: Gelirler
  'notes-dashboard',   // Slot 2: Notlar
  'notes-todo'         // Slot 3: Yapılacaklar & Sayaç
];

export const Dock: React.FC<DockProps> = ({
  activeModule,
  setActiveModule,
  toggleSidebar
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { settings, updateSetting } = useSettings();
  const { width, screenTier, isTablet, isDesktop } = useDevice();

  // Integration with DockStore
  const dockState = useDockStore();

  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingSlotIdx, setEditingSlotIdx] = useState<number | null>(null);
  const [longPressModuleId, setLongPressModuleId] = useState<string | null>(null);
  const [longPressSlotIdx, setLongPressSlotIdx] = useState<number | null>(null);

  // Auto hide gesture state
  const [isDockHidden, setIsDockHidden] = useState(false);

  // Specular Mouse Lighting Coordinate (Liquid Glass effect)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Touch gesture state for swiping
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track module usage
  useEffect(() => {
    dockState.logUsage(activeModule);
  }, [activeModule]);

  // Catalog of all apps
  const allApps: AppShortcut[] = useMemo(() => [
    // Finans
    { id: 'finance-dashboard', title: t('nav.dashboard', 'Finans Özeti'), category: 'finance', icon: <Wallet size={18} />, color: 'from-blue-500 to-indigo-600' },
    { id: 'finance-incomes', title: t('finance.incomes', 'Gelirler'), category: 'finance', icon: <TrendingUp size={18} />, color: 'from-emerald-500 to-teal-600' },
    { id: 'finance-expenses', title: t('finance.expenses', 'Giderler'), category: 'finance', icon: <TrendingDown size={18} />, color: 'from-rose-500 to-red-600' },
    { id: 'finance-subscriptions', title: t('finance.subscriptions', 'Abonelikler'), category: 'finance', icon: <CreditCard size={18} />, color: 'from-purple-500 to-violet-600' },
    { id: 'finance-investments', title: t('finance.investments', 'Yatırımlar'), category: 'finance', icon: <PiggyBank size={18} />, color: 'from-amber-500 to-yellow-600' },
    { id: 'finance-analytics', title: t('finance.analytics', 'Finansal Analiz'), category: 'finance', icon: <BarChart3 size={18} />, color: 'from-cyan-500 to-blue-600' },
    { id: 'finance-reports', title: t('finance.reports', 'Mali Raporlar'), category: 'finance', icon: <FileBarChart size={18} />, color: 'from-blue-600 to-indigo-800' },

    // Tedarik & Stok
    { id: 'purchasing-dashboard', title: t('nav.purchasing', 'Satınalma'), category: 'inventory', icon: <ShoppingBag size={18} />, color: 'from-amber-500 to-orange-600' },
    { id: 'fason-dashboard', title: t('nav.fason', 'Fason Takibi'), category: 'inventory', icon: <Package size={18} />, color: 'from-teal-500 to-emerald-600' },
    { id: 'stocks-dashboard', title: t('nav.stocks', 'Stok Yönetimi'), category: 'inventory', icon: <Package size={18} />, color: 'from-blue-500 to-cyan-600' },
    { id: 'contacts-list', title: t('nav.contacts', 'Cari Takibi'), category: 'inventory', icon: <Users size={18} />, color: 'from-violet-500 to-purple-700' },
    { id: 'recon-dashboard', title: t('nav.recon', 'BA-BS Mutabakat'), category: 'inventory', icon: <Scale size={18} />, color: 'from-indigo-500 to-blue-700' },

    // Notlar & Araçlar
    { id: 'notes-dashboard', title: t('nav.notes', 'Notlar Özeti'), category: 'notes', icon: <NotebookPen size={18} />, color: 'from-orange-500 to-amber-600' },
    { id: 'notes-todo', title: t('notes.todo', 'Yapılacaklar & Sayaç'), category: 'notes', icon: <CheckSquare size={18} />, color: 'from-emerald-500 to-green-600' },
    { id: 'notes-quick', title: t('notes.quickMemos', 'Hızlı Notlar'), category: 'notes', icon: <Sparkles size={18} />, color: 'from-amber-400 to-orange-500' },
    { id: 'notes-passwords', title: t('notes.passwords', 'Parola Kasası'), category: 'notes', icon: <Key size={18} />, color: 'from-rose-500 to-pink-600' },
    { id: 'notes-bookmarks', title: t('notes.bookmarks', 'Yer İmleri'), category: 'notes', icon: <Bookmark size={18} />, color: 'from-blue-400 to-indigo-500' },
    { id: 'notes-books', title: t('notes.books', 'Okuma Listesi'), category: 'notes', icon: <BookOpen size={18} />, color: 'from-teal-400 to-cyan-600' },

    // Sosyal & Bülten
    { id: 'bulletin-dashboard', title: t('nav.bulletin', 'Bülten & Haberler'), category: 'social', icon: <Rss size={18} />, color: 'from-rose-500 to-orange-500' },
  ], [t]);

  const appMap = useMemo(() => {
    const map = new Map<string, AppShortcut>();
    allApps.forEach(app => map.set(app.id, app));
    return map;
  }, [allApps]);

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

  const isDark = settings['theme.mode']?.value === 'dark' || (settings['theme.mode']?.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isXs = screenTier === 'xs' || width < 380;
  const isSm = screenTier === 'sm' || (width >= 380 && width < 640);

  // Proportional sizing maps
  const dockWidthClass = isXs
    ? "w-[94%] max-w-[310px] p-2 rounded-[24px]"
    : isSm
    ? "w-[92%] max-w-[370px] p-2.5 rounded-[28px]"
    : isTablet
    ? "w-[85%] max-w-[500px] p-3 rounded-[32px]"
    : "w-[90%] max-w-[440px] p-3 rounded-[30px]";

  // Handle Swipe Gestures (Up: AI Panel, Down: Hide, Left/Right: Navigate)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStart.x;
    const diffY = e.changedTouches[0].clientY - touchStart.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 60) {
        triggerHaptic('light');
        if (diffX > 0) {
          // Swipe Right: Open Launcher Drawer
          setIsLauncherOpen(true);
        } else {
          // Swipe Left: Siri Assistant
          setIsAssistantOpen(true);
        }
      }
    } else {
      if (Math.abs(diffY) > 60) {
        triggerHaptic('light');
        if (diffY < 0) {
          // Swipe Up: AI Command Palette
          setIsPaletteOpen(true);
        } else {
          // Swipe Down: Hide Dock bar
          setIsDockHidden(true);
          setTimeout(() => setIsDockHidden(false), 5000); // Auto reappear after 5s
        }
      }
    }
  };

  // Mock Widget Live Data logic
  const getWidgetValue = (moduleId: string): string | undefined => {
    if (moduleId === 'finance-incomes') return '₺540K';
    if (moduleId === 'notes-todo') return '3 Görev';
    if (moduleId === 'bulletin-dashboard') return '12 Yeni';
    return undefined;
  };

  // Mock Live Badge count logic
  const getBadgeCount = (moduleId: string): number | undefined => {
    if (moduleId === 'notes-todo') return 1;
    if (moduleId === 'stocks-dashboard') return 3;
    if (moduleId === 'bulletin-dashboard') return 12;
    return undefined;
  };

  // Dynamic Glow mapping based on critical statuses
  const getGlowColor = (moduleId: string): 'red' | 'green' | 'blue' | 'purple' | 'gold' | 'default' => {
    if (moduleId === 'stocks-dashboard') return 'red'; // Critical stocks
    if (moduleId === 'finance-incomes') return 'green'; // Fresh revenue incoming
    if (moduleId === 'bulletin-dashboard') return 'blue'; // Notification incoming
    return 'default';
  };

  const handleSlotClick = useCallback((slotIdx: number, moduleId: string) => {
    setActiveModule(moduleId);
  }, [setActiveModule]);

  const handleSlotLongPress = useCallback((slotIdx: number, moduleId: string) => {
    setLongPressSlotIdx(slotIdx);
    setLongPressModuleId(moduleId);
  }, []);

  // Dynamically determine current active category sub-pages for Sub-Dock Tabs
  const currentCategory = useMemo(() => {
    if (activeModule.startsWith('finance-')) return 'finance';
    if (activeModule.startsWith('notes-')) return 'notes';
    if (activeModule.startsWith('library-')) return 'library';
    if (activeModule.startsWith('bulletin-')) return 'bulletin';
    return null;
  }, [activeModule]);

  const activeSubPages = useMemo(() => {
    const subPages: Record<string, { id: string; label: string }[]> = {
      finance: [
        { id: 'finance-dashboard', label: 'Özet' },
        { id: 'finance-incomes', label: 'Gelirler' },
        { id: 'finance-expenses', label: 'Giderler' },
        { id: 'finance-subscriptions', label: 'Abonelik' },
        { id: 'finance-investments', label: 'Yatırım' },
        { id: 'finance-analytics', label: 'Analiz' },
        { id: 'finance-reports', label: 'Rapor' }
      ],
      notes: [
        { id: 'notes-dashboard', label: 'Özet' },
        { id: 'notes-todo', label: 'Yapılacaklar' },
        { id: 'notes-quick', label: 'Hızlı Not' },
        { id: 'notes-notebook', label: 'Defterler' },
        { id: 'notes-bookmarks', label: 'Yer İmleri' },
        { id: 'notes-passwords', label: 'Parolalar' }
      ],
      library: [
        { id: 'library-ebooks', label: 'E-Kitaplar' },
        { id: 'library-mangas', label: 'Mangalar' },
        { id: 'library-docs', label: 'Dökümanlar' }
      ],
      bulletin: [
        { id: 'bulletin-dashboard', label: 'Özet' },
        { id: 'bulletin-news', label: 'Haberler' },
        { id: 'bulletin-digest', label: 'AI Akış' },
        { id: 'bulletin-saved', label: 'Kaydedilenler' }
      ]
    };
    return currentCategory ? subPages[currentCategory] : [];
  }, [currentCategory]);

  return (
    <>
      {/* ----------------- MASTER FLOATING LIQUID GLASS DOCK BAR ----------------- */}
      <AnimatePresence>
        {!isDockHidden && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden pointer-events-auto select-none flex flex-col items-center gap-2 w-[94%] max-w-[500px]"
          >
            {/* OPTION B: Sub-Dock Thin Scrollable Tab bar above main Dock */}
            {activeSubPages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5 px-3 bg-white/[0.04] dark:bg-black/[0.4] border border-white/10 rounded-2xl shadow-lg backdrop-blur-2xl"
              >
                {activeSubPages.map(sub => {
                  const isSubActive = activeModule === sub.id;
                  return (
                    <button
                      key={`sub-tab-${sub.id}`}
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveModule(sub.id);
                      }}
                      className={clsx(
                        "px-3 py-1 rounded-xl text-[10px] md:text-xs font-bold whitespace-nowrap transition-all duration-300 shrink-0",
                        isSubActive
                          ? "bg-focus-neon/15 text-focus-neon border border-focus-neon/30 shadow-md"
                          : "text-text-secondary hover:text-white bg-transparent border border-transparent"
                      )}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </motion.div>
            )}

            <nav
              className={clsx(
                "bg-white/[0.03] dark:bg-black/[0.3] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between relative overflow-hidden transition-all duration-300",
                dockWidthClass
              )}
              style={{
                backdropFilter: 'blur(35px) saturate(210%)',
                WebkitBackdropFilter: 'blur(35px) saturate(210%)'
              }}
            >
              {/* Premium iOS 26 Liquid Glass Refraction/Specular Light Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25 mix-blend-color-dodge transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle 90px at ${mousePos.x - (width / 2) + 200}px 30px, rgba(255,255,255,0.4) 0%, transparent 100%)`
                }}
              />

              {/* Noise texture overlay for high fidelity glass representation */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-noise-pattern mix-blend-overlay" />

              {/* Glowing top line typical of iOS/Android premium templates */}
              <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-focus-neon/50 to-transparent" />

              {/* Slot 0 & 1 */}
              {[0, 1].map(slotIdx => {
                const modId = dockState.dockSlots[slotIdx] || DEFAULT_SLOTS[slotIdx];
                const app = appMap.get(modId) || {
                  id: modId,
                  title: 'Modül',
                  icon: <Home size={18} />,
                  color: 'from-blue-500 to-indigo-600',
                  category: 'finance' as const
                };
                const isActive = activeModule === modId;

                return (
                  <DockItem
                    key={`d-slot-${slotIdx}`}
                    id={modId}
                    title={app.title}
                    icon={app.icon}
                    color={app.color}
                    isActive={isActive}
                    isTabletOrDesktop={isTablet || isDesktop}
                    onClick={() => handleSlotClick(slotIdx, modId)}
                    onLongPress={() => handleSlotLongPress(slotIdx, modId)}
                    widgetValue={getWidgetValue(modId)}
                    badgeCount={getBadgeCount(modId)}
                    glowColor={getGlowColor(modId)}
                  />
                );
              })}

              {/* CENTER DYNAMIC SMART LAUNCHER BUTTON */}
              <DockCenterButton
                onToggleAssistant={() => setIsAssistantOpen(true)}
                isOpen={isAssistantOpen}
              />

              {/* Slot 2 & 3 */}
              {[2, 3].map(slotIdx => {
                const modId = dockState.dockSlots[slotIdx] || DEFAULT_SLOTS[slotIdx];
                const app = appMap.get(modId) || {
                  id: modId,
                  title: 'Modül',
                  icon: <NotebookPen size={18} />,
                  color: 'from-orange-500 to-amber-600',
                  category: 'notes' as const
                };
                const isActive = activeModule === modId;

                return (
                  <DockItem
                    key={`d-slot-${slotIdx}`}
                    id={modId}
                    title={app.title}
                    icon={app.icon}
                    color={app.color}
                    isActive={isActive}
                    isTabletOrDesktop={isTablet || isDesktop}
                    onClick={() => handleSlotClick(slotIdx, modId)}
                    onLongPress={() => handleSlotLongPress(slotIdx, modId)}
                    widgetValue={getWidgetValue(modId)}
                    badgeCount={getBadgeCount(modId)}
                    glowColor={getGlowColor(modId)}
                  />
                );
              })}

            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- SLOT CUSTOMIZER MODAL ----------------- */}
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
                    const isAssignedOther = dockState.dockSlots.includes(app.id) && !isAssigned;

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

      {/* ----------------- MAIN LAUNCHER DRAWER (Swipe/Center Triggered) ----------------- */}
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
