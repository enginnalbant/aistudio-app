import React from 'react';
import { Folder, LayoutList } from 'lucide-react';
import { RSSFeed } from './types';

interface SidebarCatalogProps {
  categories: string[];
  activeFeedFilter: string;
  setActiveFeedFilter: (filter: string) => void;
  processedFeeds: RSSFeed[];
  currentSubModule: string;
  articlesLength: number;
}

export function SidebarCatalog({
  categories,
  activeFeedFilter,
  setActiveFeedFilter,
  processedFeeds,
  currentSubModule,
  articlesLength,
}: SidebarCatalogProps) {
  return (
    <div className="hidden lg:flex lg:col-span-3 flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full">
      <div className="p-4 border-b border-white/5 bg-black/20 shrink-0">
        <h3 className="text-xs font-bold font-display text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <Folder size={14} />
          Katalog
        </h3>
      </div>
      <div className="p-3 overflow-y-auto custom-scrollbar flex-1 space-y-4">
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
            <span className="flex-1 text-left">Tüm Akışlar</span>
            {currentSubModule === 'news' && (
              <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-md text-text-secondary/60">
                {articlesLength}
              </span>
            )}
          </button>
        </div>

        {categories.map((cat) => {
          const catFeeds = processedFeeds.filter((f) => f.category === cat && f.isActive !== false);
          if (catFeeds.length === 0) return null;
          const isCatSelected = activeFeedFilter === `category:${cat}`;

          return (
            <div key={cat} className="space-y-1">
              <button
                onClick={() => setActiveFeedFilter(`category:${cat}`)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                  isCatSelected ? 'text-rose-400' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Folder size={14} className={isCatSelected ? 'fill-rose-500/20' : ''} />
                <span className="text-xs font-bold tracking-wide uppercase">{cat}</span>
              </button>

              <div className="pl-6 space-y-0.5">
                {catFeeds.map((feed) => {
                  const isSelected = activeFeedFilter === feed.id;
                  return (
                    <button
                      key={feed.id}
                      onClick={() => setActiveFeedFilter(feed.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                        isSelected
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-text-secondary/80 hover:bg-white/5 hover:text-text-primary'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                      <span className="flex-1 text-left truncate">{feed.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
