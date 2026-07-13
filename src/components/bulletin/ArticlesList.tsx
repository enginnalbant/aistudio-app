import React from 'react';
import { RefreshCw, LayoutTemplate, LayoutList, Search, X, Check, Bookmark } from 'lucide-react';
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
}: ArticlesListProps) {
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
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {isLoading && articlesLength === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-secondary space-y-3">
            <RefreshCw size={24} className="animate-spin text-rose-500" />
            <p className="text-xs font-mono">Haberler yükleniyor...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((article) => {
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
                  <span className="text-[9px] font-black tracking-wider uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full line-clamp-1">
                    {ensureString(article.feedTitle)}
                  </span>
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
                  {layoutMode === 'comfortable' && article.image && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
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
