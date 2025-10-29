import { useState, useEffect, useRef, useCallback } from 'react';

const useColumnAnimation = (speed, direction, isPaused = false, height = null) => {
  const [translateY, setTranslateY] = useState(0);
  const animationRef = useRef();
  const lastTimeRef = useRef();
  const velocityRef = useRef(speed);

  // Memory cleanup: clear animation on unmount and speed changes
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const animate = useCallback((currentTime) => {
    if (!isPaused) {
      if (lastTimeRef.current !== undefined) {
        const deltaTime = currentTime - lastTimeRef.current;
        // Limit delta time to prevent large jumps after tab switches or performance issues
        const clampedDelta = Math.min(deltaTime, 32); // Max 32ms (roughly 30fps)
        const movement = (direction === 'up' ? -velocityRef.current : velocityRef.current) * (clampedDelta / 16.67); // Normalize to 60fps
        
        setTranslateY(prev => {
          let newValue = prev + movement;
          
          // Teleportation logic: reset position when threshold is reached
          if (height !== null && height > 0) {
            if (direction === 'up') {
              // For up-scrolling: teleport when offset reaches negative full height
              // When scrolling up, content moves up (negative translateY)
              // Teleport back when we've scrolled one full cycle
              while (newValue <= -height) {
                newValue = newValue + height;
              }
            } else {
              // For down-scrolling: teleport when we've scrolled one full cycle
              // When scrolling down, content starts at 0 and moves positive (translateY increases)
              // When translateY >= cycleHeight, we've passed one full cycle, teleport back
              while (newValue >= height) {
                newValue = newValue - height;
              }
            }
          }
          
          return newValue;
        });
      }
      lastTimeRef.current = currentTime;
    } else {
      lastTimeRef.current = undefined;
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [direction, isPaused, height]);

  useEffect(() => {
    velocityRef.current = speed;
  }, [speed]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return translateY;
};

export default useColumnAnimation;