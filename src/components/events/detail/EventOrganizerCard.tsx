import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Building2, Star, ExternalLink } from "lucide-react";

interface EventOrganizerCardProps {
  organizationId?: string | null;
  createdById?: string | null;
}

const EventOrganizerCard = ({ organizationId, createdById }: EventOrganizerCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Fetch organization info
  const { data: organization } = useQuery({
    queryKey: ["eventOrganization", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, logo_url, description")
        .eq("id", organizationId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!organizationId,
  });

  // Fetch creator profile if no organization
  const { data: creator } = useQuery({
    queryKey: ["eventCreator", createdById],
    queryFn: async () => {
      if (!createdById || organizationId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, expert_title, is_verified_expert")
        .eq("id", createdById)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!createdById && !organizationId,
  });

  if (!organization && !creator) {
    return null;
  }

  const handleClick = () => {
    if (organization) {
      navigate(`/organization/${organization.id}`);
    } else if (creator) {
      navigate(`/profile/${creator.id}`);
    }
  };

  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-all group" onClick={handleClick}>
      <CardContent className="p-6">
        <h2 className="font-semibold text-lg mb-4">{t("events.organizer") || "Organizer"}</h2>
        
        {organization ? (
          <div className="flex items-center gap-4">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="w-14 h-14 rounded-lg object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center">
                <Building2 className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium group-hover:text-primary transition-colors">
                {organization.name}
              </p>
              {organization.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {organization.description}
                </p>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        ) : creator ? (
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={creator.avatar_url || undefined} />
              <AvatarFallback>
                {creator.first_name?.[0]}{creator.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium group-hover:text-primary transition-colors">
                  {creator.first_name} {creator.last_name}
                </p>
                {creator.is_verified_expert && (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                )}
              </div>
              {creator.expert_title && (
                <p className="text-sm text-muted-foreground">{creator.expert_title}</p>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        ) : null}
        
        <Button variant="outline" size="sm" className="w-full mt-4">
          {t("events.viewProfile") || "View Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventOrganizerCard;
