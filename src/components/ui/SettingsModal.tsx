import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Settings2, Palette, Bell, Shield, 
  Globe, Moon, Sun, Monitor, Camera, Lock,
  Save, LogOut, Trash2
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'general' | 'customization' | 'notifications' | 'security' | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { settings, updateSetting } = useSettings();

  const tabs = [
    { id: 'profile', label: 'Profil', icon: <User size={18} /> },
    { id: 'general', label: 'Genel', icon: <Settings2 size={18} /> },
    { id: 'customization', label: 'Özelleştirme', icon: <Palette size={18} /> },
    { id: 'notifications', label: 'Bildirimler', icon: <Bell size={18} /> },
    { id: 'security', label: 'Güvenlik', icon: <Shield size={18} /> },
    { id: 'privacy', label: 'Veri & Gizlilik', icon: <Lock size={18} /> },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-skel-space border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[70vh]"
        >
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="size-8 rounded-xl bg-focus-neon/10 border border-focus-neon/20 flex items-center justify-center">
                <Settings2 size={18} className="text-focus-neon" />
              </div>
              <h2 className="text-lg font-display font-black text-white tracking-tight uppercase">Ayarlar</h2>
            </div>

            <nav className="space-y-1 flex-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-focus-neon text-black' 
                      : 'text-text-secondary hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <button className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-all mt-4">
              <LogOut size={18} />
              Oturumu Kapat
            </button>
          </div>

          {/* Main View */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">
                 Sistem Kontrol Paneli
               </span>
               <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-text-secondary hover:text-white transition-colors"
               >
                 <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                          <div className="size-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            <User size={40} className="text-text-secondary" />
                          </div>
                          <button className="absolute -bottom-2 -right-2 p-2 bg-focus-neon rounded-xl text-black shadow-lg shadow-focus-neon/20 opacity-0 group-hover:opacity-100 transition-all">
                            <Camera size={14} />
                          </button>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-bold text-white">Engin Nalbant</h3>
                          <p className="text-text-secondary text-sm">enginnalbant9@gmail.com</p>
                          <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                             <span className="px-2 py-1 rounded-lg bg-focus-neon/10 text-focus-neon text-[10px] font-bold border border-focus-neon/20">PREMIUM USER</span>
                             <span className="px-2 py-1 rounded-lg bg-white/5 text-text-secondary text-[10px] font-bold border border-white/10">BETA TESTER</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary">İsim</label>
                          <input type="text" defaultValue="Engin" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-focus-neon/50 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary">Soyisim</label>
                          <input type="text" defaultValue="Nalbant" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-focus-neon/50 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <Globe className="text-focus-neon" size={20} />
                          <div>
                            <p className="text-sm font-bold text-white">Dil Seçimi</p>
                            <p className="text-xs text-text-secondary">Uygulama arayüz dili</p>
                          </div>
                        </div>
                        <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                          <option>Türkçe (TR)</option>
                          <option>English (EN)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <Monitor className="text-focus-neon" size={20} />
                          <div>
                            <p className="text-sm font-bold text-white">Cihaz Senkronizasyonu</p>
                            <p className="text-xs text-text-secondary">Verileri bulut üzerinden eşitle</p>
                          </div>
                        </div>
                        <div className="w-10 h-5 bg-focus-neon rounded-full relative cursor-pointer">
                          <div className="size-4 bg-black rounded-full absolute top-0.5 right-0.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'customization' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">Tema Modu</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'dark', label: 'Koyu', icon: <Moon size={16} /> },
                            { id: 'light', label: 'Açık', icon: <Sun size={16} /> },
                            { id: 'system', label: 'Sistem', icon: <Monitor size={16} /> }
                          ].map(t => (
                            <button key={t.id} className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${t.id === 'dark' ? 'bg-focus-neon/10 border-focus-neon text-focus-neon' : 'bg-white/5 border-white/10 text-text-secondary hover:text-white'}`}>
                              {t.icon}
                              <span className="text-xs font-bold">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">Arayüz Yoğunluğu</h4>
                        <div className="flex gap-2">
                           <button className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:border-focus-neon transition-all">Konforlu</button>
                           <button className="flex-1 px-4 py-2 bg-focus-neon/10 border border-focus-neon rounded-xl text-xs font-bold text-focus-neon">Kompakt</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-4">
                      {['E-posta Bildirimleri', 'Sistem Duyuruları', 'Finansal Uyarılar', 'Kütüphane Güncellemeleri'].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-sm font-bold text-white">{item}</p>
                          <div className={`w-10 h-5 rounded-full relative cursor-pointer ${i < 2 ? 'bg-focus-neon' : 'bg-white/10'}`}>
                            <div className={`size-4 bg-black rounded-full absolute top-0.5 ${i < 2 ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                         <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                              <Lock className="text-rose-400" size={20} />
                              <div className="text-left">
                                <p className="text-sm font-bold text-white">Şifre Değiştir</p>
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
                    </div>
                  )}

                  {activeTab === 'privacy' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-focus-neon/5 border border-focus-neon/10 rounded-2xl">
                        <h4 className="text-sm font-bold text-focus-neon mb-1">Veri Kontrol Merkezi</h4>
                        <p className="text-xs text-text-secondary">APEXOS verilerinizi nasıl işlediğini ve koruduğunu buradan yönetebilirsiniz.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div>
                            <p className="text-sm font-bold text-white">Arama Geçmişini Kaydet</p>
                            <p className="text-xs text-text-secondary">Hızlı erişim için aramalarınızı hatırlar</p>
                          </div>
                          <div className="w-10 h-5 bg-focus-neon rounded-full relative cursor-pointer">
                            <div className="size-4 bg-black rounded-full absolute top-0.5 right-0.5" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div>
                            <p className="text-sm font-bold text-white">Konum Verisi</p>
                            <p className="text-xs text-text-secondary">Hava durumu ve yerel finansal veriler için</p>
                          </div>
                          <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
                            <div className="size-4 bg-black rounded-full absolute top-0.5 left-0.5" />
                          </div>
                        </div>

                        <button className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
                          Tüm Verilerimi İndir (.json)
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:text-white transition-all"
              >
                İptal
              </button>
              <button 
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-focus-neon text-black text-sm font-bold shadow-lg shadow-focus-neon/20 hover:scale-105 transition-all active:scale-95"
              >
                <Save size={18} />
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
