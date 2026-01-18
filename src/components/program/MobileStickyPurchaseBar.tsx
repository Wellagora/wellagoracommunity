import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShoppingCart, Ticket, Check, Loader2 } from "lucide-react";

interface MobileStickyPurchaseBarProps {
  originalPrice: number | null;
  sponsorContribution?: number;
  isSponsored?: boolean;
  sponsorName?: string | null;
  hasAccess?: boolean;
  alreadyClaimed?: boolean;
  isClaimingVoucher?: boolean;
  onPurchaseClick: () => void;
  onClaimVoucher?: () => void;
  accessLevel?: string | null;
}

const MobileStickyPurchaseBar = ({
  originalPrice,
  sponsorContribution = 0,
  isSponsored = false,
  sponsorName,
  hasAccess = false,
  alreadyClaimed = false,
  isClaimingVoucher = false,
  onPurchaseClick,
  onClaimVoucher,
  accessLevel,
}: MobileStickyPurchaseBarProps) => {
  const { t } = useLanguage();

  // Calculate final price
  const finalPrice = isSponsored 
    ? Math.max(0, (originalPrice || 0) - sponsorContribution)
    : originalPrice || 0;

  // Don't show for free content or if user has access
  if (accessLevel === 'free' || hasAccess) {
    return null;
  }

  // User already has voucher
  if (alreadyClaimed) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.05] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-3 safe-area-inset-bottom"
      >
        <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
          <Check className="w-5 h-5" />
          <span>{t("program.voucher_claimed")}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.05] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-3 safe-area-inset-bottom"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Price Section */}
        <div className="flex flex-col">
          {isSponsored && sponsorName ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">
                  {finalPrice.toLocaleString()} Ft
                </span>
                {originalPrice && originalPrice > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    {originalPrice.toLocaleString()} Ft
                  </span>
                )}
              </div>
              <span className="text-xs text-emerald-600 font-medium">
                {sponsorName} {t("purchase.sponsor_contribution_label")}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-foreground">
              {originalPrice?.toLocaleString() || 0} Ft
            </span>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex-shrink-0">
          {isSponsored && onClaimVoucher ? (
            <Button
              onClick={onClaimVoucher}
              disabled={isClaimingVoucher}
              className="min-w-[140px] min-h-[44px] bg-black hover:bg-black/90 text-white font-semibold rounded-xl shadow-lg"
            >
              {isClaimingVoucher ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Ticket className="w-5 h-5 mr-2" />
                  {t("program.claim_voucher")}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={onPurchaseClick}
              className="min-w-[140px] min-h-[44px] bg-black hover:bg-black/90 text-white font-semibold rounded-xl shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t("program.purchase_button")}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileStickyPurchaseBar;
