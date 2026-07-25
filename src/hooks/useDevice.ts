import { useState, useEffect } from 'react';

export type ScreenTier = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Orientation = 'portrait' | 'landscape';

export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isAndroid = /android/i.test(ua);
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    
    let screenTier: ScreenTier = 'lg';
    if (width < 380) screenTier = 'xs';
    else if (width < 640) screenTier = 'sm';
    else if (width < 1024) screenTier = 'md';
    else if (width < 1280) screenTier = 'lg';
    else screenTier = 'xl';

    return {
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      isAndroid,
      width,
      height,
      screenTier,
      orientation: (width > height ? 'landscape' : 'portrait') as Orientation,
      touchSupported: typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    };
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = /android/i.test(ua);
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;

      let screenTier: ScreenTier = 'lg';
      if (width < 380) screenTier = 'xs';
      else if (width < 640) screenTier = 'sm';
      else if (width < 1024) screenTier = 'md';
      else if (width < 1280) screenTier = 'lg';
      else screenTier = 'xl';

      // Set CSS custom property for exact mobile viewport height
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        isAndroid,
        width,
        height,
        screenTier,
        orientation: width > height ? 'landscape' : 'portrait',
        touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

