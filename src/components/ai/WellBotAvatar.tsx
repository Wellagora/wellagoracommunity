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
    <div className={`relative group ${className}`}>
      {/* Main avatar image with Pearl Silver glow */}
      <img 
        src="/images/wellbot-avatar.png" 
        alt="WellBot"
        className={`${sizeClasses[size]} object-contain`}
        style={{
          filter: 'drop-shadow(0 0 8px rgba(229, 231, 235, 0.8))',
        }}
      />
      
      {/* Ambient glow on hover */}
      <div className="absolute inset-0 bg-slate-200/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      {/* Subtle border effect */}
      <div className="absolute inset-0 rounded-full border border-black/10" />
    </div>
  );
};

export default WellBotAvatar;
