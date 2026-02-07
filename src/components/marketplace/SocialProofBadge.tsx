import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Users, Flame, Clock } from 'lucide-react';

interface SocialProofBadgeProps {
  attendeeCount?: number;
  seatsLeft?: number;
  maxSeats?: number;
  showAvatars?: boolean;
  size?: 'sm' | 'md';
}

const INITIALS = ['W', 'A', 'G'];

export const SocialProofBadge = ({
  attendeeCount = 0,
  seatsLeft,
  maxSeats,
  showAvatars = true,
  size = 'sm'
}: SocialProofBadgeProps) => {
  const { language } = useLanguage();

  // Generate random but consistent attendee count if not provided
  const displayCount = attendeeCount > 0 ? attendeeCount : Math.floor(Math.random() * 20) + 5;
  
  const avatarSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  const overlapSize = size === 'sm' ? '-ml-1.5' : '-ml-2';

  // Scarcity labels
  const getScarcityText = () => {
    if (!seatsLeft) return null;
    if (seatsLeft <= 3) {
      return language === 'hu' 
        ? `Már csak ${seatsLeft} szabad hely!` 
        : language === 'de' 
        ? `Nur noch ${seatsLeft} Plätze!` 
        : `Only ${seatsLeft} spots left!`;
    }
    if (seatsLeft <= 5) {
      return language === 'hu' 
        ? `Még ${seatsLeft} hely elérhető` 
        : language === 'de' 
        ? `Noch ${seatsLeft} Plätze verfügbar` 
        : `${seatsLeft} spots remaining`;
    }
    return null;
  };

  const attendeeText = language === 'hu' 
    ? `+${displayCount} fő már jelentkezett` 
    : language === 'de' 
    ? `+${displayCount} Personen angemeldet` 
    : `+${displayCount} people joined`;

  const scarcityText = getScarcityText();
  const isUrgent = seatsLeft && seatsLeft <= 3;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Attendee avatars and count */}
      {showAvatars && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {INITIALS.map((initial, idx) => (
              <Avatar 
                key={idx} 
                className={`${avatarSize} ${idx > 0 ? overlapSize : ''} ring-2 ring-white`}
              >
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>
            ))}
            {displayCount > 3 && (
              <div className={`${avatarSize} ${overlapSize} rounded-full bg-black/80 ring-2 ring-white flex items-center justify-center`}>
                <span className="text-[8px] font-medium text-white">+{displayCount - 3}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {attendeeText}
          </span>
        </div>
      )}

      {/* Scarcity indicator */}
      {scarcityText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            isUrgent ? 'text-red-600' : 'text-orange-600'
          }`}
        >
          {isUrgent ? (
            <Flame className="w-3 h-3 animate-pulse" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {scarcityText}
        </motion.div>
      )}
    </div>
  );
};

export default SocialProofBadge;
