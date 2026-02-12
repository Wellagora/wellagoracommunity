import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ExpertGallery from "@/components/ExpertGallery";
import FeaturedEventsGrid from "@/components/FeaturedEventsGrid";
import RecommendedProgramsSlider from "@/components/RecommendedProgramsSlider";
import CTABanner from "@/components/CTABanner";
import { CommunityImpactCounter } from "@/components/CommunityImpactCounter";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  const { t } = useLanguage();
  const { user, profile, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
        <div className="min-h-screen bg-white flex flex-col">
          <main className="pt-2 md:pt-4 flex-1">
            {/* 1. SIMPLIFIED HERO - Welcome + Single CTA */}
            <section className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-b border-black/5">
              <div className="container mx-auto px-4 py-6 sm:py-10 relative z-10">
                <motion.div
                  className="max-w-4xl mx-auto text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 tracking-tight">
                    {t("index.welcome_back")}, {profile.first_name}! 👋
                  </h1>
                  <p className="text-base sm:text-lg text-black/50 mb-6 max-w-2xl mx-auto">
                    {t("index.post_login_headline")}
                  </p>
                  <Link to="/community">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button size="lg" className="min-w-[200px] gap-2 bg-black hover:bg-black/90 text-white">
                        {t("index.post_login_primary_cta")}
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </Link>

                  <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                    <Link to="/community">
                      <Button variant="outline" size="sm" className="min-w-[200px]">
                        {t("index.post_login_secondary_ask")}
                      </Button>
                    </Link>
                    <Link to="/piacer">
                      <Button variant="outline" size="sm" className="min-w-[200px]">
                        {t("index.post_login_secondary_browse")}
                      </Button>
                    </Link>
                  </div>
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

            {/* 5. COMMUNITY IMPACT - Avatar Stack + Notification Stream */}
            <CommunityImpactCounter />
          </main>
        </div>

      </>
    );
  }

  // Non-authenticated user view - Modern landing page
  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-white flex flex-col">
        <main className="flex-1">
          {/* 1. HERO SECTION - Full viewport with integrated registration cards */}
          <HeroSection />

          {/* 2. SZAKÉRTŐI ARCKÉPCSARNOK - Expert Portrait Gallery */}
          <ExpertGallery />

          {/* 3. KIEMELT ESEMÉNYEK - Fixed 3-column grid */}
          <FeaturedEventsGrid />

          {/* 4. AJÁNLOTT PROGRAMOK - Horizontal slider */}
          <RecommendedProgramsSlider />

          {/* 5. COMMUNITY PULSE - After recommended programs */}
          <CommunityImpactCounter />
        </main>
      </div>

    </>
  );
};

export default Index;