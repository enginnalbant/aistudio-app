import React from 'react';
import { Folder, LayoutList } from 'lucide-react';
import { ArticleItem } from './types';

interface SidebarCatalogProps {
  categories: string[];
  activeFeedFilter: string;
  setActiveFeedFilter: (filter: string) => void;
  currentSubModule: string;
  articlesLength: number;
  articles: ArticleItem[];
}

export function SidebarCatalog({
  categories,
  activeFeedFilter,
  setActiveFeedFilter,
  currentSubModule,
  articlesLength,
  articles,
}: SidebarCatalogProps) {
  return (
    <div className="hidden lg:flex lg:col-span-3 flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full">
      <div className="p-4 border-b border-white/5 bg-black/20 shrink-0">
        <h3 className="text-xs font-bold font-display text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <Folder size={14} />
          Kategoriler
        </h3>
      </div>
      <div className="p-3 overflow-y-auto custom-scrollbar flex-1 space-y-1">
        <div>
          <button
            onClick={() => setActiveFeedFilter('all')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
              activeFeedFilter === 'all'
                ? 'bg-rose-500/10 text-rose-400 font-bold'
                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
            }`}
          >
            <LayoutList size={16} />
            <span className="flex-1 text-left">Tüm Haberler</span>
            {currentSubModule === 'news' && (
              <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-md text-text-secondary/60">
                {articlesLength}
              </span>
            )}
          </button>
        </div>

        <div className="pt-2 pb-1">
          <div className="h-[1px] bg-white/5 mx-2" />
        </div>

        {categories.map((cat) => {
          const count = articles.filter((a) => a.category === cat).length;
          const isCatSelected = activeFeedFilter === `category:${cat}`;

          return (
            <button
              key={cat}
              onClick={() => setActiveFeedFilter(`category:${cat}`)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                isCatSelected
                  ? 'bg-rose-500/10 text-rose-400 font-bold'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              }`}
            >
              <Folder size={15} className={isCatSelected ? 'fill-rose-500/10 text-rose-400' : 'text-text-secondary'} />
              <span className="flex-1 text-left">{cat}</span>
              {currentSubModule === 'news' && count > 0 && (
                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-md text-text-secondary/60">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
