import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  Search, 
  X, 
  ChevronRight, 
  Command, 
  Star, 
  History, 
  Sparkles, 
  Globe, 
  Settings, 
  Layout, 
  User,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';

interface SearchItem {
  id: string;
  title: string;
  category: 'Modül' | 'Ayarlar' | 'Kullanıcı' | 'Komut' | 'AI' | 'Web';
  description?: string;
  action?: () => void;
  path?: string;
}

const appData: SearchItem[] = [
  { id: 'dashboard', title: 'Dashboard', category: 'Modül', description: 'Ana sistem paneli ve özet bilgiler.' },
  { id: 'analytics', title: 'Analiz', category: 'Modül', description: 'Veri görselleştirme ve raporlama araçları.' },
  { id: 'projects', title: 'Projeler', category: 'Modül', description: 'Aktif projeler ve görev yönetimi.' },
  { id: 'team', title: 'Ekip', category: 'Modül', description: 'Ekip üyeleri ve yetkilendirme.' },
  { id: 'settings', title: 'Sistem Ayarları', category: 'Ayarlar', description: 'Görünüm, güvenlik ve sistem tercihleri.' },
  { id: 'profile', title: 'Profil', category: 'Kullanıcı', description: 'Kişisel bilgiler ve hesap yönetimi.' },
  { id: 'cmd-theme', title: '/theme dark|light', category: 'Komut', description: 'Sistem temasını hızlıca değiştir.' },
  { id: 'cmd-logout', title: '/logout', category: 'Komut', description: 'Oturumu güvenli bir şekilde kapat.' },
  { id: 'cmd-clear', title: '/clear', category: 'Komut', description: 'Arama geçmişini temizle.' },
];

const fuse = new Fuse(appData, {
  keys: ['title', 'category', 'description'],
  threshold: 0.4,
});

interface SearchBarProps {
  onNavigate?: (path: string) => void;
}

