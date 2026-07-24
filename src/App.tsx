import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { SpatialBackground } from './components/SpatialBackground';
import { SettingsModal } from './components/ui/SettingsModal';
import { NotificationPage } from './components/NotificationPage';
import { NotificationSettings } from './components/NotificationSettings';
import { CalendarPage } from './components/CalendarPage';
import { 
  PurchasingDashboard,
  PurchasingRequests,
  PurchasingLists,
  PurchasingQuotes,
  PurchasingPendingOrders,
  PurchasingSentOrders,
  PurchasingAllOrders,
  PurchasingReports,
  PurchasingAnalytics
} from './components/PurchasingModules';
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
import {
  FasonDashboard,
  FasonOutgoing,
  FasonAll,
  FasonReports,
  FasonAnalytics,
  StocksDashboard,
  StocksList,
  StocksReports,
  StocksAnalytics,
  ContactsDashboard,
  ContactsList,
  ContactsReports,
  ContactsAnalytics,
  ReconDashboard,
  ReconContacts,
  ReconReports,
  ReconAnalytics
} from './components/ModulePages';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import { ComingSoon } from './components/ui/ComingSoon';
import { BulletinNews } from './components/bulletin/BulletinNews';
import { NotesTodo } from './components/notes/NotesTodo';
import { NotesBookmarks } from './components/notes/NotesBookmarks';
import { NotesPasswords } from './components/notes/NotesPasswords';
import { NotesBooks } from './components/notes/NotesBooks';

import { SettingsProvider, useSettings } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { useDevice } from './hooks/useDevice';

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
                ) : activeModule === 'purchasing-dashboard' ? (
                  <PurchasingDashboard />
                ) : activeModule === 'purchasing-requests' ? (
                  <PurchasingRequests />
                ) : activeModule === 'purchasing-lists' ? (
                  <PurchasingLists />
                ) : activeModule === 'purchasing-quotes' ? (
                  <PurchasingQuotes />
                ) : activeModule === 'purchasing-pending-orders' ? (
                  <PurchasingPendingOrders />
                ) : activeModule === 'purchasing-sent-orders' ? (
                  <PurchasingSentOrders />
                ) : activeModule === 'purchasing-all-orders' ? (
                  <PurchasingAllOrders />
                ) : activeModule === 'purchasing-reports' ? (
                  <PurchasingReports />
                ) : activeModule === 'purchasing-analytics' ? (
                  <PurchasingAnalytics />
                ) : activeModule === 'fason-dashboard' ? (
                  <FasonDashboard />
                ) : activeModule === 'fason-outgoing' ? (
                  <FasonOutgoing />
                ) : activeModule === 'fason-all' ? (
                  <FasonAll />
                ) : activeModule === 'fason-reports' ? (
                  <FasonReports />
                ) : activeModule === 'fason-analytics' ? (
                  <FasonAnalytics />
                ) : activeModule === 'stocks-dashboard' ? (
                  <StocksDashboard />
                ) : activeModule === 'stocks-list' ? (
                  <StocksList />
                ) : activeModule === 'stocks-reports' ? (
                  <StocksReports />
                ) : activeModule === 'stocks-analytics' ? (
                  <StocksAnalytics />
                ) : activeModule === 'contacts-dashboard' ? (
                  <ContactsDashboard />
                ) : activeModule === 'contacts-list' ? (
                  <ContactsList />
                ) : activeModule === 'contacts-reports' ? (
                  <ContactsReports />
                ) : activeModule === 'contacts-analytics' ? (
                  <ContactsAnalytics />
                ) : activeModule === 'recon-dashboard' ? (
                  <ReconDashboard />
                ) : activeModule === 'recon-contacts' ? (
                  <ReconContacts />
                ) : activeModule === 'recon-reports' ? (
                  <ReconReports />
                ) : activeModule === 'recon-analytics' ? (
                  <ReconAnalytics />
                ) : activeModule === 'library-ebooks' ? (
                  <NotesBooks />
                ) : activeModule.startsWith('library-') ? (
                  <ComingSoon 
                    title={activeModule.replace('library-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} 
                    brandName="APEXOS KÜTÜPHANE" 
                  />
                ) : activeModule === 'notes-quick' ? (
                  <ComingSoon 
                    title="Hızlı Notlar" 
                    brandName="APEXOS" 
                  />
                ) : activeModule === 'notes-notebook' ? (
                  <ComingSoon 
                    title="Not Defteri" 
                    brandName="APEXOS" 
                  />
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
    </div>
  );
}

function AppContent() {
  const { user, loading, signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      alert(`Giriş hatası: ${error.message}\n\nİpucu: Vercel kullanıyorsanız, alan adınızı Firebase konsolunda whiteliste eklediğinizden emin olun.`);
    }
  };

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
          <div className="h-full w-full flex items-center justify-center">
             <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-sm w-full mx-4 text-center">
                 <div className="mx-auto w-16 h-16 bg-white/5 flex items-center justify-center rounded-2xl mb-6">
                    <Zap size={32} className="text-focus-neon" />
                 </div>
                 <h1 className="text-2xl font-display font-bold text-white mb-2">APEXOS FİNANS</h1>
                 <p className="text-text-secondary mb-8 text-sm">Tüm cihazlarda senkronize çalışmak için giriş yapın.</p>
                 <button 
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-white/90 transition-colors"
                 >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google ile Giriş Yap
                 </button>
             </div>
          </div>
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
