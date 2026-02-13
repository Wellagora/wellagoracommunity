import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WellPointsToastProps {
  points: number;
  onComplete?: () => void;
}

export const WellPointsToast = ({ points, onComplete }: WellPointsToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-gradient-to-r from-primary to-amber-500 text-white rounded-lg px-6 py-3 shadow-lg flex items-center gap-2 font-semibold">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <span>+{points} WellPoints!</span>
      </div>
    </motion.div>
  );
};
