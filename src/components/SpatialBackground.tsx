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

      {/* DYNAMIC ATMOSPHERIC GLOW EFFECTS */}
      {config.glowEnabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Helper colors based on colorMode */}
          {(() => {
            const primary = config.activePalette?.primaryNeon || '#3b82f6';
            const secondary = config.activePalette?.secondaryMain || '#1d4ed8';
            const tertiary = config.activePalette?.accentHexList?.[0] || '#8b5cf6';

            let c1 = primary;
            let c2 = secondary;
            let c3 = tertiary;

            if (config.glowColorMode === 'primary') {
              c2 = primary;
              c3 = primary;
            } else if (config.glowColorMode === 'secondary') {
              c1 = secondary;
              c3 = secondary;
            }

            const opacityVal = (config.glowIntensity ?? 25) / 100;
            const blurVal = `${config.glowRadius ?? 55}vw`;

            // Animation class mapping
            const getAnimClass = (delay = '0s') => {
              switch (config.glowType) {
                case 'pulse':
                  return 'animate-pulse';
                case 'breath':
                  return 'animate-[bounce_6s_infinite]';
                case 'orbit':
                  return 'animate-[spin_20s_linear_infinite]';
                case 'wave':
                  return 'animate-[pulse_4s_ease-in-out_infinite]';
                case 'cyber-scan':
                  return 'animate-[ping_5s_cubic-bezier(0,0,0.2,1)_infinite]';
                case 'static':
                default:
                  return '';
              }
            };

            // Shape Layouts
            if (config.glowShape === 'center-radial') {
              return (
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ${getAnimClass()}`}
                  style={{
                    width: blurVal,
                    height: blurVal,
                    filter: `blur(${Math.min(180, (config.glowRadius || 55) * 2.5)}px)`,
                    opacity: opacityVal,
                    background: `radial-gradient(circle, ${c1} 0%, ${c2} 50%, transparent 100%)`,
                  }}
                />
              );
            }

            if (config.glowShape === 'perimeter-edge') {
              return (
                <>
                  <div
                    className={`absolute top-0 left-0 right-0 h-[25vh] transition-all duration-700 ${getAnimClass()}`}
                    style={{
                      background: `linear-gradient(to bottom, ${c1}, transparent)`,
                      opacity: opacityVal,
                      filter: `blur(${Math.min(100, (config.glowRadius || 55))}px)`,
                    }}
                  />
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[25vh] transition-all duration-700 ${getAnimClass('2s')}`}
                    style={{
                      background: `linear-gradient(to top, ${c2}, transparent)`,
                      opacity: opacityVal,
                      filter: `blur(${Math.min(100, (config.glowRadius || 55))}px)`,
                    }}
                  />
                </>
              );
            }

            if (config.glowShape === 'split-beams') {
              return (
                <>
                  <div
                    className={`absolute top-[-20%] left-[10%] w-[120vw] h-[15vw] -rotate-45 transition-all duration-700 ${getAnimClass()}`}
                    style={{
                      background: `linear-gradient(90deg, transparent, ${c1}, transparent)`,
                      opacity: opacityVal * 1.2,
                      filter: `blur(${Math.min(120, (config.glowRadius || 55) * 1.5)}px)`,
                    }}
                  />
                  <div
                    className={`absolute bottom-[-20%] right-[10%] w-[120vw] h-[15vw] -rotate-45 transition-all duration-700 ${getAnimClass('3s')}`}
                    style={{
                      background: `linear-gradient(90deg, transparent, ${c2}, transparent)`,
                      opacity: opacityVal * 1.2,
                      filter: `blur(${Math.min(120, (config.glowRadius || 55) * 1.5)}px)`,
                    }}
                  />
                </>
              );
            }

            if (config.glowShape === 'nebula-field') {
              return (
                <>
                  <div
                    className={`absolute top-[5%] left-[5%] rounded-full transition-all duration-700 ${getAnimClass()}`}
                    style={{
                      width: `calc(${blurVal} * 0.7)`,
                      height: `calc(${blurVal} * 0.7)`,
                      filter: 'blur(120px)',
                      opacity: opacityVal,
                      backgroundColor: c1,
                    }}
                  />
                  <div
                    className={`absolute top-[5%] right-[5%] rounded-full transition-all duration-700 ${getAnimClass('1.5s')}`}
                    style={{
                      width: `calc(${blurVal} * 0.7)`,
                      height: `calc(${blurVal} * 0.7)`,
                      filter: 'blur(120px)',
                      opacity: opacityVal,
                      backgroundColor: c2,
                    }}
                  />
                  <div
                    className={`absolute bottom-[5%] left-[5%] rounded-full transition-all duration-700 ${getAnimClass('3s')}`}
                    style={{
                      width: `calc(${blurVal} * 0.7)`,
                      height: `calc(${blurVal} * 0.7)`,
                      filter: 'blur(120px)',
                      opacity: opacityVal,
                      backgroundColor: c3,
                    }}
                  />
                  <div
                    className={`absolute bottom-[5%] right-[5%] rounded-full transition-all duration-700 ${getAnimClass('4.5s')}`}
                    style={{
                      width: `calc(${blurVal} * 0.7)`,
                      height: `calc(${blurVal} * 0.7)`,
                      filter: 'blur(120px)',
                      opacity: opacityVal,
                      backgroundColor: c1,
                    }}
                  />
                </>
              );
            }

            // Default 'corner-orbs'
            return (
              <>
                <div
                  className={`absolute top-[-10%] left-[-10%] rounded-full transition-all duration-700 ${getAnimClass()}`}
                  style={{
                    width: blurVal,
                    height: blurVal,
                    filter: `blur(${Math.min(160, (config.glowRadius || 55) * 2)}px)`,
                    opacity: opacityVal,
                    backgroundColor: c1,
                  }}
                />
                <div
                  className={`absolute bottom-[-10%] right-[-10%] rounded-full transition-all duration-700 ${getAnimClass('2s')}`}
                  style={{
                    width: blurVal,
                    height: blurVal,
                    filter: `blur(${Math.min(160, (config.glowRadius || 55) * 2)}px)`,
                    opacity: opacityVal,
                    backgroundColor: c2,
                  }}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* CURSOR RADIAL NEON GLOW */}
      {config.mouseGlowEnabled && (() => {
        const primary = config.activePalette?.primaryNeon || '#3b82f6';
        const size = config.mouseGlowSize || 400;

        let backgroundStyle = `radial-gradient(circle, ${primary} 0%, transparent 70%)`;
        if (config.mouseGlowType === 'spotlight') {
          backgroundStyle = `radial-gradient(circle, #ffffff 0%, ${primary} 30%, transparent 75%)`;
        } else if (config.mouseGlowType === 'ring-halo') {
          backgroundStyle = `radial-gradient(circle, transparent 35%, ${primary} 60%, transparent 80%)`;
        } else if (config.mouseGlowType === 'sparkle-flare') {
          backgroundStyle = `radial-gradient(circle, ${primary} 0%, rgba(255,255,255,0.8) 15%, ${primary} 50%, transparent 80%)`;
        }

        return (
          <div
            className="absolute rounded-full blur-[80px] pointer-events-none transition-transform duration-75 ease-out opacity-35"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${mousePos.x * 100}%`,
              top: `${mousePos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              background: backgroundStyle,
            }}
          />
        );
      })()}

      {/* PARTICLE CANVAS OVERLAY */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" />
    </div>
  );
});
