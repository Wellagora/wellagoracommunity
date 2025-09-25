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
      title: "Legjobb gyakorlatok az irodai energiafogyasztás csökkentésre",
      author: "Sarah Chen",
      role: "Business",
      avatar: "SC",
      content: "Gyakorlati tippeket keresek, hogy 30%-kal csökkentsük az irodai energiafogyasztásunkat...",
      replies: 12,
      likes: 24,
      timeAgo: "2 órája",
      category: "Energia"
    },
    {
      id: 2,
      title: "Közösségi kert projekt sikere!",
      author: "Mike Rodriguez",
      role: "Municipal",
      avatar: "MR",
      content: "Városunk éppen befejezte a legnagyobb közösségi kert projektet, szeretném megosztani...",
      replies: 8,
      likes: 45,
      timeAgo: "5 órája",
      category: "Közösség"
    },
    {
      id: 3,
      title: "Fenntartható közlekedési alternatívák",
      author: "Emma Johnson",
      role: "Citizen",
      avatar: "EJ",
      content: "Különböző módokat kutatunk az autófüggőség csökkentésére vidéki területeken...",
      replies: 15,
      likes: 32,
      timeAgo: "1 napja",
      category: "Közlekedés"
    }
  ];

  const successStories = [
    {
      id: 1,
      title: "Hulladékmentes Iroda Eredmény",
      description: "TechCorp 6 hónap alatt 95%-kal csökkentette az irodai hulladékot",
      type: "Business",
      impact: "2.3 tonna hulladék megtakarítva",
      gradient: "from-success/20 to-primary/20"
    },
    {
      id: 2,
      title: "Közösségi Napenergia Kezdeményezés",
      description: "GreenFuture NGO 200 otthont látott el napenergiával",
      type: "NGO",
      impact: "150 MWh tiszta energia",
      gradient: "from-primary/20 to-accent/20"
    },
    {
      id: 3,
      title: "Városi Bicikli Program",
      description: "A város új biciklis rendszere 40%-kal csökkentette a forgalmat",
      type: "Municipal",
      impact: "12 tonna CO₂ megtakarítás",
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
      <section className="relative py-20 bg-gradient-wave overflow-hidden">
        <div className="absolute inset-0 bg-wave-pattern opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              {t('nav.community')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Kapcsolódj, oszd meg tapasztalataidat és működj együtt fenntarthatósági bajnokokkal világszerte
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-success" />
                <span className="text-foreground font-medium">12,847 aktív tag</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-warning" />
                <span className="text-foreground font-medium">45,293 teljesített kihívás</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Community Tabs */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
              <div className="flex space-x-2 mb-6">
                <Button
                  variant={activeTab === "discussions" ? "default" : "outline"}
                  onClick={() => setActiveTab("discussions")}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Beszélgetések</span>
                </Button>
                <Button
                  variant={activeTab === "stories" ? "default" : "outline"}
                  onClick={() => setActiveTab("stories")}
                  className="flex items-center space-x-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Sikertörténetek</span>
                </Button>
              </div>

              {/* New Post Input */}
              <div className="mb-6 p-4 bg-background/50 rounded-2xl border border-border/50">
                <Textarea
                  placeholder="Oszd meg gondolataidat a közösséggel..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-3 bg-transparent border-none resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      📷 Kép
                    </Button>
                    <Button variant="outline" size="sm">
                      📊 Eredmény
                    </Button>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-success">
                    <Send className="w-4 h-4 mr-2" />
                    Küldés
                  </Button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "discussions" && (
                <div className="space-y-6">
                  {discussions.map((discussion, index) => (
                    <Card3D 
                      key={discussion.id} 
                      className="bg-background/50 border border-border/50 p-6 hover:bg-background/70 transition-all duration-300 animate-slide-in-3d"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12 shadow-premium">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground font-semibold">
                            {discussion.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-foreground text-lg">{discussion.title}</h3>
                            <Badge className={`${getRoleColor(discussion.role)} text-xs px-2 py-1 rounded-full`}>
                              {getRoleIcon(discussion.role)}
                              <span className="ml-1">{discussion.category}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {discussion.author} • {discussion.role}
                          </p>
                          <p className="text-foreground mb-4">{discussion.content}</p>
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4" />
                              <span>{discussion.replies} válasz</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{discussion.likes} tetszik</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {successStories.map((story, index) => (
                    <Card3D 
                      key={story.id} 
                      className={`bg-gradient-to-br ${story.gradient} border border-border/50 p-6 animate-slide-in-3d`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <h3 className="font-semibold text-foreground text-lg mb-2">{story.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{story.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-background/50 text-foreground">
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
          <div className="space-y-8">
            {/* Community Stats */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Közösségi Statisztikák</span>
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Aktív Tagok</span>
                  <span className="font-semibold text-foreground">12,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Teljesített Kihívások</span>
                  <span className="font-semibold text-foreground">45,293</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CO₂ Megtakarítás (tonna)</span>
                  <span className="font-semibold text-success">2,156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Részt vevő Városok</span>
                  <span className="font-semibold text-foreground">89</span>
                </div>
              </div>
            </Card3D>

            {/* Top Contributors */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-warning" />
                <span>Top Hozzájárulók</span>
              </h2>
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-background/50 rounded-2xl border border-border/30">
                    <span className="text-xl">{contributor.badge}</span>
                    <Avatar className="w-8 h-8 shadow-premium">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground text-xs">
                        {contributor.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{contributor.points.toLocaleString()} pont</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card3D>

            {/* Quick Actions */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Gyors Műveletek</h2>
              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground shadow-premium hover:shadow-glow transition-all duration-300">
                  Új Beszélgetés Indítása
                </Button>
                <Button variant="outline" className="w-full border-border/50 hover:bg-card/50">
                  Sikertörténet Megosztása
                </Button>
                <Button variant="outline" className="w-full border-border/50 hover:bg-card/50">
                  Helyi Csoportok Keresése
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