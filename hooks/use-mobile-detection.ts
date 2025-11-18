"use client"

import { useState, useEffect } from 'react';

export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Client-side detection
    const checkIsMobile = () => {
      // Check user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Check screen width (reliable fallback)
      const screenWidth = window.innerWidth;
      
      const mobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const mobileScreen = screenWidth <= 768; // Tablet breakpoint
      
      return mobileUserAgent || mobileScreen;
    };

    setIsMobile(checkIsMobile());

    // Optional: Update on resize (user rotates device)
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};