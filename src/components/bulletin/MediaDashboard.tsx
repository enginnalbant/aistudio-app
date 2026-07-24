import React, { useState, useEffect } from 'react';
import {
  Play, Video, Film, Tv, Music, List, Plus, Star, HardDrive, Compass, ChevronRight, Bookmark, ArrowRight, ShieldCheck, Activity
} from 'lucide-react';

interface QuickStat {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

export default function MediaDashboard({ onNavigate }: { onNavigate?: (module: string) => void }) {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    // Read stats from localStorage to make dashboard fully dynamic!
    let songsCount = 0;
    let videoCount = 0;
    let mediaItemsCount = 0;
    let moviesCount = 0;
    let seriesCount = 0;
    let wlCount = 0;

    try {
      // 1. Music tracks
      const savedTracks = localStorage.getItem('apex_music_tracks');
      if (savedTracks) songsCount = JSON.parse(savedTracks).length;

      // 2. Videos tracks
      const savedVideos = localStorage.getItem('apex_video_tracks');
      if (savedVideos) videoCount = JSON.parse(savedVideos).length;

      // 3. Movies & TV Shows
      const savedMedia = localStorage.getItem('apex_media_items');
      if (savedMedia) {
        const parsed = JSON.parse(savedMedia);
        mediaItemsCount = parsed.length;
        moviesCount = parsed.filter((m: any) => m.type === 'movie').length;
        seriesCount = parsed.filter((m: any) => m.type === 'series').length;
        wlCount = parsed.filter((m: any) => m.watchlist).length;
      } else {
        // Fallback to defaults
        moviesCount = 3;
        wlCount = 1;
      }
    } catch (e) {
      console.error('Failed to parse dashboard stats:', e);
    }

    setWatchlistCount(wlCount);
    setStats([
      {
        label: 'Kayıtlı Filmler',
        count: moviesCount,
        icon: <Film size={18} />,
        color: 'from-rose-500/10 to-rose-500/20 text-rose-400'
      },
      {
        label: 'Kayıtlı Diziler',
        count: seriesCount,
        icon: <Tv size={18} />,
        color: 'from-indigo-500/10 to-indigo-500/20 text-indigo-400'
      },
      {
        label: 'Eklenen Videolar',
        count: videoCount,
        icon: <Video size={18} />,
        color: 'from-amber-500/10 to-amber-500/20 text-amber-400'
      },
      {
        label: 'Müzik Kitaplığı',
        count: songsCount,
        icon: <Music size={18} />,
        color: 'from-emerald-500/10 to-emerald-500/20 text-emerald-400'
      }
    ]);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#07080b] text-text-primary rounded-3xl p-6 overflow-y-auto custom-scrollbar border border-white/5 relative font-sans">
      
      {/* Decorative ambient lighting glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Main Dashboard Hero */}
      <div className="mb-6 bg-gradient-to-r from-indigo-950/20 via-[#0e1017] to-indigo-950/20 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 font-mono tracking-wider uppercase">
            <ShieldCheck size={14} /> Açık Kaynak Medya Sunucusu
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Kişisel Medya Eğlence Merkeziniz</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Bilgisayarınızdaki yerel video, FLAC müzik dosyalarınızı yükleyin veya Google Drive hesabınızı entegre ederek kendi özel yayın sunucunuzu (Plex/Jellyfin alternatifi) oluşturun.
          </p>
        </div>

        {/* Quick action wrapper */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('bulletin-series-movies')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Film size={14} /> Sinema Salonu
              </button>
              <button
                onClick={() => onNavigate('bulletin-music')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs border border-white/5 transition-all flex items-center justify-center gap-1.5"
              >
                <Music size={14} /> Müzik Çalar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Bento Grid Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${stat.color} border border-white/5 rounded-2xl p-4 flex items-center justify-between`}
          >
            <div className="space-y-1">
              <p className="text-[10px] text-text-secondary/80 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-black text-white font-mono">{stat.count}</h3>
            </div>
            <div className="p-2 bg-black/20 rounded-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Quick play lists & Features */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Play copyright free media segment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Hazır Açık Kaynak Klasikleri</h2>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('bulletin-series-movies')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  Tümünü Gör <ChevronRight size={12} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-[#0c0d12] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden group transition-all">
                <div className="aspect-[16/10] relative">
                  <img
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300"
                    alt="Sintel"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('bulletin-series-movies')}
                        className="p-2 bg-indigo-600 rounded-full text-white shadow-xl hover:scale-105 transition-all"
                      >
                        <Play size={12} className="fill-white" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-0.5 bg-black/20">
                  <h4 className="font-bold text-white text-[11px] truncate">Sintel</h4>
                  <p className="text-[9px] text-text-secondary">Fantastik / Animasyon</p>
                </div>
              </div>

              <div className="bg-[#0c0d12] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden group transition-all">
                <div className="aspect-[16/10] relative">
                  <img
                    src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300"
                    alt="Tears of Steel"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('bulletin-series-movies')}
                        className="p-2 bg-indigo-600 rounded-full text-white shadow-xl hover:scale-105 transition-all"
                      >
                        <Play size={12} className="fill-white" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-0.5 bg-black/20">
                  <h4 className="font-bold text-white text-[11px] truncate">Tears of Steel</h4>
                  <p className="text-[9px] text-text-secondary">Bilim Kurgu / Animasyon</p>
                </div>
              </div>

              <div className="bg-[#0c0d12] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden group transition-all">
                <div className="aspect-[16/10] relative">
                  <img
                    src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300"
                    alt="Big Buck Bunny"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('bulletin-series-movies')}
                        className="p-2 bg-indigo-600 rounded-full text-white shadow-xl hover:scale-105 transition-all"
                      >
                        <Play size={12} className="fill-white" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-0.5 bg-black/20">
                  <h4 className="font-bold text-white text-[11px] truncate">Big Buck Bunny</h4>
                  <p className="text-[9px] text-text-secondary">Komedi / Animasyon</p>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Guide on Streaming / Local access */}
          <div className="p-5 bg-gradient-to-r from-violet-950/10 to-indigo-950/10 border border-indigo-500/10 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="text-indigo-400" size={14} /> Nasıl Kullanılır?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-text-secondary leading-relaxed">
              <div className="space-y-1 bg-black/15 p-3 rounded-xl">
                <p className="font-bold text-white">1. Yerel Dosyaları Yükleme</p>
                <p>Videolar, Müzikler veya Dizi/Film sayfalarına gidip "Yerel Dosya Ekle"ye tıklayarak bilgisayarınızdaki MP4, MKV, FLAC, MP3 gibi medyaları anında yükleyebilir ve oynatabilirsiniz.</p>
              </div>
              <div className="space-y-1 bg-black/15 p-3 rounded-xl">
                <p className="font-bold text-white">2. Google Drive Bağlantısı</p>
                <p>Drive bağlantısını etkinleştirerek hesabınızdaki video ve müzik dosyalarını indirmeden sunucumuz üzerinden doğrudan akış (stream) halinde, kaldığınız yerden devam ederek izleyebilirsiniz.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: System info & Watchlist count */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#0c0d12] border border-white/5 rounded-2xl p-4 space-y-3">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Activity className="text-emerald-400 animate-pulse" size={12} /> Canlı Sistem Durumu
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-text-secondary">Arabellek Boyutu:</span>
                <span className="font-mono text-white">Seçmeli (Otomatik)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">HTTP range-seek desteği:</span>
                <span className="font-bold text-emerald-400">AKTİF (206)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Google Drive Köprüsü:</span>
                <span className="font-mono text-indigo-400">Hazır</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">FLAC/High-Res Desteği:</span>
                <span className="font-bold text-emerald-400">Yüksek (Lossless)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0c0d12] border border-white/5 rounded-2xl p-4 space-y-3">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Bookmark className="text-amber-400" size={12} /> İzleme Listeniz ({watchlistCount})
            </h3>
            
            {watchlistCount === 0 ? (
              <p className="text-[10px] text-text-secondary text-center py-4">İzleme listenizde henüz bir film veya dizi bulunmuyor.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-text-secondary">Sinema sayfasından listenize eklediğiniz öğeler burada görünür. İzleme listeniz kaldığınız yerden devam etmenizi sağlar.</p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('bulletin-series-movies')}
                    className="w-full py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1"
                  >
                    Filmlere Git <ArrowRight size={10} />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
