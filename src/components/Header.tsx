import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  LogOut,
  Zap,
  Home,
  Calendar,
  Settings,
  Gauge,
  Wand2,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useWallpaper } from '../context/WallpaperContext';
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
  const { user, signOut, signInWithGoogle } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const { openWizard } = useWallpaper();

  return (
    <header className="bento-card layer-2 h-12 sm:h-14 lg:h-16 flex items-center justify-between px-1.5 sm:px-3 lg:px-6 rounded-xl sm:rounded-2xl mt-1 sm:mt-2 lg:mt-4 mx-1 sm:mx-2 lg:mx-4 shrink-0 relative group/header transition-all duration-300 z-40 touch-optimized" data-card="true" data-layer="2">
      {/* Ambient Light Streak */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-focus-neon/50 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-3 min-w-0">
        <button 
          onClick={() => setActiveModule('welcome-overview')}
          className="h-7 sm:h-8 lg:h-9 w-7 sm:w-8 lg:w-9 rounded-lg sm:rounded-xl bg-gradient-to-r from-focus-main/30 to-focus-neon/20 hover:from-focus-main/50 hover:to-focus-neon/40 text-pure-white border border-focus-neon/40 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:scale-105 active:scale-95 transition-all duration-300 group shrink-0 cursor-pointer"
          title="Ana Sayfa"
        >
          <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-focus-neon group-hover:scale-110 transition-transform duration-300" />
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
        <EnvironmentalWidget />

        <div className="flex items-center gap-0.5 sm:gap-1.5 lg:gap-2">
          {/* FPS Mode Quick Selector */}
          <button
            onClick={() => {
              const currentFps = settings['performance.fps']?.value || 120;
              const nextFps = currentFps === 120 ? 90 : currentFps === 90 ? 60 : 120;
              updateSetting('performance.fps', nextFps);
            }}
            className="h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg sm:rounded-xl bg-focus-neon/10 border border-focus-neon/30 text-focus-neon font-mono text-[9px] sm:text-[10px] font-black flex items-center gap-0.5 sm:gap-1 hover:bg-focus-neon/20 active:scale-95 transition-all shrink-0"
            title={`Ekran Tazeleme Oranı (Şu an: ${settings['performance.fps']?.value || 120} FPS) - Değiştirmek için dokunun`}
          >
            <Gauge size={12} className="animate-pulse shrink-0" />
            <span className="hidden xs:inline">{settings['performance.fps']?.value || 120} FPS</span>
            <span className="xs:hidden">{settings['performance.fps']?.value || 120}</span>
          </button>

          {/* Language Selector */}
          <LanguageSelector variant="compact" />

          <div className="mr-0.5 hidden md:block">
            <Switch 
              checked={settings['theme.mode']?.value === 'dark' || (settings['theme.mode']?.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)}
              onChange={(checked) => updateSetting('theme.mode', checked ? 'dark' : 'light')}
            />
          </div>
          
          <div className="flex items-center gap-0.5 sm:gap-1 pl-0.5">
            {/* Notification Button with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-300 active:scale-95 border border-skel-metal/10 relative group/btn shrink-0"
                  title={t('nav.notifications', 'Bildirimler')}
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {unreadCount > 0 && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-focus-neon rounded-full border border-skel-space shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] sm:w-[520px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                <NotificationsMenu />
              </PopoverContent>
            </Popover>

            {/* Calendar Button with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-300 active:scale-95 border border-skel-metal/10 group/btn shrink-0"
                  title={t('nav.calendar', 'Takvim')}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] sm:w-[320px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                <CalendarMenu />
              </PopoverContent>
            </Popover>

            {/* Duvar Kağıdı & Tema Sihirbazı */}
            <button 
              onClick={openWizard}
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-focus-neon/15 hover:bg-focus-neon/25 text-focus-neon transition-all duration-300 active:scale-95 border border-focus-neon/30 group/btn shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              title="Duvar Kağıdı & Akıllı Tema Sihirbazı"
            >
              <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            </button>

            <button 
              onClick={() => (window as any).openSettingsModal?.()}
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-300 active:scale-95 border border-skel-metal/10 group/btn shrink-0"
              title={t('nav.settings', 'Ayarlar')}
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div className="w-[1px] h-4 sm:h-5 bg-skel-metal/10 mx-0.5 sm:mx-1 shrink-0" />
            
            {user ? (
              <button 
                onClick={signOut}
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-crit-blood/5 hover:bg-crit-blood/15 text-crit-vivid transition-all duration-300 border border-crit-blood/10 active:scale-95 shrink-0"
                title={t('common.logout', 'Çıkış Yap')}
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="h-7 sm:h-8 lg:h-9 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-focus-main text-pure-white text-[10px] sm:text-xs font-bold hover:bg-focus-main/90 transition-all active:scale-95 flex items-center gap-1 sm:gap-1.5 shrink-0 border border-focus-neon/30"
              >
                <Sparkles size={12} className="text-focus-neon" />
                <span className="hidden xs:inline">Giriş Yap</span>
                <span className="xs:hidden">Giriş</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
