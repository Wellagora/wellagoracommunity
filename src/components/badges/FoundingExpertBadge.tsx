import { Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FoundingExpertBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const FoundingExpertBadge = ({ size = "md", showLabel = true, className = "" }: FoundingExpertBadgeProps) => {
  const { language } = useLanguage();

  const label = language === 'hu' ? 'Founding Expert' : language === 'de' ? 'Gründungsexperte' : 'Founding Expert';

  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-0.5",
    md: "text-sm gap-1.5 px-3 py-1",
    lg: "text-base gap-2 px-4 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full
        bg-gradient-to-r from-amber-400 to-amber-500 text-white
        shadow-sm founding-expert-shimmer
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <Award className={iconSizes[size]} />
      {showLabel && <span>{label}</span>}
    </span>
  );
};

export default FoundingExpertBadge;
