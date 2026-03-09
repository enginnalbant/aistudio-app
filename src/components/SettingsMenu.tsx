import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  User, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  LogOut,
  ChevronRight,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';

import { useSettings } from '../context/SettingsContext';

export function SettingsMenu({ onClose, onViewAll }: { onClose: () => void; onViewAll: () => void }) {
  const { settings, updateSettings } = useSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-72 bg-skel-dark border border-skel-matte/20 overflow-hidden z-50 shadow-2xl rounded-2xl"
    >
      <div className="p-4 border-b border-skel-matte/20 bg-skel-matte/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-focus-neon/20 border border-focus-neon/30 flex items-center justify-center text-focus-neon">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-skel-glass">{settings.user_name}</h3>
          <p className="text-[10px] text-skel-metal font-medium uppercase tracking-widest">{settings.user_dept}</p>
        </div>
      </div>

      <div className="p-2">
        <div className="px-3 py-2 text-[10px] font-bold text-skel-matte uppercase tracking-widest">Genel Ayarlar</div>
        {[
          { icon: <User size={16} />, label: 'Profil Bilgileri' },
          { icon: <Shield size={16} />, label: 'Güvenlik & Şifre' },
          { icon: <Database size={16} />, label: 'Veri Yönetimi' },
          { icon: <Palette size={16} />, label: 'Görünüm' },
          { icon: <Globe size={16} />, label: 'Dil Seçenekleri' },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={onViewAll}
            className="w-full p-2.5 rounded-lg flex items-center justify-between group hover:bg-skel-matte/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 text-skel-glass group-hover:text-skel-glass transition-colors">
              <span className="text-skel-metal group-hover:text-focus-neon transition-colors">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <ChevronRight size={14} className="text-skel-matte opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-skel-matte/20 bg-skel-matte/5">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-[10px] font-bold text-skel-matte uppercase tracking-widest">Tema</span>
          <div className="flex p-1 rounded-lg bg-skel-space/50 border border-skel-matte/20">
            <button 
              onClick={() => updateSettings({ theme: 'light' })}
              className={`p-1.5 rounded-md transition-colors ${settings.theme === 'light' ? 'bg-focus-neon/20 text-focus-neon shadow-sm' : 'text-skel-metal hover:text-skel-glass'}`}
            >
              <Sun size={14} />
            </button>
            <button 
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`p-1.5 rounded-md transition-colors ${settings.theme === 'dark' ? 'bg-focus-neon/20 text-focus-neon shadow-sm' : 'text-skel-metal hover:text-skel-glass'}`}
            >
              <Moon size={14} />
            </button>
            <button 
              onClick={() => updateSettings({ theme: 'system' })}
              className={`p-1.5 rounded-md transition-colors ${settings.theme === 'system' ? 'bg-focus-neon/20 text-focus-neon shadow-sm' : 'text-skel-metal hover:text-skel-glass'}`}
            >
              <Monitor size={14} />
            </button>
          </div>
        </div>
        
        <button className="w-full mt-2 p-2.5 rounded-lg flex items-center gap-3 text-crit-vivid hover:bg-crit-vivid/10 transition-all text-left group">
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-xs font-bold">Oturumu Kapat</span>
        </button>
      </div>
    </motion.div>
  );
}
