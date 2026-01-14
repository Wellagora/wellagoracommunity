import { MessageCircle } from "lucide-react";

interface WellBotAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  mood?: "neutral" | "thinking" | "happy" | "greeting";
  className?: string;
  showPulse?: boolean;
}

const sizeClasses = {
  xs: { container: "w-6 h-6", icon: "w-3 h-3" },
  sm: { container: "w-8 h-8", icon: "w-4 h-4" },
  md: { container: "w-10 h-10", icon: "w-5 h-5" },
  lg: { container: "w-14 h-14", icon: "w-7 h-7" },
  xl: { container: "w-20 h-20", icon: "w-10 h-10" }
};

export const WellBotAvatar = ({ 
  size = "md", 
  mood = "neutral", 
  className = "",
  showPulse = false 
}: WellBotAvatarProps) => {
  const sizeConfig = sizeClasses[size];

  return (
    <div
      className={`relative ${className}`}
      style={{ 
        display: 'block', 
        visibility: 'visible',
      }}
    >
      {/* Main avatar body - Pure White with 2px solid Black border and shadow-lg */}
      <div
        className={`${sizeConfig.container} rounded-full flex items-center justify-center`}
        style={{
          background: '#FFFFFF',
          border: '2px solid #000000',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <MessageCircle 
          className={`${sizeConfig.icon} text-[#000000]`}
          strokeWidth={2}
        />
      </div>
    </div>
  );
};

export default WellBotAvatar;
