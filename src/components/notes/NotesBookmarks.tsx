import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  Star, 
  Trash2, 
  Plus, 
  Search, 
  Sparkles, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Loader2, 
  Download, 
  Folder, 
  Heart, 
  Filter, 
  ArrowUpDown, 
  FolderPlus, 
  Edit2, 
  Archive, 
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Play,
  RefreshCw,
  Clock,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  clickCount: number;
  notes: string;
  createdAt: string;
}

export const NotesBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkItem[]>('apex_bookmarks', []);
  const [isLoading, setIsLoading] = useState(false);

  // Form & Creation State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Genel');
  const [newNotes, setNewNotes] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'all' || b.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [bookmarks, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const list = new Set<string>();
    bookmarks.forEach(b => {
      if (b.category) list.add(b.category);
    });
    return Array.from(list);
  }, [bookmarks]);

  const addBookmark = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    
    // Add protocol if missing
    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newEntry: BookmarkItem = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      url: formattedUrl,
      category: newCategory,
      tags: newTags,
      isFavorite: false,
      clickCount: 0,
      notes: newNotes.trim(),
      createdAt: new Date().toISOString()
    };

    setBookmarks(prev => [newEntry, ...prev]);
    setIsAddOpen(false);
    setNewTitle('');
    setNewUrl('');
    setNewNotes('');
    setNewTags([]);
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const toggleFavorite = (item: BookmarkItem) => {
    setBookmarks(prev => prev.map(b => b.id === item.id ? { ...b, isFavorite: !b.isFavorite } : b));
  };

  const handleBookmarkClick = (item: BookmarkItem) => {
    setBookmarks(prev => prev.map(b => b.id === item.id ? { ...b, clickCount: (b.clickCount || 0) + 1 } : b));
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const addTag = () => {
    if (tagInput.trim() && !newTags.includes(tagInput.trim())) {
      setNewTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full min-h-[500px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-black text-text-primary uppercase tracking-tight">Yer İşaretlerim</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-focus-main hover:scale-105 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} /> Yeni Yer İşareti Ekle
        </button>
      </div>

      {isAddOpen && (
        <div className="p-5 border border-border/10 rounded-2xl bg-skel-matte/5 space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Başlık</label>
            <input
              type="text"
              placeholder="Site Başlığı"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-skel-matte/5 text-sm text-text-primary outline-none border border-border/10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">URL Adresi</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-skel-matte/5 text-sm text-text-primary outline-none border border-border/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Kategori</label>
              <input
                type="text"
                placeholder="Genel, İş, Eğlence vb."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-skel-matte/10 text-sm text-text-primary outline-none border border-border/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Notlar</label>
              <input
                type="text"
                placeholder="Açıklama veya kişisel not"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-skel-matte/10 text-sm text-text-primary outline-none border border-border/10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={addBookmark} className="flex-1 py-2.5 bg-focus-main text-white font-bold rounded-xl text-xs">Kaydet</button>
            <button onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 bg-skel-matte/20 rounded-xl text-text-secondary text-xs">İptal</button>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Yer işaretlerinde ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-skel-matte/5 outline-none border border-border/10 text-sm text-text-primary"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-skel-matte/10 outline-none border border-border/10 text-sm text-text-primary"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Bookmarks List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
        {filteredBookmarks.map(item => (
          <div
            key={item.id}
            className="p-5 bento-card flex flex-col justify-between gap-4 border border-border/20 hover:border-border/40 hover:scale-[1.01] transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe size={16} className="text-focus-neon shrink-0" />
                  <span className="text-sm font-bold text-text-primary truncate">
                    {item.title}
                  </span>
                </div>
                <button onClick={() => toggleFavorite(item)} className="text-text-secondary hover:text-focus-neon shrink-0">
                  <Star size={16} className={item.isFavorite ? 'fill-focus-neon text-focus-neon' : ''} />
                </button>
              </div>
              <p className="text-[11px] text-text-secondary font-mono truncate opacity-50 mt-1 pl-6">{item.url}</p>
              {item.notes && <p className="text-xs text-text-secondary mt-3 pl-6 opacity-75">{item.notes}</p>}
            </div>

            <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-1 pl-6">
              <span className="text-[10px] font-mono text-text-secondary opacity-60">
                Tıklama: {item.clickCount || 0}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBookmarkClick(item)}
                  className="p-1 rounded-lg bg-focus-main/10 text-focus-neon hover:bg-focus-main/20 transition-colors"
                  title="Siteye Git"
                >
                  <ExternalLink size={12} />
                </button>
                <button
                  onClick={() => deleteBookmark(item.id)}
                  className="p-1 rounded-lg bg-skel-matte/5 hover:bg-crit-pale hover:text-crit-vivid text-text-secondary transition-colors"
                  title="Sil"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NotesBookmarks;
