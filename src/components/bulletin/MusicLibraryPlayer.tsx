import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, RotateCcw,
  Upload, HardDrive, Search, ListMusic, Music, Disc, Loader2, Sparkles,
  Trash2, Plus, Clock, FileAudio, Settings, Sliders, ChevronRight, PlusCircle, PlayCircle, Eye
} from 'lucide-react';
import * as mmb from 'music-metadata-browser';
import { useAuth } from '../../context/AuthContext';

// Interfaces
interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  format: string; // e.g., 'FLAC', 'MP3', 'WAV'
  source: 'local' | 'drive';
  file?: File; // for local files
  driveId?: string; // for Google Drive files
  url: string; // Blob URL or API stream URL
  coverUrl?: string; // Parsed or default
  size?: number;
}

interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

export default function MusicLibraryPlayer() {
  const { user, accessToken, signInWithGoogle } = useAuth();
  
  // Track lists & state
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeQueue, setActiveQueue] = useState<string[]>([]); // Array of track IDs
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: 'favs', name: 'Favoriler', trackIds: [] }
  ]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  
  // Player Controls State
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // UI Panels
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'drive' | 'playlists' | 'queue'>('library');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  
  // Google Drive State
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Load state from LocalStorage for Drive tracks & Playlists
  useEffect(() => {
    try {
      const savedTracks = localStorage.getItem('apex_music_tracks');
      const savedPlaylists = localStorage.getItem('apex_music_playlists');
      
      if (savedTracks) {
        const parsed: Track[] = JSON.parse(savedTracks);
        // Only restore Drive tracks, as local blob URLs are expired
        const driveOnly = parsed.filter(t => t.source === 'drive');
        setTracks(driveOnly);
      }
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      }
    } catch (e) {
      console.error('Failed to load local music state:', e);
    }
  }, []);

  // Save changes to localStorage (excluding local files because their blob URLs expire)
  const saveStateToLocalStorage = (updatedTracks: Track[], updatedPlaylists: Playlist[]) => {
    try {
      const driveOnly = updatedTracks.filter(t => t.source === 'drive');
      localStorage.setItem('apex_music_tracks', JSON.stringify(driveOnly));
      localStorage.setItem('apex_music_playlists', JSON.stringify(updatedPlaylists));
    } catch (e) {
      console.error('Failed to save music state:', e);
    }
  };

  // Google Drive: Fetch audio files
  const fetchDriveMusic = async () => {
    if (!accessToken) return;
    setIsDriveLoading(true);
    try {
      const res = await fetch('/api/google/drive/music', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDriveFiles(data.files || []);
      } else {
        console.error('Failed to fetch Drive music files:', res.statusText);
      }
    } catch (error) {
      console.error('Drive music fetch error:', error);
    } finally {
      setIsDriveLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && activeTab === 'drive') {
      fetchDriveMusic();
    }
  }, [accessToken, activeTab]);

  // Handle HTML5 Audio element setup
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous"; // Bypass CORS for visualization
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleAudioEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleAudioEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleAudioEnded);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle current track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTrack = tracks.find(t => t.id === currentTrackId);
    if (currentTrack) {
      let playUrl = currentTrack.url;
      // If it is from Google Drive, we make sure to append the token if needed
      if (currentTrack.source === 'drive' && accessToken) {
        playUrl = `/api/google/drive/stream/${currentTrack.driveId}?token=${accessToken}`;
      }
      
      audio.src = playUrl;
      audio.playbackRate = playbackSpeed;
      
      if (isPlaying) {
        audio.play().catch(e => {
          console.warn('Playback interrupted:', e);
          setIsPlaying(false);
        });
        initVisualizer();
      }
    } else {
      audio.src = '';
      setIsPlaying(false);
    }
  }, [currentTrackId]);

  // Volume & Speed & Mute sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Web Audio API Visualizer Setup
  const initVisualizer = () => {
    const audio = audioRef.current;
    if (!audio || !canvasRef.current) return;

    // Lazily construct AudioContext on user interaction
    if (!audioCtxRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (e) {
        console.warn('Web Audio visualizer could not be initialized:', e);
        return;
      }
    }

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    if (!canvasCtx || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current) return;
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      canvasCtx.clearRect(0, 0, width, height);

      // Radial or Bar visualizer
      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Create elegant gradient colors (Indigo to Rose to Red)
        const percent = barHeight / 255;
        const r = Math.floor(139 + percent * 100);
        const g = Math.floor(92 - percent * 30);
        const b = Math.floor(246 - percent * 100);

        canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        // Rounded bars
        const h = (barHeight / 255) * height * 0.95;
        canvasCtx.fillRect(x, height - h, barWidth - 1.5, h);

        x += barWidth;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    draw();
  };

  // Toggle play/pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrackId) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Resume audio context if suspended
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audio.play().then(() => {
        setIsPlaying(true);
        initVisualizer();
      }).catch(err => {
        console.error('Audio play failed:', err);
      });
    }
  };

  // Seek audio
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Add tracks from Google Drive
  const importDriveTrack = (driveFile: any) => {
    const existing = tracks.find(t => t.driveId === driveFile.id);
    if (existing) {
      // If already added, just select it
      playTrack(existing.id);
      return;
    }

    const format = driveFile.name.split('.').pop()?.toUpperCase() || 'AUDIO';
    const newTrack: Track = {
      id: `drive-${driveFile.id}`,
      title: driveFile.name.replace(/\.[^/.]+$/, ""), // strip extension
      artist: 'Google Drive',
      album: 'Drive Bulut Kütüphanesi',
      duration: 0, // Will resolve when loaded
      format,
      source: 'drive',
      driveId: driveFile.id,
      url: `/api/google/drive/stream/${driveFile.id}`,
      size: driveFile.size ? parseInt(driveFile.size) : undefined
    };

    const updated = [...tracks, newTrack];
    setTracks(updated);
    saveStateToLocalStorage(updated, playlists);

    // Auto append to queue and play
    if (activeQueue.length === 0) {
      setActiveQueue([newTrack.id]);
    } else {
      setActiveQueue(prev => [...prev, newTrack.id]);
    }
    setCurrentTrackId(newTrack.id);
    setIsPlaying(true);
  };

  // Local file picker processing (FLAC metadata extraction using music-metadata-browser)
  const handleLocalFilesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newTracks: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'MP3';

      let trackInfo = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Yerel Sanatçı',
        album: 'Yerel Albüm',
        duration: 0,
        coverUrl: undefined as string | undefined
      };

      try {
        // Attempt parsing metadata using music-metadata-browser (great for FLAC tags too!)
        const metadata = await mmb.parseBlob(file);
        if (metadata.common.title) trackInfo.title = metadata.common.title;
        if (metadata.common.artist) trackInfo.artist = metadata.common.artist;
        if (metadata.common.album) trackInfo.album = metadata.common.album;
        if (metadata.format.duration) trackInfo.duration = metadata.format.duration;
        
        // Extract Cover Image if available
        const picture = metadata.common.picture?.[0];
        if (picture) {
          const blob = new Blob([picture.data], { type: picture.format });
          trackInfo.coverUrl = URL.createObjectURL(blob);
        }
      } catch (err) {
        console.warn('Metadata parsing failed, falling back to basic details:', err);
        // Fallback: load duration using simple Audio element
        try {
          const tempAudio = new Audio(objectUrl);
          await new Promise((resolve) => {
            tempAudio.onloadedmetadata = () => {
              trackInfo.duration = tempAudio.duration;
              resolve(true);
            };
            tempAudio.onerror = () => resolve(false);
          });
        } catch (_) {}
      }

      newTracks.push({
        id: `local-${Date.now()}-${i}`,
        title: trackInfo.title,
        artist: trackInfo.artist,
        album: trackInfo.album,
        duration: trackInfo.duration,
        format: ext,
        source: 'local',
        file,
        url: objectUrl,
        coverUrl: trackInfo.coverUrl,
        size: file.size
      });
    }

    const updated = [...tracks, ...newTracks];
    setTracks(updated);
    saveStateToLocalStorage(updated, playlists);

    // Append all newly loaded tracks to the queue
    const newIds = newTracks.map(t => t.id);
    setActiveQueue(prev => [...prev, ...newIds]);

    if (!currentTrackId && newIds.length > 0) {
      setCurrentTrackId(newIds[0]);
      setIsPlaying(true);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Play a specific track directly
  const playTrack = (trackId: string) => {
    // Add to queue if not present
    if (!activeQueue.includes(trackId)) {
      setActiveQueue(prev => [...prev, trackId]);
    }
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  };

  // Handle Playback Actions
  const handleNextTrack = () => {
    if (activeQueue.length === 0) return;

    if (repeatMode === 'one' && currentTrackId) {
      // Replay same track
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }

    const currentIndex = activeQueue.indexOf(currentTrackId || '');
    let nextId: string | null = null;

    if (isShuffle) {
      // Random pick
      const randomIndex = Math.floor(Math.random() * activeQueue.length);
      nextId = activeQueue[randomIndex];
    } else {
      if (currentIndex !== -1 && currentIndex < activeQueue.length - 1) {
        nextId = activeQueue[currentIndex + 1];
      } else if (repeatMode === 'all') {
        nextId = activeQueue[0];
      }
    }

    if (nextId) {
      setCurrentTrackId(nextId);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevTrack = () => {
    if (activeQueue.length === 0 || !currentTrackId) return;

    const currentIndex = activeQueue.indexOf(currentTrackId);
    let prevId: string | null = null;

    if (currentIndex > 0) {
      prevId = activeQueue[currentIndex - 1];
    } else if (repeatMode === 'all') {
      prevId = activeQueue[activeQueue.length - 1];
    }

    if (prevId) {
      setCurrentTrackId(prevId);
      setIsPlaying(true);
    }
  };

  // Format track duration cleanly
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle Playlist creation
  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: newPlaylistName.trim(),
      trackIds: []
    };
    const updated = [...playlists, newPl];
    setPlaylists(updated);
    saveStateToLocalStorage(tracks, updated);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
  };

  // Add track to a playlist
  const toggleTrackInPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map(pl => {
      if (pl.id === playlistId) {
        const exists = pl.trackIds.includes(trackId);
        return {
          ...pl,
          trackIds: exists 
            ? pl.trackIds.filter(id => id !== trackId)
            : [...pl.trackIds, trackId]
        };
      }
      return pl;
    });
    setPlaylists(updated);
    saveStateToLocalStorage(tracks, updated);
  };

  // Delete Track from Library
  const handleDeleteTrack = (trackId: string) => {
    const updatedTracks = tracks.filter(t => t.id !== trackId);
    setTracks(updatedTracks);
    setActiveQueue(prev => prev.filter(id => id !== trackId));
    if (currentTrackId === trackId) {
      setCurrentTrackId(null);
      setIsPlaying(false);
    }
    // Clean up from playlists
    const updatedPls = playlists.map(pl => ({
      ...pl,
      trackIds: pl.trackIds.filter(id => id !== trackId)
    }));
    setPlaylists(updatedPls);
    saveStateToLocalStorage(updatedTracks, updatedPls);
  };

  // Filtered tracks based on search
  const filteredTracks = tracks.filter(t => {
    const query = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(query) ||
           t.artist.toLowerCase().includes(query) ||
           t.album.toLowerCase().includes(query) ||
           t.format.toLowerCase().includes(query);
  });

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const playlistFilteredTracks = activePlaylist 
    ? filteredTracks.filter(t => activePlaylist.trackIds.includes(t.id))
    : filteredTracks;

  // Render Drive files with filter
  const filteredDriveFiles = driveFiles.filter(f => 
    f.name.toLowerCase().includes(driveSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0e12] text-text-primary rounded-3xl overflow-hidden border border-white/5 relative shadow-2xl font-sans">
      
      {/* Visual background element */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Top Main Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10">
        
        {/* Left Side: Navigation / Library and Drive source selectors */}
        <div className="lg:col-span-3 border-r border-white/5 bg-[#121318]/90 p-4 flex flex-col space-y-5 overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Disc className="text-rose-500 animate-spin-slow shrink-0" size={24} />
              <h2 className="text-lg font-bold tracking-tight text-white">APEX Müzik</h2>
            </div>

            {/* Quick Actions / Source Upload */}
            <div className="space-y-2">
              <input
                type="file"
                multiple
                accept="audio/*,.flac"
                className="hidden"
                ref={fileInputRef}
                onChange={handleLocalFilesUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Dosyalar Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Yerel Dosya Ekle (FLAC/MP3)</span>
                  </>
                )}
              </button>

              {!accessToken ? (
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white hover:text-indigo-300 border border-white/10 rounded-xl transition-all text-xs"
                >
                  <HardDrive size={14} />
                  <span>Google Drive Bağla</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-200">
                  <HardDrive size={14} className="text-indigo-400" />
                  <span className="truncate flex-1">Drive Bağlı</span>
                  <button 
                    onClick={fetchDriveMusic}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Dosyaları Yenile"
                  >
                    <RotateCcw size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Selection */}
          <div className="space-y-1">
            <h3 className="text-[10px] uppercase tracking-wider text-text-secondary/60 font-semibold px-2 mb-2">KÜTÜPHANEM</h3>
            
            <button
              onClick={() => { setActiveTab('library'); setSelectedPlaylistId(null); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'library' && !selectedPlaylistId
                  ? 'bg-indigo-500/10 text-indigo-300'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Music size={14} />
                <span>Tüm Parçalar</span>
              </div>
              <span className="text-[10px] bg-white/5 text-text-secondary px-1.5 py-0.5 rounded-full font-mono">{tracks.length}</span>
            </button>

            {accessToken && (
              <button
                onClick={() => setActiveTab('drive')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'drive'
                    ? 'bg-indigo-500/10 text-indigo-300'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HardDrive size={14} />
                  <span>Google Drive</span>
                </div>
                <span className="text-[10px] bg-white/5 text-text-secondary px-1.5 py-0.5 rounded-full font-mono">{driveFiles.length}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'queue'
                  ? 'bg-indigo-500/10 text-indigo-300'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <ListMusic size={14} />
                <span>Çalma Sırası</span>
              </div>
              {activeQueue.length > 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-mono font-bold">{activeQueue.length}</span>
              )}
            </button>
          </div>

          {/* Playlists section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] uppercase tracking-wider text-text-secondary/60 font-semibold">ÇALMA LİSTELERİ</h3>
              <button 
                onClick={() => setShowPlaylistModal(true)}
                className="p-1 text-text-secondary/80 hover:text-white hover:bg-white/5 rounded"
              >
                <Plus size={12} />
              </button>
            </div>

            {playlists.map(pl => (
              <button
                key={pl.id}
                onClick={() => { setSelectedPlaylistId(pl.id); setActiveTab('playlists'); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedPlaylistId === pl.id
                    ? 'bg-indigo-500/10 text-indigo-300'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <ListMusic size={14} className="shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </div>
                <span className="text-[10px] bg-white/5 text-text-secondary px-1.5 py-0.5 rounded-full font-mono">{pl.trackIds.length}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Center/Main Area: Interactive Content Area with Grid */}
        <div className="lg:col-span-9 flex flex-col h-full bg-[#0a0b0e] overflow-hidden">
          
          {/* Header Panel */}
          <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0c0d10]/50">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-2.5 text-text-secondary/50" size={14} />
              <input
                type="text"
                placeholder={activeTab === 'drive' ? "Google Drive'da ara..." : "Şarkı, albüm, sanatçı ara..."}
                value={activeTab === 'drive' ? driveSearchQuery : searchQuery}
                onChange={(e) => activeTab === 'drive' ? setDriveSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                className="w-full bg-[#121318] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-text-secondary bg-[#121318] border border-white/5 px-2.5 py-1 rounded-lg">
                Seçili Liste: {selectedPlaylistId ? playlists.find(p=>p.id===selectedPlaylistId)?.name : 'Tüm Kütüphane'}
              </span>
            </div>
          </div>

          {/* Split Panel: Tracks List vs Visualizer */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            
            {/* Left side of split: Track List */}
            <div className="md:col-span-8 p-4 overflow-y-auto custom-scrollbar flex flex-col h-full">
              
              {/* Active Tab Header title */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-sm font-bold text-white tracking-wide uppercase">
                  {activeTab === 'library' && 'MÜZİK KÜTÜPHANEM'}
                  {activeTab === 'drive' && 'GOOGLE DRIVE DOSYALARI'}
                  {activeTab === 'playlists' && (playlists.find(p=>p.id===selectedPlaylistId)?.name || 'ÇALMA LİSTESİ')}
                  {activeTab === 'queue' && 'ÇALMA SIRASI'}
                </h1>

                {activeTab === 'queue' && activeQueue.length > 0 && (
                  <button 
                    onClick={() => { setActiveQueue([]); if (audioRef.current) audioRef.current.src = ''; setCurrentTrackId(null); }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                  >
                    <Trash2 size={10} /> Sırayı Temizle
                  </button>
                )}
              </div>

              {/* Tracks Rendering */}
              <div className="space-y-1.5 flex-1">
                
                {activeTab === 'drive' ? (
                  // Google Drive Files view
                  isDriveLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-text-secondary space-y-2">
                      <Loader2 className="animate-spin text-indigo-400" size={24} />
                      <p className="text-xs">Google Drive taranıyor...</p>
                    </div>
                  ) : filteredDriveFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/5 rounded-2xl p-6">
                      <HardDrive className="text-text-secondary/30 mb-2" size={32} />
                      <p className="text-xs text-text-primary font-bold">Ses Dosyası Bulunamadı</p>
                      <p className="text-[11px] text-text-secondary max-w-xs mt-1">Google Drive'ınızda MP3, FLAC, M4A, WAV formatında dosya bulunmuyor veya erişim izni yok.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1">
                      {filteredDriveFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2.5 bg-[#121318]/40 hover:bg-[#121318]/90 border border-white/5 rounded-xl text-xs transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-300 shrink-0">
                              <FileAudio size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{file.name}</p>
                              <p className="text-[10px] text-indigo-300 font-mono mt-0.5">Google Drive • {file.mimeType.split('/').pop()?.toUpperCase()}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => importDriveTrack(file)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[11px] transition-all flex items-center gap-1"
                          >
                            <PlusCircle size={12} /> Çal / Kütüphaneye Ekle
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  // Local Library & Playlists & Queue view
                  (activeTab === 'playlists' ? playlistFilteredTracks : activeTab === 'queue' ? tracks.filter(t => activeQueue.includes(t.id)) : filteredTracks).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/5 rounded-2xl p-6">
                      <Music className="text-text-secondary/30 mb-2" size={32} />
                      <p className="text-xs text-text-primary font-bold">Kütüphane Boş</p>
                      <p className="text-[11px] text-text-secondary max-w-xs mt-1">Yukarıdan yerel flac/mp3 yükleyebilir veya Google Drive'dan parça ekleyebilirsiniz.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1">
                      {(activeTab === 'playlists' ? playlistFilteredTracks : activeTab === 'queue' ? tracks.filter(t => activeQueue.includes(t.id)) : filteredTracks).map((track, idx) => {
                        const isCurrent = currentTrackId === track.id;
                        return (
                          <div
                            key={track.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all group ${
                              isCurrent 
                                ? 'bg-indigo-500/10 border border-indigo-500/20' 
                                : 'bg-[#121318]/20 hover:bg-[#121318]/70 border border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Album cover / Badge */}
                              <div className="relative shrink-0 w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden">
                                {track.coverUrl ? (
                                  <img src={track.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                  <Music className={isCurrent ? 'text-indigo-400' : 'text-text-secondary/60'} size={16} />
                                )}
                                
                                <button
                                  onClick={() => playTrack(track.id)}
                                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Play size={14} className="text-white fill-white" />
                                </button>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white truncate">{track.title}</span>
                                  {track.format && (
                                    <span className="text-[9px] px-1 bg-white/5 text-text-secondary font-mono rounded">
                                      {track.format}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary/80 text-[10px] mt-0.5">
                                  <span className="truncate">{track.artist}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[120px]">{track.album}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-mono text-text-secondary/70">{formatTime(track.duration)}</span>
                              
                              {/* Playlist management dropdown button */}
                              <div className="relative group/playlist">
                                <button className="p-1 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white" title="Listeye Ekle">
                                  <PlusCircle size={14} />
                                </button>
                                <div className="hidden group-hover/playlist:block absolute right-0 bottom-full bg-[#121318] border border-white/10 rounded-lg shadow-xl py-1 z-30 w-32">
                                  <p className="text-[9px] text-text-secondary/50 px-2 py-0.5 font-bold uppercase">LİSTEYE EKLE</p>
                                  {playlists.map(pl => (
                                    <button
                                      key={pl.id}
                                      onClick={() => toggleTrackInPlaylist(pl.id, track.id)}
                                      className={`w-full text-left px-2 py-1 text-[10px] hover:bg-white/5 flex items-center justify-between ${
                                        pl.trackIds.includes(track.id) ? 'text-indigo-300 font-bold' : 'text-text-secondary'
                                      }`}
                                    >
                                      <span>{pl.name}</span>
                                      {pl.trackIds.includes(track.id) && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteTrack(track.id)}
                                className="p-1 hover:bg-rose-500/20 rounded-lg text-text-secondary hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Kitaplıktan Sil"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

              </div>
            </div>

            {/* Right side of split: Modern Visualizer & Album cover details */}
            <div className="md:col-span-4 p-4 border-t md:border-t-0 md:border-l border-white/5 bg-[#0c0d10]/40 flex flex-col justify-between space-y-4">
              
              {/* Active Visualizer Section */}
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-40 h-40 rounded-full border-4 border-white/5 bg-black flex items-center justify-center overflow-hidden shadow-2xl">
                  {/* CD Cover spinning */}
                  <div className={`w-full h-full absolute transition-transform ${isPlaying ? 'animate-spin-slow' : ''}`}>
                    {tracks.find(t=>t.id===currentTrackId)?.coverUrl ? (
                      <img src={tracks.find(t=>t.id===currentTrackId)?.coverUrl} alt="CD" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-900 to-rose-950">
                        <Disc size={64} className="text-white/20" />
                      </div>
                    )}
                  </div>
                  {/* Center pin of CD */}
                  <div className="w-8 h-8 rounded-full bg-[#0a0b0e] border-2 border-white/15 z-20 shadow-inner flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1 px-4 w-full">
                  <h3 className="font-bold text-white tracking-tight truncate text-sm">
                    {tracks.find(t=>t.id===currentTrackId)?.title || 'Şarkı Seçilmedi'}
                  </h3>
                  <p className="text-xs text-text-secondary truncate">
                    {tracks.find(t=>t.id===currentTrackId)?.artist || 'Lütfen çalma listesinden veya klasörünüzden bir parça seçin'}
                  </p>
                </div>

                {/* Canvas Visualizer rendering */}
                <div className="w-full h-16 bg-black/30 rounded-xl overflow-hidden border border-white/5 p-1 relative">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full" 
                    width={180} 
                    height={60} 
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-text-secondary/40 font-mono">
                      VISUALIZER OFF
                    </div>
                  )}
                </div>
              </div>

              {/* Specs & Playback Rate presets */}
              <div className="bg-black/30 p-3 rounded-2xl border border-white/5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-text-secondary text-[11px]">
                  <span className="font-semibold flex items-center gap-1"><Sliders size={12} /> SES MOTORU</span>
                  <span className="font-mono text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase">
                    {tracks.find(t=>t.id===currentTrackId)?.format || 'FLAC+'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[9px] text-text-secondary/60">HIZ</p>
                    <div className="flex items-center justify-between mt-1">
                      <select 
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="bg-transparent text-white font-bold outline-none cursor-pointer w-full"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1.0x (Normal)</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2.0x</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[9px] text-text-secondary/60">KAYNAK</p>
                    <p className="font-bold text-indigo-300 mt-1 capitalize truncate">
                      {tracks.find(t=>t.id===currentTrackId)?.source || 'Yok'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Playback Progress Bottom Control Bar */}
      <div className="bg-[#121318] border-t border-white/5 px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
        
        {/* Track Title snippet bottom left */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-10 h-10 bg-black/60 border border-white/5 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {tracks.find(t=>t.id===currentTrackId)?.coverUrl ? (
              <img src={tracks.find(t=>t.id===currentTrackId)?.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <Music className={isPlaying ? 'text-indigo-400 animate-pulse' : 'text-text-secondary/50'} size={16} />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-xs truncate max-w-[150px]">
              {tracks.find(t=>t.id===currentTrackId)?.title || 'Parça Seçilmedi'}
            </h4>
            <p className="text-[10px] text-text-secondary truncate max-w-[150px]">
              {tracks.find(t=>t.id===currentTrackId)?.artist || '---'}
            </p>
          </div>
        </div>

        {/* Central playback play buttons & timeline slider */}
        <div className="flex-1 max-w-xl flex flex-col items-center space-y-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setIsShuffle(!isShuffle); }}
              className={`p-1.5 rounded hover:bg-white/5 transition-all ${isShuffle ? 'text-indigo-400 font-bold' : 'text-text-secondary hover:text-white'}`}
              title="Karıştır"
            >
              <Shuffle size={14} />
            </button>

            <button
              onClick={handlePrevTrack}
              disabled={activeQueue.length === 0}
              className="p-1.5 text-text-secondary hover:text-white disabled:opacity-40 transition-all"
            >
              <SkipBack size={16} className="fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentTrackId}
              className="p-3 bg-white text-[#0a0b0e] rounded-full hover:scale-105 disabled:opacity-50 transition-transform flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause size={18} className="fill-current" />
              ) : (
                <Play size={18} className="fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNextTrack}
              disabled={activeQueue.length === 0}
              className="p-1.5 text-text-secondary hover:text-white disabled:opacity-40 transition-all"
            >
              <SkipForward size={16} className="fill-current" />
            </button>

            <button
              onClick={() => {
                if (repeatMode === 'off') setRepeatMode('all');
                else if (repeatMode === 'all') setRepeatMode('one');
                else setRepeatMode('off');
              }}
              className={`p-1.5 rounded hover:bg-white/5 transition-all text-xs font-bold ${
                repeatMode !== 'off' ? 'text-indigo-400' : 'text-text-secondary hover:text-white'
              }`}
              title={`Tekrar: ${repeatMode}`}
            >
              <RotateCcw size={14} className={repeatMode === 'one' ? 'stroke-2' : ''} />
            </button>
          </div>

          {/* Timeline Seek bar */}
          <div className="w-full flex items-center gap-2 text-[10px] font-mono">
            <span className="text-text-secondary/80 text-right w-8">{formatTime(currentTime)}</span>
            
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
            />

            <span className="text-text-secondary/80 text-left w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Details on Bottom Right */}
        <div className="flex items-center gap-3 min-w-[200px] justify-end">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-text-secondary hover:text-white transition-all"
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
              setIsMuted(false);
            }}
            className="w-24 accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
          />
        </div>

      </div>

      {/* Playlist Creation modal */}
      {showPlaylistModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121318] border border-white/10 rounded-2xl p-5 max-w-xs w-full space-y-4">
            <h4 className="text-sm font-bold text-white">Yeni Çalma Listesi Oluştur</h4>
            <input
              type="text"
              placeholder="Çalma listesi adı..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowPlaylistModal(false); setNewPlaylistName(''); }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs"
              >
                İptal
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
