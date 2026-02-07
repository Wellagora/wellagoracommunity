import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useBulkProgramSupport } from "@/hooks/useSponsorSupport";
import { SponsoredBadge } from "@/components/sponsor/SupportBreakdownCard";
import type { Currency } from "@/types/sponsorSupport";
import { calculatePricing } from '@/lib/pricing';
import { PricingDisplay } from '@/components/PricingDisplay';
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
  TrendingUp,
  Sparkles,
  Gift,
  Hammer,
  Mountain,
  Sprout,
  Landmark,
  HandHeart,
  Trophy,
  Palette,
  Baby,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl, resolveAvatarUrl } from "@/lib/imageResolver";
import { SocialProofBadge } from "@/components/marketplace/SocialProofBadge";
import { VerifiedExpertBadge } from "@/components/marketplace/VerifiedExpertBadge";
import { SponsorContributionBadge } from "@/components/marketplace/SponsorContributionBadge";
import { LivePulseToast } from "@/components/marketplace/LivePulseToast";
import { ProgramGridSkeleton } from "@/components/ui/loading-skeleton";
import { CATEGORIES as CATEGORY_LIST } from "@/constants/categories";

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, any> = {
  lifestyle: Leaf,
  craft: Hammer,
  gastronomy: Apple,
  wellness: Heart,
  hiking: Mountain,
  gardening: Sprout,
  heritage: Landmark,
  volunteering: HandHeart,
  market: Store,
  community: Users,
  sport: Trophy,
  culture: Palette,
  family: Baby,
};

// Community-focused categories with DB slug mapping
const CATEGORIES = [
  { id: "all", labelKey: "marketplace.all_categories", dbSlug: null, icon: Grid },
  ...CATEGORY_LIST.map(cat => ({
    id: cat,
    labelKey: `categories.${cat}`,
    dbSlug: cat,
    icon: CATEGORY_ICONS[cat] || BookOpen,
  })),
];

