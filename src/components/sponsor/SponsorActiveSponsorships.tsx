import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Calendar, MapPin, Award } from 'lucide-react';
import { format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';

interface Sponsorship {
  id: string;
  challenge_id: string;
  tier: string;
  credit_cost: number;
  start_date: string;
  end_date: string | null;
  status: string;
  region: string;
}

const SponsorActiveSponsorships = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
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
      const { data, error } = await supabase
        .from('challenge_sponsorships')
        .select('*')
        .eq('sponsor_user_id', user?.id)
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setSponsorships(data || []);
    } catch (error) {
      console.error('Error loading sponsorships:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const tiers: Record<string, { label: string; color: string; icon: string }> = {
      bronze: { label: t('sponsor.tier.bronze'), color: 'bg-amber-700 text-white', icon: '🥉' },
      silver: { label: t('sponsor.tier.silver'), color: 'bg-gray-400 text-white', icon: '🥈' },
      gold: { label: t('sponsor.tier.gold'), color: 'bg-yellow-500 text-white', icon: '🥇' },
      diamond: { label: t('sponsor.tier.diamond'), color: 'bg-cyan-500 text-white', icon: '💎' },
    };
    const config = tiers[tier] || tiers.bronze;
    return (
      <Badge className={config.color}>
        {config.icon} {config.label}
      </Badge>
    );
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
          {t('sponsor.active_sponsorships')}
        </CardTitle>
        <CardDescription>{t('sponsor.active_sponsorships_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {sponsorships.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">{t('sponsor.no_active_sponsorships')}</p>
            <Button className="mt-4" onClick={() => window.location.href = '/challenges'}>
              {t('sponsor.browse_challenges')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sponsorships.map((sponsorship) => (
              <Card key={sponsorship.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{sponsorship.challenge_id}</h4>
                        {getTierBadge(sponsorship.tier)}
                      </div>
                      
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{sponsorship.region}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(sponsorship.start_date), 'PP', {
                              locale: localeMap[language as keyof typeof localeMap] || enUS,
                            })}
                            {sponsorship.end_date && (
                              <> - {format(new Date(sponsorship.end_date), 'PP', {
                                locale: localeMap[language as keyof typeof localeMap] || enUS,
                              })}</>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          <span>{sponsorship.credit_cost} {t('sponsor.credits_per_month')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        {t('sponsor.view_analytics')}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        {t('sponsor.manage')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorActiveSponsorships;
