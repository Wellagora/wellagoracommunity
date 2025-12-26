import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

interface Participant {
  id: string;
  name: string;
  avatar: string;
}

interface ChallengeParticipantsProps {
  participants: number;
  participantsPreview: Participant[];
}

const ChallengeParticipants = ({ participants, participantsPreview }: ChallengeParticipantsProps) => {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">{t('challenges.participants_label')}</span>
        <span className="text-xs text-muted-foreground">
          +{(participants - participantsPreview.length).toLocaleString()} {t('challenges.more')}
        </span>
      </div>
      <div className="flex -space-x-2">
        {participantsPreview.map((participant) => (
          <Avatar key={participant.id} className="w-8 h-8 border-2 border-background">
            <AvatarImage src={participant.avatar} alt={participant.name} />
            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
};

export default ChallengeParticipants;
