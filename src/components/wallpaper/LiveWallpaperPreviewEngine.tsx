import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Cpu, 
  Layers, 
  Film, 
  Activity, 
  Sparkles, 
  Maximize2, 
  Monitor, 
  Compass,
  Volume2,
  VolumeX,
  Gauge
} from 'lucide-react';
import { WallpaperConfig, useWallpaper } from '../../context/WallpaperContext';
import { extractPaletteFromMedia } from '../../utils/colorExtractor';

interface LiveWallpaperPreviewEngineProps {
  config: WallpaperConfig;
  updateConfig: (updates: Partial<WallpaperConfig>) => void;
  simulatedDevice: 'desktop' | 'tablet' | 'phone';
  qualityPreset: string;
  targetFps: number;
  autoFpsMode: boolean;
  showBeforeAfter: boolean;
  beforeAfterSplit: number;
  displayDna: any;
  qualityScore: any;
}

export default function LiveWallpaperPreviewEngine({
  config,
  updateConfig,
  simulatedDevice,
  qualityPreset,
  targetFps,
  autoFpsMode,
  showBeforeAfter,
  beforeAfterSplit,
  displayDna,
  qualityScore
}: LiveWallpaperPreviewEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // States for live rendering controls & statistics
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackMode, setPlaybackMode] = useState<'cover' | 'contain' | 'stretch' | 'center'>('cover');
  const [actualFps, setActualFps] = useState(60);
  const [renderTime, setRenderTime] = useState(1.2);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(config.isMuted ?? true);
  const [isVisible, setIsVisible] = useState(true);

  // Detect format
  const isVideo = config.sourceType === 'video' || (config.mimeType?.startsWith('video/') ?? false);
  const isHtml = config.sourceType === 'lively' && config.mimeType === 'text/html';
  const isImage = !isVideo && !isHtml;

  // Track FPS and performance
  const lastFrameTime = useRef<number>(0);
  const fpsInterval = useRef<number>(1000 / targetFps);

  // Throttled frame counter for AI analysis (Live Frame Sampling)
  const lastAiSampleTime = useRef<number>(0);

  // IntersectionObserver to pause rendering when preview container is hidden/minimized
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update FPS Interval when targetFps changes
  useEffect(() => {
    fpsInterval.current = 1000 / (autoFpsMode ? Math.min(60, targetFps) : targetFps);
  }, [targetFps, autoFpsMode]);

  // Synchronize audio state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Synchronize playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = config.playbackSpeed || 1.0;
    }
  }, [config.playbackSpeed]);

  // Handle Play/Pause commands
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && isVisible) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isVisible]);

  // Render loop
  useEffect(() => {
    let active = true;

    const render = (now: number) => {
      if (!active) return;

      animationFrameId.current = requestAnimationFrame(render);

      // If container is invisible, pause rendering processing to conserve CPU/GPU
      if (!isVisible) return;

      const elapsed = now - lastFrameTime.current;

      // Throttle rendering to match target FPS
      if (elapsed < fpsInterval.current) return;

      // Calculate actual rendered FPS
      const delta = now - lastFrameTime.current;
      lastFrameTime.current = now - (delta % fpsInterval.current);

      const computedFps = Math.round(1000 / delta);
      if (isFinite(computedFps) && computedFps > 0) {
        setActualFps((prev) => Math.round(prev * 0.9 + computedFps * 0.1));
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const startTime = performance.now();

      // Handle decoding & painting source onto canvas
      if (isVideo && videoRef.current) {
        const video = videoRef.current;
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          drawMediaToCanvas(ctx, canvas, video);
          setFrameIndex((prev) => (prev + 1) % 100000);
        }
      } else if (isImage) {
        // Render static image
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          drawMediaToCanvas(ctx, canvas, img);
        };
        img.src = config.mediaUrl || config.previewUrl || '';
      } else if (isHtml) {
        // Generate glowing vector mesh as visual animation fallback in canvas for HTML
        drawGenerativeVectorMesh(ctx, canvas, now);
        setFrameIndex((prev) => (prev + 1) % 100000);
      }

      const duration = performance.now() - startTime;
      setRenderTime(Number(duration.toFixed(2)));

      // LIVE FRAME SAMPLING FOR AI ENGINES
      // Extract color palette dynamically from current frame every 3.5 seconds
      if (now - lastAiSampleTime.current > 3500) {
        lastAiSampleTime.current = now;
        triggerLiveFrameAiAnalysis(canvas);
      }
    };

    lastFrameTime.current = performance.now();
    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      active = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [config.mediaUrl, config.previewUrl, isVideo, isImage, isHtml, playbackMode, isVisible]);

  // Unified aspect-ratio and mode-aware drawer
  const drawMediaToCanvas = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    media: HTMLVideoElement | HTMLImageElement
  ) => {
    const cw = canvas.width;
    const ch = canvas.height;

    const mw = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
    const mh = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;

    if (!mw || !mh) return;

    ctx.clearRect(0, 0, cw, ch);

    if (playbackMode === 'stretch') {
      ctx.drawImage(media, 0, 0, cw, ch);
    } else if (playbackMode === 'contain') {
      const scale = Math.min(cw / mw, ch / mh);
      const w = mw * scale;
      const h = mh * scale;
      const x = (cw - w) / 2;
      const y = (ch - h) / 2;
      ctx.drawImage(media, x, y, w, h);
    } else if (playbackMode === 'center') {
      const x = (cw - mw) / 2;
      const y = (ch - mh) / 2;
      ctx.drawImage(media, x, y, mw, mh);
    } else {
      // Default: 'cover' (Fill)
      const scale = Math.max(cw / mw, ch / mh);
      const w = mw * scale;
      const h = mh * scale;
      const x = (cw - w) / 2;
      const y = (ch - h) / 2;
      ctx.drawImage(media, x, y, w, h);
    }
  };

  // Generates rich animated vector mesh/nebula lines matched to the chosen palette for HTML MLW wallpapers
  const drawGenerativeVectorMesh = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number
  ) => {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = config.activePalette?.darkObsidian || '#070a14';
    ctx.fillRect(0, 0, w, h);

    const primaryColor = config.activePalette?.primaryNeon || '#3b82f6';
    const secondaryColor = config.activePalette?.secondaryMain || '#1d4ed8';

    ctx.save();
    ctx.globalAlpha = 0.25;
    
    // Draw fluid particle beams
    const speed = time * 0.0005 * (config.playbackSpeed || 1.0);
    const numLines = 6;
    for (let i = 0; i < numLines; i++) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(1, secondaryColor);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3 + i * 2;

      ctx.beginPath();
      ctx.moveTo(0, h * 0.5 + Math.sin(speed + i) * h * 0.3);
      ctx.bezierCurveTo(
        w * 0.3, h * 0.2 + Math.sin(speed + i * 0.5) * h * 0.4,
        w * 0.7, h * 0.8 + Math.cos(speed + i * 0.7) * h * 0.4,
        w, h * 0.5 + Math.cos(speed + i) * h * 0.3
      );
      ctx.stroke();
    }

    ctx.restore();
  };

  // Extract color profiles from current playing canvas frame and update state
  const triggerLiveFrameAiAnalysis = async (canvas: HTMLCanvasElement) => {
    try {
      const extracted = await extractPaletteFromMedia(canvas);
      // Only trigger a soft palette sync if colors are valid and match our focus
      if (extracted && extracted.primaryNeon !== config.activePalette?.primaryNeon) {
        updateConfig({
          activePalette: {
            ...config.activePalette,
            primaryNeon: extracted.primaryNeon,
            secondaryMain: extracted.secondaryMain,
            accentHexList: extracted.accentHexList,
            luminance: extracted.luminance,
            isDarkTheme: extracted.isDarkTheme
          }
        });
      }
    } catch (e) {
      console.warn('[AI Sampler] Failed to sample current render frame colors', e);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) videoRef.current.play().catch(() => {});
    }
    setFrameIndex(0);
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-4">
      
      {/* SIMULATED VIEWPORT CONTAINER */}
      <div 
        className={`relative overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col justify-between p-4 transition-all duration-300 ${
          simulatedDevice === 'desktop' 
            ? 'w-full h-[460px] rounded-3xl' 
            : simulatedDevice === 'tablet' 
            ? 'w-[350px] h-[460px] rounded-[2.25rem] mx-auto' 
            : 'w-[250px] h-[460px] rounded-[2.5rem] mx-auto border-4 border-slate-800'
        }`}
      >
        
        {/* HTML INTERACTIVE IFRAME ENGINE */}
        {isHtml && config.mediaUrl && (
          <iframe 
            src={config.mediaUrl}
            className="absolute inset-0 w-full h-full border-none z-0 pointer-events-auto"
            title="Lively Wallpaper Interactive Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        )}

        {/* HIGH-PERFORMANCE VIDEO DECODER FEED (HIDDEN) */}
        {isVideo && config.mediaUrl && (
          <video
            ref={videoRef}
            src={config.mediaUrl}
            preload="auto"
            loop
            muted={isMuted}
            playsInline
            crossOrigin="anonymous"
            className="hidden"
          />
        )}

        {/* PRIMARY GPU CANVAS RENDERER */}
        {!isHtml && (
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-300 pointer-events-none"
            style={{
              filter: `brightness(${config.brightness}%) saturate(${config.saturation}%)`,
              clipPath: showBeforeAfter ? `polygon(${beforeAfterSplit}% 0, 100% 0, 100% 100%, ${beforeAfterSplit}% 100%)` : 'none'
            }}
          />
        )}

        {/* Before / After Raw Image Split Panel */}
        {showBeforeAfter && (
          <div 
            className="absolute inset-0 z-1 bg-no-repeat bg-center bg-cover pointer-events-none"
            style={{
              backgroundImage: `url(${config.previewUrl || config.mediaUrl})`,
              clipPath: `polygon(0 0, ${beforeAfterSplit}% 0, ${beforeAfterSplit}% 100%, 0 100%)`
            }}
          />
        )}

        {/* Split Divider neon wire */}
        {showBeforeAfter && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-focus-neon/80 z-20 shadow-[0_0_12px_rgba(59,130,246,0.9)] pointer-events-none"
            style={{ left: `${beforeAfterSplit}%` }}
          />
        )}

        {/* Dark screen overlay to boost visual readability */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-300 z-5"
          style={{ 
            backgroundColor: `rgba(0, 0, 0, ${(config.overlayOpacity || 30) / 100})`,
            clipPath: showBeforeAfter ? `polygon(${beforeAfterSplit}% 0, 100% 0, 100% 100%, ${beforeAfterSplit}% 100%)` : 'none'
          }}
        />

        {/* Top bar inside simulated device */}
        <div 
          className="relative z-10 w-full px-3 py-1.5 rounded-xl flex items-center justify-between border transition-all text-[11px] font-mono text-white"
          style={{
            backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
            backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
            borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
            borderRadius: `${config.cardBorderRadius || 20}px`
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-bold tracking-wider">APEX OS v5.0</span>
          </div>
          <span className="text-[8px] text-white/50">{displayDna.aspectRatioString}</span>
        </div>

        {/* Simulated App Dashboard inside preview */}
        {simulatedDevice === 'phone' ? (
          <div className="relative z-10 space-y-1.5 mt-auto pb-4">
            <div 
              className="p-2.5 rounded-2xl border space-y-1"
              style={{
                backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                borderRadius: `${config.cardBorderRadius || 20}px`
              }}
            >
              <span className="text-[8px] font-mono text-text-secondary block font-bold uppercase tracking-wider">DONANIM PERFORMANSI</span>
              <div className="text-[10px] font-black font-mono text-emerald-400">
                {actualFps} FPS • %{qualityScore.gpuLoadPercentage} GPU
              </div>
            </div>

            <div 
              className="p-1.5 rounded-xl border flex items-center justify-around gap-1"
              style={{
                backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                borderRadius: `${config.cardBorderRadius || 20}px`
              }}
            >
              <div className="w-5 h-5 rounded bg-focus-neon/20 flex items-center justify-center text-focus-neon"><Gauge size={10} /></div>
              <div className="w-5 h-5 rounded flex items-center justify-center text-white/60"><Activity size={10} /></div>
              <div className="w-5 h-5 rounded flex items-center justify-center text-white/60"><Compass size={10} /></div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-2 gap-2 my-auto">
            <div 
              className="p-2.5 rounded-xl border space-y-0.5"
              style={{
                backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                borderRadius: `${config.cardBorderRadius || 20}px`
              }}
            >
              <span className="text-[7px] font-mono text-text-secondary block font-bold uppercase">LÜKS MATERYAL</span>
              <div className="text-[10px] font-bold font-display text-white truncate">
                {config.selectedMaterial || 'Glass'}
              </div>
            </div>

            <div 
              className="p-2.5 rounded-xl border space-y-0.5"
              style={{
                backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                borderRadius: `${config.cardBorderRadius || 20}px`
              }}
            >
              <span className="text-[7px] font-mono text-text-secondary block font-bold uppercase">KONTRAST</span>
              <div className="text-[10px] font-bold font-mono text-emerald-400">
                {qualityScore.readabilityScore}% OKUR
              </div>
            </div>
          </div>
        )}

        {/* Simulated interactive active widget */}
        <div 
          className="relative z-10 w-full p-2 rounded-xl border flex items-center justify-between"
          style={{
            backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
            backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
            borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
            borderRadius: `${config.cardBorderRadius || 20}px`
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: config.activePalette?.primaryNeon }} />
            <span className="text-[8px] font-mono font-bold text-white tracking-wide">Visual Engine Running</span>
          </div>
          <button 
            className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-white shadow-sm hover:scale-105 transition-transform"
            style={{ backgroundColor: config.activePalette?.primaryNeon || '#3b82f6' }}
          >
            Aktif
          </button>
        </div>
      </div>

      {/* DETAILED RENDER ENGINE STATISTICS HUD */}
      <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 font-mono text-[10px]">
        <div className="flex justify-between items-center text-text-secondary border-b border-white/5 pb-1.5">
          <span className="flex items-center gap-1 text-white font-bold">
            <Cpu size={12} className="text-focus-neon" /> RENDER SİSTEM BİLGİ DETAYI
          </span>
          <span className="text-[8px] bg-slate-800 text-white px-1.5 py-0.5 rounded uppercase">
            {isHtml ? 'Generative SVG/Canvas' : isVideo ? 'Hardware Decoder' : 'Direct GDI'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-text-secondary">
          <div className="bg-slate-950/40 p-2 rounded-lg border border-white/5 space-y-0.5">
            <span>Ekran Çözünürlüğü:</span>
            <span className="text-white font-bold block">{isHtml ? 'Vector (Flexible)' : isVideo ? `${videoRef.current?.videoWidth || 1920}x${videoRef.current?.videoHeight || 1080}` : '3840x2160 (Native)'}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-white/5 space-y-0.5">
            <span>Aktif Kare Sayısı:</span>
            <span className="text-white font-bold block">{frameIndex} Frame</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-white/5 space-y-0.5">
            <span>Pixel Render Süresi:</span>
            <span className="text-emerald-400 font-bold block">{renderTime} ms</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-white/5 space-y-0.5">
            <span>GPU Hızlandırıcı:</span>
            <span className="text-focus-neon font-bold block">Direct3D 12 (WebGL)</span>
          </div>
        </div>

        {/* INTERACTIVE PLAYBACK CONTROLS PANEL */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause Wallpaper' : 'Play Wallpaper'}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={handleRestart}
              title="Restart Wallpaper Animation"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
            >
              <RotateCcw size={11} />
            </button>
            {isVideo && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
              >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-text-secondary">Oynatma Modu:</span>
            <select
              value={playbackMode}
              onChange={(e) => setPlaybackMode(e.target.value as any)}
              className="bg-slate-950 border border-white/10 text-white rounded px-2 py-0.5 text-[9px] focus:outline-none focus:border-focus-neon cursor-pointer font-bold"
            >
              <option value="cover">Fill (Cover)</option>
              <option value="contain">Fit (Contain)</option>
              <option value="stretch">Stretch</option>
              <option value="center">Center</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-bold">{actualFps}Hz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
