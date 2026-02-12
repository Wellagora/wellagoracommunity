import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVouchers } from "@/hooks/useVouchers";
import { useFavorites } from "@/hooks/useFavorites";
import { useProgramSupport } from "@/hooks/useSponsorSupport";
import { calculateSupportBreakdown } from "@/lib/sponsorSupport";
import { calculatePricing } from '@/lib/pricing';
import { PricingDisplay } from '@/components/PricingDisplay';
import { SupportBreakdownCard, SponsoredBadge } from "@/components/sponsor/SupportBreakdownCard";
import type { Currency } from "@/types/sponsorSupport";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Star, 
  PlayCircle, 
  Lock, 
  Crown, 
  CheckCircle2,
  ShoppingCart,
  Ticket,
  Check,
  MapPin,
  Monitor,
  Video,
  Sparkles,
  Heart,
  Clock,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
import PurchaseModal from "@/components/PurchaseModal";
import { enrollFree, startPaidCheckout, isFreeContent } from "@/services/enrollmentService";
import MobileStickyPurchaseBar from "@/components/program/MobileStickyPurchaseBar";
import ProblemSolutionSection from "@/components/program/ProblemSolutionSection";
import ProgramJsonLd from "@/components/seo/ProgramJsonLd";
import ReviewSection from "@/components/reviews/ReviewSection";
import StarRating from "@/components/reviews/StarRating";
import GracefulPlaceholder from "@/components/GracefulPlaceholder";
import { ShareToolkit } from "@/components/expert/ShareToolkit";
import SEOHead from "@/components/SEOHead";
import { useShareTracking } from "@/hooks/useShareTracking";
import GuestRegistrationForm from "@/components/program/GuestRegistrationForm";

