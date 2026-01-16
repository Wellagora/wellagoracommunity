import { BadgeCheck, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerifiedExpertBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const VerifiedExpertBadge = ({ 
  size = 'md', 
  showLabel = false,
  className = ''
}: VerifiedExpertBadgeProps) => {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const labelText = language === 'hu' 
    ? 'Hitelesített Szakértő' 
    : language === 'de' 
    ? 'Verifizierter Experte' 
    : 'Verified Expert';

  const tooltipText = language === 'hu'
    ? 'Ez a Szakértő hitelesített, ellenőrzött háttérrel rendelkezik.'
    : language === 'de'
    ? 'Dieser Experte ist verifiziert und hat einen überprüften Hintergrund.'
    : 'This Expert is verified and has a checked background.';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 ${className}`}>
            <div className="relative">
              <BadgeCheck className={`${sizeClasses[size]} text-emerald-500 fill-emerald-500/20`} />
            </div>
            {showLabel && (
              <span className="text-xs font-medium text-emerald-600">{labelText}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedExpertBadge;
