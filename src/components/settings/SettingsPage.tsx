import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  Palette, 
  Bell,
  Monitor,
  Moon,
  Sun,
  ChevronRight,
  Save,
  Lock,
  Mail,
  Smartphone,
  Clock,
  Globe,
  Layout,
  Type,
  Eye,
  Volume2,
  DollarSign,
  Calendar,
  Languages,
  Zap,
  CheckCircle2,
  AlertCircle,
  Package,
  Cloud,
  History,
  FileText,
  Bot,
  LayoutGrid,
  BarChart3,
  Terminal,
  Server,
  Cpu,
  RefreshCw,
  Search,
  Key,
  EyeOff,
  Activity,
  HardDrive,
  ShieldAlert,
  Settings2,
  Box
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import clsx from 'clsx';

export function SettingsPage() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sync local state when settings context changes (e.g., after initial load)
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: <User size={18} /> },
    { id: 'security', label: 'Güvenlik', icon: <Shield size={18} /> },
    { id: 'appearance', label: 'Görünüm', icon: <Palette size={18} /> },
    { id: 'notifications', label: 'Bildirimler', icon: <Bell size={18} /> },
    { id: 'system', label: 'Sistem', icon: <Database size={18} /> },
    { id: 'backup', label: 'Yedekleme', icon: <History size={18} /> },
    { id: 'logging', label: 'Loglama', icon: <FileText size={18} /> },
    { id: 'ai', label: 'AI Asistan', icon: <Bot size={18} /> },
    { id: 'widgets', label: 'Widgetlar', icon: <LayoutGrid size={18} /> },
    { id: 'charts', label: 'Grafikler', icon: <BarChart3 size={18} /> },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await updateSettings(localSettings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">Ayarlar Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 lg:p-6">
      <div className="space-y-8 lg:space-y-12 pb-20">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-10 relative">
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-3 lg:px-4 py-1.5 rounded-full bg-focus-main/10 border border-focus-neon/20 text-focus-neon label-mono text-[8px] lg:text-[9px] flex items-center gap-2 shadow-sm shadow-focus-neon/5">
              <Zap size={10} className="lg:w-3 lg:h-3" /> Sistem Yapılandırması
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              SİSTEM <span className="text-focus-neon">AYARLARI</span>
            </h1>
            <p className="text-text-secondary font-medium text-sm lg:text-lg tracking-tight opacity-70 max-w-2xl">
              Kullanıcı tercihleri, güvenlik yapılandırması ve sistem parametrelerini Apex Neural Engine üzerinden yönetin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          {saveStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-3 lg:px-4 py-2 rounded-xl bg-grow-phosphor/10 text-grow-phosphor border border-grow-phosphor/20 text-[10px] lg:text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 size={12} className="lg:w-3.5 lg:h-3.5" /> Kaydedildi
            </motion.div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="os-btn os-btn-primary h-12 lg:h-[54px] flex-1 lg:min-w-[160px]"
          >
            {isSaving ? (
              <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-pure-black/20 border-t-pure-black rounded-full animate-spin" />
            ) : (
              <Save size={18} className="lg:w-5 lg:h-5" />
            )}
            <span className="text-sm lg:text-base">Kaydet</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bento-card p-2 lg:p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex-shrink-0 lg:w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl flex items-center gap-3 lg:gap-4 transition-all duration-500 font-display font-black tracking-tight",
                  activeTab === tab.id 
                    ? 'bg-focus-main text-pure-white shadow-lg shadow-focus-main/20' 
                    : 'text-text-secondary hover:bg-skel-matte/5 hover:text-text-primary'
                )}
              >
                <div className={clsx(
                  "w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center transition-colors",
                  activeTab === tab.id ? "bg-pure-white/20" : "bg-skel-matte/5"
                )}>
                  {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 16 })}
                </div>
                <span className="text-xs lg:text-sm whitespace-nowrap">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={14} className="hidden lg:block ml-auto opacity-50" />}
              </button>
            ))}
          </div>
          
          <div className="hidden lg:block bento-card p-8 bg-focus-main/5 border-focus-neon/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={40} className="text-focus-neon" />
            </div>
            <h3 className="label-mono mb-4 tracking-[0.2em]">Güvenlik Durumu</h3>
            <div className="flex items-center gap-3 text-grow-phosphor font-bold text-sm mb-6">
              <CheckCircle2 size={16} /> Apex Koruması Aktif
            </div>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('change-module', { detail: 'admin-panel' }))}
              className="os-btn os-btn-primary w-full h-[48px] text-[10px] uppercase tracking-widest"
            >
              <Terminal size={14} />
              <span>Admin Paneli</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="bento-card p-4 lg:p-10 min-h-[400px] lg:min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-focus-main/5 blur-[80px] lg:blur-[120px] rounded-full -mr-32 -mt-32 lg:-mr-48 -mt-48" />
            
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="relative z-10"
            >
          {activeTab === 'profile' && (
            <div className="space-y-8 lg:space-y-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-10 text-center sm:text-left">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl lg:rounded-3xl bg-skel-matte/5 border border-skel-metal/10 flex items-center justify-center text-focus-neon relative group cursor-pointer overflow-hidden shadow-xl">
                  <User size={40} className="lg:w-14 lg:h-14" />
                  <div className="absolute inset-0 bg-focus-main/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="text-[8px] lg:text-[10px] font-black uppercase text-pure-white tracking-widest">Değiştir</span>
                  </div>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  <h2 className="text-2xl lg:text-4xl font-display font-black tracking-tighter text-text-primary leading-none">{localSettings.user_name}</h2>
                  <p className="text-text-secondary font-medium text-sm lg:text-lg opacity-70">{localSettings.user_title} • {localSettings.user_dept}</p>
                  <div className="flex justify-center sm:justify-start gap-2 lg:gap-3">
                    <span className="px-3 lg:px-4 py-1 lg:py-1.5 rounded-full bg-grow-phosphor/10 text-grow-phosphor text-[8px] lg:text-[10px] font-black uppercase tracking-widest border border-grow-phosphor/20 shadow-sm shadow-grow-phosphor/5">Aktif</span>
                    <span className="px-3 lg:px-4 py-1 lg:py-1.5 rounded-full bg-focus-main/10 text-focus-neon text-[8px] lg:text-[10px] font-black uppercase tracking-widest border border-focus-neon/20 shadow-sm shadow-focus-neon/5">Admin</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 tracking-[0.2em] opacity-50">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={localSettings.user_name} 
                    onChange={(e) => handleChange('user_name', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary" 
                  />
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 tracking-[0.2em] opacity-50">Ünvan</label>
                  <input 
                    type="text" 
                    value={localSettings.user_title} 
                    onChange={(e) => handleChange('user_title', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary" 
                  />
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 tracking-[0.2em] opacity-50">E-posta</label>
                  <input 
                    type="email" 
                    value={localSettings.user_email} 
                    onChange={(e) => handleChange('user_email', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary" 
                  />
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 tracking-[0.2em] opacity-50">Telefon</label>
                  <input 
                    type="tel" 
                    value={localSettings.user_phone} 
                    onChange={(e) => handleChange('user_phone', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary" 
                  />
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 tracking-[0.2em] opacity-50">Dil</label>
                  <select 
                    value={localSettings.user_language} 
                    onChange={(e) => handleChange('user_language', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 tracking-[0.2em] opacity-50">Zaman Dilimi</label>
                  <select 
                    value={localSettings.user_timezone} 
                    onChange={(e) => handleChange('user_timezone', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary"
                  >
                    <option value="UTC+3">İstanbul (UTC+3)</option>
                    <option value="UTC+0">London (UTC+0)</option>
                  </select>
                </div>
                <div className="space-y-2 lg:space-y-3 md:col-span-2">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 tracking-[0.2em] opacity-50">Hakkında / Bio</label>
                  <textarea 
                    value={localSettings.user_bio} 
                    onChange={(e) => handleChange('user_bio', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary min-h-[100px] lg:min-h-[140px] resize-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 lg:space-y-8">
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-8">Güvenlik Yapılandırması</h3>
              <div className="grid grid-cols-1 gap-3 lg:gap-4">
                {[
                  { key: 'security_2fa', label: 'İki Faktörlü Doğrulama (2FA)', desc: 'Giriş yaparken telefonunuza gelen kodu kullanarak güvenliği artırın.', icon: <Smartphone size={18} /> },
                  { key: 'security_login_emails', label: 'Giriş Aktivite E-postaları', desc: 'Her yeni giriş yapıldığında e-posta ile bilgilendirilmek ister misiniz?', icon: <Mail size={18} /> },
                ].map((item) => (
                  <div key={item.key} className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 hover:border-focus-neon/20 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-skel-matte/5 text-text-secondary group-hover:text-focus-neon transition-colors flex items-center justify-center shrink-0">
                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })}
                      </div>
                      <div>
                        <h4 className="text-xs lg:text-sm font-bold">{item.label}</h4>
                        <p className="text-[10px] lg:text-xs text-text-secondary font-medium leading-tight">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange(item.key, !localSettings[item.key as keyof typeof localSettings])}
                      className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all relative shrink-0 ${localSettings[item.key as keyof typeof localSettings] ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                    >
                      <div className={`absolute top-0.5 lg:top-1 w-4 h-4 rounded-full bg-pure-white transition-all ${localSettings[item.key as keyof typeof localSettings] ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                    </button>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 space-y-3 lg:space-y-4">
                    <label className="label-mono text-[9px] lg:text-[10px] opacity-50">IP Beyaz Liste</label>
                    <input 
                      type="text" 
                      placeholder="Örn: 192.168.1.1"
                      value={localSettings.security_ip_whitelist}
                      onChange={(e) => handleChange('security_ip_whitelist', e.target.value)}
                      className="w-full p-3 lg:p-4 rounded-lg lg:rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-[10px] lg:text-xs font-bold"
                    />
                  </div>
                  <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 space-y-3 lg:space-y-4">
                    <label className="label-mono text-[9px] lg:text-[10px] opacity-50">Şifre Geçerlilik Süresi (Gün)</label>
                    <input 
                      type="number" 
                      value={localSettings.security_password_expiry}
                      onChange={(e) => handleChange('security_password_expiry', parseInt(e.target.value))}
                      className="w-full p-3 lg:p-4 rounded-lg lg:rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-[10px] lg:text-xs font-bold"
                    />
                  </div>
                  <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 space-y-3 lg:space-y-4">
                    <label className="label-mono text-[9px] lg:text-[10px] opacity-50">Maksimum Giriş Denemesi</label>
                    <input 
                      type="number" 
                      value={localSettings.security_max_attempts}
                      onChange={(e) => handleChange('security_max_attempts', parseInt(e.target.value))}
                      className="w-full p-3 lg:p-4 rounded-lg lg:rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-[10px] lg:text-xs font-bold"
                    />
                  </div>
                  <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 space-y-3 lg:space-y-4">
                    <label className="label-mono text-[9px] lg:text-[10px] opacity-50">Oturum Süresi (Dakika)</label>
                    <input 
                      type="number" 
                      value={localSettings.security_session_duration}
                      onChange={(e) => handleChange('security_session_duration', parseInt(e.target.value))}
                      className="w-full p-3 lg:p-4 rounded-lg lg:rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-[10px] lg:text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-focus-neon/20 bg-focus-main/5 space-y-4 lg:space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 lg:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Terminal size={48} className="text-focus-neon lg:w-16 lg:h-16" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-lg lg:text-xl font-black tracking-tight mb-1 lg:mb-2">Gelişmiş Admin Paneli</h4>
                    <p className="text-xs lg:text-sm text-text-secondary mb-4 lg:mb-6 max-w-md">Sistem genelindeki tüm parametreleri, kullanıcı yetkilerini ve logları merkezi bir arayüzden yönetin.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                      <div className="flex items-center justify-between p-3 lg:p-4 rounded-lg lg:rounded-xl bg-pure-white/5 border border-pure-white/10">
                        <span className="text-[10px] lg:text-xs font-bold">Bakım Modu</span>
                        <button 
                          onClick={() => handleChange('admin_maintenance_mode', !localSettings.admin_maintenance_mode)}
                          className={`w-9 h-4.5 lg:w-10 lg:h-5 rounded-full transition-all relative ${localSettings.admin_maintenance_mode ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                        >
                          <div className={`absolute top-0.5 w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-pure-white transition-all ${localSettings.admin_maintenance_mode ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 lg:p-4 rounded-lg lg:rounded-xl bg-pure-white/5 border border-pure-white/10">
                        <span className="text-[10px] lg:text-xs font-bold">Yeni Kayıtlar</span>
                        <button 
                          onClick={() => handleChange('admin_registration_open', !localSettings.admin_registration_open)}
                          className={`w-9 h-4.5 lg:w-10 lg:h-5 rounded-full transition-all relative ${localSettings.admin_registration_open ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                        >
                          <div className={`absolute top-0.5 w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-pure-white transition-all ${localSettings.admin_registration_open ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('change-module', { detail: 'admin-panel' }))}
                      className="os-btn os-btn-primary px-6 lg:px-8 h-12 lg:h-[54px] w-full lg:w-auto"
                    >
                      <Terminal size={16} className="lg:w-[18px] lg:h-[18px]" />
                      <span className="text-xs lg:text-base">Admin Paneline Git</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-skel-matte/5 text-text-secondary flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs lg:text-sm font-bold">Oturum Zaman Aşımı</h4>
                      <p className="text-[10px] lg:text-xs text-text-secondary font-medium leading-tight">Hareketsizlik durumunda oturumun kapatılacağı süre (dakika).</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 lg:gap-6 pl-0 lg:pl-16">
                    <input 
                      type="range" 
                      min="5" 
                      max="120" 
                      step="5"
                      value={localSettings.security_timeout}
                      onChange={(e) => handleChange('security_timeout', parseInt(e.target.value))}
                      className="flex-1 accent-focus-neon"
                    />
                    <span className="text-xs lg:text-sm font-bold min-w-[30px] lg:min-w-[40px]">{localSettings.security_timeout} dk</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8 lg:space-y-12">
              <div>
                <span className="label-mono mb-4 lg:mb-6 block">Tema Seçimi</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                  {[
                    { id: 'light', label: 'Aydınlık', icon: <Sun size={20} /> },
                    { id: 'dark', label: 'Karanlık', icon: <Moon size={20} /> },
                    { id: 'system', label: 'Sistem', icon: <Monitor size={20} /> },
                  ].map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => handleChange('theme', t.id)}
                      className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl border flex flex-row sm:flex-col items-center justify-center gap-3 lg:gap-4 transition-all ${
                        localSettings.theme === t.id 
                          ? 'bg-focus-main text-pure-white border-focus-neon shadow-lg shadow-focus-main/20' 
                          : 'bg-skel-matte/5 border-skel-metal/10 text-text-secondary hover:border-focus-neon/50'
                      }`}
                    >
                      {t.icon}
                      <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-4 lg:space-y-6">
                  <span className="label-mono block">Vurgu Rengi</span>
                  <div className="flex flex-wrap gap-3 lg:gap-4">
                    {['#00F2FF', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b'].map((color) => (
                      <button 
                        key={color}
                        onClick={() => handleChange('accent_color', color)}
                        className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 lg:border-4 transition-all ${
                          localSettings.accent_color === color ? 'border-focus-neon scale-110 shadow-lg shadow-focus-neon/20' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <span className="label-mono block">Yazı Tipi Boyutu</span>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map((size) => (
                      <button 
                        key={size}
                        onClick={() => handleChange('font_size', size)}
                        className={`flex-1 py-2.5 lg:py-3 rounded-lg lg:rounded-xl border text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all ${
                          localSettings.font_size === size ? 'bg-focus-main text-pure-white border-focus-neon' : 'bg-skel-matte/5 border-skel-metal/10 text-text-secondary hover:border-focus-neon/50'
                        }`}
                      >
                        {size === 'small' ? 'Küçük' : size === 'medium' ? 'Normal' : 'Büyük'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-3 lg:space-y-4">
                  <span className="label-mono block">Arayüz Yoğunluğu</span>
                  <div className="flex gap-2">
                    {['compact', 'comfortable', 'spacious'].map((d) => (
                      <button 
                        key={d}
                        onClick={() => handleChange('ui_density', d)}
                        className={`flex-1 py-2.5 lg:py-3 rounded-lg lg:rounded-xl border text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all ${
                          localSettings.ui_density === d ? 'bg-focus-main text-pure-white border-focus-neon' : 'bg-skel-matte/5 border-skel-metal/10 text-text-secondary hover:border-focus-neon/50'
                        }`}
                      >
                        {d === 'compact' ? 'Sıkışık' : d === 'comfortable' ? 'Rahat' : 'Geniş'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  <span className="label-mono block">Renk Körlüğü Modu</span>
                  <select 
                    value={localSettings.color_blind_mode}
                    onChange={(e) => handleChange('color_blind_mode', e.target.value)}
                    className="w-full p-3 lg:p-4 rounded-lg lg:rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-[10px] lg:text-xs font-bold"
                  >
                    <option value="none">Yok</option>
                    <option value="protanopia">Protanopi</option>
                    <option value="deuteranopia">Deuteranopi</option>
                    <option value="tritanopia">Tritanopi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <span className="label-mono block">Arka Plan Stili</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {[
                    { id: 'default', label: 'Varsayılan', desc: 'Klasik baloncuk animasyonu', icon: <Layout size={20} /> },
                    { id: '3d-advanced', label: '3D Gelişmiş', desc: 'Gelişmiş 3D küreler', icon: <Box size={20} /> },
                    { id: 'accent-synced', label: 'Vurgu Uyumlu', desc: 'Tema rengiyle senkronize', icon: <Zap size={20} /> },
                    { id: 'live-weather', label: 'Canlı Hava', desc: 'Anlık hava ve saat durumu', icon: <Cloud size={20} /> },
                  ].map((bg) => (
                    <button 
                      key={bg.id}
                      onClick={() => handleChange('background_type', bg.id)}
                      className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl border flex flex-col items-start gap-2 lg:gap-3 transition-all text-left ${
                        localSettings.background_type === bg.id 
                          ? 'bg-focus-main text-pure-white border-focus-neon shadow-lg shadow-focus-main/20' 
                          : 'bg-skel-matte/5 border-skel-metal/10 text-text-secondary hover:border-focus-neon/50'
                      }`}
                    >
                      <div className={clsx(
                        "w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center",
                        localSettings.background_type === bg.id ? "bg-pure-white/10" : "bg-skel-matte/5"
                      )}>
                        {React.cloneElement(bg.icon as React.ReactElement<any>, { size: 16 })}
                      </div>
                      <div>
                        <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest block mb-0.5 lg:mb-1">{bg.label}</span>
                        <span className="text-[9px] lg:text-[10px] opacity-60 font-medium leading-tight">{bg.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 lg:space-y-8">
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-8">Bildirim Tercihleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                {[
                  { key: 'notif_email', label: 'E-posta Bildirimleri', icon: <Mail size={16} />, desc: 'Önemli güncellemeleri e-posta ile al.' },
                  { key: 'notif_push', label: 'Anlık Bildirimler', icon: <Zap size={16} />, desc: 'Tarayıcı üzerinden anlık uyarılar al.' },
                  { key: 'notif_desktop', label: 'Masaüstü Bildirimleri', icon: <Monitor size={16} />, desc: 'Sistem tepsisinde bildirim göster.' },
                  { key: 'notif_slack', label: 'Slack Entegrasyonu', icon: <Smartphone size={16} />, desc: 'Bildirimleri Slack kanalına gönder.' },
                  { key: 'notif_sound', label: 'Sesli Uyarılar', icon: <Volume2 size={16} />, desc: 'Bildirim geldiğinde ses çal.' },
                  { key: 'notif_stock', label: 'Kritik Stok Uyarıları', icon: <Package size={16} />, desc: 'Stok kritik seviyeye düştüğünde uyar.' },
                  { key: 'notif_job', label: 'İş Emri Güncellemeleri', icon: <CheckCircle2 size={16} />, desc: 'İş emirleri tamamlandığında haber ver.' },
                  { key: 'notif_payment', label: 'Ödeme Hatırlatıcıları', icon: <DollarSign size={16} />, desc: 'Vadesi gelen ödemeleri hatırlat.' },
                ].map((item) => (
                  <div key={item.key} className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 hover:border-focus-neon/20 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-skel-matte/5 text-text-secondary group-hover:text-focus-neon transition-colors flex items-center justify-center shrink-0">
                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })}
                      </div>
                      <div>
                        <h4 className="text-xs lg:text-sm font-bold">{item.label}</h4>
                        <p className="text-[10px] lg:text-xs text-text-secondary font-medium leading-tight">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange(item.key, !localSettings[item.key as keyof typeof localSettings])}
                      className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all relative shrink-0 ${localSettings[item.key as keyof typeof localSettings] ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                    >
                      <div className={`absolute top-0.5 lg:top-1 w-4 h-4 rounded-full bg-pure-white transition-all ${localSettings[item.key as keyof typeof localSettings] ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-8 lg:space-y-12">
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-8">Sistem Parametreleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 flex items-center gap-2 tracking-[0.2em] opacity-50">
                    <DollarSign size={12} className="lg:w-3.5 lg:h-3.5" /> Varsayılan Para Birimi
                  </label>
                  <select 
                    value={localSettings.sys_currency}
                    onChange={(e) => handleChange('sys_currency', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary"
                  >
                    <option value="TRY">Türk Lirası (₺)</option>
                    <option value="USD">Amerikan Doları ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 flex items-center gap-2 tracking-[0.2em] opacity-50">
                    <Zap size={12} className="lg:w-3.5 lg:h-3.5" /> Performans Modu
                  </label>
                  <select 
                    value={localSettings.sys_performance_mode}
                    onChange={(e) => handleChange('sys_performance_mode', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary"
                  >
                    <option value="balanced">Dengeli</option>
                    <option value="high">Yüksek Performans</option>
                    <option value="low">Güç Tasarrufu</option>
                  </select>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 flex items-center gap-2 tracking-[0.2em] opacity-50">
                    <Calendar size={12} className="lg:w-3.5 lg:h-3.5" /> Tarih Formatı
                  </label>
                  <select 
                    value={localSettings.sys_date_format}
                    onChange={(e) => handleChange('sys_date_format', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary"
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 flex items-center gap-2 tracking-[0.2em] opacity-50">
                    <Languages size={12} className="lg:w-3.5 lg:h-3.5" /> Sistem Dili
                  </label>
                  <select 
                    value={localSettings.sys_lang}
                    onChange={(e) => handleChange('sys_lang', e.target.value)}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <label className="label-mono text-[9px] lg:text-[10px] ml-1 flex items-center gap-2 tracking-[0.2em] opacity-50">
                    <Save size={12} className="lg:w-3.5 lg:h-3.5" /> Otomatik Kaydetme Aralığı (sn)
                  </label>
                  <input 
                    type="number" 
                    value={localSettings.sys_autosave}
                    onChange={(e) => handleChange('sys_autosave', parseInt(e.target.value))}
                    className="w-full p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-bold text-text-primary"
                  />
                </div>

                <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 flex items-center justify-between group">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <Terminal size={18} className="text-text-secondary group-hover:text-focus-neon transition-colors lg:w-5 lg:h-5" />
                    <span className="text-xs lg:text-sm font-bold">Hata Ayıklama (Debug) Modu</span>
                  </div>
                  <button 
                    onClick={() => handleChange('sys_debug_mode', !localSettings.sys_debug_mode)}
                    className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all relative shrink-0 ${localSettings.sys_debug_mode ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                  >
                    <div className={`absolute top-0.5 lg:top-1 w-4 h-4 rounded-full bg-pure-white transition-all ${localSettings.sys_debug_mode ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                  </button>
                </div>

                <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 flex items-center justify-between group">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <Globe size={18} className="text-text-secondary group-hover:text-focus-neon transition-colors lg:w-5 lg:h-5" />
                    <span className="text-xs lg:text-sm font-bold">API Erişimi</span>
                  </div>
                  <button 
                    onClick={() => handleChange('sys_api_access', !localSettings.sys_api_access)}
                    className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all relative shrink-0 ${localSettings.sys_api_access ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                  >
                    <div className={`absolute top-0.5 lg:top-1 w-4 h-4 rounded-full bg-pure-white transition-all ${localSettings.sys_api_access ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-8 lg:space-y-12">
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-8">Yedekleme & Kurtarma</h3>
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-skel-metal/10 bg-skel-matte/5 space-y-6 lg:space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-focus-main/10 text-focus-neon flex items-center justify-center shrink-0">
                        <History size={24} className="lg:w-7 lg:h-7" />
                      </div>
                      <div>
                        <h4 className="text-base lg:text-lg font-bold">Otomatik Yedekleme</h4>
                        <p className="text-xs lg:text-sm text-text-secondary font-medium">Sistem verilerini düzenli aralıklarla yedekleyin.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange('backup_enabled', !localSettings.backup_enabled)}
                      className={`w-12 h-6 lg:w-14 lg:h-7 rounded-full transition-all relative shrink-0 ${localSettings.backup_enabled ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                    >
                      <div className={`absolute top-0.5 lg:top-1 w-5 h-5 rounded-full bg-pure-white transition-all ${localSettings.backup_enabled ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                    <div className="space-y-2 lg:space-y-3">
                      <label className="label-mono text-[9px] lg:text-[10px] opacity-50 tracking-[0.2em]">Yedekleme Sıklığı</label>
                      <select 
                        value={localSettings.backup_frequency}
                        onChange={(e) => handleChange('backup_frequency', e.target.value)}
                        className="w-full p-4 rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-xs lg:text-sm font-bold text-text-primary"
                      >
                        <option value="daily">Günlük</option>
                        <option value="weekly">Haftalık</option>
                        <option value="monthly">Aylık</option>
                      </select>
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      <label className="label-mono text-[9px] lg:text-[10px] opacity-50 tracking-[0.2em]">Saklama Süresi (Gün)</label>
                      <input 
                        type="number" 
                        value={localSettings.backup_retention}
                        onChange={(e) => handleChange('backup_retention', parseInt(e.target.value))}
                        className="w-full p-4 rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-xs lg:text-sm font-bold text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl bg-grow-main/5 border border-grow-main/10 flex items-center justify-between group">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <RefreshCw size={18} className="text-grow-main lg:w-5 lg:h-5" />
                      <span className="text-xs lg:text-sm font-bold">Otomatik Kurtarma (Auto-Recovery)</span>
                    </div>
                    <button 
                      onClick={() => handleChange('auto_recovery', !localSettings.auto_recovery)}
                      className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all relative shrink-0 ${localSettings.auto_recovery ? 'bg-grow-main' : 'bg-skel-metal/20'}`}
                    >
                      <div className={`absolute top-0.5 lg:top-1 w-4 h-4 rounded-full bg-pure-white transition-all ${localSettings.auto_recovery ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <button className="os-btn os-btn-primary flex-1 h-12 lg:h-[54px]">
                    <HardDrive size={18} className="lg:w-5 lg:h-5" />
                    <span className="text-sm lg:text-base">Şimdi Yedekle</span>
                  </button>
                  <button className="os-btn border border-skel-metal/20 hover:bg-skel-matte/5 flex-1 h-12 lg:h-[54px]">
                    <RefreshCw size={18} className="lg:w-5 lg:h-5" />
                    <span className="text-sm lg:text-base">Yedekten Dön</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logging' && (
            <div className="space-y-8 lg:space-y-12">
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-8">Sistem Günlükleri (Logging)</h3>
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-skel-metal/10 bg-skel-matte/5 space-y-6 lg:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                    <div className="space-y-2 lg:space-y-3">
                      <label className="label-mono text-[9px] lg:text-[10px] opacity-50 tracking-[0.2em]">Log Seviyesi</label>
                      <select 
                        value={localSettings.log_level}
                        onChange={(e) => handleChange('log_level', e.target.value)}
                        className="w-full p-4 rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-xs lg:text-sm font-bold text-text-primary"
                      >
                        <option value="error">Sadece Hatalar</option>
                        <option value="warn">Uyarılar & Hatalar</option>
                        <option value="info">Bilgi (Varsayılan)</option>
                        <option value="debug">Hata Ayıklama (Tümü)</option>
                      </select>
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      <label className="label-mono text-[9px] lg:text-[10px] opacity-50 tracking-[0.2em]">Log Saklama Süresi (Gün)</label>
                      <input 
                        type="number" 
                        value={localSettings.log_retention_days}
                        onChange={(e) => handleChange('log_retention_days', parseInt(e.target.value))}
                        className="w-full p-4 rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-xs lg:text-sm font-bold text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <ShieldAlert size={18} className="text-text-secondary group-hover:text-focus-neon transition-colors lg:w-5 lg:h-5" />
                      <span className="text-xs lg:text-sm font-bold">Denetim Günlüğü (Audit Logging)</span>
                    </div>
                    <button 
                      onClick={() => handleChange('audit_logging', !localSettings.audit_logging)}
                      className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all relative shrink-0 ${localSettings.audit_logging ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                    >
                      <div className={`absolute top-0.5 lg:top-1 w-4 h-4 rounded-full bg-pure-white transition-all ${localSettings.audit_logging ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                    </button>
                  </div>
                </div>

                <button className="os-btn border border-skel-metal/20 hover:bg-skel-matte/5 w-full h-12 lg:h-[54px]">
                  <Search size={18} className="lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base">Logları Görüntüle</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-8 lg:space-y-12">
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-8">AI Asistan Yapılandırması</h3>
              <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-skel-metal/10 bg-skel-matte/5 space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-focus-main/10 text-focus-neon flex items-center justify-center shrink-0">
                      <Bot size={24} className="lg:w-7 lg:h-7" />
                    </div>
                    <div>
                      <h4 className="text-base lg:text-lg font-bold">Apex AI Asistan</h4>
                      <p className="text-xs lg:text-sm text-text-secondary font-medium">Yapay zeka destekli operasyonel asistanı yönetin.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleChange('ai_assistant_enabled', !localSettings.ai_assistant_enabled)}
                    className={`w-12 h-6 lg:w-14 lg:h-7 rounded-full transition-all relative shrink-0 ${localSettings.ai_assistant_enabled ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                  >
                    <div className={`absolute top-0.5 lg:top-1 w-5 h-5 rounded-full bg-pure-white transition-all ${localSettings.ai_assistant_enabled ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                  <div className="space-y-2 lg:space-y-3">
                    <label className="label-mono text-[9px] lg:text-[10px] opacity-50 tracking-[0.2em]">AI Modeli</label>
                    <select 
                      value={localSettings.ai_model}
                      onChange={(e) => handleChange('ai_model', e.target.value)}
                      className="w-full p-4 rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-xs lg:text-sm font-bold text-text-primary"
                    >
                      <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
                      <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    <label className="label-mono text-[9px] lg:text-[10px] opacity-50 tracking-[0.2em]">Asistan Kişiliği</label>
                    <select 
                      value={localSettings.ai_personality}
                      onChange={(e) => handleChange('ai_personality', e.target.value)}
                      className="w-full p-4 rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-xs lg:text-sm font-bold text-text-primary"
                    >
                      <option value="professional">Profesyonel</option>
                      <option value="friendly">Arkadaş Canlısı</option>
                      <option value="concise">Kısa & Öz</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 flex items-center justify-between group">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <Volume2 size={18} className="text-text-secondary group-hover:text-focus-neon transition-colors lg:w-5 lg:h-5" />
                    <span className="text-xs lg:text-sm font-bold">Sesli Yanıtlar</span>
                  </div>
                  <button 
                    onClick={() => handleChange('ai_voice_enabled', !localSettings.ai_voice_enabled)}
                    className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all relative shrink-0 ${localSettings.ai_voice_enabled ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                  >
                    <div className={`absolute top-0.5 lg:top-1 w-4 h-4 rounded-full bg-pure-white transition-all ${localSettings.ai_voice_enabled ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'widgets' && (
            <div className="space-y-8 lg:space-y-12">
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-8">Widget Yönetimi</h3>
              <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-skel-metal/10 bg-skel-matte/5 space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-focus-main/10 text-focus-neon flex items-center justify-center shrink-0">
                      <LayoutGrid size={24} className="lg:w-7 lg:h-7" />
                    </div>
                    <div>
                      <h4 className="text-base lg:text-lg font-bold">Masaüstü Widgetları</h4>
                      <p className="text-xs lg:text-sm text-text-secondary font-medium">Dashboard üzerindeki aktif widgetları yapılandırın.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleChange('widgets_enabled', !localSettings.widgets_enabled)}
                    className={`w-12 h-6 lg:w-14 lg:h-7 rounded-full transition-all relative shrink-0 ${localSettings.widgets_enabled ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                  >
                    <div className={`absolute top-0.5 lg:top-1 w-5 h-5 rounded-full bg-pure-white transition-all ${localSettings.widgets_enabled ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                  </button>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <label className="label-mono text-[9px] lg:text-[10px] opacity-50 tracking-[0.2em]">Widget Şeffaflığı</label>
                  <div className="flex items-center gap-4 lg:gap-6">
                    <input 
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.1"
                      value={localSettings.widget_transparency}
                      onChange={(e) => handleChange('widget_transparency', parseFloat(e.target.value))}
                      className="flex-1 accent-focus-neon"
                    />
                    <span className="text-xs lg:text-sm font-bold min-w-[30px] lg:min-w-[40px]">%{(localSettings.widget_transparency * 100).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-8 lg:space-y-12">
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-8">Grafik & Tablo Ayarları</h3>
              <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-skel-metal/10 bg-skel-matte/5 space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                  <div className="space-y-2 lg:space-y-3">
                    <label className="label-mono text-[9px] lg:text-[10px] opacity-50 tracking-[0.2em]">Grafik Teması</label>
                    <select 
                      value={localSettings.chart_theme}
                      onChange={(e) => handleChange('chart_theme', e.target.value)}
                      className="w-full p-4 rounded-xl border border-skel-metal/10 bg-skel-matte/5 text-xs lg:text-sm font-bold text-text-primary"
                    >
                      <option value="classic">Klasik</option>
                      <option value="modern">Modern (Apex)</option>
                      <option value="vibrant">Canlı</option>
                      <option value="monochrome">Monokrom</option>
                    </select>
                  </div>
                  <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-skel-metal/10 bg-skel-matte/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <Activity size={18} className="text-text-secondary group-hover:text-focus-neon transition-colors lg:w-5 lg:h-5" />
                      <span className="text-xs lg:text-sm font-bold">Grafik Animasyonları</span>
                    </div>
                    <button 
                      onClick={() => handleChange('chart_animations', !localSettings.chart_animations)}
                      className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all relative shrink-0 ${localSettings.chart_animations ? 'bg-focus-neon' : 'bg-skel-metal/20'}`}
                    >
                      <div className={`absolute top-0.5 lg:top-1 w-4 h-4 rounded-full bg-pure-white transition-all ${localSettings.chart_animations ? 'right-0.5 lg:right-1' : 'left-0.5 lg:left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
