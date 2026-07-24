import React, { useState, useEffect, useRef } from 'react';
import { 
  Rss, Bookmark, Sparkles, Radio, Eye, CheckCheck, TrendingUp, ChevronRight, 
  ArrowRight, Zap, RefreshCw, Heart, Globe, Play, Pause, ExternalLink, 
  Settings2, Copy, Share2, CornerDownRight, X, AlertCircle, Calendar, 
  User, CheckCircle2, MessageSquare, Tag, BookOpen, Flame, Clock
} from 'lucide-react';
import { ArticleItem, RSSFeed, AIDigest } from './types';
import { formatTimeAgo } from './utils';

interface BulletinDashboardViewProps {
  articles: ArticleItem[];
  feeds: RSSFeed[];
  savedArticles: ArticleItem[];
  readArticleIds: Set<string>;
  savedArticlesCount: number;
  unreadArticlesCount: number;
  onNavigateToNews: () => void;
  onNavigateToDigest: () => void;
  onNavigateToFeeds: () => void;
  onNavigateToSaved: () => void;
  onSelectArticle: (article: ArticleItem) => void;
  onMarkAllAsRead: () => void;
  onRefreshFeeds: () => void;
  isFetching: boolean;
  onToggleSave?: (article: ArticleItem) => void;
  onUpdateFeeds?: (feeds: RSSFeed[]) => void;
}

