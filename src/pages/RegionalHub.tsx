import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProject } from '@/contexts/ProjectContext';
import RegionalStakeholderMap from '@/components/matching/RegionalStakeholderMap';
import ModernRegionalVisualization from '@/components/matching/ModernRegionalVisualization';
import StakeholderFilters from '@/components/matching/StakeholderFilters';
import ChallengeSponsorshipModal from '@/components/challenges/ChallengeSponsorshipModal';
import ContactModal from '@/components/regional/ContactModal';
import LanguageSelector from '@/components/LanguageSelector';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Globe, 
  MapPin, 
  Users, 
  Search,
  Map,
  Target,
  Building2,
  Sprout,
  TrendingUp,
  Euro
} from 'lucide-react';
import { challenges, Challenge } from '@/data/challenges';

interface StakeholderProfile {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  city?: string;
  latitude: number;
  longitude: number;
  description: string;
  sustainabilityGoals: string[];
  avatar: string;
  verified: boolean;
  impactScore: number;
  isRegistered: boolean;
}

interface SponsorInfo {
  id: string;
  userId: string;
  name: string;
  logo: string;
  package: string;
  organizationId?: string;
}

interface RegionalChallenge extends Omit<Challenge, 'sponsor'> {
  region: string;
  sponsor?: SponsorInfo;
}

