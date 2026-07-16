import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  LogOut,
  Zap,
  Home,
  Calendar,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import Switch from '../ui/sky-toggle';
import { SearchBar } from './SearchBar';
import { EnvironmentalWidget } from './EnvironmentalWidget';
import { NotificationsMenu } from '../ui/notifications-menu';
import { CalendarMenu } from '../ui/calendar-menu';
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

  return (
    <header className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-2xl mt-3 mx-3 lg:mt-4 lg:mx-4 shrink-0 relative group/header transition-all duration-500 hover:shadow-[0_15px_50px_rgba(0,0,0,0.3)]">
      {/* Ambient Light Streak */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-focus-neon/50 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-700" />

      <div className="flex items-center gap-2 lg:gap-4">
        <button
          onClick={() => setActiveModule('finance-dashboard')}
          className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-focus-neon/10 text-focus-neon hover:bg-focus-neon hover:text-pure-white transition-all duration-500 hover:scale-110 active:scale-90 border border-focus-neon/20"
          title="Ana Menü"
        >
          <Home size={16} className="lg:w-4 lg:h-4" />
        </button>

        <SearchBar onNavigate={setActiveModule} />

        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-focus-main flex items-center justify-center shadow-lg shadow-focus-main/20">
            <Zap size={14} className="text-pure-white" />
          </div>
          <span className="text-base font-display font-black tracking-tighter text-text-primary">
            APEX<span className="text-focus-neon">OS</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <EnvironmentalWidget />

        <div className="flex items-center gap-2 lg:gap-2">
          <div className="mr-1 hidden sm:block">
            <Switch
              checked={settings['theme.mode']?.value === 'dark' || (settings['theme.mode']?.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)}
              onChange={(checked) => updateSetting('theme.mode', checked ? 'dark' : 'light')}
            />
          </div>

          <div className="flex items-center gap-1.5 pl-1">
            {/* Notification Button with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-500 hover:scale-110 active:scale-90 border border-skel-metal/10 relative group/btn"
                  title="Bildirimler"
                >
                  <Bell size={16} className="lg:w-4 lg:h-4" />
                  {unreadCount > 0 && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-focus-neon rounded-full border-2 border-skel-space shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[380px] sm:w-[520px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                <NotificationsMenu />
              </PopoverContent>
            </Popover>

            {/* Calendar Button with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-500 hover:scale-110 active:scale-90 border border-skel-metal/10 group/btn"
                  title="Takvim"
                >
                  <Calendar size={16} className="lg:w-4 lg:h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                <CalendarMenu />
              </PopoverContent>
            </Popover>

            <button
              onClick={() => (window as any).openSettingsModal?.()}
              className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 text-text-secondary hover:text-focus-neon transition-all duration-500 hover:scale-110 active:scale-90 border border-skel-metal/10 group/btn"
              title="Ayarlar"
            >
              <Settings size={16} className="lg:w-4 lg:h-4" />
            </button>

            <div className="w-[1px] h-5 bg-skel-metal/10 mx-1 lg:mx-1.5" />

            <button
              onClick={signOut}
              className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-crit-blood/5 hover:bg-crit-blood/15 text-crit-vivid transition-all duration-500 border border-crit-blood/10 hover:scale-110 active:scale-90"
              title="Çıkış Yap"
            >
              <LogOut size={16} className="lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
