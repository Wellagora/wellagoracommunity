import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Gift, Percent, Store, Tag } from "lucide-react";
import { Link } from "react-router-dom";

interface PartnerOffer {
  id: string;
  partnerName: string;
  partnerLogo?: string;
  partnerSlug: string;
  offerTitle: string;
  offerDescription?: string;
  discountType: "percentage" | "fixed" | "gift";
  discountValue: string;
  productUrl?: string;
  isOnline: boolean;
  redemptionLocation?: string;
  validUntil?: string;
}

interface PartnerOfferCardProps {
  offer: PartnerOffer;
  variant?: "default" | "compact" | "featured";
  onTrackClick?: (offerId: string) => void;
}

// Partner logos mapping
const PARTNER_LOGOS: Record<string, string> = {
  praktiker: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Praktiker_logo.svg/200px-Praktiker_logo.svg.png",
  dm: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Dm_Logo.svg/200px-Dm_Logo.svg.png",
  rossmann: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Rossmann_Logo.svg/200px-Rossmann_Logo.svg.png",
  obi: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Obi-Logo.svg/200px-Obi-Logo.svg.png",
  ikea: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ikea_logo.svg/200px-Ikea_logo.svg.png",
  auchan: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Auchan_logo.svg/200px-Auchan_logo.svg.png",
  tesco: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Tesco_Logo.svg/200px-Tesco_Logo.svg.png",
  spar: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/SPAR_Logo.svg/200px-SPAR_Logo.svg.png",
};

const getDiscountIcon = (type: string) => {
  switch (type) {
    case "percentage":
      return <Percent className="w-4 h-4" />;
    case "gift":
      return <Gift className="w-4 h-4" />;
    default:
      return <Tag className="w-4 h-4" />;
  }
};

export const PartnerOfferCard = memo(({ 
  offer, 
  variant = "default",
  onTrackClick 
}: PartnerOfferCardProps) => {
  const { t, language } = useLanguage();

  const handleClick = () => {
    if (onTrackClick) {
      onTrackClick(offer.id);
    }
    if (offer.productUrl) {
      window.open(offer.productUrl, "_blank", "noopener,noreferrer");
    }
  };

  const partnerLogo = offer.partnerLogo || PARTNER_LOGOS[offer.partnerSlug.toLowerCase()];

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-border/40 hover:shadow-md transition-all group">
        {/* Partner Logo */}
        <Link to={`/partners/${offer.partnerSlug}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-white border border-border/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
            {partnerLogo ? (
              <img src={partnerLogo} alt={offer.partnerName} className="w-8 h-8 object-contain" />
            ) : (
              <Store className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </Link>

        {/* Offer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">{offer.offerTitle}</span>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {getDiscountIcon(offer.discountType)}
              <span className="ml-1">{offer.discountValue}</span>
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>{offer.partnerName}</span>
            {!offer.isOnline && offer.redemptionLocation && (
              <>
                <span>•</span>
                <span>{offer.redemptionLocation}</span>
              </>
            )}
          </div>
        </div>

        {/* Action */}
        {offer.productUrl && (
          <Button size="sm" variant="ghost" onClick={handleClick} className="flex-shrink-0">
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Link to={`/partners/${offer.partnerSlug}`} className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-white border border-border/20 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
              {partnerLogo ? (
                <img src={partnerLogo} alt={offer.partnerName} className="w-10 h-10 object-contain" />
              ) : (
                <Store className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/partners/${offer.partnerSlug}`}>
              <p className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {offer.partnerName}
              </p>
            </Link>
            <h3 className="font-semibold text-foreground line-clamp-2">{offer.offerTitle}</h3>
          </div>
        </div>

        {/* Discount Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">
            {getDiscountIcon(offer.discountType)}
            <span className="ml-1 font-semibold">{offer.discountValue}</span>
          </Badge>
          {!offer.isOnline && (
            <Badge variant="outline" className="text-xs">
              <Store className="w-3 h-3 mr-1" />
              {language === "hu" ? "Üzletben" : "In-Store"}
            </Badge>
          )}
          {offer.isOnline && (
            <Badge variant="outline" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Online
            </Badge>
          )}
        </div>

        {/* Description */}
        {offer.offerDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {offer.offerDescription}
          </p>
        )}

        {/* Location for in-store */}
        {!offer.isOnline && offer.redemptionLocation && (
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Store className="w-3 h-3" />
            {offer.redemptionLocation}
          </p>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleClick} 
          className="w-full bg-black hover:bg-black/90 text-white"
          disabled={!offer.productUrl && offer.isOnline}
        >
          {offer.isOnline ? (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              {language === "hu" ? "Ajánlat megtekintése" : "View Offer"}
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              {language === "hu" ? "Kupon aktiválása" : "Activate Coupon"}
            </>
          )}
        </Button>

        {/* Valid until */}
        {offer.validUntil && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            {language === "hu" ? "Érvényes:" : "Valid until:"} {offer.validUntil}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

PartnerOfferCard.displayName = "PartnerOfferCard";

export default PartnerOfferCard;
