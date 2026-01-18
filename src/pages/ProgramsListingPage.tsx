import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Apple,
  BookOpen,
  Briefcase,
  Grid,
  Heart,
  Leaf,
  Search,
  ShoppingCart,
  Star,
  Store,
  Users,
  X,
  Loader2,
  TrendingUp,
  Sparkles,
  Gift,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl, resolveAvatarUrl } from "@/lib/imageResolver";
import { SocialProofBadge } from "@/components/marketplace/SocialProofBadge";
import { VerifiedExpertBadge } from "@/components/marketplace/VerifiedExpertBadge";
import { SponsorContributionBadge } from "@/components/marketplace/SponsorContributionBadge";
import { LivePulseToast } from "@/components/marketplace/LivePulseToast";
import { 
  MOCK_PROGRAMS, 
  getMockExpertById, 
  getLocalizedExpertName, 
  getLocalizedSponsorName, 
  MockProgram 
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

interface Program {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  access_type: string | null;
  price_huf: number | null;
  category: string | null;
  is_featured: boolean | null;
  is_sponsored: boolean | null;
  sponsor_name: string | null;
  sponsor_contribution?: number;
  max_seats?: number;
  used_seats?: number;
  // Content type for quota logic
  content_type?: 'recorded' | 'online_live' | 'in_person';
  max_capacity?: number;
  creator_id: string | null;
  creator?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CreatorProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  expert_title: string | null;
}

// Category-based fallback images with high-quality Unsplash URLs
const FALLBACK_IMAGES: Record<string, string> = {
  'sustainability': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop',
  'gastronomy': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
  'wellness': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop',
  'workshop': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600&fit=crop',
  'community': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop',
  'business': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
  'gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  'default': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop'
};

const getCategoryFallbackImage = (category: string | null): string => {
  if (!category) return FALLBACK_IMAGES.default;
  const normalized = category.toLowerCase().replace(/\s+/g, '-').split('-')[0];
  return FALLBACK_IMAGES[normalized] || FALLBACK_IMAGES.default;
};

const ImagePlaceholder = ({ category }: { category?: string | null }) => (
  <div className="w-full h-full relative">
    <img
      src={getCategoryFallbackImage(category)}
      alt="Program preview"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
  </div>
);

// Category translation helper
const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  'sustainability': { hu: 'Fenntarthatóság', en: 'Sustainability', de: 'Nachhaltigkeit' },
  'sustainable-living': { hu: 'Fenntartható Életmód', en: 'Sustainable Living', de: 'Nachhaltiges Leben' },
  'workshop': { hu: 'Műhely', en: 'Workshop', de: 'Werkstatt' },
  'workshop-craft': { hu: 'Műhely & Kézművesség', en: 'Workshop & Craft', de: 'Werkstatt & Handwerk' },
  'gastronomy': { hu: 'Helyi Gasztronómia', en: 'Local Gastronomy', de: 'Lokale Gastronomie' },
  'local-gastronomy': { hu: 'Helyi Gasztronómia', en: 'Local Gastronomy', de: 'Lokale Gastronomie' },
  'cooking': { hu: 'Főzés', en: 'Cooking', de: 'Kochen' },
  'community': { hu: 'Közösség', en: 'Community', de: 'Gemeinschaft' },
  'community-impact': { hu: 'Közösségi Hatás', en: 'Community Impact', de: 'Gemeinschaftswirkung' },
  'wellness': { hu: 'Jóllét', en: 'Wellness', de: 'Wohlbefinden' },
  'wellbeing': { hu: 'Jóllét & Reziliencia', en: 'Wellbeing & Resilience', de: 'Wohlbefinden & Resilienz' },
  'business': { hu: 'Üzlet', en: 'Business', de: 'Geschäft' },
  'agora-business': { hu: 'Agora Business', en: 'Agora Business', de: 'Agora Business' },
  'gardening': { hu: 'Kertészkedés', en: 'Gardening', de: 'Gärtnern' },
  'crafts': { hu: 'Kézművesség', en: 'Crafts', de: 'Handwerk' },
};

// Fallback sponsor for programs without sponsor but marked as sponsored
const FALLBACK_SPONSOR = {
  hu: 'Praktiker',
  en: 'Praktiker',
  de: 'Praktiker',
};

