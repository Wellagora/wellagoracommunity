import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { motion } from "framer-motion";
import { Users, Award, TrendingUp, Trophy, Sparkles, ArrowDown, ChevronRight } from "lucide-react";

import FeaturedChallenges from "@/components/FeaturedChallenges";
import { CommunityImpactCounter } from "@/components/CommunityImpactCounter";
import { StoryOfTheWeek } from "@/components/StoryOfTheWeek";
import { RegionalImpactGarden } from "@/components/RegionalImpactGarden";
import { RegionalImpactMap } from "@/components/dashboard/RegionalImpactMap";
import { StatsBarSkeleton } from "@/components/ui/skeletons";
import Footer from "@/components/Footer";

const Index = () => {
  const { t } = useLanguage();
  const { user, profile, loading } = useAuth();
  
  // Use the centralized hook for community stats
  const { stats: communityStats, loading: statsLoading } = useCommunityStats();
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
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

          {/* 1. SIMPLIFIED HERO - Welcome + Single CTA */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
              <motion.div
                className="max-w-4xl mx-auto text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
                  {t("index.welcome_back")}, {profile.first_name}! 👋
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {t("index.ready_to_make_impact")}
                </p>
                <Link to="/challenges">
                  <Button size="lg" className="min-w-[200px]">
                    {t("index.browse_programs_cta")}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* 2. FEATURED PROGRAMS - Main content, immediately visible */}
          <FeaturedChallenges />

          {/* 3. STORY OF THE WEEK - Compact */}
          <StoryOfTheWeek />

          {/* 4. COMMUNITY STATS - Compact horizontal bar with skeleton */}
          <section className="py-8 bg-card/30">
            <div className="container mx-auto px-4">
              {statsLoading ? (
                <StatsBarSkeleton />
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{communityStats.members}</div>
                      <div className="text-xs text-muted-foreground">{t("index.stat_members")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{communityStats.completions}</div>
                      <div className="text-xs text-muted-foreground">{t("index.stat_completions")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{communityStats.points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{t("index.stat_points")}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 5. REGIONAL IMPACT GARDEN - Smaller */}
          <div className="py-6">
            <RegionalImpactGarden />
          </div>

          {/* 6. REGIONAL MAP - Bottom */}
          <section className="py-8 bg-background">
            <div className="container mx-auto px-4">
              <RegionalImpactMap />
            </div>
          </section>
        </div>

        <Footer />
      </>
    );
  }

  // Non-authenticated user view - Modern landing page
  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        {/* 1. HERO SECTION - Full viewport with hero image */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/lovable-uploads/89cff010-b0aa-4aa1-b97e-999c469cae09.png"
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/40"></div>
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 py-20 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                {t("index.hero_main_title")}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">{t("index.hero_main_subtitle")}</p>
              <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto">{t("index.hero_description")}</p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
                    {t("index.cta_join_now")}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-w-[200px]"
                  onClick={() => {
                    document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t("index.cta_learn_more")}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="h-8 w-8 text-muted-foreground/60" />
          </motion.div>
        </section>

        {/* 2. FEATURES SECTION */}
        <section id="features-section" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("index.features_title")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("index.features_subtitle")}</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1: Challenges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                      <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-center">{t("index.feature_challenges_title")}</h3>
                    <p className="text-muted-foreground mb-6 text-center">{t("index.feature_challenges_desc")}</p>
                    <Link to="/challenges" className="block">
                      <Button variant="outline" className="w-full">
                        {t("index.feature_challenges_btn")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature 2: Community */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6 mx-auto">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-center">{t("index.feature_community_title")}</h3>
                    <p className="text-muted-foreground mb-6 text-center">{t("index.feature_community_desc")}</p>
                    <Link to="/community" className="block">
                      <Button variant="outline" className="w-full">
                        {t("index.feature_community_btn")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature 3: AI Assistant */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 mx-auto">
                      <Sparkles className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-center">{t("index.feature_ai_title")}</h3>
                    <p className="text-muted-foreground mb-6 text-center">{t("index.feature_ai_desc")}</p>
                    <Link to="/ai-assistant" className="block">
                      <Button variant="outline" className="w-full">
                        {t("index.feature_ai_btn")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. IMPACT SECTION */}
        <CommunityImpactCounter />

        {/* 4. AI ASSISTANT PREVIEW SECTION */}
        <section className="py-16 md:py-24 bg-accent/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Left: Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("index.ai_preview_title")}</h2>
                <p className="text-lg text-muted-foreground mb-6">{t("index.ai_preview_desc")}</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{t("index.ai_preview_feature_1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{t("index.ai_preview_feature_2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{t("index.ai_preview_feature_3")}</span>
                  </li>
                </ul>

                <Link to="/ai-assistant">
                  <Button size="lg">
                    {t("index.ai_preview_cta")}
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>

              {/* Right: AI Preview Image/Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png"
                    alt="WellBot AI Assistant"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 bg-card rounded-xl shadow-lg p-4 border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">WellBot AI</p>
                      <p className="text-xs text-muted-foreground">{t("index.ai_preview_badge")}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Story of the Week */}
        <StoryOfTheWeek />

        {/* Featured Challenges */}
        <FeaturedChallenges />

        {/* 5. CTA FOOTER SECTION */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("index.cta_footer_title")}</h2>
              <p className="text-xl text-muted-foreground mb-8">{t("index.cta_footer_subtitle")}</p>

              <Link to="/auth">
                <Button size="lg" className="min-w-[250px] h-14 text-lg">
                  {t("index.cta_footer_button")}
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>

              <p className="text-sm text-muted-foreground mt-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {t("index.cta_footer_social_proof")}
                </Badge>
              </p>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Index;
