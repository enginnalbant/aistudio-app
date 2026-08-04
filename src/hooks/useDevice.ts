import { useState, useEffect } from 'react';

export type DeviceClass = 
  | 'desktop' 
  | 'laptop' 
  | 'tablet_landscape' 
  | 'tablet_portrait' 
  | 'large_phone' 
  | 'medium_phone' 
  | 'small_phone';

export type ScreenTier = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Orientation = 'portrait' | 'landscape';
export type PointerType = 'coarse' | 'fine';

export interface DeviceInfo {
  deviceClass: DeviceClass;
  screenTier: ScreenTier;
  orientation: Orientation;
  width: number;
  height: number;
  dpr: number;
  pointer: PointerType;
  touchSupported: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isLaptop: boolean;
  isTabletLandscape: boolean;
  isTabletPortrait: boolean;
  isTablet: boolean;
  isLargePhone: boolean;
  isMediumPhone: boolean;
  isSmallPhone: boolean;
  isPhone: boolean;
  isMobile: boolean;
  isLandscapePhone: boolean;
}

export function getDeviceInfo(): DeviceInfo {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const height = typeof window !== 'undefined' ? window.innerHeight : 800;
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  
  const touchSupported = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
  const pointer: PointerType = touchSupported && width < 1024 ? 'coarse' : 'fine';
  const orientation: Orientation = width >= height ? 'landscape' : 'portrait';

  let deviceClass: DeviceClass = 'desktop';
  if (width >= 1440) {
    deviceClass = 'desktop';
  } else if (width >= 1024) {
    deviceClass = 'laptop';
  } else if (width >= 900) {
    deviceClass = orientation === 'landscape' ? 'tablet_landscape' : 'tablet_portrait';
  } else if (width >= 768) {
    deviceClass = 'tablet_portrait';
  } else if (width >= 430) {
    deviceClass = 'large_phone';
  } else if (width >= 390) {
    deviceClass = 'medium_phone';
  } else {
    deviceClass = 'small_phone';
  }

  let screenTier: ScreenTier = 'lg';
  if (width < 390) screenTier = 'xs';
  else if (width < 430) screenTier = 'sm';
  else if (width < 768) screenTier = 'md';
  else if (width < 1024) screenTier = 'lg';
  else screenTier = 'xl';

  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1440;
  const isLaptop = width >= 1024 && width < 1440;
  const isMobile = isPhone || isTablet;
  const isTabletLandscape = deviceClass === 'tablet_landscape';
  const isTabletPortrait = deviceClass === 'tablet_portrait';
  const isLargePhone = deviceClass === 'large_phone';
  const isMediumPhone = deviceClass === 'medium_phone';
  const isSmallPhone = deviceClass === 'small_phone';
  const isLandscapePhone = isPhone && orientation === 'landscape';

  return {
    deviceClass,
    screenTier,
    orientation,
    width,
    height,
    dpr,
    pointer,
    touchSupported,
    isIOS,
    isAndroid,
    isDesktop,
    isLaptop,
    isTabletLandscape,
    isTabletPortrait,
    isTablet,
    isLargePhone,
    isMediumPhone,
    isSmallPhone,
    isPhone,
    isMobile,
    isLandscapePhone
  };
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const updateDeviceInfo = () => {
      const info = getDeviceInfo();
      setDeviceInfo(info);

      // Sync attributes to document element for global CSS / container awareness
      const root = document.documentElement;
      root.setAttribute('data-device-class', info.deviceClass);
      root.setAttribute('data-orientation', info.orientation);
      root.setAttribute('data-touch', String(info.touchSupported));
      root.setAttribute('data-pointer', info.pointer);
      root.setAttribute('data-platform', info.isIOS ? 'ios' : info.isAndroid ? 'android' : 'desktop');
      root.style.setProperty('--vh', `${info.height * 0.01}px`);
      root.style.setProperty('--vw', `${info.width * 0.01}px`);
      root.style.setProperty('--device-dpr', `${info.dpr}`);
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo, { passive: true });
    window.addEventListener('orientationchange', updateDeviceInfo, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}


