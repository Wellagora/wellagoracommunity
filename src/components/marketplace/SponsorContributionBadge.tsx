import { Gift, Sparkles, Users, Trophy, Heart, Video, Monitor, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

// Content types with distinct quota logic
export type ContentType = 'recorded' | 'online_live' | 'in_person';

interface SponsorContributionBadgeProps {
  sponsorName: string;
  contributionAmount: number;
  originalPrice: number;
  size?: 'sm' | 'md' | 'lg';
  // Quota management
  maxSeats?: number;
  usedSeats?: number;
  showImpactMode?: boolean;
  // NEW: Content type for distinct labels
  contentType?: ContentType;
  maxCapacity?: number; // Physical capacity for in_person
}

// Get content type icon
const getContentTypeIcon = (type: ContentType) => {
  switch (type) {
    case 'recorded': return Video;
    case 'online_live': return Monitor;
    case 'in_person': return MapPin;
    default: return Gift;
  }
};

// Get content type label
const getContentTypeLabel = (type: ContentType, language: string) => {
  const labels = {
    recorded: { hu: 'FELVETT', en: 'RECORDED', de: 'AUFGEZEICHNET' },
    online_live: { hu: 'ONLINE ÉLŐ', en: 'ONLINE LIVE', de: 'ONLINE LIVE' },
    in_person: { hu: 'SZEMÉLYES', en: 'IN-PERSON', de: 'VOR ORT' }
  };
  return labels[type]?.[language as keyof typeof labels.recorded] || labels[type]?.hu || type.toUpperCase();
};

export const SponsorContributionBadge = ({
  sponsorName,
  contributionAmount,
  originalPrice,
  size = 'md',
  maxSeats = 10,
  usedSeats = 0,
  showImpactMode = false,
  contentType = 'in_person',
  maxCapacity
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
  const remainingSeats = Math.max(0, maxSeats - usedSeats);
  const seatsExhausted = remainingSeats === 0;
  const seatProgress = maxSeats > 0 ? (usedSeats / maxSeats) * 100 : 0;

  // Content-type specific quota labels
  const getQuotaLabel = () => {
    switch (contentType) {
      case 'recorded':
        // Unlimited access, limited discount
        if (language === 'hu') return `${remainingSeats} kedvezményes lehetőség maradt`;
        if (language === 'de') return `${remainingSeats} ermäßigte Möglichkeiten übrig`;
        return `${remainingSeats} discounted spots left`;
      case 'online_live':
        // High capacity, limited sponsored
        if (language === 'hu') return `${remainingSeats} támogatott hely maradt`;
        if (language === 'de') return `${remainingSeats} geförderte Plätze übrig`;
        return `${remainingSeats} sponsored spots left`;
      case 'in_person':
        // Physical + sponsored limits
        if (language === 'hu') return `${remainingSeats} szabad hely maradt`;
        if (language === 'de') return `${remainingSeats} freie Plätze übrig`;
        return `${remainingSeats} spots left`;
      default:
        if (language === 'hu') return `${remainingSeats} hely maradt`;
        return `${remainingSeats} spots left`;
    }
  };

  const getSponsorText = () => {
    if (language === 'hu') {
      return `A ${sponsorName} ${formatPrice(contributionAmount)}-tal támogatja a részvételedet!`;
    }
    if (language === 'de') {
      return `${sponsorName} unterstützt deine Teilnahme mit ${formatPrice(contributionAmount)}!`;
    }
    return `${sponsorName} is supporting your participation with ${formatPrice(contributionAmount)}!`;
  };

  const getImpactText = () => {
    if (language === 'hu') {
      return `A ${sponsorName} ${usedSeats} ember részvételét támogatta ennél a programnál.`;
    }
    if (language === 'de') {
      return `${sponsorName} hat die Teilnahme von ${usedSeats} Personen unterstützt.`;
    }
    return `${sponsorName} has supported ${usedSeats} people's participation.`;
  };

  const getSeatStatusText = () => {
    if (language === 'hu') {
      return `${usedSeats}/${maxSeats} támogatott hely foglalt`;
    }
    if (language === 'de') {
      return `${usedSeats}/${maxSeats} Plätze vergeben`;
    }
    return `${usedSeats}/${maxSeats} seats claimed`;
  };

  const sizeClasses = {
    sm: { container: 'p-2.5', icon: 'w-4 h-4', text: 'text-xs', price: 'text-sm' },
    md: { container: 'p-3', icon: 'w-5 h-5', text: 'text-sm', price: 'text-base' },
    lg: { container: 'p-4', icon: 'w-6 h-6', text: 'text-base', price: 'text-lg' }
  };

  const classes = sizeClasses[size];
  const TypeIcon = getContentTypeIcon(contentType);

  // IMPACT MODE: When seats are exhausted, show community impact badge
  if (showImpactMode && seatsExhausted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${classes.container} rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/15 to-emerald-500/10 border border-emerald-500/30`}
      >
        <div className="flex items-start gap-3">
          {/* Icon with glow */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md" />
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Trophy className={`${classes.icon} text-white`} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                {language === 'hu' ? 'KÖZÖSSÉGI HATÁS' : language === 'de' ? 'GEMEINSCHAFTSWIRKUNG' : 'COMMUNITY IMPACT'}
              </span>
            </div>
            
            <p className={`${classes.text} text-foreground/80 leading-snug`}>
              {getImpactText()}
            </p>

            {/* Progress bar showing all seats used */}
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-emerald-700 font-medium">{getSeatStatusText()}</span>
              </div>
              <Progress value={100} className="h-1.5 mt-1 bg-emerald-100" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ACTIVE SPONSORSHIP MODE: Show contribution and price
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
          {/* Content type + Sponsored badge */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="flex items-center gap-1">
              <TypeIcon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                {getContentTypeLabel(contentType, language)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {language === 'hu' ? 'SZPONZORÁLT' : language === 'de' ? 'GESPONSERT' : 'SPONSORED'}
              </span>
            </div>
          </div>
          
          {/* Sponsor support text */}
          <p className={`${classes.text} text-foreground/80 leading-snug`}>
            {getSponsorText()}
          </p>

          {/* Price breakdown - STRIKETHROUGH ORIGINAL + BOLD SPONSORED */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
            <span className={`${classes.price} font-bold text-primary`}>
              {memberPayment === 0 ? (language === 'hu' ? '0 Ft' : '0 €') : formatPrice(memberPayment)}
            </span>
          </div>

          {/* Quota status with content-type specific label */}
          {maxSeats > 0 && remainingSeats > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                {remainingSeats <= 3 ? (
                  <Clock className="w-3 h-3 text-red-500" />
                ) : (
                  <Users className="w-3 h-3 text-primary/70" />
                )}
                <span className={`text-xs font-medium ${remainingSeats <= 3 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {getQuotaLabel()}
                </span>
              </div>
              <Progress 
                value={seatProgress} 
                className={`h-1.5 mt-1 ${remainingSeats <= 3 ? '[&>div]:bg-red-500' : ''}`} 
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SponsorContributionBadge;
