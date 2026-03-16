import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { JobsDashboard } from './components/jobs/JobsDashboard';
import { MainDashboard } from './components/MainDashboard';
import { OpenJobs } from './components/jobs/OpenJobs';
import { AllJobs } from './components/jobs/AllJobs';
import { StocksDashboard } from './components/stocks/StocksDashboard';
import { AllStocks } from './components/stocks/AllStocks';
import { AccountsDashboard } from './components/accounts/AccountsDashboard';
import { AccountsList } from './components/accounts/AccountsList';
import { AccountReconciliation } from './components/accounts/AccountReconciliation';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { SystemMonitor } from './components/system/SystemMonitor';
import { Terminal } from './components/system/Terminal';
import { PlannerDashboard } from './components/planner/PlannerDashboard';
import { DailyPlanner } from './components/planner/DailyPlanner';
import { Tasks } from './components/planner/Tasks';
import { Notes } from './components/planner/Notes';
import { Reminders } from './components/planner/Reminders';
import { AIAssistant } from './components/AIAssistant';
import { SpatialBackground } from './components/SpatialBackground';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Database, Globe, Activity } from 'lucide-react';

import { NotificationsPage } from './components/notifications/NotificationsPage';
import { CalendarPage } from './components/calendar/CalendarPage';
import { SettingsPage } from './components/settings/SettingsPage';

import { BudgetDashboard } from './components/budget/BudgetDashboard';
import { Incomes } from './components/budget/Incomes';
import { Expenses } from './components/budget/Expenses';
import { Subscriptions } from './components/budget/Subscriptions';
import { Investments } from './components/budget/Investments';
import { Wishlist } from './components/budget/Wishlist';
import { BudgetReports } from './components/budget/BudgetReports';

import { MediaDashboard } from './components/media/MediaDashboard';
import { NewsMagazines } from './components/media/NewsMagazines';
import { Library } from './components/media/Library';
import { Education } from './components/media/Education';
import { Records } from './components/media/Records';

import { ShipmentDashboard } from './components/shipment/ShipmentDashboard';
import { PendingShipments } from './components/shipment/PendingShipments';
import { InTransitShipments } from './components/shipment/InTransitShipments';
import { AllShipments } from './components/shipment/AllShipments';
import { ShipmentReports } from './components/shipment/ShipmentReports';
import { ShipmentSettings } from './components/shipment/ShipmentSettings';

import { OthersDashboard } from './components/others/OthersDashboard';
import { CharacterConverter } from './components/others/CharacterConverter';
import { Translation } from './components/others/Translation';
import { Templates } from './components/others/Templates';
import { Documents } from './components/others/Documents';

import { PurchasingDashboard } from './components/purchasing/PurchasingDashboard';
import { PurchasingRequests } from './components/purchasing/PurchasingRequests';
import { PurchasingPlanning } from './components/purchasing/PurchasingPlanning';
import { PurchasingQuotes } from './components/purchasing/PurchasingQuotes';
import { PurchasingOrders } from './components/purchasing/PurchasingOrders';
import { AllOrders } from './components/purchasing/AllOrders';
import { PurchasingReports } from './components/purchasing/PurchasingReports';

import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ShipmentProvider } from './context/ShipmentContext';
import { useTimeLighting } from './hooks/useTimeLighting';

