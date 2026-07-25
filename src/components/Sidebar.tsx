import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { TwoLevelSidebar } from './ui/sidebar-component';
import { useDevice } from '../hooks/useDevice';

interface SidebarProps {
  isOpen: boolean;
  activeModule: string;
  setActiveModule: (module: string) => void;
  closeSidebar?: () => void;
  setSidebarOpen?: (open: boolean) => void;
}

export const Sidebar = React.memo(function Sidebar({ isOpen, activeModule, setActiveModule, closeSidebar, setSidebarOpen }: SidebarProps) {
  const { settings } = useSettings();
  const { isDesktop } = useDevice();
  const position = settings['sidebar_position']?.value;

  // On non-desktop devices (mobiles & tablets), the sidebar should act as an overlay drawer.
  const animateConfig = isDesktop 
    ? {
        width: position === 'bottom' ? 'auto' : (isOpen ? 'auto' : 56),
        height: position === 'bottom' ? 80 : '100%',
        bottom: position === 'bottom' ? 20 : 'auto',
        left: position === 'bottom' ? '50%' : (position === 'left' ? 0 : 'auto'),
        right: position === 'right' ? 0 : 'auto',
        x: position === 'bottom' ? '-50%' : 0,
        opacity: 1
      }
    : {
        width: 280,
        height: 'calc(100% - 6.5rem)',
        bottom: 'auto',
        left: 12,
        right: 'auto',
        x: isOpen ? 0 : -340,
        opacity: isOpen ? 1 : 0
      };

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      {!isDesktop && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="sidebar-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (closeSidebar) closeSidebar();
                else if (setSidebarOpen) setSidebarOpen(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
          )}
        </AnimatePresence>
      )}

      <motion.aside 
        initial={false}
        animate={animateConfig}
        transition={{ type: "spring", damping: 28, stiffness: 170 }}
        className={`flex flex-col shrink-0 z-[101] h-full ${isDesktop ? 'relative' : 'fixed top-[4.25rem] shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-neutral-950/98 backdrop-blur-3xl'}`}
      >
        <TwoLevelSidebar setActiveModule={setActiveModule} isOpen={isOpen || !isDesktop} activeModule={activeModule} setSidebarOpen={setSidebarOpen} />
      </motion.aside>
    </>
  );
});

