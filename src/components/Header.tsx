import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  LogOut,
  Zap,
  Home,
  Calendar,
  Settings,
  Gauge
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Switch from './ui/sky-toggle';
import { SearchBar } from './SearchBar';
import { EnvironmentalWidget } from './EnvironmentalWidget';
import { NotificationsMenu } from './ui/notifications-menu';
import { CalendarMenu } from './ui/calendar-menu';
import { LanguageSelector } from './ui/LanguageSelector';
import { useNotifications } from '@/context/NotificationContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  toggleSidebar: () => void;
  setActiveModule: (module: string) => void;
}

export const Header = React.memo(function Header({ toggleSidebar, setActiveModule }: HeaderProps) {
  const { settings, updateSetting } = useSettings();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();

  return (
    <header className="h-12 sm:h-14 lg:h-16 flex items-center justify-between px-1.5 sm:px-3 lg:px-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-xl sm:rounded-2xl mt-1 sm:mt-2 lg:mt-4 mx-1 sm:mx-2 lg:mx-4 shrink-0 relative group/header transition-all duration-500 hover:shadow-[0_15px_50px_rgba(0,0,0,0.3)] z-40 touch-optimized">
      {/* Ambient Light Streak */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-focus-neon/50 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-4 min-w-0">
        <button 
          onClick={() => setActiveModule('finance-dashboard')}
          className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-focus-neon/10 text-focus-neon hover:bg-focus-neon hover:text-pure-white transition-all duration-300 hover:scale-105 active:scale-95 border border-focus-neon/20 shrink-0"
          title={t('nav.home', 'Ana Sayfa')}
        >
          <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <SearchBar onNavigate={setActiveModule} />
        
        {/* Mobile Logo */}
        <div className="hidden xs:flex lg:hidden items-center gap-1 ml-0.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-focus-main flex items-center justify-center shadow-md shadow-focus-main/20 shrink-0">
            <Zap size={12} className="text-pure-white" />
          </div>
          <span className="text-xs font-display font-black tracking-tighter text-text-primary">
            APEX<span className="text-focus-neon">OS</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-4 shrink-0">
        <div className="hidden lg:block">
          <EnvironmentalWidget />
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
          {/* FPS Mode Quick Selector - Desktop Only */}
          <button
            onClick={() => {
              const currentFps = settings['performance.fps']?.value || 120;
              const nextFps = currentFps === 120 ? 90 : currentFps === 90 ? 60 : 120;
              updateSetting('performance.fps', nextFps);
            }}
            className="h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg sm:rounded-xl bg-focus-neon/10 border border-focus-neon/30 text-focus-neon font-mono text-[9px] sm:text-[10px] font-black hidden lg:flex items-center gap-0.5 sm:gap-1 hover:bg-focus-neon/20 active:scale-95 transition-all shrink-0"
            title={`Ekran Tazeleme Oranı (Şu an: ${settings['performance.fps']?.value || 120} FPS) - Değiştirmek için dokunun`}
          >
            <Gauge size={12} className="animate-pulse shrink-0" />
            <span>{settings['performance.fps']?.value || 120} FPS</span>
          </button>

          {/* Language Selector - Desktop Only */}
          <div className="hidden lg:block">
            <LanguageSelector variant="compact" />
          </div>

          {/* Theme Selector - Desktop Only */}
          <div className="hidden lg:block mr-0.5">
            <Switch 
              checked={settings['theme.mode']?.value === 'dark' || (settings['theme.mode']?.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)}
              onChange={(checked) => updateSetting('theme.mode', checked ? 'dark' : 'light')}
            />
          </div>
          
          <div className="flex items-center gap-1 pl-0.5">
            {/* Notification Button with Popover - Desktop Only */}
            <div className="hidden lg:block">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-300 active:scale-95 border border-skel-metal/10 relative group/btn shrink-0"
                    title={t('nav.notifications', 'Bildirimler')}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-focus-neon rounded-full border border-skel-space shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[520px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                  <NotificationsMenu />
                </PopoverContent>
              </Popover>
            </div>

            {/* Calendar Button with Popover - Desktop Only */}
            <div className="hidden lg:block">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-300 active:scale-95 border border-skel-metal/10 group/btn shrink-0"
                    title={t('nav.calendar', 'Takvim')}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                  <CalendarMenu />
                </PopoverContent>
              </Popover>
            </div>

            {/* Settings Modal Trigger - Both Mobile and Desktop */}
            <button 
              onClick={() => (window as any).openSettingsModal?.()}
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-300 active:scale-95 border border-skel-metal/10 group/btn shrink-0"
              title={t('nav.settings', 'Ayarlar')}
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div className="w-[1px] h-4 sm:h-5 bg-skel-metal/10 mx-0.5 sm:mx-1 shrink-0" />
            
            <button 
              onClick={signOut}
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-crit-blood/5 hover:bg-crit-blood/15 text-crit-vivid transition-all duration-300 border border-crit-blood/10 active:scale-95 shrink-0"
              title={t('common.logout', 'Çıkış Yap')}
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
