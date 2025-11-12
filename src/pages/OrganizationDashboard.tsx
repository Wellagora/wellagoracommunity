import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { MobilizeTeamModal } from "@/components/dashboard/MobilizeTeamModal";
import { OrganizationSponsorModal } from "@/components/dashboard/OrganizationSponsorModal";
import { OrganizationChallengeStats } from "@/components/dashboard/OrganizationChallengeStats";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  Building2, 
  Users,
  MapPin,
  Target,
  Award,
  TrendingUp,
  Plus,
  Heart,
  Sparkles,
  Trophy,
  Leaf,
  Handshake,
  Zap,
  BarChart3,
  Globe2,
  CheckCircle2,
  Edit3
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  type: 'sponsored' | 'created' | 'team_joined';
  participants: number;
  co2_saved: number;
  status: 'active' | 'completed';
  progress: number;
}

interface Partnership {
  id: string;
  name: string;
  type: 'ngo' | 'government' | 'business';
  projects: number;
  impact_score: number;
}

interface ImpactStory {
  id: string;
  type: 'participant' | 'milestone' | 'partnership';
  userName?: string;
  userAvatar?: string;
  challengeTitle: string;
  story: string;
  impact: {
    co2_saved?: number;
    participants?: number;
    achievement?: string;
  };
  date: string;
}

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [mobilizeModalOpen, setMobilizeModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Real data from database
  const [challenges] = useState<Challenge[]>([]);
  const [partnerships] = useState<Partnership[]>([]);

  const [impactStories, setImpactStories] = useState<ImpactStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  
  // Real metrics from database
  const [metrics, setMetrics] = useState({
    totalParticipants: 0,
    activeSponsorships: 0,
    totalCompletions: 0,
    loading: true
  });

  // Load real impact stories from sponsored challenges
  useEffect(() => {
    const loadImpactStories = async () => {
      if (!user || !profile?.organization_id) {
        setLoadingStories(false);
        return;
      }

      try {
        setLoadingStories(true);

        // Get challenges sponsored by this organization
        const { data: sponsorships, error: sponsorshipsError } = await supabase
          .from('challenge_sponsorships')
          .select('challenge_id, created_at')
          .eq('sponsor_organization_id', profile.organization_id)
          .eq('status', 'active');

        if (sponsorshipsError) throw sponsorshipsError;

        if (!sponsorships || sponsorships.length === 0) {
          setImpactStories([]);
          setLoadingStories(false);
          return;
        }

        const challengeIds = sponsorships.map(s => s.challenge_id);

        // Get completions for sponsored challenges with user profiles
        const { data: completions, error: completionsError } = await supabase
          .from('challenge_completions')
          .select(`
            id,
            challenge_id,
            user_id,
            completion_date,
            notes,
            impact_data,
            profiles:user_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .in('challenge_id', challengeIds)
          .eq('validation_status', 'approved')
          .order('completion_date', { ascending: false })
          .limit(10);

        if (completionsError) throw completionsError;

        // Transform completions to impact stories
        const stories: ImpactStory[] = (completions || []).map(completion => {
          const profile = Array.isArray(completion.profiles) 
            ? completion.profiles[0] 
            : completion.profiles;
          
          const impactData = completion.impact_data as any || {};
          const userName = profile 
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
            : 'Névtelen Felhasználó';

          // Get challenge title from challenges data
          const challenge = challenges.find(c => c.id === completion.challenge_id);
          const challengeTitle = challenge?.title || completion.challenge_id;

          return {
            id: completion.id,
            type: 'participant',
            userName,
            userAvatar: profile?.avatar_url || undefined,
            challengeTitle,
            story: completion.notes || `Sikeresen teljesítette a(z) ${challengeTitle} kihívást!`,
            impact: {
              co2_saved: impactData.co2_saved || 0,
              participants: 1
            },
            date: completion.completion_date
          };
        });

        setImpactStories(stories);
      } catch (error) {
        console.error('Error loading impact stories:', error);
        setImpactStories([]);
      } finally {
        setLoadingStories(false);
      }
    };

    loadImpactStories();
  }, [user, profile?.organization_id, challenges]);
  
  // Load real metrics from database
  useEffect(() => {
    const loadMetrics = async () => {
      if (!user || !profile?.organization_id) {
        setMetrics(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Get active sponsorships count
        const { count: sponsorshipsCount, error: sponsorshipsError } = await supabase
          .from('challenge_sponsorships')
          .select('*', { count: 'exact', head: true })
          .eq('sponsor_organization_id', profile.organization_id)
          .eq('status', 'active');

        if (sponsorshipsError) throw sponsorshipsError;

        // Get challenge IDs sponsored by this org
        const { data: sponsorships } = await supabase
          .from('challenge_sponsorships')
          .select('challenge_id')
          .eq('sponsor_organization_id', profile.organization_id)
          .eq('status', 'active');

        const challengeIds = sponsorships?.map(s => s.challenge_id) || [];

        let totalParticipants = 0;
        let totalCompletions = 0;

        if (challengeIds.length > 0) {
          // Get unique participants in sponsored challenges
          const { data: participants, error: participantsError } = await supabase
            .from('challenge_completions')
            .select('user_id')
            .in('challenge_id', challengeIds)
            .eq('validation_status', 'approved');

          if (!participantsError && participants) {
            const uniqueParticipants = new Set(participants.map(p => p.user_id));
            totalParticipants = uniqueParticipants.size;
          }

          // Get total completions count
          const { count: completionsCount, error: completionsError } = await supabase
            .from('challenge_completions')
            .select('*', { count: 'exact', head: true })
            .in('challenge_id', challengeIds)
            .eq('validation_status', 'approved');

          if (!completionsError) {
            totalCompletions = completionsCount || 0;
          }
        }

        setMetrics({
          totalParticipants,
          activeSponsorships: sponsorshipsCount || 0,
          totalCompletions,
          loading: false
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    loadMetrics();
  }, [user, profile?.organization_id]);

  // Redirect if not authenticated or not an organization
  useEffect(() => {
    if (!authLoading && (!user || profile?.user_role === "citizen")) {
      navigate("/dashboard");
    }
  }, [user, profile, authLoading, navigate]);

  // Auto-create organization if user has org name but no org ID
  useEffect(() => {
    const createOrganization = async () => {
      if (!profile || profile.user_role === "citizen" || creatingOrg) return;
      if (profile.organization_id || !profile.organization) return;

      try {
        setCreatingOrg(true);
        console.log("Creating organization:", profile.organization);

        // Create organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: profile.organization,
            type: profile.user_role,
            is_public: true,
          })
          .select()
          .single();

        if (orgError) {
          console.error("Error creating organization:", orgError);
          return;
        }

        // Update profile with organization_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ organization_id: orgData.id })
          .eq('id', profile.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          return;
        }

        console.log("Organization created successfully:", orgData.id);
        window.location.reload(); // Reload to get updated profile
      } catch (error) {
        console.error("Error in organization creation:", error);
      } finally {
        setCreatingOrg(false);
      }
    };

    createOrganization();
  }, [profile, creatingOrg]);

  const getRoleInfo = () => {
    switch (profile?.user_role) {
      case "business":
        return {
          title: t('organization.regional_impact_hub'),
          subtitle: t('organization.corporate_environmental_impact'),
          gradient: "from-accent to-secondary",
          icon: Building2
        };
      case "government":
        return {
          title: t('organization.municipal_impact_hub'), 
          subtitle: t('organization.urban_sustainability_coordination'),
          gradient: "from-warning to-destructive",
          icon: MapPin
        };
      case "ngo":
        return {
          title: t('organization.ngo_impact_hub'),
          subtitle: t('organization.community_environmental_initiatives'), 
          gradient: "from-success to-primary",
          icon: Heart
        };
      default:
        return {
          title: t('organization.regional_impact_hub'),
          subtitle: t('organization.community_sustainability_participation'),
          gradient: "from-primary to-success", 
          icon: Building2
        };
    }
  };

  const getChallengeTypeInfo = (type: Challenge['type']) => {
    switch (type) {
      case 'sponsored':
        return { label: t('organization.sponsored'), color: 'bg-warning', icon: Award };
      case 'created':
        return { label: t('organization.created'), color: 'bg-success', icon: Sparkles };
      case 'team_joined':
        return { label: t('organization.team_participation'), color: 'bg-primary', icon: Users };
    }
  };

  const getPartnershipTypeIcon = (type: Partnership['type']) => {
    switch (type) {
      case 'ngo': return Heart;
      case 'government': return Building2;
      case 'business': return Handshake;
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  // Regional stats - only real data
  const totalParticipants = 0;
  const activeChallenges = 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user || profile?.user_role === "citizen") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 xl:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 xl:mb-16">
          <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 bg-gradient-to-r ${roleInfo.gradient} rounded-2xl shadow-elegant mb-4 sm:mb-6 xl:mb-8`}>
            <RoleIcon className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-4 xl:mb-6">
            {roleInfo.title}
          </h1>
          <p className="text-lg sm:text-xl xl:text-2xl text-muted-foreground max-w-2xl xl:max-w-3xl mx-auto px-4">
            {roleInfo.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Badge className={`bg-gradient-to-r ${roleInfo.gradient} text-white px-3 sm:px-4 py-1.5 sm:py-2`}>
              {profile?.organization || t('organization.organization')}
            </Badge>
          </div>
        </div>

        {/* Regional Impact Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Profilom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-base">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm truncate">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-xs text-primary capitalize">
                  {profile?.user_role === 'business' ? 'Cég' :
                   profile?.user_role === 'government' ? 'Önkormányzat' :
                   profile?.user_role === 'ngo' ? 'Civil szervezet' : profile?.user_role}
                </p>
                {profile?.organization && (
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{profile.organization}</span>
                  </div>
                )}
              </div>
            </div>
            <Link to="/profile" className="block">
              <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-xs">
                <Edit3 className="w-3 h-3 mr-1.5" />
                Profil szerkesztése
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.active_challenges')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{activeChallenges}</p>
              </div>
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.people_reached')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-success">{totalParticipants}</p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.partnerships')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-accent">{partnerships.length}</p>
              </div>
              <Handshake className="w-8 h-8 sm:w-10 sm:h-10 text-accent/60" />
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2 gap-2">
            <TabsTrigger value="overview" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm">
              <Globe2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('organization.overview')}</span>
              <span className="sm:hidden">{t('organization.overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">{t('organization.challenges')}</span>
              <span className="sm:hidden">{t('organization.challenges')}</span>
            </TabsTrigger>
            <TabsTrigger value="partnerships" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm">
              <Handshake className="w-4 h-4" />
              <span className="hidden sm:inline">{t('organization.partnerships')}</span>
              <span className="sm:hidden">{t('organization.partners')}</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">{t('organization.impact_stories')}</span>
              <span className="sm:hidden">{t('organization.stories')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Regional Map Placeholder */}
            <Card className="bg-gradient-to-br from-primary/5 via-success/5 to-warning/5 border-border/50">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center py-12 sm:py-16">
                  <Globe2 className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-primary/40" />
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('organization.regional_impact_map')}</h3>
                  <p className="text-muted-foreground mb-6 px-4">
                    {t('organization.interactive_map_desc')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      <span>{t('organization.sponsored')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      <span>{t('organization.created')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>{t('organization.team_participation')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                className="bg-gradient-primary hover:shadow-glow transition-smooth py-6 text-base"
                onClick={() => setSelectedTab("challenges")}
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('organization.create_new_challenge')}
              </Button>
              <Button 
                variant="outline"
                className="border-warning/50 hover:bg-warning/10 transition-smooth py-6 text-base"
                onClick={() => setSponsorModalOpen(true)}
              >
                <Award className="w-5 h-5 mr-2 text-warning" />
                {t('organization.sponsor_challenge')}
              </Button>
              <Button 
                variant="outline"
                className="border-accent/50 hover:bg-accent/10 transition-smooth py-6 text-base"
                onClick={() => setMobilizeModalOpen(true)}
                disabled={!profile?.organization_id}
              >
                <Users className="w-5 h-5 mr-2 text-accent" />
                {t('organization.mobilize_team')}
              </Button>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">{t('organization.challenge_ecosystem')}</h3>
              <Button 
                className="bg-gradient-primary hover:shadow-glow transition-smooth w-full sm:w-auto"
                onClick={() => setSponsorModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('organization.sponsor_challenge')}
              </Button>
            </div>

            {/* Employee Participation Stats */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t('organization.employee_participation')}
              </h4>
              <OrganizationChallengeStats />
            </div>

            {/* Sponsored & Created Challenges */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                {t('organization.sponsored_challenges')}
              </h4>
            </div>

            <div className="grid gap-4">
              {challenges.map((challenge) => {
                const typeInfo = getChallengeTypeInfo(challenge.type);
                const TypeIcon = typeInfo.icon;
                return (
                  <Card key={challenge.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${typeInfo.color}/20`}>
                              <TypeIcon className={`w-5 h-5 text-${typeInfo.color.replace('bg-', '')}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="text-base sm:text-lg font-semibold text-foreground">{challenge.title}</h4>
                                <Badge className={`${typeInfo.color} text-white text-xs`}>
                                  {typeInfo.label}
                                </Badge>
                            {challenge.status === 'completed' && (
                              <Badge variant="outline" className="text-success border-success">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t('organization.completed')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{challenge.participants} {t('organization.participants')}</span>
                            </span>
                                <span className="flex items-center space-x-1">
                                  <Leaf className="w-4 h-4 text-success" />
                                  <span>{challenge.co2_saved}t CO₂</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">{t('organization.progress')}</span>
                            <span className="font-medium">{challenge.progress}%</span>
                          </div>
                          <Progress value={challenge.progress} className="h-2" />
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto"
                        onClick={() => navigate(`/challenges/${challenge.id}`)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {t('organization.details')}
                      </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Partnerships Tab */}
          <TabsContent value="partnerships" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">{t('organization.community_connections')}</h3>
              <Button className="bg-gradient-primary hover:shadow-glow transition-smooth w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                {t('organization.find_partner')}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {partnerships.map((partner) => {
                const PartnerIcon = getPartnershipTypeIcon(partner.type);
                return (
                  <Card key={partner.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <PartnerIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-foreground mb-1 truncate">{partner.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {partner.type === 'ngo' ? t('organization.ngo_badge') : 
                             partner.type === 'government' ? t('organization.government_badge') : t('organization.business_badge')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{t('organization.joint_projects')}</span>
                          <span className="font-semibold">{partner.projects}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">{t('organization.impact_score')}</span>
                            <span className="font-medium">{partner.impact_score}</span>
                          </div>
                          <Progress value={partner.impact_score} className="h-2" />
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        <Zap className="w-4 h-4 mr-2" />
                        {t('organization.contact')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Impact Stories Tab */}
          <TabsContent value="stories" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('organization.impact_stories')}</h3>
              <p className="text-muted-foreground">
                {t('organization.success_stories_desc')}
              </p>
            </div>

            {/* ESG Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {metrics.loading ? (
                <>
                  <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-success/10 to-success/5">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-success" />
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('common.loading')}</p>
                  </Card>
                  <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('common.loading')}</p>
                  </Card>
                  <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-warning/10 to-warning/5">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-warning" />
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('common.loading')}</p>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-success/10 to-success/5">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                    <p className="text-2xl sm:text-3xl font-bold text-success">{metrics.activeSponsorships}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.active_sponsorships')}</p>
                  </Card>
                  <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{metrics.totalParticipants}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.total_participants')}</p>
                  </Card>
                  <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-warning/10 to-warning/5">
                    <Award className="w-8 h-8 mx-auto mb-2 text-warning" />
                    <p className="text-2xl sm:text-3xl font-bold text-warning">{metrics.totalCompletions}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.total_completions')}</p>
                  </Card>
                </>
              )}
            </div>

            {/* Impact Stories */}
            <div className="space-y-4">
              {loadingStories ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : impactStories.length === 0 ? (
                <Card className="p-8 text-center bg-card/50">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t('organization.no_impact_stories')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('organization.sponsor_challenges_hint')}
                  </p>
                </Card>
              ) : impactStories.map((story) => (
                <Card key={story.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Avatar/Icon */}
                      <div className="flex-shrink-0">
                        {story.type === 'participant' && story.userAvatar ? (
                          <img 
                            src={story.userAvatar} 
                            alt={story.userName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : story.type === 'milestone' ? (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-primary" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                            <Handshake className="w-6 h-6 text-success" />
                          </div>
                        )}
                      </div>

                      {/* Story Content */}
                      <div className="flex-1 space-y-3">
                        <div>
                          {story.userName && (
                            <p className="font-semibold text-foreground">{story.userName}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{story.challengeTitle}</p>
                        </div>
                        
                        <p className="text-foreground">{story.story}</p>

                        {/* Impact Metrics */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          {story.impact.co2_saved && (
                            <div className="flex items-center gap-1">
                              <Leaf className="w-4 h-4 text-success" />
                              <span className="font-medium text-success">{story.impact.co2_saved}kg CO₂</span>
                              <span className="text-muted-foreground">{t('organization.saved')}</span>
                            </div>
                          )}
                          {story.impact.participants && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="font-medium text-primary">{story.impact.participants}</span>
                              <span className="text-muted-foreground">{t('organization.participants')}</span>
                            </div>
                          )}
                          {story.impact.achievement && (
                            <Badge variant="outline" className="text-warning border-warning">
                              <Award className="w-3 h-3 mr-1" />
                              {story.impact.achievement}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {new Date(story.date).toLocaleDateString('hu-HU', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <MobilizeTeamModal 
        open={mobilizeModalOpen} 
        onOpenChange={setMobilizeModalOpen} 
      />
      <OrganizationSponsorModal
        open={sponsorModalOpen}
        onOpenChange={setSponsorModalOpen}
      />
    </div>
  );
};

export default OrganizationDashboard;
