import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Zap, BookText, Network, Sparkles, Tag, Search, 
  Send, Plus, ArrowRight, FileText, CheckCircle, Clock, BookOpen, MessageSquare 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Memo, Notebook } from './types';
import { INITIAL_MEMOS, INITIAL_NOTEBOOKS, INITIAL_NOTE_CATEGORIES } from './initialData';
import { KnowledgeGraphModal } from './KnowledgeGraphModal';

export const NotesDashboard: React.FC = () => {
  const [memos] = useState<Memo[]>(() => {
    const saved = localStorage.getItem('apex_memos_v2');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return INITIAL_MEMOS;
  });

  const [notebooks] = useState<Notebook[]>(() => {
    const saved = localStorage.getItem('apex_notebooks_v2');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return INITIAL_NOTEBOOKS;
  });

  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [globalAiQuery, setGlobalAiQuery] = useState('');
  const [globalAiResponse, setGlobalAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Global AI Search & Ask Across All Memos & Notebooks
  const handleGlobalAiQuery = async () => {
    if (!globalAiQuery.trim()) return;
    setIsAiLoading(true);
    setGlobalAiResponse(null);

    try {
      const res = await fetch('/api/notes/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: globalAiQuery,
          contextNotes: [
            ...memos.map(m => ({ id: m.id, title: m.category, content: m.content, type: 'memo' })),
            ...notebooks.flatMap(nb => nb.pages.map(p => ({ id: p.id, title: `${nb.title} - ${p.title}`, content: p.content, type: 'page' })))
          ]
        })
      });

      const data = await res.json();
      setGlobalAiResponse(data.answer || "Yanıt alınamadı.");
    } catch (e: any) {
      setGlobalAiResponse("Yapay zeka yanıtı alınamadı: " + e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Helper navigation to switch modules via window.setActiveModule if set
  const navigateTo = (moduleId: string) => {
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule(moduleId);
    }
  };

  const totalPagesCount = useMemo(() => notebooks.reduce((acc, nb) => acc + nb.pages.length, 0), [notebooks]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
              Notlarım & Bilgi Ağı Merkez Üssü
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Hızlı notlar (memos), konulara özel defterler ve yapay zeka grafik analizi tek bir yerde.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsGraphOpen(true)}
            className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Network size={16} className="text-amber-400" />
            <span>Zihin Haritasını Aç</span>
          </button>
        </div>
      </div>

      {/* Global AI Intelligence Bar */}
      <div className="bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
          <Sparkles size={16} /> Global Yapay Zeka Not Arama & Sorgulama (Gemini AI)
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text"
            value={globalAiQuery}
            onChange={(e) => setGlobalAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGlobalAiQuery()}
            placeholder="Tüm hızlı notlarımda ve defterlerimde ara (Örn: Geçen hafta alınan kararlar nelerdi?)..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-amber-500/50"
          />
          <button 
            onClick={handleGlobalAiQuery}
            disabled={isAiLoading || !globalAiQuery.trim()}
            className="py-3 px-5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-2xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send size={16} />
            <span>Sorgula</span>
          </button>
        </div>

        {/* Global AI Response Box */}
        {globalAiResponse && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-white leading-relaxed prose prose-invert">
            <ReactMarkdown>{globalAiResponse}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Hızlı Notlar (Memos)', value: memos.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: <Zap size={20} />, module: 'notes-quick' },
          { label: 'Not Defterleri', value: notebooks.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: <BookText size={20} />, module: 'notes-notebook' },
          { label: 'Defter Sayfaları', value: totalPagesCount, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: <FileText size={20} />, module: 'notes-notebook' },
          { label: 'Kategoriler & Etiketler', value: INITIAL_NOTE_CATEGORIES.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <Tag size={20} />, module: 'notes-quick' }
        ].map((card, i) => (
          <div 
            key={i}
            onClick={() => navigateTo(card.module)}
            className={`p-5 rounded-3xl border ${card.bg} bg-neutral-900/80 backdrop-blur-xl shadow-xl hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-between`}
          >
            <div>
              <span className="text-[11px] font-mono text-text-secondary uppercase">{card.label}</span>
              <h3 className={`text-2xl font-black font-display mt-1 ${card.color}`}>{card.value}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Split Section: Quick Memos Preview + Notebooks Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Memos Feed */}
        <div className="lg:col-span-6 bg-neutral-900/80 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap size={16} className="text-amber-400" /> Son Hızlı Notlar (Memos)
              </h3>
              <button 
                onClick={() => navigateTo('notes-quick')}
                className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
              >
                Tümünü Gör &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {memos.slice(0, 3).map((memo) => (
                <div key={memo.id} className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary">
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">{memo.category}</span>
                    <span>{new Date(memo.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <p className="text-xs text-skel-glass line-clamp-2">{memo.content}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigateTo('notes-quick')}
            className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-2xl text-xs font-bold transition-all cursor-pointer mt-4"
          >
            + Hızlı Not Ekle (Memos)
          </button>
        </div>

        {/* Right Column: Recent Notebooks */}
        <div className="lg:col-span-6 bg-neutral-900/80 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookText size={16} className="text-indigo-400" /> Defterler (Open Notebooks)
              </h3>
              <button 
                onClick={() => navigateTo('notes-notebook')}
                className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
              >
                Tümünü Gör &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {notebooks.slice(0, 3).map((nb) => (
                <div 
                  key={nb.id} 
                  onClick={() => navigateTo('notes-notebook')}
                  className="bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{nb.title}</h4>
                      <p className="text-[10px] text-text-secondary">{nb.pages.length} Sayfa • {nb.sources.length} Kaynak</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-text-secondary" />
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigateTo('notes-notebook')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer mt-4 shadow-lg"
          >
            Not Defterlerini Yönet
          </button>
        </div>

      </div>

      {/* KNOWLEDGE GRAPH MODAL */}
      <KnowledgeGraphModal 
        isOpen={isGraphOpen} 
        onClose={() => setIsGraphOpen(false)}
        memos={memos}
        notebooks={notebooks}
      />
    </div>
  );
};
