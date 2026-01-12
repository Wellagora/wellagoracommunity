import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityStats, DEMO_SPONSORS_COUNT } from "@/hooks/useCommunityStats";
import { DEMO_STATS } from "@/data/mockData";
import { motion } from "framer-motion";
import { Users, Award, TrendingUp, Heart, ChevronRight } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ExpertGallery from "@/components/ExpertGallery";
import FeaturedEventsGrid from "@/components/FeaturedEventsGrid";
import RecommendedProgramsSlider from "@/components/RecommendedProgramsSlider";
import CTABanner from "@/components/CTABanner";
import { UpcomingEventsSection } from "@/components/events/UpcomingEventsSection";
import { RegionalImpactGarden } from "@/components/RegionalImpactGarden";
import Footer from "@/components/Footer";
import { StatsBarSkeleton } from "@/components/ui/skeletons";

const Index = () => {
  const { t } = useLanguage();
  const { user, profile, loading, isDemoMode } = useAuth();
  
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
            <section className="relative overflow-hidden bg-[#F5F5F7]">
              <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
                <motion.div
                  className="max-w-4xl mx-auto text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                    {t("index.welcome_back")}, {profile.first_name}! 👋
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                    {t("index.ready_to_make_impact")}
                  </p>
                  <Link to="/piacer">
                    <Button size="lg" className="min-w-[200px] gap-2 bg-[#007AFF] hover:bg-[#0056b3] text-white">
                      {t("index.go_to_marketplace")}
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </section>

            {/* 2. SZAKÉRTŐI ARCKÉPCSARNOK - Expert Portrait Gallery */}
            <ExpertGallery />

            {/* 3. KIEMELT ESEMÉNYEK - Fixed 3-column grid */}
            <FeaturedEventsGrid />

            {/* 3. AJÁNLOTT PROGRAMOK - Horizontal slider */}
            <RecommendedProgramsSlider />

            {/* 4. CTA BANNER */}
            <CTABanner />

            {/* 5. KÖZELGŐ ESEMÉNYEK - Timeline list */}
            <UpcomingEventsSection />

            {/* 6. REGIONÁLIS HATÁSKERT */}
            <RegionalImpactGarden />

            {/* 7. COMMUNITY STATS - Compact horizontal bar */}
            <section className="py-8 bg-[#F5F5F7]">
              <div className="container mx-auto px-4">
                {statsLoading && !isDemoMode ? (
                  <StatsBarSkeleton />
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          {isDemoMode ? DEMO_STATS.members : communityStats.members}
                        </div>
                        <div className="text-xs text-slate-600">{t("index.stat_members")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          {isDemoMode ? DEMO_STATS.sponsors : DEMO_SPONSORS_COUNT}
                        </div>
                        <div className="text-xs text-slate-600">{t("index.stat_sponsors")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          {isDemoMode ? DEMO_STATS.completions : communityStats.completions}
                        </div>
                        <div className="text-xs text-slate-600">{t("index.stat_completions")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          {isDemoMode ? DEMO_STATS.points.toLocaleString() : communityStats.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-600">{t("index.stat_points")}</div>
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
        <main className="flex-1">
          {/* 1. HERO SECTION - Full viewport with integrated registration cards */}
          <HeroSection />

          {/* 2. SZAKÉRTŐI ARCKÉPCSARNOK - Expert Portrait Gallery */}
          <ExpertGallery />

          {/* 3. KIEMELT ESEMÉNYEK - Fixed 3-column grid */}
          <FeaturedEventsGrid />

          {/* 4. AJÁNLOTT PROGRAMOK - Horizontal slider */}
          <RecommendedProgramsSlider />
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Index;