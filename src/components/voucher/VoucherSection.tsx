import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface VoucherSectionProps {
  contentId: string;
  hasAccess: boolean;
  creatorLocation?: string;
}

interface Voucher {
  id: string;
  code: string;
  status: string;
  pickup_location: string | null;
  redeemed_at: string | null;
}

export const VoucherSection = ({ contentId, hasAccess, creatorLocation }: VoucherSectionProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadVoucher = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('vouchers')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .single();

      setVoucher(data);
      setIsLoading(false);
    };

    loadVoucher();
  }, [user, contentId]);

  const generateVoucher = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const code = `WA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('vouchers')
        .insert({
          code,
          user_id: user.id,
          content_id: contentId,
          pickup_location: creatorLocation || null
        })
        .select()
        .single();

      if (error) throw error;

      setVoucher(data);
      toast.success(t('voucher.generated'));
    } catch (error) {
      console.error('Error generating voucher:', error);
      toast.error(t('voucher.generate_error'));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasAccess || isLoading) return null;

  return (
    <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Ticket className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-semibold">{t('voucher.title')}</h3>
          <p className="text-xs text-muted-foreground">{t('voucher.subtitle')}</p>
        </div>
      </div>

      {voucher ? (
        <div className="text-center space-y-4">
          {/* QR Code placeholder - simple code display */}
          <div className="bg-background rounded-xl p-6 border-2 border-dashed border-amber-500/30">
            <div className="w-32 h-32 mx-auto bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
              <Ticket className="h-16 w-16 text-amber-500" />
            </div>
            <p className="font-mono text-2xl font-bold text-amber-600">{voucher.code}</p>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('voucher.pickup_hint')}
          </p>

          {voucher.pickup_location && (
            <p className="text-xs text-amber-600">
              📍 {voucher.pickup_location}
            </p>
          )}

          {voucher.status === 'used' ? (
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
              ✓ {t('voucher.redeemed')}
            </Badge>
          ) : (
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
              {t('voucher.active')}
            </Badge>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('voucher.generate_hint')}
          </p>
          <Button
            onClick={generateVoucher}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? t('common.loading') : t('voucher.generate_btn')}
          </Button>
        </div>
      )}
    </Card>
  );
};
