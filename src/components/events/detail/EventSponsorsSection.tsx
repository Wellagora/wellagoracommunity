import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, ExternalLink, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventSponsorsSectionProps {
  eventId: string;
}

interface EventSponsor {
  id: string;
  tier: string;
  sponsor: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    website_url: string | null;
    description: string | null;
  };
}

const tierConfig = {
  diamond: {
    label: { hu: "Gyémánt", en: "Diamond", de: "Diamant" },
    color: "bg-gradient-to-r from-cyan-400 to-blue-500 text-white",
    border: "border-cyan-400",
    order: 1,
  },
  gold: {
    label: { hu: "Arany", en: "Gold", de: "Gold" },
    color: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white",
    border: "border-yellow-400",
    order: 2,
  },
  silver: {
    label: { hu: "Ezüst", en: "Silver", de: "Silber" },
    color: "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800",
    border: "border-slate-400",
    order: 3,
  },
  bronze: {
    label: { hu: "Bronz", en: "Bronze", de: "Bronze" },
    color: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
    border: "border-orange-400",
    order: 4,
  },
};

const EventSponsorsSection = ({ eventId }: EventSponsorsSectionProps) => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["eventSponsors", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_sponsors")
        .select(`
          id,
          tier,
          sponsor:sponsor_id (
            id,
            name,
            slug,
            logo_url,
            website_url,
            description
          )
        `)
        .eq("event_id", eventId)
        .eq("is_active", true);

      if (error) throw error;

      // Sort by tier importance
      return (data as unknown as EventSponsor[])?.sort((a, b) => {
        const orderA = tierConfig[a.tier as keyof typeof tierConfig]?.order || 99;
        const orderB = tierConfig[b.tier as keyof typeof tierConfig]?.order || 99;
        return orderA - orderB;
      });
    },
    enabled: !!eventId,
  });

  const isSponsor = profile?.user_role === "sponsor";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <Skeleton className="h-20 w-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show section even if no sponsors - for sponsor CTA
  const hasSponsors = sponsors && sponsors.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-rose-500" />
          {t("events.sponsors") || "Támogatók"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSponsors ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sponsors.map((es) => {
              const tier = tierConfig[es.tier as keyof typeof tierConfig] || tierConfig.bronze;
              const sponsor = es.sponsor;
              
              return (
                <div
                  key={es.id}
                  className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md cursor-pointer ${tier.border}`}
                  onClick={() => navigate(`/partners/${sponsor.slug}`)}
                >
                  {/* Tier badge */}
                  <Badge className={`absolute -top-2 -right-2 ${tier.color} text-xs`}>
                    {tier.label[language as keyof typeof tier.label] || tier.label.en}
                  </Badge>
                  
                  {/* Logo or placeholder */}
                  <div className="flex items-center justify-center h-16 mb-2">
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className="max-h-16 max-w-full object-contain"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <Award className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name */}
                  <p className="text-center font-medium text-sm truncate">
                    {sponsor.name}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">
              {t("events.noSponsorsYet") || "Ez az esemény még nem rendelkezik támogatóval."}
            </p>
          </div>
        )}

        {/* Sponsor CTA */}
        {user && isSponsor && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/sponsor/campaigns")}
            >
              <Award className="w-4 h-4" />
              {t("events.becomeSponsor") || "Támogasd ezt az eseményt"}
            </Button>
          </div>
        )}

        {!user && (
          <div className="pt-4 border-t">
            <p className="text-muted-foreground text-sm text-center mb-3">
              {t("events.sponsorCTA") || "Szeretnéd támogatni ezt az eseményt?"}
            </p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/auth?role=sponsor")}
            >
              <ExternalLink className="w-4 h-4" />
              {t("events.learnAboutSponsorship") || "Tudj meg többet a szponzorációról"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventSponsorsSection;
