import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Card3D } from "@/components/ui/card-3d";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  Clock,
  Trophy,
  Star,
  Calendar,
  MapPin,
  Zap,
  Check
} from "lucide-react";
import { Challenge } from "@/data/challenges";
import { loadChallengesFromDatabase } from "@/services/ChallengeSponsorshipService";
import ProgramCardButtons from "@/components/challenges/ProgramCardButtons";
import { ChallengeGridSkeleton } from "@/components/ui/skeletons";
import { useUserChallenges } from "@/hooks/useUserChallenges";

const ChallengesPage = () => {
  const navigate = useNavigate();

  const { user, loading, profile } = useAuth();
  const { t, language } = useLanguage();
  const { isJoined } = useUserChallenges();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  // Load ALL active challenges from database (no project filtering for public page)
  useEffect(() => {
    const loadChallenges = async () => {
      setSponsorsLoading(true);
      // Pass undefined to load ALL active challenges, not filtered by project
      const dbChallenges = await loadChallengesFromDatabase(undefined, language);
      setAllChallenges(dbChallenges);
      setSponsorsLoading(false);
    };
    
    loadChallenges();
  }, [language]);

  // Temporarily disable auth check to debug challenges display
  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate("/auth");
  //   }
  // }, [user, loading, navigate]);

  // Filter challenges based on search
  useEffect(() => {
    let filtered = [...allChallenges];

    if (searchTerm) {
      filtered = filtered.filter(challenge => {
        const title = challenge.titleKey;
        const description = challenge.descriptionKey;
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               description.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredChallenges(filtered);
  }, [searchTerm, allChallenges]);

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
      <section className="relative py-6 sm:py-10 lg:py-12 bg-card/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-4">
              {t('nav.challenges')}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              {t('challenges.hero_subtitle')}
            </p>
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
            
          </div>
        </Card3D>

        
        {/* Show skeleton while loading */}
        {sponsorsLoading ? (
          <ChallengeGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {filteredChallenges.map((challenge, index) => (
            <Card3D 
              key={challenge.id} 
              className="bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all duration-300 hover:shadow-glow hover:scale-105 animate-slide-in-3d overflow-hidden relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Joined Badge */}
              {isJoined(challenge.id) && (
                <Badge 
                  variant="default" 
                  className="absolute top-3 right-3 z-10 bg-success text-success-foreground shadow-lg"
                >
                  <Check className="w-3 h-3 mr-1" />
                  {t('challenges.joined_badge')}
                </Badge>
              )}
              {challenge.imageUrl && (
                <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img 
                    src={challenge.imageUrl} 
                    alt={t(challenge.titleKey)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-base sm:text-lg lg:text-xl leading-tight mb-2 line-clamp-2">
                  {challenge.titleKey}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {challenge.descriptionKey}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Challenge Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{challenge.durationKey}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Trophy className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{challenge.pointsReward} {t('challenges.points')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{challenge.participants.toLocaleString()}</span>
                  </div>
                </div>

                {/* Event Date and Location */}
                {challenge.isContinuous === false && (challenge.startDate || challenge.location) && (
                  <div className="bg-accent/10 rounded-lg p-3 space-y-2 border border-accent/20">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                      <Calendar className="w-3 h-3" />
                      <span>{t('challenges.event_type.scheduled')}</span>
                    </div>
                    {challenge.startDate && (
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{t('challenges.event_starts')}: </span>
                        {new Date(challenge.startDate).toLocaleDateString('hu-HU', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                    {challenge.endDate && (
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{t('challenges.event_ends')}: </span>
                        {new Date(challenge.endDate).toLocaleDateString('hu-HU', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                    {challenge.location && (
                      <div className="flex items-start gap-2 text-sm text-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{challenge.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {challenge.isContinuous !== false && (
                  <div className="bg-success/10 rounded-lg p-3 border border-success/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-success">
                      <Zap className="w-4 h-4" />
                      <span>{t('challenges.event_type.continuous')}</span>
                    </div>
                  </div>
                )}


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

                {/* Action Buttons based on user role and status */}
                <ProgramCardButtons
                  challengeId={challenge.id}
                  isJoined={isJoined(challenge.id)}
                  onNavigate={() => navigate(`/challenges/${challenge.id}`)}
                  onSponsor={() => navigate(`/challenges/${challenge.id}?action=sponsor`)}
                />
              </CardContent>
              </Card3D>
            ))}
          </div>
        )}

        {filteredChallenges.length === 0 && !sponsorsLoading && (
          <Card3D className="text-center py-16 bg-card/50 backdrop-blur-sm">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">{t('challenges.no_challenges_found')}</h3>
            <p className="text-muted-foreground text-lg">{t('challenges.no_programs_yet')}</p>
          </Card3D>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;