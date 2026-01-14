import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Apple,
  BookOpen,
  Briefcase,
  Gift,
  Grid,
  Heart,
  Leaf,
  Search,
  ShoppingCart,
  Star,
  Store,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  MOCK_PROGRAMS,
  getMockExpertById,
  getLocalizedExpertName,
  getLocalizedSponsorName,
  formatPriceByLanguage,
} from "@/data/mockData";

const CATEGORIES = [
  { id: "all", labelKey: "marketplace.all_categories", icon: Grid },
  { id: "sustainability", labelKey: "marketplace.category_sustainability", icon: Leaf },
  { id: "workshop", labelKey: "marketplace.category_workshop", icon: BookOpen },
  { id: "gastronomy", labelKey: "marketplace.category_gastronomy", icon: Apple },
  { id: "community", labelKey: "marketplace.category_community", icon: Users },
  { id: "wellness", labelKey: "marketplace.category_wellness", icon: Heart },
  { id: "business", labelKey: "marketplace.category_business", icon: Briefcase },
];

const ImagePlaceholder = ({ icon: Icon }: { icon: typeof Leaf }) => (
  <div className="w-full h-full flex items-center justify-center bg-muted">
    <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur flex items-center justify-center shadow-sm border border-border/50">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
  </div>
);

const ProgramsListingPage = () => {
  const { t, language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // HARD ENFORCEMENT: marketplace shows ONLY mock programs
  const creatorFilter = searchParams.get("creator");

  const programs = useMemo(() => {
    return MOCK_PROGRAMS.map((mp) => {
      const creator = getMockExpertById(mp.creator_id);
      const localizedCreatorName = creator ? getLocalizedExpertName(creator, language) : null;
      const localizedSponsorName = getLocalizedSponsorName(mp, language);

      return {
        id: mp.id,
        title: getLocalizedField(mp as unknown as Record<string, unknown>, "title"),
        description: getLocalizedField(mp as unknown as Record<string, unknown>, "description"),
        image_url: mp.image_url,
        thumbnail_url: mp.thumbnail_url,
        access_level: mp.access_level,
        access_type: mp.access_type,
        price_huf: mp.price_huf,
        category: mp.category,
        is_featured: mp.is_featured,
        creator_id: mp.creator_id,
        is_sponsored: mp.is_sponsored,
        sponsor_name: localizedSponsorName,
        creator: creator && localizedCreatorName ? {
          id: creator.id,
          first_name: localizedCreatorName.firstName,
          last_name: localizedCreatorName.lastName,
          avatar_url: creator.avatar_url,
        } : null,
      };
    });
  }, [getLocalizedField, language]);

  const filteredCreator = useMemo(() => {
    if (!creatorFilter) return null;
    const c = getMockExpertById(creatorFilter);
    if (!c) return null;
    const n = getLocalizedExpertName(c, language);
    return {
      id: c.id,
      first_name: n.firstName,
      last_name: n.lastName,
      avatar_url: c.avatar_url,
      expert_title: getLocalizedField(c as unknown as Record<string, unknown>, "expert_title"),
    };
  }, [creatorFilter, getLocalizedField, language]);

  const filteredPrograms = useMemo(() => {
    const base = creatorFilter ? programs.filter((p) => p.creator_id === creatorFilter) : programs;

    return base.filter((program) => {
      const matchesSearch =
        !searchQuery ||
        String(program.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(program.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || program.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [creatorFilter, programs, searchQuery, selectedCategory]);

  const getAccessBadge = (program: (typeof programs)[number]) => {
    const priceInfo = formatPriceByLanguage(program.price_huf || 0, language);
    const sponsorLabel = language === 'de' ? 'Gesponsert von' : language === 'en' ? 'Sponsored by' : 'Támogató';
    
    // SINGLE elegant badge for sponsored content
    if (program.is_sponsored && program.sponsor_name) {
      return (
        <div className="flex flex-col gap-1">
          <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs font-medium">
            {sponsorLabel}: {program.sponsor_name}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">{language === 'hu' ? '0 Ft' : '0 €'}</span>
            {program.price_huf > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {priceInfo.originalPrice}
              </span>
            )}
          </div>
        </div>
      );
    }

    if (program.price_huf > 0) {
      return (
        <Badge className="bg-accent text-accent-foreground border-0 text-xs">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {priceInfo.price}
        </Badge>
      );
    }

    return <Badge className="bg-secondary text-secondary-foreground border-0 text-xs">{t("marketplace.open_content")}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="container mx-auto px-4 py-12">
        {/* Sticky Header - Ultra Minimalist */}
        <div className="sticky top-16 z-40 -mx-4 px-4 py-4 mb-8 bg-[#F8F9FA]/95 backdrop-blur-md border-b border-black/5">
          {creatorFilter && filteredCreator ? (
            <div>
              <Link to="/piacer">
                <Button variant="ghost" size="sm" className="mb-4">
                  {t("program.back")}
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-black/10">
                  <AvatarImage src={filteredCreator.avatar_url || undefined} />
                  <AvatarFallback className="bg-black/5 text-black text-lg font-serif">
                    {filteredCreator.first_name?.[0]}
                    {filteredCreator.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    {filteredCreator.first_name} {filteredCreator.last_name}
                  </h2>
                  {filteredCreator.expert_title && (
                    <p className="text-sm text-black/50">{String(filteredCreator.expert_title)}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">{t("marketplace.title")}</h1>
              </div>
              <p className="text-black/50 text-base max-w-2xl">{t("marketplace.subtitle")}</p>
            </motion.div>
          )}
        </div>

        {/* Search - Glassmorphism */}
        <motion.div 
          className="relative mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
          <Input
            type="text"
            placeholder={t("marketplace.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-14 py-7 text-base bg-white/80 backdrop-blur-xl border-black/[0.05] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] focus:shadow-[0_12px_48px_rgba(0,0,0,0.08)] focus:border-black/[0.1] transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-black/30 hover:text-black/60 transition-colors rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </motion.div>

        {/* Categories - Pill Style */}
        <motion.div 
          className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
                    : "bg-white/80 backdrop-blur-sm border border-black/[0.05] text-black/60 hover:border-black/[0.15] hover:text-black hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{t(category.labelKey)}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Results Count */}
        <motion.div 
          className="mb-8 text-sm tracking-wide text-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="font-medium text-black">{filteredPrograms.length}</span> {t("marketplace.showing_results")}
        </motion.div>

        {/* Programs Grid - Ultra Minimalist Salesforce AI Style */}
        {filteredPrograms.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-black/[0.03] flex items-center justify-center">
              <Search className="w-12 h-12 text-black/20" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">{t("marketplace.no_results")}</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t("marketplace.no_results_desc")}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              {t("marketplace.clear_filters")}
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <Link to={`/piacer/${program.id}`} className="block group">
                  <Card className="overflow-hidden h-full">
                    <CardContent className="p-0">
                      {/* Image with overlay */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-black/[0.02] to-black/[0.06] relative overflow-hidden">
                        {program.thumbnail_url || program.image_url ? (
                          <img
                            src={program.thumbnail_url || program.image_url || ""}
                            alt={String(program.title)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div className={program.thumbnail_url || program.image_url ? "hidden" : ""}>
                          <ImagePlaceholder icon={Leaf} />
                        </div>

                        {/* Featured badge - Monochrome */}
                        {program.is_featured && (
                          <div className="absolute top-4 left-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-medium tracking-wide uppercase">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ultra-Minimal Content */}
                      <div className="p-6">
                        {/* Category - Uppercase, tiny, spaced out */}
                        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-black/40 mb-3 block">
                          {program.category || "Program"}
                        </span>
                        
                        {/* Title - Serif font */}
                        <h3 className="font-serif text-xl font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-black transition-colors duration-300">
                          {String(program.title)}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsListingPage;
