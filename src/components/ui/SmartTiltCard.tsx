import { ReactNode, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useGyroscope } from '@/hooks/useGyroscope';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import { useIsMobile } from '@/hooks/use-mobile';

interface SmartTiltCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
}

// Desktop: Mouse-driven 3D tilt
const MouseTiltCard = ({ children, className = "", tiltStrength = 8 }: SmartTiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });
  const scale = useSpring(1, { stiffness: 200, damping: 20 });
  
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
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Mobile: Gyroscope-driven 3D tilt with press effect
const GyroscopeTiltCard = ({ children, className = "" }: SmartTiltCardProps) => {
  const { tiltX, tiltY, isSupported } = useGyroscope();
  
  if (!isSupported) {
    // Fallback: just press effect without tilt
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
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
export const SmartTiltCard = ({ children, className = "", tiltStrength = 8 }: SmartTiltCardProps) => {
  const isMobile = useIsMobile();
  const mode = useInteractionMode();
  
  // Use mobile version for touch devices
  if (isMobile || mode === 'touch') {
    return <GyroscopeTiltCard className={className}>{children}</GyroscopeTiltCard>;
  }
  
  // Desktop version with mouse tilt
  return <MouseTiltCard className={className} tiltStrength={tiltStrength}>{children}</MouseTiltCard>;
};

export default SmartTiltCard;
