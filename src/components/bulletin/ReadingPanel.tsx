import React from 'react';
import { ChevronLeft, Bookmark, ExternalLink, Sparkles, AlertCircle, Tag, FileText } from 'lucide-react';
import { ArticleItem } from './types';
import { ensureString } from './utils';

interface ReadingPanelProps {
  selectedArticle: ArticleItem | null;
  isMobileListOpen: boolean;
  setIsMobileListOpen: (open: boolean) => void;
  savedArticleIds: Set<string>;
  handleToggleSave: (e: React.MouseEvent, art: ArticleItem) => void;
  summaryStatus: 'idle' | 'loading' | 'success' | 'error';
  currentSummary: string | null;
  generateAIContext: (article: ArticleItem) => void;
  currentSubModule?: string;
  onUpdateNotes?: (id: string, notes: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
}

export function ReadingPanel({
  selectedArticle,
  isMobileListOpen,
  setIsMobileListOpen,
  savedArticleIds,
  handleToggleSave,
  summaryStatus,
  currentSummary,
  generateAIContext,
  currentSubModule = 'news',
  onUpdateNotes,
  onUpdateTags,
}: ReadingPanelProps) {
  const [isDrafting, setIsDrafting] = React.useState(false);
  const isArticleSaved = selectedArticle ? savedArticleIds.has(selectedArticle.id) : false;

  const handleAIDraft = async () => {
    if (!selectedArticle || !onUpdateNotes) return;
    setIsDrafting(true);
    try {
      const res = await fetch('/api/bulletin/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedArticle.title,
          content: selectedArticle.content || selectedArticle.contentSnippet || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Strip HTML tags for clean Markdown study notes
        const cleanText = data.summary
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<p>/gi, '')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<li>/gi, '- ')
          .replace(/<\/li>/gi, '\n')
          .replace(/<ul>/gi, '')
          .replace(/<\/ul>/gi, '\n')
          .replace(/<strong>/gi, '**')
          .replace(/<\/strong>/gi, '**')
          .replace(/<[^>]*>/g, ''); // strip remaining tags
        onUpdateNotes(selectedArticle.id, cleanText);
      } else {
        alert("Not taslağı oluşturulamadı.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div
      className={`col-span-1 lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full flex flex-col ${
        isMobileListOpen && selectedArticle ? 'hidden lg:flex' : 'flex'
      }`}
    >
      {selectedArticle ? (
        <>
          <div className="p-4 border-b border-white/5 bg-black/20 shrink-0 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileListOpen(true)}
                className="lg:hidden p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-text-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  Okuma Paneli
                </span>
                <div className="text-xs font-bold text-rose-400 mt-0.5">
                  {ensureString(selectedArticle.feedTitle)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleToggleSave(e, selectedArticle)}
                className={`p-2.5 rounded-xl border transition-all ${
                  savedArticleIds.has(selectedArticle.id)
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10 hover:text-white'
                }`}
                title={savedArticleIds.has(selectedArticle.id) ? 'Kaydedilenlerden Çıkar' : 'Kaydet'}
              >
                <Bookmark size={16} className={savedArticleIds.has(selectedArticle.id) ? 'fill-current' : ''} />
              </button>
              <a
                href={ensureString(selectedArticle.link)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
              >
                <span className="hidden sm:inline">Kaynağa Git</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 scroll-smooth">
            <article className="max-w-2xl mx-auto">
              <header className="mb-8 space-y-4">
                <div className="flex flex-wrap gap-2 items-center text-xs font-mono text-text-secondary">
                  <span className="bg-white/5 px-2.5 py-1 rounded-lg font-bold">{ensureString(selectedArticle.category)}</span>
                  {selectedArticle.platform && (
                    <>
                      <span>•</span>
                      <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-lg font-bold">
                        {selectedArticle.platform}
                      </span>
                    </>
                  )}
                  {selectedArticle.subCategory && selectedArticle.subCategory !== selectedArticle.platform && (
                    <>
                      <span>•</span>
                      <span className="bg-white/5 text-text-primary px-2.5 py-1 rounded-lg font-bold">
                        {selectedArticle.subCategory}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="opacity-70">
                    {(() => {
                      const dStr = ensureString(selectedArticle.pubDate);
                      try {
                        return new Date(dStr || Date.now()).toLocaleString('tr-TR', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        });
                      } catch {
                        return dStr;
                      }
                    })()}
                  </span>
                  {selectedArticle.creator && (
                    <>
                      <span>•</span>
                      <span className="opacity-70">Yazar: {ensureString(selectedArticle.creator)}</span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl lg:text-3xl font-display font-black text-text-primary leading-tight">
                  {ensureString(selectedArticle.title)}
                </h1>
              </header>

              {/* Study Workspace Panel (Only shown if article is saved or prompted to save) */}
              {isArticleSaved ? (
                <div className="mb-8 bg-rose-500/[0.01] border border-rose-500/15 rounded-2xl p-4 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400">
                        <Bookmark size={14} className="fill-current" />
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-rose-300">
                        Haber Araştırma & Not Defteri
                      </h4>
                    </div>
                    <span className="text-[10px] text-text-secondary/50 font-mono">
                      Otomatik Kaydedilir
                    </span>
                  </div>

                  {/* Tags Editor */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/70 flex items-center gap-1">
                      <Tag size={10} />
                      Kişisel Etiketler
                    </label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {(selectedArticle.tags || []).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-white/5 text-text-primary px-2.5 py-0.5 rounded-full text-[10px] border border-white/5">
                          {tag}
                          <button
                            onClick={() => {
                              const updated = (selectedArticle.tags || []).filter(t => t !== tag);
                              onUpdateTags?.(selectedArticle.id, updated);
                            }}
                            className="text-text-secondary hover:text-rose-400 font-bold ml-0.5 text-[11px]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Yeni etiket... (Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              const existing = selectedArticle.tags || [];
                              if (!existing.includes(val)) {
                                onUpdateTags?.(selectedArticle.id, [...existing, val]);
                              }
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="bg-black/30 border border-white/10 rounded-lg px-2.5 py-0.5 text-[10px] text-text-primary outline-none focus:border-rose-500/30 w-24"
                      />
                    </div>
                  </div>

                  {/* Notes Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/70 flex items-center gap-1">
                        <FileText size={10} />
                        Kişisel Notlarım & Özetlerim
                      </label>
                      <button
                        disabled={isDrafting}
                        onClick={handleAIDraft}
                        className="text-[9px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/5 hover:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15 cursor-pointer"
                        title="Haber içeriğini analiz edip buraya akıllı bir not taslağı doldurur."
                      >
                        <Sparkles size={10} className={isDrafting ? "animate-spin" : ""} />
                        {isDrafting ? "Taslak Oluşturuluyor..." : "AI ile Çalışma Notu Çıkar"}
                      </button>
                    </div>
                    <textarea
                      placeholder="Bu haber hakkında analizlerinizi, öğrenimlerinizi ve notlarınızı buraya yazın..."
                      value={selectedArticle.userNotes || ''}
                      onChange={(e) => onUpdateNotes?.(selectedArticle.id, e.target.value)}
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-text-primary outline-none focus:border-rose-500/30 transition-all font-sans resize-y custom-scrollbar"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-8 bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 justify-center sm:justify-start">
                      <Bookmark size={12} className="text-text-secondary" />
                      Araştırma Alanını Aktif Edin
                    </h4>
                    <p className="text-[10px] text-text-secondary/70 max-w-sm">
                      Bu haberi kaydederek üzerine kendi kişisel analiz notlarınızı yazabilir ve özel etiketler ekleyebilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleToggleSave(e, selectedArticle)}
                    className="shrink-0 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Haberi Kaydet
                  </button>
                </div>
              )}

              {/* AI Summary Widget */}
              <div className="mb-8">
                {summaryStatus === 'idle' ? (
                  <button
                    onClick={() => generateAIContext(selectedArticle)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                        <Sparkles size={16} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-indigo-300">AI Context Builder</h4>
                        <p className="text-[11px] text-indigo-400/70 mt-0.5">Metni analiz et ve kavramsal özet çıkar</p>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-indigo-400/50 rotate-180" />
                  </button>
                ) : summaryStatus === 'loading' ? (
                  <div className="w-full p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3">
                    <Sparkles size={24} className="text-indigo-400 animate-pulse" />
                    <p className="text-xs font-mono text-indigo-300/70 animate-pulse">Analiz ediliyor...</p>
                  </div>
                ) : summaryStatus === 'error' ? (
                  <div className="w-full p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400">
                    <AlertCircle size={16} />
                    <p className="text-xs font-medium">Özetleme başarısız oldu. API limitleri aşılmış olabilir.</p>
                  </div>
                ) : (
                  <div className="w-full p-6 bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-indigo-500/10">
                      <Sparkles size={16} className="text-indigo-400" />
                      <h4 className="text-sm font-black text-indigo-300 tracking-wide uppercase">AI Bağlam Özeti</h4>
                    </div>
                    <div className="prose prose-invert prose-sm prose-indigo max-w-none prose-p:leading-relaxed prose-p:text-indigo-100/80 prose-strong:text-indigo-300 prose-ul:text-indigo-100/80">
                      {currentSummary ? (
                        <div dangerouslySetInnerHTML={{ __html: currentSummary }} />
                      ) : (
                        'Özet bulunamadı.'
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* YouTube Embed Player or Cover Image */}
              {(() => {
                const linkStr = ensureString(selectedArticle.link);
                const ytMatch = linkStr.match(/(?:watch\?v=|shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                const ytVideoId = ytMatch ? ytMatch[1] : null;

                if (ytVideoId) {
                  return (
                    <div className="my-6 aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytVideoId}`}
                        title={ensureString(selectedArticle.title)}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                }

                if (selectedArticle.image) {
                  return (
                    <div className="my-6 rounded-2xl overflow-hidden border border-white/10 max-h-96">
                      <img
                        src={ensureString(selectedArticle.image)}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  );
                }

                return null;
              })()}

              {/* Content Body */}
              <div className="prose prose-invert prose-rose max-w-none prose-p:text-text-secondary/90 prose-p:leading-loose prose-a:text-rose-400 prose-img:rounded-2xl prose-headings:font-display prose-headings:font-bold prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-rose-300">
                <div dangerouslySetInnerHTML={{ __html: ensureString(selectedArticle.content || selectedArticle.contentSnippet) }} />
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <a
                  href={ensureString(selectedArticle.link)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl text-sm font-bold transition-all border border-white/10 hover:border-white/20"
                >
                  Makalenin Tamamını Oku
                  <ExternalLink size={16} />
                </a>
              </div>
            </article>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary/50 p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
            <Sparkles size={24} className="opacity-50 text-rose-500/50" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-text-primary">Okuma Paneli</h3>
            <p className="text-sm mt-1 max-w-xs">Listeden bir haber seçerek reklamsız okuma modunda görüntüleyin.</p>
          </div>
        </div>
      )}
    </div>
  );
}
