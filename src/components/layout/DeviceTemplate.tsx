import React from 'react';
import { DeviceInfo } from '../../hooks/useDevice';
import clsx from 'clsx';

interface DeviceTemplateProps {
  children: React.ReactNode;
  deviceInfo: DeviceInfo;
  activeModule: string;
}

export const DeviceTemplate: React.FC<DeviceTemplateProps> = ({
  children,
  deviceInfo,
  activeModule
}) => {
  const { deviceClass, isPhone, isTablet, isLandscapePhone, orientation } = deviceInfo;

  // Responsive padding and spacing according to Device Template Engine
  const containerClasses = clsx(
    "flex-1 flex flex-col min-w-0 transition-all duration-300 w-full relative",
    // Desktop & Laptop Layouts
    deviceClass === 'desktop' && "p-5 lg:p-6 gap-6 max-w-[1920px] mx-auto",
    deviceClass === 'laptop' && "p-4 gap-4 max-w-[1440px] mx-auto",

    // Tablet Layouts
    deviceClass === 'tablet_landscape' && "p-4 gap-3.5 max-w-full",
    deviceClass === 'tablet_portrait' && "p-3.5 sm:p-4 gap-3 max-w-full",

    // Phone Layouts - High Density & Max Visible Space
    deviceClass === 'large_phone' && "p-3 gap-2.5 max-w-full pb-24",
    deviceClass === 'medium_phone' && "p-2.5 gap-2 max-w-full pb-24",
    deviceClass === 'small_phone' && "p-2 gap-2 max-w-full pb-24",

    // Phone Landscape Mode
    isLandscapePhone && "p-2.5 gap-2 pb-20 grid-adaptive-cols"
  );

  return (
    <div 
      className={containerClasses}
      data-device-template={deviceClass}
      data-device-orientation={orientation}
    >
      {/* Device Class Badge in Dev / Smooth Layout Container */}
      <div className="w-full h-full flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
};
