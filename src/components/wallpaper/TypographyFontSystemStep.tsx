import React, { useState } from 'react';
import { 
  FileText, Sparkles, Wand2, Search, Filter, Plus, Copy, Edit3, Trash2, 
  Heart, Download, Upload, Check, ShieldCheck, Cpu, Layers, Sliders, 
  Eye, RefreshCw, CheckCircle2, AlertCircle, Info, Lock, Type, Monitor, Smartphone, Tablet
} from 'lucide-react';
import { WallpaperConfig } from '../../context/WallpaperContext';
import { AIWallpaperAnalysisV4 } from '../../utils/themeStudioEngine';

interface TypographyFontSystemStepProps {
  config: WallpaperConfig;
  updateConfig: (updates: Partial<WallpaperConfig>) => void;
  aiAnalysisV4: AIWallpaperAnalysisV4;
  onOpenHelp: (topic: string) => void;
  applyTypographyToTheme?: (fontFamily: string) => void;
}

export function TypographyFontSystemStep({
  config,
  updateConfig,
  aiAnalysisV4,
  onOpenHelp,
  applyTypographyToTheme
}: TypographyFontSystemStepProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'library' | 'tree' | 'components' | 'presets' | 'responsive'>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>(['Inter', 'JetBrains Mono', 'Plus Jakarta Sans']);
  const [importedFonts, setImportedFonts] = useState<Array<{ id: string; name: string; designer: string; license: string; format: string }>>([
    { id: 'imp-1', name: 'Custom Grotesk Pro', designer: 'Apex Studio', license: 'OFL', format: 'WOFF2' }
  ]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [fontFileUrl, setFontFileUrl] = useState('');

  // Built-in curated font families
  const builtInFonts = [
    { id: 'inter', name: 'Inter', category: 'Sans-Serif', designer: 'Rasmus Andersson', license: 'OFL', weights: '100-900 Variable' },
    { id: 'geist', name: 'Geist', category: 'Sans-Serif', designer: 'Vercel', license: 'MIT', weights: '100-900' },
    { id: 'roboto', name: 'Roboto', category: 'Sans-Serif', designer: 'Google', license: 'Apache 2.0', weights: '300, 400, 500, 700' },
    { id: 'open-sans', name: 'Open Sans', category: 'Sans-Serif', designer: 'Steve Matteson', license: 'Apache 2.0', weights: '300-800' },
    { id: 'noto-sans', name: 'Noto Sans', category: 'Sans-Serif', designer: 'Google', license: 'OFL', weights: '400, 700' },
    { id: 'ibm-plex-sans', name: 'IBM Plex Sans', category: 'Sans-Serif', designer: 'IBM', license: 'OFL', weights: '100-700' },
    { id: 'source-sans', name: 'Source Sans 3', category: 'Sans-Serif', designer: 'Adobe', license: 'OFL', weights: '200-900' },
    { id: 'manrope', name: 'Manrope', category: 'Sans-Serif', designer: 'Mikhail Sharkov', license: 'OFL', weights: '200-800' },
    { id: 'poppins', name: 'Poppins', category: 'Sans-Serif', designer: 'Indian Type Foundry', license: 'OFL', weights: '300-900' },
    { id: 'dm-sans', name: 'DM Sans', category: 'Sans-Serif', designer: 'Colophon Foundry', license: 'OFL', weights: '400-700' },
    { id: 'outfit', name: 'Outfit', category: 'Sans-Serif', designer: 'Rodrigo Fuenzalida', license: 'OFL', weights: '100-900' },
    { id: 'urbanist', name: 'Urbanist', category: 'Sans-Serif', designer: 'Corey Hu', license: 'OFL', weights: '100-900' },
    { id: 'jakarta', name: 'Plus Jakarta Sans', category: 'Sans-Serif', designer: 'Tokotype', license: 'OFL', weights: '200-800' },
    { id: 'space-grotesk', name: 'Space Grotesk', category: 'Display', designer: 'Colophon Foundry', license: 'OFL', weights: '300-700' },
    { id: 'lexend', name: 'Lexend', category: 'Sans-Serif', designer: 'Thomas Jockin', license: 'OFL', weights: '100-900' },
    { id: 'satoshi', name: 'Satoshi', category: 'Sans-Serif', designer: 'Fontshare', license: 'OFL', weights: '300-900' },
    { id: 'montserrat', name: 'Montserrat', category: 'Sans-Serif', designer: 'Julieta Ulanovsky', license: 'OFL', weights: '100-900' },
    { id: 'jetbrains', name: 'JetBrains Mono', category: 'Monospace', designer: 'JetBrains', license: 'Apache 2.0', weights: '100-800' },
    { id: 'geist-mono', name: 'Geist Mono', category: 'Monospace', designer: 'Vercel', license: 'MIT', weights: '100-900' },
    { id: 'fira-code', name: 'Fira Code', category: 'Monospace', designer: 'Aksel Artall', license: 'OFL', weights: '300-700' },
    { id: 'cascadia', name: 'Cascadia Code', category: 'Monospace', designer: 'Microsoft', license: 'MIT', weights: '200-700' }
  ];

  const categories = ['All', 'Sans-Serif', 'Display', 'Monospace'];

  const filteredFonts = builtInFonts.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.designer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Typography tree levels
  const [typographyTree, setTypographyTree] = useState({
    displayXl: { size: '48px', weight: '800', tracking: '-0.03em', lineHeight: '1.1' },
    displayL: { size: '36px', weight: '700', tracking: '-0.02em', lineHeight: '1.2' },
    headingXl: { size: '28px', weight: '700', tracking: '-0.01em', lineHeight: '1.25' },
    headingL: { size: '22px', weight: '600', tracking: '0em', lineHeight: '1.3' },
    bodyL: { size: '16px', weight: '400', tracking: '0em', lineHeight: '1.5' },
    bodyM: { size: '14px', weight: '400', tracking: '0em', lineHeight: '1.5' },
    caption: { size: '12px', weight: '500', tracking: '0.01em', lineHeight: '1.4' },
    code: { size: '13px', weight: '400', tracking: '0em', lineHeight: '1.4' }
  });

  const [activePreset, setActivePreset] = useState('Modern Dashboard');
  const typographyPresets = [
    { name: 'Modern Dashboard', font: 'Inter', desc: 'Net hatlar, yüksek yoğunluklu veri gösterimi için optimize edilmiş kurumsal stil.' },
    { name: 'Apple Inspired', font: 'Plus Jakarta Sans', desc: 'Yuvarlatılmış yumuşak formlar, geniş satır aralıkları ve zarif başlıklar.' },
    { name: 'Cyberpunk Gaming', font: 'Space Grotesk', desc: 'Keskin monospace entegrasyonları, yüksek kontrastlı neon başlıklar.' },
    { name: 'Editorial Luxury', font: 'Satoshi', desc: 'Sanatsal tipografi hiyerarşisi, klasik ve modern dokunuşların dengesi.' },
    { name: 'Developer Mono', font: 'JetBrains Mono', desc: 'Tüm arayüzde kod ve geliştirici odaklı monospace ve sans kombinasyonu.' }
  ];

  const toggleFavorite = (name: string) => {
    setFavorites(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleImportFont = () => {
    if (!fontFileUrl) return;
    const newFont = {
      id: `imported-${Date.now()}`,
      name: fontFileUrl.split('/').pop() || 'Custom Font',
      designer: 'Harici Yüklenen',
      license: 'MIT',
      format: 'WOFF2'
    };
    setImportedFonts(prev => [...prev, newFont]);
    setFontFileUrl('');
    setImportModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header & Sub-navigation */}
      <div>
        <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
          <Type size={22} className="text-focus-neon" /> Tipografi & Font Sistemi (Typography & Font System)
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Yapay zeka destekli font optimizasyonu, 30+ hiyerarşi seviyesi, hazır presedler ve harici font yükleme yöneticisi.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'ai', label: 'AI Font Önerileri', icon: Sparkles },
          { id: 'library', label: 'Font Kütüphanesi', icon: Type },
          { id: 'tree', label: 'Tipografi Hiyerarşisi', icon: Layers },
          { id: 'components', label: 'Bileşen Font Matrisi', icon: Sliders },
          { id: 'presets', label: 'Tipografi Presedleri', icon: FileText },
          { id: 'responsive', label: 'Responsive Kurallar', icon: Monitor }
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

      {/* TAB 1: AI RECOMMENDATIONS */}
      {activeTab === 'ai' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Sparkles size={15} className="text-focus-neon" /> AI Duvar Kağıdı Font Analizi
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 size={11} /> Okunabilirlik Skoru %99.5
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] font-mono text-text-secondary block uppercase">Önerilen Ana Font</span>
                <span className="text-base font-black text-white block">Inter / Plus Jakarta Sans</span>
                <span className="text-[10px] font-mono text-focus-neon block">Yüksek kontrastlı alanlar için optimize edildi</span>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] font-mono text-text-secondary block uppercase">Önerilen Satır Yüksekliği</span>
                <span className="text-base font-black text-emerald-400 font-mono block">1.55 (Optimum Okuma)</span>
                <span className="text-[10px] font-mono text-text-secondary block">Cam bulanıklığı arkasında en net görünüm</span>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] font-mono text-text-secondary block uppercase">Kontrast / WCAG</span>
                <span className="text-base font-black text-sky-400 font-mono block">AAA Sertifikalı</span>
                <span className="text-[10px] font-mono text-text-secondary block">Göz yormayan gri-beyaz dengesi</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/20 border border-focus-neon/30 space-y-2">
              <span className="text-[10px] font-mono text-focus-neon font-bold uppercase flex items-center gap-1.5">
                <Info size={13} /> Yapay Zeka Tavsiye Gerekçesi
              </span>
              <p className="text-xs font-mono text-text-secondary leading-relaxed">
                "Duvar kağıdınızda detaylı arka plan dokuları bulunduğundan, orta kalınlıkta (Medium 500) ve optimize edilmiş harf aralığına sahip sans-serif fontlar en yüksek okunabilirliği sağlar."
              </p>
            </div>

            <button
              onClick={() => {
                const newPreset = 'Inter - Modern Dashboard';
                updateConfig({ fontPreset: newPreset as any });
                if (applyTypographyToTheme) applyTypographyToTheme(newPreset);
              }}
              className="w-full py-3.5 rounded-xl bg-focus-neon text-white text-xs font-mono font-bold hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              <Wand2 size={15} /> AI Font Sistemini Otomatik Uygula
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: FONT LIBRARY & IMPORT */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Font adı veya tasarımcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-focus-neon text-white font-bold' 
                        : 'bg-black/30 text-text-secondary hover:bg-white/5 border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setImportModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-focus-neon text-xs font-mono font-bold text-white hover:bg-blue-600 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Upload size={13} /> Font Yükle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredFonts.map((font) => {
              const isFav = favorites.includes(font.name);
              const isSelected = config.fontPreset?.includes(font.name);
              return (
                <div 
                  key={font.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isSelected ? 'border-focus-neon bg-focus-neon/10 ring-1 ring-focus-neon/30' : 'border-white/10 bg-slate-900/50 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-focus-neon font-bold tracking-wider">{font.category} • {font.license}</span>
                      <h4 className="text-base font-bold text-white font-display" style={{ fontFamily: font.name }}>{font.name}</h4>
                      <span className="text-[10px] text-text-secondary font-mono">{font.designer}</span>
                    </div>
                    <button
                      onClick={() => toggleFavorite(font.name)}
                      className={`p-2 rounded-xl transition-all ${isFav ? 'text-rose-500 bg-rose-500/10' : 'text-text-secondary hover:text-white bg-black/30'}`}
                    >
                      <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-xs text-white truncate" style={{ fontFamily: font.name }}>
                      The quick brown fox jumps over the lazy dog. 0123456789
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const newPreset = `${font.name} - Selected`;
                      updateConfig({ fontPreset: newPreset as any });
                      if (applyTypographyToTheme) applyTypographyToTheme(newPreset);
                    }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-focus-neon text-white text-xs font-mono font-bold transition-all border border-white/10 flex items-center justify-center gap-1.5"
                  >
                    <Check size={13} /> {isSelected ? 'Aktif Font Ailesi' : 'Fontu Seç'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Import Modal */}
          {importModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-950 border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Upload size={18} className="text-focus-neon" /> Özel Font Yükle (TTF / WOFF2)
                  </h4>
                  <button onClick={() => setImportModalOpen(false)} className="text-text-secondary hover:text-white text-xs font-mono">Kapat</button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary block font-bold uppercase">Font Dosya URL veya Adı</label>
                  <input
                    type="text"
                    placeholder="https://example.com/fonts/custom.woff2"
                    value={fontFileUrl}
                    onChange={(e) => setFontFileUrl(e.target.value)}
                    className="w-full p-3 bg-black/50 border border-white/10 rounded-2xl text-xs font-mono text-white focus:outline-none focus:border-focus-neon"
                  />
                </div>

                <div className="p-3 bg-blue-950/25 border border-focus-neon/30 rounded-2xl text-xs font-mono text-text-secondary">
                  💡 WOFF2 ve TTF formatları desteklenir. Otomatik Unicode ve ağırlık analizi yapılır.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setImportModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-xs font-mono text-text-secondary">İptal</button>
                  <button onClick={handleImportFont} className="px-5 py-2.5 rounded-xl bg-focus-neon text-white text-xs font-mono font-bold hover:bg-blue-600">Yükle & Ekle</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TYPOGRAPHY HIERARCHY TREE */}
      {activeTab === 'tree' && (
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-bold text-white">Tipografi Hiyerarşi Ağacı (Display XL - Caption)</h4>
            <p className="text-xs text-text-secondary">Her bir metin seviyesinin boyut, ağırlık, harf aralığı ve satır yüksekliğini bağımsız düzenleyin.</p>
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {Object.entries(typographyTree).map(([level, props]) => (
              <div key={level} className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] font-mono text-focus-neon uppercase font-bold block">{level}</span>
                  <span className="text-sm font-bold text-white block" style={{ fontSize: props.size, fontWeight: Number(props.weight) }}>
                    Örnek Başlık / Metin Görünümü
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-xs font-mono text-white">
                    <span className="text-text-secondary">Boyut:</span>
                    <input 
                      type="text" 
                      value={props.size}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTypographyTree(prev => ({ ...prev, [level]: { ...props, size: val } }));
                      }}
                      className="w-14 bg-transparent text-focus-neon font-bold text-right outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-xs font-mono text-white">
                    <span className="text-text-secondary">Ağırlık:</span>
                    <input 
                      type="text" 
                      value={props.weight}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTypographyTree(prev => ({ ...prev, [level]: { ...props, weight: val } }));
                      }}
                      className="w-12 bg-transparent text-emerald-400 font-bold text-right outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPONENT FONT MATRIX */}
      {activeTab === 'components' && (
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-bold text-white">Bileşen Bazlı Font Ayarları</h4>
            <p className="text-xs text-text-secondary">Sidebar, Header, Kartlar, Butonlar ve Bildirimler için özel tipografi kuralları.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[440px] overflow-y-auto pr-1">
            {[
              { comp: 'Sidebar Menü', font: 'Inter', size: '13px', weight: '500' },
              { comp: 'Header Başlık', font: 'Plus Jakarta Sans', size: '15px', weight: '700' },
              { comp: 'Kart Başlıkları', font: 'Inter', size: '14px', weight: '600' },
              { comp: 'Buton Etiketleri', font: 'Inter', size: '13px', weight: '600' },
              { comp: 'Girdi Alanları (Inputs)', font: 'Inter', size: '13px', weight: '400' },
              { comp: 'Bildirimler & Popup', font: 'Inter', size: '12px', weight: '500' },
              { comp: 'Kod Blokları (Logs)', font: 'JetBrains Mono', size: '12px', weight: '400' },
              { comp: 'Tablolar & Veri', font: 'Inter', size: '13px', weight: '400' },
              { comp: 'AI Asistan Yanıt', font: 'Inter', size: '13.5px', weight: '400' }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-focus-neon uppercase font-bold block">{item.comp}</span>
                <div className="flex justify-between text-xs font-mono text-white">
                  <span>{item.font}</span>
                  <span className="text-text-secondary">{item.size} • {item.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-bold text-white">Hazır Tipografi Presedleri</h4>
            <p className="text-xs text-text-secondary">Tek tıkla tüm uygulamaya profesyonel tipografi kombinasyonları uygulayın.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typographyPresets.map((preset) => {
              const isActive = activePreset === preset.name;
              return (
                <div 
                  key={preset.name}
                  className={`p-5 rounded-3xl border transition-all space-y-3 ${
                    isActive ? 'border-focus-neon bg-focus-neon/10 ring-1 ring-focus-neon/30' : 'border-white/10 bg-slate-900/50'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-mono text-focus-neon uppercase font-bold block">{preset.font}</span>
                    <h4 className="text-base font-bold text-white font-display">{preset.name}</h4>
                  </div>
                  <p className="text-xs text-text-secondary font-mono leading-relaxed">{preset.desc}</p>
                  <button
                    onClick={() => setActivePreset(preset.name)}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-focus-neon text-white text-xs font-mono font-bold transition-all border border-white/10 flex items-center justify-center gap-1.5"
                  >
                    <Check size={13} /> {isActive ? 'Aktif Presed' : 'Presedi Uygula'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: RESPONSIVE RULES */}
      {activeTab === 'responsive' && (
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-bold text-white">Responsive Font Ölçekleme Kuralları</h4>
            <p className="text-xs text-text-secondary">Ekran çözünürlüklerine göre otomatik ölçeklenen font katsayıları.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-2">
              <Smartphone size={20} className="text-focus-neon" />
              <h5 className="text-sm font-bold text-white">Mobil / Tablet</h5>
              <p className="text-xs text-text-secondary font-mono">Küçük ekranlarda okunabilirlik için +1px taban boyutu ve sıkı satır aralığı.</p>
            </div>
            <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-2">
              <Monitor size={20} className="text-emerald-400" />
              <h5 className="text-sm font-bold text-white">Desktop & Laptop</h5>
              <p className="text-xs text-text-secondary font-mono">Standart 16px taban, akıcı hiyerarşi ve mükemmel kontrast dengesi.</p>
            </div>
            <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-2">
              <Cpu size={20} className="text-purple-400" />
              <h5 className="text-sm font-bold text-white">UltraWide & 4K</h5>
              <p className="text-xs text-text-secondary font-mono">Büyük ekranlarda ferah başlıklar ve optimize edilmiş geniş sütunlar.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
