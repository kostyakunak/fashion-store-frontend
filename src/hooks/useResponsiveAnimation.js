import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

const ANIMATION_CONFIGS = {
  mobile: {
    column1: { speed: 0.3, direction: 'up' },
    column2: { speed: 0.3, direction: 'up' },
    column3: { speed: 0.3, direction: 'up' },
  },
  tablet: {
    column1: { speed: 0.7, direction: 'up' },
    column2: { speed: 1.0, direction: 'down' },
    column3: { speed: 0.6, direction: 'up' },
  },
  desktop: {
    column1: { speed: 0.5, direction: 'up' },
    column2: { speed: 1.2, direction: 'down' },
    column3: { speed: 0.8, direction: 'up' },
  },
};

const useResponsiveAnimation = () => {
  const [deviceType, setDeviceType] = useState('desktop');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowSize({ width, height: window.innerHeight });

      if (width < BREAKPOINTS.mobile) {
        setDeviceType('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getAnimationConfig = (columnNumber) => {
    const config = ANIMATION_CONFIGS[deviceType];
    const columnKey = `column${columnNumber}`;
    return config[columnKey] || config.column1;
  };

  return {
    deviceType,
    windowSize,
    getAnimationConfig,
    breakpoints: BREAKPOINTS,
  };
};

export default useResponsiveAnimation;