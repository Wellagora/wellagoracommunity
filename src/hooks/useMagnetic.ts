import { useRef, useEffect, useCallback } from 'react';
import { useSpring, useMotionValue, MotionValue } from 'framer-motion';

interface MagneticConfig {
  strength?: number;
  radius?: number;
  springConfig?: { stiffness: number; damping: number };
}

interface MagneticReturn {
  ref: React.RefObject<HTMLDivElement>;
  style: { x: MotionValue<number>; y: MotionValue<number> };
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
}

export const useMagnetic = (config: MagneticConfig = {}): MagneticReturn => {
  const { 
    strength = 0.4, 
    radius = 80,
    springConfig = { stiffness: 150, damping: 15 }
  } = config;
  
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Global mouse tracking for magnetic pull even when cursor is near (not over) the element
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    // Magnetic pull when cursor is within radius
    if (distance < radius) {
      // Proportional pull - stronger when closer
      const pullStrength = (1 - distance / radius) * strength;
      x.set(distanceX * pullStrength);
      y.set(distanceY * pullStrength);
    } else {
      // Spring back when outside radius
      x.set(0);
      y.set(0);
    }
  }, [radius, strength, x, y]);

  // Only attach global listener on desktop (pointer device)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [handleGlobalMouseMove]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Direct pull when mouse is over element
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    style: { x: springX, y: springY },
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
};
