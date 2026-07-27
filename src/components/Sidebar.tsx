import React from 'react';
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
  const { isDesktop } = useDevice();

  // MOBİL VE TABLETTE SIDEBAR OLMASIN! Sadece desktop ise render edilsin.
  if (!isDesktop) {
    return null;
  }

  return (
    <aside className="flex flex-col shrink-0 z-[101] h-full relative">
      <TwoLevelSidebar
        setActiveModule={setActiveModule}
        isOpen={isOpen}
        activeModule={activeModule}
        setSidebarOpen={setSidebarOpen}
      />
    </aside>
  );
});
