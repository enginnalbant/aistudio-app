import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Calendar, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  setActiveModule: (module: string) => void;
}

export const Header = React.memo(function Header({ toggleSidebar, setActiveModule }: HeaderProps) {
  const { settings } = useSettings();
  const { user, signOut } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 bento-card shrink-0 relative overflow-hidden group/header">
      {/* Ambient Light Streak */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-focus-neon/50 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center gap-3 lg:gap-6">
        <button 
          onClick={toggleSidebar}
          className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl hover:bg-skel-matte/10 transition-all duration-500 hover:scale-110 active:scale-90 border border-transparent hover:border-skel-metal/10"
        >
          <Menu size={18} className="text-text-secondary group-hover/header:text-focus-neon transition-colors lg:w-5 lg:h-5" />
        </button>
        
        <div className="hidden md:flex items-center bg-skel-space/50 border border-skel-metal/10 rounded-xl px-5 py-2.5 w-80 group focus-within:border-focus-neon/40 focus-within:bg-skel-space/80 focus-within:ring-4 focus-within:ring-focus-neon/5 transition-all duration-500">
          <Search size={18} className="text-text-secondary/40 group-focus-within:text-focus-neon transition-colors" />
          <input 
            type="text" 
            placeholder="Sistemde Ara..." 
            className="ml-3 bg-transparent border-none outline-none text-sm w-full placeholder:text-text-secondary/30 text-text-primary font-bold tracking-tight"
          />
        </div>

        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-focus-main flex items-center justify-center shadow-lg shadow-focus-main/20">
            <Zap size={16} className="text-pure-white" />
          </div>
          <span className="text-lg font-display font-black tracking-tighter text-text-primary">
            APEX<span className="text-focus-neon">OS</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-8">
        <div className="hidden lg:flex flex-col items-end justify-center">
          <motion.div 
            className="text-2xl font-display font-black tracking-tighter text-text-primary leading-none"
            whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
          >
            {format(time, 'HH:mm:ss')}
          </motion.div>
          <div className="label-mono text-[9px] opacity-50 mt-1">
            {format(time, 'EEEE, d MMMM', { locale: tr })}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <button 
            onClick={() => setActiveModule('calendar')}
            className="w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-nrg-sun/10 text-text-secondary hover:text-nrg-sun transition-all duration-500 border border-skel-metal/5 hover:border-nrg-sun/20"
            title="Takvim"
          >
            <Calendar size={16} className="lg:w-[18px] lg:h-[18px]" />
          </button>

          <button 
            onClick={() => setActiveModule('notifications')}
            className="w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-focus-neon/10 text-text-secondary hover:text-focus-neon transition-all duration-500 border border-skel-metal/5 hover:border-focus-neon/20 relative group/btn"
            title="Bildirimler"
          >
            <Bell size={16} className="lg:w-[18px] lg:h-[18px]" />
            <span className="absolute top-2.5 right-2.5 lg:top-3 lg:right-3 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-focus-neon rounded-full shadow-[0_0_10px_rgba(112,161,255,0.8)] animate-pulse" />
          </button>
          
          <button 
            onClick={() => setActiveModule('settings-page')}
            className="w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-ai-bright/10 text-text-secondary hover:text-ai-bright transition-all duration-500 border border-skel-metal/5 hover:border-ai-bright/20"
            title="Ayarlar"
          >
            <Settings size={16} className="lg:w-[18px] lg:h-[18px]" />
          </button>

          <div className="hidden sm:block w-px h-6 lg:h-8 bg-skel-metal/10 mx-1 lg:mx-2" />

          <div className="flex items-center gap-2 lg:gap-3 pl-1">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-focus-neon to-ai-royal p-[1.5px] shadow-lg shadow-focus-neon/5">
              <div className="w-full h-full rounded-[7px] lg:rounded-[9px] bg-skel-space flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`} 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="hidden xl:block">
              <div className="text-sm font-display font-black text-text-primary leading-none tracking-tight">
                {user?.email?.split('@')[0] || 'Engin Nalbant'}
              </div>
              <div className="label-mono text-[8px] mt-1 opacity-50">
                {user?.email || 'Apex Admin'}
              </div>
            </div>
            
            <button 
              onClick={signOut}
              className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg lg:rounded-xl bg-crit-blood/10 hover:bg-crit-blood/20 text-crit-vivid transition-all duration-500 border border-crit-blood/20"
              title="Çıkış Yap"
            >
              <LogOut size={14} className="lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
