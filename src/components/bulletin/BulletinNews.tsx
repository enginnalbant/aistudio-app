import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rss, Folder, Plus, Search, ExternalLink, Bookmark, Check, 
  Trash2, X, RefreshCw, LayoutTemplate, LayoutList, 
  ChevronLeft, Sparkles, AlertCircle, Info, Globe, CheckSquare,
  Layers, Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query, where } from 'firebase/firestore';

export interface RSSFeed {
  id: string;
  title: string;
  url: string;
  category: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ArticleItem {
  id: string;
  feedId: string;
  feedTitle: string;
  category: string;
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  contentSnippet: string;
  content: string;
  image?: string;
}

const DEFAULT_FEEDS: RSSFeed[] = [
  // Teknoloji (Global)
  { id: 'hn', title: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'tc', title: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'verge', title: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'wired', title: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'engadget', title: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'arstechnica', title: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Teknoloji', isDefault: true, isActive: true },
  
  // Teknoloji (Türkiye)
  { id: 'webrazzi', title: 'Webrazzi', url: 'https://webrazzi.com/feed', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'shiftdelete', title: 'ShiftDelete.Net', url: 'https://shiftdelete.net/feed', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'donanimhaber', title: 'DonanımHaber', url: 'https://www.donanimhaber.com/rss/tum/', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'webtekno', title: 'Webtekno', url: 'https://www.webtekno.com/rss.xml', category: 'Teknoloji', isDefault: true, isActive: true },

  // Bilim
  { id: 'nasa', title: 'NASA Image of the Day', url: 'https://www.nasa.gov/feeds/iotd-feed/', category: 'Bilim', isDefault: true, isActive: true },
  { id: 'sciencedaily', title: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'Bilim', isDefault: true, isActive: true },
  { id: 'physorg', title: 'Phys.org', url: 'https://phys.org/rss-feed/', category: 'Bilim', isDefault: true, isActive: true },
  { id: 'arxiv_cs_ai', title: 'arXiv · Computer Science & AI', url: 'https://arxiv.org/rss/cs.AI', category: 'Bilim', isDefault: true, isActive: true },
  { id: 'evrimagaci', title: 'Evrim Ağacı', url: 'https://evrimagaci.org/rss.xml', category: 'Bilim', isDefault: true, isActive: true },
  
  // Haber & Gündem (Global)
  { id: 'bbc_world', title: 'BBC World News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'Haber', isDefault: true, isActive: true },
  { id: 'aljazeera', title: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'Haber', isDefault: true, isActive: true },
  { id: 'dw_english', title: 'DW English', url: 'https://rss.dw.com/xml/rss-en-all', category: 'Haber', isDefault: true, isActive: true },
  { id: 'npr', title: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'Haber', isDefault: true, isActive: true },

  // Haber & Gündem (Türkiye)
  { id: 'bbc_turkce', title: 'BBC Türkçe', url: 'https://feeds.bbci.co.uk/turkce/rss.xml', category: 'Haber', isDefault: true, isActive: true },
  { id: 'trthaber', title: 'TRT Haber', url: 'https://www.trthaber.com/manset_articles.rss', category: 'Haber', isDefault: true, isActive: true },
  { id: 'aa_guncel', title: 'Anadolu Ajansı', url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', category: 'Haber', isDefault: true, isActive: true },
  { id: 'ntv', title: 'NTV', url: 'https://www.ntv.com.tr/gundem.rss', category: 'Haber', isDefault: true, isActive: true },
  { id: 'sozcu', title: 'Sözcü', url: 'https://www.sozcu.com.tr/feeds-rss-category-gundem', category: 'Haber', isDefault: true, isActive: true },
  { id: 'dw_turkce', title: 'DW Türkçe', url: 'https://rss.dw.com/xml/rss-tur-all', category: 'Haber', isDefault: true, isActive: true },

  // Finans & Ekonomi
  { id: 'bloomberg', title: 'Bloomberg HT', url: 'https://www.bloomberght.com/rss', category: 'Finans', isDefault: true, isActive: true },
  { id: 'coindesk', title: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss', category: 'Finans', isDefault: true, isActive: true },
  { id: 'investing_tr', title: 'Investing Türkiye', url: 'https://tr.investing.com/rss/news.rss', category: 'Finans', isDefault: true, isActive: true },
  { id: 'wsj_markets', title: 'WSJ Markets', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'Finans', isDefault: true, isActive: true },
  { id: 'ekonomist', title: 'Ekonomist', url: 'https://www.ekonomist.com.tr/rss', category: 'Finans', isDefault: true, isActive: true },

  // Tasarım, Ürün & Kültür
  { id: 'producthunt', title: 'Product Hunt Today', url: 'https://www.producthunt.com/feed', category: 'Tasarım & Ürün', isDefault: true, isActive: true },
  { id: 'smashingmag', title: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', category: 'Tasarım & Ürün', isDefault: true, isActive: true },
  { id: 'css_tricks', title: 'CSS-Tricks', url: 'https://css-tricks.com/feed/', category: 'Tasarım & Ürün', isDefault: true, isActive: true },
  { id: 'openculture', title: 'Open Culture', url: 'https://www.openculture.com/feed', category: 'Kültür & Sanat', isDefault: true, isActive: true },
  { id: 'smithsonian', title: 'Smithsonian', url: 'https://www.smithsonianmag.com/rss/latest_articles/', category: 'Kültür & Sanat', isDefault: true, isActive: true },
];

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
    return feeds.map(feed => ({
      ...feed,
      isActive: feedStates[feed.id] !== false
    }));
  }, [feeds, feedStates]);

  const categories = useMemo(() => {
    return Array.from(new Set(processedFeeds.map(f => f.category))).sort();
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
      snapshot.forEach(doc => {
        custom.push({ id: doc.id, ...doc.data() } as RSSFeed);
      });
      setFeeds([...DEFAULT_FEEDS, ...custom]);
      setFeedsLoaded(true);
    });

    const feedStatesQuery = query(collection(db, 'bulletin_feed_states'), where('userId', '==', user.uid));
    const unsubStates = onSnapshot(feedStatesQuery, (snapshot) => {
      const states: Record<string, boolean> = {};
      snapshot.forEach(doc => {
        states[doc.data().feedId] = doc.data().isActive;
      });
      setFeedStates(states);
    });

    const savedQuery = query(collection(db, 'bulletin_saved'), where('userId', '==', user.uid));
    const unsubSaved = onSnapshot(savedQuery, (snapshot) => {
      const ids = new Set<string>();
      const savedList: ArticleItem[] = [];
      snapshot.forEach(doc => {
        ids.add(doc.data().articleId);
        savedList.push(doc.data().articleData as ArticleItem);
      });
      setSavedArticleIds(ids);
      setSavedArticlesLocal(savedList);
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

    const activeFeeds = processedFeeds.filter(f => f.isActive !== false);
    
    try {
      const fetchPromises = activeFeeds.map(async (feed) => {
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
            let snippet = item.contentSnippet || item.content || '';
            snippet = snippet.replace(/<[^>]+>/g, '').trim().slice(0, 250);

            let image = item.image || item.enclosure?.url || '';
            if (!image && item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
                image = item.mediaContent['$'].url;
            }
            if (!image && item.content) {
              const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/i);
              if (imgMatch) image = imgMatch[1];
            }

            const guid = item.guid || item.id || item.link;

            return {
              id: `${feed.id}-${guid}`,
              feedId: feed.id,
              feedTitle: feed.title,
              category: feed.category,
              title: item.title,
              link: item.link,
              pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
              creator: item.creator || feed.title,
              contentSnippet: snippet,
              content: item.content || item.contentSnippet,
              image: image
            } as ArticleItem;
          });
        } catch (e) {
          console.error('Fetch error for', feed.url, e);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const combined = results.flat().filter(a => a.title).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      
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
  }, [feedsLoaded, processedFeeds, currentSubModule]);

  // Filtering
  const filteredArticles = useMemo(() => {
    let list = currentSubModule === 'saved' ? savedArticlesLocal : articles;
    if (activeFeedFilter !== 'all') {
      if (activeFeedFilter.startsWith('category:')) {
        const catName = activeFeedFilter.replace('category:', '');
        list = list.filter(a => a.category === catName);
      } else {
        list = list.filter(a => a.feedId === activeFeedFilter);
      }
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
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
          savedAt: new Date().toISOString()
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
        updatedAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
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

  const generateAIContext = async (article: ArticleItem) => {
    setSummaryStatus('loading');
    try {
      const res = await fetch('/api/bulletin/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.contentSnippet || article.title
        })
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

  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diffMins < 60) return `${diffMins} dk önce`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} saat önce`;
      return `${Math.floor(diffHrs / 24)} gün önce`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 px-6 pt-6 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
            <Rss className="text-rose-500" size={28} />
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
        {(currentSubModule === 'news' || currentSubModule === 'saved') ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full items-stretch overflow-hidden">
            {/* LEFT SIDEBAR */}
            <div className="hidden lg:flex lg:col-span-3 flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full">
              <div className="p-4 border-b border-white/5 bg-black/20 shrink-0">
                <h3 className="text-xs font-bold font-display text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} />
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
                        {articles.length}
                      </span>
                    )}
                  </button>
                </div>

                {categories.map(cat => {
                  const catFeeds = processedFeeds.filter(f => f.category === cat && f.isActive !== false);
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
                        {catFeeds.map(feed => {
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

            {/* MIDDLE PANEL */}
            <div className={`col-span-1 lg:col-span-4 flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full ${
              !isMobileListOpen && selectedArticle ? 'hidden lg:flex' : 'flex'
            }`}>
              <div className="p-4 border-b border-white/5 bg-black/20 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-display font-bold text-text-primary flex items-center gap-2">
                    {currentSubModule === 'saved' ? 'Kaydedilenler' : 'Son Gelişmeler'}
                    {isLoading && <RefreshCw size={14} className="animate-spin text-text-secondary" />}
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={fetchRSSFeeds}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                      title="Yenile"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <div className="flex bg-white/5 rounded-lg p-0.5">
                      <button 
                        onClick={() => setLayoutMode('comfortable')}
                        className={`p-1 rounded-md transition-all ${layoutMode === 'comfortable' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
                      >
                        <LayoutTemplate size={14} />
                      </button>
                      <button 
                        onClick={() => setLayoutMode('compact')}
                        className={`p-1 rounded-md transition-all ${layoutMode === 'compact' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
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
                {isLoading && articles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-text-secondary space-y-3">
                    <RefreshCw size={24} className="animate-spin text-rose-500" />
                    <p className="text-xs font-mono">Bültenler senkronize ediliyor...</p>
                  </div>
                ) : filteredArticles.length > 0 ? (
                  filteredArticles.map(article => {
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
                            {article.feedTitle}
                          </span>
                          <span className="text-[10px] text-text-secondary/60 font-mono shrink-0">
                            {formatTimeAgo(article.pubDate)}
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-1 space-y-1 min-w-0">
                            <h3 className={`font-bold font-sans text-sm leading-snug line-clamp-2 ${
                              isSelected ? 'text-white' : isRead ? 'text-text-secondary' : 'text-text-primary'
                            }`}>
                              {article.title}
                            </h3>
                            {layoutMode === 'comfortable' && article.contentSnippet && (
                              <p className="text-xs text-text-secondary/70 line-clamp-2 leading-relaxed">
                                {article.contentSnippet}
                              </p>
                            )}
                          </div>
                          {layoutMode === 'comfortable' && article.image && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                              <img src={article.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            {isSaved && <Bookmark size={12} className="text-rose-500 fill-rose-500" />}
                            {isRead && <Check size={12} className="text-emerald-500" />}
                          </div>
                          <span className="text-[10px] text-text-secondary/50 font-medium truncate max-w-[150px]">
                            {article.creator}
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

            {/* RIGHT PANEL */}
            <div className={`col-span-1 lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full flex flex-col ${
              isMobileListOpen && selectedArticle ? 'hidden lg:flex' : 'flex'
            }`}>
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
                          {selectedArticle.feedTitle}
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
                        title={savedArticleIds.has(selectedArticle.id) ? "Kaydedilenlerden Çıkar" : "Kaydet"}
                      >
                        <Bookmark size={16} className={savedArticleIds.has(selectedArticle.id) ? "fill-current" : ""} />
                      </button>
                      <a
                        href={selectedArticle.link}
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
                          <span className="bg-white/5 px-2.5 py-1 rounded-lg font-bold">{selectedArticle.category}</span>
                          <span>•</span>
                          <span className="opacity-70">{new Date(selectedArticle.pubDate).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}</span>
                          {selectedArticle.creator && (
                            <>
                              <span>•</span>
                              <span className="opacity-70">Yazar: {selectedArticle.creator}</span>
                            </>
                          )}
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-display font-black text-text-primary leading-tight">
                          {selectedArticle.title}
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
                                "Özet bulunamadı."
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="prose prose-invert prose-rose max-w-none prose-p:text-text-secondary/90 prose-p:leading-loose prose-a:text-rose-400 prose-img:rounded-2xl prose-headings:font-display prose-headings:font-bold prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-rose-300">
                        <div dangerouslySetInnerHTML={{ __html: selectedArticle.content || selectedArticle.contentSnippet }} />
                      </div>
                      
                      <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <a
                          href={selectedArticle.link}
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
                    <Rss size={24} className="opacity-50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-text-primary">Okuma Paneli</h3>
                    <p className="text-sm mt-1 max-w-xs">Listeden bir haber seçerek reklamsız okuma modunda görüntüleyin.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : currentSubModule === 'manage' ? (
          <div className="flex flex-col space-y-6 overflow-y-auto custom-scrollbar h-full lg:pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch shrink-0">
              {/* Info Summary */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase">Özet İstatistikler</span>
                  <h3 className="text-xl font-display font-bold text-text-primary mt-1 mb-3">Akış Kaynakları</h3>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Bülteninizdeki tüm haber kaynaklarını buradan yönetebilir, dilediğiniz kategoriyi geçici olarak deaktif edebilir veya kendi özel akışlarınızı ekleyebilirsiniz.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-text-secondary font-bold block">Toplam Kaynak</span>
                    <span className="text-2xl font-display font-black text-rose-500 mt-1 block">
                      {processedFeeds.length}
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-text-secondary font-bold block">Aktif Akışlar</span>
                    <span className="text-2xl font-display font-black text-emerald-500 mt-1 block">
                      {processedFeeds.filter(f => f.isActive !== false).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                <div className="mb-4">
                  <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                    <Info size={12} />
                    Kullanım Koşulları ve Hukuki Sınırlar
                  </span>
                  <h3 className="text-xl font-display font-bold text-text-primary mt-1 mb-2">Adil RSS Kullanım Bildirgesi</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-black/20 border border-white/5 p-3.5 rounded-2xl">
                    <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                      <Globe size={13} className="text-rose-400" />
                      Doğrudan Yerel Çekim
                    </h4>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      Tüm akışlar doğrudan yayıncıların resmi XML uçlarından RSS/Atom protokolü ile çekilir. Sunucularımızda hiçbir makale verisi kopyalanmaz.
                    </p>
                  </div>

                  <div className="space-y-1 bg-black/20 border border-white/5 p-3.5 rounded-2xl">
                    <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                      <ExternalLink size={13} className="text-amber-400" />
                      Orijinal Kaynak Yönlendirmesi
                    </h4>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      Telif haklarına saygı gösterilir. Kullanıcılar her zaman yayıncının kendi orijinal web sitesine yönlendirilir.
                    </p>
                  </div>

                  <div className="space-y-1 bg-black/20 border border-white/5 p-3.5 rounded-2xl">
                    <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                      <Sparkles size={13} className="text-indigo-400" />
                      Özetleme ve Adil Kullanım
                    </h4>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      Yapay zeka TL;DR özetleri, adil kullanım (fair use) kapsamında anlık konsept kavrayışı sağlamak üzere tasarlanmıştır.
                    </p>
                  </div>

                  <div className="space-y-1 bg-black/20 border border-white/5 p-3.5 rounded-2xl">
                    <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                      <CheckSquare size={13} className="text-emerald-400" />
                      Kişisel Deneyim Odaklı
                    </h4>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      Bu bülten ticari bir yeniden dağıtım aracı değildir. Kapalı devre, kişisel okuma asistanı standartlarına göre dizayn edilmiştir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Custom Feed */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shrink-0">
              <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase">Hızlı Entegrasyon</span>
              <h3 className="text-lg font-display font-bold text-text-primary mt-1 mb-4">Yeni RSS/Atom Akışı Tanımla</h3>
              
              <form onSubmit={handleAddFeed} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-xs">
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-text-secondary font-bold">Akış Başlığı / Yayıncı</label>
                  <input
                    type="text"
                    placeholder="Örn: Bilim Teknik"
                    value={newFeedTitle}
                    onChange={(e) => setNewFeedTitle(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-sans font-semibold"
                  />
                </div>

                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-text-secondary font-bold">Resmi RSS URL Adresi</label>
                  <input
                    type="url"
                    placeholder="https://yayinici.com/rss.xml"
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-mono"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-text-secondary font-bold">Kategori Klasörü</label>
                  <select
                    value={newFeedCategory}
                    onChange={(e) => setNewFeedCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-sans font-bold"
                  >
                    <option value="Teknoloji" className="bg-neutral-900 text-text-primary">Teknoloji</option>
                    <option value="Bilim" className="bg-neutral-900 text-text-primary">Bilim</option>
                    <option value="Finans" className="bg-neutral-900 text-text-primary">Finans</option>
                    <option value="Haber" className="bg-neutral-900 text-text-primary">Haber</option>
                    <option value="Tasarım & Ürün" className="bg-neutral-900 text-text-primary">Tasarım & Ürün</option>
                    <option value="Kültür & Sanat" className="bg-neutral-900 text-text-primary">Kültür & Sanat</option>
                    <option value="Diğer" className="bg-neutral-900 text-text-primary">Diğer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="md:col-span-2 bg-rose-600 hover:bg-rose-700 text-white font-bold h-[38px] rounded-xl transition-all shadow-lg shadow-rose-600/10 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Akışı Kaydet
                </button>
              </form>
            </div>

            {/* Feeds List */}
            <div className="space-y-6 pb-6">
              {categories.map(cat => {
                const catFeeds = processedFeeds.filter(f => f.category === cat);
                if (catFeeds.length === 0) return null;

                return (
                  <div key={cat} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Folder size={16} className="text-rose-500/80" />
                      <h4 className="text-sm font-display font-black text-text-primary uppercase tracking-wider">{cat} Klasörü</h4>
                      <span className="text-[10px] font-mono bg-white/5 text-text-secondary px-2 py-0.5 rounded-full font-bold">
                        {catFeeds.length} Kaynak
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catFeeds.map(feed => (
                        <div 
                          key={feed.id} 
                          className={`bg-white/[0.02] border rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-300 hover:bg-white/[0.04] ${
                            feed.isActive !== false ? 'border-white/5' : 'border-white/5 opacity-60'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1 min-w-0">
                              <h5 className="font-sans font-bold text-xs text-text-primary truncate" title={feed.title}>
                                {feed.title}
                              </h5>
                              <a 
                                href={feed.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="font-mono text-[9px] text-text-secondary/60 hover:text-rose-400 flex items-center gap-1 truncate"
                              >
                                <ExternalLink size={8} />
                                {feed.url}
                              </a>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {feed.isDefault ? (
                                <span className="text-[8px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full tracking-wider">
                                  SİSTEM
                                </span>
                              ) : (
                                <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full tracking-wider">
                                  KİŞİSEL
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <span className={`relative flex h-2 w-2`}>
                                {feed.isActive !== false && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                  feed.isActive !== false ? 'bg-emerald-500' : 'bg-neutral-600'
                                }`}></span>
                              </span>
                              <span className="text-[10px] text-text-secondary font-bold">
                                {feed.isActive !== false ? 'Aktif Akış' : 'Devredışı'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => handleToggleFeedStatus(e, feed.id)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  feed.isActive !== false ? 'bg-rose-500' : 'bg-neutral-700'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    feed.isActive !== false ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>

                              {!feed.isDefault && (
                                <button
                                  onClick={(e) => handleDeleteFeed(e, feed.id)}
                                  className="text-text-secondary/60 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                                  title="Kaynağı Sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
