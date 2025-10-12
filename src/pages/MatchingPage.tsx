import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  X, 
  User, 
  Building2, 
  MapPin, 
  Users,
  Target,
  Sparkles,
  MessageCircle,
  Calendar,
  Award,
  TrendingUp,
  Globe,
  Leaf,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MatchProfile {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  description: string;
  compatibility: number;
  sustainabilityGoals: string[];
  recentActivity: string;
  avatar: string;
  verified: boolean;
  joinedDate: string;
  impactScore: number;
  sharedInterests: string[];
}

const MatchingPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  
  const regions = [
    { id: "all", name: "Összes régió" },
    { id: "budapest", name: "Budapest" },
    { id: "pest", name: "Pest megye" },
    { id: "debrecen", name: "Debrecen" },
    { id: "szeged", name: "Szeged" },
    { id: "miskolc", name: "Miskolc" },
    { id: "pecs", name: "Pécs" },
    { id: "gyor", name: "Győr" }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Mock profiles for demonstration
  const allProfiles: MatchProfile[] = [
    {
      id: "1",
      name: "GreenTech Solutions",
      type: "business",
      organization: "GreenTech Solutions Kft.",
      location: "Budapest, V. kerület",
      region: "budapest",
      description: "Megújuló energia technológiák fejlesztése és telepítése. Szeretnénk együttműködni helyi közösségekkel a fenntartható energia projektek megvalósításában.",
      compatibility: 92,
      sustainabilityGoals: ["Megújuló energia", "Szén-dioxid csökkentés", "Közösségi projektek"],
      recentActivity: "Új napelemes projekt indítása",
      avatar: "🏢",
      verified: true,
      joinedDate: "2023-08-15",
      impactScore: 2450,
      sharedInterests: ["Energia hatékonyság", "Klímaváltozás", "Technológiai innováció"]
    },
    {
      id: "2", 
      name: "Budapest V. kerület",
      type: "government",
      organization: "Budapest V. kerületi Önkormányzat",
      location: "Budapest, V. kerület",
      region: "budapest",
      description: "Városi fenntarthatósági programok koordinálása. Keresünk partnereket a zöld infrastruktúra fejlesztéséhez és közösségi környezetvédelmi oktatáshoz.",
      compatibility: 88,
      sustainabilityGoals: ["Városi zöld területek", "Közlekedés optimalizálás", "Hulladékcsökkentés"],
      recentActivity: "Kerékpárút bővítési terv",
      avatar: "🏛️",
      verified: true,
      joinedDate: "2023-09-22",
      impactScore: 3200,
      sharedInterests: ["Városi tervezés", "Közösségi programok", "Környezettudatosság"]
    },
    {
      id: "3",
      name: "Zöld Jövő Alapítvány",
      type: "ngo",
      organization: "Zöld Jövő Közhasznú Alapítvány",
      location: "Debrecen, Magyarország", 
      region: "debrecen",
      description: "Környezettudatossági oktatás és közösségi kertészkedés programok. Szervezünk workshopokat és eseményeket a fenntartható életmód népszerűsítésére.",
      compatibility: 85,
      sustainabilityGoals: ["Oktatás", "Közösségi kertek", "Biodiverzitás"],
      recentActivity: "Iskolai környezetoktatási program",
      avatar: "🌱",
      verified: true,
      joinedDate: "2023-07-10",
      impactScore: 1850,
      sharedInterests: ["Oktatás", "Természetvédelem", "Közösségi munkák"]
    },
    {
      id: "4",
      name: "Kovács Anna",
      type: "citizen",
      location: "Szeged, Magyarország",
      region: "szeged",
      description: "Környezetmérnök, aki helyi fenntarthatósági projekteket koordinál. Szeretek közösségi kertekben dolgozni és környezettudatos rendezvényeket szervezni.",
      compatibility: 78,
      sustainabilityGoals: ["Hulladék csökkentés", "Helyi termelés", "Közösségi aktivizmus"],
      recentActivity: "Szomszédsági komposztáló program indítása",
      avatar: "👩‍🔬",
      verified: false,
      joinedDate: "2023-11-03",
      impactScore: 920,
      sharedInterests: ["Kertészkedés", "Hulladékcsökkentés", "DIY projektek"]
    },
    {
      id: "5",
      name: "EcoWaste Kft.",
      type: "business",
      organization: "EcoWaste Hulladékkezelő Kft.",
      location: "Pécs, Magyarország",
      region: "pecs",
      description: "Szelektív hulladékgyűjtés és újrahasznosítás. Segítünk vállalkozásoknak és magánszemélyeknek a körforgásos gazdaság bevezetésében.",
      compatibility: 87,
      sustainabilityGoals: ["Hulladék csökkentés", "Újrahasznosítás", "Körforgásos gazdaság"],
      recentActivity: "Új komposztálási program",
      avatar: "♻️",
      verified: true,
      joinedDate: "2023-06-20",
      impactScore: 2100,
      sharedInterests: ["Hulladékkezelés", "Újrahasznosítás", "Fenntarthatóság"]
    },
    {
      id: "6",
      name: "Győr Green City",
      type: "government",
      organization: "Győr Önkormányzat",
      location: "Győr, Magyarország",
      region: "gyor",
      description: "Zöld város program koordinálása. Törekszünk arra, hogy Győr az ország legzöldebb városa legyen, ehhez keresünk partnereket.",
      compatibility: 91,
      sustainabilityGoals: ["Városi zöldítés", "Energia hatékonyság", "Zöld infrastruktúra"],
      recentActivity: "Új városi park létrehozása",
      avatar: "🌳",
      verified: true,
      joinedDate: "2023-05-12",
      impactScore: 3500,
      sharedInterests: ["Városi tervezés", "Zöld infrastruktúra", "Közösségi részvétel"]
    }
  ];

  const profiles = selectedRegion === "all" 
    ? allProfiles 
    : allProfiles.filter(p => p.region === selectedRegion);

  const currentProfile = profiles[currentIndex];

  const handleLike = () => {
    if (currentProfile) {
      setMatches([...matches, currentProfile.id]);
      if (currentProfile.compatibility > 90) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
    nextProfile();
  };

  const handlePass = () => {
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'citizen': return 'from-primary to-success';
      case 'business': return 'from-accent to-secondary'; 
      case 'government': return 'from-warning to-destructive';
      case 'ngo': return 'from-success to-primary';
      default: return 'from-primary to-success';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'citizen': return <User className="w-4 h-4" />;
      case 'business': return <Building2 className="w-4 h-4" />;
      case 'government': return <MapPin className="w-4 h-4" />;
      case 'ngo': return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'citizen': return t('matching.type.citizen');
      case 'business': return t('matching.type.business');
      case 'government': return t('matching.type.government');
      case 'ngo': return t('matching.type.ngo');
      default: return t('matching.type.user');
    }
  };

  if (!user) {
    return null;
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {t('matching.excellent_work')}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">
            {t('matching.reviewed_profiles').replace('{count}', matches.length.toString())}
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => navigate("/community")}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground px-8 py-3"
            >
              {t('matching.view_community')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('matching.notification_info')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-success rounded-2xl shadow-premium mb-4 sm:mb-6">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            Fenntarthatósági Partnerek
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6 px-4">
            Találd meg a tökéletes együttműködő partnereket a fenntarthatósági céljaid eléréséhez
          </p>
          
          {/* Region Filter */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Régió szerinti szűrés</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {regions.map((region) => (
                <Button
                  key={region.id}
                  variant={selectedRegion === region.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedRegion(region.id);
                    setCurrentIndex(0);
                  }}
                  className="text-xs"
                >
                  {region.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Előrehaladás</span>
              <span>{currentIndex + 1} / {profiles.length}</span>
            </div>
            <Progress value={((currentIndex + 1) / profiles.length) * 100} className="h-2" />
          </div>
        </div>

        {/* Matching Card */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <AnimatePresence mode="wait">
            {currentProfile && (
              <motion.div
                key={currentProfile.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{currentProfile.avatar}</div>
                        <div>
                          <CardTitle className="text-xl mb-1">{currentProfile.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={`bg-gradient-to-r ${getTypeColor(currentProfile.type)} text-white`}>
                              {getTypeIcon(currentProfile.type)}
                              <span className="ml-1">{getTypeLabel(currentProfile.type)}</span>
                            </Badge>
                            {currentProfile.verified && (
                              <Badge variant="secondary" className="bg-success/20 text-success">
                                ✓ {t('matching.verified')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {currentProfile.compatibility}%
                        </div>
                        <div className="text-xs text-muted-foreground">{t('matching.compatibility')}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Organization & Location */}
                    <div className="space-y-2">
                      {currentProfile.organization && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span>{currentProfile.organization}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{currentProfile.location}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-foreground leading-relaxed">
                      {currentProfile.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 bg-background/30 rounded-xl">
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-primary">{currentProfile.impactScore}</div>
                        <div className="text-xs text-muted-foreground">{t('matching.impact_points')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-success">{currentProfile.sharedInterests.length}</div>
                        <div className="text-xs text-muted-foreground">{t('matching.shared_interests')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-accent">
                          {Math.floor((Date.now() - new Date(currentProfile.joinedDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('matching.days_member')}</div>
                      </div>
                    </div>

                    {/* Sustainability Goals */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center text-sm sm:text-base">
                        <Target className="w-4 h-4 mr-2 text-primary" />
                        {t('matching.sustainability_goals')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProfile.sustainabilityGoals.map((goal, index) => (
                          <Badge key={index} variant="outline" className="border-primary/30 text-primary text-xs sm:text-sm">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Shared Interests */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center text-sm sm:text-base">
                        <Sparkles className="w-4 h-4 mr-2 text-success" />
                        {t('matching.shared_interests')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProfile.sharedInterests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="bg-success/20 text-success text-xs sm:text-sm">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="p-3 sm:p-4 bg-accent/5 border border-accent/20 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="font-medium text-foreground text-sm sm:text-base">{t('matching.recent_activity_label')}</span>
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm">{currentProfile.recentActivity}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Celebration Animation */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <div className="bg-gradient-to-r from-primary to-success text-white px-6 sm:px-8 py-4 rounded-2xl shadow-2xl">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl mb-2">🎉</div>
                    <div className="font-bold text-base sm:text-lg">{t('matching.perfect_match')}</div>
                    <div className="text-xs sm:text-sm">90%+ {t('matching.compatibility')}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 sm:gap-8">
          <Button
            onClick={handlePass}
            size="lg"
            variant="outline"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
          </Button>
          
          <Button
            onClick={handleLike}
            size="lg"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 shadow-premium hover:shadow-glow hover:scale-110 transition-all duration-300"
          >
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-muted-foreground text-xs sm:text-sm px-4">
            ❤️ {t('matching.interested')} • ✗ {t('matching.pass')} • {matches.length} {t('matching.partners_selected')}
          </p>
        </div>

        {/* Matches Summary */}
        {matches.length > 0 && (
          <Card className="mt-8 bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-success" />
                  <span className="font-medium text-foreground">
                    {matches.length} partnert kiválasztottál!
                  </span>
                </div>
                <Button variant="outline" size="sm" className="border-success/30 hover:bg-success/10">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Üzenetek
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;