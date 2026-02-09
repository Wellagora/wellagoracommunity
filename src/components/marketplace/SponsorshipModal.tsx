import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Gift, Users, Leaf } from 'lucide-react';

interface ContentData {
  id: string;
  title: string;
  price_huf: number;
  creator_id: string;
  creator?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface SponsorshipModalProps {
  content: ContentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const LICENSE_OPTIONS = [25, 50, 100, 250];

const SponsorshipModal = ({ content, open, onOpenChange, onSuccess }: SponsorshipModalProps) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [licenseCount, setLicenseCount] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalCost = content.price_huf * licenseCount;
  const platformAmount = Math.round(totalCost * 0.20);
  const creatorAmount = totalCost - platformAmount;

  const handleSponsorship = async () => {
    if (!user) {
      toast.error(t('auth.login_required'));
      return;
    }

    setIsProcessing(true);

    try {
      // Simulated payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get sponsor name from profile
      const sponsorName = profile?.organization || `${profile?.first_name} ${profile?.last_name}`;

      // Update content to sponsored status
      const { error: updateError } = await supabase
        .from('expert_contents')
        .update({
          access_type: 'sponsored',
          sponsor_id: user.id,
          sponsor_name: sponsorName,
          total_licenses: licenseCount,
          used_licenses: 0,
        })
        .eq('id', content.id);

      if (updateError) throw updateError;

      // Record the full sponsorship transaction
      const { error: transactionError } = await supabase.from('transactions').insert({
        buyer_id: user.id,
        creator_id: content.creator_id,
        content_id: content.id,
        amount: totalCost,
        creator_revenue: creatorAmount,
        platform_fee: platformAmount,
        status: 'completed',
      });

      if (transactionError) throw transactionError;

      toast.success(t('sponsor.sponsorship_success'));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Sponsorship error:', error);
      toast.error(t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A1930] border-[#FFD700]/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#FFD700]">
            <Gift className="h-5 w-5" />
            {t('sponsor.new_sponsorship')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content info */}
          <div className="p-4 bg-[#112240] rounded-lg border border-[#FFD700]/20">
            <p className="font-medium text-foreground">{content.title}</p>
            {content.creator && (
              <p className="text-sm text-muted-foreground">
                {t('expert.expert')}: {content.creator.first_name} {content.creator.last_name}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {t('marketplace.original_price')}: {content.price_huf.toLocaleString()} Ft / {t('marketplace.per_person')}
            </p>
          </div>

          {/* License count selector */}
          <div>
            <Label>{t('sponsor.license_count')}</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {LICENSE_OPTIONS.map(count => (
                <Button
                  key={count}
                  type="button"
                  variant={licenseCount === count ? "default" : "outline"}
                  onClick={() => setLicenseCount(count)}
                  className={licenseCount === count 
                    ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/80" 
                    : "border-[#FFD700]/30 hover:border-[#FFD700]"
                  }
                >
                  {count}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              min="10"
              value={licenseCount}
              onChange={(e) => setLicenseCount(parseInt(e.target.value) || 10)}
              className="mt-2 bg-[#112240] border-border/50"
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {licenseCount} {t('sponsor.licenses')} × {content.price_huf.toLocaleString()} Ft
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#FFD700]">
              <span>{t('sponsor.total_cost')}</span>
              <span>{totalCost.toLocaleString()} Ft</span>
            </div>
          </div>

          {/* Impact preview */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-sm text-emerald-400 flex items-start gap-2">
              <Leaf className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                🌱 {t('sponsor.impact_preview')} ({licenseCount} {t('sponsor.licenses')})
              </span>
            </p>
          </div>

          {/* Transparency */}
          <p className="text-xs text-muted-foreground">
            {t('payment.transparency')}
          </p>

          <Button
            onClick={handleSponsorship}
            disabled={isProcessing}
            className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/80"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('payment.processing')}
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                {t('sponsor.confirm_sponsorship')} - {totalCost.toLocaleString()} Ft
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorshipModal;
