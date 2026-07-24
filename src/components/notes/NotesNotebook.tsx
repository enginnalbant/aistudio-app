import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookText,
  FolderPlus,
  FilePlus,
  FileText,
  ChevronRight,
  ChevronDown,
  Edit3,
  Trash2,
  Plus,
  Check,
  X,
  Sparkles,
  Loader2,
  ArrowLeft,
  Clock,
  BookOpen,
  Maximize2,
  Minimize2,
  Save,
  Link2,
  Globe,
  ExternalLink,
  Bold,
  Italic,
  Heading,
  Code,
  List,
  Quote,
  CheckSquare,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { geminiService } from '../../services/geminiService';

interface Notebook {
  id: string;
  title: string;
  color: 'amber' | 'rose' | 'emerald' | 'blue' | 'violet';
  createdAt: string;
}

interface Note {
  id: string;
  notebookId: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  isBookmarked: boolean;
}

const COLOR_MAP = {
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/15',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/15',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/15',
};

export function NotesNotebook() {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useLocalStorage<Notebook[]>('apex_notebooks', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('apex_notebook_notes', []);
  const [isLoading, setIsLoading] = useState(false);

  // Selected state
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Creation state
  const [isCreateNotebookOpen, setIsCreateNotebookOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState<'amber' | 'rose' | 'emerald' | 'blue' | 'violet'>('blue');

  // New Note state
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Genel');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // AI Assistant state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Graph system state
  const [showGraph, setShowGraph] = useState(false);

  const activeNotes = useMemo(() => {
    return notes.filter(n => n.notebookId === selectedNotebookId);
  }, [notes, selectedNotebookId]);

  const selectedNotebook = useMemo(() => {
    return notebooks.find(nb => nb.id === selectedNotebookId);
  }, [notebooks, selectedNotebookId]);

  const createNotebook = () => {
    if (!newNotebookTitle.trim()) return;
    const newNB: Notebook = {
      id: crypto.randomUUID(),
      title: newNotebookTitle.trim(),
      color: newNotebookColor,
      createdAt: new Date().toISOString()
    };
    setNotebooks(prev => [newNB, ...prev]);
    setNewNotebookTitle('');
    setIsCreateNotebookOpen(false);
  };

  const deleteNotebook = (id: string) => {
    setNotebooks(prev => prev.filter(nb => nb.id !== id));
    setNotes(prev => prev.filter(n => n.notebookId !== id));
    if (selectedNotebookId === id) {
      setSelectedNotebookId(null);
      setSelectedNote(null);
    }
  };

  const createNote = () => {
    if (!newNoteTitle.trim() || !selectedNotebookId) return;
    const newN: Note = {
      id: crypto.randomUUID(),
      notebookId: selectedNotebookId,
      title: newNoteTitle.trim(),
      content: '',
      category: newNoteCategory,
      createdAt: new Date().toISOString(),
      isBookmarked: false
    };
    setNotes(prev => [newN, ...prev]);
    setNewNoteTitle('');
    setIsCreateNoteOpen(false);
    setSelectedNote(newN);
    setIsEditing(true);
    setEditTitle(newN.title);
    setEditContent('');
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;
    const updated = {
      ...selectedNote,
      title: editTitle,
      content: editContent
    };
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updated : n));
    setSelectedNote(updated);
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  // AI integration on Notebook
  const handleAskAiAboutNote = async () => {
    if (!selectedNote || !editContent.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const prompt = `Lütfen aşağıdaki "${editTitle}" başlıklı notu özetle, ana fikirlerini çıkar ve varsa yapılacaklar listesi (todo) öner.\n\nNot İçeriği:\n${editContent}`;
      const response = await geminiService.generateSummary(prompt);
      setAiResponse(response);
    } catch (err: any) {
      setAiResponse(`Yapay Zeka Hatası: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // SVG Graph System
  const graphNodes = useMemo(() => {
    const nodes: { id: string; label: string; group: 'notebook' | 'note'; color: string }[] = [];
    const links: { source: string; target: string }[] = [];

    notebooks.forEach(nb => {
      nodes.push({ id: nb.id, label: nb.title, group: 'notebook', color: '#ec4899' });
    });

    notes.forEach(n => {
      nodes.push({ id: n.id, label: n.title, group: 'note', color: '#10b981' });
      links.push({ source: n.notebookId, target: n.id });
    });

    return { nodes, links };
  }, [notebooks, notes]);

  return (
    <div className="p-3 lg:p-6 bento-card border-skel-metal/10 bg-skel-space/30 backdrop-blur-xl h-full min-h-[500px] flex flex-col gap-6">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <BookText className="text-pink-400 animate-pulse" size={24} />
            KİŞİSEL NOT DEFTERİ (OPEN NOTEBOOK)
          </h1>
          <p className="text-text-secondary opacity-60 text-xs font-mono uppercase tracking-widest mt-1">
            Hiyerarşik Defterler, Kategoriler ve AI Destekli Uzun Not Altyapısı
          </p>
        </div>

        <button
          onClick={() => setShowGraph(prev => !prev)}
          className={`px-4 py-2 rounded-xl border font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            showGraph ? 'bg-pink-500/20 border-pink-500/40 text-pink-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <Network size={14} />
          İlişki Ağacı (Graph)
        </button>
      </div>

      {/* Relation Graph */}
      <AnimatePresence>
        {showGraph && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/30 border border-white/5 rounded-2xl p-4 overflow-hidden relative"
          >
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Network size={12} className="text-pink-400" />
              Klasör ve Not Bağlantı Haritası
            </span>
            <div className="w-full h-56 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
              {graphNodes.nodes.length === 0 ? (
                <span className="text-xs text-text-secondary/50 italic">Bağlantı haritası için en az bir defter ve not olmalıdır.</span>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 800 250">
                  {/* Links */}
                  {graphNodes.links.map((link, idx) => {
                    const srcNodeIdx = graphNodes.nodes.findIndex(n => n.id === link.source);
                    const tgtNodeIdx = graphNodes.nodes.findIndex(n => n.id === link.target);
                    if (srcNodeIdx === -1 || tgtNodeIdx === -1) return null;

                    const x1 = 100 + (srcNodeIdx * 75) % 600;
                    const y1 = 40 + (srcNodeIdx * 25) % 150;
                    const x2 = 100 + (tgtNodeIdx * 75) % 600;
                    const y2 = 40 + (tgtNodeIdx * 25) % 150;

                    return (
                      <line
                        key={`link-${idx}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#ffffff"
                        strokeOpacity="0.1"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {graphNodes.nodes.map((node, idx) => {
                    const x = 100 + (idx * 75) % 600;
                    const y = 40 + (idx * 25) % 150;
                    const isNotebook = node.group === 'notebook';

                    return (
                      <g key={node.id} className="cursor-pointer group">
                        <circle
                          cx={x}
                          cy={y}
                          r={isNotebook ? 8 : 5}
                          fill={node.color}
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="monospace"
                          className="opacity-50 group-hover:opacity-100"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1 min-h-[400px]">

        {/* Left Side: Folder & Defter listesi */}
        <div className="md:col-span-3 space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-text-secondary uppercase font-bold">Defterler</span>
            <button
              onClick={() => setIsCreateNotebookOpen(prev => !prev)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              <FolderPlus size={14} />
            </button>
          </div>

          {/* Create Notebook Form */}
          {isCreateNotebookOpen && (
            <div className="space-y-2.5 p-3 bg-black/20 rounded-xl border border-white/5">
              <input
                type="text"
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                placeholder="Defter Başlığı..."
                className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={createNotebook}
                className="w-full py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-mono text-[10px] uppercase font-bold rounded-lg transition-all"
              >
                Oluştur
              </button>
            </div>
          )}

          {/* Notebooks loop */}
          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            {notebooks.length === 0 ? (
              <span className="text-xs text-text-secondary/40 italic block text-center py-4">Henüz defter oluşturulmadı.</span>
            ) : (
              notebooks.map(nb => (
                <div
                  key={nb.id}
                  onClick={() => {
                    setSelectedNotebookId(nb.id);
                    setSelectedNote(null);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                    selectedNotebookId === nb.id ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-black/10 border-white/5 text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs font-bold truncate">{nb.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotebook(nb.id);
                    }}
                    className="p-1 text-text-secondary hover:text-rose-500 rounded transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center: Active notebook notes */}
        <div className="md:col-span-3 space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-text-secondary uppercase font-bold">Notlar</span>
            {selectedNotebookId && (
              <button
                onClick={() => setIsCreateNoteOpen(prev => !prev)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                <FilePlus size={14} />
              </button>
            )}
          </div>

          {/* Create Note modal */}
          {isCreateNoteOpen && (
            <div className="space-y-2.5 p-3 bg-black/20 rounded-xl border border-white/5">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Not Başlığı..."
                className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={createNote}
                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[10px] uppercase font-bold rounded-lg transition-all"
              >
                Ekle
              </button>
            </div>
          )}

          {/* Active notes list */}
          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            {!selectedNotebookId ? (
              <span className="text-xs text-text-secondary/40 italic block text-center py-4">Lütfen sol listeden bir defter seçin.</span>
            ) : activeNotes.length === 0 ? (
              <span className="text-xs text-text-secondary/40 italic block text-center py-4">Bu defter henüz boş.</span>
            ) : (
              activeNotes.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    setSelectedNote(n);
                    setIsEditing(false);
                    setEditTitle(n.title);
                    setEditContent(n.content);
                  }}
                  className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                    selectedNote?.id === n.id ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-black/10 border-white/5 text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs font-bold truncate">{n.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(n.id);
                    }}
                    className="p-1 text-text-secondary hover:text-rose-500 rounded transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Selected note viewer & editor with AI and Markdown */}
        <div className="md:col-span-6 space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex flex-col">
          {!selectedNote ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-secondary/40 italic text-xs">
              <BookOpen size={24} className="mb-2" />
              Bir not seçerek görüntüleyin, düzenleyin ve AI asistanını çalıştırın.
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {/* Toolbar */}
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-secondary">Seçili Not:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-black/45 border border-white/5 rounded px-2 py-0.5 text-xs text-white font-bold outline-none"
                    />
                  ) : (
                    <span className="text-xs text-white font-black uppercase">{selectedNote.title}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-mono uppercase"
                    >
                      Kaydet
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-mono uppercase border border-white/10"
                    >
                      Düzenle
                    </button>
                  )}

                  <button
                    onClick={handleAskAiAboutNote}
                    disabled={isAiLoading || !editContent.trim()}
                    className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30 rounded-lg text-[10px] font-mono uppercase flex items-center gap-1 disabled:opacity-40"
                  >
                    {isAiLoading ? <Loader2 className="animate-spin" size={10} /> : <Sparkles size={10} />}
                    AI Analiz
                  </button>
                </div>
              </div>

              {/* AI response panel */}
              {aiResponse && (
                <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl relative">
                  <button onClick={() => setAiResponse('')} className="absolute top-2 right-2 text-text-secondary hover:text-white">
                    <X size={12} />
                  </button>
                  <span className="text-[9px] font-mono text-pink-400 uppercase font-black block mb-1">AI Not Özeti</span>
                  <p className="text-[11px] text-text-primary leading-normal whitespace-pre-line">{aiResponse}</p>
                </div>
              )}

              {/* Editor/Viewer */}
              <div className="flex-1 flex flex-col">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Markdown formatında zengin notlar yazın..."
                    className="w-full flex-1 bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-text-primary leading-relaxed resize-none outline-none focus:border-emerald-500/30 font-mono"
                  />
                ) : (
                  <div className="flex-1 bg-black/10 rounded-xl p-4 text-xs text-text-primary leading-relaxed overflow-y-auto whitespace-pre-wrap font-mono border border-white/5">
                    {selectedNote.content || <span className="text-text-secondary/40 italic">Bu not henüz boş. Hemen düzenleyin...</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
