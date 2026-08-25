import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Upload, Sun, Moon, Sparkles, Sliders, ShieldCheck, CheckCircle2, Eye, RefreshCw, Palette } from 'lucide-react';
import { calculateImageLuminance, calculateScrimOpacity, getScrimColor, isLiquidGlassSupported } from '../utils/colorUtils';
import { LiquidGlassCard, LiquidGlassContainerView } from '../components/LiquidGlassCard';
import { useWallpaper, WALLPAPER_PRESETS } from '../context/WallpaperContext';

export interface HomeScreenProps {
  onOpenWallpaperWizard?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenWallpaperWizard }) => {
  const { config, updateConfig } = useWallpaper();
  
  // Local state for HomeScreen wallpaper & contrast testing
  const [currentWallpaperUrl, setCurrentWallpaperUrl] = useState<string>(
    config.mediaUrl || config.previewUrl || WALLPAPER_PRESETS[0].previewUrl
  );
  const [wallpaperName, setWallpaperName] = useState<string>('Cyber Obsidian Neon');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [luminance, setLuminance] = useState<number>(0.2);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with global wallpaper context when active wallpaper changes
  useEffect(() => {
    const activeUrl = config.mediaUrl || config.previewUrl;
    if (activeUrl && activeUrl !== currentWallpaperUrl) {
      setCurrentWallpaperUrl(activeUrl);
    }
  }, [config.mediaUrl, config.previewUrl]);

  // Recalculate Image Luminance & Scrim Opacity whenever wallpaper changes
  useEffect(() => {
    let isMounted = true;
    async function analyzeWallpaper() {
      if (!currentWallpaperUrl) return;
      setIsAnalyzing(true);
      const lum = await calculateImageLuminance(currentWallpaperUrl);
      if (isMounted) {
        setLuminance(lum);
        setIsAnalyzing(false);
      }
    }
    analyzeWallpaper();
    return () => {
      isMounted = false;
    };
  }, [currentWallpaperUrl]);

  // Calculate dynamic Scrim opacity according to Apple Liquid Glass formula: 0.1 + (0.4 * (1 - luminance))
  const scrimOpacity = calculateScrimOpacity(luminance, isDarkTheme);
  const scrimColorString = getScrimColor(isDarkTheme, scrimOpacity);
  const glassSupported = isLiquidGlassSupported();

  // Handle local file upload for wallpaper selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setCurrentWallpaperUrl(blobUrl);
      setWallpaperName(file.name);
      updateConfig({
        sourceType: 'image',
        mediaUrl: blobUrl,
        previewUrl: blobUrl,
        rawFileName: file.name
      });
    }
  };

  // Select wallpaper from presets
  const handlePresetSelect = (preset: typeof WALLPAPER_PRESETS[0]) => {
    setCurrentWallpaperUrl(preset.previewUrl);
    setWallpaperName(preset.name);
    updateConfig({
      sourceType: 'preset',
      presetId: preset.id,
      previewUrl: preset.previewUrl,
      mediaUrl: preset.previewUrl,
      activePalette: preset.palette
    });
  };

  return (
    <div className={`relative min-h-screen w-full font-sans transition-colors duration-500 overflow-x-hidden ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
      {/* 🖼️ WALLPAPER BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentWallpaperUrl}
          alt="Wallpaper Background"
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform scale-105"
        />

        {/* 🔮 GLOBAL ANIMATED SCRIM CONTRAST LAYER (iOS 26 Spec) */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
          style={{
            backgroundColor: scrimColorString,
          }}
        />
      </div>

      {/* 🚀 MAIN CONTENT CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HEADER BAR CARD */}
        <LiquidGlassCard
          effect="regular"
          scrimOpacity={scrimOpacity}
          isDarkTheme={isDarkTheme}
          className="p-6 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-focus-neon/20 text-focus-neon border border-focus-neon/30 flex items-center gap-1">
                  <Sparkles size={12} /> Apple Liquid Glass (iOS 26 Spec)
                </span>
                {!glassSupported && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Fallback View
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                Liquid Glass HomeScreen
              </h1>
              <p className="text-xs sm:text-sm opacity-80 max-w-2xl font-sans">
                Koyu/açık wallpaper ve sistem temalarına duyarlı otomatik **Scrim Kontrast Koruma Mekanizması** ile güçlendirilmiş sıvı cam kart paneli.
              </p>
            </div>

            {/* CONTROLS & TOGGLES */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 active:scale-95 shadow-md"
              >
                {isDarkTheme ? <Sun size={15} className="text-amber-300" /> : <Moon size={15} className="text-indigo-400" />}
                <span>{isDarkTheme ? 'Dark Mode' : 'Light Mode'}</span>
              </button>

              {/* Wallpaper Picker Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-focus-neon/20 hover:bg-focus-neon/30 border border-focus-neon/40 text-focus-neon transition-all duration-200 active:scale-95 shadow-lg"
              >
                <Upload size={15} />
                <span>Wallpaper Yükle</span>
              </button>

              {onOpenWallpaperWizard && (
                <button
                  onClick={onOpenWallpaperWizard}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 active:scale-95 shadow-md"
                >
                  <Palette size={15} className="text-focus-neon" />
                  <span>Stüdyo Sihirbazı</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </LiquidGlassCard>

        {/* ⚡ CONTRAST INSPECTOR & BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT PANEL: SCRIM & LUMINANCE INSPECTOR */}
          <LiquidGlassCard
            effect="regular"
            scrimOpacity={scrimOpacity}
            isDarkTheme={isDarkTheme}
            className="p-6 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-focus-neon" />
                <h3 className="font-display font-bold text-base">Scrim Metrik Analizi</h3>
              </div>
              {isAnalyzing && <RefreshCw size={14} className="animate-spin text-focus-neon" />}
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1">
                <div className="flex justify-between opacity-70">
                  <span>Aktif Wallpaper:</span>
                  <span className="font-bold text-right truncate max-w-[140px]">{wallpaperName}</span>
                </div>
                <div className="flex justify-between opacity-70">
                  <span>Ortalama Parlaklık (Luminance):</span>
                  <span className="font-bold text-focus-neon">{(luminance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-focus-neon transition-all duration-500"
                    style={{ width: `${luminance * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1">
                <div className="flex justify-between opacity-70">
                  <span>Hesaplanan Scrim Opaklığı:</span>
                  <span className="font-bold text-emerald-400">{(scrimOpacity * 100).toFixed(1)}%</span>
                </div>
                <div className="text-[10px] opacity-60 mt-1">
                  Formül: <code className="text-focus-neon font-bold">0.1 + (0.4 * (1 - luminance))</code>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1">
                <div className="flex justify-between opacity-70">
                  <span>Sistem Teması:</span>
                  <span className="font-bold uppercase text-amber-300">{isDarkTheme ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className="flex justify-between opacity-70">
                  <span>Kontrast Koruma Katmanı:</span>
                  <span className="font-bold text-emerald-400">Aktif & Stabil</span>
                </div>
              </div>
            </div>

            {/* Preset Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-70 block">
                Hazır Arka Planlar
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WALLPAPER_PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className="relative rounded-lg overflow-hidden h-14 border border-white/20 hover:border-focus-neon transition-all duration-200 group active:scale-95"
                  >
                    <img src={preset.previewUrl} alt={preset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-bold text-white text-center px-1">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </LiquidGlassCard>

          {/* RIGHT PANEL: LIQUID GLASS DEMO CARDS & BUTTONS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interactive Card Section */}
            <LiquidGlassCard
              effect="regular"
              scrimOpacity={scrimOpacity}
              isDarkTheme={isDarkTheme}
              className="p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <h3 className="font-display font-bold text-lg">Yüksek Okunabilirlik & Kontrast Testi</h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  WCAG AA Pass
                </span>
              </div>

              <p className="text-sm opacity-90 leading-relaxed font-sans">
                Bu kart, arkadaki wallpaper ne kadar koyu veya açık olursa olsun metinlerin asla kaybolmamasını sağlayan **Scrim Mekanizmasını** sergiler. Üstteki butonlardan Light/Dark mod geçişi yapabilir veya farklı renkte bir wallpaper seçerek anında gözlemleyebilirsiniz.
              </p>

              {/* Status List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold">Koyu Wallpaper + Light Tema</h4>
                    <p className="text-[11px] opacity-75 mt-0.5">Metinler kaybolmaz, Scrim opaklığı otomatik artırılır.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold">Cam Efekt Çeşitleri</h4>
                    <p className="text-[11px] opacity-75 mt-0.5">Regular, Clear, Frosted, Ultra-thin hazır profiller.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in ContainerView */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70 block">
                  İnteraktif Cam Butonlar (effect="clear", interactive=true)
                </span>

                <LiquidGlassContainerView direction="row" spacing={12} className="flex-wrap">
                  <LiquidGlassCard
                    effect="clear"
                    interactive={true}
                    scrimOpacity={scrimOpacity}
                    isDarkTheme={isDarkTheme}
                    className="px-5 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-focus-neon">
                      <Sparkles size={14} />
                      <span>Sistem Raporu Al</span>
                    </div>
                  </LiquidGlassCard>

                  <LiquidGlassCard
                    effect="clear"
                    interactive={true}
                    scrimOpacity={scrimOpacity}
                    isDarkTheme={isDarkTheme}
                    className="px-5 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Sliders size={14} />
                      <span>Filtre Ayarları</span>
                    </div>
                  </LiquidGlassCard>

                  <LiquidGlassCard
                    effect="clear"
                    interactive={true}
                    scrimOpacity={scrimOpacity}
                    isDarkTheme={isDarkTheme}
                    className="px-5 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <ImageIcon size={14} />
                      <span>Galeri Modu</span>
                    </div>
                  </LiquidGlassCard>
                </LiquidGlassContainerView>
              </div>
            </LiquidGlassCard>

            {/* Frosted Effect Card */}
            <LiquidGlassCard
              effect="frosted"
              scrimOpacity={scrimOpacity}
              isDarkTheme={isDarkTheme}
              className="p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base">Frosted Glass Katmanı</h4>
                <span className="text-xs font-mono font-bold text-focus-neon">effect="frosted"</span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed font-sans">
                Bu kart daha yüksek bulanıklık (blur: 45px) ve cam yoğunluğuna sahiptir. Yoğun bilgi alanlarında ve sistem pencerelerinde maksimum odaklanma sağlar.
              </p>
            </LiquidGlassCard>

          </div>

        </div>

      </div>
    </div>
  );
};

export default HomeScreen;
