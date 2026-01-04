import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { motion } from "framer-motion";
import { Users, Award, TrendingUp, ChevronRight, ArrowDown } from "lucide-react";

import FeaturedEventsGrid from "@/components/FeaturedEventsGrid";
import WorkshopSecretsSlider from "@/components/WorkshopSecretsSlider";
import CTABanner from "@/components/CTABanner";
import { UpcomingEventsSection } from "@/components/events/UpcomingEventsSection";
import { RegionalImpactGarden } from "@/components/RegionalImpactGarden";
import { StoryOfTheWeek } from "@/components/StoryOfTheWeek";
import CreatorLandingSection from "@/components/landing/CreatorLandingSection";
import RegistrationCards from "@/components/landing/RegistrationCards";
import Footer from "@/components/Footer";
import { StatsBarSkeleton } from "@/components/ui/skeletons";

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
          <main className="pt-2 md:pt-4 flex-1">
            {/* 1. SIMPLIFIED HERO - Welcome + Single CTA */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
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
                  <Link to="/piacer">
                    <Button size="lg" className="min-w-[200px] gap-2">
                      {t("index.go_to_marketplace")}
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </section>

            {/* 2. KIEMELT ESEMÉNYEK - Fixed 3-column grid */}
            <FeaturedEventsGrid />

            {/* 3. MŰHELYTITOK AJÁNLÓ - Horizontal slider */}
            <WorkshopSecretsSlider />

            {/* 4. CTA BANNER */}
            <CTABanner />

            {/* 5. KÖZELGŐ ESEMÉNYEK - Timeline list */}
            <UpcomingEventsSection />

            {/* 6. REGIONÁLIS HATÁSKERT */}
            <RegionalImpactGarden />

            {/* 7. COMMUNITY STATS - Compact horizontal bar */}
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
          </main>
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
        <main className="pt-2 md:pt-4 flex-1">
          {/* 1. HERO SECTION - Full viewport with hero image */}
          <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
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
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  {t("landing.hero_title") || "Helyi Szaktudás. Vállalati Támogatás. Közösségi Érték."}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                  {t("landing.hero_subtitle") || "Csatlakozz a regionális tudásmegosztó ökoszisztémához"}
                </p>
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

          {/* 2. REGISTRATION CARDS - 3 Paths */}
          <RegistrationCards />

          {/* 2. KIEMELT ESEMÉNYEK - Fixed 3-column grid */}
          <FeaturedEventsGrid />

          {/* 3. MŰHELYTITOK AJÁNLÓ - Horizontal slider */}
          <WorkshopSecretsSlider />

          {/* 4. CTA BANNER */}
          <CTABanner />

          {/* 5. KÖZELGŐ ESEMÉNYEK */}
          <UpcomingEventsSection />

          {/* 6. REGIONÁLIS HATÁSKERT */}
          <RegionalImpactGarden />

          {/* Story of the Week */}
          <StoryOfTheWeek />

          {/* CREATOR LANDING SECTION */}
          <CreatorLandingSection />
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Index;
