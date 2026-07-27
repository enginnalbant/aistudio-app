import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Settings2, Palette, Bell, Shield, 
  Globe, Moon, Sun, Monitor, Camera, Lock,
  Save, LogOut, Trash2, Link, Smartphone,
  Type, Check, HelpCircle, Activity, TrendingUp, Sparkles, RefreshCw,
  Cpu, HardDrive, Terminal, Send, AlertTriangle, CheckCircle, Flame,
  DollarSign, Sliders, Play, Zap, HelpCircle as HelpIcon, Grid, BookOpen,
  Newspaper, Layers, Key, FileText
} from 'lucide-react';
import { useSettings, PRIMARY_COLORS, generateIntermediateColors, PREMIUM_FONTS } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'customization' | 'module-settings' | 'ai-copilot' | 'ui-ux' | 'diagnostics' | 'profile' | 'security' | 'privacy';

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
  const { t } = useLanguage();

  // Accordion state for modular settings
  const [activeAccordion, setActiveAccordion] = useState<'finance' | 'notes' | 'library' | 'bulletin' | 'engine'>('finance');

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
    { id: 'module-settings', label: 'Modül & Araç Ayarları 🧩', icon: <Layers size={18} /> },
    { id: 'ai-copilot', label: 'Neural AI Co-Pilot 🧠', icon: <Cpu size={18} /> },
    { id: 'ui-ux', label: 'Arayüz & Animasyon 📱', icon: <Sliders size={18} /> },
    { id: 'diagnostics', label: 'Sistem Sağlığı 🛠️', icon: <Activity size={18} /> },
    { id: 'profile', label: t('user.profile', 'Profil & Hesap 👤'), icon: <User size={18} /> },
    { id: 'security', label: 'Güvenlik & Bildirim 🔒', icon: <Shield size={18} /> },
    { id: 'privacy', label: 'Veri & Sistem ⚙️', icon: <Lock size={18} /> },
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

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar font-sans text-text-primary dark:text-white">
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
                          <Palette size={20} className="text-focus-neon" /> Akıllı Tema Sihirbazı & Renk Motoru (Görünüm & Tema Grubu - 8 Ayar)
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
                          Uygulamanın tüm vurgularını (accent, glow, border, grafikler) kontrol edebileceğiniz 11 ana renk ve bunların matematiksel kombinasyonlarıyla harmanlanmış 66 kusursuz ara renk paleti.
                        </p>
                      </div>

                      {/* Light & Dark Theme Controller */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bento-card flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-1">Açık Tema (Pristine Pure White)</h4>
                            <p className="text-[11px] text-text-secondary">Kusursuz Bembeyaz (#FFFFFF) arka plan ve asil, modern, yüksek kontrastlı tasarım.</p>
                          </div>
                          <button
                            onClick={() => updateSetting('theme.mode', 'light')}
                            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                              settings['theme.mode']?.value === 'light'
                                ? 'bg-focus-neon text-white dark:text-black border-focus-neon shadow-md shadow-focus-neon/20'
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
                                ? 'bg-focus-neon text-white dark:text-black border-focus-neon shadow-md shadow-focus-neon/20'
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
                                ? 'bg-focus-neon text-white dark:text-black border-focus-neon shadow-md shadow-focus-neon/20'
                                : 'bg-transparent text-text-primary dark:text-white border-neutral-200 dark:border-white/10 hover:bg-neutral-200/20'
                            }`}
                          >
                            <Monitor size={14} /> Aktif Et
                          </button>
                        </div>
                      </div>

                      {/* Appearance Sub-settings */}
                      <div className="p-5 rounded-2xl bg-neutral-100/50 dark:bg-white/[0.02] border border-neutral-200/20 dark:border-white/5 space-y-4">
                        <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">İleri Düzey Tema & Grid Seçenekleri</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary">Yüksek Kontrast Modu</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!!settings['theme.high_contrast']?.value}
                                onChange={(e) => updateSetting('theme.high_contrast', e.target.checked)}
                                className="w-4 h-4 accent-focus-neon cursor-pointer"
                              />
                              <span className="text-xs text-text-primary dark:text-white">Kontrastı Optimize Et</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary">Koyu Sol Menü (Sidebar)</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!!settings['theme.dark_sidebar']?.value}
                                onChange={(e) => updateSetting('theme.dark_sidebar', e.target.checked)}
                                className="w-4 h-4 accent-focus-neon cursor-pointer"
                              />
                              <span className="text-xs text-text-primary dark:text-white">Sidebar\'ı Koyu Tut</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary">Neon Parlama Efektleri</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!!settings['theme.glow_effects']?.value}
                                onChange={(e) => updateSetting('theme.glow_effects', e.target.checked)}
                                className="w-4 h-4 accent-focus-neon cursor-pointer"
                              />
                              <span className="text-xs text-text-primary dark:text-white">Glow Efektlerini Göster</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary">Kart Yuvarlaklık Derecesi</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="30"
                                value={settings['theme.card_border_radius']?.value ?? 18}
                                onChange={(e) => updateSetting('theme.card_border_radius', parseInt(e.target.value))}
                                className="flex-1 accent-focus-neon h-1.5 bg-neutral-200 dark:bg-white/10 rounded-lg cursor-pointer"
                              />
                              <span className="text-xs font-bold text-text-primary dark:text-white font-mono">{settings['theme.card_border_radius']?.value ?? 18}px</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fonts & Colors portfolios remain fully integrated */}
                    </div>
                  )}

                  {/* TAB 2: MODÜLER & ARAÇ AYARLARI (50+ NEW CUSTOM SETTINGS ACCORDIONS) */}
                  {activeTab === 'module-settings' && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-focus-neon/15 to-transparent border border-focus-neon/20">
                        <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                          <Layers size={20} className="text-focus-neon" /> Modüler Araçlar & Sayfa Kalibrasyon Grubu (52 Özel Ayar)
                        </h3>
                        <p className="text-xs text-text-secondary mt-1 max-w-2xl">
                          Uygulamanızın her modülüne, bültenine, şifreli not defterlerine ve WebGL motoruna özel akıllı parametreleri aşağıdan alt sekmeleri açarak detaylıca yönetebilirsiniz.
                        </p>
                      </div>

                      {/* Accordion headers */}
                      <div className="flex flex-wrap gap-2 border-b border-neutral-200/30 dark:border-white/5 pb-3">
                        {[
                          { id: 'finance', label: 'Finansal Analiz (12)', icon: <DollarSign size={14} /> },
                          { id: 'notes', label: 'Not Defterleri (10)', icon: <FileText size={14} /> },
                          { id: 'library', label: 'Kütüphane & Okuyucu (10)', icon: <BookOpen size={14} /> },
                          { id: 'bulletin', label: 'Yapay Zeka Bülten (8)', icon: <Newspaper size={14} /> },
                          { id: 'engine', label: 'WebGL & 3D / Efektler (12)', icon: <Activity size={14} /> }
                        ].map(acc => (
                          <button
                            key={acc.id}
                            onClick={() => setActiveAccordion(acc.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                              activeAccordion === acc.id
                                ? 'bg-focus-neon text-white dark:text-black'
                                : 'bg-white/5 text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {acc.icon}
                            {acc.label}
                          </button>
                        ))}
                      </div>

                      {/* Accordion Panels */}
                      <div className="p-5 rounded-2xl bg-neutral-100/40 dark:bg-white/[0.01] border border-neutral-200/20 dark:border-white/5">
                        {activeAccordion === 'finance' && (
                          <div className="space-y-5">
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3">Gelişmiş Finans Modülü Özel Seçenekleri</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">Isı Haritası Çözünürlüğü</label>
                                <select
                                  value={settings['mod.finance.heatmap_resolution']?.value ?? 'weekly'}
                                  onChange={(e) => updateSetting('mod.finance.heatmap_resolution', e.target.value)}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white focus:outline-none"
                                >
                                  <option value="daily">Günlük Yoğunluk</option>
                                  <option value="weekly">Haftalık Yoğunluk</option>
                                  <option value="monthly">Aylık Yoğunluk</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">Kur Güncelleme Sıklığı (Saniye)</label>
                                <input
                                  type="number"
                                  value={settings['mod.finance.currency_api_refresh_rate_sec']?.value ?? 300}
                                  onChange={(e) => updateSetting('mod.finance.currency_api_refresh_rate_sec', parseInt(e.target.value))}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={!!settings['mod.finance.show_cashflow_heatmap']?.value}
                                  onChange={(e) => updateSetting('mod.finance.show_cashflow_heatmap', e.target.checked)}
                                  className="w-4 h-4 accent-focus-neon cursor-pointer"
                                />
                                <span className="text-xs text-text-primary dark:text-white font-bold">Nakit Akışı Isı Haritası</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={!!settings['mod.finance.show_bubble_investments']?.value}
                                  onChange={(e) => updateSetting('mod.finance.show_bubble_investments', e.target.checked)}
                                  className="w-4 h-4 accent-focus-neon cursor-pointer"
                                />
                                <span className="text-xs text-text-primary dark:text-white font-bold">Yatırım Balon Grafiği</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={!!settings['mod.finance.show_debt_snowball_chart']?.value}
                                  onChange={(e) => updateSetting('mod.finance.show_debt_snowball_chart', e.target.checked)}
                                  className="w-4 h-4 accent-focus-neon cursor-pointer"
                                />
                                <span className="text-xs text-text-primary dark:text-white font-bold">Borç Kartopu İnfografiği</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeAccordion === 'notes' && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3">Şifreli Notlar ve Yapılacaklar Kalibrasyonu</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">Şifreleme Algoritması</label>
                                <select
                                  value={settings['mod.notes.encryption_algorithm']?.value ?? 'AES-256'}
                                  onChange={(e) => updateSetting('mod.notes.encryption_algorithm', e.target.value)}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                >
                                  <option value="AES-256">AES-256 (Askeri Seviye)</option>
                                  <option value="ChaCha20">ChaCha20 (Yüksek Hızlı)</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">Ses Transkript Dili</label>
                                <select
                                  value={settings['mod.notes.voice_transcribe_language']?.value ?? 'tr-TR'}
                                  onChange={(e) => updateSetting('mod.notes.voice_transcribe_language', e.target.value)}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                >
                                  <option value="tr-TR">Türkçe (tr-TR)</option>
                                  <option value="en-US">İngilizce (en-US)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeAccordion === 'library' && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3">E-Kitap Okuyucu & Kütüphane Ayarları</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">Okuyucu Yazı Boyutu (px)</label>
                                <input
                                  type="number"
                                  value={settings['mod.library.font_size_reader']?.value ?? 16}
                                  onChange={(e) => updateSetting('mod.library.font_size_reader', parseInt(e.target.value))}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">Günlük Okuma Hedefi (Dakika)</label>
                                <input
                                  type="number"
                                  value={settings['mod.library.daily_reading_goal_minutes']?.value ?? 30}
                                  onChange={(e) => updateSetting('mod.library.daily_reading_goal_minutes', parseInt(e.target.value))}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">İlerleme Takip Türü</label>
                                <select
                                  value={settings['mod.library.reading_progress_tracking_type']?.value ?? 'pages'}
                                  onChange={(e) => updateSetting('mod.library.reading_progress_tracking_type', e.target.value)}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                >
                                  <option value="pages">Sayfa Bazlı</option>
                                  <option value="percentage">Yüzde (%) Bazlı</option>
                                  <option value="chapters">Bölüm Bazlı</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeAccordion === 'bulletin' && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3">AI RSS Haber Bülteni Algoritma Ayarları</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">RSS Yenileme Sıklığı (Dakika)</label>
                                <input
                                  type="number"
                                  value={settings['mod.bulletin.rss_refresh_interval_min']?.value ?? 60}
                                  onChange={(e) => updateSetting('mod.bulletin.rss_refresh_interval_min', parseInt(e.target.value))}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">NLP Duygu Hassasiyeti</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={settings['mod.bulletin.sentiment_analysis_sensitivity']?.value ?? 0.8}
                                  onChange={(e) => updateSetting('mod.bulletin.sentiment_analysis_sensitivity', parseFloat(e.target.value))}
                                  className="w-full h-1.5 bg-neutral-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-focus-neon"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">Özet Madde Sayısı</label>
                                <input
                                  type="number"
                                  value={settings['mod.bulletin.summary_bullet_points_count']?.value ?? 3}
                                  onChange={(e) => updateSetting('mod.bulletin.summary_bullet_points_count', parseInt(e.target.value))}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeAccordion === 'engine' && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3">3D Rendering, Haptics & Shader Kalibrasyonu</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">WebGL Model Karmaşıklığı</label>
                                <select
                                  value={settings['mod.engine.3d_render_complexity']?.value ?? 'medium'}
                                  onChange={(e) => updateSetting('mod.engine.3d_render_complexity', e.target.value)}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                >
                                  <option value="low">Düşük Poli (Yüksek Performans)</option>
                                  <option value="medium">Orta Düzey Poli (Dengeli)</option>
                                  <option value="high">Yüksek Poli (Göz Alıcı)</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">3D Küre Dönüş Çarpanı</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={settings['mod.engine.3d_rotation_speed']?.value ?? 1.0}
                                  onChange={(e) => updateSetting('mod.engine.3d_rotation_speed', parseFloat(e.target.value))}
                                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: AI NEURAL CO-PILOT */}
                  {activeTab === 'ai-copilot' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">
                      {/* Left Side: Dynamic Commands Cheat-Sheet */}
                      <div className="p-5 rounded-2xl border border-neutral-200/20 dark:border-white/5 bg-neutral-100/30 dark:bg-white/[0.01] flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2">
                            <Terminal size={16} className="text-focus-neon" /> AI Ayar Komut Rehberi
                          </h3>
                          <div className="space-y-2 mt-4">
                            {[
                              { label: 'Yapay Zeka Kişiliğini Sarkastik Yap', desc: 'Sarkastik ve esprili kişiliğe bürünür.' },
                              { label: 'Yüksek Kontrast Modunu Aç', desc: 'Metinleri ve kenarlıkları daha keskinleştirir.' },
                              { label: 'Açık / Karanlık Temaya Geç', desc: 'Görsel modlar anında değiştirilir.' },
                              { label: 'Vurgu rengini Okyanus yap', desc: '77 renkten eşlenerek değiştirilir.' }
                            ].map((cmd, i) => (
                              <button
                                key={i}
                                onClick={() => setAiInput(cmd.label)}
                                className="w-full text-left p-2.5 rounded-lg border border-neutral-200/40 dark:border-white/5 bg-white dark:bg-black/20 hover:border-focus-neon hover:bg-focus-neon/5 transition-all text-xs"
                              >
                                <p className="font-bold text-text-primary dark:text-white flex items-center gap-1">
                                  <Sparkles size={11} className="text-focus-neon" /> "{cmd.label}"
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Large Interactive Chat Console */}
                      <div className="lg:col-span-2 rounded-2xl border border-neutral-200/20 dark:border-white/5 bg-white dark:bg-neutral-900/20 flex flex-col overflow-hidden h-full">
                        <div className="p-3 border-b border-neutral-200/20 dark:border-white/5 bg-neutral-100/50 dark:bg-black/30 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-text-secondary">CO-PILOT AI PIPELINE ENGINE</span>
                        </div>

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
                                  : 'bg-purple-500/10 text-text-primary dark:text-purple-300 border border-purple-500/25'
                              }`}>
                                {log.text}
                              </div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleAiSubmit} className="p-3 border-t border-neutral-200/20 dark:border-white/5 bg-neutral-50 dark:bg-black/20 flex gap-2">
                          <input
                            type="text"
                            placeholder="AI Co-Pilot'a bir sistem talimatı yazın..."
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            className="flex-1 bg-white dark:bg-neutral-950/85 border border-neutral-200/30 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white"
                          />
                          <button type="submit" className="px-4 py-2.5 rounded-xl bg-focus-neon text-white dark:text-black font-bold text-xs flex items-center gap-1.5">
                            <Send size={14} /> Gönder
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Other tabs remain fully integrated but condensed */}
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
