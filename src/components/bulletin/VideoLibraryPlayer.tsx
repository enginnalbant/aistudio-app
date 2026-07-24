import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Shuffle, RotateCcw,
  Upload, HardDrive, Search, Film, Tv, Video, Loader2,
  Trash2, Plus, Clock, FileVideo, Settings, Sliders, PlayCircle, Maximize2, Minimize2, Airplay
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface VideoTrack {
  id: string;
  title: string;
  format: string; // e.g., 'MP4', 'MKV', 'WEBM'
  source: 'local' | 'drive';
  file?: File;
  driveId?: string;
  url: string; // Blob URL or API stream URL
  duration?: number;
  size?: number;
  addedAt: string;
}

export default function VideoLibraryPlayer() {
  const { accessToken, signInWithGoogle } = useAuth();
  
  // State
  const [videos, setVideos] = useState<VideoTrack[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'drive'>('library');
  
  // Custom Player Controls
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Google Drive State
  const [driveVideos, setDriveVideos] = useState<any[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load and restore Google Drive video pointers from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('apex_video_tracks');
      if (saved) {
        const parsed: VideoTrack[] = JSON.parse(saved);
        // Only keep drive sources as local Blob URLs are temporary
        const driveOnly = parsed.filter(v => v.source === 'drive');
        setVideos(driveOnly);
      }
    } catch (e) {
      console.error('Failed to load local video state:', e);
    }
  }, []);

  const saveVideosState = (updated: VideoTrack[]) => {
    try {
      const driveOnly = updated.filter(v => v.source === 'drive');
      localStorage.setItem('apex_video_tracks', JSON.stringify(driveOnly));
    } catch (e) {
      console.error('Failed to save video state:', e);
    }
  };

  // Google Drive: Fetch video files
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
      } else {
        console.error('Failed to fetch Drive videos:', res.statusText);
      }
    } catch (error) {
      console.error('Drive video fetch error:', error);
    } finally {
      setIsDriveLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && activeTab === 'drive') {
      fetchDriveVideos();
    }
  }, [accessToken, activeTab]);

  // Sync state with HTML5 video events
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

  // Handle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !currentVideoId) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Video play failed:', err);
          setIsPlaying(false);
        });
    }
  };

  // Handle Volume
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : newVal;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef.current) {
      videoRef.current.volume = nextMute ? 0 : volume;
    }
  };

  // Handle speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Seek video
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Import video from Google Drive list
  const importDriveVideo = (file: any) => {
    const existing = videos.find(v => v.driveId === file.id);
    if (existing) {
      playVideo(existing.id);
      return;
    }

    const format = file.name.split('.').pop()?.toUpperCase() || 'MP4';
    const newVideo: VideoTrack = {
      id: `drive-vid-${file.id}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      format,
      source: 'drive',
      driveId: file.id,
      url: `/api/google/drive/stream/${file.id}`,
      size: file.size ? parseInt(file.size) : undefined,
      addedAt: new Date().toLocaleDateString('tr-TR')
    };

    const updated = [...videos, newVideo];
    setVideos(updated);
    saveVideosState(updated);
    playVideo(newVideo.id);
  };

  // Upload local video
  const handleLocalVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newVids: VideoTrack[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'MP4';

      newVids.push({
        id: `local-vid-${Date.now()}-${i}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        format: ext,
        source: 'local',
        file,
        url: objectUrl,
        addedAt: new Date().toLocaleDateString('tr-TR'),
        size: file.size
      });
    }

    const updated = [...videos, ...newVids];
    setVideos(updated);
    saveVideosState(updated);
    
    if (newVids.length > 0) {
      playVideo(newVids[0].id);
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Select video to play
  const playVideo = (videoId: string) => {
    setCurrentVideoId(videoId);
    setIsPlaying(true);
    
    // Sync speed & volume on next tick after src update
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.volume = isMuted ? 0 : volume;
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 100);
  };

  // Delete video from library
  const handleDeleteVideo = (id: string) => {
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    saveVideosState(updated);
    if (currentVideoId === id) {
      setCurrentVideoId(null);
      setIsPlaying(false);
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

  // Esc listener for fullscreen status
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const activeVideo = videos.find(v => v.id === currentVideoId);
  const streamUrl = activeVideo?.source === 'drive' && accessToken
    ? `${activeVideo.url}?token=${accessToken}`
    : activeVideo?.url;

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDriveVideos = driveVideos.filter(f =>
    f.name.toLowerCase().includes(driveSearchQuery.toLowerCase())
  );

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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090c] text-text-primary rounded-3xl overflow-hidden border border-white/5 relative shadow-2xl font-sans">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full filter blur-[150px] pointer-events-none" />
      
      {/* Video Content Panel */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden z-10">
        
        {/* Left Side: Video Player & Custom Skin */}
        <div className={`xl:col-span-8 flex flex-col justify-center bg-black/80 border-r border-white/5 relative ${isTheaterMode ? 'xl:col-span-12' : ''}`}>
          
          {/* Main video container (ref for fullscreen option) */}
          <div 
            ref={containerRef}
            className="relative flex-1 flex items-center justify-center group overflow-hidden bg-[#020203]"
          >
            {currentVideoId && streamUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={streamUrl}
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={onLoadedMetadata}
                  onEnded={onVideoEnded}
                  onClick={togglePlay}
                  className="w-full h-full max-h-[75vh] object-contain"
                  playsInline
                />

                {/* Styled Center Play Overlay (Quick Action) */}
                {!isPlaying && (
                  <button 
                    onClick={togglePlay}
                    className="absolute p-5 bg-indigo-600/95 hover:bg-indigo-500 hover:scale-105 rounded-full text-white shadow-2xl transition-all z-20"
                  >
                    <Play className="fill-white" size={32} />
                  </button>
                )}

                {/* Sleek Custom Player Controls overlay (Visible on Hover or Fullscreen) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-30">
                  
                  {/* Seek Bar */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-text-secondary/95">
                    <span>{formatVideoTime(currentTime)}</span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="flex-1 accent-indigo-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer hover:h-2 transition-all"
                    />
                    <span>{formatVideoTime(duration)}</span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause */}
                      <button 
                        onClick={togglePlay}
                        className="p-1.5 hover:bg-white/10 text-white rounded-lg transition-all"
                      >
                        {isPlaying ? <Pause size={18} className="fill-white" /> : <Play size={18} className="fill-white" />}
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1.5 group/volume">
                        <button 
                          onClick={toggleMute}
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
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-16 accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer group-hover/volume:w-24 transition-all"
                        />
                      </div>

                      {/* Display Info */}
                      <div className="hidden sm:block text-xs font-medium text-text-secondary truncate max-w-xs pl-2 border-l border-white/10">
                        {activeVideo?.title}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Playback speed selector */}
                      <select
                        value={playbackSpeed}
                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                        className="bg-[#121318] border border-white/10 rounded-lg text-[10px] text-white px-2 py-1 font-bold outline-none cursor-pointer"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="1">1.0x (Normal)</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2.0x</option>
                      </select>

                      {/* Theater Mode toggle */}
                      <button
                        onClick={() => setIsTheaterMode(!isTheaterMode)}
                        className={`hidden xl:block p-1.5 rounded-lg transition-all ${isTheaterMode ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/10 text-text-secondary hover:text-white'}`}
                        title="Tiyatro Modu"
                      >
                        <Airplay size={16} />
                      </button>

                      {/* Fullscreen */}
                      <button 
                        onClick={toggleFullscreen}
                        className="p-1.5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-all"
                        title="Tam Ekran"
                      >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-text-secondary space-y-4">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-text-secondary/50">
                  <Video size={32} />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-white font-bold text-sm">Medya Yüklenmedi</h4>
                  <p className="text-[11px]">Sağ taraftaki panelden cihazınızdaki videoları yükleyebilir veya bağlı Google Drive'ınızdan video seçip oynatabilirsiniz.</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats/Metadata Row Under Video Player */}
          {activeVideo && !isTheaterMode && (
            <div className="p-4 bg-[#0c0d11] border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-tight">{activeVideo.title}</h2>
                  <span className="text-[9px] bg-white/5 border border-white/10 font-mono px-1 rounded text-text-secondary">{activeVideo.format}</span>
                </div>
                <p className="text-[10px] text-text-secondary/80">Kütüphaneye Eklendi: {activeVideo.addedAt} • Kaynak: <span className="capitalize font-bold text-indigo-400">{activeVideo.source}</span></p>
              </div>

              {activeVideo.size && (
                <div className="text-[10px] text-text-secondary font-mono">
                  Dosya Boyutu: {(activeVideo.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Media Library Explorer */}
        {!isTheaterMode && (
          <div className="xl:col-span-4 bg-[#0c0d11] p-4 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            
            {/* Header, Add action and tabs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Film className="text-indigo-400" size={18} />
                  <span className="font-bold text-xs uppercase tracking-wider text-white">Video Kütüphanesi</span>
                </div>
                
                {/* Refresh if Drive */}
                {activeTab === 'drive' && accessToken && (
                  <button 
                    onClick={fetchDriveVideos}
                    className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>

              {/* Source Import Actions */}
              <div className="space-y-2">
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLocalVideoUpload}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Videolar Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={13} />
                      <span>Yerel Video Dosyası Ekle</span>
                    </>
                  )}
                </button>

                {!accessToken ? (
                  <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl transition-all text-[11px]"
                  >
                    <HardDrive size={13} />
                    <span>Google Drive'dan Video Aktar</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px]">
                    <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                      <HardDrive size={12} /> Google Drive Bağlantısı Aktif
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Selector Tab Links */}
            <div className="flex border-b border-white/5 p-0.5 bg-black/20 rounded-xl">
              <button
                onClick={() => setActiveTab('library')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all ${activeTab === 'library' ? 'bg-[#121318] text-white' : 'text-text-secondary hover:text-white'}`}
              >
                Kütüphanem ({videos.length})
              </button>
              
              {accessToken && (
                <button
                  onClick={() => setActiveTab('drive')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all ${activeTab === 'drive' ? 'bg-[#121318] text-white' : 'text-text-secondary hover:text-white'}`}
                >
                  Google Drive ({driveVideos.length})
                </button>
              )}
            </div>

            {/* List and Search Panel */}
            <div className="flex-1 flex flex-col min-h-[300px]">
              
              {/* Filter Input */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 text-text-secondary/50" size={12} />
                <input
                  type="text"
                  placeholder={activeTab === 'drive' ? "Drive'da ara..." : "Şarkı veya video ara..."}
                  value={activeTab === 'drive' ? driveSearchQuery : searchQuery}
                  onChange={(e) => activeTab === 'drive' ? setDriveSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                  className="w-full bg-[#121318] border border-white/5 rounded-xl pl-8 pr-3 py-2 text-[11px] text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Render lists */}
              <div className="space-y-1.5 overflow-y-auto flex-1 custom-scrollbar max-h-[45vh]">
                
                {activeTab === 'drive' ? (
                  isDriveLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-text-secondary space-y-1">
                      <Loader2 className="animate-spin text-indigo-400" size={18} />
                      <p className="text-[10px]">Google Drive taranıyor...</p>
                    </div>
                  ) : filteredDriveVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-text-secondary border border-dashed border-white/5 rounded-2xl">
                      <FileVideo className="text-text-secondary/20 mb-1" size={24} />
                      <p className="text-[10px] font-bold">Video Dosyası Bulunamadı</p>
                    </div>
                  ) : (
                    filteredDriveVideos.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-black/20 hover:bg-black/60 border border-white/5 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-300">
                            <FileVideo size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-[11px] truncate">{file.name}</p>
                            <p className="text-[9px] text-text-secondary font-mono">Drive Video</p>
                          </div>
                        </div>

                        <button
                          onClick={() => importDriveVideo(file)}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 shrink-0"
                        >
                          <Play size={8} className="fill-white" /> Oynat
                        </button>
                      </div>
                    ))
                  )
                ) : (
                  filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-text-secondary/70 border border-dashed border-white/5 rounded-2xl">
                      <Video className="text-text-secondary/20 mb-2" size={28} />
                      <p className="text-[11px] font-bold">Kütüphaneniz Boş</p>
                      <p className="text-[9px] max-w-[200px] mt-0.5">Yerel videolarınızı ekleyin veya Google Drive bağlantısını kullanın.</p>
                    </div>
                  ) : (
                    filteredVideos.map(video => {
                      const isSelected = video.id === currentVideoId;
                      return (
                        <div
                          key={video.id}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                            isSelected 
                              ? 'bg-indigo-500/10 border-indigo-500/20' 
                              : 'bg-[#121318]/25 border-white/5 hover:bg-[#121318]/65'
                          }`}
                        >
                          <button
                            onClick={() => playVideo(video.id)}
                            className="flex-1 flex items-center gap-2.5 min-w-0 text-left"
                          >
                            <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-text-secondary'}`}>
                              <FileVideo size={13} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] truncate">{video.title}</p>
                              <p className="text-[9px] text-text-secondary/80 capitalize">{video.source} • {video.format}</p>
                            </div>
                          </button>

                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="p-1 hover:bg-rose-500/20 text-text-secondary hover:text-rose-400 rounded-md ml-2 transition-colors"
                            title="Listeden Kaldır"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })
                  )
                )}

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Floating theater exit option when in Theater mode */}
      {isTheaterMode && (
        <button 
          onClick={() => setIsTheaterMode(false)}
          className="absolute top-4 right-4 bg-black/80 hover:bg-black border border-white/10 text-white hover:text-indigo-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xl transition-all z-40"
        >
          <Airplay size={14} /> Normal Görünüme Dön
        </button>
      )}

    </div>
  );
}
