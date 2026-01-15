import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, MotionValue } from "framer-motion";
import { useGyroscope } from "@/hooks/useGyroscope";

interface LiquidMeshGradientProps {
  className?: string;
  /** Opacity intensity: 'vibrant' (0.8) for landing, 'muted' (0.25) for internal pages */
  intensity?: 'vibrant' | 'muted';
}

const LiquidMeshGradient = ({ className = "", intensity = 'vibrant' }: LiquidMeshGradientProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Opacity based on intensity
  const opacityMultiplier = intensity === 'vibrant' ? 1 : 0.35;
  
  // Mouse tracking for desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring values for cursor tracking
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  
  // Gyroscope for mobile
  const { tiltX, tiltY, isSupported: gyroSupported } = useGyroscope();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Desktop mouse tracking - global window listener for full coverage
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to center of viewport
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Normalize to -1 to 1 range
      const normalizedX = (e.clientX - centerX) / centerX;
      const normalizedY = (e.clientY - centerY) / centerY;
      
      mouseX.set(normalizedX * 60); // Max 60px movement
      mouseY.set(normalizedY * 60);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  // Choose the appropriate motion values based on device
  const getOffsetX = (): MotionValue<number> => {
    if (isMobile && gyroSupported) {
      return tiltY;
    }
    return smoothMouseX;
  };

  const getOffsetY = (): MotionValue<number> => {
    if (isMobile && gyroSupported) {
      return tiltX;
    }
    return smoothMouseY;
  };

  // Blob configurations with different animation timings
  const blobs = [
    {
      id: 1,
      baseOpacity: 0.4,
      color: `rgba(203, 213, 225, ${0.4 * opacityMultiplier})`, // Light Slate
      size: "100%",
      initialX: "-5%",
      initialY: "-5%",
      duration: 25,
    },
    {
      id: 2,
      baseOpacity: 0.3,
      color: `rgba(226, 232, 240, ${0.3 * opacityMultiplier})`, // Cool Gray
      size: "90%",
      initialX: "40%",
      initialY: "45%",
      duration: 30,
    },
    {
      id: 3,
      baseOpacity: 0.5,
      color: `rgba(241, 245, 249, ${0.5 * opacityMultiplier})`, // Ghost White
      size: "85%",
      initialX: "55%",
      initialY: "5%",
      duration: 22,
    },
    {
      id: 4,
      baseOpacity: 0.05,
      color: `rgba(15, 118, 110, ${0.05 * opacityMultiplier})`, // Ultra-subtle Teal
      size: "80%",
      initialX: "15%",
      initialY: "65%",
      duration: 28,
    },
  ];

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ filter: "blur(50px)", zIndex: 0 }}
    >
        {blobs.map((blob) => (
          <motion.div
            key={blob.id}
            className="absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle at 30% 30%, ${blob.color}, transparent 70%)`,
              left: blob.initialX,
              top: blob.initialY,
              x: getOffsetX(),
              y: getOffsetY(),
            }}
            animate={{
              x: [0, 60, -40, 30, 0],
              y: [0, -50, 40, -30, 0],
              scale: [1, 1.15, 0.9, 1.1, 1],
              rotate: [0, 60, -45, 80, 0],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          />
        ))}
      
      {/* Additional ambient glow layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(248, 250, 252, ${0.5 * opacityMultiplier}) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default LiquidMeshGradient;
