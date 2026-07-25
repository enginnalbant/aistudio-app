import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookText, Plus, Search, Star, BookOpen, FileText, Send, Sparkles, 
  Paperclip, Mic, Globe, Cpu, RefreshCw, Trash2, Edit3, ArrowLeft, 
  Radio, CheckCircle, HelpCircle, FileCheck, Network, Download, Tag, X, Volume2, Play, Pause, Link as LinkIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Notebook, NotebookPage, NotebookSource, NotebookSynthesis, CustomGraphLink, Memo } from './types';
import { INITIAL_NOTEBOOKS, INITIAL_NOTE_CATEGORIES, INITIAL_MEMOS } from './initialData';
import { KnowledgeGraphModal } from './KnowledgeGraphModal';
import { LinkManagerModal } from './LinkManagerModal';

export const NotesNotebook: React.FC = () => {
  // Persistence in localStorage
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    const saved = localStorage.getItem('apex_notebooks_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_NOTEBOOKS;
  });

  // Memos and Custom Graph Links Persistence
  const [memos] = useState<Memo[]>(() => {
    const saved = localStorage.getItem('apex_memos_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_MEMOS;
  });

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

  // Selected active notebook state
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'sources' | 'ai_studio' | 'graph'>('pages');
  const [activePageId, setActivePageId] = useState<string | null>(null);

  // Filters & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [isNewSourceOpen, setIsNewSourceOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  // New Notebook Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Yazılım & AI');

  // New Source Form
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceType, setSourceType] = useState<'pdf' | 'web' | 'text'>('web');
  const [sourceSnippet, setSourceSnippet] = useState('');

  // AI Chat & Synthesis State
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [audioOverviewPlaying, setAudioOverviewPlaying] = useState(false);

  // Page Editing
  const activeNotebook = useMemo(() => notebooks.find(n => n.id === activeNotebookId), [notebooks, activeNotebookId]);
  const activePage = useMemo(() => activeNotebook?.pages.find(p => p.id === activePageId) || activeNotebook?.pages[0], [activeNotebook, activePageId]);

  // Handle Create Notebook
  const handleCreateNotebook = () => {
    if (!newTitle.trim()) return;

    const newNb: Notebook = {
      id: `nb-${Date.now()}`,
      title: newTitle,
      description: newDesc || 'Yeni detaylı not defteri.',
      category: newCategory,
      coverColor: 'from-blue-600 to-indigo-900',
      icon: 'BookOpen',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: `page-${Date.now()}`,
          title: 'Giriş & Genel Bakış',
          content: '### Yeni Defter Sayfası\n\nBuraya detaylı notlarınızı, ders içeriklerinizi ve araştırmalarınızı ekleyebilirsiniz.',
          tags: ['giriş'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readTimeMinutes: 2
        }
      ],
      sources: [],
      syntheses: []
    };

    setNotebooks(prev => [newNb, ...prev]);
    setActiveNotebookId(newNb.id);
    setActivePageId(newNb.pages[0].id);
    setIsNewNotebookOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  // Add Page to Active Notebook
  const handleAddPage = () => {
    if (!activeNotebook) return;
    const newPage: NotebookPage = {
      id: `page-${Date.now()}`,
      title: `Yeni Sayfa ${activeNotebook.pages.length + 1}`,
      content: '### Yeni Konu\n\nNotlarınızı buraya ekleyin.',
      tags: ['notlar'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTimeMinutes: 1
    };

    setNotebooks(prev => prev.map(nb => nb.id === activeNotebook.id ? {
      ...nb,
      pages: [...nb.pages, newPage],
      updatedAt: new Date().toISOString()
    } : nb));

    setActivePageId(newPage.id);
  };

  // Save Page Edits
  const handleUpdatePageContent = (newContent: string) => {
    if (!activeNotebook || !activePage) return;
    setNotebooks(prev => prev.map(nb => nb.id === activeNotebook.id ? {
      ...nb,
      pages: nb.pages.map(p => p.id === activePage.id ? {
        ...p,
        content: newContent,
        updatedAt: new Date().toISOString()
      } : p)
    } : nb));
  };

  // Add Source to Active Notebook
  const handleAddSource = () => {
    if (!activeNotebook || !sourceTitle.trim()) return;
    const newSrc: NotebookSource = {
      id: `src-${Date.now()}`,
      title: sourceTitle,
      type: sourceType,
      contentSnippet: sourceSnippet || 'Kaynak metin alıntısı.',
      addedAt: new Date().toISOString()
    };

    setNotebooks(prev => prev.map(nb => nb.id === activeNotebook.id ? {
      ...nb,
      sources: [...nb.sources, newSrc],
      updatedAt: new Date().toISOString()
    } : nb));

    setIsNewSourceOpen(false);
    setSourceTitle('');
    setSourceSnippet('');
  };

  // Send AI Chat Query (NotebookLM Q&A)
  const handleSendAiChat = async () => {
    if (!aiChatQuery.trim() || !activeNotebook) return;

    const userMessage = aiChatQuery;
    setAiChatQuery('');
    setAiChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/notes/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          contextNotes: activeNotebook.pages,
          notebookTitle: activeNotebook.title
        })
      });

      const data = await res.json();
      setAiChatHistory(prev => [...prev, { role: 'assistant', text: data.answer || "Yanıt alınamadı." }]);
    } catch (e: any) {
      setAiChatHistory(prev => [...prev, { role: 'assistant', text: "Hata oluştu: " + e.message }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate 1-Click Synthesis (Study Guide / Podcast / Summary)
  const handleGenerateSynthesis = async (type: 'summary' | 'study_guide' | 'podcast' | 'faq') => {
    if (!activeNotebook) return;
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/notes/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          notebookTitle: activeNotebook.title,
          pages: activeNotebook.pages,
          sources: activeNotebook.sources
        })
      });

      const data = await res.json();
      if (data.synthesis) {
        const titleMap = {
          summary: 'Yönetici Özeti',
          study_guide: 'Çalışma & Sınav Rehberi',
          podcast: '🎙️ Sesli Genel Bakış (Podcast Senaryosu)',
          faq: 'Sıkça Sorulan Sorular (FAQ)'
        };

        const newSyn: NotebookSynthesis = {
          id: `syn-${Date.now()}`,
          type,
          title: titleMap[type],
          content: data.synthesis,
          createdAt: new Date().toISOString()
        };

        setNotebooks(prev => prev.map(nb => nb.id === activeNotebook.id ? {
          ...nb,
          syntheses: [newSyn, ...nb.syntheses]
        } : nb));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* GALLERY VIEW: When no notebook is selected */}
      {!activeNotebook ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-600/20 via-violet-600/10 to-transparent border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <BookText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
                  Not Defteri & Derin Bilgi
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Open Notebooks Style
                  </span>
                </h1>
                <p className="text-xs text-text-secondary mt-0.5">Konulara özel çok sayfalı defterler oluşturun, kaynaklar yükleyin ve Gemini ile akıllı sentezler yapın.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsGraphOpen(true)}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Network size={16} className="text-indigo-400" />
                <span>Zihin Haritası</span>
              </button>

              <button 
                onClick={() => setIsNewNotebookOpen(true)}
                className="py-2.5 px-5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Yeni Defter</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/60 p-3.5 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                type="text"
                placeholder="Defterler arasında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  selectedCategory === null ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/5 border-white/10 text-text-secondary'
                }`}
              >
                Tüm Defterler
              </button>
              {INITIAL_NOTE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.name ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/5 border-white/10 text-text-secondary hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notebooks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks
              .filter(nb => !selectedCategory || nb.category === selectedCategory)
              .filter(nb => !searchQuery || nb.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((nb) => (
                <motion.div 
                  key={nb.id}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    setActiveNotebookId(nb.id);
                    setActivePageId(nb.pages[0]?.id || null);
                  }}
                  className="bg-neutral-900/80 border border-white/10 hover:border-indigo-500/50 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group flex flex-col justify-between transition-all backdrop-blur-xl"
                >
                  {/* Top Cover Strip */}
                  <div className={`h-24 bg-gradient-to-r ${nb.coverColor} p-4 flex items-start justify-between relative overflow-hidden`}>
                    <div className="w-10 h-10 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                      <BookOpen size={20} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/40 text-white px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                      {nb.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{nb.title}</h3>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">{nb.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-text-secondary font-mono">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FileText size={13} className="text-indigo-400" /> {nb.pages.length} Sayfa
                        </span>
                        <span className="flex items-center gap-1">
                          <Paperclip size={13} className="text-amber-400" /> {nb.sources.length} Kaynak
                        </span>
                      </div>
                      <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                        Aç &rarr;
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      ) : (
        /* DETAILED NOTEBOOK STUDIO WORKSPACE VIEW */
        <div className="space-y-6">
          
          {/* Top Bar Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/80 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveNotebookId(null)}
                className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-2xl border border-white/10 transition-colors cursor-pointer"
                title="Defterlere Dön"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {activeNotebook.category}
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary">
                    Son güncelleme: {new Date(activeNotebook.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <h2 className="text-xl font-display font-black text-white mt-0.5">{activeNotebook.title}</h2>
              </div>
            </div>

            {/* Workspace Controls & Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setActiveLinkingSourceId(activeNotebook.id);
                  setIsLinkManagerOpen(true);
                }}
                className="py-2 px-3.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                title="Defter & Not Bağlantılarını Yapılandır"
              >
                <LinkIcon size={14} className="text-purple-400" />
                <span>Bağlantı Ayarları</span>
              </button>

              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 text-xs">
                {[
                  { id: 'pages', label: 'Sayfalar & Notlar', icon: <FileText size={14} /> },
                  { id: 'sources', label: 'Kaynaklar', icon: <Paperclip size={14} /> },
                  { id: 'ai_studio', label: 'AI Studio & Sentez', icon: <Sparkles size={14} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TAB 1: PAGES & DEEP NOTES */}
          {activeTab === 'pages' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
              
              {/* Pages Sidebar List */}
              <div className="lg:col-span-4 bg-neutral-900/80 border border-white/10 rounded-3xl p-4 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                      Sayfalar ({activeNotebook.pages.length})
                    </span>
                    <button 
                      onClick={handleAddPage}
                      className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={14} /> Sayfa Ekle
                    </button>
                  </div>

                  <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
                    {activeNotebook.pages.map((p) => {
                      const isSelected = p.id === activePage?.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setActivePageId(p.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-1 ${
                            isSelected 
                              ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md' 
                              : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <h4 className="text-xs font-bold truncate">{p.title}</h4>
                          <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono">
                            <span>{p.readTimeMinutes} dk okuma</span>
                            <span>{p.tags.slice(0, 2).map(t => `#${t}`).join(' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Main Active Page Content Reader/Editor */}
              <div className="lg:col-span-8 bg-neutral-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 backdrop-blur-xl">
                {activePage ? (
                  <div className="space-y-4 flex-1">
                    {/* Page Title Input */}
                    <input 
                      type="text"
                      value={activePage.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setNotebooks(prev => prev.map(nb => nb.id === activeNotebook.id ? {
                          ...nb,
                          pages: nb.pages.map(p => p.id === activePage.id ? { ...p, title: newTitle } : p)
                        } : nb));
                      }}
                      className="w-full bg-transparent text-xl font-display font-black text-white focus:outline-none border-b border-white/10 pb-2"
                      placeholder="Sayfa Başlığı..."
                    />

                    {/* Content Markdown Area */}
                    <textarea 
                      value={activePage.content}
                      onChange={(e) => handleUpdatePageContent(e.target.value)}
                      rows={16}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-sm text-skel-glass leading-relaxed focus:outline-none focus:border-indigo-500/50 resize-y font-mono"
                      placeholder="Sayfa içeriğini yazın (Markdown desteklenir)..."
                    />

                    {/* Markdown Live Preview Section */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-skel-glass prose prose-invert max-w-none">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2 border-b border-white/5 pb-1">
                        Canlı Önizleme:
                      </div>
                      <ReactMarkdown>{activePage.content}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-text-secondary">Sayfa seçilmedi.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SOURCES & KNOWLEDGE BASE */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Kaynak Materyaller ({activeNotebook.sources.length})
                </h3>
                <button 
                  onClick={() => setIsNewSourceOpen(true)}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus size={14} /> Kaynak Ekle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeNotebook.sources.length === 0 ? (
                  <div className="col-span-2 text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl text-text-secondary text-xs">
                    Henüz eklenmiş kaynak materyal yok. Web makaleleri, PDF'ler veya metin alıntıları ekleyin.
                  </div>
                ) : (
                  activeNotebook.sources.map((src) => (
                    <div key={src.id} className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 space-y-2 shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Paperclip size={14} className="text-amber-400" /> {src.title}
                        </span>
                        <span className="text-[10px] font-mono bg-white/5 text-text-secondary px-2 py-0.5 rounded-full uppercase">
                          {src.type}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary bg-white/5 p-3 rounded-xl border border-white/5 italic">
                        "{src.contentSnippet}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AI NOTEBOOK STUDIO & SYNTHESIS (NotebookLM Style) */}
          {activeTab === 'ai_studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
              
              {/* Left Column: 1-Click Synthesis Generators */}
              <div className="lg:col-span-5 bg-neutral-900/80 border border-white/10 rounded-3xl p-5 space-y-5 shadow-2xl backdrop-blur-xl">
                <div className="space-y-1">
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" /> Otomatik AI Sentezleri
                  </h3>
                  <p className="text-xs text-text-secondary">Defterdeki tüm sayfaları ve kaynakları tek tıkla analiz edin.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'summary', title: 'Yönetici Özeti', desc: 'Ana bulgular ve stratejik noktalar', icon: <FileCheck size={16} /> },
                    { id: 'study_guide', title: 'Çalışma & Sınav Rehberi', desc: 'Soru-cevaplar ve kritik kavramlar', icon: <HelpCircle size={16} /> },
                    { id: 'podcast', title: '🎙️ Sesli Genel Bakış (Podcast)', desc: 'İki sunucu arasında sesli anlatım senaryosu', icon: <Radio size={16} /> },
                    { id: 'faq', title: 'Sıkça Sorulan Sorular', desc: 'Soru ve cevap listesi', icon: <HelpCircle size={16} /> }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => handleGenerateSynthesis(btn.id as any)}
                      disabled={isAiLoading}
                      className="p-3.5 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 rounded-2xl text-left transition-all cursor-pointer group flex items-start gap-3 disabled:opacity-50"
                    >
                      <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        {btn.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{btn.title}</h4>
                        <p className="text-[11px] text-text-secondary mt-0.5">{btn.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Generated Syntheses History */}
                {activeNotebook.syntheses.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase">Üretilen Sentezler:</h4>
                    <div className="space-y-2 overflow-y-auto max-h-48 pr-1 custom-scrollbar">
                      {activeNotebook.syntheses.map(s => (
                        <div key={s.id} className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-1">
                          <h5 className="text-xs font-bold text-white">{s.title}</h5>
                          <p className="text-[11px] text-text-secondary line-clamp-2">{s.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Q&A Chat Over Notebook */}
              <div className="lg:col-span-7 bg-neutral-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Defter Asistanı (Notebook Q&A)</h3>
                      <p className="text-[10px] text-text-secondary">Bu defterdeki {activeNotebook.pages.length} sayfa hakkında sorular sorun.</p>
                    </div>
                  </div>
                </div>

                {/* Chat Message History */}
                <div className="flex-1 overflow-y-auto space-y-3 p-2 min-h-[350px] max-h-[420px] custom-scrollbar">
                  {aiChatHistory.length === 0 ? (
                    <div className="text-center py-16 text-text-secondary space-y-2">
                      <Sparkles size={28} className="mx-auto text-indigo-400/50" />
                      <p className="text-xs max-w-xs mx-auto">Defterinizdeki notlarla ilgili Gemini modeline dilediğiniz soruyu sorabilirsiniz.</p>
                    </div>
                  ) : (
                    aiChatHistory.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white font-medium' 
                            : 'bg-white/5 border border-white/10 text-skel-glass prose prose-invert'
                        }`}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    ))
                  )}

                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-indigo-400 flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin" />
                        Defter analiz ediliyor...
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <input 
                    type="text"
                    value={aiChatQuery}
                    onChange={(e) => setAiChatQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAiChat()}
                    placeholder="Bu defterdeki notlar hakkında sorunuzu yazın..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-indigo-500/50"
                  />
                  <button 
                    onClick={handleSendAiChat}
                    disabled={isAiLoading || !aiChatQuery.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL: CREATE NEW NOTEBOOK */}
      {isNewNotebookOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[180] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookText size={18} className="text-indigo-400" /> Yeni Not Defteri Oluştur
              </h3>
              <button onClick={() => setIsNewNotebookOpen(false)} className="text-text-secondary hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Defter Başlığı</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: Yapay Zeka Mimarileri..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Açıklama</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Defter hakkında kısa açıklama..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Kategori</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  {INITIAL_NOTE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleCreateNotebook}
              disabled={!newTitle.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Defteri Oluştur
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD SOURCE */}
      {isNewSourceOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[180] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Paperclip size={18} className="text-amber-400" /> Kaynak Materyal Ekle
              </h3>
              <button onClick={() => setIsNewSourceOpen(false)} className="text-text-secondary hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Kaynak Başlığı</label>
                <input 
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="Örn: RAG Architecture Paper v2..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Tipi</label>
                <select 
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="web">Web Makalesi / URL</option>
                  <option value="pdf">PDF Dökümanı</option>
                  <option value="text">Ham Metin Notu</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-text-secondary block mb-1">Kaynak Metni / Alıntı Snippet</label>
                <textarea 
                  value={sourceSnippet}
                  onChange={(e) => setSourceSnippet(e.target.value)}
                  placeholder="Kaynaktan önemli alıntıları buraya yapıştırın..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>
            </div>

            <button 
              onClick={handleAddSource}
              disabled={!sourceTitle.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Kaynağı Ekle
            </button>
          </div>
        </div>
      )}

      {/* KNOWLEDGE GRAPH MODAL */}
      <KnowledgeGraphModal 
        isOpen={isGraphOpen} 
        onClose={() => setIsGraphOpen(false)}
        memos={memos}
        notebooks={notebooks}
      />

      {/* LINK MANAGER MODAL */}
      <LinkManagerModal
        isOpen={isLinkManagerOpen}
        onClose={() => setIsLinkManagerOpen(false)}
        memos={memos}
        notebooks={notebooks}
        customLinks={customLinks}
        onSaveLinks={(updated) => setCustomLinks(updated)}
        initialSourceId={activeLinkingSourceId}
        initialSourceType="notebook"
      />
    </div>
  );
};
