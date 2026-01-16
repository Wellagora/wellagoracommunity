import { Gift, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface SponsorContributionBadgeProps {
  sponsorName: string;
  contributionAmount: number;
  originalPrice: number;
  size?: 'sm' | 'md' | 'lg';
}

export const SponsorContributionBadge = ({
  sponsorName,
  contributionAmount,
  originalPrice,
  size = 'md'
}: SponsorContributionBadgeProps) => {
  const { language } = useLanguage();

  const formatPrice = (price: number): string => {
    if (language === 'hu') {
      return `${price.toLocaleString('hu-HU')} Ft`;
    }
    const euroPrice = Math.round(price / 400);
    return `${euroPrice} €`;
  };

  // Calculate what member pays
  const memberPayment = Math.max(0, originalPrice - contributionAmount);

  const getSponsorText = () => {
    if (language === 'hu') {
      return `A ${sponsorName} ${formatPrice(contributionAmount)}-tal támogatja a részvételedet!`;
    }
    if (language === 'de') {
      return `${sponsorName} unterstützt deine Teilnahme mit ${formatPrice(contributionAmount)}!`;
    }
    return `${sponsorName} is supporting your participation with ${formatPrice(contributionAmount)}!`;
  };

  const sizeClasses = {
    sm: { container: 'p-2.5', icon: 'w-4 h-4', text: 'text-xs', price: 'text-sm' },
    md: { container: 'p-3', icon: 'w-5 h-5', text: 'text-sm', price: 'text-base' },
    lg: { container: 'p-4', icon: 'w-6 h-6', text: 'text-base', price: 'text-lg' }
  };

  const classes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${classes.container} rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20`}
    >
      <div className="flex items-start gap-3">
        {/* Icon with glow */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Gift className={`${classes.icon} text-white`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {language === 'hu' ? 'SZPONZORÁLT' : language === 'de' ? 'GESPONSERT' : 'SPONSORED'}
            </span>
          </div>
          
          <p className={`${classes.text} text-foreground/80 leading-snug`}>
            {getSponsorText()}
          </p>

          {/* Price breakdown */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`${classes.price} font-bold text-primary`}>
              {memberPayment === 0 ? (language === 'hu' ? '0 Ft' : '0 €') : formatPrice(memberPayment)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SponsorContributionBadge;
