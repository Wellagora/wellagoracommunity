import { Gift, Sparkles, Users, Trophy, Heart, Video, Monitor, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

// Partner logo mapping for clickable sponsor logos
const PARTNER_LOGOS: Record<string, { logo: string; slug: string }> = {
  'Praktiker': { logo: '/partner-logos/praktiker.png', slug: 'praktiker' },
  'DM': { logo: '/partner-logos/dm.png', slug: 'dm' },
  'Rossmann': { logo: '/partner-logos/rossmann.png', slug: 'rossmann' },
  'OBI': { logo: '/partner-logos/obi.png', slug: 'obi' },
  'IKEA': { logo: '/partner-logos/ikea.png', slug: 'ikea' },
  'Auchan': { logo: '/partner-logos/auchan.png', slug: 'auchan' },
  'SPAR': { logo: '/partner-logos/spar.png', slug: 'spar' },
  'Müller': { logo: '/partner-logos/muller.png', slug: 'muller' },
};
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
      return `A ${sponsorName} ${usedSeats} Tag részvételét támogatta ennél a programnál.`;
    }
    if (language === 'de') {
      return `${sponsorName} hat die Teilnahme von ${usedSeats} Mitgliedern unterstützt.`;
    }
    return `${sponsorName} has supported ${usedSeats} Members' participation.`;
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

  // Get partner info for clickable logo
  const partnerInfo = PARTNER_LOGOS[sponsorName];

  // ACTIVE SPONSORSHIP MODE: Show contribution and price
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${classes.container} rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20`}
    >
      <div className="flex items-start gap-3">
        {/* Clickable Partner Logo - 48px for visibility */}
        <div className="relative flex-shrink-0">
          {partnerInfo ? (
            <Link 
              to={`/partners/${partnerInfo.slug}`}
              className="block w-12 h-12 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow border border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={partnerInfo.logo} 
                alt={sponsorName}
                className="w-full h-full object-contain p-1.5"
              />
            </Link>
          ) : (
            <>
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <Gift className={`${classes.icon} text-white`} />
              </div>
            </>
          )}
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
          
          {/* Sponsor support text with clickable name */}
          <p className={`${classes.text} text-foreground/80 leading-snug`}>
            {partnerInfo ? (
              <>
                {language === 'hu' ? 'A ' : ''}
                <Link 
                  to={`/partners/${partnerInfo.slug}`}
                  className="font-semibold text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {sponsorName}
                </Link>
                {language === 'hu' 
                  ? ` ${formatPrice(contributionAmount)}-tal támogatja a részvételedet!`
                  : language === 'de'
                  ? ` unterstützt deine Teilnahme mit ${formatPrice(contributionAmount)}!`
                  : ` is supporting your participation with ${formatPrice(contributionAmount)}!`
                }
              </>
            ) : (
              getSponsorText()
            )}
          </p>

          {/* Price breakdown - STRICT HIERARCHY: Line 1 = Strikethrough, Line 2 = Badge or Price */}
          <div className="flex flex-col gap-0.5 mt-2">
            {/* Line 1: Original price with strikethrough */}
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
            {/* Line 2: Professional green badge for FREE, or bold price */}
            {memberPayment === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-semibold text-sm mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'hu' ? 'TÁMOGATOTT / INGYENES' : language === 'de' ? 'GEFÖRDERT / KOSTENLOS' : 'SPONSORED / FREE'}
              </span>
            ) : (
              <span className={`${classes.price} font-bold text-primary`}>
                {formatPrice(memberPayment)}
              </span>
            )}
          </div>

          {/* Quota status with content-type specific label + URGENCY BADGE */}
          {maxSeats > 0 && remainingSeats > 0 && (
            <div className="mt-2">
              {/* URGENCY BADGE: Show prominent warning when <= 3 seats left */}
              {remainingSeats <= 3 && (
                <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 w-fit animate-pulse">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-semibold text-red-600">
                    {language === 'hu' 
                      ? `Már csak ${remainingSeats} támogatott hely!`
                      : language === 'de'
                      ? `Nur noch ${remainingSeats} Plätze!`
                      : `Only ${remainingSeats} spots left!`}
                  </span>
                </div>
              )}
              
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
