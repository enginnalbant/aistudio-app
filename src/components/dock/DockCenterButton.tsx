import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, AlertTriangle, CheckCircle, Search, HelpCircle, Command } from 'lucide-react';
import { AppShortcut } from './Dock';
import Fuse from 'fuse.js';
import { triggerHaptic } from './DockItem';

interface DockCenterButtonProps {
  onToggleAssistant: () => void;
  isOpen: boolean;
}

export const DockCenterButton: React.FC<DockCenterButtonProps> = ({
  onToggleAssistant,
  isOpen
}) => {
  return (
    <div className="relative shrink-0 px-1">
      <button
        onClick={() => {
          triggerHaptic('double');
          onToggleAssistant();
        }}
        className="group relative rounded-[22px] bg-gradient-to-tr from-focus-main via-focus-neon to-indigo-500 p-[2px] shadow-[0_8px_24px_rgba(112,161,255,0.4)] active:scale-90 transition-transform duration-300 flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13"
        title="APEX AI Launcher"
      >
        <div className="w-full h-full bg-neutral-950 rounded-[20px] flex items-center justify-center text-focus-neon group-hover:bg-transparent group-hover:text-black transition-colors duration-300 relative overflow-hidden">
          {/* Subtle pulse animation indicator */}
          <div className="absolute inset-0 bg-focus-neon/10 animate-ping opacity-30 rounded-[20px]" />
          <Zap size={22} className="fill-current animate-pulse relative z-10" />
        </div>
      </button>
    </div>
  );
};

interface AICommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppShortcut[];
  onSelectApp: (id: string) => void;
}

export const AICommandPalette: React.FC<AICommandPaletteProps> = ({
  isOpen,
  onClose,
  apps,
  onSelectApp
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Command palette keystroke listener (Ctrl+Space)
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        triggerHaptic('medium');
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isOpen, onClose]);

  // Fuse.js search option maps for fuzzy + semantic like results ("borç" -> "Giderler")
  const searchIndex = useMemo(() => {
    const records = apps.map(app => {
      let tags = [app.title, app.id, app.category];
      if (app.id.includes('income')) tags.push('maaş', 'kazanç', 'girdi', 'hakediş');
      if (app.id.includes('expense')) tags.push('borç', 'fatura', 'gider', 'kira', 'aidat', 'ödeme');
      if (app.id.includes('stocks')) tags.push('stok', 'sayım', 'tedarik', 'envanter', 'ürün');
      if (app.id.includes('todo')) tags.push('yapılacak', 'görev', 'takvim');
      if (app.id.includes('contacts')) tags.push('cari', 'tedarikçi', 'müşteri', 'adres');
      return { ...app, tags };
    });

    return new Fuse(records, {
      keys: ['title', 'tags'],
      threshold: 0.35
    });
  }, [apps]);

  const results = useMemo(() => {
    if (!query.trim()) return apps.slice(0, 5);
    return searchIndex.search(query).map(r => r.item);
  }, [query, apps, searchIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-neutral-950/98 border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl p-4 overflow-hidden flex flex-col max-h-[70vh] z-10"
      >
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Command className="text-focus-neon" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sistem komutu veya sayfa adı yazın... (örn: borç, sayım)"
            className="flex-1 bg-transparent text-sm text-white placeholder-text-secondary outline-none"
          />
          <span className="text-[10px] bg-white/10 text-text-secondary font-mono px-2 py-0.5 rounded-md hidden sm:inline">Ctrl+Space</span>
        </div>

        {/* Dynamic Command Results Grid */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 max-h-[50vh] no-scrollbar">
          {results.length > 0 ? (
            results.map((app, idx) => (
              <button
                key={`palette-${app.id}`}
                onClick={() => {
                  triggerHaptic('success');
                  onSelectApp(app.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${app.color} text-white`}>
                    {app.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{app.title}</div>
                    <div className="text-[9px] text-text-secondary uppercase font-semibold">{app.category}</div>
                  </div>
                </div>
                <div className="text-[10px] text-focus-neon bg-focus-neon/10 px-2 py-0.5 rounded-full font-mono">Çalıştır</div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-text-secondary">
              <HelpCircle size={32} className="mb-2 text-white/30" />
              <span className="text-xs">Komut bulunamadı. Lütfen başka bir anahtar kelime deneyin.</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
