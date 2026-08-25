import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sliders,
  Maximize2,
  Minimize2,
  EyeOff,
  Layers,
  ArrowRight,
  Sparkles,
  Command,
  Check,
  Shield,
  Palette,
  Home,
  UserCheck,
  Briefcase,
  Tv,
  Library,
  BrainCircuit,
  FolderKanban,
  Boxes,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { NavMode, GlassPreset } from '../../types/navigation';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    preferences,
    setActiveSection,
    setActiveModuleId,
    setNavMode,
    setGlassPreset,
    openStudio,
    requestUnlock,
    unlockedItems,
  } = useNavigation();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Aggregate searchable items
  const items = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      category: 'Sayfa' | 'Modül' | 'Mod' | 'Cam Preseti' | 'Sistem';
      icon: any;
      description?: string;
      action: () => void;
    }> = [];

    // Modules & Pages
    Object.values(preferences.modules).forEach((mod) => {
      if (!mod.visible) return;
      list.push({
        id: `mod-${mod.id}`,
        title: mod.title,
        category: 'Modül',
        icon: mod.id === 'personelos' ? UserCheck : mod.id === 'workos' ? Briefcase : mod.id === 'mediaos' ? Tv : mod.id === 'libraryos' ? Library : mod.id === 'intelligeos' ? BrainCircuit : mod.id === 'files' ? FolderKanban : mod.id === 'appstore' ? Boxes : Home,
        description: `${mod.title} ana modülüne git`,
        action: () => {
          if (mod.securityLevel === 'protected' && !unlockedItems[mod.id]) {
            requestUnlock(mod.id, mod.title, () => {
              setActiveSection(mod.id);
              if (mod.subPages?.[0]) setActiveModuleId(mod.subPages[0].id);
            });
          } else {
            setActiveSection(mod.id);
            if (mod.subPages?.[0]) setActiveModuleId(mod.subPages[0].id);
          }
          closeCommandPalette();
        },
      });

      mod.subPages.forEach((page) => {
        if (!page.visible) return;
        list.push({
          id: `page-${page.id}`,
          title: page.label,
          category: 'Sayfa',
          icon: Layers,
          description: `${mod.title} > ${page.label}`,
          action: () => {
            if (page.securityLevel === 'protected' && !unlockedItems[page.id]) {
              requestUnlock(page.id, page.label, () => {
                setActiveSection(mod.id);
                setActiveModuleId(page.id);
              });
            } else {
              setActiveSection(mod.id);
              setActiveModuleId(page.id);
            }
            closeCommandPalette();
          },
        });
      });
    });

    // Navigation Modes
    const modes: Array<{ mode: NavMode; label: string; desc: string; icon: any }> = [
      { mode: 'expanded', label: 'Expanded Mode (Tam Açık)', desc: 'Sol + İkinci sidebar tamamen açık', icon: Layers },
      { mode: 'compact', label: 'Compact Mode (Kompakt)', desc: 'İkinci sidebar simge ve mini göstergelerle daralır', icon: Minimize2 },
      { mode: 'autohide', label: 'Auto-Hide Mode (Otomatik Gizle)', desc: 'İkinci sidebar sadece üzerine gelince açılır', icon: EyeOff },
      { mode: 'focus', label: 'Focus Mode (Ultra Odaklanma)', desc: 'Sidebarlar tamamen gizlenir, tam içerik ekranı', icon: Maximize2 },
    ];

    modes.forEach((m) => {
      list.push({
        id: `mode-${m.mode}`,
        title: m.label,
        category: 'Mod',
        icon: m.icon,
        description: m.desc,
        action: () => {
          setNavMode(m.mode);
          closeCommandPalette();
        },
      });
    });

    // Glass presets
    const presets: Array<{ preset: GlassPreset; label: string; desc: string }> = [
      { preset: 'minimal', label: 'Minimal Glass', desc: 'Hafif bulanıklık, ince sınır, yüksek okunabilirlik' },
      { preset: 'clear', label: 'Clear Glass', desc: 'Ultra şeffaf ve berrak arka plan hissi' },
      { preset: 'deep', label: 'Deep Glass', desc: 'Koyu ve derin cam tonları, gölgeli tasarım' },
      { preset: 'frosted', label: 'Frosted Glass', desc: 'Buzlu cam, yoğun blur ve satürasyon' },
    ];

    presets.forEach((p) => {
      list.push({
        id: `glass-${p.preset}`,
        title: `Cam Preseti: ${p.label}`,
        category: 'Cam Preseti',
        icon: Palette,
        description: p.desc,
        action: () => {
          setGlassPreset(p.preset);
          closeCommandPalette();
        },
      });
    });

    // Studio action
    list.push({
      id: 'open-sidebar-studio',
      title: 'Sidebar & Navigation Studio',
      category: 'Sistem',
      icon: Sliders,
      description: 'Sidebar canlı önizleme, glass ayarları ve modül yöneticisi',
      action: () => {
        closeCommandPalette();
        openStudio();
      },
    });

    return list;
  }, [preferences.modules, unlockedItems, requestUnlock, setActiveSection, setActiveModuleId, setNavMode, setGlassPreset, openStudio, closeCommandPalette]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items.slice(0, 10);
    const q = query.toLowerCase();
    return items
      .filter((it) => it.title.toLowerCase().includes(q) || it.category.toLowerCase().includes(q) || (it.description && it.description.toLowerCase().includes(q)))
      .slice(0, 12);
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) item.action();
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1300] flex items-start justify-center pt-24 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCommandPalette}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Palette Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl rounded-2xl bg-neutral-900/95 border border-white/15 shadow-2xl backdrop-blur-2xl text-white overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
            <Search size={18} className="text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Modül, sayfa, mod veya komut ara... (örn: Personel, Focus, Glass)"
              className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-neutral-500 outline-none"
            />
            <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-white/10 px-2 py-0.5 rounded-md">
              <Command size={11} />
              <span>K</span>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/5">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Sonuç bulunamadı. Başka bir arama terimi deneyin.
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-focus-main text-white shadow-sm'
                        : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-400'
                        }`}
                      >
                        <IconComponent size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate flex items-center gap-2">
                          {item.title}
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-black/30 text-white'
                                : 'bg-white/10 text-neutral-400'
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>
                        {item.description && (
                          <div
                            className={`text-xs truncate ${
                              isSelected ? 'text-white/80' : 'text-neutral-400'
                            }`}
                          >
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <ArrowRight
                      size={14}
                      className={`shrink-0 ml-2 transition-transform ${
                        isSelected ? 'translate-x-0.5 opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className="px-4 py-2 bg-neutral-950/80 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-3">
              <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> Gezin</span>
              <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> Seç</span>
              <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> Kapat</span>
            </div>
            <span className="text-[10px] text-neutral-500">ApexOS Navigation Layer</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
