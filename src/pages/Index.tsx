import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { 
  Users, 
  BarChart3,
  Zap
} from "lucide-react";

import CustomerJourney from "@/components/CustomerJourney";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Clear Call-to-Action */}
      <div className="container mx-auto px-4 pt-6 sm:pt-8 pb-12 sm:pb-16">
        <motion.div 
          className="text-center mb-12 sm:mb-16 xl:mb-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 xl:mb-8 px-4">
            {t('index.platform_title')}
          </h1>
          <p className="text-base sm:text-xl xl:text-2xl text-muted-foreground max-w-3xl xl:max-w-4xl mx-auto mb-6 sm:mb-8 xl:mb-10 px-4">
            {t('index.platform_subtitle')}
          </p>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-6 sm:mb-8 px-4">
            <Link to="/challenges" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300">
                {t('index.cta_start_program')}
              </Button>
            </Link>
            <Link to="/community" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-2 border-primary hover:bg-primary hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300">
                {t('index.cta_join_community')}
              </Button>
            </Link>
            <Link to="/regional-hub" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-2 border-primary hover:bg-primary hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300">
                {t('index.cta_explore_region')}
              </Button>
            </Link>
          </div>
          
          <Badge variant="secondary" className="bg-primary/20 text-primary px-4 py-2 text-sm">
            {t('index.badge_features')}
          </Badge>
        </motion.div>

        {/* Feature Cards - Simplified */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16 px-4">
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
                <CardTitle className="text-xl mb-2">{t('index.personal_dashboard')}</CardTitle>
                <p className="text-muted-foreground">{t('index.personal_dashboard_desc')}</p>
              </CardHeader>
              <CardContent>
                <Link to="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90">
                    {t('index.dashboard_open')}
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
                <CardTitle className="text-xl mb-2">{t('index.community_programs')}</CardTitle>
                <p className="text-muted-foreground">{t('index.community_programs_desc')}</p>
              </CardHeader>
              <CardContent>
                <Link to="/challenges">
                  <Button className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90">
                    {t('index.programs_browse')}
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
                <CardTitle className="text-xl mb-2">{t('index.advanced_features')}</CardTitle>
                <p className="text-muted-foreground">{t('index.advanced_features_desc')}</p>
              </CardHeader>
              <CardContent>
                <Link to="/regional-hub">
                  <Button variant="outline" className="w-full border-success hover:bg-success hover:text-success-foreground">
                    {t('index.regional_hub_button')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">15+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('index.stats_active_programs')}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-accent">350+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('index.stats_active_members')}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-success">25</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('index.stats_organizations')}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-secondary">12</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('index.stats_villages')}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Customer Journey Section */}
      <CustomerJourney />
    </div>
  );
};

export default Index;