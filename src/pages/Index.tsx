import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import RealTimeAnalytics from "@/components/revolutionary/RealTimeAnalytics";
import StakeholderOrchestration from "@/components/revolutionary/StakeholderOrchestration";
import GuildSystem from "@/components/revolutionary/GuildSystem";
import PredictiveImpactDashboard from "@/components/revolutionary/PredictiveImpactDashboard";
import RegionalOrchestrator2D from "@/components/premium/RegionalOrchestrator2D";
import StakeholderMatcher from "@/components/premium/StakeholderMatcher";
import PredictiveAnalytics from "@/components/premium/PredictiveAnalytics";
import CircularEconomyFlow from "@/components/premium/CircularEconomyFlow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Award,
  Globe,
  Zap,
  Leaf,
  Shield,
  Trophy,
  Building2,
  ArrowRight,
  Activity,
  BarChart3
} from "lucide-react";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Clear Call-to-Action */}
      <div className="container mx-auto px-4 pt-8 pb-16">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Wellagora Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Fenntarthatósági célok elérése közösségi erővel és AI támogatással
          </p>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/challenges">
              <Button size="lg" className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white px-8 py-4 rounded-2xl font-semibold shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300">
                🎯 Kezdj egy Kihívást
              </Button>
            </Link>
            <Link to="/dynamic-regional">
              <Button size="lg" variant="outline" className="border-2 border-primary hover:bg-primary hover:text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300">
                🌍 Fedezd fel Régiódat
              </Button>
            </Link>
          </div>
          
          <Badge variant="secondary" className="bg-primary/20 text-primary px-4 py-2">
            AI-Powered • Valós idejű • Közösségi
          </Badge>
        </motion.div>

        {/* Feature Cards - Simplified */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Personal Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full bg-gradient-to-br from-primary/10 to-success/10 border-primary/20 hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-success rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Személyes Dashboard</CardTitle>
                <p className="text-muted-foreground">Kövesd nyomon a fejlődésedet, gyűjts pontokat és érd el célјайdat gamifikált módon.</p>
              </CardHeader>
              <CardContent>
                <Link to="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90">
                    Dashboard Megnyitása
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Community Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20 hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Közösségi Kihívások</CardTitle>
                <p className="text-muted-foreground">Csatlakozz fenntarthatósági kihívásokhoz és változtasd meg a világot mások mellett.</p>
              </CardHeader>
              <CardContent>
                <Link to="/challenges">
                  <Button className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90">
                    Kihívások Böngészése
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="h-full bg-gradient-to-br from-warning/10 to-destructive/10 border-warning/20 hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-warning to-destructive rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">Haladó Funkciók</CardTitle>
                <p className="text-muted-foreground">3D térképek, AI elemzések és fejlett regionális orchestration.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to="/revolutionary">
                    <Button variant="outline" className="w-full border-warning hover:bg-warning hover:text-warning-foreground">
                      Revolutionary Mode
                    </Button>
                  </Link>
                  <Link to="/dynamic-regional">
                    <Button variant="outline" className="w-full border-success hover:bg-success hover:text-success-foreground">
                      Dynamic Regional
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">2.5M kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Saved</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">245</div>
              <div className="text-sm text-muted-foreground">Partnerships</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">67%</div>
              <div className="text-sm text-muted-foreground">Goal Progress</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;