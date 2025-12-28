import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store,
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
  BookOpen,
  Gift,
  PlayCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import StarRating from "@/components/reviews/StarRating";
import DummyPaymentModal from "@/components/marketplace/DummyPaymentModal";
import SponsorshipModal from "@/components/marketplace/SponsorshipModal";

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
  access_type: string | null;
  price_huf: number | null;
  category: string | null;
  is_featured: boolean | null;
  creator_id: string | null;
  created_at: string | null;
  sponsor_id: string | null;
  sponsor_name: string | null;
  sponsor_logo_url: string | null;
  total_licenses: number | null;
  used_licenses: number | null;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  sponsor?: {
    id: string;
    organization: string | null;
    avatar_url: string | null;
  } | null;
  avg_rating?: number;
  review_count?: number;
}

const ProgramsListingPage = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentModal, setPaymentModal] = useState<Program | null>(null);
  const [sponsorshipModal, setSponsorshipModal] = useState<Program | null>(null);

  const isSponsor = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);

  // Fetch all published programs
  const { data: programs, isLoading, refetch } = useQuery({
    queryKey: ["allPrograms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_contents")
        .select(`
          *,
          creator:profiles!expert_contents_creator_id_fkey (
            id, first_name, last_name, avatar_url
          ),
          sponsor:profiles!expert_contents_sponsor_id_fkey (
            id, organization, avatar_url
          )
        `)
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Program[];
    },
  });

  // Fetch user's content access
  const { data: userAccess } = useQuery({
    queryKey: ["userContentAccess", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("content_access")
        .select("content_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(a => a.content_id);
    },
    enabled: !!user,
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

  const hasAccess = (contentId: string) => userAccess?.includes(contentId);

  // Handle free/sponsored content access
  const handleFreeAccess = async (program: Program) => {
    if (!user) {
      toast.error(t('auth.login_required'));
      navigate('/auth');
      return;
    }

    try {
      // For sponsored content, check if licenses are available
      if (program.access_type === 'sponsored') {
        const usedLicenses = program.used_licenses || 0;
        const totalLicenses = program.total_licenses || 0;
        
        if (usedLicenses >= totalLicenses) {
          toast.error(t('marketplace.licenses_exhausted'));
          return;
        }

        // Increment used_licenses
        await supabase
          .from('expert_contents')
          .update({ used_licenses: usedLicenses + 1 })
          .eq('id', program.id);
      }

      // Record access
      await supabase.from('content_access').insert({
        user_id: user.id,
        content_id: program.id,
        access_type: program.access_type === 'sponsored' ? 'sponsored' : 'purchase',
        amount_paid: 0,
      });

      toast.success(t('marketplace.access_granted'));
      refetch();
      navigate(`/piacer/${program.id}/learn`);
    } catch (error) {
      console.error('Access error:', error);
      toast.error(t('common.error'));
    }
  };

  // Filter programs based on search and category
  const filteredPrograms = useMemo(() => {
    if (!programs) return [];
    
    return programs.filter((program) => {
      const matchesSearch =
        !searchQuery ||
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (program.description &&
          program.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || program.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [programs, searchQuery, selectedCategory]);

  const getAccessBadge = (program: Program) => {
    const accessType = program.access_type || program.access_level;
    
    // Sponsored content
    if (accessType === 'sponsored' || program.sponsor_id) {
      return (
        <div className="flex items-center gap-2 bg-[#FFD700]/20 border border-[#FFD700]/30 px-2 py-1 rounded-full">
          {program.sponsor_logo_url ? (
            <img 
              src={program.sponsor_logo_url} 
              alt={program.sponsor_name || 'Sponsor'}
              className="h-4 w-4 rounded-full object-contain bg-white"
            />
          ) : (
            <Gift className="w-3 h-3 text-[#FFD700]" />
          )}
          <span className="text-xs text-[#FFD700] font-medium">
            {t('marketplace.sponsored')}
          </span>
        </div>
      );
    }

    // Paid content
    if (accessType === 'paid' || accessType === 'one_time_purchase' || accessType === 'premium') {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {program.price_huf?.toLocaleString() || 0} Ft
        </Badge>
      );
    }

    // Free content
    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        {t("marketplace.free")}
      </Badge>
    );
  };

  const getActionButton = (program: Program) => {
    const accessType = program.access_type || program.access_level;
    const alreadyHasAccess = hasAccess(program.id);

    // Already has access
    if (alreadyHasAccess) {
      return (
        <Button 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/piacer/${program.id}/learn`);
          }}
          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
        >
          <PlayCircle className="w-4 h-4 mr-1" />
          {t('marketplace.continue')}
        </Button>
      );
    }

    // Free or sponsored content
    if (accessType === 'free' || accessType === 'sponsored' || program.sponsor_id) {
      return (
        <Button 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFreeAccess(program);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {t('marketplace.get_access')}
        </Button>
      );
    }

    // Paid content - show different buttons for sponsors vs regular users
    if (accessType === 'paid' || accessType === 'one_time_purchase' || accessType === 'premium') {
      // Sponsor can sponsor this content
      if (isSponsor) {
        return (
          <Button 
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSponsorshipModal(program);
            }}
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/80"
          >
            <Gift className="w-4 h-4 mr-1" />
            {t('sponsor.sponsor_button')}
          </Button>
        );
      }

      // Regular user can buy
      return (
        <Button 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) {
              toast.error(t('auth.login_required'));
              navigate('/auth');
              return;
            }
            setPaymentModal(program);
          }}
          className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cyan))] hover:opacity-90 text-white"
        >
          {t('marketplace.buy_button')}
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#0A1930]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-[hsl(var(--cyan))]/20">
              <Store className="w-6 h-6 text-[hsl(var(--cyan))]" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("marketplace.title")}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t("marketplace.subtitle")}
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
                  <Link to={`/piacer/${program.id}`}>
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
                            <Badge className="absolute top-2 left-2 bg-amber-500/90 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              {t("program.featured")}
                            </Badge>
                          )}
                          <div className="absolute top-2 right-2">
                            {getAccessBadge(program)}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            {program.title}
                          </h3>

                          {/* Creator */}
                          {program.creator && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {program.creator.first_name} {program.creator.last_name}
                            </p>
                          )}

                          {/* Sponsor info for sponsored content */}
                          {(program.access_type === 'sponsored' || program.sponsor_id) && program.sponsor_name && (
                            <p className="text-xs text-[#FFD700] mb-2">
                              {t('marketplace.sponsored')} - {program.sponsor_name}
                            </p>
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

                          <div className="flex items-center justify-between mt-3">
                            {program.category && (
                              <Badge
                                variant="outline"
                                className="border-[hsl(var(--cyan))]/30 text-muted-foreground"
                              >
                                {t(`marketplace.category_${program.category}`)}
                              </Badge>
                            )}
                            {getActionButton(program)}
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

      {/* Payment Modal */}
      {paymentModal && (
        <DummyPaymentModal
          content={{
            id: paymentModal.id,
            title: paymentModal.title,
            price_huf: paymentModal.price_huf || 0,
            creator_id: paymentModal.creator_id || '',
            creator: paymentModal.creator,
          }}
          open={!!paymentModal}
          onOpenChange={(open) => !open && setPaymentModal(null)}
          onSuccess={() => {
            refetch();
            setPaymentModal(null);
          }}
        />
      )}

      {/* Sponsorship Modal */}
      {sponsorshipModal && (
        <SponsorshipModal
          content={{
            id: sponsorshipModal.id,
            title: sponsorshipModal.title,
            price_huf: sponsorshipModal.price_huf || 0,
            creator_id: sponsorshipModal.creator_id || '',
            creator: sponsorshipModal.creator,
          }}
          open={!!sponsorshipModal}
          onOpenChange={(open) => !open && setSponsorshipModal(null)}
          onSuccess={() => {
            refetch();
            setSponsorshipModal(null);
          }}
        />
      )}
    </div>
  );
};

export default ProgramsListingPage;
