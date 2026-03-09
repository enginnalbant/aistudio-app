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
  Cloud
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
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="space-y-12 pb-20">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-focus-main/10 border border-focus-neon/20 text-focus-neon label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-focus-neon/5">
              <Zap size={12} /> Sistem Yapılandırması
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              SİSTEM <span className="text-focus-neon">AYARLARI</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg tracking-tight opacity-70 max-w-2xl">
              Kullanıcı tercihleri, güvenlik yapılandırması ve sistem parametrelerini Apex Neural Engine üzerinden yönetin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {saveStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-2 rounded-xl bg-grow-phosphor/10 text-grow-phosphor border border-grow-phosphor/20 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 size={14} /> Değişiklikler Kaydedildi
            </motion.div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="os-btn os-btn-primary h-[54px] min-w-[160px]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-pure-black/20 border-t-pure-black rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bento-card p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-500 font-display font-black tracking-tight",
                  activeTab === tab.id 
                    ? 'bg-focus-main text-pure-white shadow-lg shadow-focus-main/20' 
                    : 'text-text-secondary hover:bg-skel-matte/5 hover:text-text-primary'
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  activeTab === tab.id ? "bg-pure-white/20" : "bg-skel-matte/5"
                )}>
                  {tab.icon}
                </div>
                <span className="text-sm">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
              </button>
            ))}
          </div>
          
          <div className="bento-card p-8 bg-focus-main/5 border-focus-neon/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={40} className="text-focus-neon" />
            </div>
            <h3 className="label-mono mb-4 tracking-[0.2em]">Güvenlik Durumu</h3>
            <div className="flex items-center gap-3 text-grow-phosphor font-bold text-sm">
              <CheckCircle2 size={16} /> Apex Koruması Aktif
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="bento-card p-10 min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-focus-main/5 blur-[120px] rounded-full -mr-48 -mt-48" />
            
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="relative z-10"
            >
          {activeTab === 'profile' && (
            <div className="space-y-12">
              <div className="flex items-center gap-10">
                <div className="w-32 h-32 rounded-3xl bg-skel-matte/5 border border-skel-metal/10 flex items-center justify-center text-focus-neon relative group cursor-pointer overflow-hidden shadow-xl">
                  <User size={56} />
                  <div className="absolute inset-0 bg-focus-main/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase text-pure-white tracking-widest">Değiştir</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-display font-black tracking-tighter text-text-primary leading-none">{localSettings.user_name}</h2>
                  <p className="text-text-secondary font-medium text-lg opacity-70">{localSettings.user_dept} • {localSettings.user_email}</p>
                  <div className="flex gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-grow-phosphor/10 text-grow-phosphor text-[10px] font-black uppercase tracking-widest border border-grow-phosphor/20 shadow-sm shadow-grow-phosphor/5">Aktif</span>
                    <span className="px-4 py-1.5 rounded-full bg-focus-main/10 text-focus-neon text-[10px] font-black uppercase tracking-widest border border-focus-neon/20 shadow-sm shadow-focus-neon/5">Admin</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="label-mono text-[10px] ml-1 tracking-[0.2em] opacity-50">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={localSettings.user_name} 
                    onChange={(e) => handleChange('user_name', e.target.value)}
                    className="w-full p-5 rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-sm font-bold text-text-primary" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="label-mono text-[10px] ml-1 tracking-[0.2em] opacity-50">E-posta</label>
                  <input 
                    type="email" 
                    value={localSettings.user_email} 
                    onChange={(e) => handleChange('user_email', e.target.value)}
                    className="w-full p-5 rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-sm font-bold text-text-primary" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="label-mono text-[10px] ml-1 tracking-[0.2em] opacity-50">Telefon</label>
                  <input 
                    type="tel" 
                    value={localSettings.user_phone} 
                    onChange={(e) => handleChange('user_phone', e.target.value)}
                    className="w-full p-5 rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-sm font-bold text-text-primary" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="label-mono text-[10px] ml-1 tracking-[0.2em] opacity-50">Departman</label>
                  <input 
                    type="text" 
                    value={localSettings.user_dept} 
                    onChange={(e) => handleChange('user_dept', e.target.value)}
                    className="w-full p-5 rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-sm font-bold text-text-primary" 
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="label-mono text-[10px] ml-1 tracking-[0.2em] opacity-50">Hakkında / Bio</label>
                  <textarea 
                    value={localSettings.user_bio} 
                    onChange={(e) => handleChange('user_bio', e.target.value)}
                    className="w-full p-5 rounded-2xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-sm font-bold text-text-primary min-h-[140px] resize-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold mb-8">Güvenlik Yapılandırması</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: 'security_2fa', label: 'İki Faktörlü Doğrulama (2FA)', desc: 'Giriş yaparken telefonunuza gelen kodu kullanarak güvenliği artırın.', icon: <Smartphone size={18} /> },
                  { key: 'security_login_emails', label: 'Giriş Aktivite E-postaları', desc: 'Her yeni giriş yapıldığında e-posta ile bilgilendirilmek ister misiniz?', icon: <Mail size={18} /> },
                ].map((item) => (
                  <div key={item.key} className="p-6 rounded-2xl border border-border hover:border-accent/20 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-50 text-text-secondary group-hover:text-accent transition-colors flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{item.label}</h4>
                        <p className="text-xs text-text-secondary font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange(item.key, !localSettings[item.key as keyof typeof localSettings])}
                      className={`w-12 h-6 rounded-full transition-all relative ${localSettings[item.key as keyof typeof localSettings] ? 'bg-accent' : 'bg-stone-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings[item.key as keyof typeof localSettings] ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}

                <div className="p-6 rounded-2xl border border-border space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-stone-50 text-text-secondary flex items-center justify-center">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Oturum Zaman Aşımı</h4>
                      <p className="text-xs text-text-secondary font-medium">Hareketsizlik durumunda oturumun kapatılacağı süre (dakika).</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pl-16">
                    <input 
                      type="range" 
                      min="5" 
                      max="120" 
                      step="5"
                      value={localSettings.security_timeout}
                      onChange={(e) => handleChange('security_timeout', parseInt(e.target.value))}
                      className="flex-1 accent-accent"
                    />
                    <span className="text-sm font-bold min-w-[40px]">{localSettings.security_timeout} dk</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-12">
              <div>
                <span className="label-mono mb-6 block">Tema Seçimi</span>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Aydınlık', icon: <Sun size={20} /> },
                    { id: 'dark', label: 'Karanlık', icon: <Moon size={20} /> },
                    { id: 'system', label: 'Sistem', icon: <Monitor size={20} /> },
                  ].map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => handleChange('theme', t.id)}
                      className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${
                        localSettings.theme === t.id 
                          ? 'bg-accent text-bg-card border-accent shadow-lg shadow-accent/10' 
                          : 'bg-stone-50 border-border text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      {t.icon}
                      <span className="text-xs font-bold uppercase tracking-widest">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <span className="label-mono block">Vurgu Rengi</span>
                  <div className="flex flex-wrap gap-4">
                    {['#000000', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b'].map((color) => (
                      <button 
                        key={color}
                        onClick={() => handleChange('accent_color', color)}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${
                          localSettings.accent_color === color ? 'border-accent scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <span className="label-mono block">Yazı Tipi Boyutu</span>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map((size) => (
                      <button 
                        key={size}
                        onClick={() => handleChange('font_size', size)}
                        className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                          localSettings.font_size === size ? 'bg-accent text-bg-card border-accent' : 'bg-stone-50 border-border text-text-secondary hover:border-accent/50'
                        }`}
                      >
                        {size === 'small' ? 'Küçük' : size === 'medium' ? 'Normal' : 'Büyük'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <span className="label-mono block">Arayüz Detayları</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl border border-border flex items-center justify-between">
                    <span className="text-sm font-bold">Kompakt Mod</span>
                    <button 
                      onClick={() => handleChange('compact_mode', !localSettings.compact_mode)}
                      className={`w-12 h-6 rounded-full transition-all relative ${localSettings.compact_mode ? 'bg-accent' : 'bg-stone-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings.compact_mode ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="p-6 rounded-2xl border border-border flex items-center justify-between">
                    <span className="text-sm font-bold">Kenar Çubuğu</span>
                    <select 
                      value={localSettings.sidebar_default}
                      onChange={(e) => handleChange('sidebar_default', e.target.value)}
                      className="bg-transparent text-sm font-bold text-accent focus:outline-none"
                    >
                      <option value="expanded">Açık</option>
                      <option value="collapsed">Kapalı</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold mb-8">Bildirim Tercihleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'notif_email', label: 'E-posta Bildirimleri', icon: <Mail size={16} />, desc: 'Önemli güncellemeleri e-posta ile al.' },
                  { key: 'notif_push', label: 'Anlık Bildirimler', icon: <Zap size={16} />, desc: 'Tarayıcı üzerinden anlık uyarılar al.' },
                  { key: 'notif_sound', label: 'Sesli Uyarılar', icon: <Volume2 size={16} />, desc: 'Bildirim geldiğinde ses çal.' },
                  { key: 'notif_stock', label: 'Kritik Stok Uyarıları', icon: <Package size={16} />, desc: 'Stok kritik seviyeye düştüğünde uyar.' },
                  { key: 'notif_job', label: 'İş Emri Güncellemeleri', icon: <CheckCircle2 size={16} />, desc: 'İş emirleri tamamlandığında haber ver.' },
                  { key: 'notif_payment', label: 'Ödeme Hatırlatıcıları', icon: <DollarSign size={16} />, desc: 'Vadesi gelen ödemeleri hatırlat.' },
                ].map((item) => (
                  <div key={item.key} className="p-6 rounded-2xl border border-border hover:border-accent/20 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-stone-50 text-text-secondary group-hover:text-accent transition-colors flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{item.label}</h4>
                        <p className="text-[10px] text-text-secondary font-medium leading-tight">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange(item.key, !localSettings[item.key as keyof typeof localSettings])}
                      className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${localSettings[item.key as keyof typeof localSettings] ? 'bg-accent' : 'bg-stone-200'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${localSettings[item.key as keyof typeof localSettings] ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-12">
              <h3 className="text-xl font-bold mb-8">Sistem Parametreleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="label-mono text-[10px] ml-1 flex items-center gap-2">
                    <DollarSign size={12} /> Varsayılan Para Birimi
                  </label>
                  <select 
                    value={localSettings.sys_currency}
                    onChange={(e) => handleChange('sys_currency', e.target.value)}
                    className="w-full p-4 rounded-xl border border-border bg-stone-50/30 focus:border-accent focus:ring-0 transition-all text-sm font-medium"
                  >
                    <option value="TRY">Türk Lirası (₺)</option>
                    <option value="USD">Amerikan Doları ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">İngiliz Sterlini (£)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label-mono text-[10px] ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Tarih Formatı
                  </label>
                  <select 
                    value={localSettings.sys_date_format}
                    onChange={(e) => handleChange('sys_date_format', e.target.value)}
                    className="w-full p-4 rounded-xl border border-border bg-stone-50/30 focus:border-accent focus:ring-0 transition-all text-sm font-medium"
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label-mono text-[10px] ml-1 flex items-center gap-2">
                    <Languages size={12} /> Sistem Dili
                  </label>
                  <select 
                    value={localSettings.sys_lang}
                    onChange={(e) => handleChange('sys_lang', e.target.value)}
                    className="w-full p-4 rounded-xl border border-border bg-stone-50/30 focus:border-accent focus:ring-0 transition-all text-sm font-medium"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label-mono text-[10px] ml-1 flex items-center gap-2">
                    <Save size={12} /> Otomatik Kaydetme Aralığı (sn)
                  </label>
                  <input 
                    type="number" 
                    value={localSettings.sys_autosave}
                    onChange={(e) => handleChange('sys_autosave', parseInt(e.target.value))}
                    className="w-full p-4 rounded-xl border border-border bg-stone-50/30 focus:border-accent focus:ring-0 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="pt-12 border-t border-border space-y-6">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <Cloud size={20} className="text-accent" /> Veri Senkronizasyonu
                </h4>
                <div className="p-6 rounded-2xl bg-stone-50 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-sm font-medium text-text-secondary">Tüm verileriniz bulut sunucularıyla senkronize durumda.</span>
                  </div>
                  <button className="label-mono text-[10px] text-accent hover:underline">Şimdi Eşitle</button>
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
