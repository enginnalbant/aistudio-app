import React, { useEffect, useRef, useState } from 'react';
import { useWallpaper, WALLPAPER_PRESETS } from '../context/WallpaperContext';

export const SpatialBackground = React.memo(function SpatialBackground() {
  const { config } = useWallpaper();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Handle mouse movement for parallax & radial cursor glow
  useEffect(() => {
    if (!config.parallaxEnabled && !config.mouseGlowEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [config.parallaxEnabled, config.mouseGlowEnabled]);

  // Handle video playback speed, volume & autoplay handling
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = config.playbackSpeed || 1.0;
      videoRef.current.muted = config.isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
  }, [config.playbackSpeed, config.isMuted, config.mediaUrl, config.sourceType]);

  // Particle canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle color from active palette
    const particleColor = config.activePalette?.primaryNeon || '#3b82f6';
    const particleRgb = config.activePalette?.glowRgb || '59, 130, 246';

    const particleCount = Math.min(45, Math.floor(width / 35));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw floating glowing particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleRgb}, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [config.activePalette]);

  // Get wallpaper image URL
  const getWallpaperUrl = () => {
    if (config.sourceType === 'image' || config.sourceType === 'video' || config.sourceType === 'lively') {
      return config.mediaUrl || config.previewUrl;
    }
    if (config.sourceType === 'preset' && config.presetId) {
      const preset = WALLPAPER_PRESETS.find((p) => p.id === config.presetId);
      return preset ? preset.previewUrl : WALLPAPER_PRESETS[0].previewUrl;
    }
    return WALLPAPER_PRESETS[0].previewUrl;
  };

  const bgUrl = getWallpaperUrl();
  const parallaxX = config.parallaxEnabled ? (mousePos.x - 0.5) * 30 : 0;
  const parallaxY = config.parallaxEnabled ? (mousePos.y - 0.5) * 30 : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-neutral-950 transition-colors duration-700">
      
      {/* VIDEO / LIVELY WALLPAPER PLAYER */}
      {((config.sourceType === 'video') || (config.sourceType === 'lively' && (config.mimeType?.startsWith('video') || !config.mimeType?.includes('html')))) && config.mediaUrl ? (
        <video
          ref={videoRef}
          src={config.mediaUrl}
          autoPlay
          loop
          muted={config.isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          style={{
            transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(1.05)`,
            filter: `blur(${config.blurAmount}px) brightness(${config.brightness}%) saturate(${config.saturation}%)`,
          }}
        />
      ) : (config.sourceType === 'lively' && config.mimeType?.includes('html') && config.mediaUrl) ? (
        /* INTERACTIVE HTML LIVELY WALLPAPER */
        <iframe
          src={config.mediaUrl}
          title="Lively HTML Wallpaper"
          className="absolute inset-0 w-full h-full border-none transition-all duration-700 pointer-events-none"
          style={{
            transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(1.05)`,
            filter: `blur(${config.blurAmount}px) brightness(${config.brightness}%) saturate(${config.saturation}%)`,
          }}
        />
      ) : (
        /* STATIC / IMAGE / PRESET WALLPAPER */
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
            transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(1.05)`,
            filter: `blur(${config.blurAmount}px) brightness(${config.brightness}%) saturate(${config.saturation}%)`,
          }}
        />
      )}

      {/* OVERLAY DIMMING LAYER */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundColor: '#000000',
          opacity: config.overlayOpacity / 100,
        }}
      />

      {/* PARTICLE CANVAS OVERLAY */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" />
    </div>
  );
});
