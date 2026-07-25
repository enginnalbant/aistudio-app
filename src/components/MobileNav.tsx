import React from 'react';
import { 
  Menu,
  Wallet,
  Library,
  NotebookPen,
  Rss
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import clsx from 'clsx';

interface MobileNavProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  toggleSidebar: () => void;
}

export const MobileNav = React.memo(function MobileNav({ activeModule, setActiveModule, toggleSidebar }: MobileNavProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'finance-dashboard', label: t('nav.finance', 'Finans'), icon: <Wallet size={20} /> },
    { id: 'library-dashboard', label: t('nav.library', 'Kütüphane'), icon: <Library size={20} /> },
    { id: 'notes-dashboard', label: t('nav.notes', 'Notlarım'), icon: <NotebookPen size={20} /> },
    { id: 'bulletin-dashboard', label: t('nav.bulletin', 'Bülten'), icon: <Rss size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 sm:h-20 bg-skel-space/90 backdrop-blur-2xl border-t border-skel-metal/15 z-50 lg:hidden px-2 sm:px-4 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const isActive = activeModule.startsWith(item.id.split('-')[0]);
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={clsx(
              "flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative px-2 py-1 min-w-[56px] min-h-[44px] touch-manipulation active:scale-95",
              isActive ? "text-focus-neon font-bold" : "text-text-secondary opacity-70 hover:opacity-100"
            )}
          >
            {isActive && (
              <motion.div 
                layoutId="mobile-nav-active"
                className="absolute -top-1 sm:-top-2 w-8 h-1 bg-focus-neon rounded-full shadow-[0_0_15px_rgba(112,161,255,0.9)]"
              />
            )}
            <div className={clsx(
              "p-1.5 rounded-xl transition-all duration-300",
              isActive ? "bg-focus-neon/15 scale-105 text-focus-neon" : "hover:bg-skel-matte/10"
            )}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[68px]">{item.label}</span>
          </button>
        );
      })}
      
      <button
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center gap-0.5 text-text-secondary opacity-70 hover:opacity-100 px-2 py-1 min-w-[56px] min-h-[44px] touch-manipulation active:scale-95"
      >
        <div className="p-1.5 rounded-xl hover:bg-skel-matte/10">
          <Menu size={20} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">{t('nav.menu', 'Menü')}</span>
      </button>
    </nav>
  );
});