interface Program {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  access_type: string | null;
  access_level: string | null;
  price_huf: number | null;
  category: string | null;
  is_featured: boolean | null;
  is_sponsored: boolean | null;
  sponsor_name: string | null;
  sponsor_logo_url: string | null;
  fixed_sponsor_amount: number | null;
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
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredCreator, setFilteredCreator] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sponsorshipData, setSponsorshipData] = useState<Record<string, { maxSeats: number; usedSeats: number; contribution: number }>>({});

  const creatorFilter = searchParams.get("creator");

  // CRITICAL: All hooks must be called BEFORE any conditional returns
  // Bulk detect sponsor support for all filtered programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch =
        !searchQuery ||
        String(program.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(program.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter using dbSlug mapping
      const matchesCategory = selectedCategory === "all" || (() => {
        const selectedCat = CATEGORIES.find(c => c.id === selectedCategory);
        if (!selectedCat || !selectedCat.dbSlug) return true;
        return program.category === selectedCat.dbSlug || program.category === selectedCategory;
      })();

      return matchesSearch && matchesCategory;
    });
  }, [programs, searchQuery, selectedCategory]);

  const programsForSupport = useMemo(() => {
    // Always return an array to ensure stable hook call
    if (!filteredPrograms || filteredPrograms.length === 0) {
      return [];
    }
    return filteredPrograms.map(p => ({
      id: p.id,
      currency: ((p as any).currency as Currency) || "HUF"
    }));
  }, [filteredPrograms]);

  // Always call the hook, even with empty array - React Query will handle it
  const { data: supportMap } = useBulkProgramSupport(programsForSupport);

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

  // Helper to clean program title - ONLY strip [DEV] prefix
  const cleanProgramTitle = (title: string): string => {
    if (!title) return '';
    return title.replace(/^\[DEV\]\s*/i, '').trim();
  };

  // Fetch programs from Supabase
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        // DEV DIAGNOSTICS: Log Supabase connection info and check schema
        if (import.meta.env.DEV) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl) {
            try {
              const host = new URL(supabaseUrl).host;
            } catch (e) {
              // Supabase URL check
            }
          }
        }

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
            access_level,
            price_huf,
            category,
            is_featured,
            is_sponsored,
            sponsor_name,
            sponsor_logo_url,
            fixed_sponsor_amount,
            creator_id,
            content_type,
            max_capacity,
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

        // DEV DIAGNOSTICS: Log query results and errors
        if (import.meta.env.DEV) {
          if (contentsError) {
            console.error('  ❌ Query error:', contentsError.message);
            console.error('  Error details:', contentsError);
          }
        }

        if (contentsError || !contentsData || contentsData.length === 0) {
          setPrograms([]);
          setIsLoading(false);
          return;
        }

        // BUSINESS POLICY: Only show programs with content in current language
        // NO FALLBACK to other languages. Uses embedded language fields in expert_contents.
        // HU: requires title + description
        // EN: requires title_en + description_en
        // DE: requires title_de + description_de
        const localizedContents = (contentsData || []).filter(c => {
          if (language === 'hu') {
            return c.title && c.title.trim() !== '' && c.description && c.description.trim() !== '';
          } else if (language === 'en') {
            return c.title_en && c.title_en.trim() !== '' && c.description_en && c.description_en.trim() !== '';
          } else if (language === 'de') {
            return c.title_de && c.title_de.trim() !== '' && c.description_de && c.description_de.trim() !== '';
          }
          return false;
        });

        // DEV DIAGNOSTICS - Language filter results
        if (import.meta.env.DEV) {
          // Language filter diagnostics removed
        }

        // Fetch all content_sponsorships for these programs
        const sponsorshipContentIds = localizedContents.map(c => c.id);
        const { data: sponsorships } = await supabase
          .from('content_sponsorships')
          .select('content_id, total_licenses, used_licenses, max_sponsored_seats, sponsored_seats_used, sponsor_contribution_huf, is_active')
          .in('content_id', sponsorshipContentIds)
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
        const creatorIds = [...new Set((localizedContents || []).map(c => c.creator_id).filter(Boolean))];
        
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
        const mappedPrograms: Program[] = (localizedContents || []).map((content, idx) => {
          const creator = content.creator_id ? profilesMap[content.creator_id] : null;
          
          // Use language-specific fields based on current language
          let localizedTitle = content.title || '';
          let localizedDescription = content.description || '';
          
          if (language === 'en') {
            localizedTitle = content.title_en || content.title || '';
            localizedDescription = content.description_en || content.description || '';
          } else if (language === 'de') {
            localizedTitle = content.title_de || content.title || '';
            localizedDescription = content.description_de || content.description || '';
          }

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
            title: localizedTitle,
            description: localizedDescription,
            image_url: resolveImageUrl(content.image_url),
            thumbnail_url: resolveImageUrl(content.thumbnail_url),
            access_type: content.access_type,
            access_level: (contentData.access_level as string) || content.access_type || 'one_time_purchase',
            price_huf: content.price_huf,
            category: content.category,
            is_featured: content.is_featured,
            is_sponsored: content.is_sponsored,
            sponsor_name: content.sponsor_name || (content.is_sponsored ? FALLBACK_SPONSOR[language as keyof typeof FALLBACK_SPONSOR] : null),
            sponsor_logo_url: (contentData.sponsor_logo_url as string) || null,
            fixed_sponsor_amount: (contentData.fixed_sponsor_amount as number) || sponsorContribution || null,
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
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [creatorFilter, language]);

  const getPricingDisplay = (program: Program) => {
    const pricing = calculatePricing({
      basePrice: program.price_huf || 0,
      sponsorAmount: program.fixed_sponsor_amount || 0,
      platformFeePercent: 20
    });
    
    return (
      <PricingDisplay 
        pricing={pricing}
        sponsorName={program.sponsor_name || undefined}
        sponsorLogoUrl={program.sponsor_logo_url || undefined}
        variant="card"
      />
    );
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
          <div className="py-8">
            <ProgramGridSkeleton count={6} />
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
                
                {/* DEV ONLY: Comprehensive Empty State Diagnostics */}
                {false && import.meta.env.DEV && (
                  <div className="max-w-3xl mx-auto mb-8 p-6 bg-amber-50 border-2 border-amber-300 rounded-lg text-left shadow-lg">
                    <h4 className="font-bold text-amber-900 mb-4 text-lg">🔧 DEV DIAGNOSTICS: Why 0 programs?</h4>
                    
                    {/* DIAGNOSIS SECTION */}
                    <div className="space-y-3 text-sm">
                      {/* Root cause analysis */}
                      {programs.length === 0 ? (
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                          <p className="font-bold text-red-900 text-base mb-2">❌ ROOT CAUSE: No published programs in database</p>
                          <p className="text-red-800 mb-2">
                            <strong>Fetched:</strong> {programs.length} published programs from DB
                          </p>
                          <p className="text-xs text-red-700 mt-2">
                            Marketplace uses ONLY real DB data. No mock fallback in DEV or production.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                          <p className="font-bold text-orange-900 text-base mb-2">⚠️ ROOT CAUSE: No approved localization for language "{language}"</p>
                          <p className="text-orange-800 mb-2">
                            <strong>Fetched:</strong> {programs.length} published programs<br/>
                            <strong>Approved {language.toUpperCase()}:</strong> {programs.filter(p => p.title).length} programs
                          </p>
                          <div className="bg-orange-100 border border-orange-200 rounded p-2 mt-2">
                            <p className="text-xs font-semibold text-orange-900 mb-1">📋 BUSINESS POLICY:</p>
                            <p className="text-xs text-orange-800">
                              Marketplace shows ONLY programs with approved localizations in current language.
                              <br/>❌ NO fallback to other languages
                              <br/>❌ NO mixed-language content
                              <br/>✅ Quality over availability
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Detailed counts */}
                      <div className="bg-white border border-amber-300 rounded-lg p-4">
                        <p className="font-semibold text-amber-900 mb-3">📊 Detailed Counts:</p>
                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div className="bg-gray-50 p-3 rounded border">
                            <div className="text-gray-600 mb-1">Published</div>
                            <div className={`text-2xl font-bold ${programs.length === 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {programs.length}
                            </div>
                            <div className="text-gray-500 mt-1">from DB</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border">
                            <div className="text-gray-600 mb-1">Approved {language.toUpperCase()}</div>
                            <div className={`text-2xl font-bold ${programs.filter(p => p.title).length === 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {programs.filter(p => p.title).length}
                            </div>
                            <div className="text-gray-500 mt-1">with localization</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border">
                            <div className="text-gray-600 mb-1">After Filters</div>
                            <div className="text-2xl font-bold text-blue-600">{filteredPrograms.length}</div>
                            <div className="text-gray-500 mt-1">search + category</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border">
                            <div className="text-gray-600 mb-1">Sponsor Rules</div>
                            <div className={`text-2xl font-bold ${supportMap && Object.keys(supportMap).length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {supportMap ? Object.values(supportMap).filter(s => s?.hasSupport).length : 0}
                            </div>
                            <div className="text-gray-500 mt-1">active</div>
                          </div>
                        </div>
                        
                        {/* Sponsor support warning */}
                        {supportMap && Object.keys(supportMap).length === 0 && programs.length > 0 && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-xs text-yellow-800">
                              ⚠️ No active sponsor support rules found. "Sponsored" badge will not appear.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* SOLUTION SECTION */}
                      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                        <p className="font-bold text-green-900 mb-3 text-base">✅ SOLUTION: Run seed script</p>
                        
                        <div className="space-y-2 text-xs text-green-800">
                          <p className="font-semibold">📝 EXACT STEPS:</p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Open <strong>Supabase Dashboard</strong> → SQL Editor</li>
                            <li>Open file <code className="bg-green-100 px-2 py-1 rounded font-mono">supabase/seed_marketplace_dev.sql</code> in your code editor</li>
                            <li>Copy the <strong>ENTIRE FILE CONTENTS</strong> (not the file path!)</li>
                            <li>Paste into SQL Editor</li>
                            <li>Click <strong>"Run"</strong> or press Cmd+Enter</li>
                            <li>Verify output: <code className="bg-green-100 px-2 py-1 rounded">"✅ MARKETPLACE SEED COMPLETE"</code></li>
                            <li>Check verification queries show ✅ PASS for all checks</li>
                            <li>Hard refresh this page: <strong>Cmd+Shift+R</strong> (Mac) or <strong>Ctrl+Shift+R</strong> (Windows)</li>
                          </ol>
                          
                          <div className="bg-green-100 border border-green-200 rounded p-2 mt-3">
                            <p className="font-semibold mb-1">📦 What seed creates:</p>
                            <ul className="list-disc list-inside space-y-0.5 ml-2">
                              <li>2 published programs (1 HUF, 1 EUR)</li>
                              <li>Approved localizations in HU/DE/EN for both</li>
                              <li>1 active sponsor support rule (HUF program)</li>
                              <li>Test expert + sponsor profiles</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-100 border border-green-200 rounded p-2 mt-2">
                            <p className="font-semibold mb-1">✅ Expected result after seed:</p>
                            <ul className="list-disc list-inside space-y-0.5 ml-2">
                              <li>2 programs visible in HU/DE/EN (language switching works)</li>
                              <li>HUF program has "Támogatott/Sponsored" badge</li>
                              <li>Program detail shows SupportBreakdownCard</li>
                            </ul>
                          </div>
                          
                          <p className="mt-3 text-xs text-green-700">
                            <strong>Note:</strong> Seed is idempotent (safe to re-run). Uses fixed UUIDs and ON CONFLICT.
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional checks */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-blue-900 text-xs mb-2">🔍 Additional Checks:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-800 ml-2">
                          <li>localStorage language: <code className="bg-blue-100 px-1 rounded">{language}</code> (matches seed approvals?)</li>
                          <li>Console errors: Check browser DevTools (F12) for RLS or query errors</li>
                          <li>Auth users: Ensure user2@wellagora.dev and user3@wellagora.dev exist in Auth Dashboard</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
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

                            {/* Badges - Sponsored and Free only */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              {/* Sponsored badge - from is_sponsored field */}
                              {program.is_sponsored && program.fixed_sponsor_amount && program.fixed_sponsor_amount > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex flex-col gap-1"
                                >
                                  <SponsoredBadge />
                                  {/* Sponsor branding */}
                                  {program.sponsor_logo_url ? (
                                    <img 
                                      src={program.sponsor_logo_url} 
                                      alt={program.sponsor_name || 'Sponsor'} 
                                      className="h-4 w-auto object-contain bg-white/90 px-2 py-0.5 rounded"
                                    />
                                  ) : program.sponsor_name ? (
                                    <span className="text-xs bg-white/90 px-2 py-0.5 rounded text-gray-700">
                                      {program.sponsor_name}
                                    </span>
                                  ) : null}
                                </motion.div>
                              )}
                              
                              {/* Free badge - ONLY if truly free */}
                              {(program.access_level === 'free' || program.price_huf === 0) && (
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold tracking-wide uppercase shadow-lg shadow-emerald-500/25"
                                >
                                  {language === 'hu' ? 'INGYENES' : language === 'de' ? 'KOSTENLOS' : 'FREE'}
                                </motion.span>
                              )}
                            </div>

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
                                {program.content_type === 'recorded' && `🎥 ${t('content_type.recorded')}`}
                                {program.content_type === 'online_live' && `💻 ${t('content_type.online_live')}`}
                                {(program.content_type === 'in_person' || !program.content_type) && `📍 ${t('content_type.in_person')}`}
                              </span>
                              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-black/40">
                                {getCategoryLabel(program.category)}
                              </span>
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-black transition-colors duration-300">
                              {cleanProgramTitle(String(program.title))}
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

                            {/* Price/Access badge */}
                            <div className="mt-4">
                              {getPricingDisplay(program)}
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