const RegionalHub = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentProject, isLoading: projectLoading } = useProject();
  const [viewMode, setViewMode] = useState<'stakeholders' | 'challenges' | 'sponsorship'>('stakeholders');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['citizen', 'business', 'government', 'ngo']);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [selectedChallengeForSponsorship, setSelectedChallengeForSponsorship] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    userId: string;
  } | null>(null);
  const [stakeholders, setStakeholders] = useState<StakeholderProfile[]>([]);
  const [loadingStakeholders, setLoadingStakeholders] = useState(true);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Fetch real stakeholders from database for current project
  useEffect(() => {
    if (!currentProject) {
      setStakeholders([]);
      setLoadingStakeholders(false);
      return;
    }

    const fetchStakeholders = async () => {
      setLoadingStakeholders(true);
      try {
        // Fetch profiles that are members of this project
        const { data: members, error: membersError } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', currentProject.id);

        if (membersError) throw membersError;

        if (!members || members.length === 0) {
          setStakeholders([]);
          setLoadingStakeholders(false);
          return;
        }

        const memberIds = members.map(m => m.user_id);

        // Fetch profile details for these members
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds)
          .eq('is_public_profile', true);

        if (profilesError) throw profilesError;

        // Get activity/impact scores
        const { data: activities } = await supabase
          .from('sustainability_activities')
          .select('user_id, points_earned')
          .in('user_id', memberIds)
          .eq('project_id', currentProject.id);

        // Calculate impact scores per user
        const impactScores: Record<string, number> = {};
        activities?.forEach(activity => {
          impactScores[activity.user_id] = (impactScores[activity.user_id] || 0) + (activity.points_earned || 0);
        });

        // Base coordinates for the region
        const baseCoords = { lat: 46.9, lng: 17.6 };

        // Transform profiles to stakeholder format
        const transformedStakeholders: StakeholderProfile[] = (profiles || []).map((profile, index) => {
          // Determine user type based on user_role
          const typeMap: Record<string, StakeholderProfile['type']> = {
            'business': 'business',
            'government': 'government',
            'ngo': 'ngo',
            'citizen': 'citizen'
          };

          // Use actual coordinates if available, otherwise use offset from base
          const lat = profile.latitude ? Number(profile.latitude) : baseCoords.lat + (index * 0.01);
          const lng = profile.longitude ? Number(profile.longitude) : baseCoords.lng + (index * 0.01);

          return {
            id: profile.id,
            name: profile.public_display_name || `${profile.first_name} ${profile.last_name}`,
            type: typeMap[profile.user_role] || 'citizen',
            organization: profile.organization || undefined,
            location: profile.location || currentProject.region_name,
            region: currentProject.region_name,
            city: profile.city || profile.location || currentProject.region_name,
            latitude: lat,
            longitude: lng,
            description: profile.bio || t('regional.no_description'),
            sustainabilityGoals: profile.sustainability_goals || [],
            avatar: profile.avatar_url || "👤",
            verified: profile.is_public_profile || false,
            impactScore: impactScores[profile.id] || 0,
            isRegistered: true,
          };
        });

        setStakeholders(transformedStakeholders);
      } catch (error) {
        console.error('Error fetching stakeholders:', error);
        toast({
          title: t('common.error'),
          description: t('regional.error_loading_stakeholders'),
          variant: 'destructive',
        });
        setStakeholders([]);
      } finally {
        setLoadingStakeholders(false);
      }
    };

    fetchStakeholders();
  }, [currentProject, t, toast]);

  // Fetch sponsorships from database for current project
  useEffect(() => {
    if (!currentProject) return;

    const fetchSponsorships = async () => {
      const { data, error } = await supabase
        .from('challenge_sponsorships')
        .select(`
          *,
          profiles!challenge_sponsorships_sponsor_user_id_fkey(
            first_name,
            last_name,
            public_display_name,
            avatar_url,
            organization
          ),
          organizations(
            name,
            logo_url
          )
        `)
        .eq('region', currentProject.region_name)
        .eq('project_id', currentProject.id)
        .eq('status', 'active');

      if (!error && data) {
        setSponsorships(data);
      }
    };

    fetchSponsorships();
  }, [currentProject]);

  // Generate regional challenges with real sponsorship data for current project
  const getRegionalChallenges = (): RegionalChallenge[] => {
    if (!currentProject) return [];
    
    return challenges.slice(0, 6).map(challenge => {
      // Find sponsorship for this challenge in this project
      const sponsorship = sponsorships.find(
        s => s.challenge_id === challenge.id
      );

      let sponsor: SponsorInfo | undefined;
      
      if (sponsorship) {
        const profile = sponsorship.profiles;
        const org = sponsorship.organizations;
        
        sponsor = {
          id: sponsorship.id,
          userId: sponsorship.sponsor_user_id,
          name: org?.name || profile?.organization || profile?.public_display_name || 
                `${profile?.first_name} ${profile?.last_name}`,
          logo: org?.logo_url || profile?.avatar_url || "🏢",
          package: sponsorship.package_type,
          organizationId: sponsorship.sponsor_organization_id
        };
      }

      return {
        ...challenge,
        sponsor,
        region: currentProject.region_name,
      };
    });
  };

  const regionalChallenges = getRegionalChallenges();
  
  // Filter profiles
  let filteredProfiles = stakeholders.filter(p => selectedTypes.includes(p.type));
  
  if (searchQuery) {
    filteredProfiles = filteredProfiles.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Show loading or no project message
  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 text-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 text-center">
          <Map className="w-24 h-24 mx-auto mb-6 text-primary opacity-50" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('regional.no_project')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('regional.join_project_desc')}
          </p>
          <Button onClick={() => navigate('/projects')} size="lg">
            {t('regional.view_projects')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-6 sm:pb-8">
        {/* Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground">
              {currentProject.name}
            </h1>
            <div className="ml-auto">
              <LanguageSelector />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6 px-4">
            {currentProject.description || t('regional.subtitle_selected')}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge 
              className="bg-gradient-to-r from-primary to-accent text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
            >
              📍 {currentProject.region_name}
            </Badge>
            <Badge variant="secondary" className="bg-success/20 text-success text-xs sm:text-sm">
              {filteredProfiles.filter(p => p.isRegistered).length} {t('regional.registered')}
            </Badge>
            <Badge variant="secondary" className="bg-warning/20 text-warning text-xs sm:text-sm">
              {filteredProfiles.filter(p => !p.isRegistered).length} {t('regional.potential')}
            </Badge>
            {currentProject.villages && currentProject.villages.length > 0 && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                {currentProject.villages.length} {t('regional.villages')}
              </Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {(
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto">
                <TabsTrigger value="stakeholders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t('regional.partners')}</span>
                  <span className="sm:hidden">{t('regional.partners_short')}</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t('regional.challenges')}</span>
                  <span className="sm:hidden">{t('regional.challenges_short')}</span>
                </TabsTrigger>
                <TabsTrigger value="sponsorship" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t('regional.sponsorship')}</span>
                  <span className="sm:hidden">{t('regional.sponsorship_short')}</span>
                </TabsTrigger>
              </TabsList>

              {/* Stakeholders Tab */}
              <TabsContent value="stakeholders" className="space-y-6">
                {loadingStakeholders ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                  </div>
                ) : (
                  <>
                    <StakeholderFilters
                      selectedTypes={selectedTypes}
                      onTypeToggle={handleTypeToggle}
                      selectedRegion={currentProject.region_name}
                      onRegionChange={() => {}}
                      regions={[]}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      totalCount={filteredProfiles.length}
                    />

                    {filteredProfiles.length === 0 ? (
                      <Card className="p-8 text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">{t('regional.no_stakeholders')}</h3>
                        <p className="text-muted-foreground">{t('regional.no_stakeholders_desc')}</p>
                      </Card>
                    ) : (
                      <>
                        <ModernRegionalVisualization
                  stakeholders={filteredProfiles.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: p.type,
                    organization: p.organization,
                    location: p.location,
                    region: p.region,
                    city: p.city,
                    district: p.city,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    bio: p.description,
                    sustainability_goals: p.sustainabilityGoals,
                    avatar: p.avatar,
                    impactScore: p.impactScore
                  }))}
                  onStakeholderClick={(stakeholder) => {
                    toast({
                      title: t('regional.stakeholder_selected'),
                      description: stakeholder.name,
                    });
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProfiles.map((profile) => (
                    <Card key={profile.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {profile.avatar.startsWith('http') ? (
                              <img 
                                src={profile.avatar} 
                                alt={profile.name}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="text-4xl">👤</div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="text-4xl">{profile.avatar}</div>
                            )}
                            <div>
                              <CardTitle className="text-base">{profile.name}</CardTitle>
                              {profile.organization && (
                                <p className="text-xs text-muted-foreground">{profile.organization}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={profile.isRegistered ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                            {profile.isRegistered ? t('regional.registered_badge') : t('regional.potential_badge')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{profile.description}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {profile.sustainabilityGoals.slice(0, 2).map((goal, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Sprout className="w-3 h-3 mr-1" />
                              {goal}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          className="w-full" 
                          size="sm" 
                          onClick={() => {
                            if (profile.isRegistered) {
                              setSelectedContact({
                                name: profile.name,
                                userId: profile.id,
                              });
                              setContactModalOpen(true);
                            } else {
                              toast({
                                title: t('regional.send_invite'),
                                description: t('regional.coming_soon'),
                              });
                            }
                          }}
                        >
                          {profile.isRegistered ? t('regional.contact') : t('regional.send_invite')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                      </>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Challenges Tab */}
              <TabsContent value="challenges" className="space-y-6">
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
                  {regionalChallenges.map((challenge) => (
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
                            onClick={() => {
                              if (challenge.sponsor?.organizationId) {
                                navigate(`/organization/${challenge.sponsor.organizationId}`);
                              } else if (challenge.sponsor?.userId) {
                                navigate(`/profile?userId=${challenge.sponsor.userId}`);
                              }
                            }}
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
                            {currentProject.region_name}
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            {challenge.pointsReward} {t('regional.points')}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1" size="sm" variant="outline">
                            {t('regional.details')}
                          </Button>
                          {!challenge.sponsor && user && (
                            <Button 
                              className="flex-1" 
                              size="sm"
                              onClick={() => setSelectedChallengeForSponsorship({
                                id: challenge.id,
                                title: t(challenge.titleKey)
                              })}
                            >
                              {t('regional.sponsor_button')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Sponsorship Tab */}
              <TabsContent value="sponsorship" className="space-y-6">
                <Card className="bg-gradient-to-r from-warning/10 to-success/10 border-warning/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Building2 className="w-12 h-12 text-warning flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold mb-2">{t('regional.sponsorship_title')}</h3>
                        <p className="text-muted-foreground mb-4">
                          {t('regional.sponsorship_desc')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-success/20 text-success">{t('regional.brand_awareness')}</Badge>
                          <Badge className="bg-primary/20 text-primary">{t('regional.esg_reports')}</Badge>
                          <Badge className="bg-accent/20 text-accent">{t('regional.community_impact')}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bronze Package */}
                  <Card className="border-2 border-amber-500/20 hover:border-amber-500/40 transition-all">
                    <CardHeader>
                      <Badge className="bg-amber-500/10 text-amber-600 w-fit">{t('regional.package_bronze')}</Badge>
                      <CardTitle className="text-2xl mt-2">{t('regional.package_bronze_price')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('regional.package_bronze_price_sub')}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_bronze_feature1')}
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_bronze_feature2')}
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_bronze_feature3')}
                        </li>
                      </ul>
                      <Button className="w-full">{t('regional.choose_button')}</Button>
                    </CardContent>
                  </Card>

                  {/* Silver Package */}
                  <Card className="border-2 border-gray-400/20 hover:border-gray-400/40 transition-all">
                    <CardHeader>
                      <Badge className="bg-gray-400/10 text-gray-600 w-fit">{t('regional.package_silver')}</Badge>
                      <CardTitle className="text-2xl mt-2">{t('regional.package_silver_price')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('regional.package_silver_price_sub')}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_silver_feature1')}
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_silver_feature2')}
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_silver_feature3')}
                        </li>
                      </ul>
                      <Button className="w-full bg-gray-600 hover:bg-gray-700">{t('regional.choose_button')}</Button>
                    </CardContent>
                  </Card>

                  {/* Gold Package */}
                  <Card className="border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                    <CardHeader>
                      <Badge className="bg-yellow-500/10 text-yellow-600 w-fit">{t('regional.package_gold')}</Badge>
                      <CardTitle className="text-2xl mt-2">{t('regional.package_gold_price')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('regional.package_gold_price_sub')}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_gold_feature1')}
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_gold_feature2')}
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          {t('regional.package_gold_feature3')}
                        </li>
                      </ul>
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        {t('regional.choose_button')}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{t('regional.impact_calculator')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">{t('regional.expected_reach')}</p>
                        <p className="text-2xl font-bold text-primary">{t('regional.expected_reach_value')}</p>
                        <p className="text-xs text-muted-foreground">{t('regional.expected_reach_unit')}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">{t('regional.co2_savings')}</p>
                        <p className="text-2xl font-bold text-success">{t('regional.co2_savings_value')}</p>
                        <p className="text-xs text-muted-foreground">{t('regional.co2_savings_unit')}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">{t('regional.brand_awareness_calc')}</p>
                        <p className="text-2xl font-bold text-accent">{t('regional.brand_awareness_value')}</p>
                        <p className="text-xs text-muted-foreground">{t('regional.brand_awareness_unit')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>

      {selectedChallengeForSponsorship && (
        <ChallengeSponsorshipModal
          open={!!selectedChallengeForSponsorship}
          onOpenChange={(open) => !open && setSelectedChallengeForSponsorship(null)}
          challengeId={selectedChallengeForSponsorship.id}
          challengeTitle={selectedChallengeForSponsorship.title}
          region={currentProject.region_name}
        />
      )}

      {selectedContact && (
        <ContactModal
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
          recipientName={selectedContact.name}
          recipientUserId={selectedContact.userId}
        />
      )}
    </div>
  );
};

export default RegionalHub;
