import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { notificationTriggers } from "@/lib/notificationTriggers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, CheckCircle2, CreditCard, Gift, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title: string;
    price_huf: number;
    creator_id: string;
    is_sponsored?: boolean;
    sponsor_name?: string;
    sponsor_contribution?: number;
    sponsorship_id?: string;
  };
}

export const PurchaseModal = ({ isOpen, onClose, content }: PurchaseModalProps) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Calculate prices for sponsored content
  const isSponsored = content.is_sponsored && content.sponsor_contribution && content.sponsor_contribution > 0;
  const originalPrice = content.price_huf;
  const sponsorContribution = content.sponsor_contribution || 0;
  const memberPays = isSponsored ? Math.max(0, originalPrice - sponsorContribution) : originalPrice;

  const handlePurchase = async () => {
    if (!user || !content) return;

    setIsPurchasing(true);

    try {
      if (isSponsored && content.sponsorship_id) {
        // Use the process_sponsored_purchase RPC for sponsored content
        const { data, error } = await supabase.rpc('process_sponsored_purchase', {
          p_content_id: content.id,
          p_user_id: user.id,
          p_sponsorship_id: content.sponsorship_id
        });

        if (error) throw error;

        // Check the result
        const result = data?.[0];
        if (!result?.success) {
          throw new Error(result?.message || 'Purchase failed');
        }
      } else {
        // Standard purchase (non-sponsored)
        const amount = content.price_huf;
        const platformFee = Math.round(amount * 0.20);
        const creatorRevenue = Math.round(amount * 0.80);

        // Insert into content_access
        const { error: accessError } = await supabase
          .from("content_access")
          .insert({
            content_id: content.id,
            user_id: user.id,
            amount_paid: amount,
            payment_reference: `SIM-${Date.now()}`,
          });

        if (accessError) throw accessError;

        // Insert into transactions
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert({
            content_id: content.id,
            buyer_id: user.id,
            creator_id: content.creator_id,
            amount: amount,
            platform_fee: platformFee,
            creator_revenue: creatorRevenue,
            status: "completed",
          });

        if (transactionError) throw transactionError;
      }

      // Success!
      setIsComplete(true);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00E5FF", "#0066FF", "#00CCFF", "#FFD700"],
      });

      // Send purchase confirmation notification & email
      notificationTriggers.onPurchaseComplete({
        userId: user.id,
        userEmail: user.email || profile?.email || '',
        userName: profile?.first_name || profile?.public_display_name,
        programTitle: content.title,
        programId: content.id,
        originalPrice: originalPrice,
        finalPrice: memberPays,
        sponsorName: content.sponsor_name,
        sponsorContribution: sponsorContribution,
        isSponsored: !!isSponsored
      }).catch(err => console.error('Failed to send purchase notification:', err));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["contentAccess"] });
      queryClient.invalidateQueries({ queryKey: ["myLearning"] });
      queryClient.invalidateQueries({ queryKey: ["program"] });

      toast({
        title: t("purchase.success"),
        description: t("purchase.success_description"),
      });

      // Navigate to My Library after delay
      setTimeout(() => {
        setIsComplete(false);
        onClose();
        navigate('/kurzusaim');
      }, 2000);
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: t("purchase.error"),
        description: error.message || t("purchase.error_description"),
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatPrice = (price: number) => {
    if (language === 'hu') {
      return `${price.toLocaleString("hu-HU")} Ft`;
    }
    return `${Math.round(price / 400)} €`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#112240] border-[hsl(var(--cyan))]/20 max-w-md">
        {isComplete ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t("purchase.complete")}
            </h3>
            <p className="text-muted-foreground text-center">
              {t("purchase.success_description")}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                {isSponsored ? (
                  <Gift className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShoppingCart className="w-5 h-5 text-[hsl(var(--cyan))]" />
                )}
                {t("purchase.confirm_title")}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t("purchase.confirm_description")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-[#0A1930] rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {content.title}
                </h4>
                
                {isSponsored ? (
                  <div className="space-y-2">
                    {/* Original price strikethrough */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("purchase.original_price")}</span>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    </div>
                    
                    {/* Sponsored contribution */}
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        {content.sponsor_name} {language === 'hu' ? 'támogatása' : 'contribution'}
                      </span>
                      <span>-{formatPrice(sponsorContribution)}</span>
                    </div>
                    
                    {/* Member pays (bold) */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-foreground font-medium">{t("purchase.you_pay")}</span>
                      <span className="text-2xl font-bold text-[hsl(var(--cyan))]">
                        {formatPrice(memberPays)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("purchase.price")}</span>
                    <span className="text-2xl font-bold text-[hsl(var(--cyan))]">
                      {formatPrice(content.price_huf)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span>{t("purchase.simulation_notice")}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPurchasing}
                className="border-muted-foreground/30"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cyan))] hover:opacity-90 text-white"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("purchase.processing")}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t("purchase.confirm_button")} {formatPrice(memberPays)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
