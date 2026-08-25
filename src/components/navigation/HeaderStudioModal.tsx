import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  Eye,
  Sparkles,
  Palette,
  Maximize2,
  Minimize2,
  RotateCcw,
  Check,
  Download,
  Upload,
  Activity,
  ArrowLeft,
  ArrowRight,
  Save,
  Undo2,
  Redo2,
  LayoutGrid,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Gauge,
  Bell,
  Calendar,
  Wand2,
  Home,
  Search,
  Globe,
  Sun,
} from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';
import { GlassPreset, LiquidGlassConfig } from '../../types/navigation';
import { GLASS_PRESETS } from '../../utils/navigationDefaults';
import { getLiquidGlassStyle } from './LiquidGlassLayer';
import { HeaderSelfTestResult } from '../../types/header';

type HeaderStudioTab =
  | 'widgets'
  | 'layout'
  | 'glass'
  | 'appearance'
  | 'profiles'
  | 'diagnostics';

const WIDGET_LABELS: Record<string, { label: string; desc: string; icon: any }> = {
  homeButton: { label: 'Ana Sayfa Butonu', desc: 'Genel bakış sayfasına hızlı dönüş butonu', icon: Home },
  searchBar: { label: 'Arama Çubuğu', desc: 'Tüm sistem ve modüllerde anlık arama', icon: Search },
  mobileLogo: { label: 'Mobil APEX Logo', desc: 'Küçük ekranlarda marka logosu gösterimi', icon: Sparkles },
  environmentalWidget: { label: 'Çevresel Araç', desc: 'Saat, hava durumu ve sistem durumu paneli', icon: Info },
  fpsSelector: { label: 'FPS / Tazeleme Oranı', desc: '120 / 90 / 60 FPS performans seçici', icon: Gauge },
  languageSelector: { label: 'Dil Seçici', desc: 'Çoklu dil destek menüsü', icon: Globe },
  themeToggle: { label: 'Tema Değiştirici', desc: 'Karanlık / Aydınlık mod anahtarı', icon: Sun },
  notifications: { label: 'Bildirimler', desc: 'Anlık sistem ve aktivite bildirimleri', icon: Bell },
  calendar: { label: 'Takvim & Etkinlikler', desc: 'Hızlı takvim ve ajanda popoverı', icon: Calendar },
  wallpaperWizard: { label: 'Duvar Kağıdı Sihirbazı', desc: 'Akıllı tema ve duvar kağıdı üretim paneli', icon: Wand2 },
  headerStudioButton: { label: 'Header Studio Butonu', desc: 'Header ayarları ve canlı stüdyo açma butonu', icon: Sliders },
};

