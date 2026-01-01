import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ticket, CheckCircle, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface VoucherStats {
  active: number;
  used: number;
}

interface RecentVoucher {
  id: string;
  code: string;
  redeemed_at: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

export const VoucherRedemptionTab = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [stats, setStats] = useState<VoucherStats>({ active: 0, used: 0 });
  const [recentVouchers, setRecentVouchers] = useState<RecentVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get expert's content IDs
      const { data: contents } = await supabase
        .from('expert_contents')
        .select('id')
        .eq('creator_id', user.id);

      const contentIds = contents?.map(c => c.id) || [];

      if (contentIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // Get stats
      const { count: activeCount } = await supabase
        .from('vouchers')
        .select('*', { count: 'exact', head: true })
        .in('content_id', contentIds)
        .eq('status', 'active');

      const { count: usedCount } = await supabase
        .from('vouchers')
        .select('*', { count: 'exact', head: true })
        .in('content_id', contentIds)
        .eq('status', 'used');

      setStats({
        active: activeCount || 0,
        used: usedCount || 0
      });

      // Get recent redemptions
      const { data: recent } = await supabase
        .from('vouchers')
        .select('id, code, redeemed_at')
        .in('content_id', contentIds)
        .eq('status', 'used')
        .order('redeemed_at', { ascending: false })
        .limit(10);

      // Fetch user info for each voucher
      if (recent) {
        const vouchersWithUsers = await Promise.all(
          recent.map(async (v) => {
            const { data: voucherData } = await supabase
              .from('vouchers')
              .select('user_id')
              .eq('id', v.id)
              .single();

            if (voucherData?.user_id) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', voucherData.user_id)
                .single();

              return { ...v, user: userData };
            }
            return { ...v, user: null };
          })
        );
        setRecentVouchers(vouchersWithUsers);
      }
    } catch (error) {
      console.error('Error loading voucher data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRedeem = async () => {
    if (!code.trim() || !user) return;

    setIsRedeeming(true);
    try {
      // Find the voucher
      const { data: voucher, error: findError } = await supabase
        .from('vouchers')
        .select('id, status, content_id')
        .eq('code', code.toUpperCase())
        .single();

      if (findError || !voucher) {
        toast.error(t('voucher.not_found'));
        return;
      }

      // Check if it belongs to expert's content
      const { data: content } = await supabase
        .from('expert_contents')
        .select('creator_id')
        .eq('id', voucher.content_id)
        .single();

      if (content?.creator_id !== user.id) {
        toast.error(t('voucher.not_yours'));
        return;
      }

      if (voucher.status === 'used') {
        toast.error(t('voucher.already_used'));
        return;
      }

      // Redeem the voucher
      const { error: updateError } = await supabase
        .from('vouchers')
        .update({
          status: 'used',
          redeemed_at: new Date().toISOString()
        })
        .eq('id', voucher.id);

      if (updateError) throw updateError;

      toast.success(t('voucher.redeem_success'));
      setCode('');
      loadData();
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast.error(t('voucher.redeem_error'));
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
          <Ticket className="h-6 w-6 text-amber-500 mb-2" />
          <p className="text-3xl font-bold">{stats.active}</p>
          <p className="text-sm text-muted-foreground">{t('voucher.active_count')}</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30">
          <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
          <p className="text-3xl font-bold">{stats.used}</p>
          <p className="text-sm text-muted-foreground">{t('voucher.used_count')}</p>
        </Card>
      </div>

      {/* Redeem Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          {t('voucher.redeem_title')}
        </h3>
        <div className="flex gap-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WA-2026-XXXX"
            className="font-mono text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          />
          <Button
            onClick={handleRedeem}
            disabled={!code.trim() || isRedeeming}
            className="bg-gradient-to-r from-amber-500 to-orange-500"
          >
            {isRedeeming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('voucher.redeem_btn')
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('voucher.redeem_hint')}
        </p>
      </Card>

      {/* Recent Redemptions */}
      {recentVouchers.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">{t('voucher.recent')}</h3>
          <div className="space-y-3">
            {recentVouchers.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={v.user?.avatar_url || ''} />
                  <AvatarFallback className="bg-green-500/20 text-green-600 text-xs">
                    {v.user?.first_name?.[0]}{v.user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium flex-1">
                  {v.user?.first_name} {v.user?.last_name}
                </span>
                <Badge variant="outline" className="font-mono text-xs">
                  {v.code}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {v.redeemed_at && new Date(v.redeemed_at).toLocaleDateString(
                    language === 'hu' ? 'hu-HU' : language === 'de' ? 'de-DE' : 'en-US'
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {stats.active === 0 && stats.used === 0 && (
        <Card className="p-8 text-center border-dashed">
          <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">{t('voucher.no_vouchers_yet')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('voucher.no_vouchers_hint')}
          </p>
        </Card>
      )}
    </div>
  );
};
