import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import Navigation from "@/components/Navigation";
import { Card3D, FeatureCard3D } from "@/components/ui/card-3d";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Trophy, 
  Target,
  Leaf,
  Recycle,
  Car,
  Utensils,
  UsersIcon,
  Lightbulb,
  Droplets,
  TreePine,
  RotateCcw,
  DollarSign,
  Star,
  Loader2,
  TrendingUp,
  Award,
  Calculator
} from "lucide-react";
import { challenges, Challenge } from "@/data/challenges";
import { enrichChallengesWithSponsors } from "@/services/ChallengeSponsorshipService";

const ChallengesPage = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuth();
  const { t } = useLanguage();
  const { currentProject } = useProject();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>(challenges);
  const [enrichedChallenges, setEnrichedChallenges] = useState<Challenge[]>(challenges);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  // Load sponsorship data (project-specific if project selected)
  useEffect(() => {
    const loadSponsors = async () => {
      setSponsorsLoading(true);
      const enriched = await enrichChallengesWithSponsors(challenges, currentProject?.id);
      setEnrichedChallenges(enriched);
      setSponsorsLoading(false);
    };
    
    loadSponsors();
  }, [currentProject]);

  // Temporarily disable auth check to debug challenges display
  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate("/auth");
  //   }
  // }, [user, loading, navigate]);

  // Filter challenges based on search and filters
  useEffect(() => {
    let filtered = [...enrichedChallenges]; // Use enriched challenges with sponsors

    console.log('Debug - All challenges count:', challenges.length);
    console.log('Debug - Challenges:', challenges);
    console.log('Debug - Search term:', searchTerm);
    console.log('Debug - Selected category:', selectedCategory);
    console.log('Debug - Selected difficulty:', selectedDifficulty);

    if (searchTerm) {
      filtered = filtered.filter(challenge => {
        const title = t(challenge.titleKey);
        const description = t(challenge.descriptionKey);
        console.log('Debug - Checking challenge:', challenge.id, 'Title:', title, 'Desc:', description);
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               description.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(challenge => challenge.category === selectedCategory);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(challenge => challenge.difficulty === selectedDifficulty);
    }

    console.log('Debug - Filtered challenges count:', filtered.length);
    console.log('Debug - Filtered challenges:', filtered);
    setFilteredChallenges(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, t, enrichedChallenges]);

  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case "energy": return <Lightbulb className="w-5 h-5" />;
      case "transport": return <Car className="w-5 h-5" />;
      case "food": return <Utensils className="w-5 h-5" />;
      case "waste": return <Recycle className="w-5 h-5" />;
      case "community": return <UsersIcon className="w-5 h-5" />;
      case "innovation": return <Target className="w-5 h-5" />;
      case "water": return <Droplets className="w-5 h-5" />;
      case "biodiversity": return <TreePine className="w-5 h-5" />;
      case "circular-economy": return <RotateCcw className="w-5 h-5" />;
      case "green-finance": return <DollarSign className="w-5 h-5" />;
      default: return <Leaf className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case "beginner": return "bg-success/20 text-success border-success/30";
      case "intermediate": return "bg-primary/20 text-primary border-primary/30";
      case "advanced": return "bg-warning/20 text-warning border-warning/30";
      case "expert": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getCategoryColor = (category: Challenge['category']) => {
    switch (category) {
      case "energy": return "bg-warning/20 text-warning";
      case "transport": return "bg-primary/20 text-primary";
      case "food": return "bg-success/20 text-success";
      case "waste": return "bg-secondary/20 text-secondary";
      case "community": return "bg-accent/20 text-accent";
      case "innovation": return "bg-primary/20 text-primary";
      case "water": return "bg-info/20 text-info";
      case "biodiversity": return "bg-success/20 text-success";
      case "circular-economy": return "bg-secondary/20 text-secondary";
      case "green-finance": return "bg-warning/20 text-warning";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  const isOrganization = () => {
    return profile && ['business', 'government', 'ngo'].includes(profile.user_role);
  };

  const getButtonText = () => {
    if (!profile) return t('challenges.join_challenge');
    
    if (isOrganization()) {
      return t('challenges.sponsor_challenge');
    }
    
    return t('challenges.join_challenge');
  };

  // Temporarily allow access without authentication
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="flex items-center space-x-2">
  //         <Loader2 className="h-4 w-4 animate-spin text-primary" />
  //         <span className="text-foreground">{t('common.loading')}</span>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return null; // Will redirect to auth
  // }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-8 sm:py-16 lg:py-20 xl:py-24 bg-card/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-6 xl:mb-8">
              {t('nav.challenges')}
            </h1>
            <p className="text-sm sm:text-base lg:text-xl xl:text-2xl text-muted-foreground max-w-3xl xl:max-w-4xl mx-auto mb-6 sm:mb-8 xl:mb-10 px-4">
              {t('challenges.hero_subtitle')}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
                <div className="text-3xl font-bold text-foreground mb-1">{challenges.length}</div>
                <div className="text-muted-foreground">{t('challenges.active_challenges')}</div>
              </Card3D>
              <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {challenges.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
                </div>
                <div className="text-muted-foreground">{t('challenges.total_participants')}</div>
              </Card3D>
              <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {Math.round(challenges.reduce((sum, c) => sum + c.completionRate, 0) / challenges.length)}%
                </div>
                <div className="text-muted-foreground">{t('challenges.average_completion')}</div>
              </Card3D>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Search and Filters */}
        <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-3 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('challenges.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 backdrop-blur-sm"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 bg-background/50 border-border/50">
                <SelectValue placeholder={t('challenges.category_label')} />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">{t('challenges.all_categories')}</SelectItem>
                <SelectItem value="energy">{t('challenges.category.energy')}</SelectItem>
                <SelectItem value="transport">{t('challenges.category.transport')}</SelectItem>
                <SelectItem value="food">{t('challenges.category.food')}</SelectItem>
                <SelectItem value="waste">{t('challenges.category.waste')}</SelectItem>
                <SelectItem value="community">{t('challenges.category.community')}</SelectItem>
                <SelectItem value="innovation">{t('challenges.category.innovation')}</SelectItem>
                <SelectItem value="water">{t('challenges.category.water')}</SelectItem>
                <SelectItem value="biodiversity">{t('challenges.category.biodiversity')}</SelectItem>
                <SelectItem value="circular-economy">{t('challenges.category.circular_economy')}</SelectItem>
                <SelectItem value="green-finance">{t('challenges.category.green_finance')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full lg:w-48 bg-background/50 border-border/50">
                <SelectValue placeholder={t('challenges.difficulty_label')} />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">{t('challenges.all_levels')}</SelectItem>
                <SelectItem value="beginner">{t('challenges.difficulty.beginner')}</SelectItem>
                <SelectItem value="intermediate">{t('challenges.difficulty.intermediate')}</SelectItem>
                <SelectItem value="advanced">{t('challenges.difficulty.advanced')}</SelectItem>
                <SelectItem value="expert">{t('challenges.difficulty.expert')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card3D>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredChallenges.map((challenge, index) => (
            <Card3D 
              key={challenge.id} 
              className="bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all duration-300 hover:shadow-glow hover:scale-105 animate-slide-in-3d"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-2xl ${getCategoryColor(challenge.category)} shadow-premium`}>
                    {getCategoryIcon(challenge.category)}
                  </div>
                  <Badge className={`${getDifficultyColor(challenge.difficulty)} text-xs font-medium px-3 py-1 rounded-full`}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                
                <CardTitle className="text-foreground text-lg leading-tight mb-2">
                  {t(challenge.titleKey)}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                  {t(challenge.descriptionKey)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Challenge Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{t(challenge.durationKey)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>{challenge.pointsReward} {t('challenges.points')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>{challenge.completionRate}% {t('challenges.success')}</span>
                  </div>
                </div>


                {/* Sponsor Badge - Prominent Display */}
                {challenge.sponsor && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (challenge.sponsor?.organizationId) {
                        navigate(`/organization/${challenge.sponsor.organizationId}`);
                      } else if (challenge.sponsor?.sponsorUserId) {
                        navigate(`/profile/${challenge.sponsor.sponsorUserId}`);
                      }
                    }}
                    className="bg-gradient-to-r from-warning/10 to-primary/10 rounded-2xl p-3 border border-warning/30 cursor-pointer hover:border-warning/50 hover:shadow-glow transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-warning/50 shadow-premium">
                        <AvatarImage src={challenge.sponsor.logo || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-warning to-primary text-primary-foreground font-semibold">
                          {challenge.sponsor.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">{t('challenges.sponsored_by')}</div>
                        <div className="text-sm font-semibold text-foreground truncate">{challenge.sponsor.name}</div>
                      </div>
                      <Star className="w-4 h-4 text-warning flex-shrink-0" />
                    </div>
                  </div>
                )}

                {/* Participants Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {challenge.participants_preview.slice(0, 3).map((participant) => (
                      <Avatar key={participant.id} className="w-8 h-8 border-2 border-background shadow-premium">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-success text-primary-foreground">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {challenge.participants > 3 && (
                      <div className="w-8 h-8 rounded-full bg-card border-2 border-background shadow-premium flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-medium">+</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => navigate(`/challenges/${challenge.id}`)}
                  className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300"
                >
                  {getButtonText()}
                </Button>
              </CardContent>
            </Card3D>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <Card3D className="text-center py-16 bg-card/50 backdrop-blur-sm">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">{t('challenges.no_challenges_found')}</h3>
            <p className="text-muted-foreground text-lg">{t('challenges.modify_search')}</p>
          </Card3D>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;