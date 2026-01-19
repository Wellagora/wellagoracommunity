import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useVouchers } from "@/hooks/useVouchers";
import { useFavorites } from "@/hooks/useFavorites";
import { MOCK_PROGRAMS, getMockExpertById } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
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
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import PurchaseModal from "@/components/PurchaseModal";
import MobileStickyPurchaseBar from "@/components/program/MobileStickyPurchaseBar";
import ProblemSolutionSection from "@/components/program/ProblemSolutionSection";
import ProgramJsonLd from "@/components/seo/ProgramJsonLd";
import ReviewSection from "@/components/reviews/ReviewSection";
import StarRating from "@/components/reviews/StarRating";
import GracefulPlaceholder from "@/components/GracefulPlaceholder";

const ProgramDetailPage = () => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isClaimingVoucher, setIsClaimingVoucher] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();
  const { claimVoucher, hasVoucherForContent, getVoucherByContentId } = useVouchers();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Check if this is a mock program
  const isMockProgram = id?.startsWith('mock-program-');
  
  // Check if user already has voucher for this program
  const existingVoucher = id ? getVoucherByContentId(id) : undefined;
  const alreadyClaimed = id ? hasVoucherForContent(id) : false;

  // Fetch program with creator - use maybeSingle to avoid errors
  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      // If mock program, return mock data
      if (isMockProgram) {
        const mockProgram = MOCK_PROGRAMS.find(p => p.id === id);
        if (mockProgram) {
          const mockCreator = getMockExpertById(mockProgram.creator_id);
          return {
            ...mockProgram,
            creator: mockCreator ? {
              id: mockCreator.id,
              first_name: mockCreator.first_name,
              last_name: mockCreator.last_name,
              avatar_url: mockCreator.avatar_url,
              is_verified_expert: mockCreator.is_verified_expert
            } : null
          };
        }
        return null;
      }
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

  // Fetch active sponsorship for this program with quota info
  const { data: sponsorship } = useQuery({
    queryKey: ['programSponsorship', id],
    queryFn: async () => {
      if (isMockProgram) return null;
      const { data } = await supabase
        .from('content_sponsorships')
        .select('id, sponsor_contribution_huf, is_active, total_licenses, used_licenses, max_sponsored_seats, sponsored_seats_used')
        .eq('content_id', id)
        .eq('is_active', true)
        .maybeSingle();
      return data;
    },
    enabled: !!id && !isMockProgram,
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
      // For mock programs, use getMockProgramsByExpert
      if (isMockProgram && program?.creator_id) {
        const mockRelated = MOCK_PROGRAMS
          .filter(p => p.creator_id === program.creator_id && p.id !== id)
          .slice(0, 3);
        return mockRelated;
      }
      const { data } = await supabase
        .from('expert_contents')
        .select('id, title, title_en, title_de, thumbnail_url, access_level, price_huf')
        .eq('creator_id', program?.creator_id)
        .eq('is_published', true)
        .neq('id', id)
        .limit(3);
      return data;
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

    // For real programs (not mock), show claim button with quota check
    if (!isMockProgram && id) {
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
    
    // For mock programs, show a special test button
    if (isMockProgram) {
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
        return (
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
            onClick={() => navigate(`/piacer/${id}/learn`)}
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            {t('program.view_content')}
          </Button>
        );
      case 'login_required':
        return (
          <Button 
            size="lg"
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
            onClick={() => navigate('/auth')}
          >
            <Lock className="w-5 h-5 mr-2" />
            {t('program.login_to_view')}
          </Button>
        );
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
      case 'purchase_required':
        return (
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
            onClick={() => setIsPurchaseModalOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {t('program.purchase')}: {price?.toLocaleString()} Ft
          </Button>
        );
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
  
  // Get localized title and description
  const localizedTitle = getLocalizedField(program, 'title');
  const localizedDescription = getLocalizedField(program, 'description') || program.description || t('program.no_description');

  // Calculate sponsor contribution for JSON-LD
  const sponsorContributionForSeo = sponsorship?.sponsor_contribution_huf || (program as any)?.fixed_sponsor_amount || 0;
  const memberPaymentForSeo = Math.max(0, (program?.price_huf || 0) - sponsorContributionForSeo);
  
  // Extract problem_solution from program (cast as extended type since DB was updated)
  const programWithExtras = program as typeof program & { 
    problem_solution?: { problem?: string; solution?: string } | null 
  };

  return (
    <div className="min-h-screen bg-background">
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
                {program.is_featured && (
                  <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                    <Star className="w-3 h-3 mr-1 fill-amber-500" />
                    {t('creator.status_featured')}
                  </Badge>
                )}
              </div>

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
                    {/* Sponsor Info - CONSISTENT with marketplace cards */}
                    {program.is_sponsored && program.sponsor_name && (() => {
                      const contributionAmount = sponsorship?.sponsor_contribution_huf || (program as any).fixed_sponsor_amount || (program.price_huf ? Math.round(program.price_huf * 0.8) : 5000);
                      const memberPayment = Math.max(0, (program.price_huf || 0) - contributionAmount);
                      const formatPrice = (price: number) => `${price.toLocaleString('hu-HU')} Ft`;
                      const isQuotaExhausted = quotaInfo?.isExhausted || false;
                      const remainingSeats = quotaInfo?.remainingSeats || 0;
                      
                      // QUOTA EXHAUSTED: Show impact mode with original price
                      if (isQuotaExhausted) {
                        return (
                          <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/15 to-emerald-500/10 border border-emerald-500/30">
                            {/* Original price - no longer sponsored */}
                            <div className="flex flex-col gap-1 mb-3">
                              <span className="text-2xl font-bold text-foreground">
                                {formatPrice(program.price_huf || 0)}
                              </span>
                            </div>
                            
                            {/* Impact message */}
                            <div className="flex items-center gap-2 mb-3 text-emerald-700">
                              <Heart className="w-4 h-4 fill-emerald-600" />
                              <span className="text-sm font-medium">
                                {quotaInfo?.usedSeats || 0} Tag már igénybe vette a támogatott helyet
                              </span>
                            </div>
                            
                            {/* Sponsor Logo & Name - Still visible for brand awareness */}
                            <Link 
                              to={`/partners/${program.sponsor_name?.toLowerCase().replace(/\s+/g, '-')}`}
                              className="flex items-center gap-3 p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-white border border-border/20 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={`/partner-logos/${program.sponsor_name?.toLowerCase()}.png`}
                                  alt={program.sponsor_name}
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://logo.clearbit.com/${program.sponsor_name?.toLowerCase()}.hu?size=80`;
                                  }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Támogatásával valósult meg
                              </p>
                            </Link>
                          </div>
                        );
                      }
                      
                      // ACTIVE SPONSORSHIP
                      return (
                        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                          {/* URGENCY BADGE: Show when <= 3 seats left */}
                          {remainingSeats > 0 && remainingSeats <= 3 && (
                            <div className="flex items-center gap-1.5 mb-3 px-3 py-2 rounded-full bg-red-500/15 border border-red-500/30 w-fit animate-pulse">
                              <Clock className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-semibold text-red-600">
                                Már csak {remainingSeats} támogatott hely!
                              </span>
                            </div>
                          )}
                          
                          {/* Price hierarchy: strikethrough original, then discounted or FREE badge */}
                          <div className="flex flex-col gap-1 mb-3">
                            {/* Original price strikethrough */}
                            {program.price_huf && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(program.price_huf)}
                              </span>
                            )}
                            {/* Show FREE badge or discounted price */}
                            {memberPayment === 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-semibold text-base w-fit">
                                <Sparkles className="w-4 h-4" />
                                INGYENES
                              </span>
                            ) : (
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(memberPayment)}
                              </span>
                            )}
                          </div>
                          
                          {/* Sponsor support message */}
                          <p className="text-sm text-foreground/80 mb-3">
                            A <span className="font-semibold">{program.sponsor_name}</span> {formatPrice(contributionAmount)}-tal támogatja a részvételedet!
                          </p>
                          
                          {/* Sponsor Logo & Name - Clickable */}
                          <Link 
                            to={`/partners/${program.sponsor_name?.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex items-center gap-3 p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-white border border-border/20 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                              <img 
                                src={`/partner-logos/${program.sponsor_name?.toLowerCase()}.png`}
                                alt={program.sponsor_name}
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://logo.clearbit.com/${program.sponsor_name?.toLowerCase()}.hu?size=80`;
                                }}
                              />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t('marketplace.sponsored_by_label')}</p>
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {program.sponsor_name}
                              </p>
                            </div>
                          </Link>
                        </div>
                      );
                    })()}

                    {/* Price Display - Non-sponsored programs */}
                    {program.access_level === 'one_time_purchase' && program.price_huf && !program.is_sponsored && (
                      <div className="mb-4">
                        <p className="text-3xl font-bold text-foreground">
                          {program.price_huf.toLocaleString()} Ft
                        </p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="mb-6">
                      {renderCTAButton()}
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
                              alt={getLocalizedField(relProgram, 'title')}
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
                            {getLocalizedField(relProgram, 'title')}
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
        {program && (
          <PurchaseModal
            isOpen={isPurchaseModalOpen}
            onClose={() => setIsPurchaseModalOpen(false)}
            content={{
              id: program.id,
              title: localizedTitle,
              price_huf: program.price_huf || 0,
              creator_id: program.creator_id || '',
              is_sponsored: (program as any).is_sponsored || false,
              sponsor_name: (program as any).sponsor_name || undefined,
              sponsor_contribution: sponsorship?.sponsor_contribution_huf || (program as any).fixed_sponsor_amount || undefined,
              sponsorship_id: sponsorship?.id || undefined,
            }}
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