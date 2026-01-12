import { motion } from "framer-motion";

interface WellBotAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: "neutral" | "thinking" | "happy" | "greeting";
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-24 h-24"
};

const eyeSizes = {
  sm: { eye: "w-2 h-2.5", pupil: "w-1 h-1", gap: "gap-2" },
  md: { eye: "w-2.5 h-3", pupil: "w-1.5 h-1.5", gap: "gap-2.5" },
  lg: { eye: "w-3.5 h-4", pupil: "w-2 h-2", gap: "gap-3.5" },
  xl: { eye: "w-4 h-5", pupil: "w-2.5 h-2.5", gap: "gap-4" }
};

const smileSizes = {
  sm: "w-3 h-1.5",
  md: "w-4 h-2",
  lg: "w-6 h-3",
  xl: "w-7 h-3.5"
};

export const WellBotAvatar = ({ size = "md", mood = "neutral", className = "" }: WellBotAvatarProps) => {
  const sizeClass = sizeClasses[size];
  const eyeSize = eyeSizes[size];
  const smileSize = smileSizes[size];

  // Greeting animation - wink effect
  const greetingVariants = {
    initial: { rotateZ: 0 },
    greeting: {
      rotateZ: [0, -5, 5, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  // Eye animations based on mood
  const eyeVariants = {
    neutral: {
      scaleY: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    thinking: {
      y: [-1, -2, -1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    happy: {
      scaleY: [1, 0.7, 1],
      transition: { duration: 0.5 }
    },
    greeting: {
      scaleY: [1, 0.1, 1],
      transition: { duration: 0.3, delay: 0.2 }
    }
  };

  // Pupil follows "thinking" movement
  const pupilVariants = {
    neutral: { x: 0, y: 0 },
    thinking: {
      y: [-1, -2, -1],
      x: [0, 1, -1, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    happy: { x: 0, y: 0 },
    greeting: { x: 0, y: 0 }
  };

  // Happy glow effect
  const glowVariants = {
    neutral: { opacity: 0, scale: 1 },
    thinking: { opacity: 0, scale: 1 },
    happy: { 
      opacity: [0, 0.4, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.8, ease: "easeOut" }
    },
    greeting: { opacity: 0, scale: 1 }
  };

  // Smile animation
  const smileVariants = {
    neutral: { scaleX: 1, scaleY: 1 },
    thinking: { scaleX: 0.9, scaleY: 0.8 },
    happy: { 
      scaleX: [1, 1.15, 1],
      scaleY: [1, 1.2, 1],
      transition: { duration: 0.4 }
    },
    greeting: { scaleX: 1.1, scaleY: 1 }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={greetingVariants}
      initial="initial"
      animate={mood === "greeting" ? "greeting" : "initial"}
    >
      {/* Glow effect for happy mood */}
      <motion.div
        className={`absolute inset-0 ${sizeClass} rounded-full bg-gradient-to-br from-amber-300 to-sky-300`}
        variants={glowVariants}
        animate={mood}
        style={{ filter: "blur(8px)" }}
      />
      
      {/* Main avatar container - Warm Amber to Sky Blue gradient */}
      <motion.div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-amber-400 via-amber-300 to-sky-400 shadow-[0_8px_30px_rgb(251,191,36,0.35)] flex flex-col items-center justify-center relative overflow-hidden`}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
        
        {/* Eyes container */}
        <div className={`flex ${eyeSize.gap} mb-1 relative z-10`}>
          {/* Left Eye */}
          <motion.div 
            className={`${eyeSize.eye} bg-slate-800 rounded-full flex items-center justify-center relative`}
            variants={eyeVariants}
            animate={mood}
          >
            {/* Eye highlight */}
            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
            {/* Pupil */}
            <motion.div 
              className={`${eyeSize.pupil} bg-slate-900 rounded-full absolute`}
              variants={pupilVariants}
              animate={mood}
            />
          </motion.div>
          
          {/* Right Eye */}
          <motion.div 
            className={`${eyeSize.eye} bg-slate-800 rounded-full flex items-center justify-center relative`}
            variants={eyeVariants}
            animate={mood}
          >
            {/* Eye highlight */}
            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
            {/* Pupil */}
            <motion.div 
              className={`${eyeSize.pupil} bg-slate-900 rounded-full absolute`}
              variants={pupilVariants}
              animate={mood}
            />
          </motion.div>
        </div>
        
        {/* Smile */}
        <motion.div
          className={`${smileSize} relative z-10`}
          variants={smileVariants}
          animate={mood}
        >
          <svg viewBox="0 0 24 12" className="w-full h-full">
            <path
              d="M2 2 Q12 12 22 2"
              fill="none"
              stroke="#1e293b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
        
        {/* Rosy cheeks for happy mood */}
        {mood === "happy" && (
          <>
            <motion.div
              className="absolute left-1 top-1/2 w-2 h-1.5 bg-rose-300/50 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute right-1 top-1/2 w-2 h-1.5 bg-rose-300/50 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.3 }}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WellBotAvatar;
