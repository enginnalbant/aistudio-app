import React from 'react';
import { 
  Zap,
  Home,
  Calendar,
  Gauge,
  Wand2,
  Bell,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useWallpaper } from '../context/WallpaperContext';
import { useHeader } from '../context/HeaderContext';
import { getLiquidGlassStyle } from './navigation/LiquidGlassLayer';
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

export const Header = React.memo(function Header({ setActiveModule }: HeaderProps) {
  const { settings, updateSetting } = useSettings();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const { openWizard } = useWallpaper();
  const { preferences, openHeaderStudio } = useHeader();

  const { layout, glassConfig, widgets, widgetOrder } = preferences;
  const glassStyle = getLiquidGlassStyle(glassConfig);

  const isWidgetVisible = (id: string) => widgets[id] !== false;

  return (
    <header
      style={{
        ...glassStyle,
        height: `${layout.height}px`,
        marginTop: `${layout.outerMargin}px`,
        marginLeft: `${layout.outerMargin}px`,
        marginRight: `${layout.outerMargin}px`,
        paddingLeft: `${layout.paddingX}px`,
        paddingRight: `${layout.paddingX}px`,
        borderRadius: `${layout.cornerRadius}px`,
        gap: `${layout.gap}px`,
      }}
      className="flex items-center justify-between shrink-0 relative transition-all duration-300 z-40 touch-optimized select-none"
    >
      {/* Left Section: Home, Search, Mobile Logo */}
      <div className="flex items-center gap-2 min-w-0">
        {isWidgetVisible('homeButton') && (
          <button 
            onClick={() => setActiveModule('welcome-overview')}
            className="h-8 w-8 rounded-xl bg-focus-main/20 hover:bg-focus-main/30 text-pure-white border border-focus-neon/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group shrink-0 cursor-pointer"
            title="Ana Sayfa"
          >
            <Home className="w-4 h-4 text-focus-neon group-hover:scale-110 transition-transform duration-300" />
          </button>
        )}

        {isWidgetVisible('searchBar') && (
          <SearchBar onNavigate={setActiveModule} />
        )}
        
        {/* Mobile Logo */}
        {isWidgetVisible('mobileLogo') && (
          <div className="hidden xs:flex lg:hidden items-center gap-1 ml-0.5 shrink-0">
            <div className="w-6 h-6 rounded-md bg-focus-main flex items-center justify-center shrink-0">
              <Zap size={12} className="text-pure-white" />
            </div>
            <span className="text-xs font-display font-black tracking-tighter text-text-primary">
              APEX<span className="text-focus-neon">OS</span>
            </span>
          </div>
        )}
      </div>

      {/* Right Section: Configurable Widgets Order */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {widgetOrder.map((widgetId) => {
          if (!isWidgetVisible(widgetId)) return null;

          switch (widgetId) {
            case 'environmentalWidget':
              return <EnvironmentalWidget key={widgetId} />;

            case 'fpsSelector':
              return (
                <button
                  key={widgetId}
                  onClick={() => {
                    const currentFps = settings['performance.fps']?.value || 120;
                    const nextFps = currentFps === 120 ? 90 : currentFps === 90 ? 60 : 120;
                    updateSetting('performance.fps', nextFps);
                  }}
                  className="h-8 px-2 rounded-xl bg-focus-neon/10 border border-focus-neon/30 text-focus-neon font-mono text-[10px] font-black flex items-center gap-1 hover:bg-focus-neon/20 active:scale-95 transition-all shrink-0 cursor-pointer"
                  title={`Ekran Tazeleme Oranı (Şu an: ${settings['performance.fps']?.value || 120} FPS)`}
                >
                  <Gauge size={12} className="shrink-0" />
                  <span className="hidden xs:inline">{settings['performance.fps']?.value || 120} FPS</span>
                  <span className="xs:hidden">{settings['performance.fps']?.value || 120}</span>
                </button>
              );

            case 'languageSelector':
              return <LanguageSelector key={widgetId} variant="compact" />;

            case 'themeToggle':
              return (
                <div key={widgetId} className="mr-0.5 hidden md:block">
                  <Switch 
                    checked={settings['theme.mode']?.value === 'dark' || (settings['theme.mode']?.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)}
                    onChange={(checked) => updateSetting('theme.mode', checked ? 'dark' : 'light')}
                  />
                </div>
              );

            case 'notifications':
              return (
                <Popover key={widgetId}>
                  <PopoverTrigger asChild>
                    <button 
                      className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-focus-neon transition-all duration-300 active:scale-95 border border-white/10 relative shrink-0 cursor-pointer"
                      title={t('nav.notifications', 'Bildirimler')}
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-focus-neon rounded-full border border-skel-space" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] sm:w-[520px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                    <NotificationsMenu />
                  </PopoverContent>
                </Popover>
              );

            case 'calendar':
              return (
                <Popover key={widgetId}>
                  <PopoverTrigger asChild>
                    <button 
                      className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-focus-neon transition-all duration-300 active:scale-95 border border-white/10 shrink-0 cursor-pointer"
                      title={t('nav.calendar', 'Takvim')}
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] sm:w-[320px] p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                    <CalendarMenu />
                  </PopoverContent>
                </Popover>
              );

            case 'wallpaperWizard':
              return (
                <button 
                  key={widgetId}
                  onClick={openWizard}
                  className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-focus-neon/15 hover:bg-focus-neon/25 text-focus-neon transition-all duration-300 active:scale-95 border border-focus-neon/30 shrink-0 cursor-pointer"
                  title="Duvar Kağıdı & Akıllı Tema Sihirbazı"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              );

            case 'headerStudioButton':
              return (
                <button 
                  key={widgetId}
                  onClick={openHeaderStudio}
                  className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl bg-focus-main/30 hover:bg-focus-main/50 text-focus-neon transition-all duration-300 active:scale-95 border border-focus-neon/50 shadow-[0_0_15px_rgba(0,229,255,0.25)] shrink-0 cursor-pointer group"
                  title="Header Studio (Header Ayarları & Özelleştirme)"
                >
                  <Sliders className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                </button>
              );

            default:
              return null;
          }
        })}
      </div>
    </header>
  );
});
