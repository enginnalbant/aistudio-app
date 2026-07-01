import React from 'react';
import { 
  Menu,
  Wallet,
  Library,
  NotebookPen,
  Rss
} from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';

interface MobileNavProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  toggleSidebar: () => void;
}

export const MobileNav = React.memo(function MobileNav({ activeModule, setActiveModule, toggleSidebar }: MobileNavProps) {
  const navItems = [
    { id: 'finance-dashboard', label: 'Finans', icon: <Wallet size={20} /> },
    { id: 'library-dashboard', label: 'Kütüphane', icon: <Library size={20} /> },
    { id: 'notes-dashboard', label: 'Notlarım', icon: <NotebookPen size={20} /> },
    { id: 'bulletin-dashboard', label: 'Bülten', icon: <Rss size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-skel-space/80 backdrop-blur-xl border-t border-skel-metal/10 z-50 lg:hidden px-4 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      {navItems.map((item) => {
        const isActive = activeModule.startsWith(item.id.split('-')[0]);
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={clsx(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-2",
              isActive ? "text-focus-neon" : "text-text-secondary opacity-60"
            )}
          >
            {isActive && (
              <motion.div 
                layoutId="mobile-nav-active"
                className="absolute -top-4 w-8 h-1 bg-focus-neon rounded-full shadow-[0_0_15px_rgba(112,161,255,0.8)]"
              />
            )}
            <div className={clsx(
              "p-2 rounded-xl transition-all duration-500",
              isActive ? "bg-focus-neon/10 scale-110" : "hover:bg-skel-matte/5"
            )}>
              {item.icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        );
      })}
      
      <button
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center gap-1 text-text-secondary opacity-60 px-2"
      >
        <div className="p-2 rounded-xl hover:bg-skel-matte/5">
          <Menu size={20} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">Menü</span>
      </button>
    </nav>
  );
});
