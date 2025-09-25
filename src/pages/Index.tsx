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
      
      {/* Main Dashboard Layout */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground hover:text-primary transition-all duration-300 mb-4">
            Wellagora Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionary sustainability orchestration for the future of regional collaboration
          </p>
          <Badge variant="secondary" className="mt-4 bg-primary/20 text-primary">
            AI-Powered • Real-time Analytics • 3D Visualization
          </Badge>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[800px]">
          {/* Left Column - Analytics & Controls */}
          <div className="lg:col-span-3 space-y-6">
            {/* Real-Time Analytics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    Live Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RealTimeAnalytics />
                </CardContent>
              </Card>
            </motion.div>

            {/* Stakeholder Orchestration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-accent" />
                    AI Matching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StakeholderOrchestration />
                </CardContent>
              </Card>
            </motion.div>

            {/* Guild System */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-success/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-success" />
                    Guild System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GuildSystem />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Center Column - 3D Regional Map */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="h-full bg-card/90 backdrop-blur-sm border-2 border-primary/30 shadow-glow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    <Globe className="w-6 h-6 text-primary" />
                    3D Regional Sustainability Map
                    <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                      LIVE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <RegionalOrchestrator2D />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Predictions & Economy */}
          <div className="lg:col-span-3 space-y-6">
            {/* Predictive Impact Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-warning/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-warning" />
                    Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PredictiveImpactDashboard />
                </CardContent>
              </Card>
            </motion.div>

            {/* Circular Economy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-secondary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Leaf className="w-5 h-5 text-secondary" />
                    Circular Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CircularEconomyFlow />
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/challenges">
                    <Button variant="outline" className="w-full justify-between" size="sm">
                      View Challenges
                      <Target className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/community">
                    <Button variant="outline" className="w-full justify-between" size="sm">
                      Join Community
                      <Users className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full justify-between" size="sm">
                      My Dashboard
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/revolutionary-dashboard">
                    <Button className="w-full justify-between bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" size="sm">
                      Revolutionary Mode
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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