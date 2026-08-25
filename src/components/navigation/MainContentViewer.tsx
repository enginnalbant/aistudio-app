import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigation } from '../../context/NavigationContext';
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
  ReconAnalytics,
} from '../ModulePages';
import { Analytics } from '../Analytics';
import { Projects } from '../Projects';
import { Team } from '../Team';
import { KnowledgeWorkspace } from '../KnowledgeWorkspace';
import { NotificationPage } from '../NotificationPage';
import { CalendarPage } from '../CalendarPage';
import { PurchasingDashboard } from '../PurchasingModules';
import { DesignSystemStudio } from '../DesignSystemStudio';
import { SettingsPanel } from '../SettingsPanel';
import { HomeScreen } from '../../screens/HomeScreen';
import { Lock, Sparkles, Shield, ChevronRight } from 'lucide-react';

export const MainContentViewer: React.FC = () => {
  const { activeSection, activeModuleId, preferences, unlockedItems, requestUnlock } = useNavigation();

  const currentModule = preferences.modules[activeSection] || preferences.modules['mainmenu'];
  const subPages = currentModule?.subPages || [];
  const currentPageConfig = subPages.find((p) => p.id === activeModuleId) || subPages[0];

  const pageKey = `${activeSection}-${activeModuleId || 'default'}`;

  // Check if current module or current page requires unlock
  const isProtected =
    (currentModule?.securityLevel === 'protected' && !unlockedItems[currentModule.id]) ||
    (currentPageConfig?.securityLevel === 'protected' && !unlockedItems[currentPageConfig.id]);

  // Page Component Resolver
  const PageComponent = useMemo(() => {
    switch (activeModuleId) {
      // Stock
      case 'stock-dashboard':
        return StocksDashboard;
      case 'stock-list':
        return StocksList;
      case 'stock-reports':
        return StocksReports;
      case 'stock-analytics':
        return StocksAnalytics;

      // Contacts
      case 'contact-dashboard':
        return ContactsDashboard;
      case 'contact-list':
        return ContactsList;
      case 'contact-reports':
        return ContactsReports;
      case 'contact-analytics':
        return ContactsAnalytics;

      // Fason
      case 'fason-dashboard':
        return FasonDashboard;
      case 'fason-outgoing':
        return FasonOutgoing;
      case 'fason-all':
        return FasonAll;
      case 'fason-reports':
        return FasonReports;
      case 'fason-analytics':
        return FasonAnalytics;

      // Recon
      case 'recon-dashboard':
        return ReconDashboard;
      case 'recon-contacts':
        return ReconContacts;
      case 'recon-reports':
        return ReconReports;
      case 'recon-analytics':
        return ReconAnalytics;

      // Workspace / General
      case 'home':
      case 'liquid-glass-home':
      case 'workspace-main':
        return HomeScreen;
      case 'projects':
        return Projects;
      case 'team':
        return Team;
      case 'analytics':
        return Analytics;
      case 'knowledge':
        return KnowledgeWorkspace;
      case 'notifications':
        return NotificationPage;
      case 'calendar':
        return CalendarPage;
      case 'purchasing':
        return PurchasingDashboard;
      case 'design-system':
        return DesignSystemStudio;
      case 'settings':
        return () => <SettingsPanel isOpen={true} onClose={() => {}} />;

      default:
        // Default generic workspace placeholder card with glass styling
        return () => (
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-xl h-full flex flex-col justify-center items-center text-center space-y-4 shadow-xl">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10"
              style={{ backgroundColor: `${currentModule?.color || '#00E5FF'}20` }}
            >
              <Sparkles size={32} style={{ color: currentModule?.color || '#00E5FF' }} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                {currentPageConfig?.label || currentModule?.title || 'Sayfa'}
              </h2>
              <p className="text-sm text-neutral-400 max-w-md mt-1">
                {currentPageConfig?.description || 'ApexOS modüler çalışma alanı ve canlı veri görünümü.'}
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-neutral-400 flex items-center gap-2">
              <span>Modül:</span>
              <span className="font-semibold text-white">{currentModule?.title}</span>
              <ChevronRight size={12} />
              <span>Sayfa ID:</span>
              <span className="font-semibold text-focus-neon">{activeModuleId || 'Ana Ekran'}</span>
            </div>
          </div>
        );
    }
  }, [activeModuleId, currentModule, currentPageConfig]);

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {isProtected ? (
          <motion.div
            key="protected-lock-screen"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full flex flex-col items-center justify-center p-6 rounded-3xl bg-neutral-950/80 border border-white/15 backdrop-blur-2xl text-center space-y-5"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
              <Lock size={32} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center justify-center gap-2">
                Korumalı Sayfa
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PIN Korumalı
                </span>
              </h2>
              <p className="text-xs text-neutral-400 max-w-sm mt-1">
                <strong className="text-white">{currentPageConfig?.label || currentModule?.title}</strong> sayfasına erişmek için güvenlik PIN doğrulamasını tamamlayın.
              </p>
            </div>
            <button
              onClick={() =>
                requestUnlock(
                  currentPageConfig?.id || currentModule?.id || 'protected',
                  currentPageConfig?.label || currentModule?.title || 'Korumalı Sayfa',
                  () => {}
                )
              }
              className="px-6 py-2.5 rounded-2xl bg-focus-main hover:bg-focus-main/90 active:scale-95 text-white text-xs font-bold tracking-wide flex items-center gap-2 shadow-lg shadow-focus-main/20 transition-all cursor-pointer"
            >
              <Shield size={16} />
              <span>PIN ile Kilidi Aç</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={pageKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{
              duration: 0.22,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="h-full w-full overflow-y-auto scrollbar-none"
          >
            <PageComponent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
