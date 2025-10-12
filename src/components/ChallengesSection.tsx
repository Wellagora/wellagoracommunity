import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { challenges } from "@/data/challenges";
import {
  Bike,
  Leaf,
  Recycle,
  Users,
  Clock,
  Trophy,
  Star,
  TrendingUp,
  MapPin,
  Heart,
  Zap,
  Target,
  Lightbulb,
  Droplets,
  TreePine,
  RotateCcw,
  Coins
} from "lucide-react";
import communityImage from "@/assets/community-challenges.jpg";

const ChallengesSection = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const challengeCategories = [
    { name: "Transport", icon: Bike, color: "accent", count: 45 },
    { name: "Energy", icon: Zap, color: "warning", count: 38 },
    { name: "Waste", icon: Recycle, color: "success", count: 52 },
    { name: "Food", icon: Leaf, color: "primary", count: 29 },
    { name: "Community", icon: Users, color: "secondary", count: 33 },
    { name: "Innovation", icon: Lightbulb, color: "accent", count: 21 },
    { name: "Water", icon: Droplets, color: "info", count: 27 },
    { name: "Biodiversity", icon: TreePine, color: "success", count: 19 },
    { name: "Circular Economy", icon: RotateCcw, color: "warning", count: 24 },
    { name: "Green Finance", icon: Coins, color: "primary", count: 16 },
  ];

  // Filter challenges based on category and difficulty
  let filteredChallenges = challenges;
  
  if (selectedCategory) {
    filteredChallenges = filteredChallenges.filter(challenge => 
      challenge.category === selectedCategory
    );
  }
  
  if (selectedDifficulty) {
    filteredChallenges = filteredChallenges.filter(challenge => 
      challenge.difficulty === selectedDifficulty
    );
  }
  
  // Use filtered challenges or all if no filter is applied
  const featuredChallenges = filteredChallenges.length > 0 ? filteredChallenges.slice(0, 2) : challenges.slice(0, 2);

  const difficultyColors = {
    "Beginner": "success",
    "Intermediate": "warning", 
    "Advanced": "destructive"
  };

  const getJoinButtonText = () => {
    if (!profile) return t('challenges.join_challenge');
    
    switch (profile.user_role) {
      case "business":
        return t('challenges.join_and_sponsor');
      case "ngo":
        return t('challenges.join_and_support');
      case "government":
        return t('challenges.join_and_support');
      default:
        return t('challenges.join_challenge');
    }
  };

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

        {/* Challenge Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4 mb-12">
          {challengeCategories.map((category) => (
            <Card 
              key={category.name}
              className={`hover:shadow-eco transition-smooth cursor-pointer group ${
                selectedCategory === category.name.toLowerCase() ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => {
                if (selectedCategory === category.name.toLowerCase()) {
                  setSelectedCategory(null); // Deselect if already selected
                } else {
                  setSelectedCategory(category.name.toLowerCase());
                }
              }}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-${category.color}/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-${category.color}/20 transition-smooth ${
                  selectedCategory === category.name.toLowerCase() ? `bg-${category.color}/30` : ''
                }`}>
                  <category.icon className={`w-6 h-6 text-${category.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} challenges</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Featured Challenges */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {selectedCategory || selectedDifficulty ? t('challenges.filtered') : t('challenges.featured.title')}
              </h3>
              <div className="flex gap-2">
                {(selectedCategory || selectedDifficulty) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedDifficulty(null);
                    }}
                  >
                    {t('challenges.clear_filters')}
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/challenges">{t('challenges.view_all')}</Link>
                </Button>
              </div>
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
                      <Badge variant="outline">{challenge.category}</Badge>
                      <Badge variant="outline">
                        {challenge.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {t(challenge.durationKey)}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{t('challenges.progress')}</span>
                        <span className="text-foreground font-medium">{challenge.completionRate}%</span>
                      </div>
                      <Progress value={challenge.completionRate} className="h-2" />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          {challenge.participants.toLocaleString()}
                        </div>
                        <div className="flex items-center text-success">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {challenge.impact.co2Saved}kg CO₂
                        </div>
                      </div>
                      {challenge.sponsor && (
                        <div className="text-xs text-muted-foreground">
                          {t('challenges.sponsored_by')} {challenge.sponsor.name}
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
                      asChild
                    >
                      <Link to={`/challenges/${challenge.id}`}>
                        {getJoinButtonText()}
                      </Link>
                    </Button>
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
                alt="Community challenges and collaboration" 
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
                    <span className="text-muted-foreground">{t('challenges.active_challenges')}</span>
                    <span className="font-bold text-foreground">197</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('challenges.co2_saved')}</span>
                    <span className="font-bold text-foreground">12.8 {t('common.tons')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('challenges.trees_planted')}</span>
                    <span className="font-bold text-foreground">3,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('challenges.waste_reduced')}</span>
                    <span className="font-bold text-foreground">890 kg</span>
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