import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { forwardRef, ReactNode } from 'react';

interface PressableButtonProps extends ButtonProps {
  children: ReactNode;
  pressScale?: number;
}

export const PressableButton = forwardRef<HTMLButtonElement, PressableButtonProps>(
  ({ children, className, pressScale = 0.95, ...props }, _ref) => {
    return (
      <motion.div
        whileTap={{ scale: pressScale }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="inline-block"
      >
        <Button className={className} {...props}>{children}</Button>
      </motion.div>
    );
  }
);

PressableButton.displayName = 'PressableButton';
