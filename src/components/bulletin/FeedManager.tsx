import React, { useState } from 'react';
import {
  Plus, Radio, Trash2, CheckCircle2, XCircle, Download, Upload, RefreshCw, ExternalLink, Globe,
  ShieldCheck, Wrench, AlertTriangle, Activity, Sparkles, Check, ArrowRight, Info, Search, Filter, Copy, FileText, CheckCheck,
  Share2, MessageSquare, Youtube, Code, Hash, Heart
} from 'lucide-react';
import { RSSFeed } from './types';
import { exportToOPML, parseOPML, detectFeedPlatformInfo, getFeedHomepageUrl } from './utils';

interface FeedManagerProps {
  feeds: RSSFeed[];
  onToggleFeed: (id: string) => void;
  onAddFeed: (feed: Omit<RSSFeed, 'id'>) => void;
  onDeleteFeed: (id: string) => void;
  onImportOPML: (importedFeeds: { title: string; url: string; category: string }[]) => void;
  onResetDefaultFeeds: () => void;
  onUpdateFeeds?: (updatedFeeds: RSSFeed[]) => void;
}

export function FeedManager({
  feeds,
  onToggleFeed,
  onAddFeed,
  onDeleteFeed,
  onImportOPML,
  onResetDefaultFeeds,
  onUpdateFeeds
}: FeedManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Sosyal Medya & Forumlar');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Social Media & Forum Quick Add State
  const [socialSubredditInput, setSocialSubredditInput] = useState('');
  const [socialYoutubeInput, setSocialYoutubeInput] = useState('');

  // Live Progress & Health Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0); // 0 to 100
  const [currentCheckingTitle, setCurrentCheckingTitle] = useState('');
  const [checkedCount, setCheckedCount] = useState(0);
  const [liveStats, setLiveStats] = useState({ healthy: 0, repaired: 0, broken: 0 });

  // Post-Audit Detailed Report Modal
  const [auditReport, setAuditReport] = useState<{
    totalAudited: number;
    completedAt: string;
    healthScore: number;
    healthy: (RSSFeed & { responseTime?: number })[];
    repaired: (RSSFeed & { repairedUrl: string; originalUrl: string })[];
    broken: (RSSFeed & { error: string; originalUrl: string })[];
  } | null>(null);

  const [activeReportTab, setActiveReportTab] = useState<'all' | 'repaired' | 'broken' | 'healthy'>('all');
  const [copiedReport, setCopiedReport] = useState(false);
  const [checkingFeedId, setCheckingFeedId] = useState<string | null>(null);

  const categories = React.useMemo(() => Array.from(new Set(feeds.map(f => f.category))), [feeds]);

  const filteredFeeds = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return feeds.filter(f => {
      const matchesCat = filterCategory === 'all' || f.category === filterCategory;
      const matchesSearch = !q || f.title.toLowerCase().includes(q) || 
                            f.url.toLowerCase().includes(q) ||
                            f.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [feeds, filterCategory, searchQuery]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    onAddFeed({
      title: newTitle.trim(),
      url: newUrl.trim(),
      category: newCategory.trim() || 'Genel',
      isActive: true,
      isDefault: false
    });

    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  // Quick Add Subreddit
  const handleAddSubreddit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = socialSubredditInput.trim().replace(/^r\//i, '').replace(/^\//, '');
    if (!sub) return;
    const feedUrl = `https://www.reddit.com/r/${sub}/hot.rss`;
    const feedTitle = `Reddit - r/${sub}`;
    onAddFeed({
      title: feedTitle,
      url: feedUrl,
      category: 'Sosyal Medya & Forumlar',
      isActive: true
    });
    setSocialSubredditInput('');
  };

  // Quick Add YouTube Channel
  const handleAddYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    const input = socialYoutubeInput.trim();
    if (!input) return;
    let feedUrl = input;
    let feedTitle = 'YouTube Kanalı';

    if (input.includes('youtube.com/channel/')) {
      const channelId = input.split('youtube.com/channel/')[1].split('/')[0].split('?')[0];
      feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      feedTitle = `YouTube Channel (${channelId.substring(0, 8)}...)`;
    } else if (input.startsWith('UC') && input.length >= 20) {
      feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${input}`;
      feedTitle = `YouTube Channel (${input.substring(0, 8)}...)`;
    } else if (!input.startsWith('http')) {
      const handle = input.replace(/^@/, '').trim();
      const lower = handle.toLowerCase();
      if (lower === 'siyahzetsu' || lower === 'beyazzetsu') {
        feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCxHlq3cewhURy3V05cjBvTQ';
        feedTitle = 'YouTube - @siyahzetsu';
      } else if (lower === 'pintipandayt' || lower === 'pintipanda') {
        feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCuU0qYesQjAT_qXcQJqgV3w';
        feedTitle = 'YouTube - @pintipandaYT';
      } else {
        feedUrl = `https://www.youtube.com/feeds/videos.xml?user=${handle}`;
        feedTitle = `YouTube - @${handle}`;
      }
    }

    onAddFeed({
      title: feedTitle,
      url: feedUrl,
      category: 'Sosyal Medya & Forumlar',
      isActive: true
    });
    setSocialYoutubeInput('');
  };

  // Quick Add Social Preset Feed
  const handleAddSocialPreset = (preset: { title: string; url: string; category: string }) => {
    const exists = feeds.some(f => f.url.toLowerCase() === preset.url.toLowerCase());
    if (exists) {
      alert(`${preset.title} zaten ekli!`);
      return;
    }
    onAddFeed({
      title: preset.title,
      url: preset.url,
      category: preset.category,
      isActive: true
    });
  };

  const handleOpmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseOPML(text);
        if (parsed.length > 0) {
          onImportOPML(parsed);
          setImportStatusMessage(`${parsed.length} adet RSS kaynağı başarıyla içe aktarıldı!`);
          setTimeout(() => setImportStatusMessage(null), 4000);
        } else {
          alert('OPML dosyasından geçerli RSS kaynağı okunamadı.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleOpmlDownload = () => {
    const opmlXml = exportToOPML(feeds);
    const blob = new Blob([opmlXml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexos-rss-feeds-${new Date().toISOString().slice(0,10)}.opml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Run Real-Time Incremental Health Check & Auto-Repair
  const runHealthAudit = async () => {
    if (feeds.length === 0) return;

    setIsAuditing(true);
    setAuditProgress(0);
    setCheckedCount(0);
    setLiveStats({ healthy: 0, repaired: 0, broken: 0 });
    setAuditReport(null);

    const total = feeds.length;
    const healthyList: any[] = [];
    const repairedList: any[] = [];
    const brokenList: any[] = [];

    const updatedFeedsCopy = [...feeds];

    // Process in batches of 2 concurrent checks for optimal speed and accurate progress
    const BATCH_SIZE = 2;
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const chunk = feeds.slice(i, i + BATCH_SIZE);
      
      const chunkPromises = chunk.map(async (feed) => {
        setCurrentCheckingTitle(feed.title);
        try {
          const res = await fetch(`/api/rss-health/check?url=${encodeURIComponent(feed.url)}&title=${encodeURIComponent(feed.title)}`);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          return { feed, data };
        } catch (err: any) {
          return { feed, data: { status: 'broken', error: err.message || 'Bağlantı Zaman Aşımı' } };
        }
      });

      const results = await Promise.all(chunkPromises);

      for (const { feed, data } of results) {
        const feedIndex = updatedFeedsCopy.findIndex(f => f.id === feed.id);

        if (data.status === 'repaired') {
          const repObj = {
            ...feed,
            url: data.repairedUrl,
            originalUrl: feed.url,
            healthStatus: 'repaired' as const,
            lastHealthCheck: new Date().toISOString()
          };
          repairedList.push({ ...repObj, repairedUrl: data.repairedUrl });
          if (feedIndex !== -1) updatedFeedsCopy[feedIndex] = repObj;
          setLiveStats(prev => ({ ...prev, repaired: prev.repaired + 1 }));
        } else if (data.status === 'healthy') {
          const healthObj = {
            ...feed,
            healthStatus: 'healthy' as const,
            lastHealthCheck: new Date().toISOString()
          };
          healthyList.push(healthObj);
          if (feedIndex !== -1) updatedFeedsCopy[feedIndex] = healthObj;
          setLiveStats(prev => ({ ...prev, healthy: prev.healthy + 1 }));
        } else {
          const brokenObj = {
            ...feed,
            healthStatus: 'broken' as const,
            lastError: data.error || 'Erişim Hatası (HTTP 404/403)',
            lastHealthCheck: new Date().toISOString()
          };
          brokenList.push({ ...brokenObj, error: data.error || 'Erişim Hatası', originalUrl: feed.url });
          if (feedIndex !== -1) updatedFeedsCopy[feedIndex] = brokenObj;
          setLiveStats(prev => ({ ...prev, broken: prev.broken + 1 }));
        }
      }

      const completed = Math.min(total, i + chunk.length);
      setCheckedCount(completed);
      setAuditProgress(Math.round((completed / total) * 100));
    }

    // Apply overall state updates
    if (onUpdateFeeds) {
      onUpdateFeeds(updatedFeedsCopy);
    }

    const healthScore = total > 0 ? Math.round(((healthyList.length + repairedList.length) / total) * 100) : 100;

    setAuditReport({
      totalAudited: total,
      completedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      healthScore,
      healthy: healthyList,
      repaired: repairedList,
      broken: brokenList
    });

    setIsAuditing(false);
  };

  // Run Check & Repair for a single feed
  const checkSingleFeed = async (feed: RSSFeed) => {
    setCheckingFeedId(feed.id);
    try {
      const res = await fetch(`/api/rss-health/check?url=${encodeURIComponent(feed.url)}&title=${encodeURIComponent(feed.title)}`);
      if (!res.ok) throw new Error('Sunucu yanıt vermedi');
      const data = await res.json();

      if (onUpdateFeeds) {
        const updated = feeds.map(f => {
          if (f.id === feed.id) {
            if (data.status === 'repaired') {
              return {
                ...f,
                url: data.repairedUrl,
                originalUrl: f.url,
                healthStatus: 'repaired' as const,
                lastHealthCheck: new Date().toISOString()
              };
            } else if (data.status === 'healthy') {
              return {
                ...f,
                healthStatus: 'healthy' as const,
                lastHealthCheck: new Date().toISOString()
              };
            } else {
              return {
                ...f,
                healthStatus: 'broken' as const,
                lastError: data.error || 'Erişim Hatası',
                lastHealthCheck: new Date().toISOString()
              };
            }
          }
          return f;
        });
        onUpdateFeeds(updated);
      }

      if (data.status === 'repaired') {
        alert(`🔧 "${feed.title}" için hatalı URL otomatik onarıldı!\nYeni Bağlantı: ${data.repairedUrl}`);
      } else if (data.status === 'healthy') {
        alert(`🟢 "${feed.title}" sorunsuz çalışıyor.`);
      } else {
        alert(`⚠️ "${feed.title}" kaynağına erişilemiyor: ${data.error || 'HTTP 404 Not Found'}`);
      }
    } catch (e: any) {
      alert(`Hata: ${e.message}`);
    } finally {
      setCheckingFeedId(null);
    }
  };

  // Action: Remove all broken feeds from list
  const handleRemoveBrokenFeeds = () => {
    if (!auditReport || auditReport.broken.length === 0) return;
    if (window.confirm(`${auditReport.broken.length} adet erişilemeyen hatalı kaynak listeden tamamen kaldırılacaktır. Onaylıyor musunuz?`)) {
      const brokenIds = new Set(auditReport.broken.map(b => b.id));

      // 1. Call onDeleteFeed for each broken ID
      brokenIds.forEach(id => onDeleteFeed(id));

      // 2. Call onUpdateFeeds with remaining feeds if provided
      if (onUpdateFeeds) {
        const remaining = feeds.filter(f => !brokenIds.has(f.id));
        onUpdateFeeds(remaining);
      }

      // 3. Update report state so it reflects the deletion immediately
      setAuditReport(prev => {
        if (!prev) return null;
        const newTotal = prev.healthy.length + prev.repaired.length;
        return {
          ...prev,
          totalAudited: newTotal,
          healthScore: 100,
          broken: []
        };
      });
    }
  };

  // Action: Remove single broken feed from report
  const handleDeleteSingleBrokenFeed = (id: string) => {
    onDeleteFeed(id);
    if (onUpdateFeeds) {
      onUpdateFeeds(feeds.filter(f => f.id !== id));
    }
    setAuditReport(prev => {
      if (!prev) return null;
      const newBroken = prev.broken.filter(b => b.id !== id);
      const newTotal = prev.healthy.length + prev.repaired.length + newBroken.length;
      const newScore = newTotal > 0 ? Math.round(((prev.healthy.length + prev.repaired.length) / newTotal) * 100) : 100;
      return {
        ...prev,
        totalAudited: newTotal,
        healthScore: newScore,
        broken: newBroken
      };
    });
  };

  // Action: Disable (deactivate) all broken feeds
  const handleDisableBrokenFeeds = () => {
    if (!auditReport || auditReport.broken.length === 0) return;
    const brokenIds = new Set(auditReport.broken.map(b => b.id));
    if (onUpdateFeeds) {
      const updated = feeds.map(f => brokenIds.has(f.id) ? { ...f, isActive: false } : f);
      onUpdateFeeds(updated);
    }
    alert(`${auditReport.broken.length} adet hatalı kanal pasife alındı.`);
  };

  // Copy text log report
  const copyReportToClipboard = () => {
    if (!auditReport) return;
    const text = `APEX OS - RSS Kaynak Onarım Raporu (${auditReport.completedAt})
------------------------------------------------
Toplam Taranan: ${auditReport.totalAudited}
Sistem Sağlık Skoru: %${auditReport.healthScore}
🟢 Sağlıklı: ${auditReport.healthy.length}
🔧 Otomatik Onarılan: ${auditReport.repaired.length}
⚠️ Hatalı / Erişilemez: ${auditReport.broken.length}

ONARILAN KANALLAR:
${auditReport.repaired.map(r => `- ${r.title}: ${r.originalUrl} -> ${r.repairedUrl}`).join('\n') || 'Yok'}

HATALI KANALLAR:
${auditReport.broken.map(b => `- ${b.title}: ${b.url} (${b.error})`).join('\n') || 'Yok'}
`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden h-full p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase tracking-widest mb-1">
            <Radio size={14} className="animate-pulse" />
            RSS Kaynak Kataloğu & Akıllı Onarım Sistemleri
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-black text-text-primary flex items-center gap-2">
            Dinamik Yayın Kaynakları
          </h1>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            Türkçe ve uluslararası RSS kanallarınızı yönetin. Hatalı veya 404 veren bağlantıları otomatik tespit edip düzelten akıllı onarım sistemini çalıştırabilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Health Check & Auto-Repair Trigger Button */}
          <button
            onClick={runHealthAudit}
            disabled={isAuditing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isAuditing
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
            }`}
          >
            {isAuditing ? (
              <RefreshCw size={15} className="animate-spin text-amber-400" />
            ) : (
              <ShieldCheck size={15} className="text-emerald-400" />
            )}
            <span>{isAuditing ? 'Denetim Yapılıyor...' : 'Sağlık Denetimi & Onarım'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]"
          >
            <Plus size={16} />
            Yeni RSS Ekle
          </button>
          
          <label className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer">
            <Upload size={14} className="text-indigo-400" />
            <span>OPML İçe Aktar</span>
            <input type="file" accept=".opml,.xml" onChange={handleOpmlFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleOpmlDownload}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-text-primary transition-all"
            title="OPML İndir"
          >
            <Download size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">OPML Dışa Aktar</span>
          </button>

          <button
            onClick={onResetDefaultFeeds}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-text-secondary hover:text-white transition-all"
            title="Varsayılan Kanalları Sıfırla"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Live Animated Progress Bar Component */}
      {isAuditing && (
        <div className="mt-6 p-5 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-neutral-900 border border-indigo-500/30 rounded-3xl space-y-4 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400 animate-spin">
                <RefreshCw size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-display">Canlı RSS Otomatik Onarım Testi</span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold rounded-full border border-indigo-500/30">
                    %{auditProgress}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary font-mono mt-0.5 truncate max-w-md">
                  🔍 Test Ediliyor: <span className="text-indigo-300 font-semibold">{currentCheckingTitle}</span> ({checkedCount}/{feeds.length})
                </p>
              </div>
            </div>

            {/* Live Stats Pills */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold flex items-center gap-1">
                🟢 {liveStats.healthy}
              </span>
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl font-bold flex items-center gap-1">
                🔧 {liveStats.repaired}
              </span>
              <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl font-bold flex items-center gap-1">
                ⚠️ {liveStats.broken}
              </span>
            </div>
          </div>

          {/* Interactive Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-black/60 border border-white/10 rounded-full h-3 overflow-hidden p-0.5 relative">
              <div
                className="bg-gradient-to-r from-indigo-500 via-rose-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                style={{ width: `${Math.max(2, auditProgress)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-text-secondary font-mono px-1">
              <span>{checkedCount} / {feeds.length} kaynak tamamlandı</span>
              <span>Kalan: {feeds.length - checkedCount}</span>
            </div>
          </div>
        </div>
      )}

      {importStatusMessage && (
        <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>{importStatusMessage}</span>
        </div>
      )}

      {/* Detailed Post-Audit Repair Report Modal / Section */}
      {auditReport && (
        <div className="my-6 p-6 bg-neutral-900/90 border border-indigo-500/30 rounded-3xl space-y-6 shadow-2xl backdrop-blur-2xl transition-all">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-display font-black text-white">Detaylı RSS Onarım Raporu</h2>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold rounded-full">
                    Saat {auditReport.completedAt}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Tüm RSS kanalları taranıp hatalı veya yetkisiz erişim adresleri alternatif çalışan bağlantılarla güncellendi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyReportToClipboard}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-text-primary transition-all"
              >
                {copiedReport ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedReport ? 'Kopyalandı!' : 'Raporu Kopyala'}</span>
              </button>
              <button
                onClick={() => setAuditReport(null)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-text-primary rounded-xl transition-all"
              >
                Kapat ✕
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between gap-1">
              <span className="text-[10px] font-mono text-text-secondary uppercase font-bold">Sağlık Skoru</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-400 font-display">%{auditReport.healthScore}</span>
                <span className="text-[10px] text-emerald-400 font-bold">Sistem İyileşti</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col justify-between gap-1">
              <span className="text-[10px] font-mono text-emerald-400/80 uppercase font-bold">🟢 Sağlıklı Kanallar</span>
              <span className="text-2xl font-black text-emerald-400 font-display">{auditReport.healthy.length}</span>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col justify-between gap-1">
              <span className="text-[10px] font-mono text-amber-400/80 uppercase font-bold">🔧 Otomatik Düzeltilen</span>
              <span className="text-2xl font-black text-amber-400 font-display">{auditReport.repaired.length}</span>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col justify-between gap-1">
              <span className="text-[10px] font-mono text-rose-400/80 uppercase font-bold">⚠️ Hatalı / Erişilemez</span>
              <span className="text-2xl font-black text-rose-400 font-display">{auditReport.broken.length}</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveReportTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeReportTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Tümü ({auditReport.totalAudited})
            </button>
            <button
              onClick={() => setActiveReportTab('repaired')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeReportTab === 'repaired'
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/5 text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Wrench size={14} />
              Otomatik Onarılanlar ({auditReport.repaired.length})
            </button>
            <button
              onClick={() => setActiveReportTab('broken')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeReportTab === 'broken'
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/5 text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <AlertTriangle size={14} />
              Düzeltilemeyen Hatalılar ({auditReport.broken.length})
            </button>
            <button
              onClick={() => setActiveReportTab('healthy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeReportTab === 'healthy'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 size={14} />
              Sağlıklı Kanallar ({auditReport.healthy.length})
            </button>
          </div>

          {/* Tab Content Details */}
          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {/* Repaired Tab */}
            {(activeReportTab === 'all' || activeReportTab === 'repaired') && auditReport.repaired.map(rep => {
              const hp = getFeedHomepageUrl(rep.repairedUrl || rep.url, rep.title);
              return (
                <div key={rep.id} className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench size={16} className="text-amber-400" />
                      <span className="font-bold text-white font-sans text-sm">{rep.title}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono rounded-md font-bold">
                        {rep.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={hp.homepageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-indigo-300 hover:text-white bg-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-500/30 transition-colors"
                      >
                        <Globe size={10} /> Ana Sayfa ↗
                      </a>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">
                        Oto-Onarıldı
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-black/40 rounded-xl font-mono text-[11px] space-y-1">
                    <div className="flex items-center gap-2 text-rose-400/80">
                      <span className="w-16 font-bold shrink-0">Eski URL:</span>
                      <span className="line-through truncate">{rep.originalUrl}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="w-16 shrink-0">Yeni URL:</span>
                      <span className="truncate">{rep.repairedUrl}</span>
                      <a href={rep.repairedUrl} target="_blank" rel="noreferrer" className="ml-auto text-[10px] underline text-indigo-300">
                        Test Et ↗
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Broken Tab */}
            {(activeReportTab === 'all' || activeReportTab === 'broken') && auditReport.broken.map(brk => {
              const hp = getFeedHomepageUrl(brk.url, brk.title);
              return (
                <div key={brk.id} className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-rose-400" />
                      <span className="font-bold text-white font-sans text-sm">{brk.title}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-300 font-mono rounded-md font-bold">
                        {brk.category}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-text-secondary/80 truncate">{brk.url}</p>
                    <p className="text-[10px] text-rose-400 font-mono font-medium">Hata Sebebi: {brk.error}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={hp.homepageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold rounded-xl border border-indigo-500/30 flex items-center gap-1 transition-all"
                    >
                      <Globe size={12} /> Ana Sayfa ↗
                    </a>
                    <button
                      onClick={() => handleDeleteSingleBrokenFeed(brk.id)}
                      className="px-3 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-xs font-bold rounded-xl transition-all"
                    >
                      Kaynağı Sil
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Healthy Tab */}
            {(activeReportTab === 'all' || activeReportTab === 'healthy') && auditReport.healthy.map(hlth => {
              const hp = getFeedHomepageUrl(hlth.url, hlth.title);
              return (
                <div key={hlth.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span className="font-bold text-text-primary truncate">{hlth.title}</span>
                    <span className="text-[10px] font-mono text-text-secondary/60 truncate">({hlth.url})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={hp.homepageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Globe size={10} /> Ana Sayfa ↗
                    </a>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Sağlıklı</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer for Broken Feeds */}
          {auditReport.broken.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20">
              <div className="text-xs text-rose-200">
                <span className="font-bold">⚠️ {auditReport.broken.length} adet kanal bağlantısına erişilemiyor.</span>
                <p className="text-[11px] text-rose-300/70">Tek tıkla hatalı tüm kaynakları silebilir veya geçici olarak pasife alabilirsiniz.</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDisableBrokenFeeds}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white rounded-xl transition-all"
                >
                  Pasife Al
                </button>
                <button
                  onClick={handleRemoveBrokenFeeds}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20"
                >
                  Hatalı Tüm Kanalları Sil ({auditReport.broken.length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Media & Forum Quick Integration Hub */}
      <div className="my-6 p-5 bg-gradient-to-r from-orange-950/30 via-neutral-900 to-rose-950/20 border border-orange-500/20 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                Sosyal Medya & Forum Hızlı Ekleme Merkezi
              </h3>
              <p className="text-xs text-text-secondary/80">
                Reddit toplulukları, Hacker News, YouTube kanalları ve geliştirici forumlarını akışınıza tek tıkla dahil edin.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-white/5">
          {/* Subreddit Quick Add */}
          <form onSubmit={handleAddSubreddit} className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
              <MessageSquare size={14} />
              <span>Reddit Subreddit Ekle</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-orange-400/80 font-bold">r/</span>
                <input
                  type="text"
                  placeholder="technology, turkey, yazilim..."
                  value={socialSubredditInput}
                  onChange={(e) => setSocialSubredditInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs rounded-xl transition-all shrink-0"
              >
                Ekle
              </button>
            </div>
          </form>

          {/* YouTube Channel Quick Add */}
          <form onSubmit={handleAddYoutube} className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400">
              <Youtube size={14} />
              <span>YouTube Kanalı Ekle</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="@KanalAdı veya Channel ID"
                value={socialYoutubeInput}
                onChange={(e) => setSocialYoutubeInput(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all shrink-0"
              >
                Ekle
              </button>
            </div>
          </form>

          {/* Preset Social Channels */}
          <div className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Sparkles size={14} />
              <span>Popüler Sosyal Hazır Kanallar</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { title: 'Reddit r/turkey', url: 'https://www.reddit.com/r/turkey/hot.rss', category: 'Sosyal Medya & Forumlar' },
                { title: 'Reddit r/technology', url: 'https://www.reddit.com/r/technology/hot.rss', category: 'Sosyal Medya & Forumlar' },
                { title: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'Sosyal Medya & Forumlar' },
                { title: 'Dev.to', url: 'https://dev.to/feed', category: 'Sosyal Medya & Forumlar' },
                { title: 'Product Hunt', url: 'https://www.producthunt.com/feed', category: 'Sosyal Medya & Forumlar' },
                { title: 'GitHub Trending', url: 'https://github.com/trending', category: 'Sosyal Medya & Forumlar' }
              ].map(preset => {
                const isAdded = feeds.some(f => f.url.toLowerCase() === preset.url.toLowerCase());
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleAddSocialPreset(preset)}
                    disabled={isAdded}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      isAdded
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default'
                        : 'bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border-white/10'
                    }`}
                  >
                    {isAdded ? `✓ ${preset.title}` : `+ ${preset.title}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'all'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
            }`}
          >
            Tüm Kategoriler ({feeds.length})
          </button>
          {categories.map(cat => {
            const count = feeds.filter(f => f.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterCategory === cat
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Kaynak adı veya URL ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-text-primary outline-none focus:border-rose-500/50 transition-all"
        />
      </div>

      {/* Feed List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeeds.map((feed) => {
          const isCheckingThis = checkingFeedId === feed.id;
          const pInfo = detectFeedPlatformInfo(feed);
          const hpInfo = getFeedHomepageUrl(feed.url, feed.title);

          return (
            <div
              key={feed.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
                feed.healthStatus === 'broken'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : feed.healthStatus === 'repaired'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : feed.isActive
                  ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  : 'bg-black/40 border-white/5 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400">
                      {feed.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-orange-300 border border-white/10">
                      {pInfo.platform}
                    </span>
                  </div>

                  {/* Health Status Indicator Badge */}
                  <div className="flex items-center gap-1">
                    {feed.healthStatus === 'healthy' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1" title="Sorunsuz çalışıyor">
                        <CheckCircle2 size={10} /> Sağlıklı
                      </span>
                    )}

                    {feed.healthStatus === 'repaired' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1" title="URL Otomatik Onarıldı">
                        <Wrench size={10} /> Onarıldı
                      </span>
                    )}

                    {feed.healthStatus === 'broken' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1" title={feed.lastError || 'HTTP 404/403'}>
                        <AlertTriangle size={10} /> Hatalı (404)
                      </span>
                    )}

                    <button
                      onClick={() => {
                        const updated = feeds.map(f => f.id === feed.id ? { ...f, isFavorite: !f.isFavorite } : f);
                        if (onUpdateFeeds) onUpdateFeeds(updated);
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        feed.isFavorite
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-white/5 text-text-secondary hover:text-rose-400 border-white/5'
                      }`}
                      title={feed.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    >
                      <Heart size={12} className={feed.isFavorite ? 'fill-current text-rose-500' : ''} />
                    </button>

                    <button
                      onClick={() => onToggleFeed(feed.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                        feed.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-white/10 text-text-secondary hover:bg-white/20'
                      }`}
                    >
                      {feed.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {feed.isActive ? 'Aktif' : 'Pasif'}
                    </button>

                    <button
                      onClick={() => {
                        onDeleteFeed(feed.id);
                        if (onUpdateFeeds) onUpdateFeeds(feeds.filter(f => f.id !== feed.id));
                      }}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-text-secondary hover:text-rose-400 transition-colors"
                      title="Kaynağı Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold font-sans text-sm text-text-primary leading-snug line-clamp-1">
                  {feed.title}
                </h3>

                <p className="text-[11px] font-mono text-text-secondary/70 truncate" title={feed.url}>
                  {feed.url}
                </p>

                {/* Quick Access Link to Homepage */}
                <div className="pt-0.5">
                  <a
                    href={hpInfo.homepageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl text-indigo-300 hover:text-white text-xs font-bold transition-all group w-full justify-between"
                    title={`${hpInfo.homepageUrl} - Ana Sayfayı Aç`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe size={13} className="text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">Ana Sayfa: {hpInfo.label}</span>
                    </div>
                    <ExternalLink size={11} className="opacity-70 group-hover:opacity-100 shrink-0" />
                  </a>
                </div>

                {feed.healthStatus === 'broken' && feed.lastError && (
                  <p className="text-[10px] text-rose-400/90 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20 font-mono">
                    ⚠️ {feed.lastError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-secondary/60 pt-2 border-t border-white/5 gap-2">
                <button
                  onClick={() => checkSingleFeed(feed)}
                  disabled={isCheckingThis}
                  className="hover:text-indigo-400 flex items-center gap-1 text-[10px] font-bold transition-colors"
                >
                  <RefreshCw size={10} className={isCheckingThis ? 'animate-spin text-indigo-400' : ''} />
                  <span>{isCheckingThis ? 'Denetleniyor...' : 'Test Et'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={hpInfo.homepageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-1 hover:underline"
                    title="İlgili kaynağın ana sayfasına git"
                  >
                    <Globe size={10} /> Ana Sayfa ↗
                  </a>
                  <span className="text-white/10">|</span>
                  <a
                    href={feed.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-rose-400 flex items-center gap-1"
                    title="RSS / XML Bağlantısı"
                  >
                    XML <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFeeds.length === 0 && (
        <div className="py-16 text-center text-text-secondary/60 space-y-3">
          <Radio size={32} className="mx-auto opacity-40" />
          <p className="text-sm font-medium">Aramanıza uygun RSS kaynağı bulunamadı.</p>
        </div>
      )}

      {/* Add Feed Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Radio size={18} className="text-rose-500" />
                Yeni RSS Kaynağı Ekle
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-secondary hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Kanal Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: Hürriyet Teknoloji"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-text-primary outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">RSS / Atom URL Adresi</label>
                <input
                  type="url"
                  placeholder="https://example.com/rss.xml"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-text-primary outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Kategori</label>
                <input
                  type="text"
                  placeholder="Gündem, Teknoloji, Ekonomi, vb."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-text-primary outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                  Kaydet & Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
