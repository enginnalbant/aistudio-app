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
  Clock,
  Sun,
  Moon,
  Cloud,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
import { environmentalService, WeatherData } from '../services/environmentalService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
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

  // Local states for mobile clock & weather
  const [mobileTime, setMobileTime] = useState(new Date());
  const [mobileWeather, setMobileWeather] = useState<WeatherData | null>(null);

  // Tick mobile clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setMobileTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch mobile weather once on load
  useEffect(() => {
    const fetchMobileWeather = async () => {
      try {
        // Simple default detected or Istanbul coords
        const data = await environmentalService.getWeatherData(41.0082, 28.9784);
        setMobileWeather(data);
      } catch (err) {
        console.warn("Could not load weather in mobile header subrow:", err);
      }
    };
    fetchMobileWeather();
  }, []);

  const isDark = settings['theme.mode']?.value === 'dark' || (settings['theme.mode']?.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="flex flex-col gap-1.5 mt-1 sm:mt-2 lg:mt-4 mx-1 sm:mx-2 lg:mx-4 shrink-0 z-40 relative">
      {/* ----------------- LINE 1: PRIMARY HEADER ROW ----------------- */}
      <header className="h-12 sm:h-14 lg:h-16 flex items-center justify-between px-2 sm:px-3 lg:px-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-xl sm:rounded-2xl w-full group/header transition-all duration-500 hover:shadow-[0_15px_50px_rgba(0,0,0,0.3)] touch-optimized">
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
              <Zap size={12} className="text-pure-white animate-pulse" />
            </div>
            <span className="text-xs font-display font-black tracking-tighter text-text-primary">
              APEX<span className="text-focus-neon">OS</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-4 shrink-0">
          {/* Desktop Only Environmental Widget */}
          <div className="hidden lg:block">
            <EnvironmentalWidget />
          </div>

          <div className="flex items-center gap-1.5 lg:gap-2">
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
                checked={isDark}
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

      {/* ----------------- LINE 2: MOBILE/TABLET EXCLUSIVE COMPACT STATUS ROW ----------------- */}
      <div className="lg:hidden w-full h-8 px-2.5 bg-white/[0.02] dark:bg-black/[0.2] backdrop-blur-2xl border border-white/5 rounded-lg flex items-center justify-between text-text-secondary select-none text-[10px] sm:text-xs">

        {/* Real-time Ticking Date & Time */}
        <div className="flex items-center gap-1.5 font-mono font-bold text-white/90 shrink-0">
          <Clock size={11} className="text-focus-neon animate-pulse" />
          <span>{format(mobileTime, 'HH:mm:ss')}</span>
          <span className="opacity-40">•</span>
          <span className="hidden xs:inline text-[9px] uppercase">{format(mobileTime, 'd MMMM EEEE', { locale: tr })}</span>
          <span className="xs:hidden text-[9px] uppercase">{format(mobileTime, 'd MMM', { locale: tr })}</span>
        </div>

        {/* Live Weather Micro Display */}
        <div className="flex items-center gap-1 text-text-secondary hover:text-white transition-colors shrink-0">
          <span className="text-focus-neon">🌦️</span>
          <span className="font-semibold text-[9px] uppercase tracking-wide">
            {mobileWeather ? `${mobileWeather.temp}°C • ${mobileWeather.location}` : 'Yükleniyor...'}
          </span>
        </div>

        {/* Dynamic Action Triggers (Theme Toggle, Notifications, Calendar popovers) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Interactive Light/Dark theme quick button */}
          <button
            onClick={() => updateSetting('theme.mode', isDark ? 'light' : 'dark')}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all active:scale-90"
            title="Temayı Değiştir"
          >
            {isDark ? (
              <Sun size={11} className="text-amber-400" />
            ) : (
              <Moon size={11} className="text-indigo-400" />
            )}
          </button>

          {/* Interactive notifications indicator popover for mobile/tablet */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all active:scale-90 relative"
                title="Bildirimler"
              >
                <Bell size={11} className="text-focus-neon" />
                {unreadCount > 0 && (
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-focus-neon rounded-full" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] xs:w-[320px] sm:w-[420px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={8}>
              <NotificationsMenu />
            </PopoverContent>
          </Popover>

          {/* Interactive calendar indicator popover for mobile/tablet */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all active:scale-90"
                title="Takvim"
              >
                <Calendar size={11} className="text-focus-neon" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] xs:w-[300px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={8}>
              <CalendarMenu />
            </PopoverContent>
          </Popover>
        </div>

      </div>
    </div>
  );
});
