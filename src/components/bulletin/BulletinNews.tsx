import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rss, 
  Search, 
  Plus, 
  BookOpen, 
  Bookmark, 
  Check, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Trash2, 
  Folder, 
  HelpCircle, 
  RefreshCw, 
  Heart, 
  X, 
  Layers, 
  ArrowLeft,
  LayoutDashboard,
  CheckSquare,
  BookmarkCheck,
  Zap,
  Info,
  Globe,
  Compass,
  Sliders,
  Eye,
  Code
} from 'lucide-react';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Interfaces for local structure
export interface RSSFeed {
  id: string;
  title: string;
  url: string;
  category: string;
  isDefault?: boolean;
}

export interface ArticleItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  creator?: string;
  content: string;
  contentSnippet: string;
  feedId: string;
  feedTitle: string;
  category: string;
  image?: string;
  isRead?: boolean;
  isSaved?: boolean;
}

export interface RSSHubParam {
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'select';
  options?: { label: string; value: string }[];
  defaultValue?: string;
}

export interface RSSHubRoute {
  id: string;
  name: string;
  category: string;
  desc: string;
  pathTemplate: string;
  params: RSSHubParam[];
  exampleInputs: Record<string, string>;
}

// Pre-defined default feeds (some official feeds, some RSSHub feeds)
const DEFAULT_FEEDS: RSSFeed[] = [
  { id: 'hn', title: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'Teknoloji', isDefault: true },
  { id: 'tc', title: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Teknoloji', isDefault: true },
  { id: 'webtekno', title: 'Webtekno', url: 'https://www.webtekno.com/rss.xml', category: 'Teknoloji', isDefault: true },
  { id: 'bloomberg', title: 'Bloomberg HT', url: 'https://www.bloomberght.com/rss', category: 'Finans', isDefault: true },
  { id: 'coindesk', title: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss', category: 'Finans', isDefault: true },
  { id: 'nasa', title: 'NASA Image of the Day', url: 'https://www.nasa.gov/feeds/iotd-feed/', category: 'Bilim', isDefault: true },
  { id: 'popsci', title: 'Popular Science', url: 'https://www.popsci.com/feed/', category: 'Bilim', isDefault: true },
  { id: 'producthunt', title: 'Product Hunt Today (RSSHub)', url: 'https://rsshub.app/producthunt/today', category: 'Tasarım & Ürün', isDefault: true }
];

// Suggested RSSHub discovery channels
const RSSHUB_DISCOVERY = [
  { title: 'GitHub Günlük Trendler', url: 'https://rsshub.app/github/trending/daily/any', category: 'Teknoloji', desc: 'Geliştiriciler için günlük popüler projeler' },
  { title: 'Dribbble Popüler Haftalık', url: 'https://rsshub.app/dribbble/popular/week', category: 'Tasarım & Ürün', desc: 'Dünyanın en iyi tasarımcılarından haftalık popüler işler' },
  { title: 'Reddit Technology', url: 'https://rsshub.app/reddit/r/technology/hot', category: 'Teknoloji', desc: 'Reddit üzerindeki en sıcak teknoloji tartışmaları' },
  { title: 'Dev.to En İyiler', url: 'https://rsshub.app/devto/top/week', category: 'Teknoloji', desc: 'Yazılımcılar için haftalık popüler makaleler' }
];

// Full catalog of standard RSSHub routing templates
const RSSHUB_CATALOG_ROUTES: RSSHubRoute[] = [
  {
    id: 'yt_channel',
    name: 'YouTube Kanalı',
    category: 'Sosyal Medya & Video',
    desc: 'Bir YouTube kanalının yayınladığı en son videoları ve video bültenini takip edin.',
    pathTemplate: '/youtube/channel/:channelId',
    params: [
      { name: 'channelId', label: 'YouTube Kanal ID\'si (UC...)', placeholder: 'Örn: UCXuqSBlHAE6Xw-yeJA0Tunw', type: 'text' }
    ],
    exampleInputs: { channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw' }
  },
  {
    id: 'gh_trending',
    name: 'GitHub Günlük/Haftalık Trendler',
    category: 'Programlama & Teknoloji',
    desc: 'Yazılım dillerine göre GitHub üzerinde o günün veya haftanın en popüler depolarını takip edin.',
    pathTemplate: '/github/trending/:lang/:span',
    params: [
      { name: 'lang', label: 'Yazılım Dili (Küçük harflerle)', placeholder: 'Örn: typescript, python, rust, go, css veya any', type: 'text', defaultValue: 'any' },
      { name: 'span', label: 'Zaman Dilimi', type: 'select', options: [
        { label: 'Günlük (Daily)', value: 'daily' },
        { label: 'Haftalık (Weekly)', value: 'weekly' },
        { label: 'Aylık (Monthly)', value: 'monthly' }
      ], defaultValue: 'daily' }
    ],
    exampleInputs: { lang: 'typescript', span: 'daily' }
  },
  {
    id: 'gh_releases',
    name: 'GitHub Depo Yeni Sürümleri (Releases)',
    category: 'Programlama & Teknoloji',
    desc: 'Takip ettiğiniz açık kaynaklı bir kütüphanenin veya projenin yeni sürümlerinden anında haberdar olun.',
    pathTemplate: '/github/repos/releases/:user/:repo',
    params: [
      { name: 'user', label: 'Geliştirici veya Kurum Adı', placeholder: 'Örn: facebook', type: 'text' },
      { name: 'repo', label: 'Depo (Repository) Adı', placeholder: 'Örn: react', type: 'text' }
    ],
    exampleInputs: { user: 'facebook', repo: 'react' }
  },
  {
    id: 'reddit_r',
    name: 'Reddit Subreddit Akışı',
    category: 'Sosyal Medya & Video',
    desc: 'İstediğiniz bir subreddit grubundaki en yeni veya en popüler tartışmaları takip edin.',
    pathTemplate: '/reddit/r/:subreddit/:type',
    params: [
      { name: 'subreddit', label: 'Subreddit Grubu Adı', placeholder: 'Örn: technology', type: 'text' },
      { name: 'type', label: 'Sıralama Türü', type: 'select', options: [
        { label: 'Sıcak (Hot)', value: 'hot' },
        { label: 'Yeni (New)', value: 'new' },
        { label: 'En Popüler (Top)', value: 'top' }
      ], defaultValue: 'hot' }
    ],
    exampleInputs: { subreddit: 'technology', type: 'hot' }
  },
  {
    id: 'medium_user',
    name: 'Medium Yazar veya Yayın Akışı',
    category: 'Sosyal Medya & Video',
    desc: 'Takip ettiğiniz Medium yazarlarının veya teknik blogların (örn: Netflix TechBlog) yeni yazılarını bülteninize ekleyin.',
    pathTemplate: '/medium/user/:username',
    params: [
      { name: 'username', label: 'Yazar Kullanıcı Adı veya Kurum İsmi', placeholder: 'Örn: netflix-techblog', type: 'text' }
    ],
    exampleInputs: { username: 'netflix-techblog' }
  },
  {
    id: 'devto_tag',
    name: 'Dev.to Yazılım Makaleleri',
    category: 'Programlama & Teknoloji',
    desc: 'Yazılımcılar için Dev.to üzerindeki belirli bir etikete veya popüler yazılara abone olun.',
    pathTemplate: '/devto/:tag',
    params: [
      { name: 'tag', label: 'Etiket veya Tür (Tag)', placeholder: 'Örn: javascript, webdev, python, beginners veya top', type: 'text', defaultValue: 'top' }
    ],
    exampleInputs: { tag: 'javascript' }
  },
  {
    id: 'dribbble_pop',
    name: 'Dribbble Popüler Tasarımlar',
    category: 'Programlama & Teknoloji',
    desc: 'Dünya çapındaki tasarımcıların Dribbble üzerinde yayınladığı en popüler arayüz ve grafik tasarımları.',
    pathTemplate: '/dribbble/popular/:time',
    params: [
      { name: 'time', label: 'Zaman Dilimi', type: 'select', options: [
        { label: 'Haftalık (Week)', value: 'week' },
        { label: 'Aylık (Month)', value: 'month' },
        { label: 'Tüm Zamanlar (Ever)', value: 'ever' }
      ], defaultValue: 'week' }
    ],
    exampleInputs: { time: 'week' }
  },
  {
    id: 'behance_user',
    name: 'Behance Portfolyo Takibi',
    category: 'Sosyal Medya & Video',
    desc: 'Seçkin bir tasarımcının Behance üzerinde paylaştığı son projeleri takip edin.',
    pathTemplate: '/behance/:user',
    params: [
      { name: 'user', label: 'Kullanıcı Adı', placeholder: 'Örn: creative', type: 'text' }
    ],
    exampleInputs: { user: 'creative' }
  },
  {
    id: 'steam_news',
    name: 'Steam Oyun Haberleri & Güncellemeler',
    category: 'Eğlence & Multimedya',
    desc: 'Büyük oyunların güncellemelerini, yama notlarını ve resmi duyurularını bülteninize bağlayın.',
    pathTemplate: '/steam/news/:appid',
    params: [
      { name: 'appid', label: 'Steam Oyun ID\'si (AppID)', placeholder: 'Örn: 730 (CS2), 570 (Dota 2), 1085660 (Destiny 2)', type: 'text' }
    ],
    exampleInputs: { appid: '730' }
  },
  {
    id: 'nasa_apod',
    name: 'NASA Günün Gökbilim Görüntüsü (APOD)',
    category: 'Bilim & Genel',
    desc: 'NASA tarafından her gün yayınlanan evrenin eşsiz fotoğraf ve açıklamalarına doğrudan ulaşın.',
    pathTemplate: '/nasa/apod',
    params: [],
    exampleInputs: {}
  },
  {
    id: 'bbc_tr',
    name: 'BBC Türkçe Son Dakika',
    category: 'Bilim & Genel',
    desc: 'Dünya ve Türkiye gündemine dair tarafsız son dakika bülteni.',
    pathTemplate: '/bbc/turkce',
    params: [],
    exampleInputs: {}
  }
];

interface BulletinNewsProps {
  activeSubModule?: string; // 'dashboard', 'news', 'saved'
}

export function BulletinNews({ activeSubModule = 'news' }: BulletinNewsProps) {
  const { user } = useAuth();
  
  // State for feeds, articles, saved posts
  const [feeds, setFeeds] = useState<RSSFeed[]>(DEFAULT_FEEDS);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  
  // App state managers
  const [loadingFeeds, setLoadingFeeds] = useState<Record<string, boolean>>({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [activeFeedFilter, setActiveFeedFilter] = useState<string>('all'); // feedId or 'all' or 'category:name'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bookmarks & Read States
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());
  const [savedArticlesLocal, setSavedArticlesLocal] = useState<ArticleItem[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<Set<string>>(new Set());
  
  // AI summary states
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  
  // Modals / Inputs
  const [isNewFeedOpen, setIsNewFeedOpen] = useState(false);
  const [newFeedTitle, setNewFeedTitle] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedCategory, setNewFeedCategory] = useState('Teknoloji');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [readerFontSize, setReaderFontSize] = useState<number>(15); // in px

  // RSSHub Wizard and Catalog Explorer States
  const [modalTab, setModalTab] = useState<'manual' | 'rsshub'>('rsshub');
  const [rsshubSearch, setRsshubSearch] = useState('');
  const [selectedRsshubCategory, setSelectedRsshubCategory] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState<RSSHubRoute | null>(null);
  const [routeParamValues, setRouteParamValues] = useState<Record<string, string>>({});
  const [rsshubInstance, setRsshubInstance] = useState('https://rsshub.app');
  const [customInstanceUrl, setCustomInstanceUrl] = useState('https://rsshub.live');
  const [rsshubFeedTitle, setRsshubFeedTitle] = useState('');
  const [rsshubFeedCategory, setRsshubFeedCategory] = useState('Teknoloji');

  // Compute live generated RSSHub url
  const generatedRsshubUrl = useMemo(() => {
    if (!selectedRoute) return '';
    const instance = rsshubInstance === 'custom' ? customInstanceUrl : rsshubInstance;
    let urlPath = selectedRoute.pathTemplate;
    selectedRoute.params.forEach(p => {
      const val = routeParamValues[p.name] !== undefined ? routeParamValues[p.name] : (p.defaultValue || '');
      urlPath = urlPath.replace(`:${p.name}`, val);
    });
    
    const protocolMatch = instance.match(/^(https?:\/\/)/);
    const protocol = protocolMatch ? protocolMatch[1] : '';
    const rest = instance.slice(protocol.length);
    const cleanRest = rest.endsWith('/') ? rest.slice(0, -1) : rest;
    
    let cleanPath = urlPath;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }
    return `${protocol}${cleanRest}/${cleanPath}`;
  }, [selectedRoute, routeParamValues, rsshubInstance, customInstanceUrl]);

  // Sync state values when selectedRoute changes
  useEffect(() => {
    if (selectedRoute) {
      const initialValues: Record<string, string> = {};
      selectedRoute.params.forEach(p => {
        initialValues[p.name] = p.defaultValue || '';
      });
      setRouteParamValues(initialValues);
      setRsshubFeedTitle(selectedRoute.name);
      
      let mappedCat = 'Teknoloji';
      if (selectedRoute.category === 'Sosyal Medya & Video') {
        mappedCat = 'Diğer';
      } else if (selectedRoute.category === 'Programlama & Teknoloji') {
        mappedCat = 'Teknoloji';
      } else if (selectedRoute.category === 'Eğlence & Multimedya') {
        mappedCat = 'Diğer';
      } else if (selectedRoute.category === 'Bilim & Genel') {
        mappedCat = 'Bilim';
      }
      setRsshubFeedCategory(mappedCat);
    } else {
      setRouteParamValues({});
      setRsshubFeedTitle('');
    }
  }, [selectedRoute]);

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(feeds.map(f => f.category));
    return Array.from(list);
  }, [feeds]);

  // Load Saved Articles and Feeds from Firestore if logged in, else LocalStorage
  useEffect(() => {
    if (user) {
      // Sync Custom Feeds from Firestore
      const feedsPath = `users/${user.uid}/rss_feeds`;
      const unsubscribeFeeds = onSnapshot(collection(db, feedsPath), (snapshot) => {
        const customFeeds: RSSFeed[] = [];
        snapshot.forEach((doc) => {
          customFeeds.push({ id: doc.id, ...doc.data() } as RSSFeed);
        });
        setFeeds([...DEFAULT_FEEDS, ...customFeeds]);
      });

      // Sync Saved/Bookmarked Articles from Firestore
      const savedPath = `users/${user.uid}/rss_saved`;
      const unsubscribeSaved = onSnapshot(collection(db, savedPath), (snapshot) => {
        const savedList: ArticleItem[] = [];
        const savedIds = new Set<string>();
        snapshot.forEach((doc) => {
          const art = doc.data() as ArticleItem;
          savedList.push(art);
          savedIds.add(art.id);
        });
        setSavedArticlesLocal(savedList);
        setSavedArticleIds(savedIds);
      });

      return () => {
        unsubscribeFeeds();
        unsubscribeSaved();
      };
    } else {
      // Offline/Guest fallback: Load from LocalStorage
      try {
        const localFeedsStr = localStorage.getItem('apex_custom_feeds');
        if (localFeedsStr) {
          const custom = JSON.parse(localFeedsStr);
          setFeeds([...DEFAULT_FEEDS, ...custom]);
        }
        
        const localSavedStr = localStorage.getItem('apex_saved_articles');
        if (localSavedStr) {
          const savedList = JSON.parse(localSavedStr) as ArticleItem[];
          setSavedArticlesLocal(savedList);
          setSavedArticleIds(new Set(savedList.map(a => a.id)));
        }

        const localReadStr = localStorage.getItem('apex_read_articles');
        if (localReadStr) {
          setReadArticleIds(new Set(JSON.parse(localReadStr)));
        }
      } catch (err) {
        console.error("Local storage loading error", err);
      }
    }
  }, [user]);

  // Trigger Toast Notification Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all active feeds on launch or filter change
  const fetchAllFeeds = async (feedsToFetch: RSSFeed[]) => {
    setGlobalLoading(true);
    let allArticles: ArticleItem[] = [];

    // Parallel fetch using Promise.all
    const promises = feedsToFetch.map(async (feed) => {
      setLoadingFeeds(prev => ({ ...prev, [feed.id]: true }));
      try {
        const proxyUrl = `/api/rss-proxy?url=${encodeURIComponent(feed.url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Proxy error");
        
        const data = await response.json();
        
        if (data && data.items) {
          const feedArticles: ArticleItem[] = data.items.map((item: any, idx: number) => {
            // Robust image extractor
            let image = null;
            if (item.enclosure && item.enclosure.url) {
              image = item.enclosure.url;
            } else if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
              image = item.mediaContent.$.url;
            } else {
              // Extract from HTML
              const contentStr = item.content || item.description || '';
              const match = contentStr.match(/<img[^>]+src="([^">]+)"/i);
              if (match && match[1]) image = match[1];
            }

            return {
              id: item.guid || item.link || `${feed.id}-${idx}`,
              title: item.title || 'Başlıksız Makale',
              link: item.link || '',
              pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
              creator: item.creator || item.author || feed.title,
              content: item.content || item.description || 'İçerik bulunmuyor.',
              contentSnippet: item.contentSnippet || (item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 180) : 'Özet bulunmuyor.'),
              feedId: feed.id,
              feedTitle: feed.title,
              category: feed.category,
              image: image || undefined
            };
          });
          allArticles = [...allArticles, ...feedArticles];
        }
      } catch (err) {
        console.warn(`Could not load feed: ${feed.title}`, err);
      } finally {
        setLoadingFeeds(prev => ({ ...prev, [feed.id]: false }));
      }
    });

    await Promise.all(promises);

    // Sort by Date descending
    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    setArticles(allArticles);
    setGlobalLoading(false);
  };

  // Trigger feed loading
  useEffect(() => {
    if (feeds.length > 0) {
      fetchAllFeeds(feeds);
    }
  }, [feeds]);

  // Handle Save / Bookmark Article
  const handleToggleSaveArticle = async (e: React.MouseEvent, article: ArticleItem) => {
    e.stopPropagation();
    const isCurrentlySaved = savedArticleIds.has(article.id);
    
    if (user) {
      // Cloud Firestore save
      const docRef = doc(db, `users/${user.uid}/rss_saved`, encodeURIComponent(article.id));
      if (isCurrentlySaved) {
        await deleteDoc(docRef);
        showToast("Makale kaydedilenlerden kaldırıldı.");
      } else {
        await setDoc(docRef, { ...article, isSaved: true });
        showToast("Makale başarıyla bülteninize kaydedildi!");
      }
    } else {
      // LocalStorage fallback
      let updatedSaved = [...savedArticlesLocal];
      if (isCurrentlySaved) {
        updatedSaved = updatedSaved.filter(a => a.id !== article.id);
        showToast("Makale kaydedilenlerden kaldırıldı.");
      } else {
        updatedSaved.push({ ...article, isSaved: true });
        showToast("Makale bülteninize kaydedildi! (Konuk Oturumu)");
      }
      setSavedArticlesLocal(updatedSaved);
      setSavedArticleIds(new Set(updatedSaved.map(a => a.id)));
      localStorage.setItem('apex_saved_articles', JSON.stringify(updatedSaved));
    }
  };

  // Handle Mark Article as Read
  const handleMarkAsRead = (articleId: string) => {
    if (readArticleIds.has(articleId)) return;
    const nextRead = new Set(readArticleIds);
    nextRead.add(articleId);
    setReadArticleIds(nextRead);
    if (!user) {
      localStorage.setItem('apex_read_articles', JSON.stringify(Array.from(nextRead)));
    }
  };

  // Add Custom Feed
  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedTitle.trim() || !newFeedUrl.trim()) {
      showToast("Lütfen tüm alanları doldurun.", "error");
      return;
    }

    const newFeed: RSSFeed = {
      id: `feed_${Date.now()}`,
      title: newFeedTitle,
      url: newFeedUrl,
      category: newFeedCategory
    };

    if (user) {
      // Save custom feed in user's profile on Firestore
      try {
        await setDoc(doc(db, `users/${user.uid}/rss_feeds`, newFeed.id), newFeed);
        showToast("Yeni akış başarıyla eklendi ve senkronize edildi!");
      } catch (err) {
        showToast("Akış eklenirken hata oluştu.", "error");
      }
    } else {
      // LocalStorage
      const localFeedsStr = localStorage.getItem('apex_custom_feeds');
      const customFeeds = localFeedsStr ? JSON.parse(localFeedsStr) : [];
      customFeeds.push(newFeed);
      localStorage.setItem('apex_custom_feeds', JSON.stringify(customFeeds));
      setFeeds([...DEFAULT_FEEDS, ...customFeeds]);
      showToast("Yeni akış eklendi! (Konuk Oturumu)");
    }

    // Reset inputs & close modal
    setNewFeedTitle('');
    setNewFeedUrl('');
    setIsNewFeedOpen(false);
  };

  // One-click subscription to recommended RSSHub discoveries
  const handleSubscribeToDiscovery = async (discovery: typeof RSSHUB_DISCOVERY[0]) => {
    const newFeed: RSSFeed = {
      id: `feed_${Date.now()}`,
      title: discovery.title,
      url: discovery.url,
      category: discovery.category
    };

    if (user) {
      await setDoc(doc(db, `users/${user.uid}/rss_feeds`, newFeed.id), newFeed);
      showToast(`${discovery.title} bülteninize eklendi!`);
    } else {
      const localFeedsStr = localStorage.getItem('apex_custom_feeds');
      const customFeeds = localFeedsStr ? JSON.parse(localFeedsStr) : [];
      customFeeds.push(newFeed);
      localStorage.setItem('apex_custom_feeds', JSON.stringify(customFeeds));
      setFeeds([...DEFAULT_FEEDS, ...customFeeds]);
      showToast(`${discovery.title} eklendi! (Konuk Oturumu)`);
    }
  };

  // Subscribe to generated custom RSSHub route stream
  const handleSubscribeToRSSHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) {
      showToast("Lütfen bir RSSHub kaynağı seçin.", "error");
      return;
    }
    
    if (!rsshubFeedTitle.trim()) {
      showToast("Lütfen akış için bir başlık girin.", "error");
      return;
    }

    const finalUrl = generatedRsshubUrl;
    if (!finalUrl) {
      showToast("Lütfen tüm parametreleri doldurun.", "error");
      return;
    }

    const newFeed: RSSFeed = {
      id: `feed_${Date.now()}`,
      title: rsshubFeedTitle,
      url: finalUrl,
      category: rsshubFeedCategory
    };

    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/rss_feeds`, newFeed.id), newFeed);
        showToast(`"${rsshubFeedTitle}" başarıyla RSSHub bülteninize eklendi!`);
      } catch (err) {
        showToast("Akış eklenirken bir hata oluştu.", "error");
      }
    } else {
      const localFeedsStr = localStorage.getItem('apex_custom_feeds');
      const customFeeds = localFeedsStr ? JSON.parse(localFeedsStr) : [];
      customFeeds.push(newFeed);
      localStorage.setItem('apex_custom_feeds', JSON.stringify(customFeeds));
      setFeeds([...DEFAULT_FEEDS, ...customFeeds]);
      showToast(`"${rsshubFeedTitle}" bülteninize eklendi! (Konuk Oturumu)`);
    }

    // Reset wizard & close modal
    setSelectedRoute(null);
    setRsshubSearch('');
    setIsNewFeedOpen(false);
  };

  // Delete Custom Feed
  const handleDeleteFeed = async (e: React.MouseEvent, feedId: string) => {
    e.stopPropagation();
    if (window.confirm("Bu yayını bülteninizden silmek istediğinize emin misiniz?")) {
      if (user) {
        await deleteDoc(doc(db, `users/${user.uid}/rss_feeds`, feedId));
        showToast("Yayın akışı bültenden silindi.");
      } else {
        const localFeedsStr = localStorage.getItem('apex_custom_feeds');
        if (localFeedsStr) {
          let custom = JSON.parse(localFeedsStr) as RSSFeed[];
          custom = custom.filter(f => f.id !== feedId);
          localStorage.setItem('apex_custom_feeds', JSON.stringify(custom));
          setFeeds([...DEFAULT_FEEDS, ...custom]);
          showToast("Yayın akışı silindi. (Konuk Oturumu)");
        }
      }
    }
  };

  // Call server-side Gemini AI for TL;DR summary
  const handleAiSummarize = async (article: ArticleItem) => {
    if (aiSummaries[article.id]) return; // Already summarized
    setSummarizingId(article.id);
    
    try {
      // Strip HTML tag content for cleaner API processing
      const cleanContent = article.content.replace(/<[^>]*>/g, '').substring(0, 4000);
      const res = await fetch('/api/bulletin/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: cleanContent || article.contentSnippet
        })
      });

      if (!res.ok) throw new Error("Yapay zeka servisi yanıt vermedi.");
      const data = await res.json();
      if (data && data.summary) {
        setAiSummaries(prev => ({ ...prev, [article.id]: data.summary }));
        showToast("Yapay Zeka özet bülteni hazırlandı!", "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Özet oluşturulurken bir hata oluştu.", "error");
    } finally {
      setSummarizingId(null);
    }
  };

  // Filter and Search Articles
  const filteredArticles = useMemo(() => {
    let list = activeSubModule === 'saved' ? savedArticlesLocal : articles;

    // Filter by Feed Selection
    if (activeFeedFilter !== 'all') {
      if (activeFeedFilter.startsWith('category:')) {
        const catName = activeFeedFilter.replace('category:', '');
        list = list.filter(a => a.category === catName);
      } else if (activeFeedFilter === 'saved') {
        list = list.filter(a => savedArticleIds.has(a.id));
      } else if (activeFeedFilter === 'unread') {
        list = list.filter(a => !readArticleIds.has(a.id));
      } else {
        list = list.filter(a => a.feedId === activeFeedFilter);
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.contentSnippet.toLowerCase().includes(q) || 
        (a.creator && a.creator.toLowerCase().includes(q)) ||
        a.feedTitle.toLowerCase().includes(q)
      );
    }

    return list;
  }, [articles, savedArticlesLocal, activeFeedFilter, searchQuery, activeSubModule, savedArticleIds, readArticleIds]);

  // Handle article tap
  const handleSelectArticle = (art: ArticleItem) => {
    setSelectedArticle(art);
    handleMarkAsRead(art.id);
  };

  // Render article content with simple HTML parsing or safe representation
  const renderCleanContent = (htmlContent: string) => {
    // Basic sanitizing for safety inside our styled div
    const clean = htmlContent
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/g, '');
    
    return (
      <div 
        className="prose prose-invert max-w-none text-text-primary leading-relaxed space-y-4"
        style={{ fontSize: `${readerFontSize}px` }}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  };

  // Statistics for Dashboard View
  const unreadCount = useMemo(() => {
    return Math.max(0, articles.length - readArticleIds.size);
  }, [articles, readArticleIds]);

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-2 md:p-4 space-y-6 overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? <CheckSquare size={18} /> : <Info size={18} />}
            <span className="text-xs font-bold font-sans">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
            <Rss className="text-rose-500" size={28} />
            Bülten & Akıllı RSS Haber Merkezi
          </h1>
          <p className="text-text-secondary text-sm">
            RSSHub ağ entegrasyonu, bülten klasörleri ve Folo esintili ultra konforlu okuma paneli.
          </p>
        </div>
        <button 
          onClick={() => setIsNewFeedOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-rose-600/20 self-stretch md:self-auto justify-center"
        >
          <Plus size={16} />
          Yeni Yayın Akışı (RSS)
        </button>
      </div>

      {/* MAIN LAYOUT: Bento stats, Feed Folders, Article Feed, & Distraction-free Reading Pane */}
      {activeSubModule === 'dashboard' ? (
        /* ================= BENTO DASHBOARD VIEW ================= */
        <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Feeds Count */}
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                <Rss size={24} />
              </div>
              <div>
                <h3 className="text-xs text-text-secondary">Aktif RSS Abonelikleri</h3>
                <p className="text-2xl font-mono font-bold text-text-primary">{feeds.length}</p>
              </div>
            </div>

            {/* Unread Items */}
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-xs text-text-secondary">Okunmamış Akış</h3>
                <p className="text-2xl font-mono font-bold text-text-primary">{unreadCount}</p>
              </div>
            </div>

            {/* Bookmarks */}
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Bookmark size={24} />
              </div>
              <div>
                <h3 className="text-xs text-text-secondary">Bültene Kaydedilen</h3>
                <p className="text-2xl font-mono font-bold text-text-primary">{savedArticlesLocal.length}</p>
              </div>
            </div>

            {/* AI Summaries */}
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-xs text-text-secondary">Yapay Zeka Özetleri</h3>
                <p className="text-2xl font-mono font-bold text-text-primary">{Object.keys(aiSummaries).length}</p>
              </div>
            </div>

          </div>

          {/* Quick Categories Navigation */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg font-display font-bold text-text-primary mb-4 flex items-center gap-2">
              <Folder size={18} className="text-rose-400" />
              Kategorilere Göre Keşfet
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => {
                const count = feeds.filter(f => f.category === cat).length;
                return (
                  <div 
                    key={cat}
                    onClick={() => {
                      setActiveFeedFilter(`category:${cat}`);
                      // Trigger route action via global window callback if needed or simulated switch
                      if ((window as any).setActiveModule) (window as any).setActiveModule('bulletin-news');
                    }}
                    className="p-4 bg-white/[0.01] border border-white/5 hover:border-rose-500/20 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-all group"
                  >
                    <h3 className="font-bold text-text-primary group-hover:text-rose-400 transition-colors">{cat}</h3>
                    <p className="text-[11px] text-text-secondary mt-1">{count} yayın kanalı</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discovery feeds & RSSHub Suggestion Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Discovery block */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
              <div>
                <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                  Keşfet: RSSHub Kanalları
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  RSSHub altyapısını kullanan popüler veri akışlarını tek tıklamayla bülteninize dahil edin.
                </p>
              </div>

              <div className="space-y-3">
                {RSSHUB_DISCOVERY.map(disc => (
                  <div 
                    key={disc.title}
                    className="flex justify-between items-center p-3 bg-black/20 border border-white/5 rounded-xl hover:border-white/10 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">{disc.title}</span>
                        <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded-full font-semibold uppercase">{disc.category}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">{disc.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleSubscribeToDiscovery(disc)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg transition-all"
                    >
                      Takip Et
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent top highlights block */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                <Clock size={18} className="text-rose-400" />
                Günün Son Haberleri
              </h2>
              <div className="space-y-3 divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {articles.slice(0, 5).map(art => (
                  <div 
                    key={art.id} 
                    onClick={() => handleSelectArticle(art)}
                    className="pt-3 first:pt-0 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-rose-400 font-bold">{art.feedTitle}</span>
                      <span className="text-[10px] text-text-secondary">•</span>
                      <span className="text-[10px] text-text-secondary">{new Date(art.pubDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h4 className="text-xs font-bold text-text-primary group-hover:text-rose-400 transition-colors line-clamp-1">{art.title}</h4>
                  </div>
                ))}
                {articles.length === 0 && (
                  <div className="text-center py-12 text-text-secondary text-xs">Yayınlar yükleniyor...</div>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ================= DUAL PANE FEED READER VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[75vh] items-stretch overflow-hidden">
          
          {/* 1. LEFT COLUMN: Feeds and Folders (Span 3) */}
          <div className="lg:col-span-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            
            {/* Quick Filter Section */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-2">Bülten Filtreleri</span>
              
              <button 
                onClick={() => setActiveFeedFilter('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFeedFilter === 'all' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/5' 
                    : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Rss size={14} />
                  <span>Tüm Haberler</span>
                </div>
                <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full text-text-secondary">{articles.length}</span>
              </button>

              <button 
                onClick={() => setActiveFeedFilter('unread')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFeedFilter === 'unread' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5' 
                    : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={14} />
                  <span>Okunmamışlar</span>
                </div>
                <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full text-text-secondary">{unreadCount}</span>
              </button>

              <button 
                onClick={() => setActiveFeedFilter('saved')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFeedFilter === 'saved' 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                    : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bookmark size={14} />
                  <span>Kaydedilen Bültenler</span>
                </div>
                <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full text-text-secondary">{savedArticlesLocal.length}</span>
              </button>
            </div>

            {/* Folder categories */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-2 block">Klasörler</span>
              
              <div className="space-y-1">
                {categories.map(cat => {
                  const isActive = activeFeedFilter === `category:${cat}`;
                  const count = articles.filter(a => a.category === cat).length;
                  return (
                    <button 
                      key={cat}
                      onClick={() => setActiveFeedFilter(`category:${cat}`)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Folder size={14} className={isActive ? 'text-rose-400' : 'text-text-secondary'} />
                        <span>{cat}</span>
                      </div>
                      <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full text-text-secondary">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subscription Stream List */}
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-2 block mb-2">Akış Kanallarım</span>
              
              <div className="space-y-1 max-h-[30vh] overflow-y-auto custom-scrollbar pr-1">
                {feeds.map(feed => {
                  const isActive = activeFeedFilter === feed.id;
                  const feedArtCount = articles.filter(a => a.feedId === feed.id).length;
                  return (
                    <div
                      key={feed.id}
                      onClick={() => setActiveFeedFilter(feed.id)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span className="truncate">{feed.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[9px] text-text-secondary/60 bg-black/20 px-1.5 py-0.5 rounded">{feedArtCount}</span>
                        {!feed.isDefault && (
                          <button 
                            onClick={(e) => handleDeleteFeed(e, feed.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 rounded transition-all ml-1"
                            title="Akışı Sil"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 2. MIDDLE COLUMN: Article Cards List (Span 4) */}
          <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col space-y-4 overflow-hidden">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input 
                type="text" 
                placeholder="Başlıklarda veya içerikte ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-display font-semibold text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-rose-500/30 focus:ring-1 focus:ring-rose-500/10 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* List block */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              
              {globalLoading && articles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-secondary">
                  <RefreshCw className="animate-spin text-rose-500" size={24} />
                  <span className="text-xs">Yayın kanalları ve RSS akışları güncelleniyor...</span>
                </div>
              )}

              {filteredArticles.map(art => {
                const isSelected = selectedArticle?.id === art.id;
                const isRead = readArticleIds.has(art.id);
                const isSaved = savedArticleIds.has(art.id);
                
                return (
                  <div 
                    key={art.id}
                    onClick={() => handleSelectArticle(art)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                      isSelected 
                        ? 'bg-rose-500/10 border-rose-500/20' 
                        : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'
                    }`}
                  >
                    {/* Read indicator */}
                    {!isRead && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    )}

                    <div className="flex gap-3">
                      
                      {/* Image Thumbnail (if exists) */}
                      {art.image && (
                        <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/5 relative">
                          <img 
                            src={art.image} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Hide image on error gracefully
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Info details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[10px] text-rose-400 font-bold tracking-tight truncate max-w-[100px]">{art.feedTitle}</span>
                          <span className="text-[10px] text-text-secondary">•</span>
                          <span className="text-[9px] text-text-secondary">{new Date(art.pubDate).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <h3 className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                          isSelected ? 'text-white' : 'text-text-primary group-hover:text-rose-400'
                        }`}>
                          {art.title}
                        </h3>
                        <p className="text-[10px] text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                          {art.contentSnippet}
                        </p>
                      </div>

                    </div>

                    {/* Quick Footer Action Row */}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">{art.category}</span>
                      <div className="flex items-center gap-2">
                        
                        {/* Summary indicator if exists */}
                        {aiSummaries[art.id] && (
                          <span className="p-1 bg-teal-500/10 text-teal-400 rounded-lg" title="AI Özeti Hazır">
                            <Sparkles size={11} />
                          </span>
                        )}

                        {/* Save Action */}
                        <button 
                          onClick={(e) => handleToggleSaveArticle(e, art)}
                          className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${
                            isSaved ? 'text-indigo-400' : 'text-text-secondary hover:text-white'
                          }`}
                        >
                          <Bookmark size={12} className={isSaved ? 'fill-current' : ''} />
                        </button>

                      </div>
                    </div>

                  </div>
                );
              })}

              {filteredArticles.length === 0 && !globalLoading && (
                <div className="text-center py-20 text-text-secondary border border-dashed border-white/10 rounded-xl bg-black/10">
                  <Info className="mx-auto text-text-secondary/30 mb-3" size={24} />
                  <p className="text-xs">Uyuşan makale veya bülten kaydı bulunamadı.</p>
                </div>
              )}

            </div>
          </div>

          {/* 3. RIGHT COLUMN: Distraction-free Reading Pane & AI summaries (Span 5) */}
          <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col overflow-y-auto custom-scrollbar">
            
            <AnimatePresence mode="wait">
              {selectedArticle ? (
                /* Distraction-free Reading pane */
                <motion.div 
                  key={selectedArticle.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  
                  {/* Article Controls / Options */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-4 sticky top-0 bg-transparent backdrop-blur-xl z-20">
                    <button 
                      onClick={() => setSelectedArticle(null)}
                      className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <ArrowLeft size={13} />
                      Kapat
                    </button>

                    <div className="flex items-center gap-2">
                      
                      {/* Font AA adjustments */}
                      <button 
                        onClick={() => setReaderFontSize(prev => Math.max(12, prev - 1))}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary rounded-lg text-xs font-bold"
                        title="Metni Küçült"
                      >
                        A-
                      </button>
                      <button 
                        onClick={() => setReaderFontSize(prev => Math.min(22, prev + 1))}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary rounded-lg text-xs font-bold"
                        title="Metni Büyüt"
                      >
                        A+
                      </button>

                      {/* Web Link */}
                      <a 
                        href={selectedArticle.link}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary rounded-lg"
                        title="Web sitesinde oku"
                      >
                        <ExternalLink size={13} />
                      </a>

                      {/* Save/Bookmark */}
                      <button 
                        onClick={(e) => handleToggleSaveArticle(e, selectedArticle)}
                        className={`p-1.5 bg-white/5 hover:bg-white/10 rounded-lg ${
                          savedArticleIds.has(selectedArticle.id) ? 'text-indigo-400' : 'text-text-secondary hover:text-white'
                        }`}
                        title="Kaydet"
                      >
                        <Bookmark size={13} className={savedArticleIds.has(selectedArticle.id) ? 'fill-current' : ''} />
                      </button>

                    </div>
                  </div>

                  {/* Header / Meta */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs bg-rose-500/10 text-rose-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedArticle.feedTitle}</span>
                      <span className="text-xs text-text-secondary">{new Date(selectedArticle.pubDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h1 className="text-2xl font-display font-black text-text-primary tracking-tight leading-tight">
                      {selectedArticle.title}
                    </h1>
                    {selectedArticle.creator && (
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <span className="font-bold">{selectedArticle.creator}</span> tarafından yayınlandı
                      </p>
                    )}
                  </div>

                  {/* AI SUMMARIZE TRIGGER BLOCK */}
                  <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20 p-4 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-2 top-2 text-rose-400/10 group-hover:scale-125 transition-transform">
                      <Sparkles size={48} />
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400 shrink-0">
                        <Sparkles size={18} className="animate-pulse" />
                      </div>
                      <div className="space-y-1 pr-6">
                        <h4 className="text-xs font-bold text-text-primary">Yapay Zeka Bülten Özet Motoru (Gemini)</h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed">
                          Okuma zamanı kısıtlı mı? Bu makalenin anahtar noktalarını saniyeler içinde okumak için Gemini yapay zekasını kullanın.
                        </p>
                        
                        <div className="pt-2">
                          {summarizingId === selectedArticle.id ? (
                            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                              <RefreshCw className="animate-spin" size={13} />
                              <span>Yapay Zeka makaleyi tahlil ediyor ve özet bülteni hazırlıyor...</span>
                            </div>
                          ) : aiSummaries[selectedArticle.id] ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
                              <Check size={12} /> Özet Hazırlandı (Aşağıya Eklenmiştir)
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleAiSummarize(selectedArticle)}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/10"
                            >
                              <Sparkles size={12} />
                              Hızlı Bülten Özetini Çıkar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Gemini AI Summary Renders beautifully if exists */}
                    {aiSummaries[selectedArticle.id] && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 pt-4 border-t border-rose-500/10 space-y-2 bg-black/30 p-3 rounded-xl border border-white/5"
                      >
                        <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                          <Sparkles size={12} />
                          Yapay Zeka Bülten Özeti
                        </h5>
                        <div className="text-xs text-text-primary font-display leading-relaxed space-y-2 whitespace-pre-line">
                          {aiSummaries[selectedArticle.id]}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Clean Formatted Article Content */}
                  <div className="pt-2 border-t border-white/5">
                    {renderCleanContent(selectedArticle.content)}
                  </div>

                </motion.div>
              ) : (
                /* Empty state dashboard / reading suggestions */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20 px-4 space-y-4"
                >
                  <div className="w-16 h-16 bg-white/[0.01] border border-white/5 flex items-center justify-center rounded-2xl text-rose-400 shadow-xl shadow-rose-500/5">
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Folo Reader Okuma Paneli</h3>
                    <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Lütfen soldaki listeden bir haber veya makale seçin. Distraction-free (dikkat dağıtmayan) okuma modunun keyfini çıkarın.
                    </p>
                  </div>

                  {/* Extra little tip */}
                  <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl max-w-sm text-left">
                    <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 mb-1">
                      <Sparkles size={13} className="text-rose-400" />
                      İpucu: Kişiselleştirilmiş Bülten
                    </h4>
                    <p className="text-[10px] text-text-secondary leading-relaxed">
                      Folo Reader, makalelerinizi okurken bültene kaydettiğiniz tüm haberleri çevrimdışı dahi olsanız tarayıcınızda veya Firestore üzerinde güvende tutar.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      )}

      {/* ================= NEW RSS FEED DIALOG MODAL WITH RSSHUB CATALOG & WIZARD ================= */}
      <AnimatePresence>
        {isNewFeedOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 overflow-y-auto">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsNewFeedOpen(false);
                setSelectedRoute(null);
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-neutral-950 border border-white/10 w-full rounded-3xl p-6 relative z-10 shadow-2xl flex flex-col space-y-5 transition-all duration-300 max-h-[90vh] ${
                modalTab === 'rsshub' ? 'max-w-4xl' : 'max-w-md'
              }`}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-lg font-display font-black text-text-primary flex items-center gap-2">
                    <Plus size={20} className="text-rose-500" />
                    Bültene Yayın Akışı Ekle
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Seçtiğiniz haber kaynaklarını bülten klasörlerinize bağlayın.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setIsNewFeedOpen(false);
                    setSelectedRoute(null);
                  }} 
                  className="text-text-secondary hover:text-text-primary p-1 hover:bg-white/5 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 self-start text-xs font-bold font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setModalTab('rsshub');
                    setSelectedRoute(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                    modalTab === 'rsshub'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Compass size={14} />
                  <span>RSSHub Akış Kataloğu</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalTab('manual');
                    setSelectedRoute(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                    modalTab === 'manual'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Rss size={14} />
                  <span>Manuel URL Ekle</span>
                </button>
              </div>

              {/* TAB 1: MANUAL RSS ADDER */}
              {modalTab === 'manual' && (
                <form onSubmit={handleAddFeed} className="space-y-4 text-xs">
                  
                  <div className="space-y-1.5">
                    <label className="text-text-secondary font-semibold">Yayın Akışı Adı / Başlığı</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Hacker News, GitHub Trends, Webtekno"
                      value={newFeedTitle}
                      onChange={(e) => setNewFeedTitle(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-display font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-text-secondary font-semibold">RSS / Atom XML URL Adresi</label>
                    <input 
                      type="url" 
                      placeholder="https://örnek.com/rss-veya-atom.xml"
                      value={newFeedUrl}
                      onChange={(e) => setNewFeedUrl(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-text-secondary font-semibold">Klasör / Kategori Grubu</label>
                    <select 
                      value={newFeedCategory}
                      onChange={(e) => setNewFeedCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-display font-semibold"
                    >
                      <option value="Teknoloji" className="bg-neutral-900 text-text-primary">Teknoloji</option>
                      <option value="Finans" className="bg-neutral-900 text-text-primary">Finans</option>
                      <option value="Bilim" className="bg-neutral-900 text-text-primary">Bilim</option>
                      <option value="Tasarım & Ürün" className="bg-neutral-900 text-text-primary">Tasarım & Ürün</option>
                      <option value="Diğer" className="bg-neutral-900 text-text-primary">Diğer</option>
                    </select>
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsNewFeedOpen(false);
                        setSelectedRoute(null);
                      }}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-text-secondary font-bold py-2.5 rounded-xl transition-all"
                    >
                      Vazgeç
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/10"
                    >
                      Akışı Ekle
                    </button>
                  </div>

                </form>
              )}

              {/* TAB 2: RSSHUB COMPREHENSIVE CATALOG & PARAMETRIC WIZARD */}
              {modalTab === 'rsshub' && (
                <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                  
                  {/* SPLIT SCREEN A: Route Catalog List (When no route is selected) */}
                  {!selectedRoute ? (
                    <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-[350px]">
                      
                      {/* Search & Sub-category Filter bar */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1 text-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                          <input 
                            type="text" 
                            placeholder="RSSHub köprülerini arayın (örn: YouTube, GitHub, Reddit, Medium...)"
                            value={rsshubSearch}
                            onChange={(e) => setRsshubSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-rose-500/30 transition-all font-sans font-semibold"
                          />
                        </div>

                        {/* Category filter pills */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar text-[10px] font-bold font-sans">
                          {['all', 'Sosyal Medya & Video', 'Programlama & Teknoloji', 'Eğlence & Multimedya', 'Bilim & Genel'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedRsshubCategory(cat)}
                              className={`px-3 py-2 rounded-lg whitespace-nowrap border transition-all ${
                                selectedRsshubCategory === cat
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                                  : 'bg-white/[0.02] text-text-secondary border-transparent hover:bg-white/5 hover:text-text-primary'
                              }`}
                            >
                              {cat === 'all' ? 'Tümü' : cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Routes Grid list */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                        {RSSHUB_CATALOG_ROUTES.filter(route => {
                          const matchesCat = selectedRsshubCategory === 'all' || route.category === selectedRsshubCategory;
                          const matchesSearch = rsshubSearch.trim() === '' || 
                            route.name.toLowerCase().includes(rsshubSearch.toLowerCase()) ||
                            route.desc.toLowerCase().includes(rsshubSearch.toLowerCase());
                          return matchesCat && matchesSearch;
                        }).map(route => (
                          <div
                            key={route.id}
                            onClick={() => setSelectedRoute(route)}
                            className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group"
                          >
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-xs font-bold text-text-primary group-hover:text-rose-400 transition-colors">
                                  {route.name}
                                </h4>
                                <span className="text-[8px] font-bold font-sans bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider">
                                  {route.category.replace(' & Video', '').replace(' & Teknoloji', '')}
                                </span>
                              </div>
                              <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2">
                                {route.desc}
                              </p>
                            </div>
                            
                            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5 text-[9px] font-mono text-text-secondary/60">
                              <span>Sihirbaz Yol Haritası:</span>
                              <span className="bg-black/30 px-2 py-0.5 rounded text-white font-semibold">
                                {route.pathTemplate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Informational guide line about RSSHub */}
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex items-start gap-2.5 text-[10px] text-text-secondary leading-relaxed">
                        <Info size={16} className="text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-text-primary block mb-0.5">RSSHub Nedir?</span>
                          Sosyal mecraları (YouTube, Reddit, GitHub, Twitter vb.) anlık takip edilebilir standart RSS akışlarına dönüştüren açık kaynak kodlu akıllı bir köprü ağıdır. Parametrik değerler girerek saniyeler içinde özel bülteninizi bağlayabilirsiniz.
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* SPLIT SCREEN B: Parameters Generator & Feed Creator Form */
                    <form onSubmit={handleSubscribeToRSSHub} className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[350px]">
                      
                      {/* Left Side: Parameters Inputs form (Span 7) */}
                      <div className="lg:col-span-7 space-y-4 text-xs">
                        
                        {/* Selected Route Info Header */}
                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-1">
                          <button
                            type="button"
                            onClick={() => setSelectedRoute(null)}
                            className="text-[10px] text-rose-400 font-bold hover:underline mb-1 flex items-center gap-1"
                          >
                            <ArrowLeft size={10} /> Kataloğa Geri Dön
                          </button>
                          <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                            <Compass size={14} className="text-rose-400" />
                            {selectedRoute.name}
                          </h4>
                          <p className="text-[10px] text-text-secondary leading-relaxed">
                            {selectedRoute.desc}
                          </p>
                        </div>

                        {/* Parametric input fields loop */}
                        {selectedRoute.params.length > 0 ? (
                          <div className="space-y-3.5 bg-black/20 p-4 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black uppercase text-text-secondary/50 tracking-wider flex items-center gap-1 mb-2">
                              <Sliders size={12} />
                              Sihirbaz Parametreleri
                            </span>
                            
                            {selectedRoute.params.map(p => (
                              <div key={p.name} className="space-y-1.5">
                                <label className="text-text-secondary font-semibold flex items-center justify-between">
                                  <span>{p.label}</span>
                                  {selectedRoute.exampleInputs[p.name] && (
                                    <button
                                      type="button"
                                      onClick={() => setRouteParamValues(prev => ({ ...prev, [p.name]: selectedRoute.exampleInputs[p.name] }))}
                                      className="text-[9px] text-rose-400 hover:underline"
                                    >
                                      Örnek Doldur
                                    </button>
                                  )}
                                </label>

                                {p.type === 'select' ? (
                                  <select
                                    value={routeParamValues[p.name] || ''}
                                    onChange={(e) => setRouteParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-text-primary font-display font-semibold outline-none focus:border-rose-500/30"
                                  >
                                    {p.options?.map(opt => (
                                      <option key={opt.value} value={opt.value} className="bg-neutral-950">
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    placeholder={p.placeholder}
                                    value={routeParamValues[p.name] || ''}
                                    onChange={(e) => setRouteParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                                    required
                                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-text-primary font-mono outline-none focus:border-rose-500/30 transition-all"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center text-text-secondary py-6 text-[10px]">
                            <Check size={20} className="mx-auto text-emerald-500 mb-2" />
                            Bu akış için ek parametre gerekmemektedir.
                          </div>
                        )}

                        {/* Custom Instance setting block (Advanced) */}
                        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-text-secondary/50 tracking-wider flex items-center gap-1.5">
                              <Globe size={12} />
                              RSSHub Ağ Sunucusu (Instance)
                            </span>
                            <p className="text-[9px] text-text-secondary mt-0.5">
                              Rate limit engellemelerini aşmak için sunucu seçin veya kendi yerel sunucunuzu bağlayın.
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 font-sans font-semibold text-[10px]">
                            <button
                              type="button"
                              onClick={() => setRsshubInstance('https://rsshub.app')}
                              className={`py-2 px-2.5 rounded-lg border transition-all truncate ${
                                rsshubInstance === 'https://rsshub.app'
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                  : 'bg-black/20 border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10'
                              }`}
                              title="Resmi RSSHub Sunucusu"
                            >
                              rsshub.app (Resmi)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRsshubInstance('https://rsshub.live')}
                              className={`py-2 px-2.5 rounded-lg border transition-all truncate ${
                                rsshubInstance === 'https://rsshub.live'
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                  : 'bg-black/20 border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10'
                              }`}
                              title="Popüler Public Mirror"
                            >
                              rsshub.live (Mirror)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRsshubInstance('custom')}
                              className={`py-2 px-2.5 rounded-lg border transition-all truncate ${
                                rsshubInstance === 'custom'
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                  : 'bg-black/20 border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10'
                              }`}
                            >
                              Özel Sunucu...
                            </button>
                          </div>

                          {rsshubInstance === 'custom' && (
                            <div className="space-y-1 pt-1">
                              <input
                                type="url"
                                placeholder="https://rsshub.kendisunucunuz.com"
                                value={customInstanceUrl}
                                onChange={(e) => setCustomInstanceUrl(e.target.value)}
                                required
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-text-primary font-mono outline-none focus:border-rose-500/30 text-xs"
                              />
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Right Side: Subscription details & Live preview (Span 5) */}
                      <div className="lg:col-span-5 space-y-4 text-xs flex flex-col justify-between">
                        
                        <div className="space-y-4">
                          {/* Folder & Name assignment */}
                          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-3">
                            <span className="text-[10px] font-black uppercase text-text-secondary/50 tracking-wider block">
                              Yayın Aboneliği Bilgileri
                            </span>

                            <div className="space-y-1.5">
                              <label className="text-text-secondary font-semibold">Bülten Yayın Adı</label>
                              <input
                                type="text"
                                placeholder="Örn: Teknoloji Akışı, YouTube Bilim"
                                value={rsshubFeedTitle}
                                onChange={(e) => setRsshubFeedTitle(e.target.value)}
                                required
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-text-primary outline-none focus:border-rose-500/30 transition-all font-display font-semibold text-xs"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-text-secondary font-semibold">Bülten Klasörü (Kategori)</label>
                              <select
                                value={rsshubFeedCategory}
                                onChange={(e) => setRsshubFeedCategory(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-text-primary outline-none focus:border-rose-500/30 transition-all font-display font-semibold text-xs"
                              >
                                <option value="Teknoloji" className="bg-neutral-950">Teknoloji</option>
                                <option value="Finans" className="bg-neutral-950">Finans</option>
                                <option value="Bilim" className="bg-neutral-950">Bilim</option>
                                <option value="Tasarım & Ürün" className="bg-neutral-950">Tasarım & Ürün</option>
                                <option value="Diğer" className="bg-neutral-950">Diğer</option>
                              </select>
                            </div>
                          </div>

                          {/* Generated RSS Address Preview Box */}
                          <div className="bg-black/30 border border-white/10 p-4 rounded-2xl space-y-2 relative overflow-hidden group">
                            <div className="absolute right-2 top-2 text-white/[0.02]">
                              <Code size={36} />
                            </div>
                            <span className="text-[9px] font-black uppercase text-text-secondary/60 tracking-wider flex items-center gap-1">
                              <Eye size={11} /> Canlı Köprü Adresi Önizleme
                            </span>
                            <div className="bg-black/50 border border-white/5 p-2.5 rounded-xl text-[10px] font-mono text-text-primary overflow-x-auto select-all max-h-[80px] break-all custom-scrollbar">
                              {generatedRsshubUrl || 'Gerekli parametreler doldurulduğunda görüntülenecektir.'}
                            </div>
                            <p className="text-[9px] text-text-secondary leading-normal">
                              Bu dinamik URL adresi arka planda her saniye güncellenerek bülteninize taze veriler çeker.
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRoute(null)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-text-secondary font-bold py-2.5 rounded-xl transition-all font-sans"
                          >
                            Geri Dön
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 font-sans"
                          >
                            Bültene Abone Ol
                          </button>
                        </div>

                      </div>

                    </form>
                  )}

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
