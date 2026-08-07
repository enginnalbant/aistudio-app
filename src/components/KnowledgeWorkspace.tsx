import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Sparkles, 
  Plus, 
  FileText, 
  Compass, 
  Code2, 
  Layers, 
  Cpu, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  Bell, 
  Terminal, 
  Wand2, 
  Layout, 
  Share2, 
  Eye, 
  Lock, 
  Download, 
  RefreshCw,
  FolderPlus,
  BookOpen,
  Maximize2
} from 'lucide-react';

export const KnowledgeWorkspace: React.FC = () => {
  // State for toggling development mode banner / details
  const [showDevPanel, setShowDevPanel] = useState<boolean>(true);
  const [canvasStyle, setCanvasStyle] = useState<'blank' | 'dots' | 'grid'>('dots');
  const [activeTab, setActiveTab] = useState<'canvas' | 'roadmap' | 'graph'>('canvas');
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; x: number; y: number }>>([
    {
      id: 'node-1',
      title: 'APEXOS Knowledge Base',
      content: 'Bileşik bilgi mimarisi ve bağlantılı notlar tuvali.',
      x: 120,
      y: 100
    },
    {
      id: 'node-2',
      title: 'Geliştirme Notu',
      content: 'Bu modül şu an aktif geliştirme aşamasındadır. Yakında bi-directional linking ve AI Vector Search eklenecektir.',
      x: 480,
      y: 160
    }
  ]);
  const [isNotified, setIsNotified] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;
    const newNote = {
      id: `node-${Date.now()}`,
      title: newNoteTitle,
      content: 'Yeni boş döküman taslağı. İçeriği buraya ekleyebilirsiniz.',
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 150
    };
    setNotes([...notes, newNote]);
    setNewNoteTitle('');
  };

  return (
    <div className="flex flex-col h-full min-h-[700px] w-full bg-skel-obsidian/60 text-pure-white rounded-2xl border border-skel-metal/20 overflow-hidden shadow-2xl relative">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-skel-charcoal/80 border-b border-skel-metal/20 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Network size={20} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-pure-white font-display">
                Knowledge Workspace
              </h1>
              {/* Geliştiriliyor State Badge */}
              <button
                onClick={() => setShowDevPanel(!showDevPanel)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                title="Geliştirme durumu detayları için tıklayın"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Geliştirme Aşamasında</span>
              </button>
            </div>
            <p className="text-xs text-skel-cloud/70">
              Sınırsız bağlantılı düşünceler, grafik bilgi ağı ve dinamik dökümantasyon tuvali
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {/* Canvas Style Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-skel-metal/15 border border-skel-metal/20 text-xs">
            <button
              onClick={() => setCanvasStyle('blank')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                canvasStyle === 'blank' ? 'bg-focus-main text-pure-white font-medium' : 'text-skel-cloud hover:text-pure-white'
              }`}
            >
              Boş Sayfa
            </button>
            <button
              onClick={() => setCanvasStyle('dots')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                canvasStyle === 'dots' ? 'bg-focus-main text-pure-white font-medium' : 'text-skel-cloud hover:text-pure-white'
              }`}
            >
              Noktalı Grid
            </button>
            <button
              onClick={() => setCanvasStyle('grid')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                canvasStyle === 'grid' ? 'bg-focus-main text-pure-white font-medium' : 'text-skel-cloud hover:text-pure-white'
              }`}
            >
              Çizgili Tuval
            </button>
          </div>

          {/* Dev Panel Toggle */}
          <button
            onClick={() => setShowDevPanel(!showDevPanel)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showDevPanel 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-skel-metal/10 text-skel-cloud hover:bg-skel-metal/20 border-skel-metal/20'
            }`}
          >
            <Cpu size={14} className="text-amber-400" />
            <span>{showDevPanel ? 'Geliştirme Paneli Açık' : 'Geliştirme Görünümü'}</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Development State Drawer Banner (if active) */}
        <AnimatePresence>
          {showDevPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-amber-950/40 via-skel-charcoal/90 to-skel-charcoal/90 border-b border-amber-500/20 p-5 shrink-0 z-10"
            >
              <div className="max-w-6xl mx-auto flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Clock size={20} className="animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                        <span>Sürüm 0.9.2-alpha - Modül Geliştiriliyor</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 uppercase font-mono">In Progress</span>
                      </h3>
                      <p className="text-xs text-skel-cloud/80">
                        Knowledge Workspace, bi-directional backlinks ve vektör tabanlı AI bilgi grafiği altyapısıyla hazırlanmaktadır.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsNotified(!isNotified)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isNotified 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                    >
                      <Bell size={14} />
                      <span>{isNotified ? 'Bildirimler Açık ✓' : 'Güncellemeleri Takip Et'}</span>
                    </button>
                    <button
                      onClick={() => setShowDevPanel(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-skel-metal/20 text-skel-cloud hover:text-pure-white text-xs"
                    >
                      Gizle
                    </button>
                  </div>
                </div>

                {/* Progress Roadmap Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-skel-obsidian/70 border border-emerald-500/30 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1"><CheckCircle2 size={13} /> Aşama 1</span>
                      <span className="text-[10px] text-emerald-400/80">100%</span>
                    </div>
                    <span className="text-xs font-bold text-pure-white">Boş Tuval Motoru</span>
                    <p className="text-[11px] text-skel-cloud/70">Esnek not kutuları ve döküman alanları</p>
                  </div>

                  <div className="p-3 rounded-xl bg-skel-obsidian/70 border border-amber-500/40 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                      <span className="flex items-center gap-1"><RefreshCw size={13} className="animate-spin" /> Aşama 2</span>
                      <span className="text-[10px] text-amber-400">85%</span>
                    </div>
                    <span className="text-xs font-bold text-pure-white">Knowledge Graph</span>
                    <p className="text-[11px] text-skel-cloud/70">İki yönlü bağlantı ağı (Backlinks)</p>
                  </div>

                  <div className="p-3 rounded-xl bg-skel-obsidian/70 border border-skel-metal/30 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-skel-cloud font-semibold">
                      <span className="flex items-center gap-1"><GitBranch size={13} /> Aşama 3</span>
                      <span className="text-[10px] text-skel-cloud/60">Planlandı</span>
                    </div>
                    <span className="text-xs font-bold text-pure-white">AI Vektör İndeksi</span>
                    <p className="text-[11px] text-skel-cloud/70">Anlamsal arama & Gemini RAG</p>
                  </div>

                  <div className="p-3 rounded-xl bg-skel-obsidian/70 border border-skel-metal/30 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-skel-cloud font-semibold">
                      <span className="flex items-center gap-1"><Share2 size={13} /> Aşama 4</span>
                      <span className="text-[10px] text-skel-cloud/60">Planlandı</span>
                    </div>
                    <span className="text-xs font-bold text-pure-white">Canlı İşbirliği</span>
                    <p className="text-[11px] text-skel-cloud/70">Çoklu kullanıcı senkronizasyonu</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blank Canvas Workspace */}
        <div 
          className={`flex-1 relative min-h-[550px] p-8 flex flex-col overflow-auto transition-all ${
            canvasStyle === 'dots' 
              ? 'bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:20px_20px]' 
              : canvasStyle === 'grid'
              ? 'bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]'
              : 'bg-transparent'
          }`}
        >
          {/* Quick Creator Control Bar */}
          <div className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 mb-6 bg-skel-charcoal/80 p-3 rounded-2xl border border-skel-metal/20 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Plus size={16} className="text-cyan-400" />
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Yeni çalışma alanı kartı başlığı yazın..."
                className="bg-transparent text-xs text-pure-white placeholder:text-skel-cloud/50 focus:outline-none w-full"
              />
            </div>
            <button
              onClick={handleAddNote}
              disabled={!newNoteTitle.trim()}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 text-pure-white text-xs font-semibold hover:bg-cyan-500 transition-all disabled:opacity-40 flex items-center gap-1"
            >
              <FolderPlus size={14} /> Kart Ekle
            </button>
          </div>

          {/* Interactive Cards / Canvas Workspace Nodes */}
          {notes.length === 0 ? (
            /* Pure Blank Workspace State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-skel-metal/10 border border-skel-metal/20 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
                <BookOpen size={28} />
              </div>
              <h3 className="text-base font-bold text-pure-white mb-1">Boş Çalışma Alanı</h3>
              <p className="text-xs text-skel-cloud/70 mb-6 leading-relaxed">
                Bu sayfa henüz boş. Yukarıdaki barı kullanarak ilk bilgi kartınızı oluşturun veya şablon seçin.
              </p>
              <button
                onClick={() => {
                  setNotes([
                    { id: '1', title: 'Proje Notları', content: 'Fikirler ve kaynak bağlantıları...', x: 100, y: 100 },
                    { id: '2', title: 'Araştırma Başlıkları', content: 'Grafik veri tabanı mimarisi...', x: 400, y: 150 }
                  ]);
                }}
                className="px-4 py-2 rounded-xl bg-focus-main text-pure-white text-xs font-semibold hover:bg-focus-main/90 transition-all flex items-center gap-2"
              >
                <Sparkles size={14} /> Örnek Bilgi Şablonu Yükle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-skel-charcoal/90 border border-skel-metal/30 hover:border-cyan-500/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-3 transition-all group backdrop-blur-md"
                >
                  <div className="flex items-center justify-between border-b border-skel-metal/20 pb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-cyan-400" />
                      <input
                        type="text"
                        value={note.title}
                        onChange={(e) => {
                          const updated = notes.map(n => n.id === note.id ? { ...n, title: e.target.value } : n);
                          setNotes(updated);
                        }}
                        className="bg-transparent font-bold text-xs text-pure-white focus:outline-none border-b border-transparent focus:border-cyan-400"
                      />
                    </div>
                    <button
                      onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/20 p-1 rounded text-xs transition-opacity"
                      title="Kartı sil"
                    >
                      ✕
                    </button>
                  </div>

                  <textarea
                    value={note.content}
                    onChange={(e) => {
                      const updated = notes.map(n => n.id === note.id ? { ...n, content: e.target.value } : n);
                      setNotes(updated);
                    }}
                    rows={4}
                    className="w-full bg-transparent text-xs text-skel-cloud/90 focus:outline-none resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-skel-metal/10 text-[10px] text-skel-cloud/50">
                    <span className="flex items-center gap-1"><Network size={12} /> Bağlantılı Döküman</span>
                    <span>Knowledge Node</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="px-6 py-2.5 bg-skel-charcoal/90 border-t border-skel-metal/20 text-xs text-skel-cloud/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Cpu size={13} /> Sürüm: 0.9.2 Alpha
          </span>
          <span className="hidden sm:inline">| Status: <strong>Geliştiriliyor</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>APEXOS Knowledge Engine</span>
        </div>
      </div>
    </div>
  );
};
