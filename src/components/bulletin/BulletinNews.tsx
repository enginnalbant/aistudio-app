import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RSSFeed, ArticleItem, AIDigest } from './types';
import { DEFAULT_FEEDS, CURATED_ARTICLES, CURATED_CATEGORIES } from './constants';
import { parseRSSXml, detectFeedPlatformInfo } from './utils';
import { ArticlesList } from './ArticlesList';
import { ReadingPanel } from './ReadingPanel';
import { SidebarCatalog } from './SidebarCatalog';
import { FeedManager } from './FeedManager';
import { DigestView } from './DigestView';
import { BulletinDashboardView } from './BulletinDashboardView';
import MusicLibraryPlayer from './MusicLibraryPlayer';
import VideoLibraryPlayer from './VideoLibraryPlayer';
import SeriesMoviesLibrary from './SeriesMoviesLibrary';
import MediaDashboard from './MediaDashboard';

interface BulletinNewsProps {
  subModule?: string;
  activeSubModule?: string;
}

export function BulletinNews({ subModule, activeSubModule }: BulletinNewsProps) {
  const rawSubModule = activeSubModule || subModule || 'bulletin-news';

  // Normalize submodule string (e.g. 'bulletin-dashboard' -> 'dashboard')
  const currentSubModule = useMemo(() => {
    if (rawSubModule.startsWith('bulletin-')) {
      return rawSubModule.replace('bulletin-', '');
    }
    return rawSubModule || 'news';
  }, [rawSubModule]);

  // 1. Feeds State
  const [feeds, setFeeds] = useState<RSSFeed[]>(() => {
    try {
      const saved = localStorage.getItem('apexos_rss_feeds');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved feeds:', e);
    }
    return DEFAULT_FEEDS;
  });

  // Save feeds changes
  useEffect(() => {
    localStorage.setItem('apexos_rss_feeds', JSON.stringify(feeds));
  }, [feeds]);

  // 2. Saved & Read Articles
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('apexos_saved_articles');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading saved article IDs:', e);
    }
    return new Set();
  });

  const [savedArticles, setSavedArticles] = useState<ArticleItem[]>(() => {
    try {
      const saved = localStorage.getItem('apexos_saved_articles_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading full saved articles list:', e);
    }
    // Migration fallback
    try {
      const savedIdsStr = localStorage.getItem('apexos_saved_articles');
      if (savedIdsStr) {
        const savedIds = new Set<string>(JSON.parse(savedIdsStr));
        const cachedStr = localStorage.getItem('apexos_rss_cached_articles');
        const cached = cachedStr ? JSON.parse(cachedStr) : [];
        const source = (Array.isArray(cached) && cached.length > 0) ? cached : CURATED_ARTICLES;
        return source.filter((art: any) => savedIds.has(art.id)).map((art: any) => ({
          ...art,
          savedAt: art.savedAt || new Date().toISOString(),
          tags: art.tags || []
        }));
      }
    } catch (e) {
      console.error('Error migrating saved articles:', e);
    }
    return [];
  });

  const [readArticleIds, setReadArticleIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('apexos_read_articles');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading read article IDs:', e);
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('apexos_saved_articles', JSON.stringify(Array.from(savedArticleIds)));
  }, [savedArticleIds]);

  useEffect(() => {
    localStorage.setItem('apexos_saved_articles_list', JSON.stringify(savedArticles));
  }, [savedArticles]);

  useEffect(() => {
    localStorage.setItem('apexos_read_articles', JSON.stringify(Array.from(readArticleIds)));
  }, [readArticleIds]);

  // 3. AI Digests State
  const [digests, setDigests] = useState<AIDigest[]>(() => {
    try {
      const saved = localStorage.getItem('apexos_ai_digests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading digests:', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('apexos_ai_digests', JSON.stringify(digests));
  }, [digests]);

  // 4. Articles Data & Fetching
  const [liveArticles, setLiveArticles] = useState<ArticleItem[]>(() => {
    try {
      const saved = localStorage.getItem('apexos_rss_cached_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading cached articles:', e);
    }
    return CURATED_ARTICLES;
  });

  const [isFetching, setIsFetching] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'comfortable' | 'compact'>('comfortable');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeedFilter, setActiveFeedFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(() => {
    const saved = localStorage.getItem('apexos_rss_cached_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) {}
    }
    return CURATED_ARTICLES[0] || null;
  });
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  // Save articles to cache whenever liveArticles changes
  useEffect(() => {
    try {
      if (liveArticles && liveArticles.length > 0) {
        localStorage.setItem('apexos_rss_cached_articles', JSON.stringify(liveArticles.slice(0, 250)));
      }
    } catch (e) {
      console.error('Error caching articles:', e);
    }
  }, [liveArticles]);

  // 5. AI Summary Panel State
  const [summaryStatus, setSummaryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);

  // Function to fetch live feeds via backend proxy with progressive batched loading
  const fetchLiveFeeds = useCallback(async (isForce = false) => {
    setIsFetching(true);
    const activeFeeds = feeds.filter(f => f.isActive);

    try {
      const CHUNK_SIZE = 5;
      for (let i = 0; i < activeFeeds.length; i += CHUNK_SIZE) {
        const chunk = activeFeeds.slice(i, i + CHUNK_SIZE);
        const chunkItems: ArticleItem[] = [];

        await Promise.allSettled(chunk.map(async (feed) => {
          try {
            const forceParam = isForce ? '&force=true' : '';
            const res = await fetch(`/api/rss-proxy?url=${encodeURIComponent(feed.url)}${forceParam}`);
            if (!res.ok) return;
            const xmlText = await res.text();
            const items = parseRSSXml(xmlText, feed);
            chunkItems.push(...items);
          } catch (err) {
            console.warn(`[fetchLiveFeeds] Could not fetch ${feed.title}:`, err);
          }
        }));

        if (chunkItems.length > 0) {
          setLiveArticles(prev => {
            const articlesMap = new Map<string, ArticleItem>();
            CURATED_ARTICLES.forEach(art => articlesMap.set(art.id, art));
            prev.forEach(art => articlesMap.set(art.id, art));
            chunkItems.forEach(item => articlesMap.set(item.id, item));

            return Array.from(articlesMap.values()).sort((a, b) => {
              return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
            });
          });
        }
      }
    } catch (err) {
      console.error('[fetchLiveFeeds] Global error:', err);
    } finally {
      setIsFetching(false);
    }
  }, [feeds]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLiveFeeds();
  }, []);

  // Filtered Articles based on subModule, search, and category
  const filteredArticles = useMemo(() => {
    // Source from savedArticles if we are in saved mode, to keep them permanently
    let result = currentSubModule === 'saved' ? savedArticles : liveArticles;

    // Category / Platform / Feed Filter
    if (activeFeedFilter.startsWith('category:')) {
      const cat = activeFeedFilter.replace('category:', '');
      result = result.filter(art => art.category === cat);
    } else if (activeFeedFilter.startsWith('platform:')) {
      const plat = activeFeedFilter.replace('platform:', '');
      result = result.filter(art => {
        if (art.platform) return art.platform === plat;
        const feed = feeds.find(f => f.id === art.feedId);
        if (feed) return detectFeedPlatformInfo(feed).platform === plat;
        return art.feedTitle.toLowerCase().includes(plat.toLowerCase());
      });
    } else if (activeFeedFilter.startsWith('feed:')) {
      const feedId = activeFeedFilter.replace('feed:', '');
      result = result.filter(art => art.feedId === feedId);
    } else if (activeFeedFilter.startsWith('tag:')) {
      const tag = activeFeedFilter.replace('tag:', '');
      result = result.filter(art => art.tags && art.tags.includes(tag));
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(art => 
        art.title.toLowerCase().includes(q) ||
        (art.contentSnippet && art.contentSnippet.toLowerCase().includes(q)) ||
        (art.content && art.content.toLowerCase().includes(q)) ||
        art.category.toLowerCase().includes(q) ||
        art.feedTitle.toLowerCase().includes(q) ||
        (art.userNotes && art.userNotes.toLowerCase().includes(q)) ||
        (art.tags && art.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [liveArticles, savedArticles, currentSubModule, activeFeedFilter, searchQuery, feeds]);

  // Categories list
  const categories = useMemo(() => {
    const sourceArticles = currentSubModule === 'saved' ? savedArticles : liveArticles;
    const set = new Set([...CURATED_CATEGORIES, ...feeds.map(f => f.category), ...sourceArticles.map(a => a.category)]);
    return Array.from(set);
  }, [feeds, currentSubModule, savedArticles, liveArticles]);

  // Article selection handler
  const handleSelectArticle = useCallback((article: ArticleItem) => {
    // Try to find the article in savedArticles to preserve custom notes/tags
    const savedArt = savedArticles.find(a => a.id === article.id);
    setSelectedArticle(savedArt || article);
    setReadArticleIds(prev => new Set([...prev, article.id]));
    setIsMobileListOpen(false);
    setSummaryStatus('idle');
    setCurrentSummary(null);
  }, [savedArticles]);

  // Save / Unsave toggle with full object preservation
  const handleToggleSave = useCallback((e: React.MouseEvent, article: ArticleItem) => {
    e.stopPropagation();
    
    setSavedArticleIds(prev => {
      const next = new Set(prev);
      const isCurrentlySaved = next.has(article.id);
      
      if (isCurrentlySaved) {
        next.delete(article.id);
        setSavedArticles(list => list.filter(item => item.id !== article.id));
      } else {
        next.add(article.id);
        const savedItem = { 
          ...article, 
          savedAt: new Date().toISOString(),
          tags: article.tags || []
        };
        setSavedArticles(list => {
          if (list.some(item => item.id === article.id)) return list;
          return [savedItem, ...list];
        });
      }
      return next;
    });
  }, []);

  // Update article notes
  const handleUpdateArticleNotes = useCallback((id: string, notes: string) => {
    setSavedArticles(prev => prev.map(art => {
      if (art.id === id) {
        return { ...art, userNotes: notes };
      }
      return art;
    }));
    setSelectedArticle(prev => {
      if (prev && prev.id === id) {
        return { ...prev, userNotes: notes };
      }
      return prev;
    });
  }, []);

  // Update article tags
  const handleUpdateArticleTags = useCallback((id: string, tags: string[]) => {
    setSavedArticles(prev => prev.map(art => {
      if (art.id === id) {
        return { ...art, tags };
      }
      return art;
    }));
    setSelectedArticle(prev => {
      if (prev && prev.id === id) {
        return { ...prev, tags };
      }
      return prev;
    });
  }, []);

  // Synthesize custom AI Bulletin from saved articles
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesizeDigest = useCallback(async () => {
    if (savedArticles.length === 0) {
      alert("Sentezlenecek kaydedilmiş haber bulunamadı.");
      return;
    }
    
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/bulletin/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: savedArticles.map(a => ({
            category: a.category,
            feedTitle: a.feedTitle,
            title: a.title,
            contentSnippet: a.contentSnippet || a.content || ''
          }))
        })
      });
      
      if (!res.ok) {
        throw new Error("Sentezleme servisi hata döndürdü.");
      }
      
      const newDigest: AIDigest = await res.json();
      newDigest.id = `digest-${Date.now()}`;
      newDigest.createdAt = new Date().toISOString();
      
      // Save to digests
      setDigests(prev => [newDigest, ...prev]);
      
      alert(`"${newDigest.title}" başarıyla sentezlendi ve "Yapay Zeka Bültenleri" sekmesine eklendi!`);
      // Navigate to digests
      if (typeof (window as any).setActiveModule === 'function') {
        (window as any).setActiveModule('bulletin-digest');
      }
    } catch (err: any) {
      console.error("Synthesize error:", err);
      alert("Hata: " + err.message);
    } finally {
      setIsSynthesizing(false);
    }
  }, [savedArticles]);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    const allIds = liveArticles.map(a => a.id);
    setReadArticleIds(new Set(allIds));
  }, [liveArticles]);

  // Feed management handlers
  const handleToggleFeed = useCallback((id: string) => {
    setFeeds(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  }, []);

  const handleAddFeed = useCallback((newFeed: Omit<RSSFeed, 'id'>) => {
    const id = `feed-${Date.now()}`;
    setFeeds(prev => [...prev, { ...newFeed, id }]);
  }, []);

  const handleDeleteFeed = useCallback((id: string) => {
    setFeeds(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleImportOPML = useCallback((imported: { title: string; url: string; category: string }[]) => {
    setFeeds(prev => {
      const existingUrls = new Set(prev.map(f => f.url));
      const newEntries: RSSFeed[] = imported
        .filter(item => !existingUrls.has(item.url))
        .map((item, idx) => ({
          id: `opml-${Date.now()}-${idx}`,
          title: item.title,
          url: item.url,
          category: item.category || 'Genel',
          isActive: true,
          isDefault: false
        }));
      return [...prev, ...newEntries];
    });
  }, []);

  const handleResetDefaultFeeds = useCallback(() => {
    if (window.confirm('Varsayılan RSS kanalları yüklenecek ve liste sıfırlanacak. Onaylıyor musunuz?')) {
      setFeeds(DEFAULT_FEEDS);
      localStorage.removeItem('apexos_rss_feeds');
    }
  }, []);

  // AI Article Summarizer (TL;DR)
  const generateAIContext = useCallback(async (article: ArticleItem) => {
    setSummaryStatus('loading');
    setCurrentSummary(null);

    try {
      const res = await fetch('/api/bulletin/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content || article.contentSnippet
        })
      });

      if (!res.ok) {
        throw new Error('Yapay zeka özetleme servisi hata döndürdü.');
      }

      const data = await res.json();
      setCurrentSummary(data.summary);
      setSummaryStatus('success');
    } catch (err: any) {
      console.error('Summarizer error:', err);
      setSummaryStatus('error');
    }
  }, []);

  // Save AI Digest
  const handleSaveDigest = useCallback((digest: AIDigest) => {
    setDigests(prev => [digest, ...prev.filter(d => d.id !== digest.id)]);
  }, []);

  // Render view based on submodule
  return (
    <div className="w-full h-full p-2 lg:p-4 bg-background flex flex-col font-sans overflow-hidden">
      {currentSubModule === 'dashboard' && (
        <BulletinDashboardView
          articles={liveArticles}
          feeds={feeds}
          savedArticles={savedArticles}
          readArticleIds={readArticleIds}
          savedArticlesCount={savedArticles.length}
          unreadArticlesCount={liveArticles.length - readArticleIds.size}
          onNavigateToNews={() => {
            if (typeof (window as any).setActiveModule === 'function') {
              (window as any).setActiveModule('bulletin-news');
            }
          }}
          onNavigateToDigest={() => {
            if (typeof (window as any).setActiveModule === 'function') {
              (window as any).setActiveModule('bulletin-digest');
            }
          }}
          onNavigateToFeeds={() => {
            if (typeof (window as any).setActiveModule === 'function') {
              (window as any).setActiveModule('bulletin-feeds');
            }
          }}
          onNavigateToSaved={() => {
            if (typeof (window as any).setActiveModule === 'function') {
              (window as any).setActiveModule('bulletin-saved');
            }
          }}
          onSelectArticle={handleSelectArticle}
          onMarkAllAsRead={handleMarkAllAsRead}
          onRefreshFeeds={fetchLiveFeeds}
          isFetching={isFetching}
          onToggleSave={handleToggleSave}
          onUpdateFeeds={setFeeds}
        />
      )}

      {(currentSubModule === 'news' || currentSubModule === 'saved') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
          <SidebarCatalog
            categories={categories}
            feeds={feeds}
            activeFeedFilter={activeFeedFilter}
            setActiveFeedFilter={setActiveFeedFilter}
            currentSubModule={currentSubModule}
            articlesLength={currentSubModule === 'saved' ? savedArticles.length : liveArticles.length}
            articles={currentSubModule === 'saved' ? savedArticles : liveArticles}
            savedArticles={savedArticles}
          />

          <ArticlesList
            currentSubModule={currentSubModule}
            isLoading={isFetching}
            onRefresh={fetchLiveFeeds}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredArticles={filteredArticles}
            selectedArticle={selectedArticle}
            handleSelectArticle={handleSelectArticle}
            readArticleIds={readArticleIds}
            savedArticleIds={savedArticleIds}
            isMobileListOpen={isMobileListOpen}
            articlesLength={filteredArticles.length}
            savedArticles={savedArticles}
            onClearAllSaved={() => {
              if (window.confirm("Tüm kaydedilen haberleri silmek istediğinizden emin misiniz?")) {
                setSavedArticles([]);
                setSavedArticleIds(new Set());
                setSelectedArticle(null);
              }
            }}
            onSynthesizeDigest={handleSynthesizeDigest}
            isSynthesizing={isSynthesizing}
            activeFeedFilter={activeFeedFilter}
            setActiveFeedFilter={setActiveFeedFilter}
          />

          <ReadingPanel
            selectedArticle={selectedArticle}
            isMobileListOpen={isMobileListOpen}
            setIsMobileListOpen={setIsMobileListOpen}
            savedArticleIds={savedArticleIds}
            handleToggleSave={handleToggleSave}
            summaryStatus={summaryStatus}
            currentSummary={currentSummary}
            generateAIContext={generateAIContext}
            currentSubModule={currentSubModule}
            onUpdateNotes={handleUpdateArticleNotes}
            onUpdateTags={handleUpdateArticleTags}
          />
        </div>
      )}

      {currentSubModule === 'digest' && (
        <DigestView
          articles={liveArticles}
          digests={digests}
          onSaveDigest={handleSaveDigest}
          onSelectArticleFromDigest={(topic) => {
            const found = liveArticles.find(a => a.title.toLowerCase().includes(topic.toLowerCase()));
            if (found) {
              handleSelectArticle(found);
            }
          }}
        />
      )}

      {currentSubModule === 'feeds' && (
        <FeedManager
          feeds={feeds}
          onToggleFeed={handleToggleFeed}
          onAddFeed={handleAddFeed}
          onDeleteFeed={handleDeleteFeed}
          onImportOPML={handleImportOPML}
          onResetDefaultFeeds={handleResetDefaultFeeds}
          onUpdateFeeds={setFeeds}
        />
      )}

      {currentSubModule === 'music' && (
        <MusicLibraryPlayer />
      )}

      {currentSubModule === 'video-dashboard' && (
        <MediaDashboard onNavigate={(mod) => {
          if (typeof (window as any).setActiveModule === 'function') {
            (window as any).setActiveModule(mod);
          }
        }} />
      )}

      {currentSubModule === 'videos' && (
        <VideoLibraryPlayer />
      )}

      {currentSubModule === 'series-movies' && (
        <SeriesMoviesLibrary />
      )}
    </div>
  );
}
