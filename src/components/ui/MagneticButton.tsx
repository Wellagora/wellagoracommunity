import { motion } from 'framer-motion';
import { useMagnetic } from '@/hooks/useMagnetic';
import { Button, ButtonProps } from '@/components/ui/button';
import { forwardRef, ReactNode } from 'react';

interface MagneticButtonProps extends ButtonProps {
  strength?: number;
  children: ReactNode;
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, strength = 0.3, className, ...props }, _ref) => {
    const { ref, style, handlers } = useMagnetic({ strength });
    
    return (
      <motion.div
        ref={ref}
        style={style}
        {...handlers}
        className="inline-block"
      >
        <Button className={className} {...props}>{children}</Button>
      </motion.div>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';
