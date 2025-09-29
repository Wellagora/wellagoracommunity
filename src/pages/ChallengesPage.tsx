import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Award
} from "lucide-react";
import { challenges, Challenge } from "@/data/challenges";

const ChallengesPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>(challenges);

  // Temporarily disable auth check to debug challenges display
  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate("/auth");
  //   }
  // }, [user, loading, navigate]);

  // Filter challenges based on search and filters
  useEffect(() => {
    let filtered = [...challenges]; // Create a copy to avoid mutations

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
  }, [searchTerm, selectedCategory, selectedDifficulty, t]);

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
      <section className="relative py-20 bg-card/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              {t('nav.challenges')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Csatlakozz fenntarthatósági bajnokok ezreihez és valós környezeti hatást érj el gamifikált kihívásokkal.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
                <div className="text-3xl font-bold text-foreground mb-1">{challenges.length}</div>
                <div className="text-muted-foreground">Aktív Kihívások</div>
              </Card3D>
              <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {challenges.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
                </div>
                <div className="text-muted-foreground">Összes Résztvevő</div>
              </Card3D>
              <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {Math.round(challenges.reduce((sum, c) => sum + c.completionRate, 0) / challenges.length)}%
                </div>
                <div className="text-muted-foreground">Átlagos Teljesítés</div>
              </Card3D>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kihívások keresése..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 backdrop-blur-sm"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 bg-background/50 border-border/50">
                <SelectValue placeholder="Kategória" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">Minden Kategória</SelectItem>
                <SelectItem value="energy">Energia</SelectItem>
                <SelectItem value="transport">Közlekedés</SelectItem>
                <SelectItem value="food">Étel</SelectItem>
                <SelectItem value="waste">Hulladék</SelectItem>
                <SelectItem value="community">Közösség</SelectItem>
                <SelectItem value="innovation">Innováció</SelectItem>
                <SelectItem value="water">Víz</SelectItem>
                <SelectItem value="biodiversity">Biodiverzitás</SelectItem>
                <SelectItem value="circular-economy">Körforgásos Gazdaság</SelectItem>
                <SelectItem value="green-finance">Zöld Finanszírozás</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full lg:w-48 bg-background/50 border-border/50">
                <SelectValue placeholder="Nehézség" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">Minden Szint</SelectItem>
                <SelectItem value="beginner">Kezdő</SelectItem>
                <SelectItem value="intermediate">Középhaladó</SelectItem>
                <SelectItem value="advanced">Haladó</SelectItem>
                <SelectItem value="expert">Szakértő</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card3D>

        {/* Challenges Grid - Debug */}
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3>Debug információ:</h3>
          <p>Összes kihívás: {challenges.length}</p>
          <p>Szűrt kihívások: {filteredChallenges.length}</p>
          <p>Keresési szöveg: "{searchTerm}"</p>
          <p>Kategória: {selectedCategory}</p>
          <p>Nehézség: {selectedDifficulty}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <span>{challenge.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>{challenge.pointsReward} pont</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>{challenge.completionRate}% siker</span>
                  </div>
                </div>

                {/* Environmental Impact */}
                <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl p-4 border border-success/20">
                  <div className="text-xs text-muted-foreground mb-2">Környezeti Hatás</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-success font-medium">🌱 {challenge.impact.co2Saved}kg CO₂ megtakarítás</span>
                    <span className="text-primary font-medium">🌳 {challenge.impact.treesEquivalent} fa egyenérték</span>
                  </div>
                </div>

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
                  
                  {challenge.sponsor && (
                    <div className="text-xs text-muted-foreground">
                      Szponzor: {challenge.sponsor.name}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => navigate(`/challenges/${challenge.id}`)}
                  className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300"
                >
                  Csatlakozás a Kihíváshoz
                </Button>
              </CardContent>
            </Card3D>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <Card3D className="text-center py-16 bg-card/50 backdrop-blur-sm">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Nem találhatók kihívások</h3>
            <p className="text-muted-foreground text-lg">Próbáld meg módosítani a keresési feltételeket</p>
          </Card3D>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;