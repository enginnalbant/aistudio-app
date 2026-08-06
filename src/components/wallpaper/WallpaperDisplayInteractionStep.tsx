import React, { useState } from 'react';
import { 
  Maximize2, Sparkles, Wand2, Sliders, Move, RotateCw, RefreshCcw, 
  Eye, Monitor, Smartphone, Tablet, Cpu, Layers, Check, Info, ShieldCheck, 
  Activity, Compass, Layers3, Flame
} from 'lucide-react';
import { WallpaperConfig } from '../../context/WallpaperContext';
import { AIWallpaperAnalysisV4 } from '../../utils/themeStudioEngine';

interface WallpaperDisplayInteractionStepProps {
  config: WallpaperConfig;
  updateConfig: (updates: Partial<WallpaperConfig>) => void;
  aiAnalysisV4: AIWallpaperAnalysisV4;
  onOpenHelp: (topic: string) => void;
}

export function WallpaperDisplayInteractionStep({
  config,
  updateConfig,
  aiAnalysisV4,
  onOpenHelp
}: WallpaperDisplayInteractionStepProps) {
  const [activeTab, setActiveTab] = useState<'display' | 'manual' | 'cropping' | 'parallax' | 'responsive' | 'performance'>('display');
  
  const displayMode = config.displayMode ?? 'Cover';
  const setDisplayMode = (val: string) => updateConfig({ displayMode: val });

  const smartAiFitEnabled = config.smartAiFitEnabled ?? true;
  const setSmartAiFitEnabled = (val: boolean) => updateConfig({ smartAiFitEnabled: val });
  
  // Manual Positioning & Zoom
  const moveX = config.moveX ?? 0;
  const setMoveX = (val: number) => updateConfig({ moveX: val });

  const moveY = config.moveY ?? 0;
  const setMoveY = (val: number) => updateConfig({ moveY: val });

  const scale = config.scale ?? 100;
  const setScale = (val: number) => updateConfig({ scale: val });

  const rotation = config.rotation ?? 0;
  const setRotation = (val: number) => updateConfig({ rotation: val });

  const flipH = config.flipH ?? false;
  const setFlipH = (val: boolean) => updateConfig({ flipH: val });

  const flipV = config.flipV ?? false;
  const setFlipV = (val: boolean) => updateConfig({ flipV: val });

  // Cropping
  const cropMode = config.cropMode ?? 'Smart Crop';
  const setCropMode = (val: string) => updateConfig({ cropMode: val });

  // Parallax Engine
  const parallaxEnabled = config.parallaxEnabled ?? true;
  const setParallaxEnabled = (val: boolean) => updateConfig({ parallaxEnabled: val });

  const parallaxMode = config.parallaxMode ?? 'Mouse Tracking';
  const setParallaxMode = (val: string) => updateConfig({ parallaxMode: val });

  const parallaxIntensity = config.parallaxIntensity ?? 15;
  const setParallaxIntensity = (val: number) => updateConfig({ parallaxIntensity: val });

  const parallaxSensitivity = config.parallaxSensitivity ?? 1.2;
  const setParallaxSensitivity = (val: number) => updateConfig({ parallaxSensitivity: val });

  const maxOffset = config.parallaxMaxOffset ?? 30;
  const setMaxOffset = (val: number) => updateConfig({ parallaxMaxOffset: val });

  const smoothness = config.parallaxSmoothness ?? 85;
  const setSmoothness = (val: number) => updateConfig({ parallaxSmoothness: val });

  // Responsive device overrides
  const [selectedDeviceProfile, setSelectedDeviceProfile] = useState<string>('Desktop');

  const displayModes = [
    { id: 'Cover', name: 'Cover (Örtüşen)', desc: 'Ekranı tamamen doldurur, oranları korur.' },
    { id: 'Contain', name: 'Contain (Sığdır)', desc: 'Görselin tamamını gösterir, boşluk bırakabilir.' },
    { id: 'Fill', name: 'Fill Screen (Doldur)', desc: 'Ekran en-boy oranına göre gerer.' },
    { id: 'Fit', name: 'Fit to Screen', desc: 'Kenarlardan kırpmadan sığdırır.' },
    { id: 'Stretch', name: 'Stretch (Esnet)', desc: 'Tüm alanı orantısız kaplar.' },
    { id: 'Original', name: 'Original Size', desc: '1:1 piksel ölçeğinde gösterir.' },
    { id: 'Center', name: 'Center (Ortala)', desc: 'Görseli merkeze konumlandırır.' },
    { id: 'Tile', name: 'Tile (Döşe)', desc: 'Desenler halinde tekrarlar.' },
    { id: 'FillWidth', name: 'Fill Width', desc: 'Genişliği ekran boyuncaya sabitler.' },
    { id: 'FillHeight', name: 'Fill Height', desc: 'Yüksekliği ekran boyuncaya sabitler.' },
    { id: 'Custom', name: 'Custom Scale', desc: 'Özel ölçekleme faktörü uygular.' },
    { id: 'SmartAI', name: 'Smart AI Fit', desc: 'Yapay zeka odaklı otomatik akıllı yerleşim.' }
  ];

  const parallaxModesList = [
    { id: 'Mouse Tracking', name: 'Mouse Tracking', desc: 'İmleç hareketine göre hafif derinlik kayması.' },
    { id: 'Cursor Depth', name: 'Cursor Depth', desc: 'İmleç derinliğine göre odaklama efekti.' },
    { id: 'Gyroscope', name: 'Gyroscope (Mobil)', desc: 'Cihaz eğim açısına duyarlı hareket.' },
    { id: 'Window Movement', name: 'Window Movement', desc: 'Pencere sürükleme hızına duyarlı tepki.' },
    { id: '3D Perspective', name: '3D Perspective', desc: 'Derinlikli katmanlı perspektif.' },
    { id: 'Floating Background', name: 'Floating Background', desc: 'Sürekli hafif dalgalanan serbest yüzme.' },
    { id: 'Layered Depth', name: 'Layered Depth', desc: 'Ön ve arka plan arası paralaks ayrımı.' }
  ];

  const cropModesList = [
    { id: 'Smart Crop', name: 'Smart Crop', desc: 'AI özne tespiti ile en ideal kare.' },
    { id: 'AI Crop', name: 'AI Golden Ratio Crop', desc: 'Altın oran kuralına göre otomatik kırpma.' },
    { id: 'Safe Crop', name: 'Safe Area Crop', desc: 'Arayüz pencerelerini engellemeyecek alan.' },
    { id: 'Center Crop', name: 'Center Crop', desc: 'Merkez odaklı standart kırpma.' },
    { id: 'Manual Crop', name: 'Manual Crop', desc: 'Kullanıcı tanımlı özel kırpma alanları.' }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div>
        <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
          <Maximize2 size={22} className="text-focus-neon" /> Duvar Kağıdı Görünüm & Etkileşim (Display & Interaction)
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Akıllı AI yerleşimi, 12 farklı konumlandırma modu, gelişmiş Parallax derinlik motoru ve responsive cihaz kuralları.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'display', label: 'Görünüm Modları', icon: Maximize2 },
          { id: 'manual', label: 'Konum & Zoom', icon: Move },
          { id: 'cropping', label: 'Kırpma & AI Fit', icon: Wand2 },
          { id: 'parallax', label: 'Parallax Motoru', icon: Layers3 },
          { id: 'responsive', label: 'Responsive Kurallar', icon: Monitor },
          { id: 'performance', label: 'Performans Etkisi', icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-focus-neon text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/30' 
                  : 'bg-black/40 text-text-secondary hover:bg-white/5 border border-white/5'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DISPLAY MODES & SMART AI FIT */}
      {activeTab === 'display' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Sparkles size={15} className="text-focus-neon" /> Smart AI Fit & Akıllı Yerleşim
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={smartAiFitEnabled}
                  onChange={(e) => setSmartAiFitEnabled(e.target.checked)}
                  className="rounded bg-black border-white/20 text-focus-neon focus:ring-0"
                />
                <span className="text-xs font-mono text-white font-bold">Smart AI Fit Aktif</span>
              </label>
            </div>

            <p className="text-xs text-text-secondary font-mono leading-relaxed">
              Smart AI Fit etkinleştirildiğinde; duvar kağıdının çözünürlüğü, en-boy oranı, ana nesne ve yüz konumları taranarak kırpma ve esneme olmadan en mükemmel ekrana yerleşim otomatik hesaplanır.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayModes.map((mode) => {
                const isSelected = displayMode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => setDisplayMode(mode.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected 
                        ? 'border-focus-neon bg-focus-neon/10 ring-1 ring-focus-neon/30' 
                        : 'border-white/10 bg-black/40 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">{mode.name}</span>
                      {isSelected && <Check size={14} className="text-focus-neon" />}
                    </div>
                    <p className="text-[10px] text-text-secondary font-mono leading-relaxed">{mode.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL POSITIONING & ZOOM */}
      {activeTab === 'manual' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Move size={15} className="text-focus-neon" /> Manuel Konumlandırma & Ölçek Kontrolü
              </span>
              <button
                onClick={() => { setMoveX(0); setMoveY(0); setScale(100); setRotation(0); setFlipH(false); setFlipV(false); }}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary hover:text-white text-[10px] font-mono flex items-center gap-1"
              >
                <RefreshCcw size={11} /> Sıfırla
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">Yatay Konum (Move X)</span>
                  <span className="text-white font-bold">{moveX}px</span>
                </div>
                <input 
                  type="range" min="-300" max="300" value={moveX}
                  onChange={(e) => setMoveX(Number(e.target.value))}
                  className="w-full accent-focus-neon"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">Dikey Konum (Move Y)</span>
                  <span className="text-white font-bold">{moveY}px</span>
                </div>
                <input 
                  type="range" min="-300" max="300" value={moveY}
                  onChange={(e) => setMoveY(Number(e.target.value))}
                  className="w-full accent-focus-neon"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">Ölçek & Zoom (Scale)</span>
                  <span className="text-focus-neon font-bold">%{scale}</span>
                </div>
                <input 
                  type="range" min="50" max="250" value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-focus-neon"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">Döndürme (Rotation)</span>
                  <span className="text-emerald-400 font-bold">{rotation}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-focus-neon"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  flipH ? 'bg-focus-neon text-white border-blue-400' : 'bg-black/40 text-text-secondary border-white/10'
                }`}
              >
                ↔ Yatay Çevir (Flip H)
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  flipV ? 'bg-focus-neon text-white border-blue-400' : 'bg-black/40 text-text-secondary border-white/10'
                }`}
              >
                ↕ Dikey Çevir (Flip V)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CROPPING & AI FIT */}
      {activeTab === 'cropping' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white">Kırpma Modları & Akıllı Odak</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cropModesList.map((mode) => {
                const isSelected = cropMode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => setCropMode(mode.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected 
                        ? 'border-focus-neon bg-focus-neon/10 ring-1 ring-focus-neon/30' 
                        : 'border-white/10 bg-black/40 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">{mode.name}</span>
                      {isSelected && <Check size={14} className="text-focus-neon" />}
                    </div>
                    <p className="text-[10px] text-text-secondary font-mono leading-relaxed">{mode.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PARALLAX ENGINE */}
      {activeTab === 'parallax' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Layers3 size={15} className="text-focus-neon" /> Parallax Derinlik Motoru
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={parallaxEnabled}
                  onChange={(e) => setParallaxEnabled(e.target.checked)}
                  className="rounded bg-black border-white/20 text-focus-neon focus:ring-0"
                />
                <span className="text-xs font-mono text-white font-bold">Parallax Aktif</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {parallaxModesList.map((mode) => {
                const isSelected = parallaxMode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => setParallaxMode(mode.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected 
                        ? 'border-focus-neon bg-focus-neon/10 ring-1 ring-focus-neon/30' 
                        : 'border-white/10 bg-black/40 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">{mode.name}</span>
                      {isSelected && <Check size={14} className="text-focus-neon" />}
                    </div>
                    <p className="text-[10px] text-text-secondary font-mono leading-relaxed">{mode.desc}</p>
                  </div>
                );
              })}
            </div>

            {parallaxEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-secondary">Yoğunluk (Intensity)</span>
                    <span className="text-focus-neon font-bold">{parallaxIntensity}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="50" value={parallaxIntensity}
                    onChange={(e) => setParallaxIntensity(Number(e.target.value))}
                    className="w-full accent-focus-neon"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-secondary">Hassasiyet (Sensitivity)</span>
                    <span className="text-emerald-400 font-bold">{parallaxSensitivity}x</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="3.0" step="0.1" value={parallaxSensitivity}
                    onChange={(e) => setParallaxSensitivity(Number(e.target.value))}
                    className="w-full accent-focus-neon"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-secondary">Yumuşatma (Smoothness)</span>
                    <span className="text-sky-400 font-bold">%{smoothness}</span>
                  </div>
                  <input 
                    type="range" min="20" max="99" value={smoothness}
                    onChange={(e) => setSmoothness(Number(e.target.value))}
                    className="w-full accent-focus-neon"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: RESPONSIVE RULES */}
      {activeTab === 'responsive' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white">Cihaz Bazlı Otomatik Duvar Kağıdı Konumlandırma</h4>
            <div className="flex gap-2 pb-2">
              {['Desktop', 'Laptop', 'Tablet', 'Mobile', 'UltraWide', '4K'].map((dev) => (
                <button
                  key={dev}
                  onClick={() => setSelectedDeviceProfile(dev)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    selectedDeviceProfile === dev ? 'bg-focus-neon text-white font-bold' : 'bg-black/30 text-text-secondary hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {dev}
                </button>
              ))}
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2 font-mono text-xs">
              <span className="text-focus-neon font-bold uppercase">{selectedDeviceProfile} Profili Ayarları</span>
              <p className="text-text-secondary leading-relaxed">
                {selectedDeviceProfile} ekran çözünürlüğünde duvar kağıdı {displayMode} modunda hizalanır, {parallaxEnabled ? 'Parallax aktif' : 'Parallax pasif'} olarak çalışır.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PERFORMANCE IMPACT */}
      {activeTab === 'performance' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Cpu size={15} className="text-focus-neon" /> Performans ve Donanım Yük Tahmini
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/40 text-[9px] block">RAM KULLANIMI</span>
                <span className="text-white font-bold block">42 MB</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/40 text-[9px] block">VRAM MALİYETİ</span>
                <span className="text-emerald-400 font-bold block">128 MB (Çok Düşük)</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/40 text-[9px] block">GPU YÜKÜ</span>
                <span className="text-sky-400 font-bold block">%1.4 (Donanım Hızlandırmalı)</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/40 text-[9px] block">PİL ETKİSİ</span>
                <span className="text-purple-400 font-bold block">İhmal Edilebilir (&lt; 0.2%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
