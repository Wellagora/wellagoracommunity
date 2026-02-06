import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserBalance, getPointsHistory, POINT_VALUES, type PointsTransaction } from '@/lib/wellpoints';
import { Coins, Gift, History, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Voucher {
  id: string;
  code: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  program: {
    id: string;
    title: string;
    thumbnail_url: string | null;
  };
}

export function WalletTab() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [animatedBalance, setAnimatedBalance] = useState(0);

  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

  // Fetch WellPoints balance
  const { data: balance = 0, isLoading: balanceLoading } = useQuery({
    queryKey: ['wellpoints-balance', user?.id],
    queryFn: () => getUserBalance(user!.id),
    enabled: !!user?.id,
  });

  // Fetch active vouchers
  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery({
    queryKey: ['active-vouchers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vouchers')
        .select(`
          id,
          code,
          status,
          created_at,
          expires_at,
          content_id
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch program details for each voucher
      const vouchersWithPrograms = await Promise.all(
        (data || []).map(async (voucher) => {
          const { data: program } = await supabase
            .from('expert_contents')
            .select('id, title, thumbnail_url')
            .eq('id', voucher.content_id)
            .single();

          return {
            ...voucher,
            program: program || { id: voucher.content_id, title: 'Unknown Program', thumbnail_url: null }
          };
        })
      );

      return vouchersWithPrograms as Voucher[];
    },
    enabled: !!user?.id,
  });

  // Fetch recent points history
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['points-history', user?.id],
    queryFn: () => getPointsHistory(user!.id, 10),
    enabled: !!user?.id,
  });

  // Animate balance counter
  useEffect(() => {
    if (balance > 0) {
      let start = 0;
      const duration = 1000;
      const increment = balance / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= balance) {
          setAnimatedBalance(balance);
          clearInterval(timer);
        } else {
          setAnimatedBalance(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else {
      setAnimatedBalance(0);
    }
  }, [balance]);

  const getActionIcon = (action: string) => {
    const iconClass = "h-4 w-4";
    switch (action) {
      case 'post_created':
      case 'comment_added':
        return <TrendingUp className={iconClass} />;
      case 'program_completed':
      case 'lesson_completed':
        return <Gift className={iconClass} />;
      default:
        return <Coins className={iconClass} />;
    }
  };

  if (balanceLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm mb-2">{t('wallet.balance')}</p>
                <div className="flex items-baseline gap-2">
                  <motion.h2 
                    className="text-5xl font-bold"
                    key={animatedBalance}
                  >
                    {animatedBalance.toLocaleString()}
                  </motion.h2>
                  <span className="text-2xl text-amber-100">{t('wallet.points')}</span>
                </div>
              </div>
              <div className="bg-white/20 p-4 rounded-full">
                <Coins className="h-12 w-12" />
              </div>
            </div>

            {balance === 0 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-amber-100 mb-3">{t('wallet.start_earning')}</p>
                <Link to="/community">
                  <Button variant="secondary" size="sm">
                    {t('wallet.ways_to_earn')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {t('wallet.active_vouchers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vouchersLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">{t('wallet.no_vouchers')}</p>
              <Link to="/programs">
                <Button variant="outline">
                  {t('wallet.browse_programs')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <Card key={voucher.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Program Info */}
                    <div className="flex-1 p-4">
                      <Link to={`/programs/${voucher.program.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors mb-2">
                          {voucher.program.title}
                        </h3>
                      </Link>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{t('wallet.voucher_code')}:</span>
                          <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                            {voucher.code}
                          </code>
                        </div>
                        {voucher.expires_at && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {t('wallet.valid_until')}: {format(new Date(voucher.expires_at), 'PPP', { locale: dateLocale })}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link to={`/programs/${voucher.program.id}/learn`}>
                        <Button size="sm" className="mt-3">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('lessons.continue')}
                        </Button>
                      </Link>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="bg-muted p-4 flex items-center justify-center min-w-[140px]">
                      <div className="text-center">
                        <div className="bg-white p-3 rounded-lg mb-2">
                          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-xs text-muted-foreground">
                            QR Code
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('wallet.scan_qr')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('wallet.points_history')}
            </CardTitle>
            <Link to="/wallet/history">
              <Button variant="ghost" size="sm">
                {t('wallet.all_transactions')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{t('wallet.no_history')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((transaction: PointsTransaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {getActionIcon(transaction.action)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {t(`points.${transaction.action}`)}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-muted-foreground">
                          {transaction.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), 'PPp', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    +{transaction.amount}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
