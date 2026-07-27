import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Settings2, Palette, Bell, Shield, 
  Globe, Moon, Sun, Monitor, Camera, Lock,
  Save, LogOut, Trash2, Link, Smartphone,
  Type, Check, HelpCircle, Activity, TrendingUp, Sparkles, RefreshCw
} from 'lucide-react';
import { useSettings, PRIMARY_COLORS, generateIntermediateColors, PREMIUM_FONTS } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { IntegrationsSettings } from '../settings/IntegrationsSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'general' | 'customization' | 'integrations' | 'notifications' | 'security' | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('customization'); // default to customization so user gets direct access to wizard
  const {
    settings,
    updateSetting,
    activeFont,
    setActiveFont,
    activeAccent,
    setActiveAccent,
    activeAccentName,
    setActiveAccentName
  } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  const [colorSearch, setColorSearch] = useState('');
  const [colorTypeFilter, setColorTypeFilter] = useState<'all' | 'primary' | 'intermediate'>('all');

  // Generate 66 intermediate blended colors
  const intermediateColors = useMemo(() => generateIntermediateColors(), []);

  // Combined color list (11 primary + 66 intermediate = 77 colors total)
  const allColors = useMemo(() => {
    const list = [
      ...PRIMARY_COLORS.map(c => ({ name: c.name, hex: c.hex, formula: 'Ana Renk (100%)', type: 'Ana Renk' })),
      ...intermediateColors
    ];
    return list;
  }, [intermediateColors]);

  const filteredColors = useMemo(() => {
    return allColors.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(colorSearch.toLowerCase()) || c.hex.toLowerCase().includes(colorSearch.toLowerCase());
      const matchesFilter =
        colorTypeFilter === 'all' ||
        (colorTypeFilter === 'primary' && c.type === 'Ana Renk') ||
        (colorTypeFilter === 'intermediate' && c.type !== 'Ana Renk');
      return matchesSearch && matchesFilter;
    });
  }, [allColors, colorSearch, colorTypeFilter]);

  const tabs = [
    { id: 'customization', label: 'Tema Stüdyosu 🪄', icon: <Palette size={18} /> },
    { id: 'profile', label: t('user.profile', 'Profil'), icon: <User size={18} /> },
    { id: 'general', label: t('nav.settings', 'Genel'), icon: <Settings2 size={18} /> },
    { id: 'integrations', label: 'Entegrasyonlar', icon: <Link size={18} /> },
    { id: 'notifications', label: t('nav.notifications', 'Bildirimler'), icon: <Bell size={18} /> },
    { id: 'security', label: 'Güvenlik', icon: <Shield size={18} /> },
    { id: 'privacy', label: 'Veri & Gizlilik', icon: <Lock size={18} /> },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 lg:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl bg-skel-space border border-neutral-200/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] z-10"
        >
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 bg-neutral-100/70 dark:bg-black/40 border-b md:border-b-0 md:border-r border-neutral-200/10 dark:border-white/5 p-4 flex flex-col shrink-0">
            <div className="flex items-center gap-3 mb-4 md:mb-8 px-2">
              <div className="size-8 rounded-xl bg-focus-neon/10 border border-focus-neon/20 flex items-center justify-center animate-pulse">
                <Palette size={18} className="text-focus-neon" />
              </div>
              <h2 className="text-lg font-display font-black text-text-primary dark:text-white tracking-tight uppercase">APEX STÜDYO</h2>
            </div>

            <nav className="space-y-1 flex-1 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1 pb-2 md:pb-0 custom-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === tab.id 
                      ? 'bg-focus-neon text-white dark:text-black shadow-lg shadow-focus-neon/25'
                      : 'text-text-secondary hover:bg-neutral-200/50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50/50 dark:bg-transparent">
            <div className="p-4 border-b border-neutral-200/20 dark:border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] flex items-center gap-2">
                 <Sparkles size={12} className="text-focus-neon animate-spin" /> Advanced Core Customizer & Wizard
               </span>
               <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-200/50 dark:hover:bg-white/5 rounded-full text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
               >
                 <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {activeTab === 'customization' && (
                    <div className="space-y-8">
                      {/* Section 1: Introduction */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-focus-neon/10 via-purple-500/5 to-transparent border border-focus-neon/15">
                        <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                          <Palette size={20} className="text-focus-neon" /> Akıllı Tema Sihirbazı & Renk Motoru
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
                          Uygulamanın tüm vurgularını (accent, glow, border, grafikler) kontrol edebileceğiniz 11 ana renk ve bunların matematiksel kombinasyonlarıyla harmanlanmış 66 kusursuz ara renk paleti.
                        </p>
                      </div>

                      {/* Section 2: Light & Dark Theme Controller */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bento-card flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-1">Açık Tema (Premium Alabaster)</h4>
                            <p className="text-[11px] text-text-secondary">Yumuşak krem ve beyaz tonlarında, gözü yormayan asil tasarım.</p>
                          </div>
                          <button
                            onClick={() => updateSetting('theme.mode', 'light')}
                            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                              settings['theme.mode']?.value === 'light'
                                ? 'bg-focus-neon text-white dark:text-black border-focus-neon'
                                : 'bg-transparent text-text-primary dark:text-white border-neutral-200 dark:border-white/10 hover:bg-neutral-200/20'
                            }`}
                          >
                            <Sun size={14} /> Aktif Et
                          </button>
                        </div>

                        <div className="p-4 bento-card flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-1">Koyu Tema (Slate Dark)</h4>
                            <p className="text-[11px] text-text-secondary">Arka planı korunan, yüksek kontrastlı asil gece modu tasarımı.</p>
                          </div>
                          <button
                            onClick={() => updateSetting('theme.mode', 'dark')}
                            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                              settings['theme.mode']?.value === 'dark'
                                ? 'bg-focus-neon text-white dark:text-black border-focus-neon'
                                : 'bg-transparent text-text-primary dark:text-white border-neutral-200 dark:border-white/10 hover:bg-neutral-200/20'
                            }`}
                          >
                            <Moon size={14} /> Aktif Et
                          </button>
                        </div>

                        <div className="p-4 bento-card flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-1">Sistem Uyumlu Mod</h4>
                            <p className="text-[11px] text-text-secondary">Cihazınızın o anki işletim sistemi ayarına göre otomatik senkronizasyon.</p>
                          </div>
                          <button
                            onClick={() => updateSetting('theme.mode', 'system')}
                            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                              settings['theme.mode']?.value === 'system'
                                ? 'bg-focus-neon text-white dark:text-black border-focus-neon'
                                : 'bg-transparent text-text-primary dark:text-white border-neutral-200 dark:border-white/10 hover:bg-neutral-200/20'
                            }`}
                          >
                            <Monitor size={14} /> Aktif Et
                          </button>
                        </div>
                      </div>

                      {/* Live Preview Dashboard Simulator */}
                      <div className="p-5 rounded-2xl bg-neutral-100/50 dark:bg-white/[0.02] border border-neutral-200/20 dark:border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">Tema Canlı Önizleme Simülatörü</h4>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">LİVE FEED</span>
                        </div>

                        {/* Interactive Bento Preview Component */}
                        <div className="p-4 rounded-xl border border-neutral-200/30 dark:border-white/15 bg-white dark:bg-black transition-all duration-500 shadow-md">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/20 dark:border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: activeAccent }}>
                                <Activity size={14} className="text-white" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-text-primary dark:text-white transition-all" style={{ fontFamily: activeFont }}>APEXOS Finance Widget</h5>
                                <p className="text-[10px] text-text-secondary">Font: <span className="font-bold text-text-primary dark:text-white capitalize">{activeFont}</span> | Renk: <span className="font-bold" style={{ color: activeAccent }}>{activeAccentName} ({activeAccent})</span></p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white font-mono" style={{ backgroundColor: activeAccent }}>₺144,200.00</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                            <div className="p-3 rounded-lg border border-neutral-200/20 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/50">
                              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Abonelik Bitiş Süresi</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <TrendingUp size={12} style={{ color: activeAccent }} />
                                <span className="text-xs font-bold text-text-primary dark:text-white">4 Ay Sonra Sonlanacak Borçlar</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg border border-neutral-200/20 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/50">
                              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Simüle Edilen Büyüme Trendi</span>
                              <div className="w-full h-8 flex items-end gap-1 mt-1">
                                {[30, 45, 40, 60, 55, 75, 90].map((h, idx) => (
                                  <div
                                    key={idx}
                                    className="flex-1 rounded-t-sm transition-all duration-500"
                                    style={{
                                      height: `${h}%`,
                                      backgroundColor: activeAccent,
                                      opacity: 0.3 + (idx * 0.1)
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Typography Browser (10 Modern Premium Fonts) */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                          <Type size={14} className="text-focus-neon" /> 10 Özel ve Modern Yazı Fontu Seti
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          {PREMIUM_FONTS.map(font => {
                            const isSelected = activeFont === font.id;
                            return (
                              <button
                                key={font.id}
                                onClick={() => setActiveFont(font.id)}
                                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group min-h-[140px] ${
                                  isSelected
                                    ? 'bg-focus-neon/10 border-focus-neon text-text-primary dark:text-white'
                                    : 'bg-white/5 border-neutral-200 dark:border-white/10 text-text-secondary hover:border-neutral-400 dark:hover:border-white/20'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 size-5 bg-focus-neon rounded-full flex items-center justify-center">
                                    <Check size={10} className="text-white dark:text-black font-black" />
                                  </div>
                                )}
                                <div>
                                  <span className="text-[10px] font-mono opacity-50 tracking-widest capitalize">Aa</span>
                                  <h5 className="text-base font-extrabold mt-1 truncate" style={{ fontFamily: font.stack }}>
                                    {font.name}
                                  </h5>
                                  <p className="text-[9px] leading-relaxed mt-1 line-clamp-3">
                                    {font.description}
                                  </p>
                                </div>
                                <span className="text-[9px] font-mono mt-3 opacity-60 truncate">
                                  {font.id} stack
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 4: Advanced Color Palette & Formulas (77 Total Colors) */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                              <Palette size={14} className="text-focus-neon" /> Akıllı Renk Portföyü (11 Ana + 66 Ara Karışım Rengi)
                            </h4>
                            <p className="text-[10px] text-text-secondary">Uygulamanın aktif vurgu rengi olarak atamak istediğiniz rengin üzerine tıklayın.</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Renk Ara... (örn: Mürdüm)"
                              value={colorSearch}
                              onChange={(e) => setColorSearch(e.target.value)}
                              className="bg-neutral-100/85 dark:bg-white/5 border border-neutral-200/30 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-text-primary dark:text-white placeholder-text-secondary/40 focus:outline-none focus:border-focus-neon"
                            />
                            <select
                              value={colorTypeFilter}
                              onChange={(e) => setColorTypeFilter(e.target.value as any)}
                              className="bg-neutral-100/85 dark:bg-white/5 border border-neutral-200/30 dark:border-white/10 rounded-xl px-2 py-1.5 text-xs text-text-primary dark:text-white focus:outline-none"
                            >
                              <option value="all">Tüm Renkler</option>
                              <option value="primary">Ana Renkler (11)</option>
                              <option value="intermediate">Ara Karışımlar (66)</option>
                            </select>
                          </div>
                        </div>

                        {/* Infinite Grid of 77 Colors */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                          {filteredColors.map((color, idx) => {
                            const isSelected = activeAccent.toUpperCase() === color.hex.toUpperCase();
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setActiveAccent(color.hex);
                                  setActiveAccentName(color.name);
                                }}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden h-[95px] ${
                                  isSelected
                                    ? 'border-focus-neon ring-2 ring-focus-neon/20 bg-neutral-100/70 dark:bg-white/10'
                                    : 'border-neutral-200/50 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 bg-white/5 hover:scale-[1.02]'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="size-5 rounded-md border border-neutral-200/20 shadow-inner shrink-0" style={{ backgroundColor: color.hex }} />
                                  <span className="text-[8px] font-mono opacity-50 uppercase tracking-tight">{color.hex}</span>
                                </div>
                                <div className="mt-2">
                                  <h5 className="text-[10px] font-bold text-text-primary dark:text-white truncate" title={color.name}>{color.name}</h5>
                                  <p className="text-[7.5px] text-text-secondary truncate mt-0.5" title={color.formula}>{color.formula}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                          <div className="size-20 sm:size-24 rounded-3xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                            <User size={40} className="text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-bold text-text-primary dark:text-white">Engin Nalbant</h3>
                          <p className="text-text-secondary text-sm">enginnalbant9@gmail.com</p>
                          <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                             <span className="px-2 py-1 rounded-lg bg-focus-neon/10 text-focus-neon text-[10px] font-bold border border-focus-neon/20">PREMIUM USER</span>
                             <span className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 text-text-secondary text-[10px] font-bold border border-neutral-200 dark:border-white/10">ANDROID READY</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary">İsim</label>
                          <input type="text" defaultValue="Engin" className="w-full bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/50 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary dark:text-white focus:border-focus-neon/50 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary">Soyisim</label>
                          <input type="text" defaultValue="Nalbant" className="w-full bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/50 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary dark:text-white focus:border-focus-neon/50 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/10 space-y-3">
                        <LanguageSelector variant="full" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/10">
                        <div className="flex items-center gap-3.5">
                          <Smartphone className="text-focus-neon" size={20} />
                          <div>
                            <p className="text-sm font-bold text-text-primary dark:text-white">{t('device.optimizedForAndroid', 'Android & Tablet Uyumlu')}</p>
                            <p className="text-xs text-text-secondary">Mobil dokunmatik ekranlar için optimize edildi</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                          {t('common.active', 'Aktif')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/10">
                        <div className="flex items-center gap-3.5">
                          <Monitor className="text-focus-neon" size={20} />
                          <div>
                            <p className="text-sm font-bold text-text-primary dark:text-white">Cihaz Senkronizasyonu</p>
                            <p className="text-xs text-text-secondary">Verileri bulut üzerinden eşitle</p>
                          </div>
                        </div>
                        <div className="w-10 h-5 bg-focus-neon rounded-full relative cursor-pointer">
                          <div className="size-4 bg-black dark:bg-white rounded-full absolute top-0.5 right-0.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'integrations' && (
                    <div className="space-y-6">
                       <IntegrationsSettings />
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-4">
                      {['E-posta Bildirimleri', 'Sistem Duyuruları', 'Finansal Uyarılar', 'Kütüphane Güncellemeleri'].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/10">
                          <p className="text-sm font-bold text-text-primary dark:text-white">{item}</p>
                          <div className={`w-10 h-5 rounded-full relative cursor-pointer ${i < 2 ? 'bg-focus-neon' : 'bg-neutral-200 dark:bg-white/10'}`}>
                            <div className={`size-4 bg-black dark:bg-white rounded-full absolute top-0.5 ${i < 2 ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-4">
                       <button className="w-full flex items-center justify-between p-4 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/10 hover:bg-neutral-200/80 dark:hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-4">
                            <Lock className="text-rose-400" size={20} />
                            <div className="text-left">
                              <p className="text-sm font-bold text-text-primary dark:text-white">Şifre Değiştir</p>
                              <p className="text-xs text-text-secondary">En son 3 ay önce güncellendi</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-text-secondary">GÜNCELLE</span>
                       </button>

                       <button className="w-full flex items-center justify-between p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 hover:bg-rose-500/10 transition-all group">
                          <div className="flex items-center gap-4">
                            <Trash2 className="text-rose-500" size={20} />
                            <div className="text-left">
                              <p className="text-sm font-bold text-rose-500">Hesabı Sil</p>
                              <p className="text-xs text-rose-500/60">Tüm verileriniz kalıcı olarak silinecektir</p>
                            </div>
                          </div>
                       </button>
                    </div>
                  )}

                  {activeTab === 'privacy' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-focus-neon/5 border border-focus-neon/10 rounded-2xl">
                        <h4 className="text-sm font-bold text-focus-neon mb-1">Veri Kontrol Merkezi</h4>
                        <p className="text-xs text-text-secondary">APEXOS verilerinizi nasıl işlediğini ve koruduğunu buradan yönetebilirsiniz.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/10">
                          <div>
                            <p className="text-sm font-bold text-text-primary dark:text-white">Arama Geçmişini Kaydet</p>
                            <p className="text-xs text-text-secondary">Hızlı erişim için aramalarınızı hatırlar</p>
                          </div>
                          <div className="w-10 h-5 bg-focus-neon rounded-full relative cursor-pointer">
                            <div className="size-4 bg-black dark:bg-white rounded-full absolute top-0.5 right-0.5" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/10">
                          <div>
                            <p className="text-sm font-bold text-text-primary dark:text-white">Konum Verisi</p>
                            <p className="text-xs text-text-secondary">Hava durumu ve yerel finansal veriler için</p>
                          </div>
                          <div className="w-10 h-5 bg-neutral-200 dark:bg-white/10 rounded-full relative cursor-pointer">
                            <div className="size-4 bg-black dark:bg-white rounded-full absolute top-0.5 left-0.5" />
                          </div>
                        </div>

                        <button className="w-full py-3 px-4 bg-neutral-100/50 dark:bg-white/5 border border-neutral-200/50 dark:border-white/10 rounded-xl text-xs font-bold text-text-primary dark:text-white hover:bg-neutral-200/85 dark:hover:bg-white/10 transition-all">
                          Tüm Verilerimi İndir (.json)
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-4 sm:p-6 border-t border-neutral-200/20 dark:border-white/5 bg-neutral-100/50 dark:bg-black/20 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-text-secondary hover:text-text-primary dark:hover:text-white transition-all"
              >
                {t('common.cancel', 'İptal')}
              </button>
              <button 
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-focus-neon text-white dark:text-black text-xs sm:text-sm font-bold shadow-lg shadow-focus-neon/20 hover:scale-105 transition-all active:scale-95"
              >
                <Save size={16} />
                {t('common.save', 'Kaydet')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
