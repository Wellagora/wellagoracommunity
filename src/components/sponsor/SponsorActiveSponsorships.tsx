import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Calendar, MapPin, Award, Coins, Users, Leaf, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';

interface Sponsorship {
  id: string;
  challenge_id: string;
  status: string;
  credit_cost: number | null;
  start_date: string;
  end_date: string | null;
  tier: string | null;
  region: string;
  package_type: string;
  created_at: string;
}

interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  translations: any;
  image_url: string | null;
}

const SponsorActiveSponsorships = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [challengeDefinitions, setChallengeDefinitions] = useState<Map<string, ChallengeDefinition>>(new Map());
  const [loading, setLoading] = useState(true);

  const localeMap = {
    hu: hu,
    en: enUS,
    de: de,
  };

  useEffect(() => {
    if (user) {
      loadSponsorships();
    }
  }, [user]);

  const loadSponsorships = async () => {
    try {
      setLoading(true);
      
      // Get sponsorships for this user or their organization
      let query = supabase
        .from('challenge_sponsorships')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Filter by user OR organization
      if (profile?.organization_id) {
        query = query.or(`sponsor_user_id.eq.${user?.id},sponsor_organization_id.eq.${profile.organization_id}`);
      } else {
        query = query.eq('sponsor_user_id', user?.id || '');
      }

      const { data: sponsorshipsData, error: sponsorshipsError } = await query;

      if (sponsorshipsError) {
        console.error('Error loading sponsorships:', sponsorshipsError);
        return;
      }

      setSponsorships(sponsorshipsData || []);
      
      // Get unique challenge IDs
      const challengeIds = [...new Set((sponsorshipsData || []).map(s => s.challenge_id))];
      
      // Fetch challenge definitions
      if (challengeIds.length > 0) {
        const { data: challenges, error } = await supabase
          .from('challenge_definitions')
          .select('id, title, description, translations, image_url')
          .in('id', challengeIds);
        
        if (error) {
          console.error('Error loading challenge definitions:', error);
        } else {
          const challengeMap = new Map<string, ChallengeDefinition>();
          challenges?.forEach(challenge => {
            challengeMap.set(challenge.id, challenge);
          });
          setChallengeDefinitions(challengeMap);
        }
      }
    } catch (error) {
      console.error('Error loading sponsorships:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedTitle = (challengeId: string): string => {
    const challenge = challengeDefinitions.get(challengeId);
    if (!challenge) return language === 'hu' ? 'Program nem található' : language === 'de' ? 'Programm nicht gefunden' : 'Program not found';
    
    const translations = challenge.translations || {};
    return translations[language]?.title || challenge.title || challenge.id;
  };

  const getLocalizedDescription = (challengeId: string): string => {
    const challenge = challengeDefinitions.get(challengeId);
    if (!challenge) return '';
    
    const translations = challenge.translations || {};
    return translations[language]?.description || challenge.description || '';
  };

  const getChallengeImage = (challengeId: string): string | null => {
    const challenge = challengeDefinitions.get(challengeId);
    return challenge?.image_url || null;
  };

  const calculateDurationMonths = (startDate: string, endDate: string | null): number => {
    if (!endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(1, Math.min(12, months)); // Clamp between 1-12
  };

  const getDurationLabel = (months: number): string => {
    const monthLabel = language === 'hu' ? 'hónap' : language === 'de' ? 'Monat(e)' : 'month(s)';
    return `${months} ${monthLabel}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {t('sponsor.active_sponsorships') || 'Aktív szponzorálások'}
        </CardTitle>
        <CardDescription>
          {t('sponsor.active_sponsorships_desc') || 'A jelenleg futó program szponzorálásaid'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sponsorships.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              {t('sponsor.no_active_sponsorships') || 'Még nincs aktív szponzorálásod'}
            </p>
            <Button onClick={() => window.location.href = '/challenges'}>
              {t('sponsor.browse_challenges') || 'Programok böngészése'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sponsorships.map((sponsorship) => {
              const imageUrl = getChallengeImage(sponsorship.challenge_id);
              const months = calculateDurationMonths(sponsorship.start_date, sponsorship.end_date);
              const hasProgram = challengeDefinitions.has(sponsorship.challenge_id);
              
              return (
                <Card key={sponsorship.id} className="border hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      {imageUrl && (
                        <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
                          <img 
                            src={imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 p-4 space-y-3">
                        {/* Header */}
                        <div>
                          <h4 className="font-semibold text-lg">
                            {getLocalizedTitle(sponsorship.challenge_id)}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {getLocalizedDescription(sponsorship.challenge_id)}
                          </p>
                        </div>
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(sponsorship.start_date), 'yyyy. MM. dd.', {
                                locale: localeMap[language as keyof typeof localeMap] || hu,
                              })}
                            </span>
                          </div>
                          
                          {sponsorship.end_date && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <TrendingUp className="w-4 h-4" />
                              <span>
                                {format(new Date(sponsorship.end_date), 'yyyy. MM. dd.', {
                                  locale: localeMap[language as keyof typeof localeMap] || hu,
                                })}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{sponsorship.region}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-primary" />
                            <span className="font-medium text-primary">
                              {sponsorship.credit_cost || 1} kredit
                            </span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <Badge className="bg-success/10 text-success border-success/20">
                            <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                            Aktív
                          </Badge>
                          <Badge variant="outline">
                            {getDurationLabel(months)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorActiveSponsorships;
