import React, { useState } from 'react';
import {
  Folder, LayoutList, ChevronRight, ChevronDown, MessageSquare,
  Youtube, Code, Sparkles, Share2, Globe, Newspaper, Cpu, TrendingUp, ExternalLink, Tag
} from 'lucide-react';
import { ArticleItem, RSSFeed } from './types';
import { detectFeedPlatformInfo, getFeedHomepageUrl } from './utils';

interface SidebarCatalogProps {
  categories: string[];
  feeds?: RSSFeed[];
  activeFeedFilter: string;
  setActiveFeedFilter: (filter: string) => void;
  currentSubModule: string;
  articlesLength: number;
  articles: ArticleItem[];
  savedArticles?: ArticleItem[];
}

export function SidebarCatalog({
  categories,
  feeds = [],
  activeFeedFilter,
  setActiveFeedFilter,
  currentSubModule,
  articlesLength,
  articles,
  savedArticles = [],
}: SidebarCatalogProps) {
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

  // Keep track of expanded category groups in sidebar
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Sosyal Medya & Forumlar': true,
    'Teknoloji': true
  });

  const toggleCategoryExpand = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Sosyal Medya & Forumlar':
        return <Share2 size={15} className="text-orange-400" />;
      case 'Teknoloji':
        return <Cpu size={15} className="text-cyan-400" />;
      case 'Gündem':
        return <Newspaper size={15} className="text-rose-400" />;
      case 'Ekonomi':
        return <TrendingUp size={15} className="text-emerald-400" />;
      default:
        return <Folder size={15} className="text-text-secondary" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Reddit':
        return <MessageSquare size={13} className="text-orange-400" />;
      case 'YouTube':
        return <Youtube size={13} className="text-red-400" />;
      case 'Hacker News':
        return <Code size={13} className="text-amber-400" />;
      case 'Dev.to':
        return <Code size={13} className="text-cyan-400" />;
      case 'Product Hunt':
        return <Sparkles size={13} className="text-rose-400" />;
      default:
        return <Globe size={13} className="text-text-secondary" />;
    }
  };

  return (
    <div className="hidden lg:flex lg:col-span-3 flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full">
      <div className="p-4 border-b border-white/5 bg-black/20 shrink-0 flex items-center justify-between">
        <h3 className="text-xs font-bold font-display text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <Folder size={14} />
          Kaynaklar & Kategoriler
        </h3>
      </div>

      <div className="p-3 overflow-y-auto custom-scrollbar flex-1 space-y-1">
        {/* All Articles */}
        <div>
          <button
            onClick={() => setActiveFeedFilter('all')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
              activeFeedFilter === 'all'
                ? 'bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20'
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

        {/* Category List with Sub-items */}
        {categories.map((cat) => {
          const categoryArticles = articles.filter((a) => a.category === cat);
          const categoryFeeds = feeds.filter((f) => f.category === cat && f.isActive);
          const count = categoryArticles.length;
          const isCatSelected = activeFeedFilter === `category:${cat}`;
          const isExpanded = !!expandedCategories[cat];

          // Group feeds by platform under this category
          const platformsMap = new Map<string, RSSFeed[]>();
          categoryFeeds.forEach(feed => {
            const pInfo = detectFeedPlatformInfo(feed);
            const list = platformsMap.get(pInfo.platform) || [];
            list.push(feed);
            platformsMap.set(pInfo.platform, list);
          });

          return (
            <div key={cat} className="space-y-0.5">
              {/* Category Main Row */}
              <div
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                  isCatSelected
                    ? 'bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }`}
                onClick={() => setActiveFeedFilter(`category:${cat}`)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getCategoryIcon(cat)}
                  <span className="truncate">{cat}</span>
                </div>

                {categoryFeeds.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => toggleCategoryExpand(cat, e)}
                    className="p-1 hover:bg-white/10 rounded-lg text-text-secondary transition-all"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}

                {currentSubModule === 'news' && count > 0 && (
                  <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-md text-text-secondary/60 shrink-0">
                    {count}
                  </span>
                )}
              </div>

              {/* Sub-Items / Platforms List when Expanded */}
              {isExpanded && categoryFeeds.length > 0 && (
                <div className="pl-6 pr-1 py-1 space-y-1 border-l border-white/5 ml-4">
                  {Array.from(platformsMap.entries()).map(([platformName, platformFeeds]) => {
                    const platformCount = categoryArticles.filter(a => {
                      if (a.platform) return a.platform === platformName;
                      return platformFeeds.some(pf => pf.id === a.feedId);
                    }).length;

                    const isPlatformSelected = activeFeedFilter === `platform:${platformName}`;

                    return (
                      <div key={platformName} className="space-y-0.5">
                        <button
                          onClick={() => setActiveFeedFilter(`platform:${platformName}`)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isPlatformSelected
                              ? 'bg-white/10 text-white font-bold'
                              : 'text-text-secondary/80 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {getPlatformIcon(platformName)}
                          <span className="flex-1 text-left truncate">{platformName}</span>
                          {platformCount > 0 && (
                            <span className="text-[9px] bg-white/5 px-1 rounded text-text-secondary/60">
                              {platformCount}
                            </span>
                          )}
                        </button>

                        {/* Sub Feeds / Subreddits under platform */}
                        {platformFeeds.length > 1 && (
                          <div className="pl-4 space-y-0.5 border-l border-white/5 ml-2">
                            {platformFeeds.map((feed) => {
                              const feedCount = categoryArticles.filter(a => a.feedId === feed.id).length;
                              const isFeedSelected = activeFeedFilter === `feed:${feed.id}`;
                              const pInfo = detectFeedPlatformInfo(feed);
                              const hpInfo = getFeedHomepageUrl(feed.url, feed.title);

                              return (
                                <div key={feed.id} className="flex items-center gap-1 group/feeditem">
                                  <button
                                    onClick={() => setActiveFeedFilter(`feed:${feed.id}`)}
                                    className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] transition-all min-w-0 ${
                                      isFeedSelected
                                        ? 'bg-rose-500/20 text-rose-300 font-bold'
                                        : 'text-text-secondary/60 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                                    <span className="flex-1 text-left truncate">
                                      {pInfo.subCategory !== feed.title ? pInfo.subCategory : feed.title}
                                    </span>
                                    {feedCount > 0 && (
                                      <span className="text-[9px] opacity-60">{feedCount}</span>
                                    )}
                                  </button>
                                  <a
                                    href={hpInfo.homepageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 opacity-0 group-hover/feeditem:opacity-100 hover:text-indigo-300 text-text-secondary/50 transition-all rounded"
                                    title={`${hpInfo.homepageUrl} adresine git`}
                                  >
                                    <ExternalLink size={10} />
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Personal Tags Section for Saved Submodule */}
        {currentSubModule === 'saved' && uniqueTags.length > 0 && (
          <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-text-secondary/60 px-3 flex items-center gap-1.5">
              <Tag size={11} className="text-rose-400" />
              Kişisel Etiketler
            </h4>
            <div className="space-y-0.5">
              {uniqueTags.map(tag => {
                const isTagSelected = activeFeedFilter === `tag:${tag}`;
                const count = savedArticles.filter(art => art.tags && art.tags.includes(tag)).length;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveFeedFilter(isTagSelected ? 'all' : `tag:${tag}`)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all ${
                      isTagSelected
                        ? 'bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20'
                        : 'text-text-secondary/80 hover:bg-white/5 hover:text-text-primary'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="flex-1 text-left truncate">{tag}</span>
                    <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-md text-text-secondary/60">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
