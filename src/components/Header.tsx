import { 
  Menu, 
  Search, 
  Bell, 
  Calendar, 
  Settings, 
  CloudSun,
  Clock,
  Eye,
  X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationMenu } from './NotificationMenu';
import { CalendarMenu } from './CalendarMenu';
import { SettingsMenu } from './SettingsMenu';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  toggleSidebar: () => void;
  setActiveModule: (module: string) => void;
}

export function Header({ toggleSidebar, setActiveModule }: HeaderProps) {
  const { settings } = useSettings();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-8 bento-card shrink-0 relative overflow-hidden group/header">
      {/* Ambient Light Streak */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-focus-neon/50 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-skel-matte/10 transition-all duration-500 hover:scale-110 active:scale-90 border border-transparent hover:border-skel-metal/10"
        >
          <Menu size={20} className="text-text-secondary group-hover/header:text-focus-neon transition-colors" />
        </button>
        
        <div className="hidden md:flex items-center bg-skel-space/50 border border-skel-metal/10 rounded-xl px-5 py-2.5 w-80 group focus-within:border-focus-neon/40 focus-within:bg-skel-space/80 focus-within:ring-4 focus-within:ring-focus-neon/5 transition-all duration-500">
          <Search size={18} className="text-text-secondary/40 group-focus-within:text-focus-neon transition-colors" />
          <input 
            type="text" 
            placeholder="Sistemde Ara..." 
            className="ml-3 bg-transparent border-none outline-none text-sm w-full placeholder:text-text-secondary/30 text-text-primary font-bold tracking-tight"
          />
        </div>
      </div>

      <div className="flex items-center gap-8">
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

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveModule('calendar')}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-nrg-sun/10 text-text-secondary hover:text-nrg-sun transition-all duration-500 border border-skel-metal/5 hover:border-nrg-sun/20"
            title="Takvim"
          >
            <Calendar size={18} />
          </button>

          <button 
            onClick={() => setActiveModule('notifications')}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-focus-neon/10 text-text-secondary hover:text-focus-neon transition-all duration-500 border border-skel-metal/5 hover:border-focus-neon/20 relative group/btn"
            title="Bildirimler"
          >
            <Bell size={18} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-focus-neon rounded-full shadow-[0_0_10px_rgba(112,161,255,0.8)] animate-pulse" />
          </button>
          
          <button 
            onClick={() => setActiveModule('settings-page')}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-ai-bright/10 text-text-secondary hover:text-ai-bright transition-all duration-500 border border-skel-metal/5 hover:border-ai-bright/20"
            title="Ayarlar"
          >
            <Settings size={18} />
          </button>

          <div className="w-px h-8 bg-skel-metal/10 mx-2" />

          <div className="flex items-center gap-3 pl-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-focus-neon to-ai-royal p-[1.5px] shadow-lg shadow-focus-neon/5">
              <div className="w-full h-full rounded-[9px] bg-skel-space flex items-center justify-center overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Engin" 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="hidden xl:block">
              <div className="text-sm font-display font-black text-text-primary leading-none tracking-tight">Engin Nalbant</div>
              <div className="label-mono text-[8px] mt-1 opacity-50">Apex Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
