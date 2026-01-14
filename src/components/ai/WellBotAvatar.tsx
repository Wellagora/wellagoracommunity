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
  // mood prop accepted for backwards compatibility but not used with static image
}: WellBotAvatarProps) => {
  return (
    <img 
      src="/images/wellbot-avatar.png" 
      alt="WellBot"
      className={`${sizeClasses[size]} object-contain ${className}`}
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      }}
    />
  );
};

export default WellBotAvatar;
