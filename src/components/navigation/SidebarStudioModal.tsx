import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  Eye,
  Layers,
  Sparkles,
  Shield,
  Palette,
  Maximize2,
  Minimize2,
  EyeOff,
  Star,
  Lock,
  Unlock,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Command,
  LayoutGrid,
  Info,
  Settings,
  HelpCircle,
  Undo2,
  Redo2,
  Download,
  Upload,
  Activity,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import {
  FocusLightColor,
  FocusLightIntensity,
  FocusLightSpeed,
  GlassPreset,
  GlassQuality,
  NavMode,
  NavigationDensity,
  SecondaryPlacement,
  SecurityLevel,
  SelfTestResult,
  SidebarPosition,
  SmartnessLevel,
} from '../../types/navigation';
import { GLASS_PRESETS } from '../../utils/navigationDefaults';
import { getLiquidGlassStyle } from './LiquidGlassLayer';
import { RotatingFocusBorder } from './RotatingFocusBorder';

type StudioTab =
  | 'modes'
  | 'layout'
  | 'glass'
  | 'modules'
  | 'appearance'
  | 'security'
  | 'profiles'
  | 'shortcuts'
  | 'diagnostics';

export const SidebarStudioModal: React.FC = () => {
  const {
    isStudioOpen,
    closeStudio,
    preferences,
    draftPreferences,
    savedPreferences,
    isDirty,
    saveStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    setApplyMode,
    applyDraft,
    discardDraft,
    setNavMode,
    setSmartnessLevel,
    setPosition,
    setSecondaryPlacement,
    setLayoutConfig,
    setAutoHideConfig,
    setInteractionConfig,
    setAppearanceConfig,
    setAnimationConfig,
    setGlassConfig,
    setGlassPreset,
    setFocusLightConfig,
    toggleModuleVisible,
    toggleModulePinned,
    setModuleSecurityLevel,
    moveModule,
    togglePageFavorite,
    togglePageVisible,
    setPageSecurityLevel,
    movePage,
    setSecurityPin,
    allProfiles,
    loadProfile,
    saveCurrentProfile,
    deleteCustomProfile,
    resetLayout,
    resetGlass,
    resetModules,
    resetAll,
    exportConfigJson,
    importConfigJson,
    runSelfTest,
  } = useNavigation();

  const [activeTab, setActiveTab] = useState<StudioTab>('modes');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('mainmenu');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [pinInput, setPinInput] = useState(draftPreferences.securityPin || '1234');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Import / Export State
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string }>({});

  // Self Test Results
  const [testResults, setTestResults] = useState<SelfTestResult[]>([]);

  if (!isStudioOpen) return null;

  const currentConfig = draftPreferences;
  const glassStyle = getLiquidGlassStyle(currentConfig.glassConfig);

  const tabs: Array<{ id: StudioTab; label: string; icon: any }> = [
    { id: 'modes', label: 'Davranış & Modlar', icon: Layers },
    { id: 'layout', label: 'Düzen & Konum', icon: LayoutGrid },
    { id: 'glass', label: 'Liquid Glass', icon: Palette },
    { id: 'modules', label: 'Modüller & Sayfalar', icon: Eye },
    { id: 'appearance', label: 'Görünüm & Yoğunluk', icon: Settings },
    { id: 'security', label: 'Güvenlik & PIN', icon: Shield },
    { id: 'profiles', label: 'Profiller', icon: Sparkles },
    { id: 'shortcuts', label: 'Kısayollar', icon: Command },
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
          onClick={closeStudio}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Main Shell */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl h-[92vh] max-h-[880px] rounded-3xl bg-neutral-950/95 border border-white/15 shadow-2xl flex flex-col overflow-hidden text-neutral-200"
        >
          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 border-b border-white/10 shrink-0 bg-neutral-900/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-focus-main/20 border border-focus-neon/30 flex items-center justify-center text-focus-neon shadow-sm shrink-0">
                <Sliders size={18} />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-white tracking-tight flex items-center gap-2">
                  Navigation & Sidebar Studio
                  <span className="text-[10px] font-mono uppercase bg-focus-neon/15 text-focus-neon px-2 py-0.5 rounded-full border border-focus-neon/30">
                    Engine v4.0
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  ApexOS çok modlu adaptif navigasyon ve cam yüzey kontrol merkezi
                </p>
              </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Apply Mode Switcher */}
              <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setApplyMode('live')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
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
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
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
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
                  title="Geri Al (Undo)"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
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
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all"
                  >
                    <Save size={13} />
                    <span>Uygula</span>
                  </button>
                  <button
                    onClick={discardDraft}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
                  >
                    Vazgeç
                  </button>
                </div>
              )}

              {/* Import / Export JSON */}
              <button
                onClick={handleExport}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
                title="Yapılandırmayı JSON olarak Aktar / Yükle"
              >
                <Download size={14} />
              </button>

              {/* Reset Menu */}
              <button
                onClick={resetAll}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                title="Fabrika ayarlarına dön"
              >
                <RotateCcw size={13} />
                <span>Sıfırla</span>
              </button>

              <button
                onClick={closeStudio}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Content with Live Preview and Tab Options */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left/Main Column: Tabs + Tab Content */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/10 overflow-hidden">
              {/* Tab Navigation Pill Bar */}
              <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/5 overflow-x-auto bg-neutral-900/40 shrink-0 scrollbar-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
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
                {/* 1. MODES & BEHAVIOR */}
                {activeTab === 'modes' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Navigasyon Modu (NavMode)</h3>
                      <p className="text-xs text-neutral-400 mb-3">
                        Ekran düzeni, odaklanma ihtiyacı ve çalışma alışkanlıklarınıza uygun modu seçin.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          {
                            id: 'expanded',
                            label: 'Genişletilmiş (Expanded)',
                            desc: 'S1 Rail + S2 Panel yan yana tam görünür.',
                            icon: Maximize2,
                          },
                          {
                            id: 'compact',
                            label: 'Kompakt (Compact)',
                            desc: 'İki sütun da daraltılmış mini simge modunda.',
                            icon: Minimize2,
                          },
                          {
                            id: 'autohide',
                            label: 'Otomatik Gizle (Auto-Hide)',
                            desc: 'Kullanılmadığında daralır, hover ile açılır.',
                            icon: EyeOff,
                          },
                          {
                            id: 'focus',
                            label: 'Ultra Focus Mode',
                            desc: 'Tamamen gizlenir, kenar tetikleyici ile çağrılır.',
                            icon: Sparkles,
                          },
                        ].map((m) => {
                          const IconComp = m.icon;
                          const isActive = currentConfig.navMode === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setNavMode(m.id as NavMode)}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-focus-main/20 border-focus-neon text-white shadow-lg'
                                  : 'bg-neutral-900/40 border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <IconComp
                                  size={18}
                                  className={isActive ? 'text-focus-neon' : 'text-neutral-400'}
                                />
                                {isActive && (
                                  <span className="w-2 h-2 rounded-full bg-focus-neon shadow-[0_0_8px_#00E5FF]" />
                                )}
                              </div>
                              <div className="text-xs font-bold text-white mb-1">{m.label}</div>
                              <div className="text-[11px] text-neutral-400 leading-tight">{m.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Auto-Hide & Interaction Controls */}
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                        Etkileşim & Otomatik Gizleme İnce Ayarları
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">Hover Geçici Genişletme</span>
                            <input
                              type="checkbox"
                              checked={currentConfig.interaction.tempExpandOnHover}
                              onChange={(e) => setInteractionConfig({ tempExpandOnHover: e.target.checked })}
                              className="w-4 h-4 accent-focus-neon rounded cursor-pointer"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            Kompakt veya Auto-Hide modundayken fare S1 üzerine geldiğinde paneli geçici açar.
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">Gözlemçi Kilit Durumu</span>
                            <input
                              type="checkbox"
                              checked={currentConfig.interaction.isLocked}
                              onChange={(e) => setInteractionConfig({ isLocked: e.target.checked })}
                              className="w-4 h-4 accent-focus-neon rounded cursor-pointer"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            Kilitleme aktifken auto-collapse zamanlayıcıları askıya alınır.
                          </p>
                        </div>
                      </div>

                      {/* Auto Hide Idle Delay Slider */}
                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
                          <span>Otomatik Kapanma Bekleme Süresi (Idle Delay)</span>
                          <span className="font-mono text-focus-neon font-bold">
                            {currentConfig.autoHide.hideDelay} ms
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1000}
                          max={10000}
                          step={500}
                          value={currentConfig.autoHide.hideDelay}
                          onChange={(e) => setAutoHideConfig({ hideDelay: Number(e.target.value) })}
                          className="w-full accent-focus-neon cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* FOCUS MODE ROTATING LIGHT CONFIGURATION */}
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-focus-neon flex items-center gap-1.5">
                            <Sparkles size={14} />
                            Focus Mode Dönen Işık Efekti (Rotating Border Light)
                          </h4>
                          <p className="text-[11px] text-neutral-400">
                            Focus durumundayken ve Focus butonunda kartın etrafında dönen ışığın rengini, hızını ve yoğunluğunu özelleştirin.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Light Color Chip Picker */}
                        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
                          <label className="text-xs font-bold text-white block">Işık Rengi (Light Color)</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'cyan', label: 'Cyan', colorHex: '#00E5FF' },
                              { id: 'emerald', label: 'Zümrüt', colorHex: '#10B981' },
                              { id: 'purple', label: 'Mor', colorHex: '#A855F7' },
                              { id: 'amber', label: 'Amber', colorHex: '#F59E0B' },
                              { id: 'white', label: 'Beyaz', colorHex: '#FFFFFF' },
                              { id: 'rose', label: 'Gül', colorHex: '#F43F5E' },
                              { id: 'rainbow', label: 'Gökkuşağı', colorHex: 'linear-gradient(45deg, #00E5FF, #A855F7, #F43F5E)' },
                            ].map((c) => {
                              const isActive = (currentConfig.focusLightConfig?.color || 'cyan') === c.id;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => setFocusLightConfig({ color: c.id as FocusLightColor })}
                                  className={`p-2 rounded-xl text-[10px] font-semibold border flex flex-col items-center gap-1 transition-all ${
                                    isActive
                                      ? 'border-focus-neon bg-white/15 text-white shadow-md'
                                      : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  <span
                                    className="w-4 h-4 rounded-full shadow-inner border border-white/30"
                                    style={{ background: c.colorHex }}
                                  />
                                  <span>{c.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Animation Speed */}
                        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
                          <label className="text-xs font-bold text-white block">Animasyon Hızı (Speed)</label>
                          <div className="space-y-2">
                            {[
                              { id: 'fast', label: '⚡ Hızlı (2.2s)' },
                              { id: 'normal', label: '✨ Standart (4.5s)' },
                              { id: 'slow', label: '🌙 Yavaş (7.5s)' },
                            ].map((s) => {
                              const isActive = (currentConfig.focusLightConfig?.speed || 'normal') === s.id;
                              return (
                                <button
                                  key={s.id}
                                  onClick={() => setFocusLightConfig({ speed: s.id as FocusLightSpeed })}
                                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                                    isActive
                                      ? 'bg-focus-main text-white border-focus-neon shadow-md'
                                      : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                                  }`}
                                >
                                  {s.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. Effect Capacity & Live Preview Box */}
                        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3 flex flex-col justify-between">
                          <div>
                            <label className="text-xs font-bold text-white block mb-2">Efekt Kapasitesi / Yoğunluk</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { id: 'soft', label: 'Yumuşak' },
                                { id: 'vivid', label: 'Canlı' },
                                { id: 'beam', label: 'Lazer' },
                              ].map((i) => {
                                const isActive = (currentConfig.focusLightConfig?.intensity || 'vivid') === i.id;
                                return (
                                  <button
                                    key={i.id}
                                    onClick={() => setFocusLightConfig({ intensity: i.id as FocusLightIntensity })}
                                    className={`py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                                      isActive
                                        ? 'bg-focus-main text-white border-focus-neon shadow-sm'
                                        : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                                    }`}
                                  >
                                    {i.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Live Preview Box */}
                          <div className="pt-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                              Canlı Dönen Işık Önizlemesi
                            </label>
                            <RotatingFocusBorder
                              color={currentConfig.focusLightConfig?.color || 'cyan'}
                              speed={currentConfig.focusLightConfig?.speed || 'normal'}
                              intensity={currentConfig.focusLightConfig?.intensity || 'vivid'}
                              enabled={true}
                              borderRadius={14}
                            >
                              <div className="p-3 bg-neutral-950/90 rounded-[12px] flex items-center justify-between backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                  <Sparkles size={16} className="text-focus-neon animate-pulse" />
                                  <span className="text-xs font-bold text-white">Focus Mode Active</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400">360° Beam</span>
                              </div>
                            </RotatingFocusBorder>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. LAYOUT & POSITION */}
                {activeTab === 'layout' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">Boyutlandırma & Konumlandırma</h3>
                        <p className="text-xs text-neutral-400">
                          S1 (Rail) ve S2 (Panel) piksel genişlikleri, boşluklar ve konum tercihleri
                        </p>
                      </div>
                      <button
                        onClick={resetLayout}
                        className="text-xs text-neutral-400 hover:text-white underline flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Düzene Özel Sıfırla
                      </button>
                    </div>

                    {/* Width Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                        <div className="flex justify-between text-xs font-medium text-neutral-300">
                          <span>S1 Primary Rail Genişliği</span>
                          <span className="font-mono text-focus-neon font-bold">
                            {currentConfig.layout.primaryWidth} px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={48}
                          max={96}
                          value={currentConfig.layout.primaryWidth}
                          onChange={(e) => setLayoutConfig({ primaryWidth: Number(e.target.value) })}
                          className="w-full accent-focus-neon cursor-pointer"
                        />
                      </div>

                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                        <div className="flex justify-between text-xs font-medium text-neutral-300">
                          <span>S2 Secondary Panel Genişliği</span>
                          <span className="font-mono text-focus-neon font-bold">
                            {currentConfig.layout.secondaryWidth} px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={180}
                          max={360}
                          value={currentConfig.layout.secondaryWidth}
                          onChange={(e) => setLayoutConfig({ secondaryWidth: Number(e.target.value) })}
                          className="w-full accent-focus-neon cursor-pointer"
                        />
                      </div>

                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                        <div className="flex justify-between text-xs font-medium text-neutral-300">
                          <span>S1 & S2 Arası Boşluk (Gap)</span>
                          <span className="font-mono text-focus-neon font-bold">
                            {currentConfig.layout.gap} px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={24}
                          value={currentConfig.layout.gap}
                          onChange={(e) => setLayoutConfig({ gap: Number(e.target.value) })}
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
                    </div>

                    {/* Position & Secondary Placement */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
                        <label className="text-xs font-bold text-white block">Sidebar / Dock Ekran Konumu</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'left', label: '⬅️ Sol (Left)' },
                            { id: 'right', label: '➡️ Sağ (Right)' },
                            { id: 'top', label: '⬆️ Üst Bar (Top)' },
                            { id: 'dock', label: '🍎 macOS Apple Dock' },
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setPosition(p.id as SidebarPosition)}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                                currentConfig.position === p.id
                                  ? 'bg-focus-main text-white border-focus-neon shadow-md'
                                  : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
                        <label className="text-xs font-bold text-white block">S2 Panel Yerleşimi</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['attached', 'floating', 'overlay'] as SecondaryPlacement[]).map((pl) => (
                            <button
                              key={pl}
                              onClick={() => setSecondaryPlacement(pl)}
                              className={`py-2 rounded-xl text-[11px] font-semibold capitalize border transition-colors ${
                                currentConfig.secondaryPlacement === pl
                                  ? 'bg-focus-main text-white border-focus-neon'
                                  : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {pl}
                            </button>
                          ))}
                        </div>
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
                          Buzlu cam, optik kırılma, parıltı ve ışık tepkimesi parametreleri
                        </p>
                      </div>
                      <button
                        onClick={resetGlass}
                        className="text-xs text-neutral-400 hover:text-white underline flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Sıfırla
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
                              className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
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

                {/* 4. MODULES & PAGES MANAGEMENT + ORDERING */}
                {activeTab === 'modules' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">Modül ve Sayfa Yönetimi</h3>
                        <p className="text-xs text-neutral-400">
                          Modülleri ve alt sayfaları yukarı/aşağı taşıyarak sıralayın, gizleyin veya kilitleyin.
                        </p>
                      </div>
                      <button
                        onClick={resetModules}
                        className="text-xs text-neutral-400 hover:text-white underline flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Modülleri Sıfırla
                      </button>
                    </div>

                    <div className="space-y-3">
                      {currentConfig.moduleOrder.map((modId, index) => {
                        const mod = currentConfig.modules[modId];
                        if (!mod) return null;
                        const isExpanded = expandedModuleId === mod.id;

                        return (
                          <div
                            key={mod.id}
                            className="rounded-2xl bg-neutral-900/50 border border-white/10 overflow-hidden transition-all"
                          >
                            <div className="p-3.5 flex items-center justify-between bg-white/[0.02]">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveModule(mod.id, 'up')}
                                    disabled={index === 0}
                                    className="p-1 text-neutral-500 hover:text-white disabled:opacity-20"
                                    title="Yukarı Taşı"
                                  >
                                    <ArrowUp size={13} />
                                  </button>
                                  <button
                                    onClick={() => moveModule(mod.id, 'down')}
                                    disabled={index === currentConfig.moduleOrder.length - 1}
                                    className="p-1 text-neutral-500 hover:text-white disabled:opacity-20"
                                    title="Aşağı Taşı"
                                  >
                                    <ArrowDown size={13} />
                                  </button>
                                </div>

                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: mod.color }}
                                />
                                <span className="text-xs font-bold text-white truncate">{mod.title}</span>
                                <span className="text-[10px] text-neutral-400">({mod.subPages?.length || 0} sayfa)</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleModuleVisible(mod.id)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                    mod.visible
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  }`}
                                >
                                  {mod.visible ? 'Görünür' : 'Gizli'}
                                </button>

                                <button
                                  onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                                  className="p-1 text-neutral-400 hover:text-white"
                                >
                                  <ChevronDown
                                    size={16}
                                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Subpages Drawer */}
                            {isExpanded && mod.subPages && (
                              <div className="p-3 border-t border-white/5 space-y-2 bg-black/40">
                                {mod.subPages.map((page, pIdx) => (
                                  <div
                                    key={page.id}
                                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-300"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="flex items-center gap-0.5">
                                        <button
                                          onClick={() => movePage(mod.id, page.id, 'up')}
                                          disabled={pIdx === 0}
                                          className="p-0.5 text-neutral-500 hover:text-white disabled:opacity-20"
                                        >
                                          <ArrowUp size={11} />
                                        </button>
                                        <button
                                          onClick={() => movePage(mod.id, page.id, 'down')}
                                          disabled={pIdx === mod.subPages.length - 1}
                                          className="p-0.5 text-neutral-500 hover:text-white disabled:opacity-20"
                                        >
                                          <ArrowDown size={11} />
                                        </button>
                                      </div>
                                      <span className="truncate">{page.label}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          setPageSecurityLevel(
                                            mod.id,
                                            page.id,
                                            page.securityLevel === 'protected' ? 'none' : 'protected'
                                          )
                                        }
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 transition-all ${
                                          page.securityLevel === 'protected'
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                                            : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                                        }`}
                                        title="Bu sayfaya özel PIN şifresi koy / kaldır"
                                      >
                                        {page.securityLevel === 'protected' ? (
                                          <Lock size={10} className="text-rose-400" />
                                        ) : (
                                          <Unlock size={10} />
                                        )}
                                        <span>{page.securityLevel === 'protected' ? 'Şifreli' : 'Serbest'}</span>
                                      </button>
                                      <button
                                        onClick={() => togglePageFavorite(page.id)}
                                        className={`p-1 rounded ${page.isFavorite ? 'text-amber-400' : 'text-neutral-500'}`}
                                        title="Favorilere Ekle/Çıkar"
                                      >
                                        <Star size={13} fill={page.isFavorite ? 'currentColor' : 'none'} />
                                      </button>
                                      <button
                                        onClick={() => togglePageVisible(mod.id, page.id)}
                                        className={`px-2 py-0.5 rounded text-[10px] ${
                                          page.visible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                        }`}
                                      >
                                        {page.visible ? 'Açık' : 'Kapalı'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. APPEARANCE & DENSITY */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Görünüm, Simge & Yoğunluk</h3>
                      <p className="text-xs text-neutral-400 mb-3">
                        Navigasyon simge boyutları, liste yoğunluğu ve görünürlük öğeleri
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-2">
                          <div className="flex justify-between text-xs font-medium text-neutral-300">
                            <span>Simge Boyutu (Icon Size)</span>
                            <span className="font-mono text-focus-neon font-bold">
                              {currentConfig.appearance.iconSize} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min={16}
                            max={24}
                            value={currentConfig.appearance.iconSize}
                            onChange={(e) => setAppearanceConfig({ iconSize: Number(e.target.value) })}
                            className="w-full accent-focus-neon cursor-pointer"
                          />
                        </div>

                        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
                          <label className="text-xs font-bold text-white block">Liste Yoğunluğu (Density)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['compact', 'comfortable', 'spacious'] as NavigationDensity[]).map((d) => (
                              <button
                                key={d}
                                onClick={() => setAppearanceConfig({ density: d })}
                                className={`py-2 rounded-xl text-[11px] font-semibold capitalize border transition-colors ${
                                  currentConfig.appearance.density === d
                                    ? 'bg-focus-main text-white border-focus-neon'
                                    : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between">
                          <span className="text-xs font-medium text-white">Arama Çubuğu Göster</span>
                          <input
                            type="checkbox"
                            checked={currentConfig.appearance.showSearch}
                            onChange={(e) => setAppearanceConfig({ showSearch: e.target.checked })}
                            className="w-4 h-4 accent-focus-neon cursor-pointer"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between">
                          <span className="text-xs font-medium text-white">S2 Üst Başlık Göster</span>
                          <input
                            type="checkbox"
                            checked={currentConfig.appearance.showHeader}
                            onChange={(e) => setAppearanceConfig({ showHeader: e.target.checked })}
                            className="w-4 h-4 accent-focus-neon cursor-pointer"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between">
                          <span className="text-xs font-medium text-white">S2 Alt Bilgi Göster</span>
                          <input
                            type="checkbox"
                            checked={currentConfig.appearance.showFooter}
                            onChange={(e) => setAppearanceConfig({ showFooter: e.target.checked })}
                            className="w-4 h-4 accent-focus-neon cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. SECURITY */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Güvenlik & PIN Şifre Koruması</h3>
                      <p className="text-xs text-neutral-400 mb-3">
                        İstediğiniz modül veya alt sayfaya PIN kodu ile şifre koruması koyun.
                      </p>

                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block mb-0.5">Genel Güvenlik PIN Kodu</span>
                            <span className="text-[10px] text-neutral-400">Şifreli modül ve sayfalara erişim şifresi (Varsayılan: 1234)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              maxLength={8}
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value)}
                              placeholder="1234"
                              className="w-24 px-3 py-1.5 rounded-xl bg-black/50 border border-white/20 text-center font-mono font-bold text-white text-sm outline-none focus:border-focus-neon"
                            />
                            <button
                              onClick={() => {
                                setSecurityPin(pinInput);
                                setPinSuccess(true);
                                setTimeout(() => setPinSuccess(false), 2000);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-focus-main hover:bg-focus-main/80 text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Kaydet
                            </button>
                          </div>
                        </div>

                        {pinSuccess && (
                          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                            <Check size={14} /> PIN kodu başarıyla güncellendi.
                          </div>
                        )}
                      </div>

                      {/* Sayfa Bazlı Şifre Yönetim Kataloğu */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                            <Lock size={13} className="text-rose-400" /> Sayfa Bazlı Şifre Koruması Listesi
                          </label>
                        </div>

                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
                          {currentConfig.moduleOrder.map((modId) => {
                            const mod = currentConfig.modules[modId];
                            if (!mod) return null;

                            return (
                              <div
                                key={mod.id}
                                className="p-3.5 rounded-2xl bg-neutral-900/50 border border-white/10 space-y-2.5"
                              >
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mod.color }} />
                                    <span className="text-xs font-bold text-white">{mod.title} Modülü</span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setModuleSecurityLevel(
                                        mod.id,
                                        mod.securityLevel === 'protected' ? 'none' : 'protected'
                                      )
                                    }
                                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                      mod.securityLevel === 'protected'
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                        : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                                    }`}
                                  >
                                    Modül Kilidi: {mod.securityLevel === 'protected' ? '🔒 Kilitli' : '🔓 Açık'}
                                  </button>
                                </div>

                                <div className="space-y-1.5 pl-2">
                                  {mod.subPages?.map((page) => {
                                    const isPageProtected = page.securityLevel === 'protected';

                                    return (
                                      <div
                                        key={page.id}
                                        className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/5 text-xs text-neutral-300 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="truncate font-medium">{page.label}</span>
                                          {page.description && (
                                            <span className="text-[10px] text-neutral-500 truncate hidden sm:inline">
                                              ({page.description})
                                            </span>
                                          )}
                                        </div>

                                        <button
                                          onClick={() =>
                                            setPageSecurityLevel(
                                              mod.id,
                                              page.id,
                                              isPageProtected ? 'none' : 'protected'
                                            )
                                          }
                                          className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                            isPageProtected
                                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                                              : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                                          }`}
                                        >
                                          {isPageProtected ? (
                                            <>
                                              <Lock size={12} className="text-rose-400" />
                                              <span>🔒 Şifreli (PIN)</span>
                                            </>
                                          ) : (
                                            <>
                                              <Unlock size={12} />
                                              <span>🔓 Serbest</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. PROFILES */}
                {activeTab === 'profiles' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Sidebar Profilleri</h3>
                      <p className="text-xs text-neutral-400 mb-3">
                        Çalışma alanınıza uygun sidebar düzenini tek tıkla yükleyin veya kendi profilinizi kaydedin.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allProfiles.map((prof) => {
                          const isActive = currentConfig.activeProfileId === prof.id;
                          return (
                            <div
                              key={prof.id}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                isActive
                                  ? 'bg-focus-main/20 border-focus-neon text-white'
                                  : 'bg-neutral-900/40 border-white/10 text-neutral-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-xs font-bold text-white">{prof.name}</div>
                                {prof.isCustom && (
                                  <button
                                    onClick={() => deleteCustomProfile(prof.id)}
                                    className="text-neutral-500 hover:text-rose-400 p-1"
                                    title="Profili Sil"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-400 mb-3">{prof.description}</p>
                              <button
                                onClick={() => loadProfile(prof.id)}
                                className={`w-full py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                                  isActive
                                    ? 'bg-focus-main text-white border-transparent'
                                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
                                }`}
                              >
                                {isActive ? 'Aktif Profil' : 'Profili Uygula'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Save Custom Profile */}
                    <div className="pt-4 border-t border-white/10 p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold text-white">Mevcut Düzeni Yeni Profil Olarak Kaydet</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Profil Adı (örn: Özel Yazılım Düzeni)"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-focus-neon"
                        />
                        <input
                          type="text"
                          placeholder="Kısa açıklama..."
                          value={newProfileDesc}
                          onChange={(e) => setNewProfileDesc(e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-focus-neon"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!newProfileName.trim()) return;
                          saveCurrentProfile(newProfileName, newProfileDesc || 'Kullanıcı özel düzeni');
                          setNewProfileName('');
                          setNewProfileDesc('');
                        }}
                        className="px-4 py-2 rounded-xl bg-focus-main hover:bg-focus-main/80 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Plus size={14} />
                        <span>Profili Kaydet</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 8. SHORTCUTS */}
                {activeTab === 'shortcuts' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white mb-1">Klavye Kısayolları</h3>
                    <p className="text-xs text-neutral-400 mb-3">
                      ApexOS navigasyonunu hızlı klavye tuş kombinasyonlarıyla kontrol edin.
                    </p>

                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { keys: ['Ctrl', 'K'], desc: 'Komut Katmanı & Hızlı Modül Arama' },
                        { keys: ['Ctrl', 'B'], desc: 'Hızlı Navigasyon Modu Geçişi (Expanded ↔ Auto-Hide)' },
                        { keys: ['Ctrl', 'Shift', 'B'], desc: 'Kompakt Mod Aç / Kapat' },
                        { keys: ['Ctrl', 'Shift', 'F'], desc: 'Ultra Focus Mode Aç / Kapat' },
                        { keys: ['Esc'], desc: 'Geçici Önizleme, Komut veya Studio Penceresini Kapat' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/50 border border-white/10"
                        >
                          <span className="text-xs text-neutral-300 font-medium">{item.desc}</span>
                          <div className="flex items-center gap-1">
                            {item.keys.map((k, ki) => (
                              <kbd
                                key={ki}
                                className="px-2 py-1 rounded-md bg-white/10 border border-white/20 font-mono text-[11px] font-bold text-white"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. DIAGNOSTICS & SELF TEST */}
                {activeTab === 'diagnostics' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">Otomatik Teşhis & Self-Test Suite</h3>
                        <p className="text-xs text-neutral-400">
                          Sidebar v4 motorunun tüm bileşenlerini ve persistance katmanını test edin.
                        </p>
                      </div>
                      <button
                        onClick={handleRunDiagnostics}
                        className="px-4 py-2 rounded-xl bg-focus-main hover:bg-focus-main/80 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
                      >
                        <Activity size={14} />
                        <span>Testi Çalıştır</span>
                      </button>
                    </div>

                    {testResults.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-neutral-900/40 border border-white/10 text-center text-xs text-neutral-400">
                        Testleri başlatmak için yukarıdaki "Testi Çalıştır" butonuna tıklayın.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {testResults.map((t) => (
                          <div
                            key={t.id}
                            className="p-3 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              {t.status === 'passed' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                              {t.status === 'warning' && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
                              {t.status === 'failed' && <XCircle size={16} className="text-rose-400 shrink-0" />}
                              <div>
                                <div className="text-xs font-bold text-white">{t.name}</div>
                                <div className="text-[11px] text-neutral-400">{t.message}</div>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                                t.status === 'passed'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : t.status === 'warning'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: LIVE PREVIEW CANVAS */}
            <div className="w-full lg:w-80 shrink-0 p-5 bg-black/60 flex flex-col border-t lg:border-t-0 border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={14} className="text-focus-neon" />
                  Canlı Önizleme (Live Preview)
                </span>
                <span className="text-[10px] font-mono text-neutral-400 capitalize">
                  {currentConfig.navMode} Mod
                </span>
              </div>

              {/* Simulated OS Screen Box */}
              <div className="flex-1 min-h-[300px] rounded-2xl bg-neutral-950 border border-white/15 p-3 flex gap-2 relative overflow-hidden shadow-inner">
                {/* Simulated S1 (Rail) */}
                <div
                  style={{
                    width: `${Math.round((currentConfig.layout?.primaryWidth || 58) * 0.7)}px`,
                    ...glassStyle,
                  }}
                  className="h-full flex flex-col items-center py-2 gap-2 shrink-0 transition-all duration-300"
                >
                  <div className="w-5 h-5 rounded-md bg-focus-main flex items-center justify-center text-[10px] font-bold text-white">
                    A
                  </div>
                  <div className="w-4 h-0.5 bg-white/20 my-1" />
                  {['P', 'W', 'M', 'L', 'I', 'F'].map((k, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${
                        i === 0 ? 'bg-focus-neon/20 text-focus-neon border border-focus-neon/30' : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {k}
                    </div>
                  ))}
                </div>

                {/* Simulated S2 (Panel) */}
                {currentConfig.navMode !== 'focus' && (
                  <div
                    style={{
                      width: currentConfig.navMode === 'compact' ? '44px' : `${Math.round((currentConfig.layout?.secondaryWidth || 248) * 0.65)}px`,
                      ...glassStyle,
                    }}
                    className="h-full p-2 flex flex-col gap-1.5 shrink-0 transition-all duration-300 overflow-hidden"
                  >
                    <div className="h-4 rounded bg-white/10 flex items-center px-1.5 text-[8px] font-bold text-neutral-300 truncate">
                      {currentConfig.navMode === 'compact' ? 'S2' : 'ANA MENÜ'}
                    </div>
                    <div className="h-3 rounded bg-white/5" />
                    <div className="h-3 rounded bg-white/5" />
                    <div className="h-3 rounded bg-white/5" />
                  </div>
                )}

                {/* Simulated Content Area */}
                <div className="flex-1 h-full rounded-xl bg-white/[0.02] border border-white/5 p-2 flex flex-col gap-2 min-w-0">
                  <div className="h-5 rounded bg-white/10 w-2/3" />
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <div className="rounded bg-white/5" />
                    <div className="rounded bg-white/5" />
                    <div className="rounded bg-white/5" />
                    <div className="rounded bg-white/5" />
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-neutral-500 text-center leading-tight">
                Status:{' '}
                <span className="font-mono text-emerald-400 uppercase font-bold">{saveStatus}</span> | Mode:{' '}
                <span className="font-mono text-focus-neon font-bold">{currentConfig.applyMode}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* JSON Import / Export Sub-Modal */}
        {showJsonModal && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-white/20 p-5 space-y-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Download size={16} /> JSON Yapılandırma İçe / Dışa Aktar
                </h3>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={12}
                className="w-full p-3 rounded-xl bg-black/80 border border-white/15 font-mono text-xs text-emerald-300 outline-none focus:border-focus-neon"
              />

              {importStatus.message && (
                <div
                  className={`text-xs p-2.5 rounded-xl border ${
                    importStatus.success
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {importStatus.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleImport}
                  className="px-4 py-2 rounded-xl bg-focus-main hover:bg-focus-main/80 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Upload size={14} />
                  <span>JSON'dan İçe Aktar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
