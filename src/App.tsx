import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, Header, MobileNav, SpatialBackground, LoginPage } from './components/layout';
import { SettingsModal } from './components/ui/SettingsModal';
import { NotificationPage } from './components/NotificationPage';
import { NotificationSettings } from './components/NotificationSettings';
import { CalendarPage } from './components/CalendarPage';
import {
  FinanceDashboard,
  FinanceIncomes,
  FinanceExpenses,
  FinanceSubscriptions,
  FinanceInvestments,
  FinancePurchasing,
  FinanceAnalytics,
  FinanceReports
} from './components/finance';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import { ComingSoon } from './components/ui/ComingSoon';
import { BulletinNews } from './components/bulletin/BulletinNews';
import { NotesQuick } from './components/notes/NotesQuick';
import { NotesNotebook } from './components/notes/NotesNotebook';
import { NotesTodo } from './components/notes/NotesTodo';
import { NotesBookmarks } from './components/notes/NotesBookmarks';
import { NotesPasswords } from './components/notes/NotesPasswords';
import { NotesBooks } from './components/notes/NotesBooks';

import { SettingsProvider, useSettings } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { useDevice } from './hooks/useDevice';
import { AIFinanceAssistant } from './components/finance/AIFinanceAssistant';

function AppLayout() {
  const { settings } = useSettings();
  const { isMobile, isDesktop } = useDevice();
  const [activeModule, setActiveModule] = useState('finance-dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop && settings['sidebar_default']?.value === 'expanded');
  const [isBooting, setIsBooting] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    (window as any).openSettingsModal = () => setIsSettingsOpen(true);
    const timer = setTimeout(() => setIsBooting(false), 2500);
    return () => {
      clearTimeout(timer);
      delete (window as any).openSettingsModal;
    };
  }, []);

  // Close sidebar on mobile when module changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [activeModule, isMobile]);

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
        
        <div className="flex-1 flex overflow-hidden p-3 lg:p-4 gap-3 lg:gap-4 relative pb-24 lg:pb-4">
          {/* Backdrop Overlay for Mobiles & Tablets */}
          {!isDesktop && isSidebarOpen && (
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
          
          <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto custom-scrollbar bg-white/[0.04] backdrop-blur-[40px] rounded-2xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] p-3 lg:p-6 transition-all duration-700">
            <main className="flex-1 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, scale: 0.99, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.99, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="w-full h-full min-h-[500px]"
              >
                {activeModule === 'notification-page' ? (
                  <NotificationPage />
                ) : activeModule === 'notification-settings' ? (
                  <NotificationSettings />
                ) : activeModule === 'calendar-page' ? (
                  <CalendarPage />
                ) : activeModule === 'finance-dashboard' ? (
                  <FinanceDashboard />
                ) : activeModule === 'finance-incomes' ? (
                  <FinanceIncomes />
                ) : activeModule === 'finance-expenses' ? (
                  <FinanceExpenses />
                ) : activeModule === 'finance-subscriptions' ? (
                  <FinanceSubscriptions />
                ) : activeModule === 'finance-investments' ? (
                  <FinanceInvestments />
                ) : activeModule === 'finance-purchasing' ? (
                  <FinancePurchasing />
                ) : activeModule === 'finance-analytics' ? (
                  <FinanceAnalytics />
                ) : activeModule === 'finance-reports' ? (
                  <FinanceReports />
                ) : activeModule === 'library-ebooks' ? (
                  <NotesBooks />
                ) : activeModule.startsWith('library-') ? (
                  <ComingSoon 
                    title={activeModule.replace('library-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} 
                    brandName="APEXOS KÜTÜPHANE" 
                  />
                ) : activeModule === 'notes-quick' ? (
                  <NotesQuick />
                ) : activeModule === 'notes-notebook' ? (
                  <NotesNotebook />
                ) : activeModule === 'notes-todo' ? (
                  <NotesTodo />
                ) : activeModule === 'notes-bookmarks' ? (
                  <NotesBookmarks />
                ) : activeModule === 'notes-passwords' ? (
                  <NotesPasswords />
                ) : activeModule === 'notes-books' ? (
                  <NotesBooks />
                ) : activeModule.startsWith('notes-') ? (
                  <ComingSoon 
                    title={activeModule.replace('notes-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} 
                    brandName="APEXOS NOTLARIM" 
                  />
                ) : activeModule.startsWith('bulletin-') ? (
                  <BulletinNews activeSubModule={activeModule.replace('bulletin-', '')} />
                ) : (
                  <FinanceDashboard />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      </div>

      <MobileNav 
        activeModule={activeModule} 
        setActiveModule={handleSetActiveModule} 
        toggleSidebar={toggleSidebar} 
      />

      <AIFinanceAssistant />
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

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
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-transparent">
            <div className="w-12 h-12 border-4 border-focus-neon/20 border-t-focus-neon rounded-full animate-spin" />
          </div>
        ) : user ? (
          <AppLayout />
        ) : (
          <LoginPage />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
