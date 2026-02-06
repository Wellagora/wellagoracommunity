import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SupportBreakdown } from "@/types/sponsorSupport";

interface SupportBreakdownCardProps {
  breakdown: SupportBreakdown;
  sponsorLogoUrl?: string;
  className?: string;
}

export function SupportBreakdownCard({ breakdown, sponsorLogoUrl, className }: SupportBreakdownCardProps) {
  const { t } = useLanguage();

  const formatPrice = (amount: number, currency: string) => {
    if (currency === "EUR") {
      return `€${amount.toFixed(2)}`;
    }
    return `${amount.toLocaleString()} Ft`;
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-3">
        {/* Line 1: Alapár */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{t("sponsor_support.base_price")}</span>
          <span className="font-medium">{formatPrice(breakdown.base_price, breakdown.currency)}</span>
        </div>

        {/* Line 2: Támogatás with sponsor name/logo */}
        <div className="flex justify-between items-center text-sm border-t pt-3">
          <span className="text-emerald-600 font-medium">{t("sponsor_support.support_amount")}</span>
          <div className="text-right flex items-center gap-2">
            <div className="text-emerald-600 font-semibold">
              {formatPrice(breakdown.support_amount, breakdown.currency)}
            </div>
            <span className="text-muted-foreground">–</span>
            {sponsorLogoUrl ? (
              <img src={sponsorLogoUrl} alt={breakdown.sponsor_name || 'Sponsor'} className="h-6 w-auto object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">
                {breakdown.sponsor_name || t("sponsor_support.community_sponsor")}
              </span>
            )}
          </div>
        </div>

        {/* Line 3: Fizetendő */}
        <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
          <span>{t("sponsor_support.payable")}</span>
          <span className="text-emerald-600">{formatPrice(breakdown.user_pays, breakdown.currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface SponsoredBadgeProps {
  className?: string;
}

export function SponsoredBadge({ className }: SponsoredBadgeProps) {
  const { t } = useLanguage();

  return (
    <Badge variant="secondary" className={`${className} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold`}>
      {t("sponsor_support.sponsored")}
    </Badge>
  );
}
