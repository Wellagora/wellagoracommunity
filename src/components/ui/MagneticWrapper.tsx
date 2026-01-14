import { motion } from 'framer-motion';
import { useMagnetic } from '@/hooks/useMagnetic';
import { ReactNode } from 'react';

interface MagneticWrapperProps {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}

export const MagneticWrapper = ({ 
  children, 
  strength = 0.3, 
  radius = 50,
  className = ''
}: MagneticWrapperProps) => {
  const { ref, style, handlers } = useMagnetic({ strength, radius });
  
  return (
    <motion.div
      ref={ref}
      style={style}
      {...handlers}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default MagneticWrapper;
