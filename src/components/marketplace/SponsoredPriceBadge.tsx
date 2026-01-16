import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Gift, Wallet, CreditCard } from 'lucide-react';

interface SponsoredPriceBadgeProps {
  originalPrice: number;
  sponsoredPrice?: number;
  sponsorName?: string;
  sponsorContribution?: number;
  isSponsored: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

/**
 * SponsoredPriceBadge - WellAgora Business Engine Pricing Display
 * 
 * Shows the expert-driven pricing with sponsor contribution:
 * - Original price (Expert Price) = what the Expert sets
 * - Sponsor contribution = fixed HUF amount sponsor pays
 * - Member payment = Original - Sponsor Contribution
 * 
 * The 80/20 split is based on the FULL expert price, not just member payment.
 */
const SponsoredPriceBadge = ({
  originalPrice,
  sponsoredPrice,
  sponsorName,
  sponsorContribution = 0,
  isSponsored,
  size = 'md',
  showBreakdown = false
}: SponsoredPriceBadgeProps) => {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: { price: 'text-lg', original: 'text-xs', badge: 'text-xs px-2 py-0.5' },
    md: { price: 'text-2xl', original: 'text-sm', badge: 'text-xs px-2.5 py-1' },
    lg: { price: 'text-3xl', original: 'text-base', badge: 'text-sm px-3 py-1' }
  };

  const classes = sizeClasses[size];

  // Calculate member payment using the new business logic
  // If sponsoredPrice is provided (legacy), use it; otherwise calculate from contribution
  const memberPayment = sponsoredPrice !== undefined 
    ? sponsoredPrice 
    : Math.max(0, originalPrice - sponsorContribution);
  
  const actualSponsorContribution = sponsoredPrice !== undefined
    ? (originalPrice - sponsoredPrice)
    : sponsorContribution;

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  if (!isSponsored) {
    return (
      <div className="flex items-baseline gap-1">
        <span className={`font-bold text-black ${classes.price}`}>
          {originalPrice > 0 ? formatPrice(originalPrice) : (language === 'hu' ? 'Ingyenes' : 'Free')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Price Display - Shows Member Payment prominently */}
      <div className="flex items-baseline gap-2 flex-wrap">
        {/* Original Expert Price (crossed out) */}
        <span className={`text-black/40 line-through ${classes.original}`}>
          {formatPrice(originalPrice)}
        </span>
        {/* Member Payment - What they actually pay */}
        <span className={`font-bold text-emerald-600 ${classes.price}`}>
          {memberPayment > 0 ? formatPrice(memberPayment) : '0 Ft'}
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
      {actualSponsorContribution > 0 && (
        <Badge 
          className={`bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200 ${classes.badge}`}
        >
          <Gift className="w-3 h-3 mr-1" />
          {language === 'hu' 
            ? `${formatPrice(actualSponsorContribution)} támogatás!`
            : `${formatPrice(actualSponsorContribution)} sponsored!`}
        </Badge>
      )}

      {/* Payment Breakdown (optional detailed view) */}
      {showBreakdown && isSponsored && (
        <div className="mt-3 p-3 rounded-lg bg-black/[0.02] border border-black/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-black/60 flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              {language === 'hu' ? 'Szakértő ára' : 'Expert price'}
            </span>
            <span className="font-medium text-black">{formatPrice(originalPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-black/60 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" />
              {language === 'hu' ? 'Támogatói hozzájárulás' : 'Sponsor contribution'}
            </span>
            <span className="font-medium text-emerald-600">-{formatPrice(actualSponsorContribution)}</span>
          </div>
          <div className="border-t border-black/10 pt-2 flex items-center justify-between text-xs">
            <span className="text-black/80 font-semibold flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {language === 'hu' ? 'Te fizeted' : 'You pay'}
            </span>
            <span className="font-bold text-emerald-600">{formatPrice(memberPayment)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsoredPriceBadge;
