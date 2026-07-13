import React, { useState, useEffect, useMemo } from 'react';
import { Rss, Bookmark, Sliders } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query, where, writeBatch } from 'firebase/firestore';

import { RSSFeed, ArticleItem, OPMLImportItem } from './types';
import { DEFAULT_FEEDS } from './constants';
import { SidebarCatalog } from './SidebarCatalog';
import { ArticlesList } from './ArticlesList';
import { ReadingPanel } from './ReadingPanel';
import { SourceManager } from './SourceManager';
import { ensureString, ensureLink } from './utils';

interface BulletinNewsProps {
  activeSubModule?: string;
}

export function BulletinNews({ activeSubModule = 'news' }: BulletinNewsProps) {
  const { user } = useAuth();
  const [currentSubModule, setCurrentSubModule] = useState(activeSubModule);

  useEffect(() => {
    setCurrentSubModule(activeSubModule);
  }, [activeSubModule]);

  // States
  const [feeds, setFeeds] = useState<RSSFeed[]>(DEFAULT_FEEDS);
  const [feedStates, setFeedStates] = useState<Record<string, boolean>>({});
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [savedArticlesLocal, setSavedArticlesLocal] = useState<ArticleItem[]>([]);
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());
  const [readArticleIds, setReadArticleIds] = useState<Set<string>>(new Set());
  const [feedsLoaded, setFeedsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // UI States
  const [activeFeedFilter, setActiveFeedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'comfortable' | 'compact'>('comfortable');

  // Form States
  const [newFeedTitle, setNewFeedTitle] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedCategory, setNewFeedCategory] = useState('Teknoloji');

  // AI Summary States
  const [summaryStatus, setSummaryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);

  const processedFeeds = useMemo(() => {
    return feeds.map((feed) => ({
      ...feed,
      isActive: feedStates[feed.id] !== false,
    }));
  }, [feeds, feedStates]);

  const categories = useMemo(() => {
    return Array.from(new Set(processedFeeds.map((f) => f.category))).sort();
  }, [processedFeeds]);

  // Load Data
  useEffect(() => {
    if (!user) {
      setFeeds([...DEFAULT_FEEDS]);
      setFeedsLoaded(true);
      return;
    }

    const customFeedsQuery = query(collection(db, 'bulletin_custom_feeds'), where('userId', '==', user.uid));
    const unsubFeeds = onSnapshot(customFeedsQuery, (snapshot) => {
      const custom: RSSFeed[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        custom.push({
          id: doc.id,
          ...data,
          title: ensureString(data.title),
          category: ensureString(data.category || 'Diğer'),
          url: ensureString(data.url)
        } as RSSFeed);
      });
      setFeeds([...DEFAULT_FEEDS, ...custom]);
      setFeedsLoaded(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bulletin_custom_feeds');
    });

    const feedStatesQuery = query(collection(db, 'bulletin_feed_states'), where('userId', '==', user.uid));
    const unsubStates = onSnapshot(feedStatesQuery, (snapshot) => {
      const states: Record<string, boolean> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        states[ensureString(data.feedId)] = data.isActive === true || data.isActive === undefined || data.isActive === 'true';
      });
      setFeedStates(states);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bulletin_feed_states');
    });

    const savedQuery = query(collection(db, 'bulletin_saved'), where('userId', '==', user.uid));
    const unsubSaved = onSnapshot(savedQuery, (snapshot) => {
      const ids = new Set<string>();
      const savedList: ArticleItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const articleId = ensureString(data.articleId);
        ids.add(articleId);
        const art = data.articleData;
        if (art) {
          savedList.push({
            id: ensureString(art.id || articleId),
            feedId: ensureString(art.feedId),
            feedTitle: ensureString(art.feedTitle),
            category: ensureString(art.category || 'Diğer'),
            title: ensureString(art.title),
            link: ensureString(art.link),
            pubDate: ensureString(art.pubDate),
            creator: ensureString(art.creator),
            contentSnippet: ensureString(art.contentSnippet),
            content: ensureString(art.content),
            image: ensureString(art.image),
          } as ArticleItem);
        }
      });
      setSavedArticleIds(ids);
      setSavedArticlesLocal(savedList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bulletin_saved');
    });

    const readLocal = localStorage.getItem('bulletin_read_articles');
    if (readLocal) {
      try {
        setReadArticleIds(new Set(JSON.parse(readLocal)));
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      unsubFeeds();
      unsubStates();
      unsubSaved();
    };
  }, [user]);

  // Fetch Feeds
  const fetchRSSFeeds = async () => {
    if (!feedsLoaded) return;
    setIsLoading(true);

    const activeFeeds = processedFeeds.filter((f) => f.isActive !== false);

    // Only fetch feeds matching the active filter to optimize network and backend resources
    let feedsToFetch = activeFeeds;
    if (activeFeedFilter !== 'all') {
      if (activeFeedFilter.startsWith('category:')) {
        const catName = activeFeedFilter.replace('category:', '');
        feedsToFetch = activeFeeds.filter((f) => f.category === catName);
      } else {
        feedsToFetch = activeFeeds.filter((f) => f.id === activeFeedFilter);
      }
    }

    try {
      const results: ArticleItem[][] = [];
      const CHUNK_SIZE = 15;

      for (let i = 0; i < feedsToFetch.length; i += CHUNK_SIZE) {
        const chunk = feedsToFetch.slice(i, i + CHUNK_SIZE);
        const chunkPromises = chunk.map(async (feed) => {
          try {
            const res = await fetch(`/api/rss-proxy?url=${encodeURIComponent(feed.url)}`);
            if (!res.ok) {
              console.error('RSS Proxy HTTP Error:', res.status, feed.url);
              return [];
            }
            const data = await res.json();
            if (!data || !data.items) {
              console.error('RSS API Data Error:', data, feed.url);
              return [];
            }

            return data.items.slice(0, 15).map((item: any) => {
              const rawTitle = ensureString(item.title);
              const rawContent = ensureString(item.content || '');
              const rawSnippet = ensureString(item.contentSnippet || '');
              
              let snippet = rawSnippet || rawContent || '';
              snippet = snippet.replace(/<[^>]+>/g, '').trim().slice(0, 250);

              let image = '';
              if (item.image) {
                if (typeof item.image === 'string') {
                  image = item.image;
                } else if (typeof item.image === 'object' && item.image.$ && item.image.$.url) {
                  image = ensureString(item.image.$.url);
                }
              }
              if (!image && item.enclosure && item.enclosure.url) {
                image = ensureString(item.enclosure.url);
              }
              if (!image && item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
                image = ensureString(item.mediaContent['$'].url);
              }
              if (!image && rawContent) {
                const imgMatch = rawContent.match(/<img[^>]+src="([^">]+)"/i);
                if (imgMatch) image = imgMatch[1];
              }

              const guid = ensureString(item.guid || item.id || item.link);
              const link = ensureLink(item.link);
              const pubDate = ensureString(item.isoDate || item.pubDate || new Date().toISOString());
              const creator = ensureString(item.creator || feed.title);

              return {
                id: `${feed.id}-${guid}`,
                feedId: feed.id,
                feedTitle: feed.title,
                category: feed.category,
                title: rawTitle,
                link: link,
                pubDate: pubDate,
                creator: creator,
                contentSnippet: snippet,
                content: rawContent || snippet,
                image: image,
              } as ArticleItem;
            });
          } catch (e) {
            console.error('Fetch error for', feed.url, e);
            return [];
          }
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);

        // Give a tiny breather to the browser main thread
        if (feedsToFetch.length > CHUNK_SIZE) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      const combined = results
        .flat()
        .filter((a) => a.title)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      setArticles(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (feedsLoaded && currentSubModule === 'news') {
      fetchRSSFeeds();
    }
  }, [feedsLoaded, processedFeeds, currentSubModule, activeFeedFilter]);

  // Filtering
  const filteredArticles = useMemo(() => {
    let list = currentSubModule === 'saved' ? savedArticlesLocal : articles;
    if (activeFeedFilter !== 'all') {
      if (activeFeedFilter.startsWith('category:')) {
        const catName = activeFeedFilter.replace('category:', '');
        list = list.filter((a) => a.category === catName);
      } else {
        list = list.filter((a) => a.feedId === activeFeedFilter);
      }
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.feedTitle.toLowerCase().includes(q) ||
          a.contentSnippet.toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, savedArticlesLocal, activeFeedFilter, searchQuery, currentSubModule]);

  // Handlers
  const handleSelectArticle = (art: ArticleItem) => {
    setSelectedArticle(art);
    setIsMobileListOpen(false);
    setSummaryStatus('idle');
    setCurrentSummary(null);

    if (!readArticleIds.has(art.id)) {
      const newRead = new Set(readArticleIds);
      newRead.add(art.id);
      setReadArticleIds(newRead);
      localStorage.setItem('bulletin_read_articles', JSON.stringify(Array.from(newRead)));
    }
  };

  const handleToggleSave = async (e: React.MouseEvent, art: ArticleItem) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const docId = `${user.uid}_${art.id.replace(/[\/\.#$\[\]]/g, '_')}`;
      const docRef = doc(db, 'bulletin_saved', docId);

      if (savedArticleIds.has(art.id)) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          userId: user.uid,
          articleId: art.id,
          articleData: art,
          savedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeedStatus = async (e: React.MouseEvent, feedId: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const currentStatus = feedStates[feedId] !== false;
      const docId = `${user.uid}_${feedId}`;
      await setDoc(doc(db, 'bulletin_feed_states', docId), {
        userId: user.uid,
        feedId: feedId,
        isActive: !currentStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const newId = 'custom_' + Date.now().toString();
      await setDoc(doc(db, 'bulletin_custom_feeds', newId), {
        userId: user.uid,
        title: newFeedTitle,
        url: newFeedUrl,
        category: newFeedCategory,
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      setNewFeedTitle('');
      setNewFeedUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFeed = async (e: React.MouseEvent, feedId: string) => {
    e.stopPropagation();
    if (!user || !feedId.startsWith('custom_')) return;
    if (!window.confirm('Bu kaynağı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'bulletin_custom_feeds', feedId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportOPML = async (importedFeeds: OPMLImportItem[]) => {
    if (!user || importedFeeds.length === 0) return;
    try {
      const CHUNK_SIZE = 150;
      for (let i = 0; i < importedFeeds.length; i += CHUNK_SIZE) {
        const chunk = importedFeeds.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        
        chunk.forEach((feed) => {
          const newId = 'custom_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
          const docRef = doc(db, 'bulletin_custom_feeds', newId);
          batch.set(docRef, {
            userId: user.uid,
            title: feed.title,
            url: feed.url,
            category: feed.category || 'Diğer',
            isDefault: false,
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        });
        
        await batch.commit();
        // Wait slightly between batches to avoid overloading the local network or Firestore connection
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    } catch (err) {
      console.error('Failed to import OPML feeds:', err);
      throw err;
    }
  };

  const generateAIContext = async (article: ArticleItem) => {
    setSummaryStatus('loading');
    try {
      const res = await fetch('/api/bulletin/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.contentSnippet || article.title,
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setCurrentSummary(data.summary);
      setSummaryStatus('success');
    } catch (err) {
      console.error(err);
      setSummaryStatus('error');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 px-6 pt-6 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
            <Rss className="text-rose-500 animate-pulse" size={28} />
            APEXOS Bülten
          </h1>
          <p className="text-text-secondary text-sm">
            Resmi ve yasal kaynaklardan derlenen haberler, konforlu okuma paneli.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setCurrentSubModule('news')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 ${
                currentSubModule === 'news'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                  : 'text-text-secondary hover:text-text-primary border border-transparent'
              }`}
            >
              <Rss size={13} />
              Haber Akışı
            </button>
            <button
              onClick={() => setCurrentSubModule('saved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 ${
                currentSubModule === 'saved'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                  : 'text-text-secondary hover:text-text-primary border border-transparent'
              }`}
            >
              <Bookmark size={13} />
              Kaydedilenler
            </button>
            <button
              onClick={() => setCurrentSubModule('manage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 ${
                currentSubModule === 'manage'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                  : 'text-text-secondary hover:text-text-primary border border-transparent'
              }`}
            >
              <Sliders size={13} />
              Kaynak Yönetimi
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative p-6">
        {currentSubModule === 'news' || currentSubModule === 'saved' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full items-stretch overflow-hidden">
            {/* LEFT SIDEBAR - Catalog */}
            <SidebarCatalog
              categories={categories}
              activeFeedFilter={activeFeedFilter}
              setActiveFeedFilter={setActiveFeedFilter}
              processedFeeds={processedFeeds}
              currentSubModule={currentSubModule}
              articlesLength={articles.length}
            />

            {/* MIDDLE PANEL - Articles list */}
            <ArticlesList
              currentSubModule={currentSubModule}
              isLoading={isLoading}
              fetchRSSFeeds={fetchRSSFeeds}
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
              articlesLength={articles.length}
            />

            {/* RIGHT PANEL - Reading pane */}
            <ReadingPanel
              selectedArticle={selectedArticle}
              isMobileListOpen={isMobileListOpen}
              setIsMobileListOpen={setIsMobileListOpen}
              savedArticleIds={savedArticleIds}
              handleToggleSave={handleToggleSave}
              summaryStatus={summaryStatus}
              currentSummary={currentSummary}
              generateAIContext={generateAIContext}
            />
          </div>
        ) : currentSubModule === 'manage' ? (
          <SourceManager
            processedFeeds={processedFeeds}
            categories={categories}
            newFeedTitle={newFeedTitle}
            setNewFeedTitle={setNewFeedTitle}
            newFeedUrl={newFeedUrl}
            setNewFeedUrl={setNewFeedUrl}
            newFeedCategory={newFeedCategory}
            setNewFeedCategory={setNewFeedCategory}
            handleAddFeed={handleAddFeed}
            handleToggleFeedStatus={handleToggleFeedStatus}
            handleDeleteFeed={handleDeleteFeed}
            handleImportOPML={handleImportOPML}
          />
        ) : null}
      </div>
    </div>
  );
}
