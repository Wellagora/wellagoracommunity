import { ReactNode } from "react";
import { motion } from "framer-motion";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Unified card component for dashboard content
 * Consistent with landing page glassmorphism styling
 */
export function DashboardCard({ children, className = "", delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        delay 
      }}
      className={`bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default DashboardCard;
