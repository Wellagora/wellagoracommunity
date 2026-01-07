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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {creatorFilter && filteredCreator ? (
            <div className="mb-6">
              <Link to="/piacer">
                <Button variant="ghost" size="sm" className="mb-4">
                  {t("program.back")}
                </Button>
              </Link>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={filteredCreator.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {filteredCreator.first_name?.[0]}
                    {filteredCreator.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {filteredCreator.first_name} {filteredCreator.last_name}
                  </h2>
                  {filteredCreator.expert_title && <p className="text-primary">{String(filteredCreator.expert_title)}</p>}
                  <p className="text-sm text-muted-foreground">
                    {t("marketplace.showing_creator_contents").replace("{{count}}", String(filteredPrograms.length))}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">{t("marketplace.title")}</h1>
              </div>
              <p className="text-muted-foreground">{t("marketplace.subtitle")}</p>
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("marketplace.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-6"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{t(category.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-muted-foreground">
          {filteredPrograms.length} {t("marketplace.showing_results")}
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{t("marketplace.no_results")}</h3>
            <p className="text-muted-foreground mb-6">{t("marketplace.no_results_desc")}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              {t("marketplace.clear_filters")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/piacer/${program.id}`}>
                  <Card className="bg-card border-border/50 rounded-2xl overflow-hidden h-full transition-all duration-300 hover:-translate-y-1 group">
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {program.thumbnail_url || program.image_url ? (
                          <img
                            src={program.thumbnail_url || program.image_url || ""}
                            alt={String(program.title)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div className={program.thumbnail_url || program.image_url ? "hidden" : ""}>
                          <ImagePlaceholder icon={Leaf} />
                        </div>

                        {program.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-amber-500/90 text-white shadow-md">
                            <Star className="w-3 h-3 mr-1" />
                            {t("program.featured")}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {String(program.title)}
                        </h3>

                        {program.creator && (
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="w-6 h-6 border border-white shadow-sm">
                              <AvatarImage src={program.creator.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {program.creator.first_name?.[0]}
                                {program.creator.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {program.creator.first_name} {program.creator.last_name}
                            </span>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{String(program.description || "")}</p>

                        <div className="flex items-end justify-between gap-3">
                          {getAccessBadge(program)}
                          <Button size="sm" variant="secondary">
                            {t("common.view")}
                          </Button>
                        </div>
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
