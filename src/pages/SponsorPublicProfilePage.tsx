import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Globe,
  Users,
  Leaf,
  Award,
  ArrowLeft,
  ExternalLink,
  Ticket,
  TrendingUp
} from 'lucide-react';

interface SponsorProfile {
  id: string;
  organization_name: string | null;
  organization_logo_url: string | null;
  bio: string | null;
  website_url: string | null;
  first_name: string;
  last_name: string;
}

interface SponsorImpact {
  programsSupported: number;
  peopleReached: number;
  vouchersIssued: number;
  co2Saved: number;
}

const SponsorPublicProfilePage = () => {
  const { sponsorId } = useParams<{ sponsorId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [sponsor, setSponsor] = useState<SponsorProfile | null>(null);
  const [impact, setImpact] = useState<SponsorImpact>({
    programsSupported: 0,
    peopleReached: 0,
    vouchersIssued: 0,
    co2Saved: 0
  });
  const [sponsoredPrograms, setSponsoredPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sponsorId) {
      fetchSponsorData();
    }
  }, [sponsorId]);

  const fetchSponsorData = async () => {
    try {
      // Fetch sponsor profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, organization_name, organization_logo_url, bio, website_url, first_name, last_name')
        .eq('id', sponsorId)
        .single();

      if (profileError) throw profileError;
      setSponsor(profileData);

      // Fetch sponsored content
      const { data: sponsorships } = await supabase
        .from('content_sponsorships')
        .select(`
          id,
          total_licenses,
          used_licenses,
          expert_contents (
            id,
            title,
            image_url,
            category
          )
        `)
        .eq('sponsor_id', sponsorId)
        .eq('is_active', true);

      const programsSupported = sponsorships?.length || 0;
      const contentIds = sponsorships?.map(s => s.expert_contents?.id).filter(Boolean) || [];

      // Get unique users reached
      let peopleReached = 0;
      let totalVouchers = 0;
      if (contentIds.length > 0) {
        const { data: vouchers } = await supabase
          .from('vouchers')
          .select('user_id')
          .in('content_id', contentIds);

        peopleReached = new Set(vouchers?.map(v => v.user_id) || []).size;
        totalVouchers = vouchers?.length || 0;
      }

      setImpact({
        programsSupported,
        peopleReached,
        vouchersIssued: totalVouchers,
        co2Saved: totalVouchers * 2 // Estimate: 2kg CO2 per voucher
      });

      // Set sponsored programs for display
      const programs = sponsorships?.map(s => ({
        id: s.expert_contents?.id,
        title: s.expert_contents?.title,
        imageUrl: s.expert_contents?.image_url,
        category: s.expert_contents?.category,
        licensesUsed: s.used_licenses || 0,
        licensesTotal: s.total_licenses || 0
      })).filter(p => p.id) || [];

      setSponsoredPrograms(programs);
    } catch (error) {
      console.error('Error fetching sponsor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const companyInitials = sponsor?.organization_name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SP';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {t('sponsor.not_found') || 'Szponzor nem található'}
            </h2>
            <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.go_back') || 'Vissza'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back') || 'Vissza'}
        </Button>

        {/* Hero Card */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={sponsor.organization_logo_url || ''} />
                <AvatarFallback className="bg-emerald-100 text-emerald-600 text-3xl font-bold">
                  {companyInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left pb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {sponsor.organization_name || `${sponsor.first_name} ${sponsor.last_name}`}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <Award className="w-3 h-3 mr-1" />
                    {t('sponsor.verified_sponsor') || 'Ellenőrzött szponzor'}
                  </Badge>
                </div>
              </div>
              {sponsor.website_url && (
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={() => window.open(sponsor.website_url!, '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t('sponsor.visit_website') || 'Weboldal'}
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              )}
            </div>

            {/* Description */}
            {sponsor.bio && (
              <p className="mt-6 text-muted-foreground leading-relaxed">
                {sponsor.bio}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <Ticket className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{impact.programsSupported}</p>
              <p className="text-sm text-muted-foreground">
                {t('sponsor.programs_supported') || 'Támogatott program'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{impact.peopleReached}</p>
              <p className="text-sm text-muted-foreground">
                {t('sponsor.people_reached') || 'Elért ember'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{impact.vouchersIssued}</p>
              <p className="text-sm text-muted-foreground">
                {t('sponsor.vouchers_issued') || 'Kiadott kupon'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{impact.co2Saved} kg</p>
              <p className="text-sm text-muted-foreground">
                {t('sponsor.co2_saved') || 'CO₂ megtakarítás'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sponsored Programs */}
        {sponsoredPrograms.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-600" />
                {t('sponsor.supported_programs') || 'Támogatott programok'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {sponsoredPrograms.map((program) => (
                  <Card
                    key={program.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/program/${program.id}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {program.imageUrl ? (
                          <img
                            src={program.imageUrl}
                            alt={program.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                            <Ticket className="w-8 h-8 text-emerald-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {program.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {program.licensesUsed}/{program.licensesTotal} {t('sponsor.seats_used') || 'hely felhasználva'}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {program.category || 'Program'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SponsorPublicProfilePage;
