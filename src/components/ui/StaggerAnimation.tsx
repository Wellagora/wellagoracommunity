import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({ 
  children, 
  className = "",
  staggerDelay = 0.05  // Faster stagger for snappy feel
}: StaggerContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  enableTap?: boolean;  // Enable tactile press effect
}

export const StaggerItem = ({ 
  children, 
  className = "",
  enableTap = true 
}: StaggerItemProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 120,
            damping: 14,
          }
        },
      }}
      // Tactile squeeze on tap for mobile
      whileTap={enableTap ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated card wrapper with squeeze effect
interface TactileCardProps {
  children: ReactNode;
  className?: string;
}

export const TactileCard = ({ children, className = "" }: TactileCardProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
