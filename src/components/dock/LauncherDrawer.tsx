import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Zap,
  Globe,
  Sun,
  Moon,
  Pin,
  Star,
  Settings,
  Grid,
  ChevronRight,
  Briefcase,
  User,
  DollarSign,
  TrendingUp,
  Cpu,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { AppShortcut } from './Dock';
import { DockProfile } from './DockStore';
import { triggerHaptic } from './DockItem';
import clsx from 'clsx';

interface LauncherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  filteredApps: AppShortcut[];
  recentModules: string[];
  dockSlots: string[];
  activeModule: string;
  activeProfile: DockProfile;
  onSelectModule: (id: string) => void;
  onCustomizeSlot: (slotIdx: number) => void;
  onProfileChange: (p: DockProfile) => void;
  allApps: AppShortcut[];
  language: string;
  toggleLanguage: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  fps: number;
  toggleFps: () => void;
  toggleSidebar: () => void;
}

export const LauncherDrawer: React.FC<LauncherDrawerProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredApps,
  recentModules,
  dockSlots,
  activeModule,
  activeProfile,
  onSelectModule,
  onCustomizeSlot,
  onProfileChange,
  allApps,
  language,
  toggleLanguage,
  isDark,
  toggleTheme,
  fps,
  toggleFps,
  toggleSidebar
}) => {
  const profileList: { id: DockProfile; label: string; icon: React.ReactNode }[] = [
    { id: 'finance', label: 'Finans', icon: <DollarSign size={13} /> },
    { id: 'work', label: 'İş', icon: <Briefcase size={13} /> },
    { id: 'personal', label: 'Kişisel', icon: <User size={13} /> },
    { id: 'production', label: 'Üretim', icon: <TrendingUp size={13} /> },
    { id: 'admin', label: 'Yönetici', icon: <Cpu size={13} /> }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Bottom Sheet Drawer Content */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="relative w-full max-h-[88vh] bg-neutral-950/98 border-t border-white/15 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden pb-8"
        >
          {/* Handlebar */}
          <div className="w-full flex justify-center py-3" onClick={onClose}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full cursor-pointer" />
          </div>

          {/* Header & Quick Controls */}
          <div className="px-5 pb-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-focus-neon/15 border border-focus-neon/30 flex items-center justify-center text-focus-neon">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-base font-display font-black text-white tracking-tight">APEX Dynamic Launcher</h3>
                <p className="text-[11px] text-text-secondary font-medium">Sistem Menü Çekmecesi & Profiler</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {/* FPS Selector Pill */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  toggleFps();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-focus-neon/15 border border-focus-neon/30 text-focus-neon text-xs font-mono font-black flex items-center gap-1 hover:bg-focus-neon/25 active:scale-95"
              >
                <Gauge size={13} className="animate-pulse" />
                <span>{fps} FPS</span>
              </button>

              {/* Language Quick Toggle */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  toggleLanguage();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-1 hover:bg-white/10"
              >
                <Globe size={13} className="text-focus-neon" />
                <span className="uppercase">{language}</span>
              </button>

              {/* Theme Quick Toggle */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  toggleTheme();
                }}
                className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10"
              >
                {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Profile Switcher Row (Dynamic Color Matrix) */}
          <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
            <span className="text-[10px] font-black uppercase text-text-secondary shrink-0 tracking-wider">Aktif Profil:</span>
            {profileList.map(p => (
              <button
                key={`prof-${p.id}`}
                onClick={() => {
                  triggerHaptic('double');
                  onProfileChange(p.id);
                }}
                className={clsx(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95",
                  activeProfile === p.id
                    ? "bg-gradient-to-tr from-focus-main to-focus-neon text-white shadow-lg"
                    : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
                )}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar & Category Pills */}
          <div className="p-4 pb-2 space-y-3 shrink-0">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3.5 text-text-secondary pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sayfa veya menü ara..."
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
                { id: 'finance', label: 'Finans' },
                { id: 'inventory', label: 'Tedarik & Stok' },
                { id: 'notes', label: 'Notlar' },
                { id: 'social', label: 'Bülten' },
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
                  <span>Sık Kullanılan Dock Yuvaları</span>
                </span>
                <span className="text-[10px] text-text-secondary/70">Değiştirmek için slotlara dokunun</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {dockSlots.map((slotId, idx) => {
                  const app = allApps.find(a => a.id === slotId);
                  return (
                    <button
                      key={`drawer-slot-preview-${idx}`}
                      onClick={() => {
                        triggerHaptic('medium');
                        onCustomizeSlot(idx);
                      }}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-white/10 hover:border-focus-neon text-center transition-all active:scale-95"
                    >
                      <span className="text-[9px] font-bold text-focus-neon mb-0.5">Slot #{idx + 1}</span>
                      <div className="text-white text-xs truncate max-w-full font-bold">
                        {app ? app.title.split(' ')[0] : slotId}
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
                        onClick={() => {
                          triggerHaptic('light');
                          onSelectModule(app.id);
                        }}
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
                      onClick={() => {
                        triggerHaptic('success');
                        onSelectModule(app.id);
                      }}
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
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  (window as any).openSettingsModal?.();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <Settings size={16} className="text-focus-neon" />
                  <span>Sistem Ayarları</span>
                </span>
                <ChevronRight size={14} className="text-text-secondary" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  toggleSidebar();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <Grid size={16} className="text-indigo-400" />
                  <span>Sol Menüyü Aç</span>
                </span>
                <ChevronRight size={14} className="text-text-secondary" />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
