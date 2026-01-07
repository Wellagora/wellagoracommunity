import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
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
import { MOCK_PROGRAMS, MOCK_EXPERTS, getMockExpertById } from "@/data/mockData";

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
  is_chain_partner?: boolean;
  redemption_location?: string;
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
    location_city?: string | null;
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
  const { t, language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();
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
            id, first_name, last_name, avatar_url, expert_title, location_city
          ),
          sponsor:profiles!expert_contents_sponsor_id_fkey (
            id, organization, avatar_url
          ),
          sponsorship:content_sponsorships(
            id, total_licenses, used_licenses, is_active, is_chain_partner, redemption_location,
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

  // Convert mock programs to display format with localization
  const mockProgramsForDisplay = useMemo(() => {
    return MOCK_PROGRAMS.map(mp => {
      const creator = getMockExpertById(mp.creator_id);
      return {
        id: mp.id,
        title: getLocalizedField(mp as unknown as Record<string, unknown>, 'title'),
        description: getLocalizedField(mp as unknown as Record<string, unknown>, 'description'),
        image_url: mp.image_url,
        thumbnail_url: mp.thumbnail_url,
        access_level: mp.access_level,
        access_type: mp.access_type,
        price_huf: mp.price_huf,
        category: mp.category,
        is_featured: mp.is_featured,
        creator_id: mp.creator_id,
        created_at: mp.created_at,
        sponsor_id: null,
        sponsor_name: mp.sponsor_name,
        sponsor_logo_url: mp.sponsor_logo_url,
        total_licenses: mp.is_sponsored ? 50 : null,
        used_licenses: mp.is_sponsored ? Math.floor(Math.random() * 40) : null,
        creator: creator ? {
          id: creator.id,
          first_name: creator.first_name,
          last_name: creator.last_name,
          avatar_url: creator.avatar_url,
          expert_title: getLocalizedField(creator as unknown as Record<string, unknown>, 'expert_title'),
          location_city: creator.location_city
        } : null,
        sponsorship: mp.is_sponsored ? [{
          id: `mock-sponsorship-${mp.id}`,
          total_licenses: 50,
          used_licenses: Math.floor(Math.random() * 40),
          is_active: true,
          sponsor: { id: 'mock-sponsor', name: mp.sponsor_name || 'Partner', logo_url: null }
        }] : [],
        waitlist: []
      } as Program;
    });
  }, [language, getLocalizedField]);

  // Combine mock and database programs - prioritize mock data for clean slate
  const allPrograms = useMemo(() => {
    // Use mock programs as primary data, append database programs that have full translations
    const dbProgramsWithTranslations = (programs || []).filter(p => {
      // Only include DB programs that have translations (not the old unlocalized ones)
      return p.id && !p.id.startsWith('mock-');
    });
    
    // Prioritize mock programs for a clean slate
    return [...mockProgramsForDisplay, ...dbProgramsWithTranslations];
  }, [mockProgramsForDisplay, programs]);

  // Filter programs based on search and category
  const filteredPrograms = useMemo(() => {
    const programsToFilter = creatorFilter 
      ? allPrograms.filter(p => p.creator_id === creatorFilter)
      : allPrograms;
    
    return programsToFilter.filter((program) => {
      const matchesSearch =
        !searchQuery ||
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (program.description &&
          program.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || program.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allPrograms, creatorFilter, searchQuery, selectedCategory]);

  const getAccessBadge = (program: Program) => {
    // 1. PRIORITÁS: Aktív szponzoráció ellenőrzése
    const sponsorship = program.sponsorship?.[0];
    const hasActiveSponsorship = sponsorship?.is_active && 
      (sponsorship.used_licenses || 0) < (sponsorship.total_licenses || 0);
    
    if (hasActiveSponsorship) {
      return (
        <div className="flex flex-col gap-1">
          <Badge className="bg-green-600 text-white border-0">
            <Gift className="w-3 h-3 mr-1" />
            {t('nav.role_supporter')} • {sponsorship.sponsor?.name}
          </Badge>
          {program.price_huf && program.price_huf > 0 && (
            <span className="text-xs text-muted-foreground">
              {t('marketplace.value_label')}: {program.price_huf.toLocaleString()} Ft — {t('marketplace.paid_by_sponsor')}
            </span>
          )}
        </div>
      );
    }

    // 2. PRIORITÁS: Fizetős tartalom (ár > 0)
    if (program.price_huf && program.price_huf > 0) {
      return (
        <Badge className="bg-accent text-accent-foreground border-0">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {program.price_huf?.toLocaleString() || 0} Ft
        </Badge>
      );
    }

    // 3. UTOLSÓ: Nyílt tartalom (NEM "Ingyenes"!)
    return (
      <Badge className="bg-blue-600 text-white border-0">
        {t("marketplace.open_content") || "Nyílt tartalom"}
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
    <div className="min-h-screen bg-[#F5F5F7]">
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
                className="mb-4 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("marketplace.back_to_all")}
              </Button>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary border border-border">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={filteredCreator.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
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
                <div className="p-3 rounded-xl bg-primary/10">
                  <Store className="w-6 h-6 text-primary" />
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

        {/* Search Bar - 3D Card Style */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("marketplace.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-6 bg-white/90 backdrop-blur-md border border-white/60 focus:border-primary text-foreground placeholder:text-muted-foreground rounded-2xl"
            style={{
              boxShadow: '0 8px 30px rgb(0,0,0,0.04), 0 20px 50px rgba(0,0,0,0.04)',
            }}
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

        {/* Category Pills - 3D Card Style */}
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
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-white/90 backdrop-blur-md border border-white/60 text-muted-foreground hover:border-primary hover:text-primary"
                }`}
                style={!isActive ? {
                  boxShadow: '0 8px 30px rgb(0,0,0,0.04), 0 20px 50px rgba(0,0,0,0.04)',
                } : undefined}
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
              <Card 
                key={i} 
                className="bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden"
                style={{
                  boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 10px -2px rgba(0,0,0,0.05)',
                }}
              >
                <Skeleton className="aspect-video w-full bg-slate-100" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2 bg-slate-100" />
                  <Skeleton className="h-4 w-1/2 mb-3 bg-slate-100" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 bg-slate-100" />
                    <Skeleton className="h-6 w-20 bg-slate-100" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F5F5F7] flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {t("marketplace.no_results")}
            </h3>
            <p className="text-slate-500 mb-6">
              {t("marketplace.no_results_desc")}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="border-primary text-primary hover:bg-primary/5"
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
                  // 1. Check if still available
                  const { data: current } = await supabase
                    .from('content_sponsorships')
                    .select('used_licenses, total_licenses')
                    .eq('id', sponsorship!.id)
                    .single();
                  
                  if (current && current.used_licenses >= current.total_licenses) {
                    toast.error(t('marketplace.sponsor_exhausted').replace('{{name}}', sponsorship?.sponsor?.name || ''));
                    refetch();
                    return;
                  }

                  // 2. Update license count
                  await supabase.from('content_sponsorships')
                    .update({ used_licenses: (current?.used_licenses || 0) + 1 })
                    .eq('id', sponsorship!.id);
                    
                  // 3. Grant access
                  await supabase.from('content_access')
                    .insert({ 
                      user_id: user.id, 
                      content_id: program.id, 
                      access_type: 'sponsored', 
                      sponsorship_id: sponsorship!.id 
                    });

                  // 4. Generate voucher with UPPERCASE code
                  const voucherCode = `WA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
                  
                  await supabase.from('vouchers')
                    .insert({
                      code: voucherCode,
                      user_id: user.id,
                      content_id: program.id,
                      status: 'active',
                      pickup_location: sponsorship?.is_chain_partner 
                        ? `Bármely ${sponsorship.sponsor?.name} egységben`
                        : sponsorship?.redemption_location || program.creator?.location_city || 'A Mesternél'
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
                    <Card 
                      className="bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden h-full transition-all duration-300 hover:-translate-y-2 group"
                      style={{
                        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 10px -2px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Sponsor Banner - subtle top indicator */}
                      {hasSponsorship && (
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 flex items-center gap-2 border-b border-primary/20">
                          {sponsorship?.sponsor?.logo_url ? (
                            <img 
                              src={sponsorship.sponsor.logo_url} 
                              alt={sponsorship.sponsor.name || 'Sponsor'}
                              className="h-5 w-5 rounded-full object-contain bg-white shadow-sm"
                            />
                          ) : (
                            <Gift className="h-4 w-4 text-primary" />
                          )}
                          <Badge className="bg-primary/15 text-primary border-0 font-medium">
                            {t('common.sponsor')} • {sponsorship?.sponsor?.name || 'Partner'}
                          </Badge>
                        </div>
                      )}

                      <CardContent className="p-0">
                        {/* Image section with status badges */}
                        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 relative">
                          {program.thumbnail_url ? (
                            <img
                              src={program.thumbnail_url}
                              alt={program.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-slate-300" />
                            </div>
                          )}
                          {/* Top-left: Featured badge */}
                          {program.is_featured && (
                            <Badge className="absolute top-2 left-2 bg-amber-500/90 text-white shadow-md">
                              <Star className="w-3 h-3 mr-1" />
                              {t("program.featured")}
                            </Badge>
                          )}
                          {/* Top-right: Status badges */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
                            {/* Sponsored gift badge */}
                            {hasSponsorship && (
                              <Badge className="bg-primary text-primary-foreground shadow-md border-0 px-2.5 py-1">
                                <Gift className="w-3 h-3 mr-1" />
                                {t('marketplace.sponsor_gift')}
                              </Badge>
                            )}
                            {/* Scarcity badge - only if sponsored and less than 5 spots */}
                            {hasSponsorship && remaining > 0 && remaining <= 5 && (
                              <Badge className="bg-orange-400/90 text-white shadow-md border-0 px-2.5 py-1">
                                {t('marketplace.only_x_left').replace('{{count}}', String(remaining))}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {program.title}
                          </h3>

                          {/* Creator with Avatar - clickable */}
                          {program.creator && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedExpertId(program.creator!.id);
                              }}
                              className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
                            >
                              <Avatar className="w-6 h-6 border border-white shadow-sm">
                                <AvatarImage src={program.creator.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {program.creator.first_name?.[0]}{program.creator.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                {program.creator.first_name} {program.creator.last_name}
                              </span>
                            </button>
                          )}

                          {/* Rating */}
                          {rating && rating.count > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              <StarRating rating={Math.round(rating.avg)} size="sm" />
                              <span className="text-sm text-slate-500">
                                {rating.avg.toFixed(1)} ({rating.count})
                              </span>
                            </div>
                          )}

                          {/* SUPPORTED - HAS SPOTS (value-based) */}
                          {hasSponsorship && (
                            <div className="space-y-3 mt-3">
                              {/* Value display */}
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xs text-slate-400">{t('marketplace.value_label')}</p>
                                  <p className="font-bold text-slate-900">{program.price_huf?.toLocaleString()} Ft</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-green-600 font-medium">{sponsorship.sponsor?.name}</p>
                                  <p className="text-xs text-slate-400">{t('marketplace.from_quota')}</p>
                                </div>
                              </div>

                              {/* Scarcity - Progress bar */}
                              <div>
                                <Progress 
                                  value={((sponsorship.used_licenses || 0) / (sponsorship.total_licenses || 1)) * 100} 
                                  className="h-1.5" 
                                />
                                <p className="text-xs text-center text-slate-500 mt-1">
                                  {t('marketplace.slots_remaining').replace('{{count}}', String(remaining))}
                                </p>
                              </div>

                              {/* Sponsor logo in footer if applicable */}
                              {sponsorship?.sponsor?.logo_url && (
                                <div className="flex items-center gap-2 py-2 border-t border-slate-100 mb-2">
                                  <img 
                                    src={sponsorship.sponsor.logo_url} 
                                    alt={sponsorship.sponsor.name}
                                    className="h-6 w-auto max-w-[80px] object-contain"
                                  />
                                  <span className="text-xs text-slate-400">{t('marketplace.made_possible_by')}</span>
                                </div>
                              )}

                              <Button 
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                                onClick={handleClaimSponsored}
                              >
                                <Gift className="h-4 w-4 mr-1" />
                                {t('marketplace.open_from_sponsor')}
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
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleJoinWaitlist} 
                                  className="flex-1 border-amber-500/50 text-amber-600"
                                >
                                  <Bell className="h-3 w-3 mr-1" />
                                  {t('marketplace.notify_when_available')}
                                </Button>
                                <Button 
                                  size="sm"
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/muhelytitok/${program.id}`);
                                  }}
                                >
                                  {program.price_huf?.toLocaleString()} Ft
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* NO SPONSORSHIP - REGULAR */}
                          {!sponsorship && (
                            <div className="space-y-3 mt-3">
                              {/* Badge - a sötét kártya részén, jól olvasható */}
                              <div>
                                {getAccessBadge(program)}
                              </div>
                              <div className="flex items-center justify-between">
                                {program.category && (() => {
                                  const cat = CATEGORIES.find(c => c.id === program.category);
                                  if (!cat) return null;
                                  const CatIcon = cat.icon;
                                  return (
                                    <Badge
                                      variant="outline"
                                      className="border-slate-200 text-slate-500 flex items-center gap-1.5"
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
