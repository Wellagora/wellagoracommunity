import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, Search, Gift, Star, ExternalLink, 
  MapPin, ShoppingBag, Leaf, Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MembershipCard from "@/components/partners/MembershipCard";
import PartnerOfferCard from "@/components/partners/PartnerOfferCard";

// All partners data
const ALL_PARTNERS = [
  {
    id: "1",
    name: "Praktiker",
    slug: "praktiker",
    logo: "/partner-logos/praktiker.png",
    category: "DIY & Garden",
    offerCount: 2
  },
  {
    id: "2",
    name: "DM",
    slug: "dm",
    logo: "/partner-logos/dm.png",
    category: "Health & Beauty",
    offerCount: 1
  },
  {
    id: "3",
    name: "Rossmann",
    slug: "rossmann",
    logo: "/partner-logos/rossmann.png",
    category: "Health & Beauty",
    offerCount: 1
  },
  {
    id: "4",
    name: "OBI",
    slug: "obi",
    logo: "/partner-logos/obi.png",
    category: "DIY & Garden",
    offerCount: 0
  },
  {
    id: "5",
    name: "IKEA",
    slug: "ikea",
    logo: "/partner-logos/ikea.png",
    category: "Home & Living",
    offerCount: 0
  },
  {
    id: "6",
    name: "Auchan",
    slug: "auchan",
    logo: "/partner-logos/auchan.png",
    category: "Grocery",
    offerCount: 0
  },
];

const CATEGORIES = ["All", "DIY & Garden", "Health & Beauty", "Grocery", "Home & Living"];

const PartnersPage = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPartners = ALL_PARTNERS.filter((partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || partner.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">
                    {language === "hu" ? "Exkluzív kedvezmények tagjainknak" : "Exclusive discounts for members"}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {language === "hu" ? "Partner Ajánlatok" : "Partner Offers"}
                </h1>
                <p className="text-lg text-white/70">
                  {language === "hu" 
                    ? "Fedezd fel partnereink exkluzív kedvezményeit és használd a tagsági kártyádat az üzletekben!" 
                    : "Discover exclusive discounts from our partners and use your membership card in stores!"}
                </p>
              </motion.div>
            </div>

            {/* Membership Card CTA */}
            <div className="flex justify-center">
              <MembershipCard variant="compact" />
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="py-8 border-b border-border/40 bg-white sticky top-0 z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === "hu" ? "Partner keresése..." : "Search partners..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex-shrink-0"
                  >
                    {category === "All" ? (language === "hu" ? "Összes" : "All") : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Store className="w-6 h-6" />
              {language === "hu" ? "Partnereink" : "Our Partners"}
              <Badge variant="secondary">{filteredPartners.length}</Badge>
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
                    <Card className="h-full hover:shadow-lg transition-all group bg-white border-border/40">
                      <CardContent className="p-6">
                        {/* Logo */}
                        <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-slate-50 border border-border/20 p-4 group-hover:scale-105 transition-transform">
                          <img 
                            src={partner.logo} 
                            alt={partner.name} 
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Info */}
                        <div className="text-center">
                          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                            {partner.name}
                          </h3>
                          <Badge variant="outline" className="text-xs mb-3">
                            {partner.category}
                          </Badge>
                          
                          {partner.offerCount > 0 ? (
                            <div className="flex items-center justify-center gap-1 text-sm text-emerald-600">
                              <Gift className="w-4 h-4" />
                              <span>
                                {partner.offerCount} {language === "hu" ? "ajánlat" : "offer"}
                                {partner.offerCount > 1 && !language.startsWith("hu") ? "s" : ""}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {language === "hu" ? "Hamarosan" : "Coming soon"}
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
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <Leaf className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">
                  {language === "hu" ? "Legyél te is partnerünk!" : "Become our partner!"}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  {language === "hu"
                    ? "Csatlakozz fenntartható közösségünkhöz és mutasd be termékeidet több ezer elkötelezett tagunknak."
                    : "Join our sustainable community and showcase your products to thousands of committed members."}
                </p>
                <Link to="/contact">
                  <Button size="lg" className="bg-black hover:bg-black/90 text-white">
                    {language === "hu" ? "Kapcsolatfelvétel" : "Contact us"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PartnersPage;
