import { motion } from "framer-motion";

interface WellBotAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  mood?: "neutral" | "thinking" | "happy" | "greeting";
  className?: string;
}

const sizeClasses = {
  xs: { container: "w-6 h-6", eyeGap: "gap-1", eye: "w-1 h-1.5", pupil: "w-0.5 h-0.5", antenna: "h-1", smile: "w-2" },
  sm: { container: "w-10 h-10", eyeGap: "gap-1.5", eye: "w-2 h-2.5", pupil: "w-1 h-1", antenna: "h-2", smile: "w-3" },
  md: { container: "w-14 h-14", eyeGap: "gap-2", eye: "w-2.5 h-3", pupil: "w-1.5 h-1.5", antenna: "h-2.5", smile: "w-4" },
  lg: { container: "w-20 h-20", eyeGap: "gap-3", eye: "w-4 h-5", pupil: "w-2 h-2", antenna: "h-3", smile: "w-6" },
  xl: { container: "w-24 h-24", eyeGap: "gap-4", eye: "w-5 h-6", pupil: "w-2.5 h-2.5", antenna: "h-4", smile: "w-7" }
};

export const WellBotAvatar = ({ size = "md", mood = "neutral", className = "" }: WellBotAvatarProps) => {
  const sizeConfig = sizeClasses[size];

  // Floating levitation animation
  const floatingVariants = {
    float: {
      y: [0, -4, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Eye blink animation for greeting
  const eyeVariants = {
    neutral: {
      scaleY: 1,
      opacity: 1,
      transition: { duration: 0.2 }
    },
    greeting: {
      scaleY: [1, 0.1, 1, 0.1, 1],
      transition: { duration: 0.8, times: [0, 0.2, 0.4, 0.6, 1] }
    },
    thinking: {
      scaleY: 1,
      opacity: 1
    },
    happy: {
      scaleY: 0.7,
      transition: { duration: 0.2 }
    }
  };

  // Thinking pulsing dots
  const thinkingPulseVariants = {
    thinking: {
      scale: [1, 1.3, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // Thinking halo glow - now using white/silver for glassmorphism
  const haloVariants = {
    neutral: { opacity: 0, scale: 1 },
    greeting: { opacity: 0, scale: 1 },
    happy: { opacity: 0.4, scale: 1.1, transition: { duration: 0.3 } },
    thinking: {
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.15, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={floatingVariants}
      animate="float"
    >
      {/* Thinking halo glow effect - Glassmorphism white/silver */}
      <motion.div
        className={`absolute inset-0 ${sizeConfig.container} rounded-full bg-gradient-to-br from-white/80 to-gray-300/60`}
        variants={haloVariants}
        animate={mood}
        style={{ filter: "blur(12px)" }}
      />
      
      {/* Robot body - Sleek Black/Dark Gray with Glassmorphism */}
      <motion.div
        className={`${sizeConfig.container} rounded-full bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#0f0f0f] shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col items-center justify-center relative overflow-hidden`}
      >
        {/* Glass reflection overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent" />
        
        {/* Subtle silver rim - glassmorphism glow */}
        <div className="absolute inset-0 rounded-full border border-white/10" />
        
        {/* Face plate - subtle lighter area */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/5 to-transparent" />
        
        {/* Antenna - silver/white glow */}
        <motion.div
          className={`absolute -top-1 left-1/2 -translate-x-1/2 ${sizeConfig.antenna} w-1 bg-gradient-to-t from-gray-500 to-gray-300 rounded-full`}
          animate={{ 
            boxShadow: mood === 'thinking' 
              ? ['0 0 4px rgba(255,255,255,0.6)', '0 0 8px rgba(255,255,255,0.8)', '0 0 4px rgba(255,255,255,0.6)']
              : '0 0 0px transparent'
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <motion.div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-200"
            animate={mood === 'thinking' ? {
              scale: [1, 1.3, 1],
              boxShadow: ['0 0 4px rgba(255,255,255,0.6)', '0 0 10px rgba(255,255,255,0.9)', '0 0 4px rgba(255,255,255,0.6)']
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Eyes container */}
        <div className={`flex ${sizeConfig.eyeGap} relative z-10 mt-1`}>
          {mood === 'thinking' ? (
            // Thinking state - pulsing dots with silver glow
            <>
              <motion.div 
                className={`${sizeConfig.eye} bg-gray-300 rounded-full`}
                variants={thinkingPulseVariants}
                animate="thinking"
              />
              <motion.div 
                className={`${sizeConfig.eye} bg-gray-300 rounded-full`}
                variants={thinkingPulseVariants}
                animate="thinking"
                style={{ animationDelay: '0.5s' }}
              />
            </>
          ) : (
            // Normal eyes - white with dark pupils
            <>
              {/* Left Eye */}
              <motion.div 
                className={`${sizeConfig.eye} bg-white rounded-full flex items-center justify-center relative shadow-inner`}
                variants={eyeVariants}
                animate={mood}
              >
                {/* Pupil - centered for forward look */}
                <motion.div 
                  className={`${sizeConfig.pupil} bg-[#1a1a1a] rounded-full`}
                  animate={mood === 'happy' ? { y: -1 } : { y: 0 }}
                />
                {/* Eye highlight - upper left for natural lighting */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90" />
              </motion.div>
              
              {/* Right Eye */}
              <motion.div 
                className={`${sizeConfig.eye} bg-white rounded-full flex items-center justify-center relative shadow-inner`}
                variants={eyeVariants}
                animate={mood}
              >
                {/* Pupil - centered for forward look */}
                <motion.div 
                  className={`${sizeConfig.pupil} bg-[#1a1a1a] rounded-full`}
                  animate={mood === 'happy' ? { y: -1 } : { y: 0 }}
                />
                {/* Eye highlight - upper left for natural lighting */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90" />
              </motion.div>
            </>
          )}
        </div>
        
        {/* Smile - subtle arc in white/silver */}
        <motion.div
          className={`${sizeConfig.smile} mt-1 relative z-10`}
          animate={mood === 'happy' ? { scaleX: 1.2 } : { scaleX: 1 }}
        >
          <svg viewBox="0 0 24 8" className="w-full h-auto">
            <motion.path
              d="M4 2 Q12 8 20 2"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </svg>
        </motion.div>
        
        {/* Bottom shadow for depth */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-t from-black/30 to-transparent rounded-b-full" />
      </motion.div>
    </motion.div>
  );
};

export default WellBotAvatar;
