import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Store, Search, Gift, Leaf
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MembershipCard from "@/components/partners/MembershipCard";
import SEOHead from "@/components/SEOHead";

// All partners data with Hungarian categories
const ALL_PARTNERS = [
  {
    id: "1",
    name: "Praktiker",
    slug: "praktiker",
    logo: "/partner-logos/praktiker.png",
    categoryKey: "diy_garden",
    offerCount: 2
  },
  {
    id: "2",
    name: "DM",
    slug: "dm",
    logo: "/partner-logos/dm.png",
    categoryKey: "health_beauty",
    offerCount: 1
  },
  {
    id: "3",
    name: "Rossmann",
    slug: "rossmann",
    logo: "/partner-logos/rossmann.png",
    categoryKey: "health_beauty",
    offerCount: 1
  },
  {
    id: "4",
    name: "OBI",
    slug: "obi",
    logo: "/partner-logos/obi.png",
    categoryKey: "diy_garden",
    offerCount: 0
  },
  {
    id: "5",
    name: "IKEA",
    slug: "ikea",
    logo: "/partner-logos/ikea.png",
    categoryKey: "home_living",
    offerCount: 0
  },
  {
    id: "6",
    name: "Auchan",
    slug: "auchan",
    logo: "/partner-logos/auchan.png",
    categoryKey: "grocery",
    offerCount: 0
  },
];

const CATEGORY_KEYS = ["all", "diy_garden", "health_beauty", "grocery", "home_living"];

const PartnersPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Category translations
  const getCategoryLabel = (key: string) => {
    const labels: Record<string, string> = {
      all: t("partners.category_all") || "Összes",
      diy_garden: t("partners.category_diy") || "Barkács & Kert",
      health_beauty: t("partners.category_health") || "Egészség & Szépség",
      grocery: t("partners.category_grocery") || "Élelmiszer",
      home_living: t("partners.category_home") || "Otthon & Lakás"
    };
    return labels[key] || key;
  };

  const filteredPartners = ALL_PARTNERS.filter((partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || partner.categoryKey === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEOHead
        title={t('seo.partners.title')}
        description={t('seo.partners.description')}
      />
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Hero Section - Clean Glassmorphism */}
        <section className="bg-gradient-to-br from-slate-100 via-white to-emerald-50/30 py-16 border-b border-slate-200/60">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200/50 rounded-full px-4 py-2 mb-6 shadow-sm">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-slate-700 font-medium">
                    {t("partners.hero_badge") || "Exkluzív kedvezmények tagjainknak"}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                  {t("partners.hero_title") || "Partner Ajánlatok"}
                </h1>
                <p className="text-lg text-slate-600">
                  {t("partners.hero_subtitle") || "Fedezd fel partnereink exkluzív kedvezményeit és használd a tagsági kártyádat az üzletekben!"}
                </p>
              </motion.div>
            </div>

            {/* Membership Card CTA */}
            <div className="flex justify-center">
              <MembershipCard variant="compact" />
            </div>
          </div>
        </section>

        {/* Search & Filters - Sticky with Glassmorphism */}
        <section className="py-6 border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-16 z-30 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t("partners.search_placeholder") || "Partner keresése..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {CATEGORY_KEYS.map((categoryKey) => (
                  <Button
                    key={categoryKey}
                    variant={selectedCategory === categoryKey ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(categoryKey)}
                    className={`flex-shrink-0 ${
                      selectedCategory === categoryKey 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25" 
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {getCategoryLabel(categoryKey)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900">
              <Store className="w-6 h-6 text-emerald-600" />
              {t("partners.list_title") || "Partnereink"}
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {filteredPartners.length}
              </Badge>
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/partners/${partner.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 group bg-white/80 backdrop-blur-sm border-slate-200/60 hover:border-emerald-300/50 hover:-translate-y-1">
                      <CardContent className="p-6">
                        {/* Logo - Premium styling */}
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white border border-slate-100 p-3 group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-500/10">
                          <img 
                            src={partner.logo} 
                            alt={partner.name} 
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Info */}
                        <div className="text-center">
                          <h3 className="font-semibold text-lg mb-1 text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {partner.name}
                          </h3>
                          <Badge variant="outline" className="text-xs mb-3 bg-slate-50 border-slate-200 text-slate-600">
                            {getCategoryLabel(partner.categoryKey)}
                          </Badge>
                          
                          {partner.offerCount > 0 ? (
                            <div className="flex items-center justify-center gap-1 text-sm text-emerald-600 font-medium">
                              <Gift className="w-4 h-4" />
                              <span>
                                {partner.offerCount} {t("partners.offer_label") || "ajánlat"}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">
                              {t("partners.coming_soon") || "Hamarosan"}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Become a Partner CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-br from-emerald-50/80 to-slate-50 border-emerald-200/50 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900">
                  {t("partners.cta_title") || "Legyél te is partnerünk!"}
                </h2>
                <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                  {t("partners.cta_description") || "Csatlakozz fenntartható közösségünkhöz és mutasd be termékeidet több ezer elkötelezett tagunknak."}
                </p>
                <Link to="/contact">
                  <Button 
                    size="lg" 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                  >
                    {t("partners.cta_button") || "Kapcsolatfelvétel"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default PartnersPage;
