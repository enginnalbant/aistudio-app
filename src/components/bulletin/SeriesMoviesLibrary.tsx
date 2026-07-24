import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Shuffle, RotateCcw,
  Upload, HardDrive, Search, Film, Tv, Video, Loader2,
  Trash2, Plus, Clock, FileVideo, Settings, Sliders, PlayCircle, Maximize2, Minimize2,
  Bookmark, Heart, Star, Compass, Filter, Grid, List, ChevronRight, Sparkles, PlusCircle, CheckCircle, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Interfaces
interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  source: 'local' | 'drive';
  url: string; // Stream url / Blob
  driveId?: string;
  duration?: number;
}

interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  year: number;
  genre: string;
  synopsis: string;
  coverUrl: string;
  rating: number; // 1-5
  watchlist: boolean;
  favorite: boolean;
  source?: 'local' | 'drive'; // for movies
  url?: string; // for movies
  driveId?: string; // for movies
  seasonsCount?: number; // for series
  episodes?: Episode[]; // for series
  addedAt: string;
}

// Initial Mock catalog items with MIT open source / copyright free content to let the user play instantly
const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'sintel',
    title: 'Sintel (Açık Kaynak Film)',
    type: 'movie',
    year: 2010,
    genre: 'Fantastik / Animasyon',
    synopsis: 'Blender Vakfı tarafından hazırlanan, yalnız bir kızın yavru bir ejderhayı arama hikayesini konu alan ödüllü açık kaynaklı bir kısa film.',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
    rating: 5,
    watchlist: false,
    favorite: true,
    source: 'local',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    addedAt: '23.07.2026'
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel (Bilim Kurgu)',
    type: 'movie',
    year: 2012,
    genre: 'Bilim Kurgu / Animasyon',
    synopsis: 'Geleceğin Amsterdam şehrinde, bir grup bilim insanının dünyayı devasa robot istilasından kurtarmaya çalışmasını konu alan açık kaynak görsel efekt filmi.',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60',
    rating: 4,
    watchlist: true,
    favorite: false,
    source: 'local',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    addedAt: '23.07.2026'
  },
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny (Komedi)',
    type: 'movie',
    year: 2008,
    genre: 'Komedi / Animasyon',
    synopsis: 'Devasa bir orman tavşanının, ormandaki yaramaz kemirgenlerin doğaya ve dostlarına verdiği zararlardan sonra onlardan aldığı eğlenceli intikam hikayesi.',
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
    rating: 5,
    watchlist: false,
    favorite: false,
    source: 'local',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    addedAt: '23.07.2026'
  }
];

