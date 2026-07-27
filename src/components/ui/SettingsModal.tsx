import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Settings2, Palette, Bell, Shield, 
  Globe, Moon, Sun, Monitor, Camera, Lock,
  Save, LogOut, Trash2, Link, Smartphone,
  Type, Check, HelpCircle, Activity, TrendingUp, Sparkles, RefreshCw,
  Cpu, HardDrive, Terminal, Send, AlertTriangle, CheckCircle, Flame,
  DollarSign, Sliders, Play, Zap, HelpCircle as HelpIcon
} from 'lucide-react';
import { useSettings, PRIMARY_COLORS, generateIntermediateColors, PREMIUM_FONTS } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { IntegrationsSettings } from '../settings/IntegrationsSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'customization' | 'ai-copilot' | 'finance-settings' | 'ui-ux' | 'diagnostics' | 'profile' | 'security' | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('customization');
  const {
    settings,
    updateSetting,
    activeFont,
    setActiveFont,
    activeAccent,
    setActiveAccent,
    activeAccentName,
    setActiveAccentName,
    getStorageUsage,
    clearSystemCache,
    getSystemHealthAdvice,
    executeAiCommand
  } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  // Color Portfolio States
  const [colorSearch, setColorSearch] = useState('');
  const [colorTypeFilter, setColorTypeFilter] = useState<'all' | 'primary' | 'intermediate'>('all');

  // AI Co-Pilot terminal states
  const [aiInput, setAiInput] = useState('');
  const [aiLogs, setAiLogs] = useState<{ sender: 'user' | 'system' | 'ai'; text: string; time: string }[]>([
    { sender: 'system', text: 'APEX Neural Co-Pilot Engine v4.8 initialized and listening...', time: new Date().toLocaleTimeString() }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate intermediate colors
  const intermediateColors = useMemo(() => generateIntermediateColors(), []);
  const allColors = useMemo(() => {
    return [
      ...PRIMARY_COLORS.map(c => ({ name: c.name, hex: c.hex, formula: 'Ana Renk (100%)', type: 'Ana Renk' })),
      ...intermediateColors
    ];
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

  // System Diagnostics stats
  const [stats, setStats] = useState({
    cpu: 18,
    ram: 42,
    latency: 14,
    cachePercent: 0
  });

  const storageMetrics = useMemo(() => getStorageUsage(), [getStorageUsage, isOpen]);

  // Simulate dynamic machine telemetry
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 25) + 10,
        ram: 40 + Math.floor(Math.random() * 5),
        latency: Math.floor(Math.random() * 12) + 8,
        cachePercent: Math.min(100, Math.round((storageMetrics.usedBytes / storageMetrics.totalBytes) * 100))
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, storageMetrics]);

  // Scroll Chat logs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiLogs]);

  // Handle AI Command Submission
  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setAiInput('');

    // Append User Log
    const timeStr = new Date().toLocaleTimeString();
    setAiLogs(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);

    // Execute through Natural Language Router
    setTimeout(() => {
      const res = executeAiCommand(userMsg);
      setAiLogs(prev => [
        ...prev,
        {
          sender: res.success ? 'ai' : 'system',
          text: res.message,
          time: new Date().toLocaleTimeString()
        }
      ]);
    }, 600);
  };

  const tabs = [
    { id: 'customization', label: 'Tema Stüdyosu 🪄', icon: <Palette size={18} /> },
    { id: 'ai-copilot', label: 'Neural AI Co-Pilot 🧠', icon: <Cpu size={18} /> },
    { id: 'ui-ux', label: 'Arayüz & Animasyon 📱', icon: <Sliders size={18} /> },
    { id: 'finance-settings', label: 'Finansal Kontrol 💸', icon: <DollarSign size={18} /> },
    { id: 'diagnostics', label: 'Sistem Sağlığı 🛠️', icon: <Activity size={18} /> },
    { id: 'profile', label: t('user.profile', 'Profil'), icon: <User size={18} /> },
    { id: 'security', label: 'Güvenlik', icon: <Shield size={18} /> },
    { id: 'privacy', label: 'Veri & Gizlilik', icon: <Lock size={18} /> },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 lg:p-8">
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
          className="relative w-full max-w-7xl bg-skel-space border border-neutral-200/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[92vh] z-10"
        >
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 bg-neutral-100/70 dark:bg-black/40 border-b md:border-b-0 md:border-r border-neutral-200/10 dark:border-white/5 p-4 flex flex-col shrink-0">
            <div className="flex items-center gap-3 mb-4 md:mb-8 px-2">
              <div className="size-8 rounded-xl bg-focus-neon/10 border border-focus-neon/20 flex items-center justify-center animate-pulse">
                <Palette size={18} className="text-focus-neon" />
              </div>
              <h2 className="text-lg font-display font-black text-text-primary dark:text-white tracking-tight uppercase">APEX SYSTEM</h2>
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
                 <Sparkles size={12} className="text-focus-neon animate-spin" /> Advanced Operating System Diagnostics & AI Control Center
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
                  className="space-y-6 animate-fade-in"
                >
                  {/* TAB 1: CUSTOMIZATION (THEME STUDIO) */}
                  {activeTab === 'customization' && (
                    <div className="space-y-8">
                      {/* Introduction */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-focus-neon/10 via-purple-500/5 to-transparent border border-focus-neon/15">
                        <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                          <Palette size={20} className="text-focus-neon" /> Akıllı Tema Sihirbazı & Renk Motoru
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
                          Uygulamanın tüm vurgularını (accent, glow, border, grafikler) kontrol edebileceğiniz 11 ana renk ve bunların matematiksel kombinasyonlarıyla harmanlanmış 66 kusursuz ara renk paleti.
                        </p>
                      </div>

                      {/* Light & Dark Theme Controller */}
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

                      {/* Typography Browser (10 Modern Premium Fonts) */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                          <Type size={14} className="text-focus-neon" /> 10 Özel ve Modern Yazı Fontu Seti
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
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

                      {/* Advanced Color Palette & Formulas (77 Total Colors) */}
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

                        {/* Color Grid */}
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

                  {/* TAB 2: AI NEURAL CO-PILOT */}
                  {activeTab === 'ai-copilot' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">
                      {/* Left Side: Dynamic Commands Cheat-Sheet */}
                      <div className="p-5 rounded-2xl border border-neutral-200/20 dark:border-white/5 bg-neutral-100/30 dark:bg-white/[0.01] flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2">
                            <Terminal size={16} className="text-focus-neon" /> AI Ayar Komut Rehberi
                          </h3>
                          <p className="text-xs text-text-secondary mt-1">
                            Sistem parametrelerini arayüz butonlarına tıklamadan, doğrudan yapay zekaya seslenerek/yazarak değiştirebilirsiniz.
                          </p>
                          <div className="space-y-2 mt-4">
                            {[
                              { label: 'Performans Moduna Al', desc: 'FPS limitsiz yapılır, animasyon hızı yıldırım seviyesine iner.' },
                              { label: 'Açık / Karanlık Temaya Geç', desc: 'Görsel modlar anında değiştirilir.' },
                              { label: 'Bütçe Uyarı Sınırını %75 Yap', desc: 'Finansal limit uyarı eşiği otomatik atanır.' },
                              { label: 'Yazı tipini Space Grotesk yap', desc: 'Aktif font ailesi otomatik güncellenir.' },
                              { label: 'Vurgu rengini Mürdüm yap', desc: 'Renk teması 77 renkten eşlenerek değiştirilir.' }
                            ].map((cmd, i) => (
                              <button
                                key={i}
                                onClick={() => setAiInput(cmd.label)}
                                className="w-full text-left p-2.5 rounded-lg border border-neutral-200/40 dark:border-white/5 bg-white dark:bg-black/20 hover:border-focus-neon hover:bg-focus-neon/5 transition-all text-xs"
                              >
                                <p className="font-bold text-text-primary dark:text-white flex items-center gap-1">
                                  <Sparkles size={11} className="text-focus-neon" /> "{cmd.label}"
                                </p>
                                <p className="text-[10px] text-text-secondary mt-0.5">{cmd.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-focus-neon/10 border border-focus-neon/20 rounded-xl flex gap-2.5 items-center">
                          <Flame className="text-focus-neon shrink-0 animate-bounce" size={18} />
                          <p className="text-[10.5px] text-text-secondary leading-snug">
                            <strong>İpucu:</strong> Komutları sağdaki terminale doğrudan yazarak anlık tepkileri gözlemleyebilirsiniz!
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Large Interactive Chat Console */}
                      <div className="lg:col-span-2 rounded-2xl border border-neutral-200/20 dark:border-white/5 bg-white dark:bg-neutral-900/20 flex flex-col overflow-hidden h-full">
                        <div className="p-3 border-b border-neutral-200/20 dark:border-white/5 bg-neutral-100/50 dark:bg-black/30 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-text-secondary">CO-PILOT AI PIPELINE ENGINE</span>
                          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>

                        {/* Message Box */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[250px]">
                          {aiLogs.map((log, i) => (
                            <div
                              key={i}
                              className={`flex flex-col max-w-[85%] ${
                                log.sender === 'user' ? 'ml-auto items-end' : 'items-start'
                              }`}
                            >
                              <span className="text-[9px] text-text-secondary font-mono mb-1">{log.sender.toUpperCase()} ({log.time})</span>
                              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                log.sender === 'user'
                                  ? 'bg-focus-neon text-white dark:text-black font-bold'
                                  : log.sender === 'ai'
                                    ? 'bg-purple-500/10 text-text-primary dark:text-purple-300 border border-purple-500/25'
                                    : 'bg-neutral-100 dark:bg-black/40 text-text-secondary border border-neutral-200 dark:border-white/5'
                              }`}>
                                {log.text}
                              </div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Interactive Form */}
                        <form onSubmit={handleAiSubmit} className="p-3 border-t border-neutral-200/20 dark:border-white/5 bg-neutral-50 dark:bg-black/20 flex gap-2">
                          <input
                            type="text"
                            placeholder="AI Co-Pilot'a bir sistem talimatı yazın..."
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            className="flex-1 bg-white dark:bg-neutral-950/85 border border-neutral-200/30 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white placeholder-text-secondary/40 focus:outline-none focus:border-focus-neon"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-focus-neon text-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Send size={14} /> Gönder
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: UI-UX & ANIMATIONS */}
                  {activeTab === 'ui-ux' && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-neutral-100/30 dark:bg-white/[0.01] border border-neutral-200/20 dark:border-white/5 space-y-6">
                        <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                          <Sliders size={18} className="text-focus-neon" /> Arayüz ve Animasyon Dinamik Kalibrasyonu
                        </h3>

                        {/* Transition duration */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-xs font-bold text-text-secondary">Global Animasyon Hız Çarpanı</label>
                            <span className="text-xs font-bold text-focus-neon">{settings['ui.animation_speed']?.value || '0.4s'}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: '0.2s', label: 'Yıldırım Hızı (0.2s)' },
                              { id: '0.4s', label: 'Standart Akıcı (0.4s)' },
                              { id: '0.8s', label: 'Sinematik Ağır (0.8s)' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => updateSetting('ui.animation_speed', opt.id)}
                                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                                  settings['ui.animation_speed']?.value === opt.id
                                    ? 'bg-focus-neon text-white dark:text-black border-focus-neon'
                                    : 'bg-transparent text-text-primary dark:text-white border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Glass blur slider */}
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between">
                            <label className="text-xs font-bold text-text-secondary">Cam Bulanıklık Düzeyi (Glassmorphism Blur)</label>
                            <span className="text-xs font-bold text-focus-neon">{settings['ui.glass_blur']?.value ?? 25}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={settings['ui.glass_blur']?.value ?? 25}
                            onChange={(e) => updateSetting('ui.glass_blur', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-neutral-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-focus-neon"
                          />
                          <p className="text-[10px] text-text-secondary">Cam panellerin arkasındaki buzlu cam (blur) düzeyini anlık ayarlar. Performans için düşük değerler önerilir.</p>
                        </div>

                        {/* Default Sidebar State */}
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-bold text-text-secondary">Uygulama Açılışında Sol Menü Başlangıç Durumu</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: 'expanded', label: 'Genişletilmiş (Açık)' },
                              { id: 'collapsed', label: 'Daraltılmış (Kapalı)' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => updateSetting('ui.sidebar_default', opt.id)}
                                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                                  settings['ui.sidebar_default']?.value === opt.id
                                    ? 'bg-focus-neon text-white dark:text-black border-focus-neon'
                                    : 'bg-transparent text-text-primary dark:text-white border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ADVANCED FINANCE SETTINGS */}
                  {activeTab === 'finance-settings' && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-neutral-100/30 dark:bg-white/[0.01] border border-neutral-200/20 dark:border-white/5 space-y-6">
                        <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                          <DollarSign size={18} className="text-focus-neon" /> Finansal Kontrol ve Limit Ayarları
                        </h3>

                        {/* Default Currency */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary">Varsayılan Para Birimi</label>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { id: 'TRY', label: '₺ (TL)' },
                              { id: 'USD', label: '$ (Dolar)' },
                              { id: 'EUR', label: '€ (Euro)' },
                              { id: 'GBP', label: '£ (Sterlin)' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => updateSetting('finance.default_currency', opt.id)}
                                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                                  settings['finance.default_currency']?.value === opt.id
                                    ? 'bg-focus-neon text-white dark:text-black border-focus-neon'
                                    : 'bg-transparent text-text-primary dark:text-white border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Budget warning threshold */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-xs font-bold text-text-secondary">Aylık Bütçe Aşım Uyarı Eşiği</label>
                            <span className="text-xs font-bold text-focus-neon">% {settings['finance.budget_alert_threshold']?.value || 80} Doluluk</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={settings['finance.budget_alert_threshold']?.value || 80}
                            onChange={(e) => updateSetting('finance.budget_alert_threshold', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-neutral-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-focus-neon"
                          />
                          <p className="text-[10px] text-text-secondary">Giderleriniz, atadığınız bütçenin bu yüzdesine eriştiğinde sistem otomatik olarak akıllı finansal uyarıları tetikler.</p>
                        </div>

                        {/* Auto save rate */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-xs font-bold text-text-secondary">Otomatik Yatırım/Birikim Payı Oranı</label>
                            <span className="text-xs font-bold text-focus-neon">% {settings['finance.auto_save_rate']?.value || 15}</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            value={settings['finance.auto_save_rate']?.value || 15}
                            onChange={(e) => updateSetting('finance.auto_save_rate', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-neutral-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-focus-neon"
                          />
                          <p className="text-[10px] text-text-secondary">Gelen her gelirin otomatik olarak ayrılmasını simüle ettiğiniz birikim havuzu hedef oranı.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: DIAGNOSTICS & SYSTEM HEALTH */}
                  {activeTab === 'diagnostics' && (
                    <div className="space-y-6">
                      {/* Telemetry counters */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bento-card flex flex-col justify-between h-[100px]">
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                            <Cpu size={12} className="text-focus-neon" /> İşlemci Yükü
                          </span>
                          <span className="text-2xl font-black font-mono text-text-primary dark:text-white">{stats.cpu}%</span>
                        </div>

                        <div className="p-4 bento-card flex flex-col justify-between h-[100px]">
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                            <HardDrive size={12} className="text-focus-neon" /> Bellek Kullanımı
                          </span>
                          <span className="text-2xl font-black font-mono text-text-primary dark:text-white">{stats.ram}%</span>
                        </div>

                        <div className="p-4 bento-card flex flex-col justify-between h-[100px]">
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                            <Activity size={12} className="text-focus-neon" /> Gecikme (Latency)
                          </span>
                          <span className="text-2xl font-black font-mono text-text-primary dark:text-white">{stats.latency} ms</span>
                        </div>

                        <div className="p-4 bento-card flex flex-col justify-between h-[100px]">
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                            <HardDrive size={12} className="text-focus-neon" /> Önbellek Durumu
                          </span>
                          <span className="text-2xl font-black font-mono text-text-primary dark:text-white">{stats.cachePercent}%</span>
                        </div>
                      </div>

                      {/* Health Advice Alerts */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">Sistem Tanı & Optimizasyon Raporu</h4>
                        <div className="space-y-2">
                          {getSystemHealthAdvice().map((advice, idx) => (
                            <div
                              key={advice.id || idx}
                              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                                advice.type === 'warning'
                                  ? 'bg-rose-500/5 border-rose-500/10'
                                  : advice.type === 'success'
                                    ? 'bg-emerald-500/5 border-emerald-500/10'
                                    : 'bg-neutral-100/60 dark:bg-white/[0.01] border-neutral-200/20 dark:border-white/5'
                              }`}
                            >
                              <div className="flex gap-3 items-start sm:items-center">
                                {advice.type === 'warning' ? (
                                  <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
                                ) : advice.type === 'success' ? (
                                  <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                                ) : (
                                  <HelpIcon size={18} className="text-focus-neon shrink-0 mt-0.5 sm:mt-0" />
                                )}
                                <div>
                                  <h5 className={`text-xs font-bold ${advice.type === 'warning' ? 'text-rose-400' : 'text-text-primary dark:text-white'}`}>{advice.title}</h5>
                                  <p className="text-[10.5px] text-text-secondary mt-0.5">{advice.message}</p>
                                </div>
                              </div>

                              {advice.actionLabel && advice.actionKey && (
                                <button
                                  onClick={() => updateSetting(advice.actionKey!, advice.actionValue)}
                                  className="px-3 py-1.5 rounded-lg bg-focus-neon text-white dark:text-black font-bold text-[10px] shadow-sm hover:scale-105 active:scale-95 transition-all self-start sm:self-center shrink-0"
                                >
                                  {advice.actionLabel}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cache Flush Panel */}
                      <div className="p-5 rounded-2xl border border-neutral-200/20 dark:border-white/5 bg-neutral-100/20 dark:bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">LocalStorage Önbellek Depolama</h4>
                          <p className="text-xs text-text-secondary mt-1">
                            Önbellekte şu anda <strong>{storageMetrics.keyCount} adet veri anahtarı</strong> ({storageMetrics.usedBytes} bayt) depolanıyor. Sistem şifre ve kritik kimlik bilgilerini sıfırlamadan yer açabilirsiniz.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            clearSystemCache();
                            alert('Sistem LocalStorage önbelleği başarıyla temizlendi ve temel korumalı ayarlar geri yüklendi.');
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-xs hover:bg-rose-500 hover:text-white transition-all shrink-0 self-start sm:self-center"
                        >
                          Önbelleği Boşalt
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: USER PROFILE */}
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

                  {/* TAB 7: SECURITY */}
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

                  {/* TAB 8: PRIVACY */}
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
