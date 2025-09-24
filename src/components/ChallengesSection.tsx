import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
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
  Target
} from "lucide-react";
import communityImage from "@/assets/community-challenges.jpg";

const ChallengesSection = () => {
  const challengeCategories = [
    { name: "Transport", icon: Bike, color: "accent", count: 45 },
    { name: "Energy", icon: Zap, color: "warning", count: 38 },
    { name: "Waste", icon: Recycle, color: "success", count: 52 },
    { name: "Food", icon: Leaf, color: "primary", count: 29 },
    { name: "Community", icon: Users, color: "secondary", count: 33 },
  ];

  const featuredChallenges = [
    {
      id: 1,
      title: "Bike to Work Week",
      description: "Replace car trips with cycling for a full week",
      category: "Transport",
      difficulty: "Intermediate",
      duration: "7 days",
      participants: 1247,
      points: 150,
      impact: "Save 25kg CO₂",
      progress: 68,
      sponsor: "EcoTech Solutions",
      featured: true
    },
    {
      id: 2,
      title: "Zero Waste Lunch Challenge",
      description: "Pack waste-free lunches for 5 consecutive days",
      category: "Waste",
      difficulty: "Beginner",
      duration: "5 days",
      participants: 892,
      points: 100,
      impact: "Reduce 2kg waste",
      progress: 45,
      sponsor: "Green Future Corp",
      featured: false
    },
    {
      id: 3,
      title: "Community Garden Project",
      description: "Help establish or maintain a local community garden",
      category: "Community",
      difficulty: "Advanced",
      duration: "1 month",
      participants: 234,
      points: 300,
      impact: "+50 plants grown",
      progress: 12,
      sponsor: "Urban Seeds NGO",
      featured: true
    }
  ];

  const difficultyColors = {
    "Beginner": "success",
    "Intermediate": "warning", 
    "Advanced": "destructive"
  };

  return (
    <section id="challenges" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-success/10 text-success border-success/20 mb-4">
            <Target className="w-4 h-4 mr-1" />
            Challenge Marketplace
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Take Action with{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Gamified Challenges
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose from hundreds of sustainability challenges, earn points and badges, 
            compete with your community, and make a real environmental impact.
          </p>
        </div>

        {/* Challenge Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {challengeCategories.map((category) => (
            <Card 
              key={category.name}
              className="hover:shadow-eco transition-smooth cursor-pointer group"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-${category.color}/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-${category.color}/20 transition-smooth`}>
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
              <h3 className="text-2xl font-bold text-foreground">Featured Challenges</h3>
              <Button variant="outline">View All Challenges</Button>
            </div>
            
            <div className="space-y-6">
              {featuredChallenges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  className={`shadow-card hover:shadow-eco transition-smooth ${challenge.featured ? 'ring-2 ring-primary/20' : ''}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          {challenge.featured && (
                            <Badge className="bg-warning/10 text-warning border-warning/20">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-muted-foreground">
                          {challenge.description}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{challenge.points}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Challenge Meta */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{challenge.category}</Badge>
                      <Badge 
                        className={`bg-${difficultyColors[challenge.difficulty]}/10 text-${difficultyColors[challenge.difficulty]} border-${difficultyColors[challenge.difficulty]}/20`}
                      >
                        {challenge.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {challenge.duration}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-medium">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
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
                          {challenge.impact}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sponsored by {challenge.sponsor}
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
                      asChild
                    >
                      <Link to={`/challenge/${challenge.id}`}>
                        Join Challenge
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
                <h4 className="font-bold text-lg">Join the Movement</h4>
                <p className="text-sm opacity-90">Thousands taking action daily</p>
              </div>
            </div>

            {/* Quick Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-6">
                <h4 className="font-bold text-lg mb-4">Regional Impact</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/80">Active Challenges</span>
                    <span className="font-bold">197</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">CO₂ Saved This Month</span>
                    <span className="font-bold">12.8 tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Trees Planted</span>
                    <span className="font-bold">3,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Waste Reduced</span>
                    <span className="font-bold">890 kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-warning" />
                  Top Performers
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
                      <div className="text-sm text-muted-foreground">{user.points} points</div>
                    </div>
                    <Badge variant="outline">#{user.rank}</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View Full Leaderboard
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