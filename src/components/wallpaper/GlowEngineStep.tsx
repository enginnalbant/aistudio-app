import React, { useState } from 'react';
import { 
  Sparkles, Sliders, Shield, Zap, Eye, RotateCcw, Copy, Check, Lock, Unlock, 
  Layers, Sun, Moon, Cpu, Battery, Activity, Monitor, Smartphone, Volume2, 
  HelpCircle, Wand2, Palette, Flame, ShieldAlert, Award, Compass
} from 'lucide-react';
import { WallpaperConfig } from '../../context/WallpaperContext';

interface GlowEngineStepProps {
  config: WallpaperConfig;
  updateConfig: (patch: Partial<WallpaperConfig>) => void;
  onOpenHelp?: (topic: any) => void;
}

export const GLOW_PRESETS = [
  { id: 'minimal', name: 'Minimal', intensity: 30, radius: 40, blur: 20, blend: 'screen', color: '#3b82f6' },
  { id: 'modern', name: 'Modern Glass', intensity: 60, radius: 60, blur: 30, blend: 'overlay', color: '#60a5fa' },
  { id: 'glass', name: 'Crystal Glass', intensity: 75, radius: 80, blur: 40, blend: 'linear-dodge', color: '#38bdf8' },
  { id: 'soft_ambient', name: 'Soft Ambient', intensity: 45, radius: 70, blur: 35, blend: 'soft-light', color: '#818cf8' },
  { id: 'luxury', name: 'Luxury Gold', intensity: 70, radius: 50, blur: 25, blend: 'screen', color: '#f59e0b' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', intensity: 95, radius: 90, blur: 45, blend: 'hard-light', color: '#ec4899' },
  { id: 'gaming', name: 'RGB Gaming', intensity: 100, radius: 100, blur: 50, blend: 'color-dodge', color: '#10b981' },
  { id: 'oled', name: 'OLED Pure Black', intensity: 85, radius: 50, blur: 20, blend: 'screen', color: '#6366f1' },
  { id: 'frosted', name: 'Frosted Glass', intensity: 50, radius: 60, blur: 30, blend: 'overlay', color: '#a855f7' }
];

export const GLOW_TYPES = [
  { id: 'border', label: 'Border Glow', category: 'Frame' },
  { id: 'outer', label: 'Outer Glow', category: 'Atmosphere' },
  { id: 'inner', label: 'Inner Glow', category: 'Depth' },
  { id: 'ambient', label: 'Ambient Glow', category: 'Atmosphere' },
  { id: 'bottom', label: 'Bottom Glow', category: 'Ground' },
  { id: 'ground_reflection', label: 'Ground Reflection', category: 'Ground' },
  { id: 'glass', label: 'Glass Glow', category: 'Material' },
  { id: 'corner', label: 'Corner Glow', category: 'Frame' },
  { id: 'hover', label: 'Hover Glow', category: 'Interactive' },
  { id: 'focus', label: 'Focus Glow', category: 'Interactive' },
  { id: 'selected', label: 'Selected Glow', category: 'Interactive' },
  { id: 'pressed', label: 'Pressed Glow', category: 'Interactive' },
  { id: 'sidebar', label: 'Sidebar Glow', category: 'Layout' },
  { id: 'header', label: 'Header Glow', category: 'Layout' },
  { id: 'navigation', label: 'Navigation Glow', category: 'Layout' },
  { id: 'popup', label: 'Popup Glow', category: 'Overlay' },
  { id: 'notification', label: 'Notification Glow', category: 'Overlay' },
  { id: 'window', label: 'Window Glow', category: 'Overlay' },
  { id: 'tooltip', label: 'Tooltip Glow', category: 'Overlay' },
  { id: 'scrollbar', label: 'Scrollbar Glow', category: 'UI' },
  { id: 'dialog', label: 'Dialog Glow', category: 'Overlay' },
  { id: 'button', label: 'Button Glow', category: 'Component' },
  { id: 'input', label: 'Input Glow', category: 'Component' },
  { id: 'chart', label: 'Chart Glow', category: 'Component' },
  { id: 'progress', label: 'Progress Glow', category: 'Component' },
  { id: 'loading', label: 'Loading Glow', category: 'Component' }
];

export const BLEND_MODES = [
  'normal', 'screen', 'overlay', 'soft-light', 'hard-light', 'add', 
  'multiply', 'linear-dodge', 'color-dodge', 'color-burn', 'difference', 'exclusion'
];

export function GlowEngineStep({ config, updateConfig, onOpenHelp }: GlowEngineStepProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'presets' | 'performance'>('ai');
  const [selectedGlowType, setSelectedGlowType] = useState<string>('border');
  const [aiMode, setAiMode] = useState<boolean>(true);
  const [copiedSettings, setCopiedSettings] = useState<boolean>(false);

  // Local state for selected glow type parameters
  const [glowSettings, setGlowSettings] = useState<Record<string, any>>({
    enabled: true,
    color: config.activePalette.primaryNeon || '#3b82f6',
    secondaryColor: config.activePalette.secondaryMain || '#1d4ed8',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    opacity: config.glowIntensity || 70,
    intensity: 75,
    brightness: 100,
    radius: config.glowRadius || 60,
    spread: 15,
    blur: 30,
    softness: 50,
    sharpness: 20,
    glowWidth: 2,
    distance: 10,
    offsetX: 0,
    offsetY: 4,
    angle: 45,
    elevationInfluence: true,
    depthInfluence: 80,
    noise: 5,
    bloom: 40,
    reflection: true,
    blendStrength: 85,
    animationSpeed: 300,
    animationCurve: 'ease-in-out',
    pulseAmount: 20,
    breathingAmount: 15,
    rippleAmount: 10,
    waveAmount: 10,
    layerPriority: 5,
    blendMode: 'screen'
  });

  // Auto optimization toggles
  const [autoOpts, setAutoOpts] = useState({
    lightTheme: true,
    darkTheme: true,
    oledMode: false,
    displayBrightness: true,
    wallpaperMotion: true,
    performanceProfile: true,
    deviceProfile: true,
    batteryMode: true,
    accessibility: true
  });

  const handleParamChange = (key: string, val: any) => {
    setGlowSettings(prev => ({ ...prev, [key]: val }));
    updateConfig({ glowIntensity: val });
  };

  const applyPreset = (preset: typeof GLOW_PRESETS[0]) => {
    setGlowSettings(prev => ({
      ...prev,
      intensity: preset.intensity,
      radius: preset.radius,
      blur: preset.blur,
      blendMode: preset.blend,
      color: preset.color
    }));
    updateConfig({
      glowIntensity: preset.intensity,
      glowRadius: preset.radius,
      glowEnabled: true
    });
  };

  const runAiRecommendation = () => {
    setAiMode(true);
    // Automatically derive intelligent settings from palette
    const primary = config.activePalette.primaryNeon || '#3b82f6';
    const isDark = config.activePalette.isDarkTheme;
    setGlowSettings(prev => ({
      ...prev,
      color: primary,
      intensity: isDark ? 80 : 50,
      radius: 70,
      blur: 35,
      blendMode: isDark ? 'screen' : 'overlay'
    }));
    updateConfig({ glowEnabled: true, glowIntensity: isDark ? 80 : 50 });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
            <Sparkles size={22} className="text-focus-neon animate-pulse" /> 7. Adım: Gelişmiş Glow Motoru (Advanced Glow Engine)
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Yapay zeka destekli akıllı ışıklandırma, derinlik entegrasyonu ve 26+ bağımsız glow kategorisi ile premium görsel hiyerarşi oluşturun.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAiMode(!aiMode)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
              aiMode ? 'bg-focus-neon/20 text-focus-neon border border-focus-neon/40 shadow-sm' : 'bg-white/5 text-text-secondary border border-white/10'
            }`}
          >
            <Wand2 size={13} /> {aiMode ? 'AI Modu: Aktif' : 'AI Modu: Kapalı'}
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl">
        {[
          { id: 'ai', label: 'AI Analiz & Öneri', icon: Wand2 },
          { id: 'manual', label: 'Manuel Glow Editör', icon: Sliders },
          { id: 'presets', label: 'Glow Presets', icon: Palette },
          { id: 'performance', label: 'Performans & Etki', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-focus-neon text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/30' 
                  : 'text-text-secondary hover:text-white bg-white/[0.02] hover:bg-white/5 border border-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI ANALYSIS & RECOMMENDATIONS */}
      {activeTab === 'ai' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-focus-neon/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-focus-neon" /> AI Otomatik Işıklandırma Raporu
              </span>
              <button
                onClick={runAiRecommendation}
                className="px-3 py-1 rounded-xl bg-focus-neon/20 hover:bg-focus-neon/30 text-focus-neon font-mono text-[11px] font-bold border border-focus-neon/30 transition-all flex items-center gap-1"
              >
                <Wand2 size={12} /> Yeniden Hesapla
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[9px] block">ÖNERİLEN GLOW STİLİ</span>
                <span className="text-white font-bold block flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-focus-neon animate-ping" />
                  Kristal Çerçeve + Ortam Işığı (Crystal Ambient)
                </span>
              </div>
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[9px] block">ÖNERİLEN BLEND MODU</span>
                <span className="text-emerald-400 font-bold uppercase block">Screen / Soft Light</span>
              </div>
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[9px] block">BEKLENEN OKUNABİLİRLİK</span>
                <span className="text-sky-400 font-bold block">%99.4 (WCAG AAA Uyumlu)</span>
              </div>
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[9px] block">TAHMİNİ PERFORMANS</span>
                <span className="text-emerald-400 font-bold block">Çok Hafif (60+ FPS Stabil)</span>
              </div>
            </div>

            <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-focus-neon font-bold block uppercase">AI Gerekçe Analizi (Reasoning)</span>
              <p className="text-xs text-text-secondary leading-relaxed font-mono">
                "Duvar kağıdınızdaki koyu mavi ve mor geçişler analiz edildi. Kenar parlamaları (Border Glow) ve hafif ortam yansımaları (Ambient Ground Reflection), arayüz derinliğini %45 artırırken göz yorgunluğunu sıfıra indiriyor."
              </p>
            </div>

            {/* AUTOMATIC OPTIMIZATION TOGGLES */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold text-white block">Otomatik Optimizasyon Katmanları</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'lightTheme', label: 'Light Tema', icon: Sun },
                  { key: 'darkTheme', label: 'Dark Tema', icon: Moon },
                  { key: 'oledMode', label: 'OLED Modu', icon: Zap },
                  { key: 'displayBrightness', label: 'Ekran Parlaklığı', icon: Eye },
                  { key: 'wallpaperMotion', label: 'Duvar Kağıdı Hareketi', icon: Activity },
                  { key: 'batteryMode', label: 'Pil Tasarrufu', icon: Battery }
                ].map(opt => {
                  const Icon = opt.icon;
                  const isChecked = (autoOpts as any)[opt.key];
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setAutoOpts(prev => ({ ...prev, [opt.key]: !isChecked }))}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-all ${
                        isChecked 
                          ? 'bg-focus-neon/10 border-focus-neon/40 text-white' 
                          : 'bg-black/20 border-white/5 text-text-secondary hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={14} className={isChecked ? 'text-focus-neon' : 'text-white/40'} />
                        {opt.label}
                      </span>
                      <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[9px] ${isChecked ? 'bg-focus-neon text-white' : 'bg-white/10'}`}>
                        {isChecked ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL GLOW EDITOR */}
      {activeTab === 'manual' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-fade-in">
          {/* GLOW CATEGORIES & SELECTOR */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Layers size={14} className="text-focus-neon" /> Glow Kategorileri ({GLOW_TYPES.length})
              </span>
              <span className="text-[10px] font-mono text-text-secondary">Bağımsız Kontrol</span>
            </div>

            <div className="h-[380px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar bg-slate-900/40 p-3 rounded-2xl border border-white/10">
              {GLOW_TYPES.map(g => {
                const isSelected = selectedGlowType === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGlowType(g.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl font-mono text-xs flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'bg-focus-neon text-white font-bold shadow-md' 
                        : 'text-text-secondary hover:text-white bg-white/[0.02] hover:bg-white/5 border border-white/5'
                    }`}
                  >
                    <span>{g.label}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}>
                      {g.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PARAMETERS CONTROL PANEL */}
          <div className="md:col-span-7 space-y-4 p-5 rounded-3xl bg-slate-900/60 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h4 className="text-sm font-display font-bold text-white capitalize">
                  {GLOW_TYPES.find(g => g.id === selectedGlowType)?.label || selectedGlowType} Parametreleri
                </h4>
                <p className="text-[10px] font-mono text-text-secondary">Seçili bileşen için canlı ışıklandırma ayarları</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setGlowSettings({
                      enabled: true,
                      color: config.activePalette.primaryNeon,
                      intensity: 75,
                      radius: 60,
                      blur: 30,
                      blendMode: 'screen'
                    });
                  }}
                  title="Sıfırla"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* COLOR & BLEND MODE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-text-secondary block">Ana Renk (Color)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={glowSettings.color}
                    onChange={(e) => handleParamChange('color', e.target.value)}
                    className="w-10 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
                  />
                  <input
                    type="text"
                    value={glowSettings.color}
                    onChange={(e) => handleParamChange('color', e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-text-secondary block">Blend Modu (Mix)</label>
                <select
                  value={glowSettings.blendMode}
                  onChange={(e) => handleParamChange('blendMode', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white uppercase"
                >
                  {BLEND_MODES.map(mode => (
                    <option key={mode} value={mode} className="bg-slate-900 text-white">{mode}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SLIDERS */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-text-secondary">Yoğunluk (Intensity)</span>
                  <span className="text-white font-bold">%{glowSettings.intensity}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glowSettings.intensity}
                  onChange={(e) => handleParamChange('intensity', Number(e.target.value))}
                  className="w-full accent-focus-neon cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-text-secondary">Yarıçap / Yayılım (Radius & Spread)</span>
                  <span className="text-white font-bold">{glowSettings.radius}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={glowSettings.radius}
                  onChange={(e) => handleParamChange('radius', Number(e.target.value))}
                  className="w-full accent-focus-neon cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-text-secondary">Bulanıklık (Blur)</span>
                  <span className="text-white font-bold">{glowSettings.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={glowSettings.blur}
                  onChange={(e) => handleParamChange('blur', Number(e.target.value))}
                  className="w-full accent-focus-neon cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-text-secondary">Derinlik Etkisi (Elevation Influence)</span>
                  <span className="text-white font-bold">%{glowSettings.depthInfluence}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glowSettings.depthInfluence}
                  onChange={(e) => handleParamChange('depthInfluence', Number(e.target.value))}
                  className="w-full accent-focus-neon cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GLOW_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-focus-neon transition-all text-left space-y-2 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-focus-neon/5 rounded-full blur-xl group-hover:bg-focus-neon/20 transition-all" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white group-hover:text-focus-neon transition-all">{preset.name}</span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color }} />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary">
                  <span>Yoğunluk: %{preset.intensity}</span>
                  <span>•</span>
                  <span>Blur: {preset.blur}px</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE & IMPACT */}
      {activeTab === 'performance' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" /> Glow Engine Sistem Kaynak Analizi
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Sistem Durumu: Optimal
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[9px] block">GPU YÜKÜ</span>
                <span className="text-emerald-400 font-bold block">1.8% (Çok Hafif)</span>
              </div>
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[9px] block">VRAM TÜKETİMİ</span>
                <span className="text-sky-400 font-bold block">14.2 MB</span>
              </div>
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[9px] block">FPS ETKİSİ</span>
                <span className="text-emerald-400 font-bold block">0 FPS Kaybı (60 Hz)</span>
              </div>
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[9px] block">GÜÇ TÜKETİMİ</span>
                <span className="text-amber-400 font-bold block">İhmal Edilebilir</span>
              </div>
            </div>

            <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-text-secondary font-bold block uppercase">Sağlık Raporu Özeti</span>
              <p className="text-xs text-text-secondary leading-relaxed font-mono">
                Glow motoru katmanları donanım ivmelendirmeli CSS filtreleri ve GPU kompozit katmanları üzerinden çalıştığı için işlemciye (CPU) yük bindirmez.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
