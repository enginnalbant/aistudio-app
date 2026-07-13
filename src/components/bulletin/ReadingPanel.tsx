import React from 'react';
import { ChevronLeft, Bookmark, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
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
}: ReadingPanelProps) {
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
