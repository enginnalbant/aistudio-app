import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  useDesignSystem, 
  formatColor, 
  calculateContrast, 
  hexToRgb, 
  rgbToHsl, 
  hslToRgb,
  rgbToHex,
  ColorModel,
  DesignTokens,
  TypographyTokenSettings,
  IconStyle,
  IconPackId
} from '../context/DesignSystemContext';
import { 
  Palette, 
  Type, 
  Smile, 
  Wand2, 
  Sparkles, 
  Layers, 
  Lock, 
  Unlock, 
  Copy, 
  Trash2, 
  Plus, 
  Check, 
  History, 
  Star, 
  Download, 
  Upload, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Sliders, 
  Type as FontIcon, 
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  FolderOpen,
  MousePointerClick,
  Compass,
  User,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export const DesignSystemStudio = () => {
  const {
    activePalette,
    palettes,
    colorHistory,
    favoriteColors,
    activeColorModel,
    beforePalette,

    updateColorToken,
    selectPalette,
    createPalette,
    duplicatePalette,
    deletePalette,
    toggleFavoriteColor,
    addToColorHistory,
    setActiveColorModel,
    generateSmartPalette,
    setBeforeSnapshot,
    revertToBeforeSnapshot,
    importPalette,
    exportPalette,

    activeTypographyPresetId,
    typographyPresets,
    activeTypographyTokens,
    installedFonts,

    updateTypographyToken,
    selectTypographyPreset,
    installFont,
    uninstallFont,
    recommendTypographyForWallpaper,

    activeIconPack,
    activeIconStyle,
    iconSettings,
    iconTokens,

    selectIconPack,
    selectIconStyle,
    updateIconSettings,
    recommendIconsForTheme,

    harmonyReport,
    syncToRoot
  } = useDesignSystem();

  const [activeSubTab, setActiveSubTab] = useState<'colors' | 'typography' | 'icons' | 'harmony'>('harmony');
  const [selectedTokenKey, setSelectedTokenKey] = useState<keyof DesignTokens>('primary');
  
  // Local state for temporary inputs
  const [newPaletteName, setNewPaletteName] = useState('');
  const [newPaletteCategory, setNewPaletteCategory] = useState<ColorPaletteCategory>('Minimal');
  const [baseSmartColor, setBaseSmartColor] = useState(activePalette.tokens.primary);
  const [smartGeneratorRule, setSmartGeneratorRule] = useState('Analogous');
  const [generatedExplanation, setGeneratedExplanation] = useState('');
  
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Custom font installer
  const [newFontName, setNewFontName] = useState('');
  
  // Gradient Stops state
  const [gradientStops, setGradientStops] = useState<{ pos: number; color: string }[]>([
    { pos: 0, color: activePalette.tokens.primary },
    { pos: 50, color: activePalette.tokens.accent },
    { pos: 100, color: activePalette.tokens.secondary }
  ]);

  type ColorPaletteCategory = 'Corporate' | 'Gaming' | 'Cyberpunk' | 'Nature' | 'Luxury' | 'Minimal' | 'Material' | 'Glass' | 'Neon' | 'AMOLED' | 'HDR' | 'OLED';

  const tokenList: { key: keyof DesignTokens; label: string; group: 'Brand' | 'Feedback' | 'Surface' | 'Decorative' | 'UI' }[] = [
    { key: 'primary', label: 'Birincil Marka', group: 'Brand' },
    { key: 'secondary', label: 'İkincil Marka', group: 'Brand' },
    { key: 'accent', label: 'Aksan/Glow', group: 'Brand' },
    
    { key: 'success', label: 'Başarılı', group: 'Feedback' },
    { key: 'warning', label: 'Uyarı', group: 'Feedback' },
    { key: 'danger', label: 'Hata/Tehlike', group: 'Feedback' },
    { key: 'info', label: 'Bilgi', group: 'Feedback' },
    
    { key: 'background', label: 'Ana Arka Plan', group: 'Surface' },
    { key: 'surface', label: 'Yüzey / Panel', group: 'Surface' },
    { key: 'card', label: 'Kart Kutusu', group: 'Surface' },
    { key: 'sidebar', label: 'Kenar Çubuğu', group: 'Surface' },
    { key: 'header', label: 'Üst Başlık', group: 'Surface' },
    { key: 'border', label: 'Kenarlık', group: 'Surface' },
    { key: 'shadow', label: 'Gölge', group: 'Surface' },
    
    { key: 'glass', label: 'Cam Yansıması', group: 'Decorative' },
    { key: 'glow', label: 'Parıltı Katmanı', group: 'Decorative' },
    
    { key: 'typography', label: 'Yazı Rengi', group: 'UI' },
    { key: 'icons', label: 'Simge Rengi', group: 'UI' },
    { key: 'charts', label: 'Grafik Teması', group: 'UI' },
    { key: 'buttons', label: 'Buton Dolgusu', group: 'UI' },
    { key: 'hover', label: 'Hover Durumu', group: 'UI' },
    { key: 'focus', label: 'Focus Sınırı', group: 'UI' }
  ];

  // Helper to trigger recommended layout automatically
  const handleAutoHarmonize = () => {
    const typoRec = recommendTypographyForWallpaper();
    const iconRec = recommendIconsForTheme();
    
    selectTypographyPreset(typoRec.presetId);
    selectIconPack(iconRec.pack);
    selectIconStyle(iconRec.style);
    
    // Pulse animation or notification feedback
    alert(`AI Uyum Motoru Tetiklendi:\n\n1. Tipografi: ${typoRec.presetId} (${typoRec.reasoning})\n2. Simgeler: ${iconRec.style} tarzı ${iconRec.pack} paketi (${iconRec.reasoning})`);
  };

  // Sync current smart generator input
  const handleSmartGenerate = () => {
    const result = generateSmartPalette(baseSmartColor, smartGeneratorRule);
    createPalette(`AI ${smartGeneratorRule} - ${baseSmartColor.slice(1,5).toUpperCase()}`, 'Material', result.tokens);
    setGeneratedExplanation(result.reasoning);
  };

  // Convert current selected token value with sliders
  const currentTokenColor = activePalette.tokens[selectedTokenKey] || '#FFFFFF';
  const rgbObj = hexToRgb(currentTokenColor);
  const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);

  const handleSliderChange = (model: 'r' | 'g' | 'b' | 'h' | 's' | 'l', value: number) => {
    let nextHex = currentTokenColor;
    if (model === 'r' || model === 'g' || model === 'b') {
      const updatedRgb = { ...rgbObj, [model]: value };
      nextHex = rgbToHex(updatedRgb.r, updatedRgb.g, updatedRgb.b);
    } else {
      const updatedHsl = { ...hslObj, [model]: value };
      const nextRgb = hslToRgb(updatedHsl.h, updatedHsl.s, updatedHsl.l);
      nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    }
    updateColorToken(selectedTokenKey, nextHex);
  };

  // Dynamic Lucide rendering using icon tokens
  const renderIconPreview = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    
    // Build style based on active icon system states
    const strokeWidthVal = iconSettings.strokeWidth;
    const sizeVal = iconSettings.size;
    const isNeon = activeIconStyle === 'Neon';
    const isDuotone = activeIconStyle === 'Duotone';
    const isGlass = activeIconStyle === 'Glass';
    const isFilled = activeIconStyle === 'Filled';
    
    const style: React.CSSProperties = {
      width: `${sizeVal}px`,
      height: `${sizeVal}px`,
      opacity: iconSettings.opacity / 100,
      transform: `rotate(${iconSettings.rotation}deg)`,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: 'pointer'
    };

    let strokeColor = activePalette.tokens.icons;
    let fillColor = isFilled ? `${activePalette.tokens.icons}44` : 'none';

    if (isNeon) {
      strokeColor = activePalette.tokens.accent;
      style.filter = `drop-shadow(0 0 8px ${activePalette.tokens.accent})`;
    } else if (isDuotone) {
      strokeColor = activePalette.tokens.primary;
      fillColor = `${activePalette.tokens.accent}55`;
    } else if (isGlass) {
      strokeColor = 'rgba(255,255,255,0.8)';
      fillColor = 'rgba(255,255,255,0.15)';
      style.backdropFilter = 'blur(4px)';
    }

    return (
      <div 
        className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
        style={{ borderRadius: `${iconSettings.cornerRadius}px` }}
      >
        <IconComponent 
          style={style} 
          stroke={strokeColor} 
          fill={fillColor} 
          strokeWidth={strokeWidthVal} 
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" id="design-system-studio-root">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-focus-neon to-ai-bright flex items-center justify-center text-white shadow-lg shadow-focus-neon/30">
            <Layers size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-display font-black text-white leading-tight uppercase">APEX DESIGN STUDIO</h3>
            <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Unified Theme Orchestrator v5.0</p>
          </div>
        </div>

        {/* Studio Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start md:self-auto gap-0.5">
          {[
            { id: 'harmony', label: 'Uyum & AI', icon: Sparkles },
            { id: 'colors', label: 'Renk Motoru', icon: Palette },
            { id: 'typography', label: 'Tipografi', icon: Type },
            { id: 'icons', label: 'Simge Sistemi', icon: Smile }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-focus-neon text-white shadow-md shadow-focus-neon/15' 
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BODY CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HARMONY & INTEGRATIVE HUD */}
          {activeSubTab === 'harmony' && (
            <motion.div
              key="harmony-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Dynamic Score Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Visual Circle Meter */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-focus-neon/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative size-36 flex items-center justify-center mb-4">
                    {/* Circle SVG */}
                    <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                      <motion.circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke="var(--focus-neon)" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray="264"
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * harmonyReport.score) / 100 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-display font-black text-white tracking-tighter">{harmonyReport.score}%</span>
                      <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest mt-0.5">Uyum Skoru</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${
                    harmonyReport.rating === 'PERFECT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    harmonyReport.rating === 'EXCELLENT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    harmonyReport.rating === 'GOOD' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {harmonyReport.rating} SYSTEM
                  </span>
                </div>

                {/* Score Details & Calibration */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Arayüz Kontrast & Erişilebilirlik Raporu</h4>
                      <p className="text-xs text-text-secondary">Tasarım elemanları, renk yasaları ve WCAG 2.1 AA kontrast kurallarına göre dinamik analiz edilir.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="p-3 bg-black/25 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-text-secondary uppercase">WCAG Seviyesi</span>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span className="text-xs font-black text-white">{harmonyReport.contrastLevel}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-black/25 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Kontrast Oranı</span>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp size={14} className="text-focus-neon" />
                          <span className="text-xs font-black text-white">{harmonyReport.contrastRatio} : 1</span>
                        </div>
                      </div>

                      <div className="p-3 bg-black/25 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Uyum Modeli</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Zap size={14} className="text-amber-400" />
                          <span className="text-xs font-black text-white uppercase tracking-tight">{activePalette.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
                    <div className="text-xs text-text-secondary flex-1">
                      Renk, Tipografi ve İkon parametrelerini birbirine entegre ederek anında tam uyumlu hale getirin.
                    </div>
                    <button
                      onClick={handleAutoHarmonize}
                      className="px-5 py-2.5 rounded-xl bg-focus-neon text-white font-bold text-xs uppercase flex items-center gap-2 shadow-lg shadow-focus-neon/25 hover:scale-105 active:scale-95 transition-all cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Sparkles size={14} /> AI Otomatik Eşitle
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Recommendations Checklist */}
              <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tasarım Uyumu Önerileri ({harmonyReport.recommendations.length})</h4>
                </div>
                
                {harmonyReport.recommendations.length === 0 ? (
                  <div className="py-6 text-center text-xs text-emerald-400 font-bold flex flex-col items-center gap-2">
                    <CheckCircle2 size={32} />
                    <span>Tebrikler! Tasarım sistemi mükemmel bir uyum içerisinde çalışıyor. Hiçbir uyumsuzluk bulunamadı.</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {harmonyReport.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                        <div className="size-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span className="text-xs text-amber-200">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Preview Card */}
              <div className="p-5 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Arayüz Canlı Önizleme Testi</h4>
                  <span className="text-[10px] font-mono text-text-secondary uppercase">Canlı CSS Enjeksiyonu</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Styled component preview */}
                  <div className="p-4 bg-ds-color-background rounded-2xl border border-ds-color-border space-y-3 shadow-lg shadow-black/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-ds-color-accent font-bold uppercase tracking-widest">Aktivite Akışı</span>
                      <div className="size-2 rounded-full bg-ds-color-success animate-pulse" />
                    </div>
                    <h5 className="text-sm font-bold text-ds-color-typography">ApexOS Veri Analizörü</h5>
                    <p className="text-xs text-text-secondary">Seçtiğiniz font olan <code className="text-ds-color-accent font-bold font-mono">{activeTypographyTokens.body.fontFamily.split(',')[0]}</code> ile harika okuma konforu.</p>
                    <div className="pt-2 flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-ds-color-buttons text-white text-[11px] font-bold hover:scale-105 active:scale-95 transition-all">İşlem Onayla</button>
                      <button className="px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary text-[11px] font-bold border border-white/10">İptal</button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-col justify-between">
                    <p className="text-xs text-text-secondary">Tasarım Stüdyosu'nda yapacağınız her renk, font ve ikon ayarı tüm sisteme anında işlenir. Canlı Önizleme bileşeni, sistem kök değişkenlerinizi kullanarak güncel durumu doğrular.</p>
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-text-secondary">
                      <span>Ana Renk: {activePalette.tokens.primary}</span>
                      <span>Font Sınıfı: {activeTypographyPresetId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ADVANCED COLOR ENGINE */}
          {activeSubTab === 'colors' && (
            <motion.div
              key="colors-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Snapshot / Before-After controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={setBeforeSnapshot}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg border border-white/10 transition-all flex items-center gap-1.5"
                    title="Mevcut durumu dondurarak karşılaştırma noktası oluşturur"
                  >
                    <Copy size={13} /> Karşılaştırma Snapshot Al
                  </button>
                  {beforePalette && (
                    <button 
                      onClick={revertToBeforeSnapshot}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/20 transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw size={13} /> Geri Yükle (Revert)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-text-secondary uppercase">Aktif Format:</span>
                  {(['HEX', 'RGB', 'RGBA', 'HSL', 'OKLCH'] as ColorModel[]).map(model => (
                    <button
                      key={model}
                      onClick={() => setActiveColorModel(model)}
                      className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                        activeColorModel === model 
                          ? 'bg-focus-neon text-white' 
                          : 'text-text-secondary hover:bg-white/5'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* 1. Design Token Inspector */}
                <div className="lg:col-span-4 p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div>
                    <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">Tasarım Jetonları (Design Tokens)</h4>
                    <p className="text-[10px] text-text-secondary">Renk atamak istediğiniz jetonu seçin</p>
                  </div>

                  <div className="space-y-3">
                    {(['Brand', 'Feedback', 'Surface', 'Decorative', 'UI'] as const).map(group => (
                      <div key={group} className="space-y-1.5">
                        <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-60 px-1">{group}</span>
                        <div className="space-y-1">
                          {tokenList.filter(t => t.group === group).map(token => {
                            const val = activePalette.tokens[token.key];
                            const isSelected = selectedTokenKey === token.key;
                            return (
                              <button
                                key={token.key}
                                onClick={() => {
                                  setSelectedTokenKey(token.key);
                                  setBaseSmartColor(val);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl transition-all border ${
                                  isSelected 
                                    ? 'bg-focus-neon/10 border-focus-neon text-focus-neon' 
                                    : 'bg-black/20 border-white/5 text-white hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="size-5 rounded-md border border-white/20 shadow-inner"
                                    style={{ backgroundColor: val }}
                                  />
                                  <span className="text-xs font-bold">{token.label}</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold opacity-75">
                                  {formatColor(val, activeColorModel)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Professional Color Picker & Controllers */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="size-7 rounded-lg border border-white/20 shadow-md shadow-black/40"
                          style={{ backgroundColor: currentTokenColor }}
                        />
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Renk Ayarlama Masası</h4>
                          <p className="text-[10px] text-text-secondary">Token: <code className="text-focus-neon font-bold">{selectedTokenKey}</code></p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => toggleFavoriteColor(currentTokenColor)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-amber-400 active:scale-90 transition-all text-text-secondary"
                      >
                        <Star size={16} fill={favoriteColors.includes(currentTokenColor) ? "currentColor" : "none"} className={favoriteColors.includes(currentTokenColor) ? "text-amber-400" : ""} />
                      </button>
                    </div>

                    {/* Gradient Editor representation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary">
                        <span>GRADYENT EDİTÖRÜ / RENK GEÇİŞİ</span>
                        <span>{gradientStops.length} Renk Durağı</span>
                      </div>
                      <div 
                        className="h-7 w-full rounded-xl border border-white/10 relative shadow-inner"
                        style={{
                          background: `linear-gradient(to right, ${gradientStops.map(s => `${s.color} ${s.pos}%`).join(', ')})`
                        }}
                      >
                        {gradientStops.map((stop, idx) => (
                          <div
                            key={idx}
                            className="absolute size-4 rounded-full border-2 border-white bg-black -translate-x-1/2 -top-1 shadow-md cursor-pointer hover:scale-125 transition-transform"
                            style={{ left: `${stop.pos}%`, backgroundColor: stop.color }}
                            onClick={() => updateColorToken(selectedTokenKey, stop.color)}
                            title={`Durak ${idx + 1}: ${stop.color}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Math HSL and RGB Slider blocks */}
                    <div className="space-y-4 pt-2">
                      {/* HSL Controllers */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-mono text-text-secondary uppercase">HSL Renk Tekeri Sürgüleri (Color Wheel Law)</span>
                        
                        {/* Hue */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-white">
                            <span>Renk Derecesi (Hue)</span>
                            <span className="font-mono">{hslObj.h}°</span>
                          </div>
                          <input 
                            type="range" min="0" max="360" value={hslObj.h}
                            onChange={(e) => handleSliderChange('h', Number(e.target.value))}
                            className="w-full accent-focus-neon h-1.5 bg-black/40 rounded-lg outline-none"
                            style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
                          />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-white">
                            <span>Doygunluk (Saturation)</span>
                            <span className="font-mono">{hslObj.s}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" value={hslObj.s}
                            onChange={(e) => handleSliderChange('s', Number(e.target.value))}
                            className="w-full accent-focus-neon h-1.5 bg-black/40 rounded-lg outline-none"
                          />
                        </div>

                        {/* Lightness */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-white">
                            <span>Işık Yoğunluğu (Lightness)</span>
                            <span className="font-mono">{hslObj.l}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" value={hslObj.l}
                            onChange={(e) => handleSliderChange('l', Number(e.target.value))}
                            className="w-full accent-focus-neon h-1.5 bg-black/40 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      {/* RGB Color controllers */}
                      <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-3">
                        {['r', 'g', 'b'].map(c => {
                          const val = (rgbObj as any)[c];
                          const label = c === 'r' ? 'Kırmızı (Red)' : c === 'g' ? 'Yeşil (Green)' : 'Mavi (Blue)';
                          return (
                            <div key={c} className="space-y-1">
                              <span className="text-[10px] font-bold text-white block capitalize">{label}</span>
                              <input 
                                type="number" min="0" max="255" value={val}
                                onChange={(e) => handleSliderChange(c as any, Number(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-xs text-white text-center focus:border-focus-neon outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Smart Generator & Palette Management */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* A. AI Smart Generator */}
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><Wand2 size={13} /> Akıllı Renk Teorisi Üreteci</h4>
                        <p className="text-[10px] text-text-secondary">Klasik renk uyum modellerini sentezleyin</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text" value={baseSmartColor}
                            onChange={(e) => setBaseSmartColor(e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-focus-neon"
                            placeholder="Ana Renk HEX"
                          />
                          <div 
                            className="size-8 rounded-xl border border-white/20 self-center shadow-inner shrink-0"
                            style={{ backgroundColor: baseSmartColor }}
                          />
                        </div>

                        <select
                          value={smartGeneratorRule}
                          onChange={(e) => setSmartGeneratorRule(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-focus-neon font-bold"
                        >
                          {['Analogous', 'Complementary', 'Monochrome', 'Pastel', 'Glass Theme'].map(rule => (
                            <option key={rule} value={rule} className="bg-neutral-900 text-white">{rule} Modeli</option>
                          ))}
                        </select>

                        <button
                          onClick={handleSmartGenerate}
                          className="w-full py-2 bg-gradient-to-r from-focus-neon to-focus-main text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-focus-neon/15 cursor-pointer"
                        >
                          <Sparkles size={12} /> Palet Oluştur & Açıkla
                        </button>

                        {generatedExplanation && (
                          <div className="p-3 bg-focus-neon/5 border border-focus-neon/10 rounded-xl text-[10px] text-focus-ice leading-relaxed">
                            <span className="font-bold block text-focus-neon uppercase tracking-wider mb-0.5">Neden Bu Renkler?</span>
                            {generatedExplanation}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* B. History & Favorites Grid */}
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Geçmiş ve Favori Renkler</h4>
                        <p className="text-[10px] text-text-secondary">Tıklayarak seçili tokene anında atayın</p>
                      </div>

                      <div className="space-y-4">
                        {/* Favorites */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1"><Star size={10} className="text-amber-400" /> Favorilerim</span>
                          <div className="flex flex-wrap gap-1.5">
                            {favoriteColors.map(fav => (
                              <button
                                key={fav}
                                onClick={() => updateColorToken(selectedTokenKey, fav)}
                                className="size-6 rounded-lg border border-white/10 shadow-inner hover:scale-110 active:scale-90 transition-all cursor-pointer"
                                style={{ backgroundColor: fav }}
                                title={fav}
                              />
                            ))}
                            {favoriteColors.length === 0 && <span className="text-[10px] text-text-secondary">Henüz favori yok.</span>}
                          </div>
                        </div>

                        {/* History */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1"><History size={10} /> Son Kullanılanlar</span>
                          <div className="flex flex-wrap gap-1.5">
                            {colorHistory.map(hist => (
                              <button
                                key={hist}
                                onClick={() => updateColorToken(selectedTokenKey, hist)}
                                className="size-6 rounded-lg border border-white/10 shadow-inner hover:scale-110 active:scale-90 transition-all cursor-pointer"
                                style={{ backgroundColor: hist }}
                                title={hist}
                              />
                            ))}
                            {colorHistory.length === 0 && <span className="text-[10px] text-text-secondary">Henüz geçmiş yok.</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: ADVANCED TYPOGRAPHY ENGINE */}
          {activeSubTab === 'typography' && (
            <motion.div
              key="typography-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* A. Preset Selector & Google Font Upload */}
                <div className="lg:col-span-4 space-y-5">
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Hazır Tipografi Şablonları</h4>
                      <p className="text-[10px] text-text-secondary">İşletim sistemi genelindeki font yapısını yükleyin</p>
                    </div>

                    <div className="space-y-2">
                      {typographyPresets.map(preset => {
                        const isSelected = activeTypographyPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => selectTypographyPreset(preset.id)}
                            className={`w-full text-left p-3 rounded-2xl border transition-all ${
                              isSelected 
                                ? 'bg-focus-neon/15 border-focus-neon text-white shadow-md' 
                                : 'bg-black/20 border-white/5 text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="text-xs font-bold block">{preset.name}</span>
                            <span className="text-[10px] block opacity-75 mt-0.5 leading-relaxed">{preset.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Font Recommender */}
                  <div className="p-5 rounded-3xl bg-gradient-to-b from-ai-void/40 to-transparent border border-ai-bright/20 space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-ai-bright uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={13} /> AI Duvar Kağıdı Font Önerisi</h4>
                      <p className="text-[10px] text-text-secondary">Görsel uyarana göre optimize edilmiş fontlar</p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          const rec = recommendTypographyForWallpaper();
                          selectTypographyPreset(rec.presetId);
                          alert(`Önerilen Tipografi Yüklendi: ${rec.presetId}\n\nAI Gerekçesi: ${rec.reasoning}`);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-ai-bright to-ai-royal text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        <Wand2 size={12} /> Wallpaper Analizi & Eşitle
                      </button>
                      
                      <div className="p-3 bg-black/20 rounded-xl text-[10px] text-text-secondary leading-normal border border-white/5">
                        <span className="font-bold block text-white uppercase mb-0.5">Analiz Motoru</span>
                        Aktif duvar kağıdı formatına ve canlı animasyon hızına bağlı olarak serif/sans-serif dengesini kurar.
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Typography Tokens Settings */}
                <div className="lg:col-span-8 p-5 rounded-3xl bg-white/5 border border-white/5 space-y-5">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Gelişmiş Yazı Tipi İnceleme Masası</h4>
                    <p className="text-[10px] text-text-secondary">Her bir semantik jetonun hiyerarşik boyutunu kalibre edin</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Display XL details */}
                    <div className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>Büyük Başlıklar (Display XL)</span>
                        <span className="text-[10px] font-mono text-text-secondary">Display h1/h2</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* Font Family selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Yazı Tipi Ailesi</label>
                          <select
                            value={activeTypographyTokens.displayXl.fontFamily}
                            onChange={(e) => updateTypographyToken('displayXl', { fontFamily: e.target.value })}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                          >
                            {installedFonts.map(font => (
                              <option key={font} value={font === 'Outfit' ? 'Outfit, sans-serif' : font === 'Inter' ? 'Inter, sans-serif' : font === 'JetBrains Mono' ? 'JetBrains Mono, monospace' : 'Playfair Display, serif'}>{font}</option>
                            ))}
                          </select>
                        </div>

                        {/* Font Weight */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <label className="text-[10px] text-text-secondary uppercase font-bold">Kalınlık (Weight)</label>
                            <span className="font-mono text-[10px]">{activeTypographyTokens.displayXl.fontWeight}</span>
                          </div>
                          <input 
                            type="range" min="300" max="900" step="100"
                            value={activeTypographyTokens.displayXl.fontWeight}
                            onChange={(e) => updateTypographyToken('displayXl', { fontWeight: Number(e.target.value) })}
                            className="w-full h-1 bg-black/40 rounded-lg outline-none accent-focus-neon"
                          />
                        </div>

                        {/* Letter Spacing */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Harf Aralığı (Tracking)</label>
                          <input 
                            type="text" value={activeTypographyTokens.displayXl.letterSpacing}
                            onChange={(e) => updateTypographyToken('displayXl', { letterSpacing: e.target.value })}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Body text details */}
                    <div className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>Gövde Metinleri (Body Text)</span>
                        <span className="text-[10px] font-mono text-text-secondary">Okuma Metni</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Yazı Tipi Ailesi</label>
                          <select
                            value={activeTypographyTokens.body.fontFamily}
                            onChange={(e) => updateTypographyToken('body', { fontFamily: e.target.value })}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                          >
                            {installedFonts.map(font => (
                              <option key={font} value={font === 'Outfit' ? 'Outfit, sans-serif' : font === 'Inter' ? 'Inter, sans-serif' : font === 'JetBrains Mono' ? 'JetBrains Mono, monospace' : 'Playfair Display, serif'}>{font}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <label className="text-[10px] text-text-secondary uppercase font-bold">Satır Yüksekliği (Line Height)</label>
                            <span className="font-mono text-[10px]">{activeTypographyTokens.body.lineHeight}</span>
                          </div>
                          <input 
                            type="text" value={activeTypographyTokens.body.lineHeight}
                            onChange={(e) => updateTypographyToken('body', { lineHeight: e.target.value })}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white text-center font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Yazı Pürüzsüzleştirme (Hinting)</label>
                          <select
                            value={activeTypographyTokens.body.fontSmoothing}
                            onChange={(e) => updateTypographyToken('body', { fontSmoothing: e.target.value as any })}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                          >
                            <option value="antialiased">Subpixel Antialiasing (Pürüzsüz)</option>
                            <option value="subpixel-antialiased">Default System Rendering</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Live Type Scale Preview */}
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest block">Canlı Tipografik Skala (Sample Type Scales)</span>
                    
                    <div className="space-y-4 pt-1">
                      <div>
                        <span className="text-[10px] text-text-secondary font-mono">Display XL Preview</span>
                        <h1 
                          className="text-3xl tracking-tight leading-none mt-1"
                          style={{ 
                            fontFamily: activeTypographyTokens.displayXl.fontFamily,
                            fontWeight: activeTypographyTokens.displayXl.fontWeight,
                            letterSpacing: activeTypographyTokens.displayXl.letterSpacing,
                            textTransform: activeTypographyTokens.displayXl.textTransform
                          }}
                        >
                          APEXOS DISPLAY SCALE
                        </h1>
                      </div>

                      <div className="border-t border-white/5 pt-3">
                        <span className="text-[10px] text-text-secondary font-mono">Body Reading Preview</span>
                        <p 
                          className="text-sm leading-relaxed text-slate-300 mt-1"
                          style={{ 
                            fontFamily: activeTypographyTokens.body.fontFamily,
                            fontWeight: activeTypographyTokens.body.fontWeight,
                            letterSpacing: activeTypographyTokens.body.letterSpacing
                          }}
                        >
                          Gövde metinleriniz için seçilen tipografik parametreler, satır yükseklikleri ve harf arası kavis oranları göz yorulmasını minimize etmek üzere optimize edilmiştir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: ADVANCED ICON SYSTEM */}
          {activeSubTab === 'icons' && (
            <motion.div
              key="icons-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* A. Icon Library Packs & Style Selector */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">İkon Kütüphane Paketleri</h4>
                      <p className="text-[10px] text-text-secondary">Uygulama genelinde simge kütüphanesini anında değiştirin</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'lucide', label: 'Lucide' },
                        { id: 'heroicons', label: 'Heroicons' },
                        { id: 'phosphor', label: 'Phosphor' },
                        { id: 'tabler', label: 'Tabler' },
                        { id: 'remix', label: 'Remix' },
                        { id: 'fluent', label: 'Fluent OS' }
                      ].map(pack => {
                        const isSelected = activeIconPack === pack.id;
                        return (
                          <button
                            key={pack.id}
                            onClick={() => selectIconPack(pack.id as any)}
                            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                              isSelected 
                                ? 'bg-focus-neon/15 border-focus-neon text-white shadow-md' 
                                : 'bg-black/20 border-white/5 text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {pack.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">İkon Görsel Tarz Modeli</h4>
                      <p className="text-[10px] text-text-secondary">Simge çizim ve render formatını belirleyin</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'Outline', label: 'Kontur (Outline)' },
                        { id: 'Filled', label: 'Dolgulu (Filled)' },
                        { id: 'Rounded', label: 'Yumuşak (Rounded)' },
                        { id: 'Neon', label: 'Neon Parıltı (Neon)' },
                        { id: 'Duotone', label: 'Çift Tonlu (Duotone)' },
                        { id: 'Glass', label: 'Buzlu Cam (Glass)' }
                      ].map(style => {
                        const isSelected = activeIconStyle === style.id;
                        return (
                          <button
                            key={style.id}
                            onClick={() => selectIconStyle(style.id as any)}
                            className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                              isSelected 
                                ? 'bg-focus-neon/15 border-focus-neon text-white' 
                                : 'bg-black/20 border-white/5 text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {style.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* B. Icon Token System Settings */}
                <div className="lg:col-span-7 p-5 rounded-3xl bg-white/5 border border-white/5 space-y-5">
                  <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Gelişmiş Simge Parametreleri</h4>
                      <p className="text-[10px] text-text-secondary">Simge kalınlık ve gölge derinliklerini ayarlayın</p>
                    </div>
                    <span className="text-[10px] font-mono text-text-secondary uppercase">{activeIconPack.toUpperCase()} Pack</span>
                  </div>

                  {/* Settings controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Size and Stroke */}
                    <div className="space-y-4">
                      {/* Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-white font-bold">
                          <span>Simge Boyutu (Size)</span>
                          <span className="font-mono">{iconSettings.size}px</span>
                        </div>
                        <input 
                          type="range" min="14" max="32" value={iconSettings.size}
                          onChange={(e) => updateIconSettings({ size: Number(e.target.value) })}
                          className="w-full h-1 bg-black/40 rounded-lg outline-none accent-focus-neon"
                        />
                      </div>

                      {/* Stroke Width */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-white font-bold">
                          <span>Çizgi Kalınlığı (Stroke Width)</span>
                          <span className="font-mono">{iconSettings.strokeWidth}px</span>
                        </div>
                        <input 
                          type="range" min="1" max="3" step="0.5" value={iconSettings.strokeWidth}
                          onChange={(e) => updateIconSettings({ strokeWidth: Number(e.target.value) })}
                          className="w-full h-1 bg-black/40 rounded-lg outline-none accent-focus-neon"
                        />
                      </div>
                    </div>

                    {/* Corner Radius & Opacity */}
                    <div className="space-y-4">
                      {/* Corner Radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-white font-bold">
                          <span>Köşe Kavisi (Corner Radius)</span>
                          <span className="font-mono">{iconSettings.cornerRadius}px</span>
                        </div>
                        <input 
                          type="range" min="0" max="16" value={iconSettings.cornerRadius}
                          onChange={(e) => updateIconSettings({ cornerRadius: Number(e.target.value) })}
                          className="w-full h-1 bg-black/40 rounded-lg outline-none accent-focus-neon"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-white font-bold">
                          <span>Geçirgenlik (Opacity)</span>
                          <span className="font-mono">{iconSettings.opacity}%</span>
                        </div>
                        <input 
                          type="range" min="20" max="100" value={iconSettings.opacity}
                          onChange={(e) => updateIconSettings({ opacity: Number(e.target.value) })}
                          className="w-full h-1 bg-black/40 rounded-lg outline-none accent-focus-neon"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Icon Token Previews Grid */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-mono text-text-secondary uppercase block">Simge Jeton Önizleme Listesi</span>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                      {[
                        { token: 'navigation', icon: 'Home', label: 'Ana Sayfa' },
                        { token: 'toolbar', icon: 'Wand2', label: 'Sihirbaz' },
                        { token: 'settings', icon: 'Settings', label: 'Ayarlar' },
                        { token: 'notifications', icon: 'Bell', label: 'Bildirim' },
                        { token: 'charts', icon: 'TrendingUp', label: 'Grafik' },
                        { token: 'finance', icon: 'DollarSign', label: 'Finans' },
                        { token: 'profile', icon: 'User', label: 'Profil' }
                      ].map(stop => (
                        <div key={stop.token} className="flex flex-col items-center gap-1.5 text-center">
                          {renderIconPreview(stop.icon)}
                          <span className="text-[9px] text-text-secondary font-black tracking-tighter truncate w-full">{stop.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
