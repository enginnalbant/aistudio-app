import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Plus, Search, Tag, Filter, Pin, Image as ImageIcon, Mic, Paperclip, 
  Sparkles, Lock, Globe, Users, Heart, Bookmark, Trash2, Edit3, Share2, 
  Calendar, Check, X, Volume2, Play, Pause, ChevronDown, Network, MessageSquare, RefreshCw, FileText,
  History, RotateCcw, Clock, Layers, Palette, Eye, CheckSquare, Code, Bold, Italic, Quote, List, AlertCircle, Link as LinkIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Memo, MemoAttachment, MemoVersion, CustomGraphLink } from './types';
import { INITIAL_MEMOS, INITIAL_NOTE_CATEGORIES } from './initialData';
import { KnowledgeGraphModal } from './KnowledgeGraphModal';
import { LinkManagerModal } from './LinkManagerModal';

export const NotesQuickMemos: React.FC = () => {
  // Memos Persistence in localStorage
  const [memos, setMemos] = useState<Memo[]>(() => {
    const saved = localStorage.getItem('apex_memos_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_MEMOS;
  });

  // Notebooks for Graph Context
  const [notebooks, setNotebooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('apex_notebooks_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  // Categories State (allowing custom categories)
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('apex_note_categories_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_NOTE_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('apex_memos_v2', JSON.stringify(memos));
  }, [memos]);

  // Custom Graph Links Persistence
  const [customLinks, setCustomLinks] = useState<CustomGraphLink[]>(() => {
    const saved = localStorage.getItem('apex_custom_links_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'cl-1',
        sourceId: 'memo-101',
        targetId: 'nb-1',
        sourceType: 'memo',
        targetType: 'notebook',
        relation: 'APEX OS Defter Bağlantısı',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cl-2',
        sourceId: 'memo-102',
        targetId: 'memo-101',
        sourceType: 'memo',
        targetType: 'memo',
        relation: 'Strateji <-> Mimari Notu',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [isLinkManagerOpen, setIsLinkManagerOpen] = useState(false);
  const [activeLinkingSourceId, setActiveLinkingSourceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('apex_custom_links_v2', JSON.stringify(customLinks));
  }, [customLinks]);

  // Filters & Tabs State
  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'reminders' | 'audio' | 'archived'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMediaType, setFilterMediaType] = useState<'all' | 'image' | 'audio' | 'document'>('all');

  // New Memo Composer State
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Yazılım & AI');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'workspace'>('public');
  const [isPinned, setIsPinned] = useState(false);
  const [memoColor, setMemoColor] = useState<string>('amber');
  const [dueDate, setDueDate] = useState<string>('');
  const [attachments, setAttachments] = useState<MemoAttachment[]>([]);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Audio Playback State
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // AI Modal & Processing State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiModalMemo, setAiModalMemo] = useState<Memo | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Graph Modal State
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  // Edit & Versioning Modal State
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
  const [editColor, setEditColor] = useState('amber');
  const [editDueDate, setEditDueDate] = useState('');
  const [editChangeSummary, setEditChangeSummary] = useState('');

  // Version History Viewer Drawer State
  const [historyViewerMemo, setHistoryViewerMemo] = useState<Memo | null>(null);

  // New Category Creation Popover State
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#f59e0b');

  // Target Memo Ref for scrolling to selected memo from Graph
  const memoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Highlight memo when selected from Graph
  const [highlightedMemoId, setHighlightedMemoId] = useState<string | null>(null);

  const handleSelectMemoFromGraph = (memoId: string) => {
    setHighlightedMemoId(memoId);
    if (memoRefs.current[memoId]) {
      memoRefs.current[memoId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightedMemoId(null), 3000);
  };

  // Extract all unique tags across memos
  const allTagsWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    memos.forEach(m => {
      m.tags.forEach(t => {
        const clean = t.toLowerCase().replace('#', '');
        map.set(clean, (map.get(clean) || 0) + 1);
      });
    });
    return Array.from(map.entries()).map(([tag, count]) => ({ tag, count }));
  }, [memos]);

  // Filter Memos Stream
  const filteredMemos = useMemo(() => {
    return memos.filter(memo => {
      // Tab filters
      if (activeTab === 'pinned' && !memo.isPinned) return false;
      if (activeTab === 'reminders' && !memo.dueDate) return false;
      if (activeTab === 'audio' && !memo.audioMemo && !memo.attachments?.some(a => a.type === 'audio')) return false;
      if (activeTab === 'archived' && !memo.isArchived) return false;
      if (activeTab !== 'archived' && memo.isArchived) return false;

      if (selectedTag && !memo.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())) return false;
      if (selectedCategory && memo.category !== selectedCategory) return false;
      
      if (filterMediaType === 'image' && !memo.attachments?.some(a => a.type === 'image')) return false;
      if (filterMediaType === 'audio' && !memo.audioMemo && !memo.attachments?.some(a => a.type === 'audio')) return false;
      if (filterMediaType === 'document' && !memo.attachments?.some(a => a.type === 'document')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchContent = memo.content.toLowerCase().includes(q);
        const matchCategory = memo.category.toLowerCase().includes(q);
        const matchTag = memo.tags.some(t => t.toLowerCase().includes(q));
        return matchContent || matchCategory || matchTag;
      }

      return true;
    }).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [memos, activeTab, selectedTag, selectedCategory, searchQuery, filterMediaType]);

  // Insert Markdown Helpers in Composer
  const handleInsertMarkdown = (prefix: string, suffix: string = '') => {
    setContent(prev => `${prev}${prefix}örnek metin${suffix}`);
  };

  // Submit New Memo
  const handleCreateMemo = () => {
    if (!content.trim()) return;

    // Auto extract #tags from content text
    const extractedTags = (content.match(/#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]+/g) || [])
      .map(t => t.replace('#', '').toLowerCase());

    const initialVersion: MemoVersion = {
      versionId: `v1-${Date.now()}`,
      versionNumber: 1,
      content,
      category,
      tags: Array.from(new Set(extractedTags)),
      color: memoColor,
      updatedAt: new Date().toISOString(),
      changeSummary: 'İlk taslak oluşturuldu.'
    };

    const newMemo: Memo = {
      id: `memo-${Date.now()}`,
      content,
      tags: Array.from(new Set(extractedTags)),
      category,
      visibility,
      isPinned,
      isArchived: false,
      color: memoColor,
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      reactions: { likes: 0, bookmarks: 0 },
      versions: [initialVersion]
    };

    setMemos(prev => [newMemo, ...prev]);
    setContent('');
    setAttachments([]);
    setIsPinned(false);
    setDueDate('');
  };

  // Delete Memo
  const handleDeleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
  };

  // Toggle Pin Status
  const handleTogglePin = (id: string) => {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
  };

  // Toggle Archive Status
  const handleToggleArchive = (id: string) => {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, isArchived: !m.isArchived } : m));
  };

  // Toggle Bookmark Reaction
  const handleToggleBookmark = (id: string) => {
    setMemos(prev => prev.map(m => m.id === id ? { 
      ...m, 
      reactions: { ...m.reactions, bookmarks: m.reactions.bookmarks + 1 } 
    } : m));
  };

  // EDIT MEMO & RECORD VERSIONING HISTORY
  const handleOpenEditModal = (memo: Memo) => {
    setEditingMemo(memo);
    setEditContent(memo.content);
    setEditCategory(memo.category);
    setEditTagsInput(memo.tags.join(', '));
    setEditColor(memo.color || 'amber');
    setEditDueDate(memo.dueDate || '');
    setEditChangeSummary('');
  };

  const handleSaveMemoEdits = () => {
    if (!editingMemo || !editContent.trim()) return;

    const parsedTags = editTagsInput
      .split(',')
      .map(t => t.trim().replace('#', '').toLowerCase())
      .filter(Boolean);

    const currentVersions = editingMemo.versions || [];
    const nextVersionNum = currentVersions.length + 1;

    const newVersion: MemoVersion = {
      versionId: `v${nextVersionNum}-${Date.now()}`,
      versionNumber: nextVersionNum,
      content: editContent,
      category: editCategory,
      tags: parsedTags,
      color: editColor,
      updatedAt: new Date().toISOString(),
      changeSummary: editChangeSummary.trim() || `Revizyon #${nextVersionNum} kaydedildi.`
    };

    const updatedMemo: Memo = {
      ...editingMemo,
      content: editContent,
      category: editCategory,
      tags: parsedTags,
      color: editColor,
      dueDate: editDueDate || undefined,
      updatedAt: new Date().toISOString(),
      versions: [newVersion, ...currentVersions]
    };

    setMemos(prev => prev.map(m => m.id === editingMemo.id ? updatedMemo : m));
    setEditingMemo(null);
  };

  // RESTORE PAST MEMO VERSION
  const handleRestoreVersion = (memo: Memo, versionToRestore: MemoVersion) => {
    const currentVersions = memo.versions || [];
    const nextVersionNum = currentVersions.length + 1;

    const rollbackVersion: MemoVersion = {
      versionId: `v${nextVersionNum}-${Date.now()}`,
      versionNumber: nextVersionNum,
      content: versionToRestore.content,
      category: versionToRestore.category,
      tags: versionToRestore.tags,
      color: versionToRestore.color,
      updatedAt: new Date().toISOString(),
      changeSummary: `Versiyon #${versionToRestore.versionNumber} konumuna geri döndürüldü.`
    };

    const restoredMemo: Memo = {
      ...memo,
      content: versionToRestore.content,
      category: versionToRestore.category,
      tags: versionToRestore.tags,
      color: versionToRestore.color || memo.color,
      updatedAt: new Date().toISOString(),
      versions: [rollbackVersion, ...currentVersions]
    };

    setMemos(prev => prev.map(m => m.id === memo.id ? restoredMemo : m));
    setHistoryViewerMemo(restoredMemo);
  };

  // Create Custom Category
  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'Tag'
    };
    setCategories(prev => [...prev, newCat]);
    setCategory(newCat.name);
    setNewCatName('');
    setIsNewCatModalOpen(false);
  };

  // AI Enhancements Handlers
  const handleAiEnhanceComposer = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/notes/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, action: 'enhance' })
      });
      const data = await res.json();
      if (data.result) setContent(data.result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiAutoTag = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/notes/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, action: 'tags' })
      });
      const data = await res.json();
      if (data.result) setContent(prev => `${prev}\n\n${data.result}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick AI Actions on Individual Memos
  const handleQuickAiActionOnMemo = async (memo: Memo, actionType: 'summarize' | 'tasks' | 'translate') => {
    setAiModalMemo(memo);
    setAiAnalysisResult(null);
    setIsAiLoading(true);

    const promptText = 
      actionType === 'summarize' ? "Bu notu 3 maddelik net bir özet haline getir." :
      actionType === 'tasks' ? "Bu nottaki yapılacak işleri (to-do checklist) maddeler halinde çıkar." :
      "Bu notu profesyonel akıcı bir dille İngilizceye çevir.";

    try {
      const res = await fetch('/api/notes/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptText,
          contextNotes: [memo]
        })
      });
      const data = await res.json();
      setAiAnalysisResult(data.answer || "İşlem tamamlanamadı.");
    } catch (e: any) {
      setAiAnalysisResult("Yapay zeka hatası: " + e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Add Image Attachment Simulator
  const handleAddSampleImage = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop'
    ];
    const randomUrl = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    const newAtt: MemoAttachment = {
      id: `att-${Date.now()}`,
      name: `gorsel_${attachments.length + 1}.jpg`,
      type: 'image',
      url: randomUrl,
      size: '850 KB'
    };
    setAttachments(prev => [...prev, newAtt]);
  };

  // Record Voice Memo Simulation
  const handleSimulateVoiceRecording = () => {
    setIsRecordingAudio(true);
    setTimeout(() => {
      setIsRecordingAudio(false);
      const newAudioAtt: MemoAttachment = {
        id: `audio-${Date.now()}`,
        name: 'sesli_not_kaydı.ogg',
        type: 'audio',
        url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        duration: '00:45',
        size: '1.1 MB'
      };
      setAttachments(prev => [...prev, newAudioAtt]);
    }, 1800);
  };

  // Theme color maps for memo card highlights
  const memoThemeMap: Record<string, { border: string, bg: string, badge: string }> = {
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/[0.03]', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    indigo: { border: 'border-indigo-500/30', bg: 'bg-indigo-500/[0.03]', badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/[0.03]', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    rose: { border: 'border-rose-500/30', bg: 'bg-rose-500/[0.03]', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/[0.03]', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-3xl p-5 lg:p-6 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <Zap size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
              Hızlı Notlar & Micro-Memos
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Memos Pro v3.0
              </span>
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Aklınıza gelen fikirleri anında kaydedin, versiyonlayın ve zihin haritasında bağlayın.</p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsGraphOpen(true)}
            className="py-2.5 px-4 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-white border border-amber-500/30 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Network size={16} className="text-amber-400" />
            <span>Zihin Haritasını Aç</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Tüm Notlar', icon: Layers, count: memos.filter(m => !m.isArchived).length },
            { id: 'pinned', label: 'İğnelenenler', icon: Pin, count: memos.filter(m => m.isPinned && !m.isArchived).length },
            { id: 'reminders', label: 'Hatırlatıcılar', icon: Calendar, count: memos.filter(m => m.dueDate && !m.isArchived).length },
            { id: 'audio', label: 'Sesli Notlar', icon: Mic, count: memos.filter(m => (m.audioMemo || m.attachments?.some(a => a.type === 'audio')) && !m.isArchived).length },
            { id: 'archived', label: 'Arşiv', icon: Bookmark, count: memos.filter(m => m.isArchived).length }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  isActive 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/10' 
                    : 'bg-white/5 border-white/5 text-text-secondary hover:text-white hover:bg-white/10'
                }`}
              >
                <IconComp size={14} />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${isActive ? 'bg-amber-500/30 text-amber-300' : 'bg-white/10 text-text-secondary'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Category Add Button */}
        <button
          onClick={() => setIsNewCatModalOpen(true)}
          className="py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono text-text-secondary hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Main Grid Layout: Composer + Stream (Left/Center) & Filters/Tags (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Main Column: Composer and Memos Feed */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Memos Composer Box */}
          <div className="bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-4 lg:p-5 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} /> Yeni Hızlı Not Oluştur
              </span>

              {/* Composer Settings Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Selector */}
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white rounded-xl text-xs px-2.5 py-1 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name} className="bg-neutral-900 text-white">{c.name}</option>
                  ))}
                </select>

                {/* Color Theme Selector */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                  {['amber', 'indigo', 'emerald', 'rose', 'purple'].map(c => (
                    <button
                      key={c}
                      onClick={() => setMemoColor(c)}
                      className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                        c === 'amber' ? 'bg-amber-500' : c === 'indigo' ? 'bg-indigo-500' : c === 'emerald' ? 'bg-emerald-500' : c === 'rose' ? 'bg-rose-500' : 'bg-purple-500'
                      } ${memoColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                    />
                  ))}
                </div>

                {/* Visibility Toggle */}
                <button 
                  onClick={() => setVisibility(prev => prev === 'public' ? 'private' : prev === 'private' ? 'workspace' : 'public')}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-text-secondary hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  title="Erişim İzni"
                >
                  {visibility === 'public' ? <Globe size={14} className="text-emerald-400" /> :
                   visibility === 'private' ? <Lock size={14} className="text-rose-400" /> :
                   <Users size={14} className="text-amber-400" />}
                  <span className="text-[10px] uppercase font-mono font-bold hidden sm:inline">{visibility}</span>
                </button>

                {/* Live Preview Toggle */}
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`p-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                    isPreviewMode ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/5 border-white/10 text-text-secondary hover:text-white'
                  }`}
                  title="Markdown Önizleme"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>

            {/* Markdown Quick Formatting Helper Bar */}
            <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 p-1 rounded-xl overflow-x-auto text-xs text-text-secondary">
              <button onClick={() => handleInsertMarkdown('**', '**')} className="p-1 hover:bg-white/10 rounded hover:text-white" title="Kalın (Bold)"><Bold size={13} /></button>
              <button onClick={() => handleInsertMarkdown('*', '*')} className="p-1 hover:bg-white/10 rounded hover:text-white" title="İtalik"><Italic size={13} /></button>
              <button onClick={() => handleInsertMarkdown('`', '`')} className="p-1 hover:bg-white/10 rounded hover:text-white" title="Kod"><Code size={13} /></button>
              <button onClick={() => handleInsertMarkdown('\n- [ ] ')} className="p-1 hover:bg-white/10 rounded hover:text-white" title="Checklist"><CheckSquare size={13} /></button>
              <button onClick={() => handleInsertMarkdown('\n> ')} className="p-1 hover:bg-white/10 rounded hover:text-white" title="Alıntı"><Quote size={13} /></button>
              <button onClick={() => handleInsertMarkdown('\n- ')} className="p-1 hover:bg-white/10 rounded hover:text-white" title="Liste"><List size={13} /></button>
            </div>

            {/* Composer Textarea or Markdown Live Preview */}
            {isPreviewMode ? (
              <div className="min-h-[120px] bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-sm text-white prose prose-invert max-w-none">
                {content ? <ReactMarkdown>{content}</ReactMarkdown> : <span className="text-text-secondary italic">Henüz metin girilmedi...</span>}
              </div>
            ) : (
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Neler düşünüyorsun? (#etiket ekleyebilir, görseller, sesli notlar ve hatırlatıcı koyabilirsin)..."
                rows={4}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-sm text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-amber-500/50 resize-none font-sans leading-relaxed"
              />
            )}

            {/* Optional Reminder Date Picker */}
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Calendar size={14} className="text-amber-400" />
              <span>Hatırlatıcı Tarihi:</span>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/5 border border-white/10 text-white rounded-xl text-xs px-2.5 py-1 focus:outline-none font-mono cursor-pointer"
              />
              {dueDate && (
                <button onClick={() => setDueDate('')} className="text-rose-400 hover:underline text-[10px]">Temizle</button>
              )}
            </div>

            {/* Attached Media Previews */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachments.map((att) => (
                  <div key={att.id} className="relative group bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2 text-xs text-white">
                    {att.type === 'image' && <ImageIcon size={14} className="text-emerald-400" />}
                    {att.type === 'audio' && <Mic size={14} className="text-amber-400" />}
                    {att.type === 'document' && <Paperclip size={14} className="text-cyan-400" />}
                    <span className="truncate max-w-[120px] font-mono text-[11px]">{att.name}</span>
                    <button 
                      onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                      className="text-text-secondary hover:text-rose-400 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Composer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                {/* Media Upload Buttons */}
                <button 
                  onClick={handleAddSampleImage}
                  className="p-2 hover:bg-white/10 text-text-secondary hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                  title="Görsel Ekle"
                >
                  <ImageIcon size={16} />
                </button>

                <button 
                  onClick={handleSimulateVoiceRecording}
                  disabled={isRecordingAudio}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isRecordingAudio ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'hover:bg-white/10 text-text-secondary hover:text-amber-400'
                  }`}
                  title="Sesli Not Kaydet"
                >
                  <Mic size={16} />
                </button>

                <button 
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isPinned ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/10 text-text-secondary hover:text-white'
                  }`}
                  title="Üste İğnele"
                >
                  <Pin size={16} />
                </button>

                <div className="h-4 w-px bg-white/10 my-auto mx-1" />

                {/* AI Tools */}
                <button 
                  onClick={handleAiEnhanceComposer}
                  disabled={isAiLoading || !content.trim()}
                  className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Yapay Zeka ile Metni İyileştir"
                >
                  <Sparkles size={12} />
                  <span>AI İyileştir</span>
                </button>

                <button 
                  onClick={handleAiAutoTag}
                  disabled={isAiLoading || !content.trim()}
                  className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Otomatik Etiket Üret"
                >
                  <Tag size={12} />
                  <span>AI Etiket</span>
                </button>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleCreateMemo}
                disabled={!content.trim()}
                className="py-2 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>Kaydet</span>
              </button>
            </div>
          </div>

          {/* Search and Stream Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/40 p-3 rounded-2xl border border-white/5">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                type="text"
                placeholder="Notlarda ve etiketlerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <select 
                value={filterMediaType}
                onChange={(e) => setFilterMediaType(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl text-xs text-text-secondary hover:text-white px-2.5 py-1.5 focus:outline-none cursor-pointer font-mono"
              >
                <option value="all" className="bg-neutral-900 text-white">Tüm Medyalar</option>
                <option value="image" className="bg-neutral-900 text-white">Görseller</option>
                <option value="audio" className="bg-neutral-900 text-white">Sesli Notlar</option>
                <option value="document" className="bg-neutral-900 text-white">Dosyalar</option>
              </select>
            </div>
          </div>

          {/* Memos Stream List */}
          <div className="space-y-4">
            {filteredMemos.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl space-y-3">
                <Zap size={32} className="mx-auto text-amber-500/40" />
                <h4 className="text-sm font-bold text-white">Henüz not bulunamadı</h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">Arama kriterlerinize uygun not yok veya henüz yeni bir not oluşturmadınız.</p>
              </div>
            ) : (
              filteredMemos.map((memo) => {
                const theme = memoThemeMap[memo.color || 'amber'] || memoThemeMap.amber;
                const isHighlighted = highlightedMemoId === memo.id;

                return (
                  <motion.div 
                    key={memo.id}
                    ref={(el) => { memoRefs.current[memo.id] = el; }}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-neutral-900/80 border rounded-3xl p-4 lg:p-5 shadow-xl space-y-3 relative group transition-all backdrop-blur-md ${
                      isHighlighted ? 'ring-2 ring-amber-400 border-amber-400 scale-[1.01]' :
                      memo.isPinned ? `${theme.border} ${theme.bg}` : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Memo Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                          A
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">APEX User</span>
                            <span className="text-[10px] font-mono text-text-secondary">
                              {new Date(memo.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}>
                              {memo.category}
                            </span>
                            <span className="text-[9px] font-mono text-text-secondary bg-white/5 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
                              {memo.visibility === 'public' ? <Globe size={10} /> : memo.visibility === 'private' ? <Lock size={10} /> : <Users size={10} />}
                              {memo.visibility}
                            </span>

                            {/* Versioning Badge */}
                            {memo.versions && memo.versions.length > 1 && (
                              <button
                                onClick={() => setHistoryViewerMemo(memo)}
                                className="text-[9px] font-mono font-bold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                                title="Versiyon Geçmişini Gör"
                              >
                                <History size={10} />
                                <span>v{memo.versions.length} ({memo.versions.length} revizyon)</span>
                              </button>
                            )}

                            {/* Due Date Badge */}
                            {memo.dueDate && (
                              <span className="text-[9px] font-mono text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                                <Clock size={10} /> {new Date(memo.dueDate).toLocaleDateString('tr-TR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions Toolbar */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setActiveLinkingSourceId(memo.id);
                            setIsLinkManagerOpen(true);
                          }}
                          className="p-1.5 text-text-secondary hover:text-purple-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                          title="Defter veya Diğer Notlara Bağla"
                        >
                          <LinkIcon size={14} />
                        </button>

                        <button 
                          onClick={() => handleTogglePin(memo.id)}
                          className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                            memo.isPinned ? 'text-amber-400 bg-amber-500/15' : 'text-text-secondary hover:text-white hover:bg-white/5'
                          }`}
                          title={memo.isPinned ? "İğneyi Kaldır" : "Üste İğnele"}
                        >
                          <Pin size={14} />
                        </button>

                        <button 
                          onClick={() => handleOpenEditModal(memo)}
                          className="p-1.5 text-text-secondary hover:text-amber-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                          title="Notu Düzenle & Versiyonla"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button 
                          onClick={() => handleToggleArchive(memo.id)}
                          className="p-1.5 text-text-secondary hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                          title={memo.isArchived ? "Arşivden Çıkar" : "Arşive Kaldır"}
                        >
                          <Bookmark size={14} />
                        </button>

                        <button 
                          onClick={() => handleDeleteMemo(memo.id)}
                          className="p-1.5 text-text-secondary hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Memo Content Body */}
                    <div className="text-sm text-skel-glass leading-relaxed prose prose-invert max-w-none font-sans">
                      <ReactMarkdown>{memo.content}</ReactMarkdown>
                    </div>

                    {/* AI Smart Quick Actions Ribbon */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleQuickAiActionOnMemo(memo, 'summarize')}
                        className="px-2 py-0.5 bg-white/5 hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 text-text-secondary hover:text-amber-300 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles size={10} /> Özetle
                      </button>
                      <button
                        onClick={() => handleQuickAiActionOnMemo(memo, 'tasks')}
                        className="px-2 py-0.5 bg-white/5 hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/30 text-text-secondary hover:text-indigo-300 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckSquare size={10} /> Görevler Yap
                      </button>
                      <button
                        onClick={() => handleQuickAiActionOnMemo(memo, 'translate')}
                        className="px-2 py-0.5 bg-white/5 hover:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/30 text-text-secondary hover:text-emerald-300 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Globe size={10} /> Çevir
                      </button>
                    </div>

                    {/* Audio Player if Audio Memo attached */}
                    {memo.audioMemo && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setActiveAudioPlaying(activeAudioPlaying === memo.id ? null : memo.id)}
                            className="w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0"
                          >
                            {activeAudioPlaying === memo.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                          </button>
                          <div>
                            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <Mic size={13} /> Sesli Not Kaydı ({memo.audioMemo.duration})
                            </div>
                            {memo.audioMemo.transcript && (
                              <p className="text-[11px] text-text-secondary line-clamp-1 italic">{memo.audioMemo.transcript}</p>
                            )}
                          </div>
                        </div>

                        {/* Speed & Waveform Visualizer */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setPlaybackRate(prev => prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : prev === 1.5 ? 2 : 1)}
                            className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-mono font-bold cursor-pointer"
                          >
                            {playbackRate}x
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-1 bg-amber-400/70 rounded-full transition-all ${
                                  activeAudioPlaying === memo.id ? 'animate-pulse' : ''
                                }`}
                                style={{ height: `${8 + (i % 4) * 5}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Attachments Gallery */}
                    {memo.attachments && memo.attachments.some(a => a.type === 'image') && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {memo.attachments.filter(a => a.type === 'image').map((att) => (
                          <div key={att.id} className="relative rounded-2xl overflow-hidden border border-white/10 group/img max-h-48">
                            <img src={att.url} alt={att.name} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Document Attachment Badges */}
                    {memo.attachments && memo.attachments.some(a => a.type === 'document') && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {memo.attachments.filter(a => a.type === 'document').map((att) => (
                          <div key={att.id} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2 text-xs text-white">
                            <FileText size={16} className="text-cyan-400" />
                            <div>
                              <div className="font-mono text-xs font-bold">{att.name}</div>
                              <div className="text-[10px] text-text-secondary">{att.size}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Linked Elements Badges */}
                    {(() => {
                      const memoNodeId = `memo-${memo.id}`;
                      const relatedLinks = customLinks.filter(l => l.sourceId === memoNodeId || l.targetId === memoNodeId);
                      if (relatedLinks.length === 0) return null;

                      return (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
                          <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1">
                            <LinkIcon size={11} /> Bağlantılar ({relatedLinks.length}):
                          </span>
                          {relatedLinks.map(l => (
                            <button
                              key={l.id}
                              onClick={() => {
                                setActiveLinkingSourceId(memo.id);
                                setIsLinkManagerOpen(true);
                              }}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>{l.relation}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Tag Pills Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {memo.tags.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTag(t)}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/5 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-white/5 hover:border-amber-500/30 transition-colors cursor-pointer"
                          >
                            #{t.replace('#', '')}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-text-secondary">
                        <button 
                          onClick={() => handleToggleBookmark(memo.id)}
                          className="flex items-center gap-1 hover:text-amber-400 text-[11px] transition-colors cursor-pointer"
                        >
                          <Bookmark size={13} />
                          <span>{memo.reactions.bookmarks}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar: Tag Cloud & Category Navigation */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active Filter Clear Bar */}
          {(selectedTag || selectedCategory) && (
            <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-300">
              <span>
                Filtre: {selectedTag ? `#${selectedTag}` : selectedCategory}
              </span>
              <button 
                onClick={() => { setSelectedTag(null); setSelectedCategory(null); }}
                className="hover:text-white font-bold underline cursor-pointer"
              >
                Temizle
              </button>
            </div>
          )}

          {/* Tag Cloud Card */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <Tag size={16} className="text-amber-400" /> Etiket Bulutu (#Tags)
            </h3>

            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto custom-scrollbar">
              {allTagsWithCounts.map(({ tag, count }) => {
                const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSelected 
                        ? 'bg-amber-500 text-black font-black border-amber-400 shadow-lg shadow-amber-500/20' 
                        : 'bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border-white/5'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-text-secondary'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Navigation Card */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 space-y-3 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Filter size={16} className="text-indigo-400" /> Kategoriler
              </h3>
              <button 
                onClick={() => setIsNewCatModalOpen(true)}
                className="p-1 hover:bg-white/10 text-amber-400 rounded-lg text-xs"
                title="Kategori Ekle"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                  selectedCategory === null ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-text-secondary hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>Tüm Kategoriler</span>
                <span className="font-mono text-[10px] opacity-70">{memos.length}</span>
              </button>

              {categories.map((cat: any) => {
                const count = memos.filter(m => m.category === cat.name).length;
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-between border ${
                      isSelected ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-transparent border-transparent text-text-secondary hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-mono text-[10px] opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* EDIT MEMO MODAL WITH VERSIONING */}
      {editingMemo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[190] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 w-full max-w-2xl space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Edit3 size={18} /> Notu Düzenle & Versiyon Kaydet
              </div>
              <button 
                onClick={() => setEditingMemo(null)}
                className="p-1 text-text-secondary hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Not İçeriği (Markdown):</label>
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-text-secondary block mb-1">Kategori:</label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl text-xs p-2.5 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name} className="bg-neutral-900">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-text-secondary block mb-1">Etiketler (Virgülle ayırın):</label>
                  <input 
                    type="text"
                    value={editTagsInput}
                    onChange={(e) => setEditTagsInput(e.target.value)}
                    placeholder="react, ai, notlar"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl text-xs p-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-text-secondary block mb-1">Kart Tema Rengi:</label>
                  <select 
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl text-xs p-2.5 focus:outline-none"
                  >
                    <option value="amber" className="bg-neutral-900">Kehribar (Amber)</option>
                    <option value="indigo" className="bg-neutral-900">İndigo (Mavi)</option>
                    <option value="emerald" className="bg-neutral-900">Zümrüt (Yeşil)</option>
                    <option value="rose" className="bg-neutral-900">Gül (Kırmızı)</option>
                    <option value="purple" className="bg-neutral-900">Mor (Purple)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-text-secondary block mb-1">Hatırlatıcı Tarihi:</label>
                  <input 
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl text-xs p-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-amber-300 block mb-1">Revizyon Notu (Versiyonlama Açıklaması):</label>
                <input 
                  type="text"
                  value={editChangeSummary}
                  onChange={(e) => setEditChangeSummary(e.target.value)}
                  placeholder="Neleri değiştirdiniz? (örn: Başlık ve kod örneği güncellendi)"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl text-xs p-2.5 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button 
                onClick={() => setEditingMemo(null)}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-xs rounded-xl cursor-pointer"
              >
                İptal
              </button>
              <button 
                onClick={handleSaveMemoEdits}
                className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Check size={16} /> Değişiklikleri Kaydet & Revizyon Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY DRAWER / MODAL */}
      {historyViewerMemo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[190] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-indigo-500/40 rounded-3xl p-6 w-full max-w-3xl space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <History size={18} /> Not Versiyon Geçmişi & Revizyon Günlüğü
              </div>
              <button 
                onClick={() => setHistoryViewerMemo(null)}
                className="p-1 text-text-secondary hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {(historyViewerMemo.versions || []).map((ver) => (
                <div key={ver.versionId} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Versiyon #{ver.versionNumber}
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary">
                        {new Date(ver.updatedAt).toLocaleString('tr-TR')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRestoreVersion(historyViewerMemo, ver)}
                      className="py-1 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} /> Bu Versiyona Dön
                    </button>
                  </div>

                  <p className="text-xs text-amber-300 font-mono italic">
                    {ver.changeSummary || 'Revizyon kaydedildi.'}
                  </p>

                  <div className="bg-neutral-950 p-3 rounded-xl border border-white/5 text-xs text-skel-glass font-mono leading-relaxed">
                    <ReactMarkdown>{ver.content}</ReactMarkdown>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono">
                    <span>Kategori: {ver.category}</span>
                    <span>•</span>
                    <span>Etiketler: {ver.tags.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setHistoryViewerMemo(null)}
              className="w-full py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* NEW CATEGORY CREATION MODAL */}
      {isNewCatModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[195] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag size={16} className="text-amber-400" /> Yeni Kategori Ekle
              </h4>
              <button onClick={() => setIsNewCatModalOpen(false)} className="text-text-secondary hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Kategori Adı:</label>
                <input 
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Örn: Tasarım & UX"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl text-xs p-2.5 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Renk Tonu:</label>
                <input 
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-full h-10 bg-transparent cursor-pointer rounded-xl"
                />
              </div>
            </div>

            <button 
              onClick={handleCreateCategory}
              disabled={!newCatName.trim()}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
            >
              Oluştur & Kaydet
            </button>
          </div>
        </div>
      )}

      {/* AI Single Memo Action Modal */}
      {aiModalMemo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[180] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 w-full max-w-xl space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles size={18} /> Yapay Zeka Not Analizi
              </div>
              <button 
                onClick={() => setAiModalMemo(null)}
                className="p-1 text-text-secondary hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-xs text-text-secondary font-mono max-h-24 overflow-y-auto">
              <strong>Kaynak Not:</strong> {aiModalMemo.content}
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Gemini AI Yanıtı:</h5>
              {isAiLoading ? (
                <div className="py-8 text-center text-xs text-text-secondary flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-amber-400" />
                  İşleniyor...
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-white leading-relaxed prose prose-invert">
                  <ReactMarkdown>{aiAnalysisResult || ''}</ReactMarkdown>
                </div>
              )}
            </div>

            <button 
              onClick={() => setAiModalMemo(null)}
              className="w-full py-2 bg-amber-500 text-black font-bold text-xs rounded-xl cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Knowledge Graph Modal */}
      <KnowledgeGraphModal 
        isOpen={isGraphOpen} 
        onClose={() => setIsGraphOpen(false)}
        memos={memos}
        notebooks={notebooks}
        onSelectMemo={handleSelectMemoFromGraph}
      />

      {/* Link Manager Settings Modal */}
      <LinkManagerModal
        isOpen={isLinkManagerOpen}
        onClose={() => setIsLinkManagerOpen(false)}
        memos={memos}
        notebooks={notebooks}
        customLinks={customLinks}
        onSaveLinks={(updated) => setCustomLinks(updated)}
        initialSourceId={activeLinkingSourceId}
        initialSourceType="memo"
      />
    </div>
  );
};
