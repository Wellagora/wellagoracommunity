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
import { Loader2, CreditCard, Heart } from 'lucide-react';

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

interface DummyPaymentModalProps {
  content: ContentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DummyPaymentModal = ({ content, open, onOpenChange, onSuccess }: DummyPaymentModalProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast.error(t('auth.login_required'));
      return;
    }

    setIsProcessing(true);

    try {
      const { data: creatorProfile, error: creatorProfileError } = await supabase
        .from('profiles')
        .select('creator_legal_status')
        .eq('id', content.creator_id)
        .maybeSingle();

      if (creatorProfileError) throw creatorProfileError;

      const invoiceIssuedBy = creatorProfile?.creator_legal_status === 'entrepreneur' ? 'creator' : 'platform';

      // Simulated payment (2 second wait)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record access
      const { error: accessError } = await supabase.from('content_access').insert({
        user_id: user.id,
        content_id: content.id,
        access_type: 'purchase',
        amount_paid: content.price_huf,
      });

      if (accessError) throw accessError;

      // Record transaction (80/20 split)
      const platformAmount = Math.round(content.price_huf * 0.20);
      const creatorAmount = content.price_huf - platformAmount;

      const { error: transactionError } = await supabase.from('transactions').insert({
        buyer_id: user.id,
        creator_id: content.creator_id,
        content_id: content.id,
        amount: content.price_huf,
        creator_revenue: creatorAmount,
        platform_fee: platformAmount,
        status: 'completed',
        transaction_type: 'content_purchase',
        invoice_issued_by: invoiceIssuedBy,
      });

      if (transactionError) throw transactionError;

      toast.success(t('payment.success'));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A1930] border-[#112240] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[hsl(var(--cyan))]" />
            {t('payment.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content info */}
          <div className="p-4 bg-[#112240] rounded-lg border border-[hsl(var(--cyan))]/20">
            <p className="font-medium text-foreground">{content.title}</p>
            {content.creator && (
              <p className="text-sm text-muted-foreground">
                {content.creator.first_name} {content.creator.last_name}
              </p>
            )}
            <p className="text-2xl font-bold mt-2 text-[hsl(var(--cyan))]">
              {content.price_huf.toLocaleString()} Ft
            </p>
          </div>

          {/* Transparency message */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-sm text-emerald-400 flex items-start gap-2">
              <Heart className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{t('payment.transparency')}</span>
            </p>
          </div>

          {/* Dummy card details */}
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">{t('payment.card_number')}</Label>
              <Input value="4242 4242 4242 4242" disabled className="bg-[#112240] border-border/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground">{t('payment.expiry')}</Label>
                <Input value="12/28" disabled className="bg-[#112240] border-border/50" />
              </div>
              <div>
                <Label className="text-muted-foreground">CVC</Label>
                <Input value="123" disabled className="bg-[#112240] border-border/50" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ {t('payment.test_mode')}
            </p>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cyan))] hover:opacity-90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('payment.processing')}
              </>
            ) : (
              `${t('payment.pay')} ${content.price_huf.toLocaleString()} Ft`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DummyPaymentModal;
