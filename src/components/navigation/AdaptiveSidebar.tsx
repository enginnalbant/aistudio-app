import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  UserCheck,
  Briefcase,
  Tv,
  Library,
  BrainCircuit,
  FolderKanban,
  Boxes,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  EyeOff,
  Layers,
  Star,
  Search,
  Lock,
  Sparkles,
  Command,
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  TrendingUp,
  CheckSquare,
  Clock,
  FileBarChart,
  Radio,
  Headphones,
  BookOpen,
  NotebookPen,
  Network,
  FileText,
  HardDrive,
  Package,
  Terminal,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { getLiquidGlassStyle } from './LiquidGlassLayer';
import { RotatingFocusBorder } from './RotatingFocusBorder';
import { NavMode, SidebarPosition } from '../../types/navigation';

interface AdaptiveSidebarProps {
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

const ICON_MAP: Record<string, any> = {
  Home,
  UserCheck,
  Briefcase,
  Tv,
  Library,
  BrainCircuit,
  FolderKanban,
  Boxes,
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  TrendingUp,
  CheckSquare,
  Clock,
  FileBarChart,
  Radio,
  Headphones,
  BookOpen,
  NotebookPen,
  Sparkles,
  Network,
  FileText,
  HardDrive,
  Package,
  Terminal,
  Layers,
  Star,
};

export const AdaptiveSidebar: React.FC<AdaptiveSidebarProps> = ({ isOpen = true, onCloseMobile }) => {
  const {
    preferences,
    effectiveMode,
    currentMode,
    isTempExpanded,
    isFocusSummoned,
    activeSection,
    activeModuleId,
    setActiveSection,
    setActiveModuleId,
    setNavMode,
    openStudio,
    openCommandPalette,
    togglePageFavorite,
    requestUnlock,
    unlockedItems,
    handleS1MouseEnter,
    handleS2MouseEnter,
    handleMouseLeaveNav,
    summonFocusSidebar,
    dismissFocusSidebar,
  } = useNavigation();

  const [localSearch, setLocalSearch] = useState('');
  const glassStyle = useMemo(
    () => getLiquidGlassStyle(preferences.glassConfig),
    [preferences.glassConfig]
  );

  const activeModule = preferences.modules[activeSection] || preferences.modules['mainmenu'];

  // Ordered modules list based on moduleOrder
  const orderedModules = useMemo(() => {
    const order = preferences.moduleOrder || [];
    const mods = preferences.modules || {};
    const list: any[] = [];
    
    order.forEach((id) => {
      if (mods[id]) list.push(mods[id]);
    });
    
    Object.values(mods).forEach((mod) => {
      if (!order.includes(mod.id)) {
        list.push(mod);
      }
    });

    return list;
  }, [preferences.moduleOrder, preferences.modules]);

  // Filter sub-pages for S2
  const filteredPages = useMemo(() => {
    if (!activeModule || !activeModule.subPages) return [];
    if (!localSearch.trim()) {
      return activeModule.subPages.filter((p) => p.visible);
    }
    const q = localSearch.toLowerCase();
    return activeModule.subPages.filter(
      (p) => p.visible && (p.label.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
    );
  }, [activeModule, localSearch]);

  // Handle module click in S1 / Dock / Top
  const handleModuleClick = (modId: string) => {
    const mod = preferences.modules[modId];
    if (!mod) return;

    if (mod.securityLevel === 'protected' && !unlockedItems[mod.id]) {
      requestUnlock(mod.id, mod.title, () => {
        setActiveSection(mod.id);
        if (mod.subPages?.[0]) setActiveModuleId(mod.subPages[0].id);
      });
      return;
    }

    setActiveSection(modId);
    if (mod.subPages?.[0]) {
      setActiveModuleId(mod.subPages[0].id);
    }
  };

  // Handle subpage click in S2 / Dock / Top
  const handlePageClick = (pageId: string, pageLabel: string, isProtected: boolean) => {
    if (isProtected && !unlockedItems[pageId]) {
      requestUnlock(pageId, pageLabel, () => {
        setActiveModuleId(pageId);
      });
      return;
    }
    setActiveModuleId(pageId);
  };

  const focusLightConfig = preferences.focusLightConfig || {
    color: 'cyan',
    speed: 'normal',
    intensity: 'vivid',
    enabled: true,
  };

  const iconSize = preferences.appearance?.iconSize || 18;
  const showSearch = preferences.appearance?.showSearch !== false;
  const showHeader = preferences.appearance?.showHeader !== false;
  const showFooter = preferences.appearance?.showFooter !== false;
  const tooltipsEnabled = preferences.appearance?.tooltipsEnabled !== false;

  // 1. FOCUS MODE LAYOUT: Hide sidebars and show sleek summon pill with rotating light
  if (currentMode === 'focus' && !isFocusSummoned) {
    const containerPos =
      preferences.position === 'dock'
        ? 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50'
        : preferences.position === 'top'
        ? 'fixed top-4 left-1/2 -translate-x-1/2 z-50'
        : preferences.position === 'right'
        ? 'fixed top-1/2 right-3 -translate-y-1/2 z-50'
        : 'fixed top-1/2 left-3 -translate-y-1/2 z-50';

    return (
      <div className={containerPos}>
        <RotatingFocusBorder
          color={focusLightConfig.color}
          speed={focusLightConfig.speed}
          intensity={focusLightConfig.intensity}
          enabled={focusLightConfig.enabled}
          borderRadius={24}
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={summonFocusSidebar}
            className="px-3.5 py-1.5 rounded-full bg-neutral-950/90 border border-white/20 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white flex items-center gap-2 cursor-pointer group"
            title="Focus Mode Aktif - Odaklanma Modu (Navigasyonu Göster - Ctrl+Shift+F)"
          >
            <Sparkles size={14} className="text-focus-neon animate-pulse shrink-0" />
            <span className="text-[11px] font-bold text-white font-mono tracking-wide whitespace-nowrap">
              Focus Mode
            </span>
            <ChevronRight size={13} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </motion.button>
        </RotatingFocusBorder>
      </div>
    );
  }

  // 2. APPLE MAC OS STYLE DOCK MODE (position === 'dock')
  if (preferences.position === 'dock') {
    const isDockHidden = effectiveMode === 'autohide' && !isTempExpanded;

    return (
      <>
        {/* Dock Auto-Hide Reveal Bar */}
        {effectiveMode === 'autohide' && !isTempExpanded && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 pointer-events-auto pb-1">
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.1, y: -2 }}
              onMouseEnter={handleS1MouseEnter}
              onClick={handleS1MouseEnter}
              className="px-5 py-1 rounded-t-xl bg-focus-neon/30 hover:bg-focus-neon/50 border-t border-x border-focus-neon/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,229,255,0.5)] flex items-center justify-center gap-1.5 text-focus-neon text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer animate-pulse"
              title="Dock Auto-Hide - Göster"
            >
              <ChevronRight size={12} className="-rotate-90" />
              <span>Dock Reveal</span>
            </motion.button>
          </div>
        )}

        <motion.div
          onMouseEnter={handleS1MouseEnter}
          onMouseLeave={handleMouseLeaveNav}
          animate={{
            y: isDockHidden ? 90 : 0,
            opacity: isDockHidden ? 0 : 1,
            scale: isDockHidden ? 0.95 : 1,
          }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 select-none pointer-events-auto"
        >
          {/* Floating Sub-Pages drawer when a module is active */}
          <AnimatePresence>
            {activeModule && activeModule.subPages && activeModule.subPages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={glassStyle}
                className="px-3 py-2 rounded-2xl flex items-center gap-1.5 max-w-[90vw] overflow-x-auto scrollbar-none"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 shrink-0 flex items-center gap-1 border-r border-white/10 pr-2">
                  <Sparkles size={11} className="text-focus-neon" />
                  {activeModule.title}
                </div>
                {filteredPages.map((page) => {
                  const IconComp = ICON_MAP[page.iconName] || FileText;
                  const isPageActive = activeModuleId === page.id;
                  const isProtected = page.securityLevel === 'protected' && !unlockedItems[page.id];

                  return (
                    <motion.button
                      key={page.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageClick(page.id, page.label, isProtected)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
                        isPageActive
                          ? 'bg-focus-main text-white shadow-md'
                          : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <IconComp size={13} />
                      <span>{page.label}</span>
                      {isProtected && <Lock size={10} className="text-rose-400 ml-0.5" />}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* macOS Apple Dock Floating Container */}
          <motion.div
            style={glassStyle}
            className={`relative rounded-3xl flex items-center gap-2 before:absolute before:inset-x-6 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent ${
              effectiveMode === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2.5'
            }`}
          >
            {/* Home Module */}
            <motion.button
              whileHover={{ scale: 1.3, y: -5 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleModuleClick('mainmenu')}
              className={`rounded-2xl flex items-center justify-center transition-transform relative group ${
                effectiveMode === 'compact' ? 'w-8 h-8' : 'w-10 h-10'
              } ${
                activeSection === 'mainmenu'
                  ? 'bg-white/20 text-white border border-white/30 shadow-lg'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              title="Ana Menü (Home)"
            >
              <Home size={effectiveMode === 'compact' ? 16 : 20} />
              {activeSection === 'mainmenu' && (
                <span className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-focus-neon shadow-[0_0_8px_#00E5FF]" />
              )}
            </motion.button>

            <div className="w-px h-6 bg-white/15 mx-0.5" />

            {/* Module Icons */}
            {orderedModules.map((mod) => {
              if (!mod.visible || mod.id === 'mainmenu') return null;
              const IconComp = ICON_MAP[mod.iconName] || Boxes;
              const isActive = activeSection === mod.id;
              const isLocked = mod.securityLevel === 'protected' && !unlockedItems[mod.id];

              return (
                <div key={mod.id} className="relative group flex flex-col items-center">
                  <motion.button
                    whileHover={{ scale: 1.3, y: -5 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleModuleClick(mod.id)}
                    className={`rounded-2xl flex items-center justify-center transition-all relative ${
                      effectiveMode === 'compact' ? 'w-8 h-8' : 'w-10 h-10'
                    } ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30 shadow-lg'
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                    style={isActive ? { borderColor: mod.color } : {}}
                  >
                    <IconComp size={effectiveMode === 'compact' ? 16 : 20} style={isActive ? { color: mod.color } : {}} />

                    {isLocked ? (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px]">
                        <Lock size={9} />
                      </span>
                    ) : mod.badge ? (
                      <span
                        className="absolute -top-1 -right-1 px-1 min-w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: mod.color, color: '#fff' }}
                      >
                        {mod.badge}
                      </span>
                    ) : null}
                  </motion.button>

                  {/* macOS Active Dot */}
                  {isActive && (
                    <motion.span
                      layoutId="dock-active-dot"
                      className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-focus-neon shadow-[0_0_8px_#00E5FF]"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}

                  {/* Hover Tooltip */}
                  {tooltipsEnabled && (
                    <div className="absolute bottom-full mb-3 px-2.5 py-1 rounded-xl bg-neutral-900/95 border border-white/15 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl backdrop-blur-md">
                      {mod.title}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="w-px h-6 bg-white/15 mx-0.5" />

            {/* Quick Actions: Command Palette, Studio, and Focus Mode Button with Rotating Light */}
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.85 }}
                onClick={openCommandPalette}
                className={`rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center ${
                  effectiveMode === 'compact' ? 'w-7 h-7' : 'w-9 h-9'
                }`}
                title="Komut Katmanı (Ctrl+K)"
              >
                <Command size={effectiveMode === 'compact' ? 14 : 16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.85 }}
                onClick={openStudio}
                className={`rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center ${
                  effectiveMode === 'compact' ? 'w-7 h-7' : 'w-9 h-9'
                }`}
                title="Navigation Studio"
              >
                <Sliders size={effectiveMode === 'compact' ? 14 : 16} />
              </motion.button>

              <RotatingFocusBorder
                color={focusLightConfig.color}
                speed={focusLightConfig.speed}
                intensity={focusLightConfig.intensity}
                enabled={currentMode === 'focus' || focusLightConfig.enabled}
                borderRadius={12}
              >
                <motion.button
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setNavMode(currentMode === 'focus' ? 'expanded' : 'focus')}
                  className={`rounded-xl flex items-center justify-center transition-all ${
                    effectiveMode === 'compact' ? 'w-7 h-7' : 'w-9 h-9'
                  } ${
                    currentMode === 'focus'
                      ? 'bg-focus-neon text-white font-bold shadow-[0_0_15px_#00E5FF]'
                      : 'bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white border border-white/20'
                  }`}
                  title="Focus Mode (Ctrl+Shift+F)"
                >
                  <Sparkles size={effectiveMode === 'compact' ? 14 : 16} className={currentMode === 'focus' ? 'animate-pulse' : ''} />
                </motion.button>
              </RotatingFocusBorder>
            </div>
          </motion.div>
        </motion.div>
      </>
    );
  }

  // 3. TOP BAR NAVIGATION MODE (position === 'top')
  if (preferences.position === 'top') {
    return (
      <header
        style={glassStyle}
        className="w-full flex flex-col shrink-0 select-none z-30 transition-all duration-200 mb-2 border-b border-white/15 backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between px-4 py-2.5 gap-4">
          {/* Left: Home + Modules */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => handleModuleClick('mainmenu')}
              className={`p-2 rounded-xl flex items-center gap-2 text-xs font-semibold shrink-0 transition-all ${
                activeSection === 'mainmenu'
                  ? 'bg-focus-main text-white shadow-md'
                  : 'text-neutral-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home size={16} />
              <span>Ana Menü</span>
            </button>

            <div className="w-px h-5 bg-white/15 mx-1" />

            {orderedModules.map((mod) => {
              if (!mod.visible || mod.id === 'mainmenu') return null;
              const IconComp = ICON_MAP[mod.iconName] || Boxes;
              const isActive = activeSection === mod.id;

              return (
                <motion.button
                  key={mod.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleModuleClick(mod.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition-all ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30 font-semibold shadow-sm'
                      : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <IconComp size={15} style={isActive ? { color: mod.color } : {}} />
                  <span>{mod.title}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openCommandPalette}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
              title="Command Palette (Ctrl+K)"
            >
              <Command size={16} />
            </button>
            <button
              onClick={openStudio}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
              title="Studio"
            >
              <Sliders size={16} />
            </button>
            <RotatingFocusBorder
              color={focusLightConfig.color}
              speed={focusLightConfig.speed}
              intensity={focusLightConfig.intensity}
              enabled={currentMode === 'focus' || focusLightConfig.enabled}
              borderRadius={12}
            >
              <button
                onClick={() => setNavMode(currentMode === 'focus' ? 'expanded' : 'focus')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentMode === 'focus'
                    ? 'bg-focus-neon text-white shadow-[0_0_15px_#00E5FF]'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-200 border border-white/20'
                }`}
              >
                <Sparkles size={14} />
                <span>Focus</span>
              </button>
            </RotatingFocusBorder>
          </div>
        </div>

        {/* Sub-Pages Row */}
        {activeModule && activeModule.subPages && activeModule.subPages.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 border-t border-white/10 overflow-x-auto scrollbar-none bg-black/20">
            {filteredPages.map((page) => {
              const IconComp = ICON_MAP[page.iconName] || FileText;
              const isPageActive = activeModuleId === page.id;
              const isProtected = page.securityLevel === 'protected' && !unlockedItems[page.id];

              return (
                <button
                  key={page.id}
                  onClick={() => handlePageClick(page.id, page.label, isProtected)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
                    isPageActive
                      ? 'bg-focus-main text-white shadow-sm'
                      : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <IconComp size={13} />
                  <span>{page.label}</span>
                  {isProtected && <Lock size={10} className="text-rose-400 ml-0.5" />}
                </button>
              );
            })}
          </div>
        )}
      </header>
    );
  }

  // 4. STANDARD VERTICAL SIDEBAR (position === 'left' or 'right')
  const s1Width = preferences.layout?.primaryWidth || preferences.s1Width || 58;
  const isS2Visible = effectiveMode !== 'focus' && (effectiveMode === 'expanded' || effectiveMode === 'compact' || isTempExpanded);
  const s2Width = effectiveMode === 'compact' 
    ? (preferences.layout?.compactWidth || 56) 
    : (preferences.layout?.secondaryWidth || preferences.s2Width || 248);

  return (
    <aside
      onMouseLeave={handleMouseLeaveNav}
      style={{
        gap: `${preferences.layout?.gap ?? 8}px`,
        margin: `${preferences.layout?.outerMargin ?? 0}px`,
        paddingTop: `${preferences.layout?.topOffset ?? 0}px`,
        paddingBottom: `${preferences.layout?.bottomOffset ?? 0}px`,
      }}
      className={`h-full flex items-stretch shrink-0 select-none z-30 transition-all duration-300 relative ${
        preferences.position === 'right' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Edge Reveal Indicator for AutoHide Mode when collapsed */}
      {currentMode === 'autohide' && !isTempExpanded && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1, x: 3 }}
            onClick={handleS1MouseEnter}
            onMouseEnter={handleS1MouseEnter}
            className="w-3.5 h-36 rounded-r-2xl bg-focus-neon/30 hover:bg-focus-neon/50 border-r border-y border-focus-neon/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,229,255,0.5)] flex items-center justify-center text-focus-neon cursor-pointer animate-pulse"
            title="Sidebar Edge Reveal (Üzerine gel veya tıkla)"
          >
            <ChevronRight size={14} />
          </motion.button>
        </div>
      )}

      {/* S1: PRIMARY GLOBAL NAVIGATION RAIL */}
      <div
        onMouseEnter={handleS1MouseEnter}
        style={{
          width: `${s1Width}px`,
          borderRadius: `${preferences.layout?.cornerRadius ?? 16}px`,
          ...glassStyle,
        }}
        className="h-full flex flex-col items-center py-3 justify-between shrink-0 relative overflow-hidden transition-all duration-200"
      >
        {/* Top: Home / Logo */}
        <div className="flex flex-col items-center gap-3 w-full px-2 overflow-y-auto scrollbar-none">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleModuleClick('mainmenu')}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 group relative ${
              activeSection === 'mainmenu'
                ? 'bg-focus-main text-white shadow-[0_0_20px_rgba(30,144,255,0.4)]'
                : 'bg-white/5 hover:bg-white/15 text-neutral-300'
            }`}
            title="Ana Menü & Genel Bakış"
          >
            <Home size={iconSize} />
            {activeSection === 'mainmenu' && (
              <motion.div
                layoutId="active-rail-indicator"
                className="absolute -left-2 top-1.5 bottom-1.5 w-1 bg-focus-neon rounded-r-full"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
          </motion.button>

          <div className="w-6 h-px bg-white/10 my-0.5 shrink-0" />

          {/* Module Icons List */}
          <div className="flex flex-col items-center gap-2 w-full">
            {orderedModules.map((mod) => {
              if (!mod.visible || mod.id === 'mainmenu') return null;
              const IconComp = ICON_MAP[mod.iconName] || Layers;
              const isActive = activeSection === mod.id;
              const isLocked = mod.securityLevel === 'protected' && !unlockedItems[mod.id];

              return (
                <div key={mod.id} className="relative group w-full flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleModuleClick(mod.id)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 relative ${
                      isActive
                        ? 'bg-white/15 text-white shadow-sm border border-white/20'
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                    style={isActive ? { borderColor: mod.color } : {}}
                    title={mod.title}
                  >
                    <IconComp size={iconSize} style={isActive ? { color: mod.color } : {}} />

                    {/* Badge or Lock */}
                    {isLocked ? (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500/90 text-white flex items-center justify-center text-[9px] shadow-sm">
                        <Lock size={9} />
                      </span>
                    ) : mod.badge ? (
                      <span
                        className="absolute -top-1 -right-1 px-1 min-w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: mod.color, color: '#fff' }}
                      >
                        {mod.badge}
                      </span>
                    ) : null}

                    {/* Active Pip Indicator Morph */}
                    {isActive && (
                      <motion.div
                        layoutId="active-rail-indicator"
                        className="absolute -left-2 top-1.5 bottom-1.5 w-1 rounded-r-full"
                        style={{ backgroundColor: mod.color }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      />
                    )}
                  </motion.button>

                  {/* Tooltip on Hover */}
                  {tooltipsEnabled && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 rounded-xl bg-neutral-900/95 border border-white/15 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-xl backdrop-blur-md">
                      {mod.title}
                      {isLocked && ' (Kilitli)'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions: Command Palette, Studio & Dedicated Focus Button with Rotating Border */}
        <div className="flex flex-col items-center gap-2 w-full px-2 pt-2 border-t border-white/10">
          <button
            onClick={openCommandPalette}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
            title="Komut Katmanı (Ctrl+K)"
          >
            <Command size={16} />
          </button>

          <button
            onClick={openStudio}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
            title="Sidebar & Navigation Studio"
          >
            <Sliders size={16} />
          </button>

          {/* Focus Button with Rotating Border */}
          <RotatingFocusBorder
            color={focusLightConfig.color}
            speed={focusLightConfig.speed}
            intensity={focusLightConfig.intensity}
            enabled={currentMode === 'focus' || focusLightConfig.enabled}
            borderRadius={14}
          >
            <button
              onClick={() => setNavMode(currentMode === 'focus' ? 'expanded' : 'focus')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                currentMode === 'focus'
                  ? 'bg-focus-neon text-white font-bold shadow-[0_0_15px_#00E5FF]'
                  : 'bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white border border-white/20'
              }`}
              title="Focus Mode Dönen Işık (Ctrl+Shift+F)"
            >
              <Sparkles size={16} className={currentMode === 'focus' ? 'animate-pulse' : ''} />
            </button>
          </RotatingFocusBorder>
        </div>
      </div>

      {/* S2: SECONDARY CONTEXT & MODULE PANEL */}
      <AnimatePresence>
        {isS2Visible && (
          <motion.div
            initial={{ opacity: 0, x: preferences.position === 'right' ? 15 : -15, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: preferences.position === 'right' ? 15 : -15, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseEnter={handleS2MouseEnter}
            style={{
              width: `${s2Width}px`,
              borderRadius: `${preferences.layout?.cornerRadius ?? 16}px`,
              ...glassStyle,
            }}
            className="h-full flex flex-col p-3 shrink-0 relative overflow-hidden transition-all duration-200"
          >
            {effectiveMode === 'compact' ? (
              // COMPACT S2 RENDER: Mini icons, badges & favorites only
              <div className="flex flex-col items-center justify-between h-full w-full py-1">
                <div className="flex flex-col items-center gap-3 w-full">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                    style={{ backgroundColor: activeModule?.color || '#3b82f6', color: '#fff' }}
                  >
                    {activeModule?.shortName?.slice(0, 2) || 'OS'}
                  </div>
                  <div className="w-6 h-px bg-white/10" />

                  {/* Compact Pages Icon List */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    {filteredPages.map((page) => {
                      const IconComp = ICON_MAP[page.iconName] || Layers;
                      const isPageActive = activeModuleId === page.id;
                      const isProtected = page.securityLevel === 'protected';

                      return (
                        <button
                          key={page.id}
                          onClick={() => handlePageClick(page.id, page.label, isProtected)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all ${
                            isPageActive
                              ? 'bg-focus-main text-white shadow-sm'
                              : 'text-neutral-400 hover:text-white hover:bg-white/10'
                          }`}
                          title={page.label}
                        >
                          <IconComp size={15} />
                          {page.isFavorite && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setNavMode('expanded')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
                  title="Genişlet (Expanded Mode)"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              // EXPANDED S2 RENDER: Full Header, Search, Sub-pages, Pin Stars & Descriptions
              <div className="flex flex-col h-full w-full">
                {/* Header with Title & Accent */}
                {showHeader && (
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                        style={{ backgroundColor: activeModule?.color || '#3b82f6', color: '#fff' }}
                      >
                        {activeModule?.shortName?.slice(0, 2) || 'OS'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white tracking-wide truncate">
                          {activeModule?.title || 'Modül Seç'}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {activeModule?.subPages?.length || 0} Sayfa / Görünüm
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setNavMode('compact')}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="S2 Paneli Daralt"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                )}

                {/* Sub-Page Search */}
                {showSearch && (
                  <div className="relative mb-3 shrink-0">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="Sayfalarda ara..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-focus-neon/60 transition-colors"
                    />
                  </div>
                )}

                {/* Sub-Pages List */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-none">
                  {filteredPages.map((page) => {
                    const IconComp = ICON_MAP[page.iconName] || Layers;
                    const isPageActive = activeModuleId === page.id;
                    const isProtected = page.securityLevel === 'protected' && !unlockedItems[page.id];

                    return (
                      <div
                        key={page.id}
                        className={`group rounded-xl p-2 transition-all cursor-pointer flex items-center justify-between ${
                          isPageActive
                            ? 'bg-focus-main/20 border border-focus-neon/40 text-white shadow-sm'
                            : 'hover:bg-white/5 text-neutral-300 hover:text-white border border-transparent'
                        }`}
                        onClick={() => handlePageClick(page.id, page.label, isProtected)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-1.5 rounded-lg transition-colors ${
                              isPageActive ? 'bg-focus-main text-white' : 'bg-white/5 text-neutral-400 group-hover:text-white'
                            }`}
                          >
                            <IconComp size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate flex items-center gap-1">
                              <span>{page.label}</span>
                              {isProtected && <Lock size={10} className="text-rose-400 shrink-0" />}
                            </div>
                            {page.description && (
                              <div className="text-[10px] text-neutral-400 truncate leading-tight">
                                {page.description}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Favorite Star */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePageFavorite(page.id);
                          }}
                          className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                            page.isFavorite ? 'opacity-100 text-amber-400' : 'text-neutral-500 hover:text-amber-400'
                          }`}
                          title="Favorilere Ekle/Çıkar"
                        >
                          <Star size={12} fill={page.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer with Security & Smartness Level Info */}
                {showFooter && (
                  <div className="pt-2.5 mt-2 border-t border-white/10 shrink-0 flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Lock size={10} className="text-emerald-400" /> ApexOS Secure
                    </span>
                    <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-mono">
                      {preferences.smartnessLevel.toUpperCase()} AI
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
