import React from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { TwoLevelSidebar } from './ui/sidebar-component';

interface SidebarProps {
  isOpen: boolean;
  activeModule: string;
  setActiveModule: (module: string) => void;
  closeSidebar?: () => void;
  setSidebarOpen?: (open: boolean) => void;
}

export const Sidebar = React.memo(function Sidebar({ isOpen, activeModule, setActiveModule, closeSidebar, setSidebarOpen }: SidebarProps) {
  const { settings } = useSettings();
  const position = settings['sidebar_position']?.value;

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: position === 'bottom' ? 'auto' : (isOpen ? 'auto' : 56),
        height: position === 'bottom' ? 80 : '100%',
        bottom: position === 'bottom' ? 20 : 'auto',
        left: position === 'bottom' ? '50%' : (position === 'left' ? 0 : 'auto'),
        right: position === 'right' ? 0 : 'auto',
        x: position === 'bottom' ? '-50%' : 0
      }}
      transition={{ type: "spring", damping: 30, stiffness: 150 }}
      className="flex flex-col shrink-0 relative group/sidebar z-[101]"
    >
      <TwoLevelSidebar setActiveModule={setActiveModule} isOpen={isOpen} activeModule={activeModule} setSidebarOpen={setSidebarOpen} />
    </motion.aside>
  );
});