export const HeaderStudioModal: React.FC = () => {
  const {
    isHeaderStudioOpen,
    closeHeaderStudio,
    preferences,
    draftPreferences,
    isDirty,
    undo,
    redo,
    canUndo,
    canRedo,
    setApplyMode,
    applyDraft,
    discardDraft,
    setLayoutConfig,
    setGlassConfig,
    setGlassPreset,
    toggleWidgetVisible,
    moveWidget,
    setAppearanceConfig,
    allProfiles,
    loadProfile,
    saveCurrentProfile,
    deleteCustomProfile,
    resetLayout,
    resetGlass,
    resetWidgets,
    resetAll,
    exportConfigJson,
    importConfigJson,
    runSelfTest,
  } = useHeader();

  const [activeTab, setActiveTab] = useState<HeaderStudioTab>('widgets');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');

  // Import / Export State
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string }>({});

  // Self Test Results
  const [testResults, setTestResults] = useState<HeaderSelfTestResult[]>([]);

  if (!isHeaderStudioOpen) return null;

  const currentConfig = draftPreferences;
  const glassStyle = getLiquidGlassStyle(currentConfig.glassConfig);

  const tabs: Array<{ id: HeaderStudioTab; label: string; icon: any }> = [
    { id: 'widgets', label: 'Bileşenler & Sıralama', icon: Eye },
    { id: 'layout', label: 'Boyut & Marjlar', icon: LayoutGrid },
    { id: 'glass', label: 'Liquid Glass', icon: Palette },
    { id: 'appearance', label: 'Görünüm & Yoğunluk', icon: Sliders },
    { id: 'profiles', label: 'Profiller', icon: Sparkles },
    { id: 'diagnostics', label: 'Self-Test & Teşhis', icon: Activity },
  ];

  const handleExport = () => {
    setJsonText(exportConfigJson());
    setShowJsonModal(true);
    setImportStatus({});
  };

  const handleImport = () => {
    const res = importConfigJson(jsonText);
    setImportStatus(res);
    if (res.success) {
      setTimeout(() => setShowJsonModal(false), 1500);
    }
  };

  const handleRunDiagnostics = () => {
    const res = runSelfTest();
    setTestResults(res);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeHeaderStudio}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Main Shell */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl h-[88vh] max-h-[820px] rounded-3xl bg-neutral-950/95 border border-white/15 shadow-2xl flex flex-col overflow-hidden text-neutral-200"
        >
          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 border-b border-white/10 shrink-0 bg-neutral-900/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-focus-main/20 border border-focus-neon/30 flex items-center justify-center text-focus-neon shadow-sm shrink-0">
                <Sliders size={18} />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-white tracking-tight flex items-center gap-2">
                  Header Studio & Glass Controller
                  <span className="text-[10px] font-mono uppercase bg-focus-neon/15 text-focus-neon px-2 py-0.5 rounded-full border border-focus-neon/30">
                    Engine v4.0
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Üst bar görünümünü, sıvı cam efektini ve araç düzenini kişiselleştirin
                </p>
              </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Apply Mode Switcher */}
              <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setApplyMode('live')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    currentConfig.applyMode === 'live'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Tüm ayarlar anında canlıya yansır"
                >
                  Canlı Uygulama
                </button>
                <button
                  onClick={() => setApplyMode('preview')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    currentConfig.applyMode === 'preview'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Değişiklikler önce Studio'da önizlenir, 'Uygula' deyince kaydedilir"
                >
                  Taslak Önizleme
                </button>
              </div>

              {/* Undo / Redo */}
              <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                  title="Geri Al (Undo)"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                  title="İleri Al (Redo)"
                >
                  <Redo2 size={14} />
                </button>
              </div>

              {/* Apply / Discard for Preview Mode */}
              {currentConfig.applyMode === 'preview' && isDirty && (
                <div className="flex items-center gap-1.5 animate-pulse">
                  <button
                    onClick={applyDraft}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  >
                    <Save size={13} />
                    <span>Uygula</span>
                  </button>
                  <button
                    onClick={discardDraft}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </div>
              )}

              {/* Import / Export JSON */}
              <button
                onClick={handleExport}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                title="Yapılandırmayı JSON olarak Aktar / Yükle"
              >
                <Download size={14} />
              </button>

              {/* Reset Menu */}
              <button
                onClick={resetAll}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Fabrika ayarlarına dön"
              >
                <RotateCcw size={13} />
                <span>Sıfırla</span>
              </button>

              <button
                onClick={closeHeaderStudio}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Content with Tab Options */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation Pill Bar */}
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/5 overflow-x-auto bg-neutral-900/40 shrink-0 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-focus-main text-white shadow-md border border-focus-neon/40'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Tab Panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
              {/* 1. WIDGETS & ORDERING */}
              {activeTab === 'widgets' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Header Araçları & Görünürlük</h3>
                      <p className="text-xs text-neutral-400">
                        Header çubuğunda görünmesini istediğiniz bileşenleri seçin ve sırasını değiştirin.
                      </p>
                    </div>
                    <button
                      onClick={resetWidgets}
                      className="text-xs text-neutral-400 hover:text-white underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Bileşenleri Sıfırla
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentConfig.widgetOrder.map((wId, idx) => {
                      const widgetInfo = WIDGET_LABELS[wId] || {
                        label: wId,
                        desc: 'Özel bileşen',
                        icon: Sliders,
                      };
                      const IconComp = widgetInfo.icon;
                      const isVisible = currentConfig.widgets[wId] ?? true;

                      return (
                        <div
                          key={wId}
                          className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                            isVisible
                              ? 'bg-neutral-900/60 border-white/10 text-white'
                              : 'bg-neutral-950/40 border-white/5 text-neutral-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveWidget(wId, 'left')}
                                disabled={idx === 0}
                                className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Sola Taşı"
                              >
                                <ArrowLeft size={14} />
                              </button>
                              <button
                                onClick={() => moveWidget(wId, 'right')}
                                disabled={idx === currentConfig.widgetOrder.length - 1}
                                className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Sağa Taşı"
                              >
                                <ArrowRight size={14} />
                              </button>
                            </div>

                            <div className="w-8 h-8 rounded-xl bg-focus-main/15 border border-focus-neon/30 flex items-center justify-center text-focus-neon shrink-0">
                              <IconComp size={16} />
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{widgetInfo.label}</span>
                                <span className="font-mono text-[10px] text-neutral-500">#{idx + 1}</span>
                              </div>
                              <div className="text-[11px] text-neutral-400 truncate">{widgetInfo.desc}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleWidgetVisible(wId)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isVisible
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {isVisible ? 'Görünür' : 'Gizli'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. LAYOUT & MARGINS */}
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Geometri & Boyutlandırma</h3>
                      <p className="text-xs text-neutral-400">
                        Header alanının yüksekliği, dış marjı, köşe kavisi ve iç boşluk ayarları
                      </p>
                    </div>
                    <button
                      onClick={resetLayout}
                      className="text-xs text-neutral-400 hover:text-white underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Geometriyi Sıfırla
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Header Yüksekliği (Height)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.layout.height} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={44}
                        max={80}
                        value={currentConfig.layout.height}
                        onChange={(e) => setLayoutConfig({ height: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Dış Marj (Outer Margin)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.layout.outerMargin} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={24}
                        value={currentConfig.layout.outerMargin}
                        onChange={(e) => setLayoutConfig({ outerMargin: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Kavis Yarıçapı (Corner Radius)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.layout.cornerRadius} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={32}
                        value={currentConfig.layout.cornerRadius}
                        onChange={(e) => setLayoutConfig({ cornerRadius: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Yatay İç Boşluk (Padding X)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.layout.paddingX} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={32}
                        value={currentConfig.layout.paddingX}
                        onChange={(e) => setLayoutConfig({ paddingX: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. LIQUID GLASS ENGINE */}
              {activeTab === 'glass' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Liquid Glass Cam Yüzey Motoru</h3>
                      <p className="text-xs text-neutral-400">
                        Optik kırılma, buğulama, parıltı ve cam şeffaflığı parametreleri
                      </p>
                    </div>
                    <button
                      onClick={resetGlass}
                      className="text-xs text-neutral-400 hover:text-white underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Camı Sıfırla
                    </button>
                  </div>

                  {/* Presets Grid */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 mb-2 block">Hazır Cam Presetleri</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {Object.keys(GLASS_PRESETS).map((pKey) => {
                        const isSel = currentConfig.glassConfig.preset === pKey;
                        return (
                          <button
                            key={pKey}
                            onClick={() => setGlassPreset(pKey as GlassPreset)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                              isSel
                                ? 'bg-focus-main text-white border-focus-neon shadow-md'
                                : 'bg-neutral-900/40 text-neutral-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {pKey}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Bulanıklık (Blur)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.glassConfig.blur} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={80}
                        value={currentConfig.glassConfig.blur}
                        onChange={(e) => setGlassConfig({ blur: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Opaklık (Opacity)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.glassConfig.opacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={currentConfig.glassConfig.opacity}
                        onChange={(e) => setGlassConfig({ opacity: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Kenarlık Opaklığı (Border Opacity)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.glassConfig.borderOpacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={currentConfig.glassConfig.borderOpacity}
                        onChange={(e) => setGlassConfig({ borderOpacity: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Kenarlık Genişliği (Border Width)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.glassConfig.borderWidth ?? 1} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={4}
                        step={0.5}
                        value={currentConfig.glassConfig.borderWidth ?? 1}
                        onChange={(e) => setGlassConfig({ borderWidth: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Renk Doygunluğu (Saturation)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.glassConfig.saturation}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={220}
                        value={currentConfig.glassConfig.saturation}
                        onChange={(e) => setGlassConfig({ saturation: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Cam Parlaklığı (Brightness)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.glassConfig.brightness ?? 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={70}
                        max={160}
                        value={currentConfig.glassConfig.brightness ?? 100}
                        onChange={(e) => setGlassConfig({ brightness: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. APPEARANCE & DENSITY */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Görünüm & Yoğunluk</h3>
                    <p className="text-xs text-neutral-400">
                      Header içindeki buton boyutları, ikon boyutu ve ipucu balonları
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
                      <label className="text-xs font-bold text-white block">Düzen Yoğunluğu (Density)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'compact', label: 'Kompakt' },
                          { id: 'comfortable', label: 'Rahat' },
                          { id: 'spacious', label: 'Geniş' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            onClick={() => setAppearanceConfig({ density: d.id as any })}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              currentConfig.appearance.density === d.id
                                ? 'bg-focus-main text-white border-focus-neon shadow-md'
                                : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>İkon Boyutu (Icon Size)</span>
                        <span className="font-mono text-focus-neon font-bold">
                          {currentConfig.appearance.iconSize} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={14}
                        max={22}
                        value={currentConfig.appearance.iconSize}
                        onChange={(e) => setAppearanceConfig({ iconSize: Number(e.target.value) })}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">Açıklama Balonları (Tooltips)</span>
                        <span className="text-[11px] text-neutral-400">Butonlar üzerine gelindiğinde açıklama gösterir</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={currentConfig.appearance.tooltipsEnabled}
                        onChange={(e) => setAppearanceConfig({ tooltipsEnabled: e.target.checked })}
                        className="w-4 h-4 accent-focus-neon rounded cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">Mobil Marka Logosu</span>
                        <span className="text-[11px] text-neutral-400">Mobil ekranlarda APEX OS logosunu gösterir</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={currentConfig.appearance.showMobileLogo}
                        onChange={(e) => setAppearanceConfig({ showMobileLogo: e.target.checked })}
                        className="w-4 h-4 accent-focus-neon rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. PROFILES */}
              {activeTab === 'profiles' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Header Profilleri & Temalar</h3>
                    <p className="text-xs text-neutral-400">
                      Hazır profil şablonlarını yükleyin veya kendi özelleştirilmiş header profilinizi kaydedin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allProfiles.map((p) => {
                      const isActive = currentConfig.activeProfileId === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isActive
                              ? 'bg-focus-main/20 border-focus-neon text-white shadow-lg'
                              : 'bg-neutral-900/40 border-white/10 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-focus-neon">
                                <Sparkles size={14} />
                              </div>
                              <span className="text-xs font-bold text-white">{p.name}</span>
                            </div>
                            {p.isCustom && (
                              <button
                                onClick={() => deleteCustomProfile(p.id)}
                                className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Profili Sil"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 mb-3">{p.description}</p>
                          <button
                            onClick={() => loadProfile(p.id)}
                            disabled={isActive}
                            className={`w-full py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 cursor-default'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200'
                            }`}
                          >
                            {isActive ? 'Aktif Profil' : 'Profili Yükle'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Create New Custom Profile */}
                  <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Plus size={14} className="text-focus-neon" />
                      Mevcut Ayarları Yeni Profil Olarak Kaydet
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Profil Adı (ör. Gece Modu)"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-focus-neon"
                      />
                      <input
                        type="text"
                        placeholder="Profil Açıklaması"
                        value={newProfileDesc}
                        onChange={(e) => setNewProfileDesc(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-focus-neon"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (newProfileName.trim()) {
                          saveCurrentProfile(newProfileName, newProfileDesc);
                          setNewProfileName('');
                          setNewProfileDesc('');
                        }
                      }}
                      disabled={!newProfileName.trim()}
                      className="px-4 py-2 rounded-xl bg-focus-main hover:bg-focus-main/80 text-white text-xs font-bold disabled:opacity-40 transition-all cursor-pointer"
                    >
                      Profili Kaydet
                    </button>
                  </div>
                </div>
              )}

              {/* 6. DIAGNOSTICS & SELF TEST */}
              {activeTab === 'diagnostics' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Header Self-Test & Teşhis</h3>
                    <p className="text-xs text-neutral-400">
                      Header motoru, bileşen durumları ve cam işleme performans testi.
                    </p>
                  </div>

                  <button
                    onClick={handleRunDiagnostics}
                    className="px-4 py-2 rounded-xl bg-focus-main hover:bg-focus-main/80 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Activity size={15} />
                    <span>Teşhis Testini Çalıştır</span>
                  </button>

                  {testResults.length > 0 && (
                    <div className="space-y-2">
                      {testResults.map((res) => (
                        <div
                          key={res.id}
                          className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {res.status === 'passed' && <CheckCircle2 size={18} className="text-emerald-400" />}
                            {res.status === 'warning' && <AlertTriangle size={18} className="text-amber-400" />}
                            {res.status === 'failed' && <XCircle size={18} className="text-rose-400" />}
                            <div>
                              <div className="text-xs font-bold text-white">{res.name}</div>
                              <div className="text-[11px] text-neutral-400">{res.message}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                            {res.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* JSON Import/Export Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-neutral-950 border border-white/15 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Header Yapılandırması (JSON)</h3>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-64 p-3 rounded-2xl bg-neutral-900 border border-white/10 font-mono text-xs text-neutral-200 focus:outline-none focus:border-focus-neon"
            />
            {importStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  importStatus.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {importStatus.message}
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleImport}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold"
              >
                İçe Aktar (Import)
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
