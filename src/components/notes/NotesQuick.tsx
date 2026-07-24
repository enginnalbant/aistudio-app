import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Zap,
  Search,
  Trash2,
  Pin,
  Check,
  Plus,
  Tag,
  Sparkles,
  Loader2,
  X,
  Square,
  CheckSquare,
  FileText,
  Bookmark,
  Link2,
  ExternalLink,
  Edit3,
  Heading,
  Bold,
  Italic,
  Code,
  List,
  Globe,
  MoreVertical,
  Paperclip,
  Mic,
  Calendar,
  Eye,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { geminiService } from '../../services/geminiService';

interface Attachment {
  name: string;
  type: 'image' | 'audio' | 'document';
  url: string; // Base64 data url for offline simulation
}

interface QuickNote {
  id: string;
  content: string;
  tags: string[];
  color: 'amber' | 'rose' | 'emerald' | 'blue' | 'violet';
  category: string;
  createdAt: string;
  isPinned?: boolean;
  attachments?: Attachment[];
}

const COLOR_MAP = {
  amber: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/15',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    solid: 'bg-amber-500'
  },
  rose: {
    bg: 'bg-rose-500/10 hover:bg-rose-500/15',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    solid: 'bg-rose-500'
  },
  emerald: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    solid: 'bg-emerald-500'
  },
  blue: {
    bg: 'bg-blue-500/10 hover:bg-blue-500/15',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    solid: 'bg-blue-500'
  },
  violet: {
    bg: 'bg-violet-500/10 hover:bg-violet-500/15',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    solid: 'bg-violet-500'
  }
};

const CATEGORIES = ['Düşünceler', 'Günlük', 'Fikirler', 'Kodlar', 'Diğer'];

