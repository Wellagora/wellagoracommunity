import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { RegionalChallenge } from '@/hooks/useRegionalHub';

interface RegionalChallengesTabProps {
  challenges: RegionalChallenge[];
  regionName: string;
  userId?: string;
  onSponsorClick: (id: string, title: string) => void;
  onSponsorProfileClick: (organizationId?: string, userId?: string) => void;
}

export const RegionalChallengesTab = ({
  challenges,
  regionName,
  userId,
  onSponsorClick,
  onSponsorProfileClick,
}: RegionalChallengesTabProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Target className="w-12 h-12 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">{t('regional.regional_challenges')}</h3>
              <p className="text-muted-foreground">
                {t('regional.regional_challenges_desc')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/50 overflow-hidden">
            {challenge.imageUrl && (
              <div className="relative h-40 w-full overflow-hidden">
                <img 
                  src={challenge.imageUrl} 
                  alt={t(challenge.titleKey)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                  <Badge className="bg-primary/20 text-primary backdrop-blur-sm">{challenge.category}</Badge>
                  <Badge variant="outline" className="backdrop-blur-sm bg-background/80">{challenge.difficulty}</Badge>
                </div>
              </div>
            )}
            <CardHeader>
              {!challenge.imageUrl && (
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-primary/20 text-primary">{challenge.category}</Badge>
                  <Badge variant="outline">{challenge.difficulty}</Badge>
                </div>
              )}
              <CardTitle className="text-lg">{t(challenge.titleKey)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {t(challenge.descriptionKey)}
              </p>
              
              {challenge.sponsor ? (
                <div 
                  className="bg-muted/50 rounded-lg p-3 mb-4 cursor-pointer hover:bg-muted transition-all group"
                  onClick={() => onSponsorProfileClick(challenge.sponsor?.organizationId, challenge.sponsor?.userId)}
                >
                  <p className="text-xs text-muted-foreground mb-1">{t('regional.sponsor_label')}:</p>
                  <div className="flex items-center gap-2">
                    {challenge.sponsor.logo.startsWith('http') ? (
                      <img src={challenge.sponsor.logo} alt={challenge.sponsor.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <span className="text-2xl">{challenge.sponsor.logo}</span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {challenge.sponsor.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {challenge.sponsor.package} {t('regional.package')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-warning/10 rounded-lg p-3 mb-4 border border-warning/20">
                  <p className="text-xs text-warning">{t('regional.no_sponsor_yet')}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {regionName}
                </div>
                <div className="text-sm font-semibold text-primary">
                  {challenge.pointsReward} {t('regional.points')}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1" size="sm" variant="outline">
                  {t('regional.details')}
                </Button>
                {!challenge.sponsor && userId && (
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => onSponsorClick(challenge.id, t(challenge.titleKey))}
                  >
                    {t('regional.sponsor_button')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
