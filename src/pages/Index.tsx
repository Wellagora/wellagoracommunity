import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  Users, 
  BarChart3,
  User,
  Building2,
  Landmark,
  Heart,
  Award,
  TrendingUp,
  Calendar
} from "lucide-react";

import SuccessStories from "@/components/SuccessStories";
import FeaturedChallenges from "@/components/FeaturedChallenges";
import { CommunityImpactCounter } from "@/components/CommunityImpactCounter";
import { StoryOfTheWeek } from "@/components/StoryOfTheWeek";
import { RegionalImpactGarden } from "@/components/RegionalImpactGarden";
import { RegionalImpactMap } from "@/components/dashboard/RegionalImpactMap";
import Footer from "@/components/Footer";

const Index = () => {
  const { t } = useLanguage();
  const { user, profile, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Authenticated user view - Personalized home page
  if (user && profile) {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navigation />
        
        {/* Welcome Hero for Authenticated Users */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 py-12 relative z-10">
            <motion.div 
              className="max-w-4xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                {t('index.welcome_back')}, {profile.first_name}! 👋
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('index.ready_to_make_impact')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Actions for Authenticated Users */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link to="/dashboard">
                  <Card className="h-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{t('nav.dashboard')}</h3>
                      <p className="text-muted-foreground text-sm">{t('index.dashboard_desc_auth')}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link to="/challenges">
                  <Card className="h-full bg-gradient-to-br from-accent/5 to-warning/5 border-accent/20 hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-accent to-warning mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Award className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{t('nav.challenges')}</h3>
                      <p className="text-muted-foreground text-sm">{t('index.challenges_desc_auth')}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link to="/community">
                  <Card className="h-full bg-gradient-to-br from-success/5 to-info/5 border-success/20 hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-success to-info mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{t('nav.community')}</h3>
                      <p className="text-muted-foreground text-sm">{t('index.community_desc_auth')}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link to="/profile">
                  <Card className="h-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{t('nav.profile')}</h3>
                      <p className="text-muted-foreground text-sm">{t('index.profile_desc_auth')}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Community Impact Counter */}
        <CommunityImpactCounter />

        {/* Regional Impact Garden */}
        <RegionalImpactGarden />
        
        {/* Story of the Week */}
        <StoryOfTheWeek />

        {/* Featured Challenges */}
        <FeaturedChallenges />
        
        {/* Success Stories */}
        <SuccessStories />

          {/* Regional Map Preview */}
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <RegionalImpactMap />
            </div>
          </section>
        </div>
        
        <Footer />
      </>
    );
  }

  // Non-authenticated user view - Original landing page
  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
      
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 sm:py-28 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm mb-6">
              {t('index.hero_badge')}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight">
              {t('index.hero_title')}
            </h1>
            <p className="text-lg sm:text-xl xl:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t('index.hero_subtitle')}
            </p>
            
            {/* Role Selection - 4 roles */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link to="/auth?role=citizen">
                  <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-foreground">{t('index.role_citizen')}</h3>
                      <p className="text-muted-foreground text-sm">
                        {t('index.role_citizen_desc')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link to="/auth?role=business">
                  <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-secondary cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-info mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-foreground">{t('index.role_business')}</h3>
                      <p className="text-muted-foreground text-sm">
                        {t('index.role_business_desc')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link to="/auth?role=government">
                  <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-warning cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning to-accent mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Landmark className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-foreground">{t('index.role_government')}</h3>
                      <p className="text-muted-foreground text-sm">
                        {t('index.role_government_desc')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link to="/auth?role=ngo">
                  <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-success cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success to-success-light mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Heart className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-foreground">{t('index.role_ngo')}</h3>
                      <p className="text-muted-foreground text-sm">
                        {t('index.role_ngo_desc')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              {t('index.already_have_account')} <Link to="/auth" className="text-primary hover:underline font-semibold">{t('index.sign_in_link')}</Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{t('index.quick_card_dashboard_title')}</CardTitle>
                  <p className="text-muted-foreground">{t('index.quick_card_dashboard_desc')}</p>
                </CardHeader>
                <CardContent>
                  <Link to="/dashboard">
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                      {t('index.dashboard_open')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-accent/5 to-warning/5 border-accent/20 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-warning rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{t('index.quick_card_programs_title')}</CardTitle>
                  <p className="text-muted-foreground">{t('index.quick_card_programs_desc')}</p>
                </CardHeader>
                <CardContent>
                  <Link to="/challenges">
                    <Button className="w-full bg-gradient-to-r from-accent to-warning hover:from-accent/90 hover:to-warning/90">
                      {t('index.quick_card_programs_btn')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-success/5 to-info/5 border-success/20 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-success to-info rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{t('index.quick_card_community_title')}</CardTitle>
                  <p className="text-muted-foreground">{t('index.quick_card_community_desc')}</p>
                </CardHeader>
                <CardContent>
                  <Link to="/community">
                    <Button className="w-full bg-gradient-to-r from-success to-info hover:from-success/90 hover:to-info/90">
                      {t('index.quick_card_community_btn')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Impact Counter */}
      <CommunityImpactCounter />

      {/* Regional Impact Garden */}
      <RegionalImpactGarden />
      
      {/* Story of the Week */}
      <StoryOfTheWeek />

      {/* Regional Map Preview */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <RegionalImpactMap />
        </div>
        </section>
        
        {/* Featured Challenges */}
        <FeaturedChallenges />
        
        {/* Success Stories */}
        <SuccessStories />
      </div>
      
      <Footer />
    </>
  );
};

export default Index;