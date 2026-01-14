interface WellBotAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  mood?: "neutral" | "thinking" | "happy" | "greeting";
  className?: string;
  showPulse?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20"
};

export const WellBotAvatar = ({ 
  size = "md", 
  className = "",
}: WellBotAvatarProps) => {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/images/wellbot-avatar.png" 
        alt="WellBot"
        className={`${sizeClasses[size]} object-contain filter drop-shadow-md`}
      />
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-white/20 rounded-full blur-md -z-10" />
    </div>
  );
};

export default WellBotAvatar;