function AppLayout() {
  const { settings } = useSettings();
  const [activeModule, setActiveModule] = useState('main-dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(settings.sidebar_default === 'expanded');
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const getTransitionDuration = () => {
    const speedMap = { none: 0, slow: 0.6, normal: 0.3, fast: 0.15 };
    return speedMap[settings.animation_speed];
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'main-dashboard': return <MainDashboard setActiveModule={setActiveModule} />;
      case 'jobs-dashboard': return <JobsDashboard setActiveModule={setActiveModule} />;
      case 'jobs-open': return <OpenJobs />;
      case 'jobs-all': return <AllJobs />;
      case 'stocks-dashboard': return <StocksDashboard setActiveModule={setActiveModule} />;
      case 'stocks-all': return <AllStocks />;
      case 'accounts-dashboard': return <AccountsDashboard setActiveModule={setActiveModule} />;
      case 'accounts-list': return <AccountsList />;
      case 'accounts-reconciliation': return <AccountReconciliation />;
      case 'reports': return <ReportsDashboard setActiveModule={setActiveModule} />;
      case 'notifications': return <NotificationsPage />;
      case 'calendar': return <CalendarPage />;
      case 'settings-page': return <SettingsPage />;
      case 'system-monitor': return <SystemMonitor />;
      case 'planner-dashboard': return <PlannerDashboard setActiveModule={setActiveModule} />;
      case 'planner-daily': return <DailyPlanner />;
      case 'planner-tasks': return <Tasks />;
      case 'planner-notes': return <Notes />;
      case 'planner-reminders': return <Reminders />;
      case 'budget-dashboard': return <BudgetDashboard setActiveModule={setActiveModule} />;
      case 'budget-incomes': return <Incomes />;
      case 'budget-expenses': return <Expenses />;
      case 'budget-subscriptions': return <Subscriptions />;
      case 'budget-investments': return <Investments />;
      case 'budget-wishlist': return <Wishlist />;
      case 'budget-reports': return <BudgetReports />;
      case 'media-dashboard': return <MediaDashboard setActiveModule={setActiveModule} />;
      case 'media-news': return <NewsMagazines />;
      case 'media-library': return <Library />;
      case 'media-education': return <Education />;
      case 'media-records': return <Records />;
      case 'shipment-dashboard': return <ShipmentDashboard setActiveModule={setActiveModule} />;
      case 'shipment-pending': return <PendingShipments />;
      case 'shipment-transit': return <InTransitShipments />;
      case 'shipment-all': return <AllShipments />;
      case 'shipment-reports': return <ShipmentReports />;
      case 'shipment-settings': return <ShipmentSettings />;
      case 'others-dashboard': return <OthersDashboard />;
      case 'others-transliteration': return <CharacterConverter />;
      case 'others-translation': return <Translation />;
      case 'others-templates': return <Templates />;
      case 'others-documents': return <Documents />;
      case 'purchasing-dashboard': return <PurchasingDashboard />;
      case 'purchasing-requests': return <PurchasingRequests setActiveModule={setActiveModule} />;
      case 'purchasing-planning': return <PurchasingPlanning />;
      case 'purchasing-quotes': return <PurchasingQuotes />;
      case 'purchasing-orders': return <PurchasingOrders />;
      case 'purchasing-all': return <AllOrders />;
      case 'purchasing-reports': return <PurchasingReports />;
      default: return <JobsDashboard setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="h-screen w-full bg-void-black text-skel-glass flex flex-col overflow-hidden">
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-void-black flex flex-col items-center justify-center gap-8"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-3xl bg-focus-main flex items-center justify-center shadow-[0_0_100px_rgba(30,144,255,0.3)]">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-pure-white/20 border-t-pure-white rounded-full"
                />
              </div>
              <div className="absolute inset-0 bg-focus-main blur-3xl opacity-20 animate-pulse" />
            </motion.div>
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-display font-black tracking-tighter text-pure-white">APEX <span className="text-focus-neon">OS</span></h1>
              <p className="text-skel-metal font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Cognitive AI-OS v4.2.0 Initializing...</p>
            </div>
            <div className="w-64 h-1 bg-skel-metal/10 rounded-full overflow-hidden mt-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full bg-focus-neon shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SpatialBackground />

      {/* Volumetric Atmosphere */}
      <div className="v-fog" />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-focus-main/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ai-royal/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Header 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        setActiveModule={setActiveModule}
      />
      
      <div className="flex flex-1 overflow-hidden p-6 gap-6 relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          activeModule={activeModule} 
          setActiveModule={setActiveModule} 
        />
        
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto custom-scrollbar">
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
          
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ShipmentProvider>
        <AppLayout />
      </ShipmentProvider>
    </SettingsProvider>
  );
}
