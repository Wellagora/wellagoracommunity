import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserAllocations } from "@/lib/sponsorAllocations";
import { supabase } from "@/integrations/supabase/client";
import { Gift, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ProgramInfo {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

interface SponsorInfo {
  first_name: string;
  last_name: string;
}

export default function SponsoredParticipations() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ['user-allocations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { allocations, error } = await getUserAllocations(user.id);
      if (error) {
        console.error('Failed to fetch allocations:', error);
        return [];
      }
      return allocations;
    },
    enabled: !!user,
  });

  // Fetch program details for allocations
  const { data: programsMap = {} } = useQuery({
    queryKey: ['allocation-programs', allocations.map(a => a.content_id)],
    queryFn: async () => {
      if (allocations.length === 0) return {};
      
      const contentIds = allocations.map(a => a.content_id);
      const { data, error } = await supabase
        .from('expert_contents')
        .select('id, title, thumbnail_url')
        .in('id', contentIds);

      if (error) {
        console.error('Failed to fetch programs:', error);
        return {};
      }

      return (data || []).reduce((acc, program) => {
        acc[program.id] = program;
        return acc;
      }, {} as Record<string, ProgramInfo>);
    },
    enabled: allocations.length > 0,
  });

  // Fetch sponsor details
  const { data: sponsorsMap = {} } = useQuery({
    queryKey: ['allocation-sponsors', allocations.map(a => a.sponsor_id)],
    queryFn: async () => {
      if (allocations.length === 0) return {};
      
      const sponsorIds = [...new Set(allocations.map(a => a.sponsor_id))];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', sponsorIds);

      if (error) {
        console.error('Failed to fetch sponsors:', error);
        return {};
      }

      return (data || []).reduce((acc, sponsor) => {
        acc[sponsor.id] = sponsor as SponsorInfo;
        return acc;
      }, {} as Record<string, SponsorInfo>);
    },
    enabled: allocations.length > 0,
  });

  const formatPrice = (amount: number, currency: string) => {
    if (language === 'hu' || currency === 'HUF') {
      return `${amount.toLocaleString('hu-HU')} Ft`;
    }
    return `${Math.round(amount / 400)} €`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'captured':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Aktív</Badge>;
      case 'reserved':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Foglalt</Badge>;
      case 'released':
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Felszabadítva</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            {t('member.sponsored_access')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            {t('member.sponsored_access')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('member.no_sponsored_participations')}</p>
            <p className="text-sm mt-2">{t('member.explore_sponsored_programs')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-emerald-600" />
          {t('member.sponsored_access')}
          <Badge variant="secondary" className="ml-auto">{allocations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allocations.map(allocation => {
            const program = programsMap[allocation.content_id];
            const sponsor = sponsorsMap[allocation.sponsor_id];
            const sponsorName = `${sponsor?.first_name || ''} ${sponsor?.last_name || ''}`.trim() || 'Sponsor';

            return (
              <Link
                key={allocation.id}
                to={`/programs/${allocation.content_id}`}
                className="block"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                  {program?.thumbnail_url && (
                    <img
                      src={program.thumbnail_url}
                      alt={program.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {program?.title || 'Program'}
                      </h4>
                      {getStatusBadge(allocation.status)}
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {t('member.sponsored_by')}: {sponsorName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{t('sponsor_support.support_amount')}: {formatPrice(allocation.amount, allocation.currency)}</span>
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
