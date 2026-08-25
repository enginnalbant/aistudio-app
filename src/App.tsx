import { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AndroidDockBar } from './components/AndroidDockBar';
import { SpatialBackground } from './components/SpatialBackground';
import { SettingsModal } from './components/ui/SettingsModal';
import { SidebarStudioModal } from './components/navigation/SidebarStudioModal';
import { HeaderStudioModal } from './components/navigation/HeaderStudioModal';
import { HeaderProvider } from './context/HeaderContext';
import { CommandPaletteModal } from './components/navigation/CommandPaletteModal';
import { SecurityUnlockModal } from './components/navigation/SecurityUnlockModal';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { DesignSystemProvider } from './context/DesignSystemContext';
import { NavigationProvider } from './context/NavigationContext';
import { WallpaperWizardModal } from './components/wallpaper/WallpaperWizardModal';
import { MainContentViewer } from './components/navigation/MainContentViewer';
import { useDevice } from './hooks/useDevice';

function AppLayout() {
  const { settings } = useSettings();
  const deviceInfo = useDevice();
  const isLargeScreen = deviceInfo.width >= 1024;
  const [activeModule, setActiveModule] = useState('workspace-main');
  const [isSidebarOpen, setIsSidebarOpen] = useState(isLargeScreen);
  const [isBooting, setIsBooting] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    (window as any).openSettingsModal = () => setIsSettingsOpen(true);
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => {
      clearTimeout(timer);
      delete (window as any).openSettingsModal;
    };
  }, []);

  // Close sidebar on mobile/tablet when module changes
  useEffect(() => {
    if (!isLargeScreen) {
      setIsSidebarOpen(false);
    }
  }, [activeModule, isLargeScreen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSetActiveModule = useCallback((mod: string) => {
    setActiveModule(mod);
  }, []);

  useEffect(() => {
    (window as any).setActiveModule = handleSetActiveModule;
    return () => {
      delete (window as any).setActiveModule;
    };
  }, [handleSetActiveModule]);

  return (
    <div className="h-screen w-full bg-transparent text-skel-glass flex flex-col overflow-hidden selection:bg-focus-neon/30">
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-skel-obsidian flex flex-col items-center justify-center gap-8"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative"
            >
              <div className="w-40 h-40 rounded-[2.5rem] bg-focus-main flex items-center justify-center shadow-[0_0_120px_rgba(30,144,255,0.4)] relative overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[6px] border-pure-white/10 border-t-pure-white rounded-full scale-90"
                />
                <Zap size={48} className="text-pure-white relative z-10" />
              </div>
              <div className="absolute inset-0 bg-focus-main blur-[100px] opacity-30 animate-pulse" />
            </motion.div>
            <div className="space-y-3 text-center">
              <h1 className="text-5xl font-display font-black tracking-tighter text-pure-white">APEX <span className="text-focus-neon">OS</span></h1>
              <p className="text-skel-metal font-mono text-[11px] uppercase tracking-[0.6em] animate-pulse">Neural Environment v4.2.0 Initializing...</p>
            </div>
            <div className="w-80 h-1.5 bg-skel-metal/10 rounded-full overflow-hidden mt-6 backdrop-blur-md border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }}
                className="h-full bg-gradient-to-r from-focus-main to-focus-neon shadow-[0_0_20px_rgba(37,99,235,0.6)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header 
          toggleSidebar={toggleSidebar} 
          setActiveModule={handleSetActiveModule}
        />
        
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <SidebarStudioModal />
        <HeaderStudioModal />
        <CommandPaletteModal />
        <SecurityUnlockModal />
        <WallpaperWizardModal />
        
        <div className="flex-1 flex overflow-hidden p-1 sm:p-3 lg:p-4 gap-2 sm:gap-3 lg:gap-4 relative pb-20 lg:pb-4 touch-optimized">
          {/* Backdrop Overlay for Mobiles & Tablets */}
          {!isLargeScreen && isSidebarOpen && (
            <div 
              onClick={() => setIsSidebarOpen(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] transition-all duration-300"
            />
          )}

          <Sidebar 
            isOpen={isSidebarOpen} 
            activeModule={activeModule} 
            setActiveModule={handleSetActiveModule} 
            closeSidebar={() => setIsSidebarOpen(false)}
            setSidebarOpen={setIsSidebarOpen}
          />
          
          <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
            <MainContentViewer />
          </main>
        </div>
      </div>

      <AndroidDockBar 
        activeModule={activeModule} 
        setActiveModule={handleSetActiveModule} 
        toggleSidebar={toggleSidebar} 
      />
    </div>
  );
}

function AppContent() {
  return (
    <div className="h-screen w-full bg-transparent text-skel-glass flex flex-col overflow-hidden relative">
      <SpatialBackground />

      {/* Volumetric Atmosphere */}
      <div className="v-fog" />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-focus-main/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ai-royal/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 h-full w-full">
        <AppLayout />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <WallpaperProvider>
            <DesignSystemProvider>
              <NotificationProvider>
                <NavigationProvider>
                  <HeaderProvider>
                    <AppContent />
                  </HeaderProvider>
                </NavigationProvider>
              </NotificationProvider>
            </DesignSystemProvider>
          </WallpaperProvider>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
