import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, MapPin, Tag, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Sponsorship {
  id: string;
  sponsor?: {
    name: string;
    logo_url?: string;
  };
  discount_type?: string;
  discount_value?: string;
  discount_description?: string;
  redemption_location?: string;
  is_chain_partner?: boolean;
  sponsorship_benefit?: string;
}

interface VoucherSectionProps {
  contentId: string;
  hasAccess: boolean;
  creatorLocation?: string;
  sponsorship?: Sponsorship | null;
  priceHuf?: number;
}

interface Voucher {
  id: string;
  code: string;
  status: string;
  pickup_location: string | null;
  redeemed_at: string | null;
}

export const VoucherSection = ({ 
  contentId, 
  hasAccess, 
  creatorLocation,
  sponsorship,
  priceHuf = 0
}: VoucherSectionProps) => {
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
      
      // Determine pickup location
      let pickupLocation = creatorLocation || null;
      if (sponsorship?.is_chain_partner && sponsorship.sponsor?.name) {
        pickupLocation = t('voucher.any_location').replace('{{name}}', sponsorship.sponsor.name);
      } else if (sponsorship?.redemption_location) {
        pickupLocation = sponsorship.redemption_location;
      }
      
      const { data, error } = await supabase
        .from('vouchers')
        .insert({
          code,
          user_id: user.id,
          content_id: contentId,
          pickup_location: pickupLocation
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

  const sponsorName = sponsorship?.sponsor?.name;

  return (
    <Card className="p-5 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="h-5 w-5 text-amber-600" />
        <h4 className="font-semibold">{t('voucher.partner_benefit')}</h4>
      </div>
      
      {/* Value display */}
      <div className="bg-white/80 dark:bg-background/80 rounded-lg p-3 mb-4 text-center">
        <p className="text-xs text-muted-foreground">{t('voucher.value_label')}</p>
        <p className="text-xl font-bold">{priceHuf?.toLocaleString()} Ft</p>
        {sponsorName && (
          <p className="text-xs text-primary mt-1">
            {t('voucher.thanks_sponsor').replace('{{name}}', sponsorName)}
          </p>
        )}
      </div>

      {/* Discount highlight */}
      {sponsorship?.discount_description && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-5 w-5 text-green-600" />
            <span className="font-bold text-green-700">{t('voucher.exclusive_discount')}</span>
          </div>
          <p className="text-lg font-semibold text-green-700">
            {sponsorship.discount_description}
          </p>
          <p className="text-xs text-green-600/80 mt-1">
            {t('voucher.only_wellagora')}
          </p>
        </div>
      )}

      {/* Sponsorship Benefit - detailed description */}
      {sponsorship?.sponsorship_benefit && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {sponsorship.sponsorship_benefit}
          </p>
        </div>
      )}

      {voucher ? (
        <div className="space-y-4">
          {/* Unique code */}
          <div className="bg-white dark:bg-background rounded-lg p-4 text-center border-2 border-dashed border-amber-500/50">
            <p className="text-xs text-muted-foreground mb-1">{t('voucher.unique_code')}</p>
            <p className="font-mono text-2xl font-bold tracking-wider text-amber-700 dark:text-amber-500">
              {voucher.code}
            </p>
          </div>

          {/* Dynamic redemption location */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{t('voucher.redeem_at')}</p>
                <p className="text-sm text-muted-foreground">
                  {voucher.pickup_location || creatorLocation || t('voucher.at_master')}
                </p>
              </div>
            </div>

            {sponsorship?.discount_value && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{t('voucher.discount_amount')}</p>
                  <p className="text-sm font-bold text-green-600">{sponsorship.discount_value}</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="bg-amber-500 text-white rounded-lg p-3 text-center">
            <p className="font-semibold text-sm">👆 {t('voucher.show_code')}</p>
          </div>

          {voucher.status === 'used' ? (
            <Badge className="w-full justify-center bg-green-500/20 text-green-600 border-green-500/30">
              ✓ {t('voucher.redeemed')}
            </Badge>
          ) : (
            <Badge className="w-full justify-center bg-amber-500/20 text-amber-600 border-amber-500/30">
              {t('voucher.active')}
            </Badge>
          )}

          <p className="text-xs text-center text-muted-foreground">
            {t('voucher.valid_for')}
          </p>
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
            <Ticket className="h-4 w-4 mr-2" />
            {isGenerating ? t('common.loading') : t('voucher.generate_btn')}
          </Button>
        </div>
      )}
    </Card>
  );
};
