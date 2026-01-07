import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GhostCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

/**
 * GhostCard - Organic Premium 3D placeholder for empty states
 * Displays a subtle, animated placeholder with 3D styling
 */
export const GhostCard = ({
  icon: Icon = Sparkles,
  title,
  description,
  className,
}: GhostCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        // Organic Premium 3D style
        "bg-white/60 backdrop-blur-md",
        "border border-white/40 border-dashed",
        "rounded-2xl",
        "shadow-[0_8px_30px_rgba(0,0,0,0.02)]",
        // Layout
        "p-8 flex flex-col items-center justify-center text-center",
        "min-h-[200px]",
        className
      )}
    >
      {/* 3D Icon Container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative mb-4"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
        
        {/* Icon container with 3D effect */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white to-slate-50 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center border border-white/60">
          <Icon className="w-10 h-10 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-foreground/70 mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground/60 max-w-xs"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
};

export default GhostCard;