const ProgramDetailPage = () => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isClaimingVoucher, setIsClaimingVoucher] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { claimVoucher, hasVoucherForContent, getVoucherByContentId } = useVouchers();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Track UTM-based share clicks
  useShareTracking({ programId: id });

  // Check if user already has voucher for this program
  const existingVoucher = id ? getVoucherByContentId(id) : undefined;
  const alreadyClaimed = id ? hasVoucherForContent(id) : false;

  // Fetch program with creator - use maybeSingle to avoid errors
  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_contents')
        .select(`
          *,
          creator:profiles!expert_contents_creator_id_fkey (
            id, first_name, last_name, avatar_url, is_verified_expert
          )
        `)
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check access status
  const { data: accessStatus, isLoading: accessLoading } = useQuery({
    queryKey: ['contentAccess', id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_content_access_status', {
        p_content_id: id,
        p_user_id: user?.id || null
      });
      return data as {
        has_access: boolean;
        reason: string;
        access_level: string | null;
        price: number | null;
      };
    },
    enabled: !!id,
  });

  // Detect sponsor support for this program
  const programCurrency: Currency = ((program as any)?.currency as Currency) || "HUF";
  const { data: supportData } = useProgramSupport(id, programCurrency);
  
  // Fetch sponsor logo if support exists
  const { data: sponsorProfile } = useQuery({
    queryKey: ['sponsorProfile', supportData?.rule?.sponsor_id],
    queryFn: async () => {
      if (!supportData?.rule?.sponsor_id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', supportData.rule.sponsor_id)
        .single();
      return data;
    },
    enabled: !!supportData?.rule?.sponsor_id,
  });
  
  // Calculate support breakdown if available
  const supportBreakdown = supportData
    ? calculateSupportBreakdown(
        program.price_huf,
        supportData.rule.amount_per_participant,
        programCurrency,
        supportData.sponsorName
      )
    : null;

  // Fetch active sponsorship for this program with quota info
  const { data: sponsorship } = useQuery({
    queryKey: ['programSponsorship', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('content_sponsorships')
        .select('id, sponsor_contribution_huf, is_active, total_licenses, used_licenses, max_sponsored_seats, sponsored_seats_used')
        .eq('content_id', id)
        .eq('is_active', true)
        .maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  // Calculate quota status
  const quotaInfo = sponsorship ? {
    maxSeats: sponsorship.max_sponsored_seats || sponsorship.total_licenses || 10,
    usedSeats: sponsorship.sponsored_seats_used || sponsorship.used_licenses || 0,
    get remainingSeats() { return Math.max(0, this.maxSeats - this.usedSeats); },
    get isExhausted() { return this.remainingSeats === 0; }
  } : null;

  // Fetch related programs from same creator - use mock data for mock programs
  const { data: relatedPrograms } = useQuery({
    queryKey: ['relatedPrograms', program?.creator_id, id],
    queryFn: async () => {
      const { data } = await supabase
        .from('expert_contents')
        .select('id, thumbnail_url, access_level, price_huf')
        .eq('creator_id', program?.creator_id)
        .eq('is_published', true)
        .neq('id', id)
        .limit(3);
      const relIds = (data || []).map((r) => r.id);
      if (relIds.length === 0) return [];

      const { data: relLocs } = await supabase
        .from('content_localizations')
        .select('content_id, title')
        .in('content_id', relIds)
        .eq('locale', language)
        .eq('is_approved', true);

      const titleById: Record<string, string> = {};
      for (const row of (relLocs || []) as any[]) {
        if (row?.content_id && row?.title) titleById[row.content_id] = row.title;
      }

      return (data || [])
        .filter((r) => !!titleById[r.id])
        .map((r) => ({ ...r, title: titleById[r.id] }));
    },
    enabled: !!program?.creator_id,
  });

  // Fetch average rating
  const { data: avgRating } = useQuery({
    queryKey: ['contentAvgRating', id],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_content_average_rating', {
        p_content_id: id,
      });
      return data as number;
    },
    enabled: !!id,
  });

  // Fetch review count
  const { data: reviewCount } = useQuery({
    queryKey: ['contentReviewCount', id],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_content_review_count', {
        p_content_id: id,
      });
      return data as number;
    },
    enabled: !!id,
  });

  const getAccessBadge = (accessLevel: string | null) => {
    switch (accessLevel) {
      case 'free':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">{t('program.free_access')}</Badge>;
      case 'registered':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">{t('common.registered')}</Badge>;
      case 'premium':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'one_time_purchase':
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30"><ShoppingCart className="w-3 h-3 mr-1" />{t('program.purchase')}</Badge>;
      case 'sponsored':
        return <Badge className="bg-primary/20 text-primary border-primary/30"><Ticket className="w-3 h-3 mr-1" />{t('common.sponsor')}</Badge>;
      default:
        return null;
    }
  };

  // Handler for voucher claim (real implementation)
  const handleClaimVoucher = async () => {
    if (!id) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setIsClaimingVoucher(true);
    try {
      const result = await claimVoucher(id);
      if (result.success && result.voucher) {
        // Show success with voucher code
        toast({
          title: t('voucher.claimed_success') || "Sikeresen csatlakoztál! 🎉",
          description: `${t('voucher.code_label') || 'Kuponkód'}: ${result.voucher.code}`,
        });
      }
    } finally {
      setIsClaimingVoucher(false);
    }
  };

  const renderCTAButton = () => {
    // If user already has a voucher for this content
    if (alreadyClaimed && existingVoucher) {
      return (
        <div className="space-y-3 w-full">
          <Button 
            size="lg"
            variant="outline"
            className="w-full border-emerald-500/50 text-emerald-600 bg-emerald-50 cursor-default"
            disabled
          >
            <Check className="w-5 h-5 mr-2" />
            {t('voucher.already_claimed') || 'Már csatlakoztál'}
          </Button>
          <div className="text-center">
            <Badge variant="outline" className="text-sm font-mono border-black/20 px-3 py-1">
              {existingVoucher.code}
            </Badge>
          </div>
        </div>
      );
    }

    // Check if this is a SPONSORED program (is_sponsored=true)
    const isSponsored = (program as any)?.is_sponsored === true;

    // For SPONSORED programs, show voucher claim button
    if (isSponsored && id) {
      // If quota is exhausted, show impact message instead
      if (quotaInfo?.isExhausted) {
        return (
          <div className="space-y-3 w-full">
            <Button 
              size="lg"
              variant="outline"
              className="w-full border-amber-500/50 text-amber-600 bg-amber-50 cursor-not-allowed"
              disabled
            >
              {t('voucher.quota_exhausted') || 'Elfogyott a támogatott keret'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {quotaInfo.usedSeats} {t('sponsor.members_supported') || 'Tag részvételét támogatta'}
            </p>
          </div>
        );
      }

      return (
        <Button 
          size="lg"
          className="bg-black hover:bg-black/90 text-white font-semibold shadow-lg w-full"
          onClick={handleClaimVoucher}
          disabled={isClaimingVoucher}
        >
          {isClaimingVoucher ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {t('common.loading') || 'Betöltés...'}
            </>
          ) : (
            <>
              <Ticket className="w-5 h-5 mr-2" />
              {t('voucher.claim_spot') || 'Támogatott hely igénylése'}
            </>
          )}
        </Button>
      );
    }
    
    // Fallback for sponsored programs without id
    if (isSponsored) {
      return (
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg w-full"
          onClick={handleClaimVoucher}
          disabled={isClaimingVoucher}
        >
          <Ticket className="w-5 h-5 mr-2" />
          {t('voucher.generate_btn')}
        </Button>
      );
    }

    if (accessLoading) {
      return <Skeleton className="h-12 w-48" />;
    }

    if (!accessStatus) return null;

    const { reason, price } = accessStatus;

    switch (reason) {
      case 'free':
      case 'registered':
      case 'purchased':
      case 'premium_subscriber':
        // User already has access — show "Megnyitás" button
        return (
          <Button 
            size="lg"
            variant="outline"
            className="w-full border-emerald-500/50 text-emerald-600 bg-emerald-50"
            onClick={() => {
              navigate(`/piacer/${id}/learn`);
            }}
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Megnyitás
          </Button>
        );
      case 'login_required':
        return id ? <GuestRegistrationForm programId={id} /> : null;
      case 'premium_required':
        return (
          <Button 
            size="lg"
            variant="outline"
            className="opacity-50 cursor-not-allowed"
            disabled
          >
            <Crown className="w-5 h-5 mr-2" />
            {t('program.premium_required')}
          </Button>
        );
      case 'purchase_required': {
        // If not logged in, show guest registration form
        if (!user && id) {
          return <GuestRegistrationForm programId={id} />;
        }

        // Determine if free or paid
        const isFree = isFreeContent(program.price_huf);
        
        if (isFree) {
          // FREE enrollment — direct insert
          return (
            <Button 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg w-full"
              disabled={isEnrolling}
              onClick={async () => {
                if (!user) { navigate('/auth'); return; }
                setIsEnrolling(true);
                try {
                  const result = await enrollFree(id!, user.id);
                  if (result.success) {
                    toast.success('Sikeresen regisztráltál! 🎉');
                    // Refresh access status
                    window.location.reload();
                  } else {
                    toast.error(result.error || 'Hiba történt');
                  }
                } finally {
                  setIsEnrolling(false);
                }
              }}
            >
              {isEnrolling ? (
                <><span className="animate-spin mr-2">⏳</span>Regisztráció...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5 mr-2" />Regisztrálok</>
              )}
            </Button>
          );
        }

        // PAID enrollment — Stripe checkout
        return (
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg w-full"
            disabled={isEnrolling}
            onClick={async () => {
              if (!user) { navigate('/auth'); return; }
              setIsEnrolling(true);
              try {
                const result = await startPaidCheckout(
                  id!,
                  user.id,
                  program.creator_id || '',
                  program.title || '',
                  program.price_huf || 0
                );
                if (result.success && result.checkoutUrl) {
                  window.location.href = result.checkoutUrl;
                } else {
                  toast.error(result.error || 'Fizetési hiba');
                }
              } finally {
                setIsEnrolling(false);
              }
            }}
          >
            {isEnrolling ? (
              <><span className="animate-spin mr-2">⏳</span>Feldolgozás...</>
            ) : (
              <><ShoppingCart className="w-5 h-5 mr-2" />Megveszem — {(program.price_huf || 0).toLocaleString('hu-HU')} Ft</>
            )}
          </Button>
        );
      }
      default:
        return null;
    }
  };

  if (programLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px] w-full rounded-2xl mb-6" />
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <GracefulPlaceholder 
        title={t("common.coming_soon")}
        description={t("common.coming_soon_desc")}
      />
    );
  }

  const creator = program.creator as { id: string; first_name: string; last_name: string; avatar_url: string | null; is_verified_expert: boolean } | null;
  
  // Helper to clean program title - ONLY strip [DEV] prefix
  const cleanProgramTitle = (title: string): string => {
    if (!title) return '';
    return title.replace(/^\[DEV\]\s*/i, '').trim();
  };
  
  // Get localized title and description from embedded language fields
  const programData = program as any;
  let localizedTitle = '';
  let localizedDescription = '';
  
  // Use embedded language fields based on current language
  if (language === 'hu') {
    localizedTitle = cleanProgramTitle(programData?.title || '');
    localizedDescription = programData?.description || '';
  } else if (language === 'en') {
    localizedTitle = cleanProgramTitle(programData?.title_en || '');
    localizedDescription = programData?.description_en || '';
  } else if (language === 'de') {
    localizedTitle = cleanProgramTitle(programData?.title_de || '');
    localizedDescription = programData?.description_de || '';
  }
  
  // If no localized content exists, show placeholder
  if (!localizedTitle || !localizedDescription) {
    return (
      <GracefulPlaceholder
        title={t('creator.translation.not_available_public')}
        description=""
      />
    );
  }

  // Calculate sponsor contribution for JSON-LD
  const sponsorContributionForSeo = sponsorship?.sponsor_contribution_huf || (program as any)?.fixed_sponsor_amount || 0;
  const memberPaymentForSeo = Math.max(0, (program?.price_huf || 0) - sponsorContributionForSeo);
  
  // Extract problem_solution from program (cast as extended type since DB was updated)
  const programWithExtras = program as typeof program & { 
    problem_solution?: { problem?: string; solution?: string } | null 
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic OG meta tags for social sharing */}
      {program && (
        <SEOHead
          title={localizedTitle}
          description={localizedDescription?.substring(0, 155) || `${localizedTitle} — WellAgora`}
          image={program.image_url || program.thumbnail_url || undefined}
          url={`/program/${program.id}`}
          type="article"
        />
      )}

      {/* JSON-LD Schema for AI/GEO optimization */}
      {program && (
        <ProgramJsonLd 
          program={{
            id: program.id,
            title: localizedTitle,
            description: localizedDescription,
            image_url: program.image_url,
            price_huf: program.price_huf,
            category: program.category,
            content_type: program.content_type,
            is_sponsored: program.is_sponsored,
            sponsor_name: program.sponsor_name,
            problem_solution: programWithExtras.problem_solution || null
          }}
          creator={creator}
          sponsorContribution={sponsorContributionForSeo}
          memberPayment={memberPaymentForSeo}
          rating={avgRating || undefined}
          reviewCount={reviewCount || undefined}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('program.back')}
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Image + Description */}
            <div className="lg:col-span-2">
              {/* Hero Image - Max 400px height */}
              <div className="relative max-h-[400px] rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary/10 to-accent/10">
                {program.thumbnail_url || program.image_url ? (
                  <img 
                    src={program.thumbnail_url || program.image_url} 
                    alt={localizedTitle}
                    className="w-full h-full max-h-[400px] object-cover"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center">
                    <div className="text-6xl opacity-30">📚</div>
                  </div>
                )}
              </div>

              {/* Badges Row with Event Format Tag */}
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Event Format Tag */}
                {program.content_type && (
                  <Badge className="bg-black/10 text-foreground border-black/20">
                    {program.content_type === 'in_person' && <><MapPin className="w-3 h-3 mr-1" />📍 Élő esemény</>}
                    {program.content_type === 'online_live' && <><Monitor className="w-3 h-3 mr-1" />💻 Online élő</>}
                    {program.content_type === 'recorded' && <><Video className="w-3 h-3 mr-1" />🎥 Videókurzus</>}
                  </Badge>
                )}
                {!program.content_type && (
                  <Badge className="bg-black/10 text-foreground border-black/20">
                    <MapPin className="w-3 h-3 mr-1" />📍 Élő esemény
                  </Badge>
                )}
                
                {getAccessBadge(program.access_level)}
                {program.is_sponsored && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {t('program.sponsored_badge')}
                  </Badge>
                )}
                {program.is_featured && (
                  <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                    <Star className="w-3 h-3 mr-1 fill-amber-500" />
                    {t('creator.status_featured')}
                  </Badge>
                )}
              </div>

              {program.is_sponsored && (
                <p className="text-sm text-muted-foreground mb-4">
                  {t('program.sponsored_explainer')}
                </p>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {localizedTitle}
              </h1>

              {/* Rating Display */}
              {reviewCount !== undefined && reviewCount > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={Math.round(avgRating || 0)} size="md" />
                  <span className="text-muted-foreground">
                    {avgRating?.toFixed(1)} ({reviewCount} {t('reviews.count')})
                  </span>
                </div>
              )}

              {/* Creator Section */}
              {creator && (
                <Link 
                  to={`/szakertok/${creator.id}`}
                  className="flex items-center gap-3 mb-6 group"
                >
                  <Avatar className="h-12 w-12 border-2 border-primary/30">
                    <AvatarImage src={creator.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {creator.first_name?.[0]}{creator.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('program.by_creator')}</span>
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {creator.first_name} {creator.last_name}
                      </span>
                      {creator.is_verified_expert && (
                        <CheckCircle2 className="w-4 h-4 text-primary fill-primary/20" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('program.pilot_creator_framing')}
                    </p>
                  </div>
                </Link>
              )}

              {/* Problem-Solution Section for AI/GEO optimization */}
              {programWithExtras.problem_solution && (
                <ProblemSolutionSection 
                  problem={programWithExtras.problem_solution?.problem}
                  solution={programWithExtras.problem_solution?.solution}
                />
              )}

              {/* Description */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">{t('program.description')}</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {localizedDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              {id && <ReviewSection contentId={id} />}
            </div>

            {/* Right Column: Sticky Voucher/Action Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <CardContent className="p-6">
                    {/* Centralized Pricing Display */}
                    {program.access_level === 'one_time_purchase' && program.price_huf && (() => {
                      // Determine sponsor amount from multiple sources
                      const sponsorAmount = sponsorship?.sponsor_contribution_huf 
                        || (program as any).fixed_sponsor_amount 
                        || 0;
                      
                      const sponsorName = (program as any).sponsor_name || null;
                      
                      // Pricing calculation
                      
                      return (
                        <div className="mb-4">
                          <PricingDisplay 
                            pricing={calculatePricing({
                              basePrice: program.price_huf || 0,
                              sponsorAmount: sponsorAmount,
                              platformFeePercent: (program as any).platform_fee_percent || 20
                            })}
                            sponsorName={sponsorName}
                            sponsorLogoUrl={sponsorProfile?.avatar_url || undefined}
                            variant="detail"
                          />
                        </div>
                      );
                    })()}

                    {/* CTA Button */}
                    <div className="mb-6">
                      {renderCTAButton()}
                      {/* Dynamic subtitle based on pricing */}
                      <p className="mt-3 text-sm text-muted-foreground">
                        {(() => {
                          const isFree = !program.price_huf || program.price_huf === 0;
                          const isSponsored = (program as any).is_sponsored && ((program as any).fixed_sponsor_amount || sponsorship?.sponsor_contribution_huf);
                          
                          if (isFree) {
                            return 'Azonnal hozzáférsz a program tartalmához.';
                          } else if (isSponsored) {
                            const originalPrice = program.price_huf || 0;
                            return `Kedvezményes ár szponzori támogatással. Eredeti ár: ${originalPrice.toLocaleString()} Ft`;
                          } else {
                            return 'Egyszeri díj, korlátlan hozzáférés.';
                          }
                        })()}
                      </p>
                    </div>

                    {/* Share Button */}
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setShareOpen(true)}
                      >
                        <Share2 className="w-4 h-4" />
                        {t('share.share_program')}
                      </Button>
                    </div>

                    {/* Program Metadata */}
                    <div className="space-y-3 pt-4 border-t border-border">
                      {/* Category Badge */}
                      {program.category && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Kategória:</span>
                          <Badge variant="outline">
                            {t(`categories.${program.category}`)}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Format Badge */}
                      {program.content_type && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Formátum:</span>
                          <Badge variant="outline">
                            {program.content_type === 'in_person' && '📍 Élő esemény'}
                            {program.content_type === 'online_live' && '💻 Online élő'}
                            {program.content_type === 'recorded' && '🎥 Videókurzus'}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Participants count if available */}
                      {(program as any).participant_count && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Résztvevők:</span>
                          <span className="text-sm font-medium">{(program as any).participant_count}</span>
                        </div>
                      )}
                    </div>

                    {/* Tools Needed */}
                    {program.tools_needed && (
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-medium text-foreground mb-2">{t('program.tools_needed')}</h4>
                        <p className="text-sm text-muted-foreground">{program.tools_needed}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Related Programs Section */}
          {relatedPrograms && relatedPrograms.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t('program.more_from_expert')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPrograms.map((relProgram) => (
                  <Link key={relProgram.id} to={`/piacer/${relProgram.id}`}>
                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg overflow-hidden">
                          {relProgram.thumbnail_url ? (
                            <img 
                              src={relProgram.thumbnail_url} 
                              alt={(relProgram as any)?.title || ''}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-4xl opacity-30">📚</div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            {(relProgram as any)?.title || ''}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getAccessBadge(relProgram.access_level)}
                            {relProgram.access_level === 'one_time_purchase' && relProgram.price_huf && (
                              <span className="text-sm text-muted-foreground">
                                {relProgram.price_huf.toLocaleString()} Ft
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Purchase Modal */}
        {program && (() => {
          const creatorId = (program as any).creator?.id || program.creator_id || '';
          
          return (
            <PurchaseModal
              isOpen={isPurchaseModalOpen}
              onClose={() => setIsPurchaseModalOpen(false)}
              content={{
                id: program.id,
                title: localizedTitle,
                price_huf: program.price_huf || 0,
                creator_id: creatorId,
                is_sponsored: (program as any).is_sponsored || false,
                sponsor_name: (program as any).sponsor_name || undefined,
                sponsor_contribution: sponsorship?.sponsor_contribution_huf || (program as any).fixed_sponsor_amount || undefined,
                sponsorship_id: sponsorship?.id || undefined,
              }}
            />
          );
        })()}

        {/* Share Toolkit Dialog */}
        {shareOpen && program && (
          <ShareToolkit
            type="program"
            programUrl={`${window.location.origin}/program/${program.id}`}
            expertName={`${(program as any).creator?.first_name || ''} ${(program as any).creator?.last_name || ''}`.trim()}
            programTitle={localizedTitle}
            programDate={program.event_date ? new Date(program.event_date).toLocaleDateString(language === 'hu' ? 'hu-HU' : language === 'de' ? 'de-DE' : 'en-US') : undefined}
            programPrice={program.price_huf ? `${program.price_huf.toLocaleString()} Ft` : undefined}
            imageUrl={program.image_url || program.thumbnail_url || undefined}
            onClose={() => setShareOpen(false)}
          />
        )}

        {/* Mobile Sticky Purchase Bar */}
        {program && (
          <MobileStickyPurchaseBar
            originalPrice={program.price_huf}
            sponsorContribution={sponsorship?.sponsor_contribution_huf || (program as any).fixed_sponsor_amount}
            isSponsored={(program as any).is_sponsored}
            sponsorName={(program as any).sponsor_name}
            hasAccess={accessStatus?.has_access}
            alreadyClaimed={alreadyClaimed}
            isClaimingVoucher={isClaimingVoucher}
            onPurchaseClick={() => setIsPurchaseModalOpen(true)}
            onClaimVoucher={(program as any).is_sponsored && !quotaInfo?.isExhausted ? handleClaimVoucher : undefined}
            accessLevel={program.access_level}
            remainingSeats={quotaInfo?.remainingSeats}
            isQuotaExhausted={quotaInfo?.isExhausted}
          />
        )}
      </div>
    </div>
  );
};

export default ProgramDetailPage;