export function NotesQuick() {
  const { user } = useAuth();
  const [memos, setMemos] = useLocalStorage<QuickNote[]>('apex_memos', []);
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<'amber' | 'rose' | 'emerald' | 'blue' | 'violet'>('blue');
  const [selectedCategory, setSelectedCategory] = useState('Düşünceler');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [showGraph, setShowGraph] = useState(false);

  // File attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-parse tags from content on change (e.g. #react #note)
  const parsedTags = useMemo(() => {
    const matches = content.match(/#\w+/g);
    return matches ? Array.from(new Set(matches.map(m => m.slice(1).toLowerCase()))) : [];
  }, [content]);

  // Handle file uploading and saving as base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        let type: 'image' | 'audio' | 'document' = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';

        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type,
            url: reader.result as string
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddMemo = () => {
    if (!content.trim() && attachments.length === 0) return;

    // Final merge of auto parsed tags and clean memo structure
    const newMemo: QuickNote = {
      id: crypto.randomUUID(),
      content: content.trim(),
      tags: parsedTags,
      color: selectedColor,
      category: selectedCategory,
      createdAt: new Date().toISOString(),
      attachments
    };

    setMemos(prev => [newMemo, ...prev]);
    setContent('');
    setAttachments([]);
  };

  const handleDeleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
  };

  // Collect all unique tags from all memos
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    memos.forEach(m => m.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [memos]);

  // Filtered list of memos
  const filteredMemos = useMemo(() => {
    return memos.filter(m => {
      const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || m.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [memos, searchQuery, selectedTag]);

  // AI assistant integration using Gemini API
  const handleAskAiAboutMemos = async () => {
    if (memos.length === 0) {
      alert('AI analizi için en az bir not bulunmalıdır.');
      return;
    }
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const prompt = `Aşağıda kullanıcımın kaydettiği hızlı notlar (memos) listelenmiştir:\n\n${
        memos.map((m, idx) => `Not ${idx + 1}: [Kategori: ${m.category}] [Etiketler: ${m.tags.join(', ')}] ${m.content}`).join('\n')
      }\n\nLütfen bu notların genel analizini, özetini, en çok ilgi gösterilen alanları ve eksik kalmış olabilecek tavsiyeleri samimi, profesyonel bir dille Türkçe olarak çıkar.`;

      const response = await geminiService.generateSummary(prompt);
      setAiResponse(response);
    } catch (err: any) {
      setAiResponse(`Yapay Zeka Analiz hatası: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Interactive Graph System calculation
  const graphNodes = useMemo(() => {
    const nodes: { id: string; label: string; group: 'note' | 'tag'; color: string }[] = [];
    const links: { source: string; target: string }[] = [];

    // Map tags
    allTags.forEach(tag => {
      nodes.push({ id: `tag-${tag}`, label: `#${tag}`, group: 'tag', color: '#10b981' });
    });

    // Map notes
    memos.slice(0, 15).forEach((m, idx) => {
      const shortTitle = m.content.length > 25 ? m.content.substring(0, 25) + '...' : m.content;
      nodes.push({ id: m.id, label: shortTitle, group: 'note', color: '#3b82f6' });

      // Links based on tags
      m.tags.forEach(tag => {
        links.push({ source: m.id, target: `tag-${tag}` });
      });
    });

    return { nodes, links };
  }, [memos, allTags]);

  return (
    <div className="p-3 lg:p-6 bento-card border-skel-metal/10 bg-skel-space/30 backdrop-blur-xl h-full min-h-[500px] flex flex-col gap-6">

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Zap className="text-focus-neon animate-pulse" size={24} />
            HIZLI NOTLAR (MEMOS)
          </h1>
          <p className="text-text-secondary opacity-60 text-xs font-mono uppercase tracking-widest mt-1">
            Twitter benzeri akan günlük ve hızlı arşiv sistemi
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowGraph(prev => !prev)}
            className={`px-4 py-2 rounded-xl border font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              showGraph ? 'bg-focus-neon/20 border-focus-neon/40 text-focus-neon' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            <Network size={14} />
            İlişki Haritası (Graph)
          </button>

          <button
            onClick={handleAskAiAboutMemos}
            disabled={isAiLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-focus-main to-focus-neon text-white font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-focus-main/20 hover:scale-105"
          >
            {isAiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            AI Not Analizi
          </button>
        </div>
      </div>

      {/* Graph Visualizer Section */}
      <AnimatePresence>
        {showGraph && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/30 border border-white/5 rounded-2xl p-4 overflow-hidden relative"
          >
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Network size={12} className="text-focus-neon" />
              Not ve Etiket İlişki Grafiği (SVG Sistemi)
            </span>
            <div className="w-full h-64 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
              {graphNodes.nodes.length === 0 ? (
                <span className="text-xs text-text-secondary/50 italic">Bağlantı kuracak yeterli not ve etiket yok.</span>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 800 300">
                  {/* Lines (Links) */}
                  {graphNodes.links.map((link, idx) => {
                    const srcNodeIdx = graphNodes.nodes.findIndex(n => n.id === link.source);
                    const tgtNodeIdx = graphNodes.nodes.findIndex(n => n.id === link.target);
                    if (srcNodeIdx === -1 || tgtNodeIdx === -1) return null;

                    const x1 = 50 + (srcNodeIdx * 45) % 700;
                    const y1 = 60 + (srcNodeIdx * 15) % 200;
                    const x2 = 50 + (tgtNodeIdx * 45) % 700;
                    const y2 = 60 + (tgtNodeIdx * 15) % 200;

                    return (
                      <line
                        key={`link-${idx}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#ffffff"
                        strokeOpacity="0.08"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Nodes (Circles and Text) */}
                  {graphNodes.nodes.map((node, idx) => {
                    const x = 50 + (idx * 45) % 700;
                    const y = 60 + (idx * 15) % 200;
                    const isTag = node.group === 'tag';

                    return (
                      <g key={node.id} className="cursor-pointer group">
                        <circle
                          cx={x}
                          cy={y}
                          r={isTag ? 7 : 5}
                          fill={node.color}
                          className="transition-all duration-300 group-hover:scale-125"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="monospace"
                          className="opacity-40 group-hover:opacity-100 transition-opacity"
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

      {/* AI Assistant Output Section */}
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-gradient-to-r from-focus-main/10 to-focus-neon/10 border border-focus-neon/20 rounded-2xl relative"
          >
            <button
              onClick={() => setAiResponse('')}
              className="absolute top-3 right-3 text-text-secondary hover:text-white"
            >
              <X size={16} />
            </button>
            <span className="text-[10px] font-mono font-bold text-focus-neon uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles size={12} />
              AI Akıllı Not Değerlendirmesi
            </span>
            <p className="text-xs text-text-primary leading-relaxed whitespace-pre-line">{aiResponse}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Form on Left/Top, Flow Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0">

        {/* Hızlı Memo Ekleme Formu */}
        <div className="lg:col-span-5 space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest font-bold">Yeni Not Oluştur</span>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Aklınızdaki fikirleri ve anlık gelişmeleri buraya not edin... Etiketleri #etiket formatında otomatik ekleyebilirsiniz."
            rows={5}
            className="w-full bg-black/25 border border-white/5 focus:border-focus-neon/30 outline-none rounded-xl p-3 text-xs text-text-primary leading-relaxed resize-none transition-colors"
          />

          {/* Color & Category Selector Row */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-text-secondary uppercase">Tema</span>
              <div className="flex gap-1.5">
                {(Object.keys(COLOR_MAP) as Array<keyof typeof COLOR_MAP>).map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-5 h-5 rounded-full ${COLOR_MAP[c].solid} transition-transform ${
                      selectedColor === c ? 'scale-125 border border-white/40 shadow-lg' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-text-secondary uppercase">Kategori</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/40 border border-white/5 text-xs text-white rounded-lg px-2 py-1 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Attachments View */}
          {attachments.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-[9px] font-mono text-text-secondary uppercase block">Yüklenen Dosyalar</span>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 flex items-center gap-1.5 text-[10px] text-white">
                    <Paperclip size={10} />
                    <span className="truncate max-w-24">{file.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-text-secondary hover:text-white">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer for Memo Creator */}
          <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-text-secondary hover:text-white transition-colors cursor-pointer"
                title="Dosya / Görsel Ekle"
              >
                <Paperclip size={13} />
              </button>
            </div>

            <button
              onClick={handleAddMemo}
              disabled={!content.trim() && attachments.length === 0}
              className="px-4 py-2 bg-focus-neon/15 hover:bg-focus-neon/20 border border-focus-neon/30 hover:border-focus-neon/50 text-focus-neon rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-40"
            >
              Yayınla
            </button>
          </div>
        </div>

        {/* akan kronolojik memos listesi */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0 h-full">

          {/* Filter & Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-text-secondary" size={12} />
              <input
                type="text"
                placeholder="Notlar arasında arama yapın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/30 outline-none rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
              />
            </div>

            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all"
              >
                #{selectedTag} <X size={10} />
              </button>
            )}
          </div>

          {/* Chronological Memos */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            {filteredMemos.length === 0 ? (
              <div className="py-12 text-center text-text-secondary/50 italic text-xs">
                Yayınlanmış hızlı not bulunamadı.
              </div>
            ) : (
              <AnimatePresence>
                {filteredMemos.map((memo) => {
                  const theme = COLOR_MAP[memo.color];
                  return (
                    <motion.div
                      key={memo.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className={`p-4 border rounded-2xl bg-black/10 flex flex-col gap-3 relative transition-all ${theme.border} group`}
                    >
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${theme.badge}`}>
                            {memo.category}
                          </span>
                          <span className="text-[9px] font-mono text-text-secondary/50">
                            {new Date(memo.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleTogglePin(memo.id)}
                            className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                              memo.isPinned ? 'text-amber-400' : 'text-text-secondary'
                            }`}
                          >
                            <Pin size={12} className={memo.isPinned ? 'fill-amber-400' : ''} />
                          </button>
                          <button
                            onClick={() => handleDeleteMemo(memo.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-text-secondary hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">{memo.content}</p>

                      {/* Rendering attachments */}
                      {memo.attachments && memo.attachments.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {memo.attachments.map((file, idx) => {
                            if (file.type === 'image') {
                              return (
                                <img
                                  key={idx}
                                  src={file.url}
                                  alt={file.name}
                                  className="rounded-xl border border-white/5 max-h-32 object-cover"
                                />
                              );
                            }
                            return (
                              <div key={idx} className="bg-white/5 p-2 rounded-xl flex items-center gap-2 text-xs text-white">
                                <FileText size={14} className="text-focus-neon" />
                                <span className="truncate">{file.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tags */}
                      {memo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {memo.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(tag)}
                              className="text-[10px] font-mono text-text-secondary hover:text-focus-neon"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
