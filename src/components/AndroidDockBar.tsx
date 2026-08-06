import React, { useState, useMemo, useRef, useCallback } from 'react';
import { 
  Home, 
  Wallet, 
  NotebookPen, 
  Grid, 
  Search, 
  Zap, 
  X, 
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
  Settings,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  Star,
  Pin,
  Sliders,
  RotateCcw,
  Gauge,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useWallpaper } from '../context/WallpaperContext';
import { useDevice } from '../hooks/useDevice';
import clsx from 'clsx';

interface AndroidDockBarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  toggleSidebar: () => void;
}

export interface AppShortcut {
  id: string;
  title: string;
  category: 'finance' | 'inventory' | 'notes' | 'social';
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

const DEFAULT_SLOTS = [
  'finance-dashboard', // Slot 0: Ana Sayfa / Finans Özeti
  'finance-incomes',   // Slot 1: Gelirler
  'notes-dashboard',   // Slot 2: Notlar
  'notes-todo'         // Slot 3: Yapılacaklar & Sayaç
];

export const AndroidDockBar: React.FC<AndroidDockBarProps> = ({
  activeModule,
  setActiveModule,
  toggleSidebar
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { settings, updateSetting } = useSettings();
  const { width, screenTier } = useDevice();
  const { openWizard } = useWallpaper();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Custom Favorite Slots in Dock (4 slots surrounding center launcher)
  const [dockSlots, setDockSlots] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_dock_slots');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) return parsed;
      }
    } catch {}
    return DEFAULT_SLOTS;
  });

  // Slot Customizer Sheet state
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);

  // Recent modules history
  const [recentModules, setRecentModules] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_recent_modules');
      return saved ? JSON.parse(saved) : ['finance-dashboard', 'notes-dashboard', 'stocks-dashboard', 'contacts-list'];
    } catch {
      return ['finance-dashboard', 'notes-dashboard', 'stocks-dashboard', 'contacts-list'];
    }
  });

  // Save dock slots to localStorage
  const updateSlotModule = useCallback((slotIndex: number, moduleId: string) => {
    setDockSlots(prev => {
      const updated = [...prev];
      updated[slotIndex] = moduleId;
      try {
        localStorage.setItem('apex_dock_slots', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setEditingSlotIndex(null);
  }, []);

  const resetSlotsToDefault = useCallback(() => {
    setDockSlots(DEFAULT_SLOTS);
    try {
      localStorage.setItem('apex_dock_slots', JSON.stringify(DEFAULT_SLOTS));
    } catch {}
    setEditingSlotIndex(null);
  }, []);

  const handleSelectModule = useCallback((id: string) => {
    setActiveModule(id);
    setIsDrawerOpen(false);

    // Update recent modules
    setRecentModules(prev => {
      const filtered = prev.filter(m => m !== id);
      const updated = [id, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('apex_recent_modules', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [setActiveModule]);

  // Catalog of all accessible modules
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

  // Proportional Sizing calculations based on screen width tier
  const isXs = screenTier === 'xs' || width < 380;
  const isSm = screenTier === 'sm' || (width >= 380 && width < 640);

  const dockContainerClass = isXs 
    ? "w-[96%] max-w-[320px] p-1 rounded-2xl" 
    : isSm 
    ? "w-[94%] max-w-[370px] p-1.5 rounded-3xl" 
    : "w-[90%] max-w-[430px] p-2 rounded-3xl";

  const dockItemClass = isXs
    ? "px-1 py-1 min-w-[42px] max-w-[60px]"
    : isSm
    ? "px-1.5 py-1 min-w-[50px] max-w-[72px]"
    : "px-2 py-1.5 min-w-[58px] max-w-[82px]";

  const iconSize = isXs ? 16 : isSm ? 18 : 20;
  const textSizeClass = isXs ? "text-[8px]" : isSm ? "text-[8.5px]" : "text-[9.5px]";
  const launcherSizeClass = isXs ? "w-11 h-11 -top-3" : isSm ? "w-13 h-13 -top-4" : "w-14 h-14 -top-5";
  const launcherIconSize = isXs ? 20 : isSm ? 22 : 24;

  // Custom Long Press Handler hook for Dock Slots
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const startLongPress = useCallback((slotIdx: number) => {
    isLongPressRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(50); } catch {}
      }
      setEditingSlotIndex(slotIdx);
    }, 450);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSlotClick = useCallback((slotIdx: number, moduleId: string) => {
    cancelLongPress();
    if (!isLongPressRef.current) {
      handleSelectModule(moduleId);
    }
    isLongPressRef.current = false;
  }, [cancelLongPress, handleSelectModule]);

  return (
    <>
      {/* ----------------- DYNAMIC PROPORTIONAL ANDROID DOCK BAR ----------------- */}
      <div className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-50 lg:hidden pointer-events-auto transition-all duration-300 dock-safe-bottom">
        <nav className={clsx(
          "glass-dock flex items-center justify-between relative overflow-visible select-none touch-optimized",
          dockContainerClass
        )}>
          
          {/* Neon Dock Ambient Line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-focus-neon/70 to-transparent" />

          {/* Left Slots: Slot 0 & Slot 1 */}
          {[0, 1].map(slotIdx => {
            const modId = dockSlots[slotIdx] || DEFAULT_SLOTS[slotIdx];
            const app = appMap.get(modId) || {
              id: modId,
              title: modId === 'finance-dashboard' ? 'Ana Sayfa' : 'Finans',
              icon: modId === 'finance-dashboard' ? <Home size={iconSize} /> : <Wallet size={iconSize} />,
              color: 'from-blue-500 to-indigo-600',
              category: 'finance'
            };
            const isActive = activeModule === modId || (modId.includes('-') && activeModule.startsWith(modId.split('-')[0]) && activeModule !== 'finance-dashboard');

            return (
              <button
                key={`dock-slot-${slotIdx}`}
                onClick={() => handleSlotClick(slotIdx, modId)}
                onMouseDown={() => startLongPress(slotIdx)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(slotIdx)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                className={clsx(
                  "flex flex-col items-center justify-center rounded-2xl transition-all duration-300 relative touch-manipulation active:scale-90 group",
                  dockItemClass,
                  isActive ? "text-focus-neon bg-focus-neon/15 font-bold" : "text-text-secondary hover:text-white"
                )}
                title={`${app.title} (Değiştirmek için basılı tutun)`}
              >
                {/* Slot Number Indicator on Hover / Hold */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 bg-neutral-900 border border-white/20 text-[8px] font-mono text-focus-neon px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none">
                  Slot #{slotIdx + 1}
                </div>

                <div className="shrink-0">
                  {React.cloneElement(app.icon as React.ReactElement<any>, { size: iconSize })}
                </div>

                <span className={clsx("font-bold tracking-tight truncate max-w-full mt-0.5", textSizeClass)}>
                  {app.title}
                </span>

                {isActive && (
                  <motion.div layoutId="dock-dot" className="absolute -bottom-0.5 w-1.5 h-1.5 bg-focus-neon rounded-full shadow-[0_0_8px_#70a1ff]" />
                )}
              </button>
            );
          })}

          {/* CENTER DYNAMIC SMART LAUNCHER BUTTON */}
          <div className="relative shrink-0 px-0.5">
            <button
              onClick={() => setIsDrawerOpen(prev => !prev)}
              className={clsx(
                "group relative rounded-2xl bg-gradient-to-tr from-focus-main via-focus-neon to-indigo-500 p-[2px] shadow-[0_10px_25px_rgba(112,161,255,0.5)] active:scale-90 transition-transform duration-300 flex items-center justify-center",
                launcherSizeClass
              )}
              title="APEX Dynamic Launcher Çekmecesi"
            >
              {/* Pulsing Aura */}
              <div className="absolute inset-0 rounded-2xl bg-focus-neon/40 animate-ping opacity-25 group-hover:opacity-50" />

              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-focus-neon group-hover:bg-transparent group-hover:text-black transition-colors duration-300">
                <Zap size={launcherIconSize} className="fill-current animate-pulse" />
              </div>
            </button>
          </div>

          {/* Right Slots: Slot 2 & Slot 3 */}
          {[2, 3].map(slotIdx => {
            const modId = dockSlots[slotIdx] || DEFAULT_SLOTS[slotIdx];
            const app = appMap.get(modId) || {
              id: modId,
              title: modId.includes('notes') ? 'Notlar' : 'Yapılacaklar',
              icon: modId.includes('notes') ? <NotebookPen size={iconSize} /> : <CheckSquare size={iconSize} />,
              color: 'from-orange-500 to-amber-600',
              category: 'notes'
            };
            const isActive = activeModule === modId || (modId.includes('-') && activeModule.startsWith(modId.split('-')[0]) && activeModule !== 'finance-dashboard');

            return (
              <button
                key={`dock-slot-${slotIdx}`}
                onClick={() => handleSlotClick(slotIdx, modId)}
                onMouseDown={() => startLongPress(slotIdx)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(slotIdx)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                className={clsx(
                  "flex flex-col items-center justify-center rounded-2xl transition-all duration-300 relative touch-manipulation active:scale-90 group",
                  dockItemClass,
                  isActive ? "text-focus-neon bg-focus-neon/15 font-bold" : "text-text-secondary hover:text-white"
                )}
                title={`${app.title} (Değiştirmek için basılı tutun)`}
              >
                {/* Slot Number Indicator on Hover / Hold */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 bg-neutral-900 border border-white/20 text-[8px] font-mono text-focus-neon px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none">
                  Slot #{slotIdx + 1}
                </div>

                <div className="shrink-0">
                  {React.cloneElement(app.icon as React.ReactElement<any>, { size: iconSize })}
                </div>

                <span className={clsx("font-bold tracking-tight truncate max-w-full mt-0.5", textSizeClass)}>
                  {app.title}
                </span>

                {isActive && (
                  <motion.div layoutId="dock-dot" className="absolute -bottom-0.5 w-1.5 h-1.5 bg-focus-neon rounded-full shadow-[0_0_8px_#70a1ff]" />
                )}
              </button>
            );
          })}

        </nav>
      </div>

      {/* ----------------- SLOT CUSTOMIZER MODAL (UZUN BASIŞ DEĞİŞTİRİCİ) ----------------- */}
      <AnimatePresence>
        {editingSlotIndex !== null && (
          <div className="fixed inset-0 z-[130] lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSlotIndex(null)}
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
                      Dock Slot #{editingSlotIndex + 1} Özelleştir
                    </h3>
                    <p className="text-[11px] text-text-secondary font-medium">
                      Dock barınızdaki bu yuvaya atamak istediğiniz sık kullanılanı seçin
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingSlotIndex(null)}
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
                    onClick={resetSlotsToDefault}
                    className="flex items-center gap-1.5 text-xs text-focus-neon font-bold hover:underline"
                  >
                    <RotateCcw size={12} />
                    <span>Varsayılanlara Sıfırla</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {allApps.map(app => {
                    const isAssigned = dockSlots[editingSlotIndex] === app.id;
                    const isAssignedOther = dockSlots.includes(app.id) && !isAssigned;

                    return (
                      <button
                        key={`slot-picker-${app.id}`}
                        onClick={() => updateSlotModule(editingSlotIndex, app.id)}
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

                        {isAssignedOther && (
                          <span className="text-[10px] font-bold text-text-secondary/60">
                            Diğer Slot'ta
                          </span>
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

      {/* ----------------- SMART ANDROID DRAWER / BOTTOM SHEET ----------------- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[120] lg:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Bottom Sheet Drawer Content */}
            <motion.div
              key="drawer-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-h-[88vh] bg-neutral-950/98 border-t border-white/15 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden pb-8"
            >
              {/* Handlebar for swiping */}
              <div className="w-full flex justify-center py-3" onClick={() => setIsDrawerOpen(false)}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              {/* Header & Quick Controls */}
              <div className="px-5 pb-3 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-focus-neon/15 border border-focus-neon/30 flex items-center justify-center text-focus-neon">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-black text-white tracking-tight">APEX Launcher</h3>
                    <p className="text-[11px] text-text-secondary font-medium">Hızlı Erişim & Menü Çekmecesi</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* FPS Selector Pill */}
                  <button
                    onClick={() => {
                      const currentFps = settings['performance.fps']?.value || 120;
                      const nextFps = currentFps === 120 ? 90 : currentFps === 90 ? 60 : 120;
                      updateSetting('performance.fps', nextFps);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-focus-neon/15 border border-focus-neon/30 text-focus-neon text-xs font-mono font-black flex items-center gap-1 hover:bg-focus-neon/25 active:scale-95"
                    title="Yenileme Hızı (FPS)"
                  >
                    <Gauge size={13} className="animate-pulse" />
                    <span>{settings['performance.fps']?.value || 120} FPS</span>
                  </button>

                  {/* Language Quick Toggle */}
                  <button
                    onClick={toggleLanguage}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-1 hover:bg-white/10"
                    title="Dil Değiştir"
                  >
                    <Globe size={13} className="text-focus-neon" />
                    <span className="uppercase">{language}</span>
                  </button>

                  {/* Theme Quick Toggle */}
                  <button
                    onClick={() => updateSetting('theme.mode', isDark ? 'light' : 'dark')}
                    className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    title="Tema Değiştir"
                  >
                    {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Search Bar & Category Pills */}
              <div className="p-4 pb-2 space-y-3">
                <div className="relative flex items-center">
                  <Search size={16} className="absolute left-3.5 text-text-secondary pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('common.search', 'Sayfa veya menü ara...')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-text-secondary outline-none focus:border-focus-neon/50 focus:bg-white/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 text-text-secondary hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'Tümü' },
                    { id: 'finance', label: t('nav.finance', 'Finans') },
                    { id: 'inventory', label: t('nav.purchasing', 'Tedarik & Stok') },
                    { id: 'notes', label: t('nav.notes', 'Notlar') },
                    { id: 'social', label: t('nav.bulletin', 'Bülten') },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={clsx(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95",
                        selectedCategory === cat.id
                          ? "bg-focus-neon text-black shadow-md shadow-focus-neon/20"
                          : "bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable App Grid */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 custom-scrollbar">
                
                {/* Favorites / Dock Slots Preview Row */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-text-secondary">
                    <span className="flex items-center gap-1.5 text-focus-neon">
                      <Pin size={13} />
                      <span>Sık Kullanılan Dock Slotları</span>
                    </span>
                    <span className="text-[10px] text-text-secondary/70">Değiştirmek için slotlara basılı tutun</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {dockSlots.map((slotId, idx) => {
                      const app = appMap.get(slotId);
                      return (
                        <button
                          key={`drawer-slot-preview-${idx}`}
                          onClick={() => setEditingSlotIndex(idx)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-white/10 hover:border-focus-neon text-center transition-all active:scale-95"
                        >
                          <span className="text-[9px] font-bold text-focus-neon mb-0.5">Slot #{idx + 1}</span>
                          <div className="text-white text-xs truncate max-w-full font-bold">
                            {app ? app.title : slotId}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Apps */}
                {!searchQuery && recentModules.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-text-secondary mb-2.5 px-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span>Son Kullanılan Sayfalar</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {recentModules.map(modId => {
                        const app = allApps.find(a => a.id === modId);
                        if (!app) return null;

                        return (
                          <button
                            key={`recent-${app.id}`}
                            onClick={() => handleSelectModule(app.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-focus-neon/40 text-left shrink-0 active:scale-95 transition-all"
                          >
                            <div className={`p-1.5 rounded-xl bg-gradient-to-br ${app.color} text-white`}>
                              {app.icon}
                            </div>
                            <span className="text-xs font-bold text-white whitespace-nowrap">{app.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grid Categorized List */}
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3 px-1">
                    Tüm Sayfalar ve Modüller ({filteredApps.length})
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {filteredApps.map(app => {
                      const isActive = activeModule === app.id;
                      const pinnedSlotIdx = dockSlots.indexOf(app.id);

                      return (
                        <button
                          key={app.id}
                          onClick={() => handleSelectModule(app.id)}
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-2xl border text-left transition-all active:scale-95 relative overflow-hidden group",
                            isActive 
                              ? "bg-focus-neon/15 border-focus-neon text-white shadow-lg shadow-focus-neon/10" 
                              : "bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${app.color} text-white shrink-0 shadow-md`}>
                            {app.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{app.title}</div>
                            <div className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold opacity-70 truncate">{app.category}</div>
                          </div>

                          {pinnedSlotIdx !== -1 && (
                            <div className="p-1 rounded-lg bg-focus-neon/20 border border-focus-neon/40 text-focus-neon text-[9px] font-bold shrink-0">
                              #{pinnedSlotIdx + 1}
                            </div>
                          )}

                          {isActive && pinnedSlotIdx === -1 && (
                            <div className="w-2 h-2 rounded-full bg-focus-neon shrink-0 shadow-[0_0_8px_#70a1ff]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick System Action Links */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      openWizard();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-focus-neon/15 border border-focus-neon/30 text-xs font-bold text-focus-neon hover:bg-focus-neon/25"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Wand2 size={15} className="animate-pulse shrink-0" />
                      <span className="truncate">Duvar Kağıdı</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      (window as any).openSettingsModal?.();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Settings size={15} className="text-focus-neon shrink-0" />
                      <span className="truncate">{t('nav.settings', 'Ayarlar')}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      toggleSidebar();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Grid size={15} className="text-indigo-400 shrink-0" />
                      <span className="truncate">Sol Menü</span>
                    </span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
