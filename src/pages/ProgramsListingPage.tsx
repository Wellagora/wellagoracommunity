import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Store,
  Search,
  X,
  Grid,
  Leaf,
  Heart,
  Users,
  Apple,
  Crown,
  ShoppingCart,
  Star,
  BookOpen,
  Gift,
  PlayCircle,
  Hammer,
  Briefcase,
  ArrowLeft,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import StarRating from "@/components/reviews/StarRating";
import DummyPaymentModal from "@/components/marketplace/DummyPaymentModal";
import SponsorshipModal from "@/components/marketplace/SponsorshipModal";
import ExpertProfileModal from "@/components/creator/ExpertProfileModal";

const CATEGORIES = [
  { id: "all", labelKey: "marketplace.all_categories", icon: Grid, bgColor: "bg-slate-500", iconColor: "text-white" },
  { id: "sustainability", labelKey: "marketplace.category_sustainability", icon: Leaf, bgColor: "bg-emerald-500", iconColor: "text-white" },
  { id: "workshop", labelKey: "marketplace.category_workshop", icon: Hammer, bgColor: "bg-orange-500", iconColor: "text-white" },
  { id: "gastronomy", labelKey: "marketplace.category_gastronomy", icon: Apple, bgColor: "bg-rose-500", iconColor: "text-white" },
  { id: "community", labelKey: "marketplace.category_community", icon: Users, bgColor: "bg-blue-500", iconColor: "text-white" },
  { id: "wellness", labelKey: "marketplace.category_wellness", icon: Heart, bgColor: "bg-pink-500", iconColor: "text-white" },
  { id: "business", labelKey: "marketplace.category_business", icon: Briefcase, bgColor: "bg-purple-500", iconColor: "text-white" },
];

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Sponsorship {
  id: string;
  total_licenses: number;
  used_licenses: number;
  is_active: boolean;
  sponsor: Sponsor | null;
}

interface Program {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
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
    expert_title?: string | null;
  } | null;
  sponsor?: {
    id: string;
    organization: string | null;
    avatar_url: string | null;
  } | null;
  sponsorship?: Sponsorship[];
  waitlist?: { count: number }[];
  avg_rating?: number;
  review_count?: number;
}