const ProgramsListingPage = () => {
  const { t, language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredCreator, setFilteredCreator] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [sponsorshipData, setSponsorshipData] = useState<Record<string, { maxSeats: number; usedSeats: number; contribution: number }>>({});

  const creatorFilter = searchParams.get("creator");

  // Helper to get localized category label
  const getCategoryLabel = (category: string | null): string => {
    if (!category) return t('marketplace.program');
    const normalized = category.toLowerCase().replace(/\s+/g, '-');
    const translations = CATEGORY_TRANSLATIONS[normalized];
    if (translations) {
      return translations[language] || translations['hu'] || category;
    }
    // Fallback: capitalize first letter
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Convert mock program to Program interface
  const convertMockToProgram = (mp: MockProgram, idx: number): Program => {
    const creator = getMockExpertById(mp.creator_id);
    const localizedCreatorName = creator ? getLocalizedExpertName(creator, language) : null;
    const localizedSponsorName = getLocalizedSponsorName(mp, language);
    
    // Calculate sponsorship details - 80% sponsor contribution
    const sponsorContribution = mp.is_sponsored ? Math.round(mp.price_huf * 0.8) : 0;
    const maxSeats = mp.is_sponsored ? (mp.max_sponsored_seats || 10) : 0;
    const usedSeats = mp.is_sponsored ? Math.min(maxSeats - 2, 2 + idx) : 0; // Deterministic usage
    
    return {
      id: mp.id,
      title: getLocalizedField(mp as unknown as Record<string, unknown>, 'title'),
      description: getLocalizedField(mp as unknown as Record<string, unknown>, 'description'),
      image_url: mp.image_url,
      thumbnail_url: mp.thumbnail_url,
      access_type: mp.access_type,
      price_huf: mp.price_huf,
      category: mp.category,
      is_featured: mp.is_featured,
      is_sponsored: mp.is_sponsored,
      sponsor_name: localizedSponsorName || (mp.is_sponsored ? FALLBACK_SPONSOR[language as keyof typeof FALLBACK_SPONSOR] : null),
      sponsor_contribution: sponsorContribution,
      max_seats: maxSeats,
      used_seats: usedSeats,
      // Pass content type for quota-specific labels
      content_type: mp.content_type || 'in_person',
      max_capacity: mp.max_capacity,
      creator_id: mp.creator_id,
      creator: creator && localizedCreatorName ? {
        id: creator.id,
        first_name: localizedCreatorName.firstName,
        last_name: localizedCreatorName.lastName,
        avatar_url: creator.avatar_url,
      } : null,
    };
  };

  // Fetch programs from Supabase with mock data fallback
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        // Fetch expert_contents with creator profiles
        let query = supabase
          .from("expert_contents")
          .select(`
            id,
            title,
            title_en,
            title_de,
            description,
            description_en,
            description_de,
            image_url,
            thumbnail_url,
            access_type,
            price_huf,
            category,
            is_featured,
            is_sponsored,
            sponsor_name,
            creator_id,
            content_type,
            max_capacity,
            fixed_sponsor_amount,
            total_licenses,
            used_licenses
          `)
          .eq("is_published", true)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (creatorFilter) {
          query = query.eq("creator_id", creatorFilter);
        }

        const { data: contentsData, error: contentsError } = await query;

        // FALLBACK: If DB is empty or error, use mock data
        if (contentsError || !contentsData || contentsData.length === 0) {
          console.log("Using mock data fallback - DB returned empty or error:", contentsError);
          setUsingMockData(true);
          
          const mockPrograms = MOCK_PROGRAMS
            .filter(mp => mp.is_published)
            .map((mp, idx) => convertMockToProgram(mp, idx));
          
          setPrograms(mockPrograms);
          setIsLoading(false);
          return;
        }

        setUsingMockData(false);

        // Fetch all content_sponsorships for these programs
        const contentIds = contentsData.map(c => c.id);
        const { data: sponsorships } = await supabase
          .from('content_sponsorships')
          .select('content_id, total_licenses, used_licenses, max_sponsored_seats, sponsored_seats_used, sponsor_contribution_huf, is_active')
          .in('content_id', contentIds)
          .eq('is_active', true);

        // Build sponsorship lookup map
        const sponsorshipMap: Record<string, { maxSeats: number; usedSeats: number; contribution: number }> = {};
        if (sponsorships) {
          for (const s of sponsorships) {
            sponsorshipMap[s.content_id] = {
              maxSeats: s.max_sponsored_seats || s.total_licenses || 10,
              usedSeats: s.sponsored_seats_used || s.used_licenses || 0,
              contribution: s.sponsor_contribution_huf || 0
            };
          }
        }
        setSponsorshipData(sponsorshipMap);

        // Fetch all creator profiles
        const creatorIds = [...new Set((contentsData || []).map(c => c.creator_id).filter(Boolean))];
        
        let profilesMap: Record<string, CreatorProfile> = {};
        if (creatorIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url, expert_title")
            .in("id", creatorIds);

          if (profilesData) {
            profilesMap = profilesData.reduce((acc, p) => {
              acc[p.id] = p;
              return acc;
            }, {} as Record<string, CreatorProfile>);
          }
        }

        // Map data with localized fields using the hook helper
        const mappedPrograms: Program[] = (contentsData || []).map((content, idx) => {
          const creator = content.creator_id ? profilesMap[content.creator_id] : null;
          
          // Use the centralized localization helper for consistent behavior
          // HU: uses base field (title, description) 
          // EN: uses title_en, description_en with HU fallback
          // DE: uses title_de, description_de with HU fallback
          const localizedTitle = getLocalizedField(content as Record<string, unknown>, 'title');
          const localizedDescription = getLocalizedField(content as Record<string, unknown>, 'description');

          // Calculate sponsorship details - use DB values when available
          const contentData = content as Record<string, unknown>;
          const sponsorContribution = contentData.fixed_sponsor_amount as number || 
            (content.is_sponsored ? Math.round((content.price_huf || 0) * 0.4) : 0);
          const maxSeats = (contentData.total_licenses as number) || (content.is_sponsored ? 10 : 0);
          const usedSeats = (contentData.used_licenses as number) || (content.is_sponsored ? Math.min(7, 2 + idx) : 0);
          const contentType = (contentData.content_type as 'recorded' | 'online_live' | 'in_person') || 'in_person';
          const maxCapacity = contentData.max_capacity as number | undefined;

          return {
            id: content.id,
            title: localizedTitle || content.title,
            description: localizedDescription || content.description,
            image_url: resolveImageUrl(content.image_url),
            thumbnail_url: resolveImageUrl(content.thumbnail_url),
            access_type: content.access_type,
            price_huf: content.price_huf,
            category: content.category,
            is_featured: content.is_featured,
            is_sponsored: content.is_sponsored,
            sponsor_name: content.sponsor_name || (content.is_sponsored ? FALLBACK_SPONSOR[language as keyof typeof FALLBACK_SPONSOR] : null),
            sponsor_contribution: sponsorContribution,
            max_seats: maxSeats,
            used_seats: usedSeats,
            content_type: contentType,
            max_capacity: maxCapacity,
            creator_id: content.creator_id,
            creator: creator ? {
              id: creator.id,
              first_name: creator.first_name,
              last_name: creator.last_name,
              avatar_url: resolveAvatarUrl(creator.avatar_url),
            } : null,
          };
        });

        setPrograms(mappedPrograms);

        // If filtering by creator, set the filtered creator details
        if (creatorFilter && profilesMap[creatorFilter]) {
          setFilteredCreator(profilesMap[creatorFilter]);
        }
      } catch (err) {
        console.error("Error fetching programs:", err);
        // Fallback to mock data on any error
        setUsingMockData(true);
        const mockPrograms = MOCK_PROGRAMS
          .filter(mp => mp.is_published)
          .map((mp, idx) => convertMockToProgram(mp, idx));
        setPrograms(mockPrograms);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [creatorFilter, language]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch =
        !searchQuery ||
        String(program.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(program.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || program.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [programs, searchQuery, selectedCategory]);

  const formatPrice = (priceHuf: number | null): string => {
    if (!priceHuf || priceHuf === 0) return language === 'hu' ? '0 Ft' : '0 €';
    if (language === 'hu') return `${priceHuf.toLocaleString('hu-HU')} Ft`;
    const euroPrice = Math.round(priceHuf / 400);
    return `${euroPrice} €`;
  };

  const getAccessBadge = (program: Program, idx?: number) => {
    // Enhanced sponsored badge with contribution badge component + content_type for quota labels
    if (program.is_sponsored) {
      const sponsorName = program.sponsor_name || FALLBACK_SPONSOR[language as keyof typeof FALLBACK_SPONSOR];
      const contributionAmount = program.sponsor_contribution || (program.price_huf ? Math.round(program.price_huf * 0.8) : 5000);
      const maxSeats = program.max_seats || 10;
      const usedSeats = program.used_seats || Math.min(7, 2 + (idx || 0));
      const seatsExhausted = usedSeats >= maxSeats;
      
      return (
        <SponsorContributionBadge
          sponsorName={sponsorName}
          contributionAmount={contributionAmount}
          originalPrice={program.price_huf || 0}
          size="sm"
          maxSeats={maxSeats}
          usedSeats={usedSeats}
          showImpactMode={seatsExhausted}
          contentType={program.content_type || 'in_person'}
          maxCapacity={program.max_capacity}
        />
      );
    }

    if (program.price_huf && program.price_huf > 0) {
      return (
        <Badge className="bg-accent text-accent-foreground border-0 text-xs">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {formatPrice(program.price_huf)}
        </Badge>
      );
    }

    return <Badge className="bg-secondary text-secondary-foreground border-0 text-xs">{t("marketplace.open_content")}</Badge>;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-0 pb-12">
        {/* Sticky Header Section - Title, Search, and Categories */}
        <div className="sticky top-0 z-30 -mx-4 px-4 pt-6 pb-6 bg-white/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
          {creatorFilter && filteredCreator ? (
            <div className="mb-6">
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
                  <h2 className="text-2xl font-semibold text-foreground">
                    {filteredCreator.first_name} {filteredCreator.last_name}
                  </h2>
                  {filteredCreator.expert_title && (
                    <p className="text-sm text-black/50">{String(filteredCreator.expert_title)}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("marketplace.title")}</h1>
              </div>
              <p className="text-black/50 text-base max-w-2xl">{t("marketplace.subtitle")}</p>
            </div>
          )}

          {/* Search - Inside sticky header */}
          <div className="relative mb-5">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
            <Input
              type="text"
              placeholder={t("marketplace.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-14 py-6 text-base bg-white/80 backdrop-blur-xl border-black/[0.05] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] focus:shadow-[0_8px_32px_rgba(0,0,0,0.06)] focus:border-black/[0.1] transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-black/30 hover:text-black/60 transition-colors rounded-full hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Categories - Inside sticky header with horizontal scroll + touch-friendly padding */}
          <div className="-mx-4 px-4 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex gap-2.5 px-1">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full whitespace-nowrap transition-all duration-300 touch-manipulation ${
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
              {/* End spacer for scroll padding */}
              <div className="w-4 shrink-0" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mt-8 mb-6 text-sm tracking-wide text-black/40">
              <span className="font-medium text-black">{filteredPrograms.length}</span> {t("marketplace.showing_results")}
            </div>

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
                    <Link 
                      to={`/piacer/${program.id}`} 
                      className="block group min-h-[44px] touch-manipulation"
                    >
                      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:scale-[1.02] active:scale-[0.98]">
                        <CardContent className="p-0">
                          {/* Image with overlay */}
                          <div className="aspect-[4/3] bg-gradient-to-br from-black/[0.02] to-black/[0.06] relative overflow-hidden">
                            {program.thumbnail_url || program.image_url ? (
                              <img
                                src={program.thumbnail_url || program.image_url || ""}
                                alt={String(program.title)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                onError={(e) => {
                                  // Replace failed image with category-based fallback
                                  const fallbackUrl = getCategoryFallbackImage(program.category);
                                  e.currentTarget.src = fallbackUrl;
                                  e.currentTarget.onerror = null; // Prevent infinite loop
                                }}
                              />
                            ) : (
                              <ImagePlaceholder category={program.category} />
                            )}

                            {/* Featured badge - Premium gradient */}
                            {program.is_featured && (
                              <div className="absolute top-4 left-4">
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold tracking-wide uppercase shadow-lg shadow-amber-500/25"
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  {language === 'hu' ? 'NÉPSZERŰ' : language === 'de' ? 'BELIEBT' : 'POPULAR'}
                                </motion.span>
                              </div>
                            )}

                            {/* Favorite Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!user) {
                                  navigate('/auth');
                                  return;
                                }
                                toggleFavorite(program.id);
                              }}
                              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all group/fav"
                              aria-label={isFavorite(program.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Heart 
                                className={`w-5 h-5 transition-colors ${
                                  isFavorite(program.id) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-gray-500 group-hover/fav:text-red-400'
                                }`} 
                              />
                            </button>
                          </div>

                          {/* Enhanced Content */}
                          <div className="p-6">
                            {/* Event Format Tag + Category */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/5 border border-black/10 text-black/70">
                                {program.content_type === 'recorded' && '🎥 Videókurzus'}
                                {program.content_type === 'online_live' && '💻 Online élő'}
                                {(program.content_type === 'in_person' || !program.content_type) && '📍 Élő esemény'}
                              </span>
                              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-black/40">
                                {getCategoryLabel(program.category)}
                              </span>
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-black transition-colors duration-300">
                              {String(program.title)}
                            </h3>

                            {/* Creator info with verified badge */}
                            {program.creator && (
                              <div className="flex items-center gap-2 mt-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={program.creator.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs bg-muted">
                                    {program.creator.first_name?.[0]}{program.creator.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {program.creator.first_name} {program.creator.last_name}
                                </span>
                                <VerifiedExpertBadge size="sm" />
                              </div>
                            )}

                            {/* Social proof - Attendees + Scarcity */}
                            <div className="mt-3">
                              <SocialProofBadge 
                                attendeeCount={5 + (index * 2) % 15} 
                                seatsLeft={index % 4 === 0 ? 2 : index % 5 === 0 ? 4 : undefined}
                                size="sm"
                              />
                            </div>

                            {/* Price/Access badge */}
                            <div className="mt-4">
                              {getAccessBadge(program, index)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Live Pulse Toast - Real-time activity notifications */}
      <LivePulseToast enabled={true} interval={15000} />
    </div>
  );
};

export default ProgramsListingPage;