export default function SeriesMoviesLibrary() {
  const { accessToken, signInWithGoogle } = useAuth();

  // State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('apex_media_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure initial items remain or merge
        return parsed.length > 0 ? parsed : INITIAL_MEDIA_ITEMS;
      }
    } catch (_) {}
    return INITIAL_MEDIA_ITEMS;
  });

  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCinematicOpen, setIsCinematicOpen] = useState(false);

  // Player controls state
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter/Search UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'watchlist' | 'favorites'>('all');

  // Form creation modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<'movie' | 'series'>('movie');
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newGenre, setNewGenre] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newMovieSource, setNewMovieSource] = useState<'local' | 'drive'>('local');
  const [newMovieUrl, setNewMovieUrl] = useState('');
  const [newMovieDriveId, setNewMovieDriveId] = useState('');
  const [newSeasonsCount, setNewSeasonsCount] = useState(1);

  // Episode Add Modal State (For Series)
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [selectedSeriesForEpisode, setSelectedSeriesForEpisode] = useState<string | null>(null);
  const [epTitle, setEpTitle] = useState('');
  const [epSeason, setEpSeason] = useState(1);
  const [epNumber, setEpNumber] = useState(1);
  const [epSource, setEpSource] = useState<'local' | 'drive'>('local');
  const [epUrl, setEpUrl] = useState('');
  const [epDriveId, setEpDriveId] = useState('');

  // Google Drive state
  const [driveVideos, setDriveVideos] = useState<any[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save changes to local storage
  const saveMediaItems = (updated: MediaItem[]) => {
    setMediaItems(updated);
    try {
      localStorage.setItem('apex_media_items', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save media items:', e);
    }
  };

  // Google Drive video search
  const fetchDriveVideos = async () => {
    if (!accessToken) return;
    setIsDriveLoading(true);
    try {
      const res = await fetch('/api/google/drive/videos', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDriveVideos(data.files || []);
      }
    } catch (e) {
      console.error('Drive video fetch error:', e);
    } finally {
      setIsDriveLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && (isAddModalOpen || isEpisodeModalOpen)) {
      fetchDriveVideos();
    }
  }, [accessToken, isAddModalOpen, isEpisodeModalOpen]);

  // Video playback callbacks
  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const onVideoEnded = () => {
    setIsPlaying(false);
  };

  const formatVideoTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Toggle Watchlist & Favorite
  const toggleWatchlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = mediaItems.map(item => {
      if (item.id === id) return { ...item, watchlist: !item.watchlist };
      return item;
    });
    saveMediaItems(updated);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = mediaItems.map(item => {
      if (item.id === id) return { ...item, favorite: !item.favorite };
      return item;
    });
    saveMediaItems(updated);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu içeriği kütüphaneden kaldırmak istediğinize emin misiniz?')) {
      const updated = mediaItems.filter(item => item.id !== id);
      saveMediaItems(updated);
      if (activeMediaId === id) {
        setActiveMediaId(null);
        setIsCinematicOpen(false);
        setIsPlaying(false);
      }
    }
  };

  // Trigger cinematic play
  const startPlayingMovie = (item: MediaItem) => {
    setActiveMediaId(item.id);
    setActiveEpisodeId(null);
    setIsCinematicOpen(true);
    setIsPlaying(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.volume = isMuted ? 0 : volume;
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 150);
  };

  const startPlayingEpisode = (series: MediaItem, episode: Episode) => {
    setActiveMediaId(series.id);
    setActiveEpisodeId(episode.id);
    setIsCinematicOpen(true);
    setIsPlaying(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.volume = isMuted ? 0 : volume;
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 150);
  };

  // Get current active streaming url
  const getCurrentMediaStreamUrl = () => {
    const item = mediaItems.find(i => i.id === activeMediaId);
    if (!item) return '';

    if (item.type === 'movie') {
      if (item.source === 'drive' && accessToken) {
        return `/api/google/drive/stream/${item.driveId}?token=${accessToken}`;
      }
      return item.url || '';
    } else {
      // TV Series: find Episode
      const ep = item.episodes?.find(e => e.id === activeEpisodeId);
      if (!ep) return '';
      if (ep.source === 'drive' && accessToken) {
        return `/api/google/drive/stream/${ep.driveId}?token=${accessToken}`;
      }
      return ep.url;
    }
  };

  const getCurrentMediaTitle = () => {
    const item = mediaItems.find(i => i.id === activeMediaId);
    if (!item) return 'Bilinmeyen Medya';

    if (item.type === 'movie') {
      return item.title;
    } else {
      const ep = item.episodes?.find(e => e.id === activeEpisodeId);
      return `${item.title} - Sezon ${ep?.seasonNumber} Bölüm ${ep?.episodeNumber}: ${ep?.title || 'Bölüm'}`;
    }
  };

  // Form submit: create new item
  const handleCreateMediaItem = () => {
    if (!newTitle.trim()) return;

    const defaultCover = newCoverUrl.trim() || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=60';
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: newTitle.trim(),
      type: newItemType,
      year: newYear,
      genre: newGenre.trim() || 'Genel',
      synopsis: newSynopsis.trim() || 'Detay girilmedi.',
      coverUrl: defaultCover,
      rating: 5,
      watchlist: false,
      favorite: false,
      addedAt: new Date().toLocaleDateString('tr-TR'),
      ...(newItemType === 'movie' ? {
        source: newMovieSource,
        url: newMovieUrl.trim(),
        driveId: newMovieDriveId
      } : {
        seasonsCount: newSeasonsCount,
        episodes: []
      })
    };

    const updated = [newItem, ...mediaItems];
    saveMediaItems(updated);
    setIsAddModalOpen(false);
    
    // reset form fields
    setNewTitle('');
    setNewGenre('');
    setNewSynopsis('');
    setNewCoverUrl('');
    setNewMovieUrl('');
    setNewMovieDriveId('');
  };

  // Form submit: create episode inside series
  const handleAddEpisode = () => {
    if (!epTitle.trim() || !selectedSeriesForEpisode) return;

    const updated = mediaItems.map(item => {
      if (item.id === selectedSeriesForEpisode) {
        const episodes = item.episodes || [];
        const newEp: Episode = {
          id: `ep-${Date.now()}`,
          episodeNumber: epNumber,
          seasonNumber: epSeason,
          title: epTitle.trim(),
          source: epSource,
          url: epUrl.trim(),
          driveId: epDriveId
        };
        return {
          ...item,
          episodes: [...episodes, newEp]
        };
      }
      return item;
    });

    saveMediaItems(updated);
    setIsEpisodeModalOpen(false);
    
    // reset ep form fields
    setEpTitle('');
    setEpUrl('');
    setEpDriveId('');
  };

  // Local File video picker callback for items/episodes
  const handleLocalFileSelection = (event: React.ChangeEvent<HTMLInputElement>, target: 'movie' | 'episode') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    if (target === 'movie') {
      setNewMovieSource('local');
      setNewMovieUrl(blobUrl);
      setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
    } else {
      setEpSource('local');
      setEpUrl(blobUrl);
      setEpTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // Filter lists based on options selected
  const genres = ['All', ...Array.from(new Set(mediaItems.map(i => i.genre)))];
  
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || item.genre === selectedGenre;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesMode = filterMode === 'all' || 
                        (filterMode === 'watchlist' && item.watchlist) ||
                        (filterMode === 'favorites' && item.favorite);

    return matchesSearch && matchesGenre && matchesType && matchesMode;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080b] text-text-primary rounded-3xl overflow-hidden border border-white/5 relative shadow-2xl font-sans">
      
      {/* Cinematic gradient overhead banner overlay */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Panel Content */}
      {!isCinematicOpen ? (
        <div className="flex-1 flex flex-col overflow-hidden z-10">
          
          {/* Top Filter and Actions Row */}
          <div className="p-4 bg-[#0d0e13]/60 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 text-text-secondary/50" size={12} />
                <input
                  type="text"
                  placeholder="Dizi, film veya tür ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121319] border border-white/5 rounded-xl pl-8 pr-4 py-2 text-xs text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Genre Selector */}
              <div className="flex items-center gap-1.5 bg-[#121319] border border-white/5 rounded-xl px-2 py-1 text-xs text-text-secondary">
                <Filter size={11} />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer pr-1"
                >
                  {genres.map(g => (
                    <option key={g} value={g}>{g === 'All' ? 'Tüm Türler' : g}</option>
                  ))}
                </select>
              </div>

              {/* Type selector pills */}
              <div className="flex border border-white/5 bg-black/20 p-0.5 rounded-xl text-xs">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${selectedType === 'all' ? 'bg-[#121319] text-white font-bold' : 'text-text-secondary hover:text-white'}`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setSelectedType('movie')}
                  className={`px-3 py-1 rounded-lg transition-all ${selectedType === 'movie' ? 'bg-[#121319] text-white font-bold' : 'text-text-secondary hover:text-white'}`}
                >
                  Filmler
                </button>
                <button
                  onClick={() => setSelectedType('series')}
                  className={`px-3 py-1 rounded-lg transition-all ${selectedType === 'series' ? 'bg-[#121319] text-white font-bold' : 'text-text-secondary hover:text-white'}`}
                >
                  Diziler
                </button>
              </div>

              {/* Quick watchlist / fav filters */}
              <div className="flex border border-white/5 bg-black/20 p-0.5 rounded-xl text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'all' ? 'bg-[#121319] text-white font-bold' : 'text-text-secondary hover:text-white'}`}
                >
                  Her Şey
                </button>
                <button
                  onClick={() => setFilterMode('watchlist')}
                  className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'watchlist' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-text-secondary hover:text-white'}`}
                  title="İzleme Listesi"
                >
                  İzlenecekler
                </button>
                <button
                  onClick={() => setFilterMode('favorites')}
                  className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'favorites' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-text-secondary hover:text-white'}`}
                  title="Favorilerim"
                >
                  Beğenilenler
                </button>
              </div>
            </div>

            {/* Main creation actions button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 self-end lg:self-auto"
            >
              <PlusCircle size={14} />
              <span>Yeni Film / Dizi Ekle</span>
            </button>
          </div>

          {/* Catalog grid visualization */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-text-secondary">
                <Compass className="text-text-secondary/20 mb-2 animate-pulse" size={40} />
                <p className="text-sm font-bold text-white">Medya Bulunamadı</p>
                <p className="text-xs max-w-xs mt-1">Arama filtrenize uygun veya kütüphanenize eklenmiş hiçbir film/dizi bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMedia.map(item => {
                  const isSeries = item.type === 'series';
                  return (
                    <div
                      key={item.id}
                      className="group bg-[#0d0e13] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg hover:-translate-y-1"
                    >
                      {/* Cover Poster block */}
                      <div className="aspect-[2/3] relative overflow-hidden bg-black/40">
                        <img 
                          src={item.coverUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Hover Overlay triggers cinematic watch */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
                          <div className="flex gap-2 mb-2">
                            {isSeries ? (
                              <button 
                                onClick={() => {
                                  setSelectedSeriesForEpisode(item.id);
                                  setIsEpisodeModalOpen(true);
                                }}
                                className="flex-1 py-1 px-2 bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] transition-all"
                              >
                                + Bölüm Ekle
                              </button>
                            ) : (
                              <button 
                                onClick={() => startPlayingMovie(item)}
                                className="flex-1 py-1 px-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1"
                              >
                                <Play size={10} className="fill-white" /> İzle
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Top quick badges (Year, Type) */}
                        <div className="absolute top-2 left-2 flex gap-1 z-15">
                          <span className="text-[9px] font-bold bg-black/75 px-1.5 py-0.5 rounded text-white font-mono">{item.year}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${isSeries ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {isSeries ? 'Dizi' : 'Film'}
                          </span>
                        </div>

                        {/* Action corner tags */}
                        <div className="absolute top-2 right-2 flex gap-1 z-15">
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className={`p-1 rounded-full ${item.favorite ? 'bg-rose-600 text-white' : 'bg-black/60 text-text-secondary hover:text-white'}`}
                          >
                            <Heart size={10} className={item.favorite ? 'fill-current' : ''} />
                          </button>
                          <button
                            onClick={(e) => toggleWatchlist(item.id, e)}
                            className={`p-1 rounded-full ${item.watchlist ? 'bg-indigo-600 text-white' : 'bg-black/60 text-text-secondary hover:text-white'}`}
                          >
                            <Bookmark size={10} className={item.watchlist ? 'fill-current' : ''} />
                          </button>
                        </div>
                      </div>

                      {/* Info and stats area */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 bg-[#0e0f14]/85">
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">{item.genre}</p>
                          <h3 className="font-bold text-white text-xs truncate group-hover:text-indigo-300 transition-colors" title={item.title}>
                            {item.title}
                          </h3>
                          <p className="text-[10px] text-text-secondary line-clamp-2 h-7 leading-relaxed">
                            {item.synopsis}
                          </p>
                        </div>

                        {/* Series EP display or Movie Play trigger */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          {isSeries ? (
                            <div className="text-[9px] text-text-secondary font-medium">
                              {item.episodes?.length || 0} Bölüm • Sezonlar ({item.seasonsCount || 1})
                            </div>
                          ) : (
                            <div className="text-[9px] text-text-secondary font-medium capitalize">
                              Kaynak: {item.source}
                            </div>
                          )}

                          <button 
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1 text-text-secondary/40 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                            title="Kütüphaneden Sil"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable episodes drawer if TV Series */}
                      {isSeries && item.episodes && item.episodes.length > 0 && (
                        <div className="bg-black/40 border-t border-white/5 p-2 space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                          <p className="text-[8px] font-mono text-text-secondary/50 font-bold uppercase tracking-wider mb-1 px-1">BÖLÜMLER</p>
                          {item.episodes.map(ep => (
                            <button
                              key={ep.id}
                              onClick={() => startPlayingEpisode(item, ep)}
                              className="w-full flex items-center justify-between p-1 hover:bg-white/5 text-[9px] text-left text-text-secondary hover:text-indigo-300 rounded transition-all"
                            >
                              <span className="truncate flex-1 pr-2">S{ep.seasonNumber}E{ep.episodeNumber}: {ep.title}</span>
                              <PlayCircle size={10} className="shrink-0 text-indigo-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Cinema Mode Theater Player layout */
        <div className="flex-1 flex flex-col bg-black relative" ref={containerRef}>
          
          {/* Top Video Header navigation back overlay */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 flex items-center justify-between z-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => {
                setIsCinematicOpen(false);
                setIsPlaying(false);
                if (videoRef.current) videoRef.current.pause();
              }}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center gap-1.5"
            >
              ← Katalog Görünümüne Dön
            </button>
            <div className="text-center">
              <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-bold">SİNEMA SİSTEMİ OYNATILIYOR</p>
              <h2 className="text-white font-bold text-xs">{getCurrentMediaTitle()}</h2>
            </div>
            <div className="w-24" /> {/* spacer for center alignment */}
          </div>

          {/* Actual Cinema Video view tag */}
          <div className="flex-1 flex items-center justify-center bg-black">
            {getCurrentMediaStreamUrl() ? (
              <video
                ref={videoRef}
                src={getCurrentMediaStreamUrl()}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onVideoEnded}
                onClick={togglePlay}
                className="w-full h-full max-h-[85vh] object-contain"
                playsInline
              />
            ) : (
              <div className="text-center text-text-secondary space-y-2">
                <Loader2 className="animate-spin text-indigo-400 mx-auto" size={24} />
                <p className="text-xs">Medya akış kanalı açılıyor...</p>
              </div>
            )}
          </div>

          {/* Dark Cinematic Bottom Controller */}
          <div className="bg-black/90 p-4 border-t border-white/5 flex flex-col space-y-2 z-30 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
            {/* Timeline seek progress bar */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-text-secondary/95">
              <span>{formatVideoTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="flex-1 accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
              />
              <span>{formatVideoTime(duration)}</span>
            </div>

            {/* controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={togglePlay}
                  className="p-1.5 hover:bg-white/10 text-white rounded-lg transition-all"
                >
                  {isPlaying ? <Pause size={18} className="fill-white" /> : <Play size={18} className="fill-white" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (videoRef.current) videoRef.current.volume = !isMuted ? 0 : volume;
                    }}
                    className="p-1.5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-all"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (videoRef.current) videoRef.current.volume = isMuted ? 0 : parseFloat(e.target.value);
                    }}
                    className="w-16 accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={playbackSpeed}
                  onChange={(e) => {
                    setPlaybackSpeed(parseFloat(e.target.value));
                    if (videoRef.current) videoRef.current.playbackRate = parseFloat(e.target.value);
                  }}
                  className="bg-[#121318] border border-white/10 rounded-lg text-[10px] text-white px-2 py-1 font-bold outline-none cursor-pointer"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1.0x (Normal)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                </select>

                <button 
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-all"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* NEW ITEM CREATION MODAL */}
      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-50 overflow-y-auto custom-scrollbar">
          <div className="bg-[#121319] border border-white/10 rounded-2xl p-5 max-w-md w-full space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Kütüphaneye Film / Dizi Ekle</h4>
            
            <div className="grid grid-cols-2 gap-2 bg-black/20 p-0.5 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setNewItemType('movie')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${newItemType === 'movie' ? 'bg-[#1a1b24] text-white' : 'text-text-secondary hover:text-white'}`}
              >
                Yeni Film
              </button>
              <button
                type="button"
                onClick={() => setNewItemType('series')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${newItemType === 'series' ? 'bg-[#1a1b24] text-white' : 'text-text-secondary hover:text-white'}`}
              >
                Yeni Dizi
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-text-secondary">
              <div>
                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">BAŞLIK</label>
                <input
                  type="text"
                  placeholder="Medya başlığı..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">YIL</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">TÜR / KATEGORİ</label>
                  <input
                    type="text"
                    placeholder="örn: Fantastik, Drama"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">ÖZET / SİNOPSİS</label>
                <textarea
                  placeholder="Detaylı açıklama..."
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  rows={2}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">KAPAK RESMİ URL'Sİ (OPSİYONEL)</label>
                <input
                  type="text"
                  placeholder="Afiş görsel adresi..."
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {newItemType === 'movie' ? (
                /* Movie stream config */
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-300">VİDEO BAĞLANTI AYARLARI</span>
                    
                    {/* Local upload trigger file picker inside modal */}
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="file"
                        accept="video/*"
                        className="hidden"
                        id="modal-local-movie-picker"
                        onChange={(e) => handleLocalFileSelection(e, 'movie')}
                      />
                      <label 
                        htmlFor="modal-local-movie-picker"
                        className="p-1 px-1.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer text-[10px] flex items-center gap-1 text-white"
                      >
                        <Upload size={10} /> Dosya Seç
                      </label>
                    </div>
                  </div>

                  <div className="flex border border-white/5 bg-black/40 p-0.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setNewMovieSource('local')}
                      className={`flex-1 py-1 rounded text-[10px] transition-all ${newMovieSource === 'local' ? 'bg-[#121319] text-white font-bold' : 'text-text-secondary'}`}
                    >
                      Yerel / Harici Link
                    </button>
                    {accessToken && (
                      <button
                        type="button"
                        onClick={() => setNewMovieSource('drive')}
                        className={`flex-1 py-1 rounded text-[10px] transition-all ${newMovieSource === 'drive' ? 'bg-[#121319] text-white font-bold' : 'text-text-secondary'}`}
                      >
                        Google Drive
                      </button>
                    )}
                  </div>

                  {newMovieSource === 'local' ? (
                    <input
                      type="text"
                      placeholder="Yerel video blob: URL'si veya harici MP4 adresi..."
                      value={newMovieUrl}
                      onChange={(e) => setNewMovieUrl(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  ) : (
                    <div>
                      <select
                        value={newMovieDriveId}
                        onChange={(e) => {
                          setNewMovieDriveId(e.target.value);
                          const file = driveVideos.find(v => v.id === e.target.value);
                          if (file && !newTitle) {
                            setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
                          }
                        }}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                      >
                        <option value="">-- Google Drive'dan Video Seçin --</option>
                        {driveVideos.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                /* Series config: Season Count */
                <div>
                  <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">TOPLAM SEZON SAYISI</label>
                  <input
                    type="number"
                    min={1}
                    value={newSeasonsCount}
                    onChange={(e) => setNewSeasonsCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleCreateMediaItem}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EPISODE CREATION MODAL */}
      {isEpisodeModalOpen && selectedSeriesForEpisode && (
        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-50 overflow-y-auto custom-scrollbar">
          <div className="bg-[#121319] border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Diziye Yeni Bölüm Ekle</h4>
            
            <p className="text-[10px] text-indigo-400 font-bold font-mono">Dizi: {mediaItems.find(i=>i.id===selectedSeriesForEpisode)?.title}</p>

            <div className="space-y-3.5 text-xs text-text-secondary">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">SEZON NO</label>
                  <input
                    type="number"
                    min={1}
                    value={epSeason}
                    onChange={(e) => setEpSeason(parseInt(e.target.value) || 1)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">BÖLÜM NO</label>
                  <input
                    type="number"
                    min={1}
                    value={epNumber}
                    onChange={(e) => setEpNumber(parseInt(e.target.value) || 1)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">BÖLÜM BAŞLIĞI</label>
                <input
                  type="text"
                  placeholder="örn: Başlangıç..."
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Video source for Episode */}
              <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-300">BÖLÜM VİDEO KAYNAĞI</span>
                  
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="file"
                      accept="video/*"
                      className="hidden"
                      id="modal-local-ep-picker"
                      onChange={(e) => handleLocalFileSelection(e, 'episode')}
                    />
                    <label 
                      htmlFor="modal-local-ep-picker"
                      className="p-1 px-1.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer text-[10px] flex items-center gap-1 text-white"
                    >
                      <Upload size={10} /> Dosya Seç
                    </label>
                  </div>
                </div>

                <div className="flex border border-white/5 bg-black/40 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEpSource('local')}
                    className={`flex-1 py-1 rounded text-[10px] transition-all ${epSource === 'local' ? 'bg-[#121319] text-white font-bold' : 'text-text-secondary'}`}
                  >
                    Yerel / Harici Link
                  </button>
                  {accessToken && (
                    <button
                      type="button"
                      onClick={() => setEpSource('drive')}
                      className={`flex-1 py-1 rounded text-[10px] transition-all ${epSource === 'drive' ? 'bg-[#121319] text-white font-bold' : 'text-text-secondary'}`}
                    >
                      Google Drive
                    </button>
                  )}
                </div>

                {epSource === 'local' ? (
                  <input
                    type="text"
                    placeholder="Blob URL'si veya harici MP4 adresi..."
                    value={epUrl}
                    onChange={(e) => setEpUrl(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                ) : (
                  <div>
                    <select
                      value={epDriveId}
                      onChange={(e) => {
                        setEpDriveId(e.target.value);
                        const file = driveVideos.find(v => v.id === e.target.value);
                        if (file && !epTitle) {
                          setEpTitle(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                    >
                      <option value="">-- Google Drive'dan Video Seçin --</option>
                      {driveVideos.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEpisodeModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleAddEpisode}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
