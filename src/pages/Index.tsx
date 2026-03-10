import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Sparkles, Calendar, Users, Leaf } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ExpertGallery from "@/components/ExpertGallery";
import FeaturedEventsGrid from "@/components/FeaturedEventsGrid";
import RecommendedProgramsSlider from "@/components/RecommendedProgramsSlider";
import CTABanner from "@/components/CTABanner";
import { CommunityImpactCounter } from "@/components/CommunityImpactCounter";
import { UserProgressBar } from "@/components/gamification/UserProgressBar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { getRoleColors } from "@/lib/roleColors";

/** Welcome tips by role */
const getWelcomeTips = (role: string, language: string) => {
  const tips: Record<string, { icon: typeof Sparkles; hu: string; en: string; de: string }[]> = {
    expert: [
      { icon: Sparkles, hu: 'Hozd létre első programodat a Stúdióban', en: 'Create your first program in the Studio', de: 'Erstelle dein erstes Programm im Studio' },
      { icon: Calendar, hu: 'Szervezz eseményt a közösségednek', en: 'Organize an event for your community', de: 'Organisiere ein Event für deine Community' },
      { icon: Users, hu: 'Építsd ki a szakértői profilodat', en: 'Build your expert profile', de: 'Baue dein Expertenprofil auf' },
    ],
    sponsor: [
      { icon: Leaf, hu: 'Fedezd fel a támogatható programokat', en: 'Discover sponsorable programs', de: 'Entdecke förderbare Programme' },
      { icon: Users, hu: 'Kapcsolódj közösségi szakértőkhöz', en: 'Connect with community experts', de: 'Verbinde dich mit Community-Experten' },
      { icon: Sparkles, hu: 'Állítsd be a támogatói profilodat', en: 'Set up your sponsor profile', de: 'Richte dein Sponsorenprofil ein' },
    ],
    member: [
      { icon: Sparkles, hu: 'Fedezd fel a Piacteret', en: 'Explore the Marketplace', de: 'Entdecke den Marktplatz' },
      { icon: Calendar, hu: 'Csatlakozz egy közösségi eseményhez', en: 'Join a community event', de: 'Nimm an einem Community-Event teil' },
      { icon: Users, hu: 'Ismerd meg a helyi szakértőket', en: 'Meet local experts', de: 'Lerne lokale Experten kennen' },
    ],
  };

  const effectiveRole = ['expert', 'creator'].includes(role) ? 'expert' : ['sponsor', 'business'].includes(role) ? 'sponsor' : 'member';
  const roleTips = tips[effectiveRole] || tips.member;
  return roleTips.map(tip => ({
    icon: tip.icon,
    text: language === 'en' ? tip.en : language === 'de' ? tip.de : tip.hu,
  }));
};

const Index = () => {
  const { t, language } = useLanguage();
  const { user, profile, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  // Detect first-time login (created within last 5 minutes)
  useEffect(() => {
    if (!profile?.created_at) return;
    const createdAt = new Date(profile.created_at).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (createdAt > fiveMinutesAgo) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [profile?.created_at]);

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
    const roleColors = getRoleColors(profile.user_role);
    const welcomeTips = getWelcomeTips(profile.user_role || 'member', language);

    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navigation />

          {/* Welcome overlay for new users */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="fixed inset-x-0 top-20 z-50 flex justify-center px-4"
              >
                <div className={`relative max-w-lg w-full bg-white/90 backdrop-blur-2xl rounded-2xl border ${roleColors.border} shadow-[0_16px_64px_rgba(0,0,0,0.12)] p-6`}>
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <div className="text-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className={`w-12 h-12 rounded-xl ${roleColors.bgLight} flex items-center justify-center mx-auto mb-3`}
                    >
                      <Sparkles className={`w-6 h-6 ${roleColors.text}`} />
                    </motion.div>
                    <h2 className="text-xl font-bold text-foreground">
                      {language === 'hu' ? `Üdvözlünk, ${profile.first_name}!` :
                       language === 'de' ? `Willkommen, ${profile.first_name}!` :
                       `Welcome, ${profile.first_name}!`}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'hu' ? 'Íme néhány tipp az induláshoz:' :
                       language === 'de' ? 'Hier sind ein paar Tipps zum Start:' :
                       'Here are a few tips to get started:'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {welcomeTips.map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/60"
                      >
                        <tip.icon className={`w-4 h-4 ${roleColors.text} flex-shrink-0`} />
                        <span className="text-sm text-foreground">{tip.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="pt-2 md:pt-4 flex-1">
            {/* 1. SIMPLIFIED HERO - Welcome + Single CTA */}
            <section className="relative overflow-hidden bg-background/80 backdrop-blur-xl border-b border-border/50">
              <div className="container mx-auto px-4 py-6 sm:py-10 relative z-10">
                <motion.div
                  className="max-w-4xl mx-auto text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 tracking-tight">
                    {t("index.welcome_back")}, {profile.first_name}! 👋
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    {t("index.post_login_headline")}
                  </p>
                  <Link to="/community">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button size="lg" className="min-w-[200px] gap-2">
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

                {/* Progress card — below welcome text */}
                <div className="max-w-md mx-auto mt-6">
                  <UserProgressBar />
                </div>
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

        <Footer />
      </>
    );
  }

  // Non-authenticated user view - Modern landing page
  return (
    <>
      <SEOHead />
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

          {/* 5. COMMUNITY PULSE - After recommended programs */}
          <CommunityImpactCounter />
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Index;
