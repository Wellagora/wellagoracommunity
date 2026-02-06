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
import { Loader2, ShoppingCart, CheckCircle2, CreditCard, Gift, Sparkles } from "lucide-react";
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
  };
}

export const PurchaseModal = ({ isOpen, onClose, content, transactionType = "content_purchase" }: PurchaseModalProps) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [allocationId, setAllocationId] = useState<string | null>(null);
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
          console.error('Failed to reserve allocation:', error);
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
        releaseSupport(allocationId).catch(err => 
          console.error('Failed to release allocation:', err)
        );
      }
    };
  }, [allocationId, isComplete]);

  // Calculate pricing using centralized system
  const pricing = calculatePricing({
    basePrice: content.price_huf,
    sponsorAmount: content.sponsor_contribution || 0,
    platformFeePercent: 20
  });

  const isSponsored = pricing.isSponsored;
  const originalPrice = pricing.basePrice;
  const sponsorContribution = pricing.sponsorAmount;
  const memberPays = pricing.userPays;
  const platformFeePreview = pricing.platformFee;
  const creatorRevenuePreview = pricing.creatorEarning;

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

        setOrderReference(`SPON-${Date.now()}`);
      } else {
        // Standard purchase (non-sponsored) using transaction service
        // Step 1: Create transaction with pending status
        if (!content.creator_id || content.creator_id === '') {
          throw new Error('Invalid creator_id - cannot create transaction');
        }

        const transaction = await createTransaction({
          contentId: content.id,
          userId: user.id,
          creatorId: content.creator_id,
          pricing: pricing,
          currency: 'HUF'
        });

        // Step 2: Simulate payment success (in production, this would be Stripe callback)
        // For now, immediately complete the transaction
        await completeTransaction(transaction.id);

        // Step 3: Also insert into content_access for backward compatibility
        const paymentReference = `TXN-${transaction.id}`;
        const { error: accessError } = await supabase
          .from("content_access")
          .insert({
            content_id: content.id,
            user_id: user.id,
            amount_paid: pricing.userPays,
            payment_reference: paymentReference,
          });

        if (accessError) {
          console.error('Error creating content_access record:', accessError);
          // Don't throw - transaction is already completed
        }

        setOrderReference(paymentReference);
      }

      // Capture allocation if this was a sponsored purchase
      if (allocationId) {
        const { success, error: captureError } = await captureSupport(allocationId);
        if (!success) {
          console.error('Failed to capture allocation:', captureError);
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
        setOrderReference(null);
        onClose();
        navigate('/kurzusaim');
      }, 2000);
    } catch (error: any) {
      console.error("Purchase error:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      toast({
        title: t("purchase.error"),
        description: error?.message || error?.toString() || t("purchase.error_description"),
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
      <DialogContent className="bg-white border-gray-200 max-w-md">
        {isComplete ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("purchase.complete")}
            </h3>
            <p className="text-gray-600 text-center">
              {t("purchase.success_description")}
            </p>
            {orderReference && (
              <p className="text-xs text-gray-500 text-center mt-3">
                {t("purchase.order_reference")}: <span className="font-mono">{orderReference}</span>
              </p>
            )}
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                {isSponsored ? (
                  <Gift className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                )}
                {t("purchase.confirm_title")}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {t("purchase.confirm_description")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {content.title}
                </h4>
                
                {isSponsored ? (
                  <div className="space-y-2">
                    {/* Original price strikethrough */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t("purchase.original_price")}</span>
                      <span className="text-lg text-gray-500 line-through">
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
                    <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-900 font-medium">{t("purchase.you_pay")}</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPriceLocal(memberPays)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t("purchase.price")}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPriceLocal(content.price_huf)}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{t("purchase.price")}</span>
                  <span className="text-gray-900 font-semibold">{formatPriceLocal(memberPays)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-700">{t("purchase.creator_receives")}</span>
                  <span className="text-gray-900 font-semibold">{formatPriceLocal(creatorRevenuePreview)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-700">{t("purchase.platform_fee")}</span>
                  <span className="text-gray-900 font-semibold">{formatPriceLocal(platformFeePreview)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4" />
                <span>{t("purchase.simulation_notice")}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPurchasing}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
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