const ProgramsListingPage = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentModal, setPaymentModal] = useState<Program | null>(null);
  const [sponsorshipModal, setSponsorshipModal] = useState<Program | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);

  // Creator filter from URL
  const creatorFilter = searchParams.get("creator");

  const isSponsor = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);

  // Fetch creator info if filtering
  const { data: filteredCreator } = useQuery({
    queryKey: ["filteredCreator", creatorFilter],
    queryFn: async () => {
      if (!creatorFilter) return null;
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, expert_title")
        .eq("id", creatorFilter)
        .single();
      return data;
    },
    enabled: !!creatorFilter,
  });

  // Fetch all published programs with sponsorship data
  const { data: programs, isLoading, refetch } = useQuery({
    queryKey: ["allPrograms", creatorFilter],
    queryFn: async () => {
      let query = supabase
        .from("expert_contents")
        .select(`
          *,
          creator:profiles!expert_contents_creator_id_fkey (
            id, first_name, last_name, avatar_url, expert_title
          ),
          sponsor:profiles!expert_contents_sponsor_id_fkey (
            id, organization, avatar_url
          ),
          sponsorship:content_sponsorships(
            id, total_licenses, used_licenses, is_active,
            sponsor:sponsors(id, name, logo_url)
          ),
          waitlist:content_waitlist(count)
        `)
        .eq("is_published", true);
      
      // Apply creator filter if present
      if (creatorFilter) {
        query = query.eq("creator_id", creatorFilter);
      }
      
      const { data, error } = await query
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
    
    // Sponsored content - gold border badge with sponsor name
    if (accessType === 'sponsored' || program.sponsor_id) {
      return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700]/30 to-[#FFA500]/20 border-2 border-[#FFD700] px-3 py-1.5 rounded-full shadow-lg shadow-[#FFD700]/20">
          {program.sponsor_logo_url ? (
            <img 
              src={program.sponsor_logo_url} 
              alt={program.sponsor_name || 'Sponsor'}
              className="h-5 w-5 rounded-full object-contain bg-white ring-1 ring-[#FFD700]"
            />
          ) : (
            <Gift className="w-4 h-4 text-[#FFD700]" />
          )}
          <span className="text-xs text-[#FFD700] font-semibold">
            {t('content.free')} • {program.sponsor_name || t('marketplace.sponsored')}
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
          {/* Creator filter header */}
          {creatorFilter && filteredCreator && (
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchParams({})}
                className="mb-4 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("marketplace.back_to_all")}
              </Button>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[#112240] border border-[hsl(var(--cyan))]/20">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={filteredCreator.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {filteredCreator.first_name?.[0]}{filteredCreator.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {filteredCreator.first_name} {filteredCreator.last_name}
                  </h2>
                  {filteredCreator.expert_title && (
                    <p className="text-primary">{filteredCreator.expert_title}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t("marketplace.showing_creator_contents").replace("{{count}}", String(filteredPrograms.length))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!creatorFilter && (
            <>
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
            </>
          )}
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
                <div className={`p-1 rounded-md ${category.bgColor}`}>
                  <Icon className={`w-3 h-3 ${category.iconColor}`} />
                </div>
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
              
              // Sponsorship logic
              const sponsorship = program.sponsorship?.[0];
              const hasSponsorship = sponsorship?.is_active && (sponsorship.used_licenses || 0) < (sponsorship.total_licenses || 0);
              const remaining = sponsorship ? (sponsorship.total_licenses || 0) - (sponsorship.used_licenses || 0) : 0;
              const isExhausted = sponsorship?.is_active && remaining <= 0;
              const waitlistCount = program.waitlist?.[0]?.count || 0;

              const handleClaimSponsored = async (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  toast.error(t('auth.login_required'));
                  navigate('/auth');
                  return;
                }
                
                try {
                  await supabase.from('content_sponsorships')
                    .update({ used_licenses: (sponsorship?.used_licenses || 0) + 1 })
                    .eq('id', sponsorship!.id);
                    
                  await supabase.from('content_access')
                    .insert({ 
                      user_id: user.id, 
                      content_id: program.id, 
                      access_type: 'sponsored', 
                      sponsorship_id: sponsorship!.id 
                    });
                    
                  toast.success(t('marketplace.access_granted'));
                  refetch();
                  navigate(`/muhelytitok/${program.id}`);
                } catch (error) {
                  console.error('Error claiming sponsored access:', error);
                  toast.error(t('common.error'));
                }
              };

              const handleJoinWaitlist = async (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  toast.error(t('auth.login_required'));
                  navigate('/auth');
                  return;
                }
                
                try {
                  await supabase.from('content_waitlist')
                    .upsert({ user_id: user.id, content_id: program.id });
                  toast.success(t('marketplace.waitlist_joined'));
                  refetch();
                } catch (error) {
                  console.error('Error joining waitlist:', error);
                }
              };

              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/piacer/${program.id}`}>
                    <Card className={`bg-[#112240] hover:border-[hsl(var(--cyan))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(var(--cyan))]/5 overflow-hidden h-full ${
                      hasSponsorship || isExhausted
                        ? 'border-2 border-[#FFD700]/50 ring-1 ring-[#FFD700]/20' 
                        : (program.access_type === 'sponsored' || program.sponsor_id) 
                          ? 'border-2 border-[#FFD700]/50 ring-1 ring-[#FFD700]/20' 
                          : 'border-[hsl(var(--cyan))]/10'
                    }`}>
                      {/* Sponsor Banner */}
                      {sponsorship && (
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 px-4 py-2 flex items-center gap-2">
                          <Gift className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">
                            {hasSponsorship 
                              ? t('marketplace.sponsored_by').replace('{{name}}', sponsorship.sponsor?.name || '')
                              : t('marketplace.was_sponsored_by').replace('{{name}}', sponsorship.sponsor?.name || '')
                            }
                          </span>
                        </div>
                      )}

                      <CardContent className="p-0">
                        {/* Sponsor logo in corner for sponsored content */}
                        {(hasSponsorship || isExhausted) && sponsorship?.sponsor?.logo_url && (
                          <div className="absolute top-3 left-3 z-20">
                            <div className="w-10 h-10 rounded-full bg-white shadow-lg ring-2 ring-[#FFD700] flex items-center justify-center overflow-hidden">
                              <img 
                                src={sponsorship.sponsor.logo_url} 
                                alt={sponsorship.sponsor.name || 'Sponsor'}
                                className="w-8 h-8 object-contain"
                              />
                            </div>
                          </div>
                        )}
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
                          {!sponsorship && (
                            <div className="absolute top-2 right-2">
                              {getAccessBadge(program)}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            {program.title}
                          </h3>

                          {/* Creator - clickable */}
                          {program.creator && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedExpertId(program.creator!.id);
                              }}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                            >
                              {program.creator.first_name} {program.creator.last_name}
                            </button>
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

                          {/* SPONSORED - HAS SPOTS */}
                          {hasSponsorship && (
                            <div className="space-y-3 mt-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-green-600 font-medium">
                                    {t('marketplace.slots_left').replace('{{count}}', String(remaining))}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {sponsorship.used_licenses}/{sponsorship.total_licenses}
                                  </span>
                                </div>
                                <Progress 
                                  value={((sponsorship.used_licenses || 0) / (sponsorship.total_licenses || 1)) * 100} 
                                  className="h-2" 
                                />
                              </div>
                              <Button 
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                                onClick={handleClaimSponsored}
                              >
                                <Gift className="h-4 w-4 mr-2" />
                                {t('marketplace.claim_free')}
                              </Button>
                            </div>
                          )}

                          {/* EXHAUSTED - WAITLIST */}
                          {isExhausted && (
                            <div className="space-y-3 mt-3">
                              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                                <p className="text-sm text-amber-600">
                                  {t('marketplace.sponsor_exhausted').replace('{{name}}', sponsorship?.sponsor?.name || '')}
                                </p>
                                {waitlistCount > 0 && (
                                  <p className="text-xs text-amber-500 mt-1">
                                    {t('marketplace.waitlist_count').replace('{{count}}', String(waitlistCount))}
                                  </p>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={handleJoinWaitlist} 
                                  className="border-amber-500/50 text-amber-600"
                                >
                                  <Bell className="h-4 w-4 mr-1" />
                                  {t('marketplace.notify_me')}
                                </Button>
                                <Button onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/muhelytitok/${program.id}`);
                                }}>
                                  {program.price_huf?.toLocaleString()} Ft
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* NO SPONSORSHIP - REGULAR */}
                          {!sponsorship && (
                            <div className="flex items-center justify-between mt-3">
                              {program.category && (() => {
                                const cat = CATEGORIES.find(c => c.id === program.category);
                                if (!cat) return null;
                                const CatIcon = cat.icon;
                                return (
                                  <Badge
                                    variant="outline"
                                    className="border-[hsl(var(--cyan))]/30 text-muted-foreground flex items-center gap-1.5"
                                  >
                                    <div className={`p-0.5 rounded ${cat.bgColor}`}>
                                      <CatIcon className={`w-2.5 h-2.5 ${cat.iconColor}`} />
                                    </div>
                                    <span>{t(`marketplace.category_${program.category}`).replace(/^[^\w]+/, '')}</span>
                                  </Badge>
                                );
                              })()}
                              {getActionButton(program)}
                            </div>
                          )}
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

      {/* Expert Profile Modal */}
      <ExpertProfileModal
        expertId={selectedExpertId}
        isOpen={!!selectedExpertId}
        onClose={() => setSelectedExpertId(null)}
      />
    </div>
  );
};

export default ProgramsListingPage;