// Reusable Advanced Multi-Source Selector Dropdown
function MultiSourceSelector({ 
  feeds, 
  selectedIds, 
  onChange, 
  label = "Kaynaklar",
  compact = false
}: { 
  feeds: RSSFeed[]; 
  selectedIds: string[]; 
  onChange: (ids: string[]) => void;
  label?: string;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFeeds = feeds.filter(f => f.isActive);
  const isAllSelected = selectedIds.includes('all') || selectedIds.length === 0;
  const isFavoritesSelected = selectedIds.includes('favorites');

  const handleToggleFeed = (id: string) => {
    let updated: string[];
    if (isAllSelected || isFavoritesSelected) {
      // If we were in all/favorites, start a fresh single select list
      updated = [id];
    } else {
      if (selectedIds.includes(id)) {
        updated = selectedIds.filter(x => x !== id);
        if (updated.length === 0) updated = ['all']; // fallback to all
      } else {
        updated = [...selectedIds, id];
      }
    }
    onChange(updated);
  };

  const handleSelectAll = () => {
    onChange(['all']);
  };

  const handleSelectFavorites = () => {
    onChange(['favorites']);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-center relative ${
            isOpen ? 'ring-2 ring-rose-500/30 bg-rose-500/10 text-rose-400 border-rose-500/20' : ''
          }`}
          title={`${label}: ${isAllSelected ? "Tüm Akış" : isFavoritesSelected ? "Sadece Favoriler" : `${selectedIds.length} Kaynak`}`}
        >
          <Rss size={13} className={isOpen ? "text-rose-400" : "text-text-secondary"} />
          {!isAllSelected && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-neutral-950">
              {isFavoritesSelected ? "★" : selectedIds.length}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 bg-black/50 hover:bg-black/75 border border-white/10 rounded-xl text-[10px] font-black text-text-primary flex items-center gap-1.5 transition-all select-none cursor-pointer"
        >
          <span className="text-text-secondary/80 font-mono">{label}:</span>
          <span className="text-indigo-400 font-mono">
            {isAllSelected ? "Tüm Akış" : isFavoritesSelected ? "Sadece Favoriler" : `${selectedIds.length} Kaynak`}
          </span>
          <span className="text-[8px] text-text-secondary/50">▼</span>
        </button>
      )}

      {isOpen && (
        <div className={`absolute right-0 w-64 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-3.5 z-50 space-y-2.5 animate-scale-up ${compact ? 'bottom-full mb-1.5' : 'mt-1.5'}`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-text-secondary">Çoklu Kaynak Seçimi</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[9px] hover:text-white text-text-secondary font-mono"
            >
              Kapat
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                handleSelectAll();
                setIsOpen(false);
              }}
              className={`py-1 text-[9px] font-mono font-bold rounded-lg transition-all border ${
                isAllSelected 
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' 
                  : 'bg-white/5 text-text-secondary border-white/5 hover:text-text-primary'
              }`}
            >
              Tümünü Seç
            </button>
            <button
              onClick={() => {
                handleSelectFavorites();
                setIsOpen(false);
              }}
              className={`py-1 text-[9px] font-mono font-bold rounded-lg transition-all border ${
                isFavoritesSelected 
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/25' 
                  : 'bg-white/5 text-text-secondary border-white/5 hover:text-text-primary'
              }`}
            >
              Favorileri Seç
            </button>
          </div>

          {/* Individual Feed Toggles */}
          <div className="max-h-[160px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {activeFeeds.length === 0 ? (
              <p className="text-[10px] text-text-secondary/50 italic py-1 text-center">Aktif RSS kaynağı bulunmuyor.</p>
            ) : (
              activeFeeds.map(feed => {
                const isSelected = isAllSelected || (isFavoritesSelected && feed.isFavorite) || selectedIds.includes(feed.id);
                return (
                  <label
                    key={feed.id}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-lg cursor-pointer text-[10px] font-medium text-text-primary select-none transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleFeed(feed.id)}
                      className="rounded border-white/10 text-indigo-500 focus:ring-0 bg-black w-3.5 h-3.5"
                    />
                    <span className="truncate flex-1">
                      {feed.isFavorite ? "❤️ " : "📡 "}
                      {feed.title}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BulletinDashboardView({
  articles,
  feeds,
  savedArticles = [],
  readArticleIds = new Set(),
  savedArticlesCount,
  unreadArticlesCount,
  onNavigateToNews,
  onNavigateToDigest,
  onNavigateToFeeds,
  onNavigateToSaved,
  onSelectArticle,
  onMarkAllAsRead,
  onRefreshFeeds,
  isFetching,
  onToggleSave,
  onUpdateFeeds
}: BulletinDashboardViewProps) {
  // --- STATE ---
  // Multiple Source Selections
  const [aiSources, setAiSources] = useState<string[]>(['all']);
  const [breakingSources, setBreakingSources] = useState<string[]>(() => {
    const cached = localStorage.getItem('apex_breaking_sources');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return ['all']; }
    }
    return ['all'];
  });
  const [featuredSources, setFeaturedSources] = useState<string[]>(['all']);

  // Persist breaking news sources selection
  useEffect(() => {
    localStorage.setItem('apex_breaking_sources', JSON.stringify(breakingSources));
  }, [breakingSources]);

  const [aiStyle, setAiStyle] = useState<string>('executive'); // executive, analytical, technical, creative

  // AI Daily Briefing Generation State
  const [aiBriefing, setAiBriefing] = useState<AIDigest | null>(() => {
    const cached = localStorage.getItem('apex_ai_briefing');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return null; }
    }
    return null;
  });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);

  // Automatic Loading Toggles
  const [autoBrief, setAutoBrief] = useState<boolean>(() => localStorage.getItem('apex_auto_brief') !== 'false');
  const [autoRefreshTicker, setAutoRefreshTicker] = useState<boolean>(true);
  const [refreshIntervalMode, setRefreshIntervalMode] = useState<'instant' | '5m' | '30m' | '1h' | 'adaptive'>(() => {
    return (localStorage.getItem('apex_ticker_refresh_mode') as any) || 'adaptive';
  });
  const [adaptiveDelayMinutes, setAdaptiveDelayMinutes] = useState<number>(1.5);
  const [isRefreshIntervalOpen, setIsRefreshIntervalOpen] = useState(false);
  const intervalDropdownRef = useRef<HTMLDivElement>(null);

  // Metrics Inline Detail Panel
  const [activeMetricDetail, setActiveMetricDetail] = useState<'none' | 'total' | 'unread' | 'saved' | 'feeds'>('none');
  const [metricSearch, setMetricSearch] = useState<string>('');

  // Reader Modal State (Dashboard-level detailed view)
  const [selectedReaderArticle, setSelectedReaderArticle] = useState<ArticleItem | null>(null);
  const [singleSummary, setSingleSummary] = useState<string | null>(null);
  const [isSummarizingSingle, setIsSummarizingSingle] = useState(false);

  // Ticker Scrolling State
  const [tickerPaused, setTickerPaused] = useState(false);
  const [tickerSpeed, setTickerSpeed] = useState<'slow' | 'normal' | 'fast' | 'turbo'>('normal');
  const tickerRef = useRef<HTMLDivElement>(null);

  const getTickerDuration = () => {
    switch (tickerSpeed) {
      case 'slow': return 220;
      case 'fast': return 90;
      case 'turbo': return 45;
      case 'normal':
      default:
        return 140;
    }
  };

  const toggleTickerSpeed = () => {
    setTickerSpeed(prev => {
      let next: 'slow' | 'normal' | 'fast' | 'turbo';
      if (prev === 'normal') next = 'fast';
      else if (prev === 'fast') next = 'turbo';
      else if (prev === 'turbo') next = 'slow';
      else next = 'normal';
      
      showToast(`Haber akış hızı: ${next === 'slow' ? '0.5x (Çok Yavaş)' : next === 'fast' ? '1.5x (Akıcı)' : next === 'turbo' ? '2.0x (Hızlı)' : '1.0x (Normal)'} olarak ayarlandı.`);
      return next;
    });
  };

  // General Notification feedback (e.g. "Kopyalandı")
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeFeeds = feeds.filter(f => f.isActive);
  const categories = Array.from(new Set(articles.map(a => a.category)));

  // Show a brief toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter helper for multi-source array settings
  const getFilteredArticles = (sources: string[]) => {
    if (sources.includes('all') || sources.length === 0) {
      return articles;
    }
    if (sources.includes('favorites')) {
      const favFeedIds = new Set(feeds.filter(f => f.isFavorite).map(f => f.id));
      return articles.filter(a => favFeedIds.has(a.feedId));
    }
    // Filter matching any selected feedId
    return articles.filter(a => sources.includes(a.feedId));
  };

  const tickerArticles = getFilteredArticles(breakingSources).slice(0, 12);
  const featuredArticles = getFilteredArticles(featuredSources).slice(0, 8);

  // Auto brief persistence setting
  const toggleAutoBrief = () => {
    const nextVal = !autoBrief;
    setAutoBrief(nextVal);
    localStorage.setItem('apex_auto_brief', String(nextVal));
    showToast(nextVal ? 'Otomatik bülten oluşturma aktif.' : 'Otomatik bülten oluşturma kapatıldı.');
  };

  // --- COMPONENT LOGIC ---

  // Trigger AI Daily Briefing via /api/bulletin/digest
  const handleGenerateAiBriefing = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    const filteredForAi = getFilteredArticles(aiSources).slice(0, 15);

    if (filteredForAi.length === 0) {
      setAiError('Seçilen kaynaklarda bülten oluşturulabilecek güncel haber bulunamadı.');
      setIsGeneratingAi(false);
      return;
    }

    // Step animation simulation for higher fidelity
    const steps = [
      'Seçilen çoklu kaynaklardaki akışlar taranıyor...',
      'Makale metinleri temizleniyor ve önceliklendiriliyor...',
      'Yapay zeka analiz motoru (Gemini 3.5 Flash) çağrılıyor...',
      'Akıllı bülten ve yönetici özeti derleniyor...',
    ];

    let currentStepIdx = 0;
    setAiLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        setAiLoadingStep(steps[currentStepIdx]);
      }
    }, 1500);

    try {
      const res = await fetch('/api/bulletin/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: filteredForAi.map(a => ({
            title: a.title,
            category: a.category,
            feedTitle: a.feedTitle,
            contentSnippet: a.contentSnippet || a.content
          })),
          style: aiStyle
        })
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error('Yapay zeka bülten servisi hata döndürdü.');
      }

      const data = await res.json();
      const newBriefing: AIDigest = {
        id: `digest-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: data.title || 'Günün Akıllı Bülteni',
        greeting: data.greeting || 'Merhaba!',
        highlights: data.highlights || [],
        quickTakeaways: data.quickTakeaways || [],
        editorNote: data.editorNote || ''
      };

      setAiBriefing(newBriefing);
      localStorage.setItem('apex_ai_briefing', JSON.stringify(newBriefing));
      showToast('Günün akıllı bülteni başarıyla oluşturuldu!');
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setAiError('Bülten hazırlanırken teknik bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Auto Generate Briefing on load or source change if enabled
  useEffect(() => {
    if (autoBrief && articles.length > 0 && !aiBriefing && !isGeneratingAi) {
      const timer = setTimeout(() => {
        handleGenerateAiBriefing();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [articles, autoBrief]);

  // Close interval dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (intervalDropdownRef.current && !intervalDropdownRef.current.contains(event.target as Node)) {
        setIsRefreshIntervalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track latest article and background refreshing state
  const latestArticleTimeRef = useRef<string>('');
  const isBackgroundRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    if (articles.length > 0 && !latestArticleTimeRef.current) {
      latestArticleTimeRef.current = articles[0].pubDate;
    }
  }, [articles]);

  // Dynamic timing calculation
  const getRefreshDelayMs = () => {
    switch (refreshIntervalMode) {
      case 'instant': return 60000;      // 1 minute
      case '5m': return 5 * 60000;       // 5 minutes
      case '30m': return 30 * 60000;     // 30 minutes
      case '1h': return 60 * 60000;      // 1 hour
      case 'adaptive':
      default:
        return adaptiveDelayMinutes * 60000;
    }
  };

  // Son Dakika smart auto refresh scheduler
  useEffect(() => {
    if (!autoRefreshTicker) return;

    const delayMs = getRefreshDelayMs();
    
    const interval = setInterval(async () => {
      isBackgroundRefreshingRef.current = true;
      await onRefreshFeeds();
    }, delayMs);

    return () => clearInterval(interval);
  }, [autoRefreshTicker, refreshIntervalMode, adaptiveDelayMinutes]);

  // Reactive watch on articles to trigger toasts or adjust adaptive backoffs
  useEffect(() => {
    if (articles.length === 0) return;
    const latest = articles[0];

    if (isBackgroundRefreshingRef.current) {
      isBackgroundRefreshingRef.current = false;

      if (latestArticleTimeRef.current && latest.pubDate !== latestArticleTimeRef.current) {
        // A brand-new article has actually arrived!
        const timeDiff = new Date(latest.pubDate).getTime() - new Date(latestArticleTimeRef.current).getTime();
        
        if (timeDiff > 0) {
          showToast(`Canlı Akış: "${latest.title.substring(0, 45)}..." başlığıyla yeni bir haber alındı!`);
          latestArticleTimeRef.current = latest.pubDate;
          
          // Reset adaptive delay to the minimum responsive state because news is breaking
          if (refreshIntervalMode === 'adaptive') {
            setAdaptiveDelayMinutes(1.5);
          }
        }
      } else {
        // No new articles were found during this background check -> let's apply a progressive backoff to keep it optimal!
        if (refreshIntervalMode === 'adaptive') {
          setAdaptiveDelayMinutes(prev => {
            let next = prev;
            if (prev === 1.5) next = 5;
            else if (prev === 5) next = 15;
            else if (prev === 15) next = 30;
            else if (prev === 30) next = 60;
            else next = 60; // Cap at 1 hour
            
            showToast(`Canlı Akış: Yeni haber bulunamadı. Akıllı bekleme süresi ${next} dakikaya uzatıldı.`);
            return next;
          });
        }
      }
    } else {
      // Manual refresh or initial load, just sync latest ref silently
      if (latest) {
        latestArticleTimeRef.current = latest.pubDate;
      }
    }
  }, [articles, refreshIntervalMode]);

  // Call AI summarizer for the Reader Modal
  const handleSummarizeSingleArticle = async (article: ArticleItem) => {
    setIsSummarizingSingle(true);
    setSingleSummary(null);
    try {
      const res = await fetch('/api/bulletin/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content || article.contentSnippet
        })
      });

      if (!res.ok) throw new Error('Yazı özetlenemedi.');
      const data = await res.json();
      setSingleSummary(data.summary);
    } catch (e) {
      console.error(e);
      setSingleSummary('Yapay zeka özeti şu an çıkartılamıyor.');
    } finally {
      setIsSummarizingSingle(false);
    }
  };

  // Copy Briefing to Clipboard
  const handleCopyBriefing = () => {
    if (!aiBriefing) return;
    const text = `=== ${aiBriefing.title} ===\n\n${aiBriefing.greeting}\n\nÖNE ÇIKANLAR:\n` + 
      aiBriefing.highlights.map(h => `- [${h.category}] ${h.topic}\n  Özet: ${h.summary}\n  Etki: ${h.impact}`).join('\n\n') +
      `\n\nHIZLI ÇIKARIMLAR:\n` + aiBriefing.quickTakeaways.map(t => `- ${t}`).join('\n') +
      `\n\nEDİTÖR NOTU:\n${aiBriefing.editorNote}`;
    
    navigator.clipboard.writeText(text);
    showToast('Bülten panoya kopyalandı!');
  };

  // Close metrics drawer helper
  const handleToggleMetric = (metric: 'total' | 'unread' | 'saved' | 'feeds') => {
    setMetricSearch('');
    if (activeMetricDetail === metric) {
      setActiveMetricDetail('none');
    } else {
      setActiveMetricDetail(metric);
    }
  };

  // Calculate dynamic metadata metrics for AI Panel
  const calculatedAiScanCount = getFilteredArticles(aiSources).length;
  const aiQualityMeter = aiSources.includes('all') 
    ? 'Maksimum' 
    : aiSources.includes('favorites') 
      ? 'Yüksek' 
      : `${aiSources.length} Kaynak Odaklı`;

  return (
    <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-3xl h-full p-4 lg:p-6 overflow-y-auto custom-scrollbar relative space-y-6">
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33333%, 0, 0); }
        }
        .marquee-gpu-accelerated {
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
          transform-style: preserve-3d;
          image-rendering: -webkit-optimize-contrast;
          -webkit-font-smoothing: subpixel-antialiased;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        .animate-scale-up {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest mb-1">
            <Rss size={14} className="animate-pulse" />
            ApexOS Haber & Akıllı Medya Portalı v2.5
          </div>
          <h1 className="text-xl lg:text-2xl font-display font-black text-text-primary">
            Haber & Akıllı Medya Merkezi
          </h1>
          <p className="text-xs text-text-secondary mt-0.5 max-w-xl">
            Favori kaynaklarınızı seçin, özelleştirilmiş AI bülteninizi oluşturun ve son dakika gelişmelerini takip edin.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onRefreshFeeds}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-text-primary transition-all disabled:opacity-50 cursor-pointer"
            title="Akışları Yenile"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin text-indigo-400' : ''} />
            <span>{isFetching ? 'Güncelleniyor...' : 'Akışları Yenile'}</span>
          </button>
          <button
            onClick={onNavigateToFeeds}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-text-secondary hover:text-white transition-colors"
          >
            <Settings2 size={13} />
            <span>Kaynakları Yönet</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: AI DAILY BRIEFING (1st Most Prominent Area) */}
      <div className="mt-5 bg-gradient-to-br from-indigo-950/30 via-neutral-950 to-purple-950/30 border-2 border-indigo-500/25 rounded-3xl p-5 lg:p-6 shadow-[0_0_40px_rgba(99,102,241,0.12)] relative overflow-hidden">
        {/* Abstract futuristic background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-[70px] rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-500/30">
                <Sparkles size={12} className="animate-pulse" />
                ÖNCELİKLİ ALAN
              </span>
              <span className="text-xs font-bold font-mono text-indigo-300">AI Daily Executive Briefing Engine</span>

              {/* Auto Generation status tag */}
              <button
                onClick={toggleAutoBrief}
                className={`ml-auto lg:ml-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono font-black transition-all ${
                  autoBrief 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-white/5 text-text-secondary border border-white/5'
                }`}
                title="Sistem açıldığında bülteni otomatik oluşturur."
              >
                <CheckCircle2 size={10} className={autoBrief ? "text-emerald-400" : "text-text-secondary"} />
                <span>OTOMATİK: {autoBrief ? "AÇIK" : "KAPALI"}</span>
              </button>
            </div>

            <h2 className="text-xl lg:text-2xl font-display font-black text-white leading-tight">
              Yapay Zeka Destekli Kişiselleştirilmiş Günlük Bülten
            </h2>
            <p className="text-xs text-text-secondary/90 leading-relaxed max-w-2xl">
              Gemini modelimiz aktif RSS akışlarınızı tarar, yinelenen haberleri ayıklar ve size özel, anlaşılması kolay, vizyoner bir özet bülten hazırlar.
            </p>

            {/* AI Source & Style Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Reusable MultiSourceSelector for AI */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-indigo-300/80 uppercase">Kaynak Seçimi (Çoklu)</label>
                <div className="flex items-center gap-2">
                  <MultiSourceSelector 
                    feeds={feeds} 
                    selectedIds={aiSources} 
                    onChange={setAiSources} 
                    label="Bülten Kaynakları" 
                  />
                  <span className="text-[10px] font-mono text-text-secondary/50">
                    ({calculatedAiScanCount} taranacak haber)
                  </span>
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-indigo-300/80 uppercase">Bülten Formatı & Stil</label>
                <div className="flex bg-black/40 border border-indigo-500/10 rounded-xl p-1 gap-1">
                  {[
                    { id: 'executive', label: 'Yönetici' },
                    { id: 'analytical', label: 'Analitik' },
                    { id: 'technical', label: 'Sektörel' },
                    { id: 'creative', label: 'Vizyoner' }
                  ].map(styleOpt => (
                    <button
                      key={styleOpt.id}
                      onClick={() => setAiStyle(styleOpt.id)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${
                        aiStyle === styleOpt.id
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'text-text-secondary hover:text-indigo-200 hover:bg-white/5'
                      }`}
                    >
                      {styleOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col justify-center items-center lg:items-end gap-3 min-w-[200px]">
            <button
              onClick={handleGenerateAiBriefing}
              disabled={isGeneratingAi || isFetching}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl text-xs font-black transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(99,102,241,0.55)] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Sparkles size={14} className="animate-spin-slow group-hover:scale-110 transition-transform" />
              <span>{isGeneratingAi ? 'Bülten Hazırlanıyor...' : 'Akıllı Bülteni Oluştur'}</span>
            </button>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-secondary/60">
              <span>Hassasiyet: {aiQualityMeter}</span>
              <span>•</span>
              <button 
                onClick={() => {
                  setAiBriefing(null);
                  localStorage.removeItem('apex_ai_briefing');
                  showToast('Bülten belleği temizlendi.');
                }}
                className="text-indigo-400 hover:underline"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>

        {/* AI Generation Loading State Panel */}
        {isGeneratingAi && (
          <div className="mt-6 border-t border-indigo-500/20 pt-5 flex flex-col items-center justify-center py-8 text-center space-y-4 animate-pulse">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
              <Sparkles size={18} className="absolute inset-0 m-auto text-indigo-400 animate-ping" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-indigo-200">Günün Bülteni Derleniyor</h4>
              <p className="text-xs text-indigo-300/70 font-mono">{aiLoadingStep}</p>
            </div>
          </div>
        )}

        {/* AI Error Display */}
        {aiError && (
          <div className="mt-5 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {/* AI Briefing Results Panel */}
        {aiBriefing && !isGeneratingAi && (
          <div className="mt-6 border-t border-indigo-500/20 pt-6 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-base lg:text-lg font-black text-indigo-100 font-display flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" />
                  {aiBriefing.title}
                </h3>
                <p className="text-[10px] font-mono text-indigo-300/60 mt-0.5">
                  Oluşturulma: {new Date(aiBriefing.createdAt).toLocaleDateString('tr-TR')} {new Date(aiBriefing.createdAt).toLocaleTimeString('tr-TR')} | Stil: {aiStyle.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBriefing}
                  className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Panoya Kopyala"
                >
                  <Copy size={12} />
                  <span>Panoya Kopyala</span>
                </button>
                <button
                  onClick={() => {
                    const text = JSON.stringify(aiBriefing, null, 2);
                    const blob = new Blob([text], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `apexos-ai-bulletin-${Date.now()}.json`;
                    a.click();
                    showToast('Bülten dosyası indirildi!');
                  }}
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="JSON Dosyası İndir"
                >
                  <Share2 size={12} />
                </button>
              </div>
            </div>

            {/* Greeting */}
            <div className="bg-black/40 border border-indigo-500/10 p-4 rounded-2xl">
              <p className="text-xs text-indigo-100/90 leading-relaxed italic">
                "{aiBriefing.greeting}"
              </p>
            </div>

            {/* 30s Takeaways Grid */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-mono font-bold tracking-wider uppercase text-indigo-300 flex items-center gap-1">
                <Zap size={10} className="text-indigo-400" /> 30 SANİYEDE GÜNDEM ÖZETİ
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiBriefing.quickTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 hover:border-indigo-500/10 rounded-xl flex gap-2 items-start transition-all">
                    <span className="text-indigo-400 text-xs font-black font-mono">0{idx + 1}.</span>
                    <p className="text-xs text-text-secondary leading-snug">{takeaway}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Highlights */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-mono font-bold tracking-wider uppercase text-indigo-300">📰 GÜNÜN ÖNE ÇIKAN GELİŞMELERİ & ETKİ ANALİZLERİ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiBriefing.highlights.map((highlight, idx) => (
                  <div key={idx} className="p-4 bg-black/40 border border-white/5 hover:border-indigo-500/25 rounded-2xl transition-all space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase rounded-full">
                          {highlight.category || 'Gündem'}
                        </span>
                        <span className="text-[9px] text-indigo-300/40 font-mono">Etki: Yüksek</span>
                      </div>

                      <h5 className="font-bold text-sm text-indigo-100 font-sans leading-snug">
                        {highlight.topic}
                      </h5>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {highlight.summary}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 text-[11px] text-indigo-200/80 leading-relaxed flex gap-1.5 items-start mt-2">
                      <CornerDownRight size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                      <p><strong>Neden Önemli:</strong> {highlight.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor's Note */}
            <div className="p-4 bg-indigo-950/15 border border-indigo-500/15 rounded-2xl space-y-1.5">
              <h4 className="text-[9px] font-mono font-bold tracking-wider uppercase text-indigo-300">✍️ EDİTÖRÜN ANALİTİK DEĞERLENDİRMESİ</h4>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {aiBriefing.editorNote}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: SON DAKİKA TICKER BAR (Fixed to the bottom of the screen) */}
      <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 lg:left-8 lg:right-8 bg-neutral-950/90 border border-rose-500/30 rounded-2xl p-2.5 flex items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.85),0_0_25px_rgba(239,68,68,0.12)] backdrop-blur-md z-40">
        
        {/* Left Part: Live Beacon Indicator (Pulsing Red Dot) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <Radio size={12} className="text-rose-500 animate-pulse" />
            <span className="text-[9px] font-black tracking-widest font-mono">LIVE</span>
          </div>
        </div>

        {/* Scrolling News Ticker Content Container */}
        <div className="flex-1 overflow-hidden relative min-h-[32px] flex items-center bg-black/45 rounded-xl border border-white/5 px-2">
          {tickerArticles.length > 0 ? (
            <div 
              ref={tickerRef}
              className="flex gap-16 whitespace-nowrap text-xs text-text-primary font-semibold marquee-gpu-accelerated"
              style={{
                animation: tickerPaused ? 'none' : `marquee ${getTickerDuration()}s linear infinite`,
                display: 'inline-flex',
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden',
                perspective: '1000px'
              }}
              onMouseEnter={() => setTickerPaused(true)}
              onMouseLeave={() => setTickerPaused(false)}
            >
              {/* Triple-multiply articles for a flawless continuous loop */}
              {[...tickerArticles, ...tickerArticles, ...tickerArticles].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedReaderArticle(item);
                    setSingleSummary(null);
                  }}
                  className="hover:text-rose-400 transition-colors flex items-center gap-2 text-left cursor-pointer focus:outline-none shrink-0"
                >
                  <span className="text-rose-400 font-mono font-bold text-[9px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    {item.feedTitle}
                  </span>
                  <span className="hover:underline">{item.title}</span>
                  <span className="text-[9px] text-text-secondary/40 font-mono">({formatTimeAgo(item.pubDate)})</span>
                  <span className="text-rose-500/30">•</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-text-secondary/60 italic px-2">
              Seçilen çoklu kaynaklarda gösterilecek son dakika haberi bulunamadı.
            </div>
          )}
        </div>

        {/* Right Toolbar: All Ticker Control Actions Aligned to the Right */}
        <div className="flex items-center gap-1.5 shrink-0 bg-black/45 border border-white/5 px-2 py-1 rounded-xl">
          {/* Speed Controller Action button */}
          <button
            onClick={toggleTickerSpeed}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            title={`Akış Hızı (Tıkla ve Değiştir): ${tickerSpeed === 'slow' ? '0.5x' : tickerSpeed === 'fast' ? '1.5x' : tickerSpeed === 'turbo' ? '2.0x' : '1.0x'}`}
          >
            <Flame size={12} className={tickerSpeed === 'turbo' || tickerSpeed === 'fast' ? 'text-amber-500 animate-pulse' : 'text-text-secondary'} />
            <span className="text-[8px] font-mono font-bold">{tickerSpeed === 'slow' ? '0.5x' : tickerSpeed === 'fast' ? '1.5x' : tickerSpeed === 'turbo' ? '2.0x' : '1.0x'}</span>
          </button>

          {/* Auto Refresh Update Switch */}
          <button
            onClick={() => {
              const nextVal = !autoRefreshTicker;
              setAutoRefreshTicker(nextVal);
              showToast(nextVal ? 'Canlı son dakika güncellemesi aktif.' : 'Otomatik son dakika durduruldu.');
            }}
            className={`p-1.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer relative ${
              autoRefreshTicker 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-white/5 text-text-secondary border-white/5 hover:text-text-primary'
            }`}
            title={`Akıllı Otomatik Güncelleme: ${autoRefreshTicker ? "AÇIK" : "KAPALI"}`}
          >
            <Zap size={12} className={autoRefreshTicker ? "text-emerald-400" : ""} />
            {autoRefreshTicker && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Smart Refresh Interval Selector Dropdown */}
          <div className="relative inline-block text-left" ref={intervalDropdownRef}>
            <button
              onClick={() => setIsRefreshIntervalOpen(!isRefreshIntervalOpen)}
              className={`p-1.5 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isRefreshIntervalOpen 
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' 
                  : 'bg-white/5 text-text-secondary border-white/5 hover:text-text-primary'
              }`}
              title={`Güncelleme Sıklığı: ${
                refreshIntervalMode === 'adaptive' ? `Akıllı Esnek (${adaptiveDelayMinutes}dk)` :
                refreshIntervalMode === 'instant' ? 'Anlık (1dk)' :
                refreshIntervalMode === '5m' ? '5 Dakika' :
                refreshIntervalMode === '30m' ? '30 Dakika' : '1 Saat'
              }`}
            >
              <Clock size={12} className={refreshIntervalMode === 'adaptive' ? 'text-indigo-400 animate-pulse' : 'text-text-secondary'} />
              <span className="text-[8px] font-mono font-bold">
                {refreshIntervalMode === 'adaptive' ? `Akıllı (${adaptiveDelayMinutes}m)` :
                 refreshIntervalMode === 'instant' ? '1m' :
                 refreshIntervalMode === '5m' ? '5m' :
                 refreshIntervalMode === '30m' ? '30m' : '1h'}
              </span>
            </button>

            {isRefreshIntervalOpen && (
              <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-scale-up">
                <div className="px-2 py-1.5 border-b border-white/5">
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-text-secondary">Güncelleme Sıklığı</span>
                </div>
                {[
                  { mode: 'adaptive', label: `Akıllı Esnek (${adaptiveDelayMinutes}m)`, desc: 'Haber yoğunluğuna göre dinamik' },
                  { mode: 'instant', label: 'Anlık (1 dk)', desc: 'Her dakika yeni haber tarar' },
                  { mode: '5m', label: '5 Dakika', desc: '5 dakikada bir kontrol eder' },
                  { mode: '30m', label: '30 Dakika', desc: 'Düşük pil/veri kullanımı' },
                  { mode: '1h', label: '1 Saat', desc: 'Her saat başı kontrol' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => {
                      setRefreshIntervalMode(item.mode as any);
                      localStorage.setItem('apex_ticker_refresh_mode', item.mode);
                      setIsRefreshIntervalOpen(false);
                      if (item.mode === 'adaptive') setAdaptiveDelayMinutes(1.5);
                      showToast(`Güncelleme sıklığı: ${item.label} olarak ayarlandı.`);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors flex flex-col ${
                      refreshIntervalMode === item.mode 
                        ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20' 
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[8.5px] opacity-60 font-normal leading-tight mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compact Dropdown Multi-Source Selection */}
          <MultiSourceSelector 
            feeds={feeds} 
            selectedIds={breakingSources} 
            onChange={setBreakingSources} 
            label="Kaynak" 
            compact={true}
          />

          <div className="w-[1px] h-3 bg-white/10 mx-0.5" />

          {/* Pause / Play Button */}
          <button
            onClick={() => setTickerPaused(!tickerPaused)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title={tickerPaused ? 'Devam Et' : 'Duraklat'}
          >
            {tickerPaused ? <Play size={12} className="text-emerald-400" /> : <Pause size={12} />}
          </button>
        </div>
      </div>

      {/* SECTION 2: METRICS ROW (Compact & Clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        {[
          {
            key: 'total' as const,
            label: 'Toplam Akış',
            count: articles.length,
            sub: 'Aktif makaleler',
            icon: <Rss size={14} className="text-rose-400 animate-pulse" />,
            colorClass: 'hover:border-rose-500/25 hover:bg-rose-950/5 border-white/5',
          },
          {
            key: 'unread' as const,
            label: 'Okunmamış',
            count: unreadArticlesCount,
            sub: 'Yeni içerikler',
            icon: <Eye size={14} className="text-amber-400" />,
            colorClass: 'hover:border-amber-500/25 hover:bg-amber-950/5 border-white/5',
          },
          {
            key: 'saved' as const,
            label: 'Kaydedilenler',
            count: savedArticlesCount,
            sub: 'Kütüphaneniz',
            icon: <Bookmark size={14} className="text-indigo-400" />,
            colorClass: 'hover:border-indigo-500/25 hover:bg-indigo-950/5 border-white/5',
          },
          {
            key: 'feeds' as const,
            label: 'RSS Kaynakları',
            count: `${activeFeeds.length} / ${feeds.length}`,
            sub: 'Aktif akışlar',
            icon: <Radio size={14} className="text-emerald-400" />,
            colorClass: 'hover:border-emerald-500/25 hover:bg-emerald-950/5 border-white/5',
          }
        ].map(mItem => {
          const isSelected = activeMetricDetail === mItem.key;
          return (
            <div
              key={mItem.key}
              onClick={() => handleToggleMetric(mItem.key)}
              className={`p-3 bg-white/[0.01] border rounded-2xl cursor-pointer transition-all space-y-1 relative group ${mItem.colorClass} ${
                isSelected ? 'border-indigo-500/30 bg-indigo-500/5 shadow-md' : ''
              }`}
            >
              <div className="flex items-center justify-between text-text-secondary">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">{mItem.label}</span>
                {mItem.icon}
              </div>
              <div className="text-xl font-black font-display text-text-primary group-hover:scale-105 transition-transform origin-left">
                {mItem.count}
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-secondary/50 font-mono">
                <span>{mItem.sub}</span>
                <span className="text-indigo-400 text-[9px] font-bold">İncele ↙</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* METRIC INLINE DETAILS EXPANSION DRAWER PANEL */}
      {activeMetricDetail !== 'none' && (
        <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-4 mb-6 space-y-3 animate-scale-up shadow-2xl relative z-20">
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[9px] font-mono font-black uppercase rounded">
                DETAYLI AKIŞ
              </span>
              <h3 className="text-xs font-black font-mono text-text-primary uppercase tracking-wider">
                {activeMetricDetail === 'total' && 'Tüm Haber Akışı Maddeleri'}
                {activeMetricDetail === 'unread' && 'Okunmamış Yeni Gelişmeler'}
                {activeMetricDetail === 'saved' && 'Kütüphanede Kayıtlı Haberleriniz'}
                {activeMetricDetail === 'feeds' && 'RSS / Medya Kaynakları'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Optional metric actions */}
              {activeMetricDetail === 'unread' && unreadArticlesCount > 0 && (
                <button
                  onClick={() => {
                    onMarkAllAsRead();
                    showToast('Tüm haberler okundu olarak işaretlendi.');
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/35 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Tümünü Okundu Say
                </button>
              )}
              {activeMetricDetail === 'feeds' && (
                <button
                  onClick={onNavigateToFeeds}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/35 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <Radio size={12} /> Yeni Kaynak Ekle
                </button>
              )}

              {/* Live search in detail lists */}
              {activeMetricDetail !== 'feeds' && (
                <input
                  type="text"
                  placeholder="Liste içinde ara..."
                  value={metricSearch}
                  onChange={(e) => setMetricSearch(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-text-primary outline-none focus:border-indigo-500/30"
                />
              )}

              <button
                onClick={() => setActiveMetricDetail('none')}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                title="Kapat"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Metric Detail List Box */}
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar space-y-2">
            
            {/* Total / Unread Content */}
            {(activeMetricDetail === 'total' || activeMetricDetail === 'unread') && (() => {
              const baseList = activeMetricDetail === 'unread' 
                ? articles.filter(a => !readArticleIds.has(a.id))
                : articles;
              
              const filteredList = baseList.filter(a => 
                a.title.toLowerCase().includes(metricSearch.toLowerCase()) ||
                a.feedTitle.toLowerCase().includes(metricSearch.toLowerCase())
              );

              if (filteredList.length === 0) {
                return <p className="text-xs text-text-secondary/60 italic py-4 text-center">Gösterilebilecek uygun haber bulunamadı.</p>;
              }

              return filteredList.map(aItem => (
                <div
                  key={aItem.id}
                  onClick={() => {
                    setSelectedReaderArticle(aItem);
                    setSingleSummary(null);
                  }}
                  className="p-2.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 rounded-xl flex justify-between items-center gap-4 transition-all cursor-pointer group animate-scale-up"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[9px] font-mono mb-0.5">
                      <span className="text-indigo-400 font-bold">{aItem.category}</span>
                      <span className="text-text-secondary/50">•</span>
                      <span className="text-text-secondary/70">{aItem.feedTitle}</span>
                      <span className="text-text-secondary/50">•</span>
                      <span className="text-text-secondary/60">{formatTimeAgo(aItem.pubDate)}</span>
                    </div>
                    <h4 className="text-xs font-bold text-text-primary group-hover:text-indigo-300 truncate">
                      {aItem.title}
                    </h4>
                  </div>
                  <ChevronRight size={13} className="text-text-secondary/30 group-hover:translate-x-1 transition-transform" />
                </div>
              ));
            })()}

            {/* Saved Content details */}
            {activeMetricDetail === 'saved' && (() => {
              const filteredSaved = savedArticles.filter(a => 
                a.title.toLowerCase().includes(metricSearch.toLowerCase()) ||
                a.feedTitle.toLowerCase().includes(metricSearch.toLowerCase())
              );

              if (filteredSaved.length === 0) {
                return (
                  <div className="py-6 text-center text-text-secondary/60 space-y-2">
                    <Bookmark size={24} className="mx-auto opacity-35" />
                    <p className="text-xs font-medium">Listenizde henüz kayıtlı haber bulunmuyor.</p>
                  </div>
                );
              }

              return filteredSaved.map(sItem => (
                <div
                  key={sItem.id}
                  onClick={() => {
                    setSelectedReaderArticle(sItem);
                    setSingleSummary(null);
                  }}
                  className="p-3 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-scale-up"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap text-[9px] font-mono mb-1">
                      <span className="text-pink-400 font-bold bg-pink-500/10 px-1.5 py-0.5 rounded uppercase">Kayıtlı</span>
                      <span className="text-text-secondary/70">{sItem.feedTitle}</span>
                      {sItem.tags && sItem.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-1.5 bg-white/5 text-indigo-300 rounded text-[8px]">#{tag}</span>
                      ))}
                    </div>
                    <h4 className="text-xs font-bold text-text-primary truncate">
                      {sItem.title}
                    </h4>
                    {sItem.userNotes && (
                      <p className="text-[10px] text-indigo-300/60 font-sans mt-0.5 truncate">
                        📝 Not: {sItem.userNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSave) onToggleSave(sItem);
                        showToast('Haber kütüphaneden kaldırıldı.');
                      }}
                      className="p-1 text-[9px] font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded"
                    >
                      Kaldır
                    </button>
                    <ChevronRight size={13} className="text-text-secondary/30" />
                  </div>
                </div>
              ));
            })()}

            {/* Feeds Detail list with inline heart toggle and quick active switch */}
            {activeMetricDetail === 'feeds' && (() => {
              if (feeds.length === 0) {
                return <p className="text-xs text-text-secondary/60 italic py-4 text-center">Henüz eklenmiş RSS kaynağı yok.</p>;
              }

              return feeds.map(feed => {
                return (
                  <div
                    key={feed.id}
                    className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl flex justify-between items-center gap-3 transition-all animate-scale-up"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-white/5 text-text-secondary rounded text-[9px] font-mono">
                          {feed.category}
                        </span>
                        {feed.healthStatus === 'broken' && (
                          <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 rounded">⚠️ Hatalı</span>
                        )}
                        {feed.healthStatus === 'healthy' && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded">✓ Aktif</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-text-primary truncate mt-1">
                        {feed.title}
                      </h4>
                      <p className="text-[9px] text-text-secondary/60 font-mono truncate">{feed.url}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Heart Toggle */}
                      <button
                        onClick={() => {
                          const updated = feeds.map(f => f.id === feed.id ? { ...f, isFavorite: !f.isFavorite } : f);
                          if (onUpdateFeeds) onUpdateFeeds(updated);
                          showToast(feed.isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          feed.isFavorite
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-white/5 text-text-secondary hover:text-rose-400 border-white/5'
                        }`}
                        title={feed.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      >
                        <Heart size={11} className={feed.isFavorite ? 'fill-current text-rose-500' : ''} />
                      </button>

                      {/* Active/Passive Quick Switch */}
                      <button
                        onClick={() => {
                          const updated = feeds.map(f => f.id === feed.id ? { ...f, isActive: !f.isActive } : f);
                          if (onUpdateFeeds) onUpdateFeeds(updated);
                          showToast(feed.isActive ? 'Kaynak devre dışı bırakıldı' : 'Kaynak aktif edildi');
                        }}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all ${
                          feed.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-white/10 text-text-secondary hover:bg-white/20'
                        }`}
                      >
                        {feed.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </div>
                  </div>
                );
              });
            })()}

          </div>
        </div>
      )}

      {/* SECTION 3: FEATURED NEWS & CATEGORIES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        
        {/* Left Column (Col 8): Günün Öne Çıkan Haber Akışı */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1.5 border-b border-white/5">
            <h3 className="text-sm font-black font-sans text-text-primary flex items-center gap-2">
              <TrendingUp size={16} className="text-rose-500 animate-pulse" />
              Günün Öne Çıkan Haber Akışı
            </h3>

            {/* Multi-Source selector for Featured News */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <MultiSourceSelector 
                feeds={feeds} 
                selectedIds={featuredSources} 
                onChange={setFeaturedSources} 
                label="Akış Kaynakları" 
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
            {featuredArticles.length > 0 ? (
              featuredArticles.map((article) => {
                const isSaved = savedArticles.some(s => s.id === article.id);
                const isRead = readArticleIds.has(article.id);

                return (
                  <div
                    key={article.id}
                    onClick={() => {
                      setSelectedReaderArticle(article);
                      setSingleSummary(null);
                    }}
                    className={`p-4 bg-white/[0.01] hover:bg-white/[0.03] border rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row gap-4 group ${
                      isRead ? 'border-white/5 opacity-70' : 'border-white/10 hover:border-indigo-500/30'
                    }`}
                  >
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full sm:w-28 h-20 object-cover rounded-xl shrink-0 bg-neutral-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full sm:w-28 h-20 bg-white/5 rounded-xl shrink-0 flex items-center justify-center text-text-secondary/35">
                        <BookOpen size={20} />
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[9px] font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold uppercase">
                            {article.category}
                          </span>
                          <span className="text-text-secondary/70">{article.feedTitle}</span>
                          <span className="text-text-secondary/40">•</span>
                          <span className="text-text-secondary/60">{formatTimeAgo(article.pubDate)}</span>
                          {isSaved && (
                            <span className="ml-auto px-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded text-[8px] font-bold">KAYITLI</span>
                          )}
                        </div>

                        <h4 className="font-bold font-sans text-sm text-text-primary group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                      </div>

                      <p className="text-xs text-text-secondary/70 line-clamp-2 font-sans">
                        {article.contentSnippet || article.content || 'İçerik özeti bulunmuyor.'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-text-secondary/60 space-y-2">
                <BookOpen size={32} className="mx-auto opacity-30" />
                <p className="text-sm">Seçilen filtrelere uygun öne çıkan haber bulunamadı.</p>
                <p className="text-xs text-text-secondary/50">Lütfen filtreyi veya RSS kaynaklarınızı kontrol edin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Col 4): Categories & Launch Summary */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-mono font-black uppercase tracking-wider text-indigo-400 border-b border-white/5 pb-1.5">
            Dinamik Dağılım Analizi
          </h3>

          {/* Categories list as clickable interactive buttons */}
          <div className="space-y-2">
            {categories.map((cat) => {
              const count = articles.filter(a => a.category === cat).length;
              const latestInCat = articles.find(a => a.category === cat);
              return (
                <div
                  key={cat}
                  onClick={onNavigateToNews}
                  className="p-3 bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-text-primary group-hover:text-indigo-300 transition-colors">{cat}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[9px] text-text-secondary font-mono">
                        {count} haber
                      </span>
                    </div>
                    {latestInCat && (
                      <p className="text-[10px] text-text-secondary/60 truncate mt-1">
                        Son: {latestInCat.title}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={13} className="text-text-secondary/30 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Active Workstation statistics / visual summary block */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary/80">Kanal Verimlilik Skoru</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Aktif / Toplam RSS</span>
                <span className="font-bold text-text-primary">{activeFeeds.length} / {feeds.length}</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(activeFeeds.length / Math.max(feeds.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Okunma Oranı</span>
                <span className="font-bold text-text-primary">
                  {Math.round(((articles.length - unreadArticlesCount) / Math.max(articles.length, 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${((articles.length - unreadArticlesCount) / Math.max(articles.length, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent fixed footer news ticker overlapping with bottom content */}
      <div className="h-28 shrink-0" />

      {/* INTERACTIVE COMPREHENSIVE OVERLAY READER MODAL */}
      {selectedReaderArticle && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 font-bold rounded-full uppercase">
                    {selectedReaderArticle.category}
                  </span>
                  <span className="text-text-secondary">{selectedReaderArticle.feedTitle}</span>
                  <span className="text-text-secondary/40">•</span>
                  <span className="text-text-secondary/60">{formatTimeAgo(selectedReaderArticle.pubDate)}</span>
                </div>
                <h2 className="text-base lg:text-lg font-black text-text-primary leading-snug">
                  {selectedReaderArticle.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedReaderArticle(null);
                  setSingleSummary(null);
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content Scroll Box */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 text-sm text-text-secondary leading-relaxed">
              {selectedReaderArticle.image && (
                <img
                  src={selectedReaderArticle.image}
                  alt={selectedReaderArticle.title}
                  className="w-full h-48 lg:h-56 object-cover rounded-2xl bg-neutral-800"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap gap-2 items-center pb-4 border-b border-white/5">
                {/* Save Toggle */}
                <button
                  onClick={() => {
                    if (onToggleSave) onToggleSave(selectedReaderArticle);
                    showToast(savedArticles.some(s => s.id === selectedReaderArticle.id) ? 'Kütüphaneden kaldırıldı' : 'Kütüphaneye kaydedildi');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    savedArticles.some(s => s.id === selectedReaderArticle.id)
                      ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                      : 'bg-white/5 text-text-secondary border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Bookmark size={13} className={savedArticles.some(s => s.id === selectedReaderArticle.id) ? 'fill-current' : ''} />
                  <span>{savedArticles.some(s => s.id === selectedReaderArticle.id) ? 'Kaydedildi' : 'Kütüphaneye Kaydet'}</span>
                </button>

                {/* Summarize Call */}
                <button
                  onClick={() => handleSummarizeSingleArticle(selectedReaderArticle)}
                  disabled={isSummarizingSingle}
                  className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles size={13} className={isSummarizingSingle ? 'animate-spin' : ''} />
                  <span>{isSummarizingSingle ? 'Özetleniyor...' : 'AI ile Özetle (TL;DR)'}</span>
                </button>

                {/* Copy link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedReaderArticle.link);
                    showToast('Makale linki panoya kopyalandı.');
                  }}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5 text-xs font-bold flex items-center gap-1"
                >
                  <Copy size={13} /> Link
                </button>
              </div>

              {/* AI Summary View block */}
              {(isSummarizingSingle || singleSummary) && (
                <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl space-y-2 animate-scale-up">
                  <div className="flex items-center gap-1 text-indigo-300 text-xs font-bold">
                    <Sparkles size={13} className="animate-pulse" />
                    <span>Haberin Akıllı Yapay Zeka Özeti</span>
                  </div>
                  {isSummarizingSingle ? (
                    <div className="py-2 flex items-center gap-2 text-xs text-indigo-300/70 font-mono">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                      <span>Gemini analizi derliyor...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-indigo-100/95 leading-relaxed bg-black/25 p-3 rounded-xl whitespace-pre-line border border-indigo-500/10">
                      {singleSummary}
                    </p>
                  )}
                </div>
              )}

              {/* Haber metni (content or contentSnippet) */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-text-secondary/70">Haber Metni & Ayrıntısı</h4>
                <p className="text-sm font-sans text-text-primary/90 leading-relaxed font-normal whitespace-pre-line">
                  {selectedReaderArticle.content || selectedReaderArticle.contentSnippet || 'Haber metni detayı çekilemedi.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-black/25 flex items-center justify-between gap-4">
              <a
                href={selectedReaderArticle.link}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Globe size={13} />
                <span>Orijinal Kaynağı Aç (Medyaya Git)</span>
                <ExternalLink size={11} />
              </a>

              <button
                onClick={() => {
                  setSelectedReaderArticle(null);
                  setSingleSummary(null);
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
