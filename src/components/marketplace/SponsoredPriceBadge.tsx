import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Gift } from 'lucide-react';

interface SponsoredPriceBadgeProps {
  originalPrice: number;
  sponsoredPrice?: number;
  sponsorName?: string;
  isSponsored: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SponsoredPriceBadge = ({
  originalPrice,
  sponsoredPrice = 0,
  sponsorName,
  isSponsored,
  size = 'md'
}: SponsoredPriceBadgeProps) => {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: { price: 'text-lg', original: 'text-xs', badge: 'text-xs px-2 py-0.5' },
    md: { price: 'text-2xl', original: 'text-sm', badge: 'text-xs px-2.5 py-1' },
    lg: { price: 'text-3xl', original: 'text-base', badge: 'text-sm px-3 py-1' }
  };

  const classes = sizeClasses[size];

  if (!isSponsored) {
    return (
      <div className="flex items-baseline gap-1">
        <span className={`font-bold text-black ${classes.price}`}>
          {originalPrice > 0 ? `${originalPrice.toLocaleString()} Ft` : (language === 'hu' ? 'Ingyenes' : 'Free')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Price Display */}
      <div className="flex items-baseline gap-2">
        {/* Strikethrough Original Price */}
        <span className={`text-black/40 line-through ${classes.original}`}>
          {originalPrice.toLocaleString()} Ft
        </span>
        {/* New Sponsored Price */}
        <span className={`font-bold text-emerald-600 ${classes.price}`}>
          {sponsoredPrice > 0 ? `${sponsoredPrice.toLocaleString()} Ft` : '0 Ft'}
        </span>
      </div>

      {/* Sponsor Badge */}
      {sponsorName && (
        <Badge 
          variant="outline" 
          className={`border-emerald-200 bg-emerald-50 text-emerald-700 ${classes.badge}`}
        >
          <Heart className="w-3 h-3 mr-1 text-rose-500 fill-rose-500" />
          {language === 'hu' ? 'Támogató' : 'Supported by'}: {sponsorName}
        </Badge>
      )}

      {/* Savings Highlight */}
      {originalPrice > sponsoredPrice && (
        <Badge 
          className={`bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200 ${classes.badge}`}
        >
          <Gift className="w-3 h-3 mr-1" />
          {language === 'hu' 
            ? `${(originalPrice - sponsoredPrice).toLocaleString()} Ft megtakarítás!`
            : `Save ${(originalPrice - sponsoredPrice).toLocaleString()} Ft!`}
        </Badge>
      )}
    </div>
  );
};

export default SponsoredPriceBadge;