export function SearchBar({ onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<SearchItem[]>('apex_recent_searches', []);
  const [favorites, setFavorites] = useLocalStorage<string[]>('apex_favorites', []);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);



  const results = useMemo(() => {
    if (!query) return [];
    
    // Command detection
    if (query.startsWith('/')) {
      return appData.filter(item => item.category === 'Komut' && (item.title || '').toLowerCase().includes(query.toLowerCase()));
    }

    return fuse.search(query).map(result => result.item);
  }, [query]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    // AI Search detection
    if (query.startsWith('?') || query.length > 20) {
      setIsAiLoading(true);
      setAiResult(null);
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.replace('?', '') }),
      });
      const data = await res.json();
      setAiResult(data.text);
      setIsAiLoading(false);
    } else if (query.startsWith('!')) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query.slice(1))}`, '_blank');
      setQuery('');
    }
  };

  const addToRecent = (item: SearchItem) => {
    const newRecent = [item, ...recentSearches.filter(i => i.id !== item.id)].slice(0, 5);
    setRecentSearches(newRecent);
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
  };

  const handleSelect = (item: SearchItem) => {
    addToRecent(item);
    if (item.category === 'Modül') {
      onNavigate?.(item.id);
    } else if (item.category === 'Ayarlar') {
      (window as any).openSettingsModal?.();
    } else if (item.category === 'Komut') {
      if (item.id === 'cmd-clear') {
        setRecentSearches([]);
      }
      // Diğer komutlar için mantık eklenebilir
    }
    setQuery('');
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Modül': return <Layout size={14} />;
      case 'Ayarlar': return <Settings size={14} />;
      case 'Kullanıcı': return <User size={14} />;
      case 'Komut': return <Terminal size={14} />;
      case 'AI': return <Sparkles size={14} />;
      case 'Web': return <Globe size={14} />;
      default: return <Search size={14} />;
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl mx-4">
      <form onSubmit={handleSearch} className="relative">
        <div className={`
          relative flex items-center bg-skel-matte/5 border rounded-xl transition-all duration-500 group
          ${isFocused ? 'border-focus-neon/50 bg-skel-matte/10 ring-4 ring-focus-neon/5' : 'border-skel-metal/10'}
        `}>
          <div className="absolute left-4 flex items-center gap-2">
            {query.startsWith('/') ? <Command size={16} className="text-focus-neon" /> :
             query.startsWith('?') ? <Sparkles size={16} className="text-ai-bright" /> :
             query.startsWith('!') ? <Globe size={16} className="text-grow-phosphor" /> :
             <Search size={16} className="text-text-secondary group-focus-within:text-focus-neon transition-colors" />}
          </div>
          
          <input
            type="text"
            placeholder="Sistemde ara, AI'a sor (?) veya komut gir (/)..."
            value={query}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3 pl-12 pr-12 text-sm text-text-primary outline-none placeholder:text-text-secondary/30 font-display"
          />

          <div className="absolute right-4 flex items-center gap-2">
            {query && (
              <button 
                type="button"
                onClick={() => { setQuery(''); setAiResult(null); }} 
                className="p-1 hover:bg-skel-matte/20 rounded-lg transition-colors"
              >
                <X size={14} className="text-text-secondary" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-skel-metal/20 bg-skel-matte/5 text-[10px] text-text-secondary font-mono">
              <Command size={10} /> K
            </div>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 mt-3 w-full bg-skel-space/95 backdrop-blur-3xl border border-skel-metal/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-[1002]"
          >
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
              {/* AI Result Section */}
              {isAiLoading && (
                <div className="p-8 flex flex-col items-center justify-center gap-3">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-ai-bright/20 border-t-ai-bright rounded-full"
                  />
                  <span className="text-[10px] label-mono animate-pulse">AI Düşünüyor...</span>
                </div>
              )}

              {aiResult && (
                <div className="m-2 p-4 rounded-xl bg-ai-bright/5 border border-ai-bright/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-ai-bright" />
                    <span className="text-[10px] label-mono text-ai-bright">AI Yanıtı</span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed">{aiResult}</p>
                </div>
              )}

              {/* Search Results */}
              {query && results.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-[10px] label-mono opacity-50">Sonuçlar</div>
                  {results.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelect(item);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-focus-neon/10 rounded-xl transition-all group text-left cursor-pointer outline-none focus:bg-focus-neon/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-skel-matte/5 flex items-center justify-center text-text-secondary group-hover:text-focus-neon transition-colors">
                          {getIcon(item.category)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-primary">{item.title}</span>
                          <span className="text-[10px] text-text-secondary truncate max-w-[300px]">{item.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={(e) => toggleFavorite(e, item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${favorites.includes(item.id) ? 'text-nrg-sun' : 'text-text-secondary/30 hover:text-nrg-sun'} relative z-10`}
                        >
                          <Star size={14} fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
                        </button>
                        <ChevronRight size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent & Favorites (When no query) */}
              {!query && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="px-4 py-2 flex items-center gap-2 text-[10px] label-mono opacity-50">
                        <History size={12} /> Son Aramalar
                      </div>
                      {recentSearches.map(item => (
                        <button
                          key={`recent-${item.id}`}
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-skel-matte/5 rounded-lg text-left group"
                        >
                          <div className="text-text-secondary/50 group-hover:text-focus-neon">{getIcon(item.category)}</div>
                          <span className="text-xs text-text-primary">{item.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <div className="px-4 py-2 flex items-center gap-2 text-[10px] label-mono opacity-50">
                      <Star size={12} /> Favoriler
                    </div>
                    {appData.filter(i => favorites.includes(i.id)).length > 0 ? (
                      appData.filter(i => favorites.includes(i.id)).map(item => (
                        <button
                          key={`fav-${item.id}`}
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-skel-matte/5 rounded-lg text-left group"
                        >
                          <div className="text-nrg-sun">{getIcon(item.category)}</div>
                          <span className="text-xs text-text-primary">{item.title}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-[10px] text-text-secondary/40 italic text-center">Favori henüz yok</div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions / Help */}
              {!query && (
                <div className="mt-4 border-t border-skel-metal/5 pt-4 pb-2 px-4">
                  <div className="text-[10px] label-mono opacity-50 mb-3">Hızlı İpuçları</div>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-skel-matte/5 border border-skel-metal/10 text-[10px] text-text-secondary flex items-center gap-2">
                      <span className="text-focus-neon font-bold">/</span> Komutlar
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-skel-matte/5 border border-skel-metal/10 text-[10px] text-text-secondary flex items-center gap-2">
                      <span className="text-ai-bright font-bold">?</span> AI Yardımı
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-skel-matte/5 border border-skel-metal/10 text-[10px] text-text-secondary flex items-center gap-2">
                      <span className="text-grow-phosphor font-bold">!</span> Web'de Ara
                    </div>
                  </div>
                </div>
              )}

              {query && results.length === 0 && !isAiLoading && !aiResult && (
                <div className="p-12 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-skel-matte/5 flex items-center justify-center text-text-secondary/20">
                    <Search size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Sonuç bulunamadı</p>
                    <p className="text-xs text-text-secondary mt-1">AI ile aramayı denemek için '?' ekleyin veya Enter'a basın.</p>
                  </div>
                  <button 
                    onClick={handleSearch}
                    className="os-btn os-btn-secondary py-2 text-xs"
                  >
                    <Sparkles size={14} className="text-ai-bright" /> AI'a Sor
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
