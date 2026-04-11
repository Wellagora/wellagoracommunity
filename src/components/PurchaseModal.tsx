import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { notificationTriggers } from "@/lib/notificationTriggers";
import { reserveSupport, captureSupport, releaseSupport } from "@/lib/sponsorAllocations";
import { calculatePricing, formatPrice } from '@/lib/pricing';
import { PricingDisplay } from '@/components/PricingDisplay';
import { createTransaction, completeTransaction } from '@/services/transactionService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShoppingCart, CheckCircle2, CreditCard, Gift, Sparkles, Shield } from "lucide-react";
import confetti from "canvas-confetti";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType?: "content_purchase" | "in_person_workshop";
  content: {
    id: string;
    title: string;
    price_huf: number;
    creator_id: string;
    is_sponsored?: boolean;
    sponsor_name?: string;
    sponsor_contribution?: number;
    sponsorship_id?: string;
    /** Creator is a founding expert (0% platform fee) */
    is_founding_expert?: boolean;
  };
}

export const PurchaseModal = ({ isOpen, onClose, content, transactionType = "content_purchase" }: PurchaseModalProps) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [allocationId, setAllocationId] = useState<string | null>(null);
  const [withdrawalConsent, setWithdrawalConsent] = useState(false);
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Reserve allocation when modal opens for sponsored content
  useEffect(() => {
    if (isOpen && user && content.is_sponsored && !allocationId) {
      const reserve = async () => {
        const { allocation, error } = await reserveSupport(
          content.id,
          user.id,
          'HUF' // TODO: get from content currency
        );

        if (error) {
          toast({
            title: t("purchase.allocation_error"),
            description: error,
            variant: "destructive",
          });
        } else if (allocation) {
          setAllocationId(allocation.id);
        }
      };

      reserve();
    }
  }, [isOpen, user, content.is_sponsored, content.id, allocationId]);

  // Release allocation when modal closes without purchase
  useEffect(() => {
    return () => {
      if (allocationId && !isComplete) {
        releaseSupport(allocationId).catch(() => { /* silent */ });
      }
    };
  }, [allocationId, isComplete]);

  // Reset withdrawal consent when modal opens
  useEffect(() => {
    if (isOpen) {
      setWithdrawalConsent(false);
    }
  }, [isOpen]);

  // Calculate pricing using centralized system (with founding expert support)
  const pricing = calculatePricing({
    basePrice: content.price_huf,
    sponsorAmount: content.sponsor_contribution || 0,
    platformFeePercent: 20,
    isFoundingExpert: content.is_founding_expert || false,
  });

  const isSponsored = pricing.isSponsored;
  const originalPrice = pricing.basePrice;
  const sponsorContribution = pricing.sponsorAmount;
  const memberPays = pricing.userPays;
  const platformFeePreview = pricing.platformFee;
  const creatorRevenuePreview = pricing.creatorEarning;

  const handlePurchase = async () => {
    if (!user || !content) return;

    // Validate withdrawal consent for paid purchases
    if (memberPays > 0 && !withdrawalConsent) {
      toast({
        title: language === 'hu' ? 'Elállási jog' : 'Withdrawal Right',
        description: language === 'hu'
          ? 'Kérjük, fogadd el az elállási jogról szóló tájékoztatást a vásárláshoz.'
          : 'Please accept the withdrawal right information to proceed with the purchase.',
        variant: "destructive",
      });
      return;
    }

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

        setOrderReference(`SPON-${Date.now()}`);
      } else {
        // Standard purchase — redirect to Stripe Checkout
        if (!content.creator_id || content.creator_id === '') {
          throw new Error('Invalid creator_id - cannot create transaction');
        }

        // Call the create-checkout-session edge function
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
          'create-checkout-session',
          {
            body: {
              contentId: content.id,
              successUrl: `${window.location.origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${window.location.origin}/programs`,
              withdrawal_consent: withdrawalConsent,
            },
          }
        );

        if (sessionError) {
          throw new Error(sessionError.message || 'Failed to create checkout session');
        }

        if (sessionData?.url) {
          // Redirect to Stripe Checkout
          window.location.href = sessionData.url;
          return; // Don't continue — user is leaving the page
        } else {
          throw new Error('No checkout URL returned');
        }
      }

      // Capture allocation if this was a sponsored purchase
      if (allocationId) {
        const { success, error: captureError } = await captureSupport(allocationId);
        if (!success) {
          // Don't fail the purchase, just log the error
        }
      }

      // Success!
      setIsComplete(true);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#f59e0b", "#10b981", "#FFD700"],
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
        isSponsored: !!isSponsored,
      }).catch(() => { /* silent */ });

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
        setOrderReference(null);
        onClose();
        navigate('/kurzusaim');
      }, 2000);
    } catch (error: unknown) {
      const err = error as { message?: string; toString?: () => string };
      toast({
        title: t("purchase.error"),
        description: err?.message || err?.toString?.() || t("purchase.error_description"),
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatPriceLocal = (price: number) => {
    if (language === 'hu') {
      return formatPrice(price, 'HUF');
    }
    return `${Math.round(price / 400)} €`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-[#e8e0d8] max-w-md">
        {isComplete ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-[#3d3429] mb-2">
              {t("purchase.complete")}
            </h3>
            <p className="text-[#3d3429]/60 text-center">
              {t("purchase.success_description")}
            </p>
            {orderReference && (
              <p className="text-xs text-[#3d3429]/40 text-center mt-3">
                {t("purchase.order_reference")}: <span className="font-mono">{orderReference}</span>
              </p>
            )}
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#3d3429]">
                {isSponsored ? (
                  <Gift className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                )}
                {t("purchase.confirm_title")}
              </DialogTitle>
              <DialogDescription className="text-[#3d3429]/60">
                {t("purchase.confirm_description")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-[#f5f0eb] rounded-lg p-4 mb-4 border border-[#e8e0d8]">
                <h4 className="font-semibold text-[#3d3429] mb-2 line-clamp-2">
                  {content.title}
                </h4>

                {isSponsored ? (
                  <div className="space-y-2">
                    {/* Original price strikethrough */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#3d3429]/60">{t("purchase.original_price")}</span>
                      <span className="text-lg text-[#3d3429]/40 line-through">
                        {formatPriceLocal(originalPrice)}
                      </span>
                    </div>

                    {/* Sponsored contribution */}
                    <div className="flex items-center justify-between text-emerald-600">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        {content.sponsor_name} {language === 'hu' ? 'támogatása' : 'contribution'}
                      </span>
                      <span>-{formatPriceLocal(sponsorContribution)}</span>
                    </div>

                    {/* Member pays (bold) */}
                    <div className="flex items-center justify-between border-t border-[#e8e0d8] pt-2 mt-2">
                      <span className="text-[#3d3429] font-medium">{t("purchase.you_pay")}</span>
                      <span className="text-2xl font-bold text-orange-500">
                        {formatPriceLocal(memberPays)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[#3d3429]/60">{t("purchase.price")}</span>
                    <span className="text-2xl font-bold text-orange-500">
                      {formatPriceLocal(content.price_huf)}
                    </span>
                  </div>
                )}
              </div>

              {/* Revenue breakdown */}
              <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#3d3429]/70">{t("purchase.price")}</span>
                  <span className="text-[#3d3429] font-semibold">{formatPriceLocal(memberPays)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-[#3d3429]/70">{t("purchase.creator_receives")}</span>
                  <span className="text-[#3d3429] font-semibold">
                    {formatPriceLocal(creatorRevenuePreview)}
                    {pricing.isFoundingExpert && (
                      <span className="ml-1 text-xs text-amber-600">(Founding Expert)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-[#3d3429]/70">{t("purchase.platform_fee")}</span>
                  <span className="text-[#3d3429] font-semibold">
                    {formatPriceLocal(platformFeePreview)}
                    {pricing.isFoundingExpert && (
                      <span className="ml-1 text-xs text-emerald-600">(0%)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* EU Withdrawal Right Consent (Elállási jog) */}
              {memberPays > 0 && (
                <div className="bg-orange-50 rounded-lg p-4 mb-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="withdrawal-consent"
                      checked={withdrawalConsent}
                      onCheckedChange={(checked) => setWithdrawalConsent(checked === true)}
                      className="mt-0.5 border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <label htmlFor="withdrawal-consent" className="text-xs text-[#3d3429]/70 leading-relaxed cursor-pointer">
                      {language === 'hu' ? (
                        <>
                          Tudomásul veszem, hogy a digitális tartalom hozzáférés azonnali biztosításával a 45/2014. (II. 26.) Korm. rendelet 29. § (1) m) pontja alapján{' '}
                          <strong className="text-[#3d3429]">az elállási/felmondási jogomról lemondok</strong>.
                          A vásárlástól számított 14 napon belül a Stripe-on keresztül kérhetek visszatérítést.
                          14 nap után platform kredit formájában lehetséges.
                        </>
                      ) : (
                        <>
                          I acknowledge that by receiving immediate access to digital content, I waive my right of withdrawal
                          under EU Directive 2011/83/EU, Article 16(m). I can request a refund via Stripe within 14 days.
                          After 14 days, refunds are available as platform credit.
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-[#3d3429]/60">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>
                  {language === 'hu'
                    ? 'Biztonságos fizetés a Stripe-on keresztül'
                    : 'Secure payment via Stripe'}
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPurchasing}
                className="border-[#e8e0d8] text-[#3d3429] hover:bg-[#f5f0eb]"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || (memberPays > 0 && !withdrawalConsent)}
                className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("purchase.processing")}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t("purchase.confirm_button")} {formatPriceLocal(memberPays)}
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
