import React from 'react';
import { RefreshCw, LayoutTemplate, LayoutList, Search, X, Check, Bookmark, Download, Trash2, Sparkles, Tag } from 'lucide-react';
import { ArticleItem } from './types';
import { formatTimeAgo, ensureString } from './utils';

interface ArticlesListProps {
  currentSubModule: string;
  isLoading: boolean;
  onRefresh: () => void;
  layoutMode: 'comfortable' | 'compact';
  setLayoutMode: (mode: 'comfortable' | 'compact') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredArticles: ArticleItem[];
  selectedArticle: ArticleItem | null;
  handleSelectArticle: (article: ArticleItem) => void;
  readArticleIds: Set<string>;
  savedArticleIds: Set<string>;
  isMobileListOpen: boolean;
  articlesLength: number;
  savedArticles?: ArticleItem[];
  onClearAllSaved?: () => void;
  onSynthesizeDigest?: () => void;
  isSynthesizing?: boolean;
  activeFeedFilter?: string;
  setActiveFeedFilter?: (filter: string) => void;
}

export function ArticlesList({
  currentSubModule,
  isLoading,
  onRefresh,
  layoutMode,
  setLayoutMode,
  searchQuery,
  setSearchQuery,
  filteredArticles,
  selectedArticle,
  handleSelectArticle,
  readArticleIds,
  savedArticleIds,
  isMobileListOpen,
  articlesLength,
  savedArticles = [],
  onClearAllSaved,
  onSynthesizeDigest,
  isSynthesizing = false,
  activeFeedFilter = 'all',
  setActiveFeedFilter = () => {},
}: ArticlesListProps) {
  const [savedFilterMode, setSavedFilterMode] = React.useState<'all' | 'read' | 'unread'>('all');

  const uniqueTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    savedArticles.forEach(art => {
      if (art.tags && Array.isArray(art.tags)) {
        art.tags.forEach(t => {
          if (t && t.trim()) tagsSet.add(t.trim());
        });
      }
    });
    return Array.from(tagsSet);
  }, [savedArticles]);

  const handleExportMarkdown = () => {
    if (!savedArticles || savedArticles.length === 0) return;
    
    let markdown = `# APEXOS Gündem - Kaydedilen Haberler & Notlar\n`;
    markdown += `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}\n\n`;
    markdown += `Toplam Kaydedilen: ${savedArticles.length} haber\n\n---\n\n`;
    
    savedArticles.forEach((art, index) => {
      markdown += `## [${index + 1}] ${ensureString(art.title)}\n`;
      markdown += `- **Kaynak:** ${ensureString(art.feedTitle)}\n`;
      markdown += `- **Kategori:** ${ensureString(art.category)} ${art.subCategory ? `(${ensureString(art.subCategory)})` : ''}\n`;
      markdown += `- **Yayınlanma Tarihi:** ${new Date(ensureString(art.pubDate)).toLocaleString('tr-TR')}\n`;
      if (art.tags && art.tags.length > 0) {
        markdown += `- **Etiketler:** ${art.tags.join(', ')}\n`;
      }
      markdown += `- **Bağlantı:** [Habere Git](${ensureString(art.link)})\n\n`;
      
      if (art.userNotes) {
        markdown += `### 📝 Kişisel Notlarım:\n${art.userNotes}\n\n`;
      }
      
      markdown += `---\n\n`;
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `apexos-kaydedilenler-${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayArticles = React.useMemo(() => {
    if (currentSubModule !== 'saved') return filteredArticles;
    
    let list = filteredArticles;
    if (savedFilterMode === 'read') {
      list = list.filter(art => readArticleIds.has(art.id));
    } else if (savedFilterMode === 'unread') {
      list = list.filter(art => !readArticleIds.has(art.id));
    }
    return list;
  }, [filteredArticles, currentSubModule, savedFilterMode, readArticleIds]);
  return (
    <div
      className={`col-span-1 lg:col-span-4 flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full ${
        !isMobileListOpen && selectedArticle ? 'hidden lg:flex' : 'flex'
      }`}
    >
      <div className="p-4 border-b border-white/5 bg-black/20 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-bold text-text-primary flex items-center gap-2">
            {currentSubModule === 'saved' ? 'Kaydedilenler' : 'Son Gelişmeler'}
            {isLoading && <RefreshCw size={14} className="animate-spin text-text-secondary" />}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
              title="Yenile"
            >
              <RefreshCw size={14} />
            </button>
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setLayoutMode('comfortable')}
                className={`p-1 rounded-md transition-all ${
                  layoutMode === 'comfortable' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'
                }`}
              >
                <LayoutTemplate size={14} />
              </button>
              <button
                onClick={() => setLayoutMode('compact')}
                className={`p-1 rounded-md transition-all ${
                  layoutMode === 'compact' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'
                }`}
              >
                <LayoutList size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Saved Stats and AI Tools Dashboard */}
        {currentSubModule === 'saved' && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/30 border border-white/5 rounded-xl p-2">
                <div className="text-[10px] text-text-secondary/60">Toplam</div>
                <div className="text-sm font-black text-rose-400 font-mono">{savedArticles.length}</div>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-2">
                <div className="text-[10px] text-text-secondary/60">Okunan</div>
                <div className="text-sm font-black text-emerald-400 font-mono">
                  {savedArticles.filter(art => readArticleIds.has(art.id)).length}
                </div>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-2">
                <div className="text-[10px] text-text-secondary/60">Kalan</div>
                <div className="text-sm font-black text-amber-400 font-mono">
                  {savedArticles.length - savedArticles.filter(art => readArticleIds.has(art.id)).length}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:flex-row">
              <button
                disabled={isSynthesizing || savedArticles.length === 0}
                onClick={onSynthesizeDigest}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500/20 to-orange-500/20 hover:from-rose-500/30 hover:to-orange-500/30 text-rose-300 disabled:opacity-50 border border-rose-500/20 hover:border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Kaydedilen tüm haberlerden yapay zeka ile profesyonel bir bülten sentezler."
              >
                <Sparkles size={12} className={isSynthesizing ? "animate-spin" : ""} />
                {isSynthesizing ? "Sentezleniyor..." : "AI Gündem Bülteni Sentezle"}
              </button>

              <button
                disabled={savedArticles.length === 0}
                onClick={handleExportMarkdown}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-text-primary disabled:opacity-50 border border-white/5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Tüm haberleri ve notlarınızı tek tıklamayla Markdown formatında indirin."
              >
                <Download size={12} />
                Dışa Aktar (.md)
              </button>
            </div>

            {savedArticles.length > 0 && (
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-text-secondary/40 font-mono">Veriler yerel diskte saklanır</span>
                <button
                  onClick={onClearAllSaved}
                  className="text-rose-500/70 hover:text-rose-400 flex items-center gap-1 transition-colors bg-rose-500/5 hover:bg-rose-500/10 px-2 py-0.5 rounded-md font-medium"
                >
                  <Trash2 size={10} />
                  Temizle
                </button>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Haberlerde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary outline-none focus:border-rose-500/50 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Horizontal Quick-Filter Pills for Saved Mode (Crucial for Mobile + Usability) */}
        {currentSubModule === 'saved' && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0 text-[10px]">
            <button
              onClick={() => {
                setActiveFeedFilter('all');
                setSavedFilterMode('all');
              }}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap font-semibold transition-all ${
                savedFilterMode === 'all' && activeFeedFilter === 'all'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 font-black'
                  : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10 hover:text-white'
              }`}
            >
              Hepsi ({savedArticles.length})
            </button>
            <button
              onClick={() => setSavedFilterMode('unread')}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap font-semibold transition-all ${
                savedFilterMode === 'unread'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-black'
                  : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10 hover:text-white'
              }`}
            >
              Okunmamış ({savedArticles.filter(art => !readArticleIds.has(art.id)).length})
            </button>
            <button
              onClick={() => setSavedFilterMode('read')}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap font-semibold transition-all ${
                savedFilterMode === 'read'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-black'
                  : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10 hover:text-white'
              }`}
            >
              Okunan ({savedArticles.filter(art => readArticleIds.has(art.id)).length})
            </button>

            {uniqueTags.map(tag => {
              const isTagSelected = activeFeedFilter === `tag:${tag}`;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setActiveFeedFilter(isTagSelected ? 'all' : `tag:${tag}`);
                    setSavedFilterMode('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap font-semibold transition-all flex items-center gap-1 ${
                    isTagSelected
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 font-black'
                      : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10'
                  }`}
                >
                  <Tag size={9} />
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {isLoading && articlesLength === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-secondary space-y-3">
            <RefreshCw size={24} className="animate-spin text-rose-500" />
            <p className="text-xs font-mono">Haberler yükleniyor...</p>
          </div>
        ) : displayArticles.length > 0 ? (
          displayArticles.map((article) => {
            const isSelected = selectedArticle?.id === article.id;
            const isRead = readArticleIds.has(article.id);
            const isSaved = savedArticleIds.has(article.id);

            return (
              <button
                key={article.id}
                onClick={() => handleSelectArticle(article)}
                className={`w-full text-left p-3 rounded-2xl transition-all border ${
                  isSelected
                    ? 'bg-white/[0.08] border-white/10 shadow-lg'
                    : isRead
                    ? 'bg-transparent border-transparent hover:bg-white/[0.04] opacity-70'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                } flex flex-col gap-2`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Platform Badge */}
                    <span
                      className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                        (article.platform === 'Reddit' || article.feedTitle.toLowerCase().includes('reddit'))
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                          : (article.platform === 'Hacker News' || article.feedTitle.toLowerCase().includes('hacker news'))
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          : (article.platform === 'Dev.to' || article.feedTitle.toLowerCase().includes('dev.to'))
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                          : (article.platform === 'YouTube' || article.feedTitle.toLowerCase().includes('youtube'))
                          ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                          : (article.platform === 'Product Hunt' || article.feedTitle.toLowerCase().includes('product hunt'))
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {article.platform || ensureString(article.feedTitle)}
                    </span>

                    {/* SubCategory or Feed Title Badge if distinct */}
                    {article.subCategory && article.subCategory !== article.platform && (
                      <span className="text-[9px] font-semibold text-text-secondary/80 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        {article.subCategory}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-text-secondary/60 font-mono shrink-0">
                    {formatTimeAgo(ensureString(article.pubDate))}
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 space-y-1 min-w-0">
                    <h3
                      className={`font-bold font-sans text-sm leading-snug line-clamp-2 ${
                        isSelected ? 'text-white' : isRead ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      {ensureString(article.title)}
                    </h3>
                    {layoutMode === 'comfortable' && article.contentSnippet && (
                      <p className="text-xs text-text-secondary/70 line-clamp-2 leading-relaxed">
                        {ensureString(article.contentSnippet)}
                      </p>
                    )}
                  </div>
                  {article.image && (
                    <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 relative bg-black/40">
                      <img src={ensureString(article.image)} alt="" className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 pt-2 border-t border-t-white/5">
                  <div className="flex items-center gap-2">
                    {isSaved && <Bookmark size={12} className="text-rose-500 fill-rose-500" />}
                    {isRead && <Check size={12} className="text-emerald-500" />}
                  </div>
                  <span className="text-[10px] text-text-secondary/50 font-medium truncate max-w-[150px]">
                    {ensureString(article.creator)}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-text-secondary/60">
            <Search size={24} className="mb-2 opacity-50" />
            <p className="text-xs font-medium">İçerik bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
