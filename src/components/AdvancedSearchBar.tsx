import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Command, Zap, Loader2, X, ChevronRight, LayoutDashboard, Briefcase, Package, Users, BarChart2, Calendar, Truck, ShoppingCart, DollarSign, Image, Activity, Settings, Bell, LogOut, RefreshCw, Plus, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STATIC_SEARCH_INDEX, buildFuseIndex, parseQueryPrefix, getRecentSearches, saveRecentSearch, SearchItem } from '../utils/searchUtils';
import { getAI } from '../services/aiConfig';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={16} />,
  Briefcase: <Briefcase size={16} />,
  Package: <Package size={16} />,
  Users: <Users size={16} />,
  BarChart2: <BarChart2 size={16} />,
  Calendar: <Calendar size={16} />,
  Truck: <Truck size={16} />,
  ShoppingCart: <ShoppingCart size={16} />,
  DollarSign: <DollarSign size={16} />,
  Image: <Image size={16} />,
  Activity: <Activity size={16} />,
  Settings: <Settings size={16} />,
  Bell: <Bell size={16} />,
  Plus: <Plus size={16} />,
  Moon: <Moon size={16} />,
  LogOut: <LogOut size={16} />,
  RefreshCw: <RefreshCw size={16} />,
};

interface AdvancedSearchBarProps {
  setActiveModule: (module: string) => void;
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ setActiveModule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fuse = useRef(buildFuseIndex(STATIC_SEARCH_INDEX));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      const recent = getRecentSearches();
      const defaultItems: SearchItem[] = [
        ...STATIC_SEARCH_INDEX.filter(i => ['stocks', 'jobs-dash', 'purchasing', 'reports', 'planner'].includes(i.id)),
        ...STATIC_SEARCH_INDEX.filter(i => ['cmd-new-job', 'cmd-new-stock', 'cmd-new-account'].includes(i.id))
      ];
      setResults(recent.length > 0 ? recent : defaultItems);
      setAiSuggestion(null);
      return;
    }

    setIsLoading(true);
    const { typeFilter, text } = parseQueryPrefix(searchQuery);
    let filteredResults = fuse.current.search(text).map(r => r.item);
    
    if (typeFilter) {
      filteredResults = filteredResults.filter(item => item.type === typeFilter);
    }
    
    setResults(filteredResults);

    if (searchQuery.length > 15 || searchQuery.endsWith('?')) {
      try {
        const ai = getAI();
        if (!ai) {
          console.warn('AI is not configured. Skipping suggestion.');
          setAiSuggestion(null);
          return;
        }
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analyze this query: "${searchQuery}". Provide a concise suggestion or answer for Nexus OS.`,
        });
        setAiSuggestion(response.text || null);
      } catch (error) {
        console.error('AI error:', error);
      }
    } else {
      setAiSuggestion(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => performSearch(query), 200);
    return () => clearTimeout(handler);
  }, [query, performSearch]);

  const handleSelect = (item: SearchItem) => {
    saveRecentSearch(item);
    setIsOpen(false);
    setQuery('');
    if (item.type === 'page') {
      setActiveModule(item.id);
    } else if (item.payload?.action) {
      window.dispatchEvent(new CustomEvent('nexus-command', { detail: item.payload.action }));
    }
  };

  const groupedResults = useMemo(() => {
    return results.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, SearchItem[]>);
  }, [results]);

  const ModalOverlay = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "linear" }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "linear" }}
            className="w-full max-w-2xl bg-[#050816]/95 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-700">
              <Search size={20} className="text-focus-neon" />
              <input 
                autoFocus
                type="text" 
                placeholder="Nexus OS içinde ara veya komut yaz..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="ml-3 bg-transparent border-none outline-none text-lg w-full text-white placeholder:text-slate-500"
              />
              <button onClick={() => setIsOpen(false)} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">ESC</button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {isLoading && <div className="p-4 text-center text-slate-500"><Loader2 className="animate-spin mx-auto" /></div>}
              
              {aiSuggestion && (
                <div className="p-4 mb-2 bg-focus-neon/10 rounded-lg border border-focus-neon/20">
                  <div className="text-xs font-bold text-focus-neon mb-1">AI Önerisi</div>
                  <div className="text-sm text-white">{aiSuggestion}</div>
                </div>
              )}

              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type} className="mb-4">
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{type}</div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-slate-800 rounded-md text-slate-400 group-hover:text-white">
                        {item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon] : <Command size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{item.title}</div>
                        {item.subtitle && <div className="text-xs text-slate-400">{item.subtitle}</div>}
                      </div>
                      <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase">{item.type}</span>
                      <ChevronRight size={16} className="text-slate-600" />
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700 text-[10px] text-slate-500 flex gap-4">
              <span><strong className="text-slate-300">↑↓</strong> Gezin</span>
              <span><strong className="text-slate-300">Enter</strong> Seç</span>
              <span><strong className="text-slate-300">ESC</strong> Kapat</span>
              <span><strong className="text-slate-300">cmd: page: stock:</strong> filtreleri</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center bg-skel-space/50 border border-skel-metal/10 rounded-xl px-5 py-2.5 w-80 group focus-within:border-focus-neon/40 focus-within:bg-skel-space/80 focus-within:ring-4 focus-within:ring-focus-neon/5 transition-all duration-500"
      >
        <Search size={18} className="text-text-secondary/40 group-focus-within:text-focus-neon transition-colors" />
        <span className="ml-3 text-sm text-text-secondary/30 font-bold tracking-tight">Ara veya komut yaz...</span>
        <span className="ml-auto text-[10px] bg-skel-metal/10 px-2 py-0.5 rounded text-text-secondary">Ctrl+K</span>
      </button>

      {createPortal(ModalOverlay, document.body)}
    </>
  );
};
