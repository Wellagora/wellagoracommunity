import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Calendar, MapPin, Award, Users, Leaf, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';
import { getSponsorshipsWithImpact, type SponsorshipImpact } from '@/services/SponsorImpactService';

const SponsorActiveSponsorships = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [sponsorships, setSponsorships] = useState<SponsorshipImpact[]>([]);
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
      // OPTIMIZED: Single call that gets everything
      const data = await getSponsorshipsWithImpact(user?.id || '');
      setSponsorships(data);
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
              <Card key={sponsorship.sponsorship_id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col gap-1 mb-2">
                          <h4 className="font-semibold text-lg">{sponsorship.challenge_title}</h4>
                          {sponsorship.challenge_description && (
                            <p className="text-sm text-muted-foreground">{sponsorship.challenge_description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {getTierBadge(sponsorship.tier)}
                          </div>
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

                    {/* Real Impact Metrics */}
                    {sponsorship.total_completions > 0 ? (
                      <div className="border-t pt-4">
                        <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase flex items-center gap-2">
                          <span>🎯 {t('sponsor.real_impact_from_db')}</span>
                          <Badge variant="outline" className="text-xs">
                            {(sponsorship.average_validation_score * 100).toFixed(0)}% {t('sponsor.accuracy')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-success">
                              <Users className="w-4 h-4" />
                              <span className="text-xs font-medium">{t('sponsor.participants')}</span>
                            </div>
                            <p className="text-xl font-bold text-success">
                              {sponsorship.total_participants}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sponsorship.total_completions} {t('sponsor.completions')}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary">
                              <Leaf className="w-4 h-4" />
                              <span className="text-xs font-medium">{t('sponsor.co2_impact')}</span>
                            </div>
                            <p className="text-xl font-bold text-primary">
                              {sponsorship.total_co2_saved.toFixed(1)} kg
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ≈ {sponsorship.trees_equivalent.toFixed(1)} {t('sponsor.trees')}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-warning">
                              <Award className="w-4 h-4" />
                              <span className="text-xs font-medium">{t('sponsor.points')}</span>
                            </div>
                            <p className="text-xl font-bold text-warning">
                              {sponsorship.total_points_earned.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('sponsor.gamification')}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-accent">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-xs font-medium">{t('sponsor.average_handprint')}</span>
                            </div>
                            <p className="text-xl font-bold text-accent">
                              {(sponsorship.total_co2_saved / sponsorship.total_participants).toFixed(1)} kg
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('sponsor.per_participant')}
                            </p>
                          </div>
                        </div>

                        {/* Activity Breakdown */}
                        {Object.keys(sponsorship.activities_by_type).length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-xs font-semibold text-muted-foreground mb-2">
                              {t('sponsor.activity_types')}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(sponsorship.activities_by_type).map(([type, data]) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}: {data.count}x ({data.co2_saved.toFixed(1)} kg CO₂)
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-t pt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          {t('sponsor.no_completions_yet')}
                        </p>
                      </div>
                    )}
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
