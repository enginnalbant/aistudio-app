import React, { useState } from 'react';
import { Sparkles, Calendar, Zap, Bookmark, Copy, Check, RefreshCw, FileText, Download, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import { AIDigest, ArticleItem } from './types';

interface DigestViewProps {
  articles: ArticleItem[];
  digests: AIDigest[];
  onSaveDigest: (digest: AIDigest) => void;
  onSelectArticleFromDigest?: (articleTitle: string) => void;
}

export function DigestView({ articles, digests, onSaveDigest, onSelectArticleFromDigest }: DigestViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDigest, setActiveDigest] = useState<AIDigest | null>(digests.length > 0 ? digests[0] : null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDigest = async () => {
    if (articles.length === 0) {
      alert('Bülten oluşturmak için henüz haber akışı bulunmuyor. Lütfen yenileyin.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/bulletin/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: articles.slice(0, 20) })
      });

      if (!res.ok) {
        throw new Error('Yapay zeka bülten servisi yanıt vermedi.');
      }

      const data = await res.json();
      const newDigest: AIDigest = {
        id: `digest-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: data.title || 'Günün Akıllı Bülteni',
        greeting: data.greeting || 'Günün en önemli gelişmeleri sizin için derlendi.',
        highlights: data.highlights || [],
        quickTakeaways: data.quickTakeaways || [],
        editorNote: data.editorNote || ''
      };

      setActiveDigest(newDigest);
      onSaveDigest(newDigest);
    } catch (err: any) {
      console.error('Digest generation error:', err);
      setError(err.message || 'Bülten oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!activeDigest) return;
    const text = `# ${activeDigest.title}\n\n${activeDigest.greeting}\n\n## 📌 Öne Çıkan Başlıklar\n` +
      activeDigest.highlights.map(h => `### ${h.topic} (${h.category})\n- **Özet:** ${h.summary}\n- **Neden Önemli:** ${h.impact}\n`).join('\n') +
      `\n## ⚡ 30 Saniyede Bilmeniz Gerekenler\n` +
      activeDigest.quickTakeaways.map(t => `- ${t}`).join('\n') +
      `\n\n## 📝 Editörün Notu\n${activeDigest.editorNote}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest mb-1">
            <Sparkles size={14} className="animate-pulse" />
            Gemini 3.5 Flash Yapay Zeka Motoru
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-black text-text-primary">
            Günün Akıllı Bülteni
          </h1>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            Tüm RSS kaynaklarınızdan süzülen yüzlerce haberi saniyeler içinde analiz eder, en kritik gelişmeleri ve 30 saniyelik özetleri önünüze getirir.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateDigest}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{isGenerating ? 'Bülten Hazırlanıyor...' : 'Yeni Bülten Oluştur'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left: Previous Digests List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary/70 flex items-center gap-2 mb-2">
            <Calendar size={14} />
            Bülten Arşivi
          </h3>

          <div className="space-y-2">
            {digests.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDigest(d)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  activeDigest?.id === d.id
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border-indigo-500/30 text-white shadow-lg'
                    : 'bg-white/[0.02] border-white/5 text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 mb-1">
                  <span>{new Date(d.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold">AI Derlemesi</span>
                </div>
                <h4 className="font-bold font-sans text-xs line-clamp-1">{d.title}</h4>
                <p className="text-[11px] text-text-secondary/60 line-clamp-2 mt-1">{d.greeting}</p>
              </button>
            ))}

            {digests.length === 0 && !activeDigest && (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-text-secondary/60 space-y-3">
                <Sparkles size={28} className="mx-auto text-indigo-400/50" />
                <p className="text-xs font-medium">Henüz oluşturulmuş bir bülten bulunmuyor.</p>
                <button
                  onClick={handleGenerateDigest}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-500/30 transition-all"
                >
                  Şimdi Oluştur
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Digest Body */}
        <div className="lg:col-span-8 bg-white/[0.015] border border-white/5 rounded-3xl p-6 lg:p-8 space-y-8 flex flex-col justify-between">
          {activeDigest ? (
            <div className="space-y-8">
              {/* Title & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full font-bold">
                    {new Date(activeDigest.createdAt).toLocaleString('tr-TR', { dateStyle: 'full' })}
                  </span>
                  <h2 className="text-2xl font-display font-black text-text-primary mt-2">
                    {activeDigest.title}
                  </h2>
                </div>

                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-text-primary transition-all shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Kopyalandı!' : 'Markdown Kopyala'}</span>
                </button>
              </div>

              {/* Greeting */}
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-200 leading-relaxed font-sans italic">
                "{activeDigest.greeting}"
              </div>

              {/* Quick Takeaways */}
              {activeDigest.quickTakeaways.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    30 Saniyede Bilmeniz Gerekenler
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeDigest.quickTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400">0{idx + 1}</span>
                        <p className="text-xs text-text-primary font-medium leading-snug">{takeaway}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights Cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono flex items-center gap-2">
                  <FileText size={14} className="text-indigo-400" />
                  Öne Çıkan Başlıklar
                </h3>

                <div className="space-y-3">
                  {activeDigest.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 hover:bg-white/[0.04] transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                          {item.category}
                        </span>
                        {onSelectArticleFromDigest && (
                          <button
                            onClick={() => onSelectArticleFromDigest(item.topic)}
                            className="text-[11px] text-text-secondary group-hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                          >
                            Habere Git <ArrowUpRight size={12} />
                          </button>
                        )}
                      </div>

                      <h4 className="font-bold font-sans text-sm text-text-primary leading-snug">
                        {item.topic}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {item.summary}
                      </p>
                      <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-indigo-300/80">
                        <span className="font-bold text-indigo-400">Neden Önemli:</span> {item.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor's Note */}
              {activeDigest.editorNote && (
                <div className="p-5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl space-y-1">
                  <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                    📝 Editörün Vizyon Notu
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed pt-1">
                    {activeDigest.editorNote}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-text-secondary/50 space-y-3">
              <Sparkles size={40} className="text-indigo-400/40" />
              <p className="text-sm font-medium">Bülten içeriği görüntülemek için sol menüden seçim yapın veya yeni bir bülten oluşturun.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
