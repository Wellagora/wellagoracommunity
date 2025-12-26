import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { challenges } from "@/data/challenges";
import {
  Users,
  Clock,
  Trophy,
  Star,
  MapPin,
  Zap,
  Target,
  Calendar
} from "lucide-react";
import communityImage from "@/assets/community-challenges.jpg";

const ChallengesSection = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();

  const featuredChallenges = challenges.slice(0, 2);

  return (
    <section id="challenges" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-success/10 text-success border-success/20 mb-4">
            <Target className="w-4 h-4 mr-1" />
            {t('challenges.section.badge')}
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            {t('challenges.section.title')}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('challenges.section.subtitle')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('challenges.section.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Featured Challenges */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {t('challenges.featured.title')}
              </h3>
              <Button variant="outline" asChild>
                <Link to="/challenges">{t('challenges.view_all')}</Link>
              </Button>
            </div>
            
            <div className="space-y-6">
              {featuredChallenges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  className="shadow-card hover:shadow-eco transition-smooth ring-2 ring-primary/20"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{t(challenge.titleKey)}</CardTitle>
                          <Badge className="bg-warning/10 text-warning border-warning/20">
                            <Star className="w-3 h-3 mr-1" />
                            {t('challenges.featured')}
                          </Badge>
                        </div>
                        <CardDescription className="text-muted-foreground">
                          {t(challenge.descriptionKey)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{challenge.pointsReward}</div>
                        <div className="text-xs text-muted-foreground">{t('challenges.points')}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Challenge Meta */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {t(challenge.durationKey)}
                      </Badge>
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

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          {challenge.participants.toLocaleString()}
                        </div>
                      </div>
                      {challenge.sponsor && (
                        <div className="text-xs text-muted-foreground">
                          {t('challenges.sponsored_by')} {challenge.sponsor.name}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons based on user role */}
                    <div className="flex gap-2">
                      {/* Join Challenge Button - shown to all authenticated users */}
                      {profile && (
                        <Button 
                          className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth px-3 py-2"
                          asChild
                        >
                          <Link to={`/challenges/${challenge.id}`}>
                            {t('challenges.join_challenge')}
                          </Link>
                        </Button>
                      )}
                      
                      {/* Sponsor Button - shown only to business/ngo/government */}
                      {profile && ['business', 'ngo', 'government'].includes(profile.user_role) && (
                        <Button 
                          variant="outline"
                          className="flex-1 px-3 py-2"
                          asChild
                        >
                          <Link to={`/challenges/${challenge.id}?action=sponsor`}>
                            {t('challenges.sponsor_challenge')}
                          </Link>
                        </Button>
                      )}
                      
                      {/* Not logged in - show generic button */}
                      {!profile && (
                        <Button 
                          className="w-full bg-gradient-primary hover:shadow-glow transition-smooth px-3 py-2"
                          asChild
                        >
                          <Link to={`/challenges/${challenge.id}`}>
                            {t('challenges.view_challenge')}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar - Leaderboard & Community */}
          <div className="space-y-8">
            
            {/* Community Image */}
            <div className="relative">
              <img 
                src={communityImage} 
                alt="Community programs and collaboration" 
                className="w-full h-48 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-bold text-lg">{t('challenges.join_movement')}</h4>
                <p className="text-sm opacity-90">{t('challenges.thousands_daily')}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-6">
                <h4 className="font-bold text-lg mb-4">{t('challenges.regional_impact')}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('challenges.active_programs')}</span>
                    <span className="font-bold text-foreground">197</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('challenges.active_participants')}</span>
                    <span className="font-bold text-foreground">1,245</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('challenges.completed_challenges')}</span>
                    <span className="font-bold text-foreground">3,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('challenges.community_events')}</span>
                    <span className="font-bold text-foreground">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-warning" />
                  {t('challenges.top_performers')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Sarah Chen", points: 2840, badge: "🏆", rank: 1 },
                  { name: "Mike Rodriguez", points: 2650, badge: "🥈", rank: 2 },
                  { name: "Emma Johnson", points: 2420, badge: "🥉", rank: 3 },
                ].map((user) => (
                  <div key={user.rank} className="flex items-center space-x-3">
                    <div className="text-lg">{user.badge}</div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.points} {t('challenges.points')}</div>
                    </div>
                    <Badge variant="outline">#{user.rank}</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  {t('challenges.view_leaderboard')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChallengesSection;