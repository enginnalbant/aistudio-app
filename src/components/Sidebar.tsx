import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigation } from '../context/NavigationContext';
import { AdaptiveSidebar } from './navigation/AdaptiveSidebar';
import { useDevice } from '../hooks/useDevice';

interface SidebarProps {
  isOpen: boolean;
  activeModule: string;
  setActiveModule: (module: string) => void;
  closeSidebar?: () => void;
  setSidebarOpen?: (open: boolean) => void;
}

export const Sidebar = React.memo(function Sidebar({ isOpen, closeSidebar, setSidebarOpen }: SidebarProps) {
  const { isDesktop, isLaptop, width } = useDevice();
  const { preferences, currentMode } = useNavigation();

  // Laptops and Desktops (width >= 1024px) use relative inline adaptive sidebar
  const isLargeScreen = isDesktop || isLaptop || width >= 1024;

  if (isLargeScreen) {
    return <AdaptiveSidebar isOpen={isOpen} />;
  }

  // Mobile / Tablet Drawer Layout
  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -360,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed left-2 top-16 bottom-20 z-[101] shadow-2xl rounded-2xl overflow-hidden"
      >
        <AdaptiveSidebar isOpen={isOpen} onCloseMobile={closeSidebar} />
      </motion.div>
    </>
  );
});
