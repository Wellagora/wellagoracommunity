import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { MobilizeTeamModal } from "@/components/dashboard/MobilizeTeamModal";
import { OrganizationSponsorModal } from "@/components/dashboard/OrganizationSponsorModal";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  CheckCircle2
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

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [mobilizeModalOpen, setMobilizeModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Mock data
  const [challenges] = useState<Challenge[]>([
    {
      id: "3",
      title: "Városi Kerékpározás Kihívás",
      type: 'sponsored',
      participants: 234,
      co2_saved: 1.2,
      status: 'active',
      progress: 68
    },
    {
      id: "4",
      title: "Zero Waste Workplace",
      type: 'created',
      participants: 89,
      co2_saved: 0.8,
      status: 'active',
      progress: 45
    },
    {
      id: "energy-saving-home",
      title: "Helyi Étel Hét",
      type: 'team_joined',
      participants: 156,
      co2_saved: 2.3,
      status: 'completed',
      progress: 100
    }
  ]);

  const [partnerships] = useState<Partnership[]>([
    { id: "1", name: "Green Future NGO", type: 'ngo', projects: 3, impact_score: 92 },
    { id: "2", name: "Városi Önkormányzat", type: 'government', projects: 2, impact_score: 85 },
    { id: "3", name: "EcoTech Solutions", type: 'business', projects: 1, impact_score: 78 }
  ]);

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

  // Regional stats
  const totalParticipants = challenges.reduce((sum, c) => sum + c.participants, 0);
  const totalCO2 = challenges.reduce((sum, c) => sum + c.co2_saved, 0);
  const activeChallenges = challenges.filter(c => c.status === 'active').length;
  const regionalRank = 3; // Mock rank

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
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{t('organization.budapest_region')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-warning" />
            <span>#{regionalRank} {t('organization.ranking')}</span>
          </div>
          </div>
        </div>

        {/* Regional Impact Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.co2_savings')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-warning">{totalCO2.toFixed(1)}t</p>
              </div>
              <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-warning/60" />
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
              <Button className="bg-gradient-primary hover:shadow-glow transition-smooth w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                {t('organization.new_challenge')}
              </Button>
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
            <div className="text-center py-12 sm:py-16">
              <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-warning/60" />
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('organization.impact_stories')}</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6 px-4">
                {t('organization.success_stories_desc')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto px-4">
                <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-success/10 to-success/5">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p className="text-2xl sm:text-3xl font-bold text-success">+145%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.brand_engagement')}</p>
                </Card>
                <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl sm:text-3xl font-bold text-primary">12.5K</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.media_reach')}</p>
                </Card>
                <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-warning/10 to-warning/5">
                  <Award className="w-8 h-8 mx-auto mb-2 text-warning" />
                  <p className="text-2xl sm:text-3xl font-bold text-warning">3</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.sustainability_awards')}</p>
                </Card>
              </div>
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
