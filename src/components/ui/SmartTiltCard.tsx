import { ReactNode, useRef, useCallback, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useGyroscope } from '@/hooks/useGyroscope';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import { useIsMobile } from '@/hooks/use-mobile';

interface SmartTiltCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
  magneticStrength?: number;
  magneticRadius?: number;
}

// Desktop: Mouse-driven 3D tilt + Magnetic Pull
const MouseTiltCard = ({ 
  children, 
  className = "", 
  tiltStrength = 8,
  magneticStrength = 0.3,
  magneticRadius = 80 
}: SmartTiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Tilt values
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });
  const scale = useSpring(1, { stiffness: 200, damping: 20 });
  
  // Magnetic pull values
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);
  const springMagnetX = useSpring(magnetX, { stiffness: 150, damping: 15 });
  const springMagnetY = useSpring(magnetY, { stiffness: 150, damping: 15 });

  // Global magnetic pull - attracts even when cursor is near
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    if (distance < magneticRadius) {
      const pullStrength = (1 - distance / magneticRadius) * magneticStrength;
      magnetX.set(distanceX * pullStrength);
      magnetY.set(distanceY * pullStrength);
    } else {
      magnetX.set(0);
      magnetY.set(0);
    }
  }, [magneticRadius, magneticStrength, magnetX, magnetY]);

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
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    rotateX.set((-mouseY / rect.height) * tiltStrength);
    rotateY.set((mouseX / rect.width) * tiltStrength);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        x: springMagnetX,
        y: springMagnetY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Mobile: Gyroscope-driven 3D tilt with tactile press effect
const GyroscopeTiltCard = ({ children, className = "" }: SmartTiltCardProps) => {
  const { tiltX, tiltY, isSupported } = useGyroscope();
  
  if (!isSupported) {
    // Fallback: tactile squeeze effect without tilt
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      style={{
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Smart card that automatically chooses the right interaction
export const SmartTiltCard = ({ 
  children, 
  className = "", 
  tiltStrength = 8,
  magneticStrength = 0.3,
  magneticRadius = 80
}: SmartTiltCardProps) => {
  const isMobile = useIsMobile();
  const mode = useInteractionMode();
  
  // Use mobile version for touch devices
  if (isMobile || mode === 'touch') {
    return <GyroscopeTiltCard className={className}>{children}</GyroscopeTiltCard>;
  }
  
  // Desktop version with mouse tilt + magnetic pull
  return (
    <MouseTiltCard 
      className={className} 
      tiltStrength={tiltStrength}
      magneticStrength={magneticStrength}
      magneticRadius={magneticRadius}
    >
      {children}
    </MouseTiltCard>
  );
};

export default SmartTiltCard;
