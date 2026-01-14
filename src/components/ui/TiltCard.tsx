import { useRef, ReactNode } from 'react';
import { motion, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
}

export const TiltCard = ({ children, className = "", tiltStrength = 10 }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const rotateX = useSpring(0, { stiffness: 150, damping: 15 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 15 });
  const scale = useSpring(1, { stiffness: 150, damping: 15 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Invert Y for natural tilt feel
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
      whileTap={{ scale: 0.97 }}
      style={{
        rotateX,
        rotateY,
        scale,
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

export default TiltCard;
