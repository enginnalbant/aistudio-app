import React from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { TwoLevelSidebar } from '../ui/sidebar-component';
import { useDevice } from '../../hooks/useDevice';

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
        width: 260,
        height: 'calc(100% - 11rem)',
        bottom: 'auto',
        left: 12,
        right: 'auto',
        x: isOpen ? 0 : -320,
        opacity: isOpen ? 1 : 0
      };

  return (
    <motion.aside
      initial={false}
      animate={animateConfig}
      transition={{ type: "spring", damping: 28, stiffness: 170 }}
      className={`flex flex-col shrink-0 z-[101] h-full ${isDesktop ? 'relative' : 'fixed top-[4.5rem] shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/95 backdrop-blur-2xl'}`}
    >
      <TwoLevelSidebar setActiveModule={setActiveModule} isOpen={isOpen || !isDesktop} activeModule={activeModule} setSidebarOpen={setSidebarOpen} />
    </motion.aside>
  );
});
