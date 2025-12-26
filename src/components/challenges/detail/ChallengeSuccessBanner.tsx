import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles } from "lucide-react";

interface ChallengeSuccessBannerProps {
  participants: number;
  completionRate: number;
  isParticipating: boolean;
}

const ChallengeSuccessBanner = ({ 
  participants, 
  completionRate, 
  isParticipating 
}: ChallengeSuccessBannerProps) => {
  const { t } = useLanguage();

  if (isParticipating) {
    return null;
  }

  return (
    <Card className="bg-gradient-primary border-0 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                {t('challenges.success_stories_title')}
              </span>
            </div>
            <p className="text-lg sm:text-xl font-semibold mb-2">
              {t('challenges.success_stories_desc')}
            </p>
            <p className="text-white/90 text-sm">
              {t('challenges.success_stories_subtitle')}
            </p>
          </div>
          <div className="flex gap-4 sm:flex-col">
            <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{participants.toLocaleString()}</div>
              <div className="text-xs opacity-90">{t('challenges.joined')}</div>
            </div>
            <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="text-xs opacity-90">{t('challenges.completed')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeSuccessBanner;
