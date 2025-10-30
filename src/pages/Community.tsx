import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Card3D, FeatureCard3D } from "@/components/ui/card-3d";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  MessageCircle, 
  Heart,
  Share2,
  Trophy,
  Target,
  Leaf,
  Building2,
  MapPin,
  User,
  TrendingUp,
  Award,
  Star,
  Send,
  Search,
  Filter,
  Loader2,
  Calendar,
  Eye,
  ThumbsUp
} from "lucide-react";

const Community = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPost, setNewPost] = useState("");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const discussions = [
    {
      id: 1,
      title: t('community.discussion1.title'),
      author: "Sarah Chen",
      role: "Business",
      avatar: "SC",
      content: t('community.discussion1.content'),
      replies: 12,
      likes: 24,
      timeAgo: "2 órája",
      category: t('community.discussion1.category')
    },
    {
      id: 2,
      title: t('community.discussion2.title'),
      author: "Mike Rodriguez",
      role: "Municipal",
      avatar: "MR",
      content: t('community.discussion2.content'),
      replies: 8,
      likes: 45,
      timeAgo: "5 órája",
      category: t('community.discussion2.category')
    },
    {
      id: 3,
      title: t('community.discussion3.title'),
      author: "Emma Johnson",
      role: "Citizen",
      avatar: "EJ",
      content: t('community.discussion3.content'),
      replies: 15,
      likes: 32,
      timeAgo: "1 napja",
      category: t('community.discussion3.category')
    }
  ];

  const successStories = [
    {
      id: 1,
      title: t('community.story1.title'),
      description: t('community.story1.description'),
      type: "Business",
      impact: t('community.story1.impact'),
      gradient: "from-success/20 to-primary/20"
    },
    {
      id: 2,
      title: t('community.story2.title'),
      description: t('community.story2.description'),
      type: "NGO",
      impact: t('community.story2.impact'),
      gradient: "from-primary/20 to-accent/20"
    },
    {
      id: 3,
      title: t('community.story3.title'),
      description: t('community.story3.description'),
      type: "Municipal",
      impact: t('community.story3.impact'),
      gradient: "from-warning/20 to-success/20"
    }
  ];

  const topContributors = [
    { name: "Lisa Wang", points: 2450, avatar: "LW", badge: "🥇" },
    { name: "David Kim", points: 2180, avatar: "DK", badge: "🥈" },
    { name: "Team EcoTech", points: 1920, avatar: "ET", badge: "🥉" },
    { name: "Maria Santos", points: 1850, avatar: "MS", badge: "🏆" },
    { name: "Green Innovators", points: 1720, avatar: "GI", badge: "⭐" }
  ];

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'business': return <Building2 className="w-4 h-4" />;
      case 'municipal': return <MapPin className="w-4 h-4" />;
      case 'citizen': return <User className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'business': return 'bg-primary/20 text-primary';
      case 'municipal': return 'bg-warning/20 text-warning';
      case 'citizen': return 'bg-success/20 text-success';
      default: return 'bg-accent/20 text-accent';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-20 bg-card/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">
              {t('nav.community')}
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6 lg:mb-8">
              {t('community.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                <span className="text-xs sm:text-sm lg:text-base text-foreground font-medium">12,847 {t('community.hero.active_members')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                <span className="text-xs sm:text-sm lg:text-base text-foreground font-medium">45,293 {t('community.hero.completed_challenges')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Community Tabs */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 lg:p-6">
              <div className="flex space-x-2 mb-4 sm:mb-6">
                <Button
                  variant={activeTab === "discussions" ? "default" : "outline"}
                  onClick={() => setActiveTab("discussions")}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{t('community.tabs.discussions')}</span>
                </Button>
                <Button
                  variant={activeTab === "stories" ? "default" : "outline"}
                  onClick={() => setActiveTab("stories")}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t('community.tabs.success_stories')}</span>
                  <span className="sm:hidden">{t('community.tabs.stories_short') || 'Erfolge'}</span>
                </Button>
              </div>

              {/* New Post Input */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-background/50 rounded-xl sm:rounded-2xl border border-border/50">
                <Textarea
                  placeholder={t('community.share_thoughts')}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-3 bg-transparent border-none resize-none text-sm sm:text-base"
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                      📷 <span className="hidden sm:inline ml-1">{t('community.image')}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                      📊 <span className="hidden sm:inline ml-1">{t('community.result')}</span>
                    </Button>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-success w-full sm:w-auto text-xs sm:text-sm">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('community.send')}
                  </Button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "discussions" && (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {discussions.map((discussion, index) => (
                    <Card3D 
                      key={discussion.id} 
                      className="bg-background/50 border border-border/50 p-3 sm:p-4 lg:p-6 hover:bg-background/70 transition-all duration-300 animate-slide-in-3d"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4">
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 shadow-premium flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground font-semibold text-xs sm:text-sm">
                            {discussion.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base lg:text-lg">{discussion.title}</h3>
                            <Badge className={`${getRoleColor(discussion.role)} text-xs px-2 py-0.5 rounded-full w-fit`}>
                              {getRoleIcon(discussion.role)}
                              <span className="ml-1">{discussion.category}</span>
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            {discussion.author} • {discussion.role}
                          </p>
                          <p className="text-xs sm:text-sm lg:text-base text-foreground mb-3 sm:mb-4">{discussion.content}</p>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{discussion.replies} {t('community.replies')}</span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{discussion.likes} {t('community.likes')}</span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{discussion.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card3D>
                  ))}
                </div>
              )}

              {activeTab === "stories" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {successStories.map((story, index) => (
                    <Card3D 
                      key={story.id} 
                      className={`bg-gradient-to-br ${story.gradient} border border-border/50 p-3 sm:p-4 lg:p-6 animate-slide-in-3d`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <h3 className="font-semibold text-foreground text-sm sm:text-base lg:text-lg mb-2">{story.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{story.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-background/50 text-foreground text-xs">
                          {story.type}
                        </Badge>
                        <span className="text-xs font-medium text-success">{story.impact}</span>
                      </div>
                    </Card3D>
                  ))}
                </div>
              )}
            </Card3D>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Community Stats */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 sm:p-5 lg:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-4 sm:mb-5 lg:mb-6 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span>{t('community.stats_title')}</span>
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('community.active_members_stat')}</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">12,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('community.completed_challenges_stat')}</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">45,293</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('community.co2_saved')}</span>
                  <span className="font-semibold text-sm sm:text-base text-success">2,156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('community.participating_cities')}</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">89</span>
                </div>
              </div>
            </Card3D>

            {/* Top Contributors */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 sm:p-5 lg:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-4 sm:mb-5 lg:mb-6 flex items-center space-x-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                <span>{t('community.top_contributors_title')}</span>
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-background/50 rounded-xl sm:rounded-2xl border border-border/30">
                    <span className="text-base sm:text-lg lg:text-xl flex-shrink-0">{contributor.badge}</span>
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shadow-premium flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground text-xs">
                        {contributor.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-xs sm:text-sm truncate">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{contributor.points.toLocaleString()} {t('community.points')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card3D>

            {/* Quick Actions */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 sm:p-5 lg:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-4 sm:mb-5 lg:mb-6">{t('community.quick_actions')}</h2>
              <div className="space-y-2 sm:space-y-3">
                <Button className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground shadow-premium hover:shadow-glow transition-all duration-300 text-xs sm:text-sm">
                  {t('community.start_discussion')}
                </Button>
                <Button variant="outline" className="w-full border-border/50 hover:bg-card/50 text-xs sm:text-sm">
                  {t('community.share_success')}
                </Button>
                <Button variant="outline" className="w-full border-border/50 hover:bg-card/50 text-xs sm:text-sm">
                  {t('community.find_groups')}
                </Button>
              </div>
            </Card3D>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;