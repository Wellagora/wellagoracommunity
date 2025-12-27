import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Search,
  X,
  Grid,
  Leaf,
  Heart,
  Users,
  Flower2,
  Apple,
  Sun,
  Crown,
  ShoppingCart,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import StarRating from "@/components/reviews/StarRating";

const CATEGORIES = [
  { id: "all", labelKey: "marketplace.all_categories", icon: Grid },
  { id: "sustainability", labelKey: "marketplace.category_sustainability", icon: Leaf },
  { id: "health", labelKey: "marketplace.category_health", icon: Heart },
  { id: "community", labelKey: "marketplace.category_community", icon: Users },
  { id: "gardening", labelKey: "marketplace.category_gardening", icon: Flower2 },
  { id: "food", labelKey: "marketplace.category_food", icon: Apple },
  { id: "lifestyle", labelKey: "marketplace.category_lifestyle", icon: Sun },
];

interface Program {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  access_level: string | null;
  price_huf: number | null;
  category: string | null;
  is_featured: boolean | null;
  creator_id: string | null;
  created_at: string | null;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  avg_rating?: number;
  review_count?: number;
}

const ProgramsListingPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch all published programs
  const { data: programs, isLoading } = useQuery({
    queryKey: ["allPrograms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_contents")
        .select(`
          *,
          creator:profiles!expert_contents_creator_id_fkey (
            id, first_name, last_name, avatar_url
          )
        `)
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Program[];
    },
  });

  // Fetch ratings for all programs
  const { data: ratingsMap } = useQuery({
    queryKey: ["programRatings", programs?.map(p => p.id)],
    queryFn: async () => {
      if (!programs) return {};
      const ratings: Record<string, { avg: number; count: number }> = {};
      for (const program of programs) {
        const [avgResult, countResult] = await Promise.all([
          supabase.rpc("get_content_average_rating", { p_content_id: program.id }),
          supabase.rpc("get_content_review_count", { p_content_id: program.id }),
        ]);
        ratings[program.id] = {
          avg: (avgResult.data as number) || 0,
          count: (countResult.data as number) || 0,
        };
      }
      return ratings;
    },
    enabled: !!programs && programs.length > 0,
  });

  // Filter programs based on search and category
  const filteredPrograms = useMemo(() => {
    if (!programs) return [];
    
    return programs.filter((program) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (program.description &&
          program.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || program.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [programs, searchQuery, selectedCategory]);

  const getAccessBadge = (accessLevel: string | null) => {
    switch (accessLevel) {
      case "free":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {t("program.free_access")}
          </Badge>
        );
      case "registered":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {t("common.registered")}
          </Badge>
        );
      case "premium":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        );
      case "one_time_purchase":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {t("program.purchase")}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1930]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-[hsl(var(--cyan))]/20">
              <BookOpen className="w-6 h-6 text-[hsl(var(--cyan))]" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.programs")}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t("programs.browse_description")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("marketplace.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-6 bg-[#112240] border-[hsl(var(--cyan))]/20 focus:border-[hsl(var(--cyan))] text-foreground placeholder:text-muted-foreground"
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

        {/* Category Pills */}
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
                    ? "bg-[hsl(var(--cyan))]/20 border-2 border-[hsl(var(--cyan))] text-[hsl(var(--cyan))] shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                    : "bg-[#112240] border border-[hsl(var(--cyan))]/20 text-muted-foreground hover:border-[hsl(var(--cyan))]/40 hover:text-foreground"
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-[#112240] border-[hsl(var(--cyan))]/10 overflow-hidden">
                <Skeleton className="aspect-video w-full bg-[#1a3a5c]" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2 bg-[#1a3a5c]" />
                  <Skeleton className="h-4 w-1/2 mb-3 bg-[#1a3a5c]" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 bg-[#1a3a5c]" />
                    <Skeleton className="h-6 w-20 bg-[#1a3a5c]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#112240] flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("marketplace.no_results")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("marketplace.no_results_desc")}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="border-[hsl(var(--cyan))]/30 hover:border-[hsl(var(--cyan))]"
            >
              {t("marketplace.clear_filters")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program, index) => {
              const rating = ratingsMap?.[program.id];
              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/programs/${program.id}`}>
                    <Card className="bg-[#112240] border-[hsl(var(--cyan))]/10 hover:border-[hsl(var(--cyan))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(var(--cyan))]/5 overflow-hidden h-full">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-gradient-to-br from-[hsl(var(--cyan))]/10 to-[hsl(var(--primary))]/10 relative">
                          {program.thumbnail_url ? (
                            <img
                              src={program.thumbnail_url}
                              alt={program.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          {program.is_featured && (
                            <Badge className="absolute top-2 right-2 bg-amber-500/90 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              {t("program.featured")}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            {program.title}
                          </h3>

                          {/* Creator */}
                          {program.creator && (
                            <Link
                              to={`/creators/${program.creator.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm text-muted-foreground hover:text-[hsl(var(--cyan))] transition-colors mb-3 block"
                            >
                              {program.creator.first_name} {program.creator.last_name}
                            </Link>
                          )}

                          {/* Rating */}
                          {rating && rating.count > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              <StarRating rating={Math.round(rating.avg)} size="sm" />
                              <span className="text-sm text-muted-foreground">
                                {rating.avg.toFixed(1)} ({rating.count})
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {getAccessBadge(program.access_level)}
                            {program.category && (
                              <Badge
                                variant="outline"
                                className="border-[hsl(var(--cyan))]/30 text-muted-foreground"
                              >
                                {t(`marketplace.category_${program.category}`)}
                              </Badge>
                            )}
                            {program.access_level === "one_time_purchase" &&
                              program.price_huf && (
                                <span className="text-sm font-semibold text-foreground ml-auto">
                                  {program.price_huf.toLocaleString()} Ft
                                </span>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsListingPage;
