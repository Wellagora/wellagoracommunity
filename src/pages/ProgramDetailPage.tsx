import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Star, 
  ExternalLink, 
  Lock, 
  Crown, 
  CheckCircle2,
  User,
  ShoppingCart
} from "lucide-react";
import { motion } from "framer-motion";

const ProgramDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Fetch program with creator
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
        .single();
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

  // Fetch related programs from same creator
  const { data: relatedPrograms } = useQuery({
    queryKey: ['relatedPrograms', program?.creator_id, id],
    queryFn: async () => {
      const { data } = await supabase
        .from('expert_contents')
        .select('id, title, thumbnail_url, access_level, price_huf')
        .eq('creator_id', program?.creator_id)
        .eq('is_published', true)
        .neq('id', id)
        .limit(3);
      return data;
    },
    enabled: !!program?.creator_id,
  });

  const getAccessBadge = (accessLevel: string | null) => {
    switch (accessLevel) {
      case 'free':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{t('program.free_access')}</Badge>;
      case 'registered':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{t('common.registered')}</Badge>;
      case 'premium':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'one_time_purchase':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><ShoppingCart className="w-3 h-3 mr-1" />{t('program.purchase')}</Badge>;
      default:
        return null;
    }
  };

  const renderCTAButton = () => {
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
            className="bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--primary))] hover:opacity-90 text-white font-semibold"
            onClick={() => program?.content_url && window.open(program.content_url, '_blank')}
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            {t('program.view_content')}
          </Button>
        );
      case 'login_required':
        return (
          <Button 
            size="lg"
            variant="outline"
            className="border-[hsl(var(--cyan))]/50 text-[hsl(var(--cyan))] hover:bg-[hsl(var(--cyan))]/10"
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
            className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cyan))] hover:opacity-90 text-white font-semibold"
            onClick={() => {
              // Placeholder for purchase flow
              console.log('Purchase flow not implemented yet');
            }}
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
      <div className="min-h-screen bg-[#0A1930]">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-[#0A1930] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('program.not_found')}</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('program.back')}
          </Button>
        </div>
      </div>
    );
  }

  const creator = program.creator as { id: string; first_name: string; last_name: string; avatar_url: string | null; is_verified_expert: boolean } | null;

  return (
    <div className="min-h-screen bg-[#0A1930]">
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
          {/* Hero Section */}
          <div className="bg-[#112240] rounded-xl overflow-hidden mb-8">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-[hsl(var(--cyan))]/20 to-[hsl(var(--primary))]/20">
              {program.thumbnail_url ? (
                <img 
                  src={program.thumbnail_url} 
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl opacity-30">📚</div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {getAccessBadge(program.access_level)}
                {program.is_featured && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Star className="w-3 h-3 mr-1 fill-amber-400" />
                    {t('creator.status_featured')}
                  </Badge>
                )}
                {program.access_level === 'one_time_purchase' && program.price_huf && (
                  <Badge className="bg-[hsl(var(--cyan))]/20 text-[hsl(var(--cyan))] border-[hsl(var(--cyan))]/30">
                    {program.price_huf.toLocaleString()} Ft
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {program.title}
              </h1>

              {/* Creator Section */}
              {creator && (
                <Link 
                  to={`/profile/${creator.id}`}
                  className="flex items-center gap-3 mb-6 group"
                >
                  <Avatar className="h-12 w-12 border-2 border-[hsl(var(--cyan))]/30">
                    <AvatarImage src={creator.avatar_url || undefined} />
                    <AvatarFallback className="bg-[hsl(var(--cyan))]/20 text-[hsl(var(--cyan))]">
                      {creator.first_name?.[0]}{creator.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('program.by_creator')}</span>
                      <span className="font-semibold text-foreground group-hover:text-[hsl(var(--cyan))] transition-colors">
                        {creator.first_name} {creator.last_name}
                      </span>
                      {creator.is_verified_expert && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* Description */}
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {program.description}
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-start">
                {renderCTAButton()}
              </div>
            </div>
          </div>

          {/* Related Programs Section */}
          {relatedPrograms && relatedPrograms.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t('program.more_from_creator')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPrograms.map((relProgram) => (
                  <Link key={relProgram.id} to={`/programs/${relProgram.id}`}>
                    <Card className="bg-[#112240] border-[hsl(var(--cyan))]/10 hover:border-[hsl(var(--cyan))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(var(--cyan))]/5">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-gradient-to-br from-[hsl(var(--cyan))]/10 to-[hsl(var(--primary))]/10 rounded-t-lg overflow-hidden">
                          {relProgram.thumbnail_url ? (
                            <img 
                              src={relProgram.thumbnail_url} 
                              alt={relProgram.title}
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
                            {relProgram.title}
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
      </div>
    </div>
  );
};

export default ProgramDetailPage;
