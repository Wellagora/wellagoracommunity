import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, History, Coins, TrendingUp, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { type PointsTransaction, POINT_VALUES } from '@/lib/wellpoints';

const PointsHistoryPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [filterAction, setFilterAction] = useState<string>('all');

  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

  // Fetch all points history
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['points-history-full', user?.id, filterAction],
    queryFn: async () => {
      let query = supabase
        .from('wellpoints_ledger')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PointsTransaction[];
    },
    enabled: !!user?.id,
  });

  const getActionIcon = (action: string) => {
    const iconClass = "h-4 w-4";
    switch (action) {
      case 'post_created':
      case 'comment_added':
      case 'like_given':
      case 'like_received':
        return <TrendingUp className={iconClass} />;
      case 'program_completed':
      case 'lesson_completed':
      case 'voucher_redeemed':
        return <Gift className={iconClass} />;
      default:
        return <Coins className={iconClass} />;
    }
  };

  const totalPoints = history.reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/my-agora">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <History className="h-8 w-8" />
                {t('wallet.points_history')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('wallet.earned')}: {totalPoints.toLocaleString()} {t('wallet.points')}
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filter by action:</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.keys(POINT_VALUES).map((action) => (
                    <SelectItem key={action} value={action}>
                      {t(`points.${action}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filterAction === 'all' 
                ? t('wallet.all_transactions')
                : t(`points.${filterAction}`)
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">{t('wallet.no_history')}</p>
                <p className="text-muted-foreground mb-6">
                  {t('wallet.start_earning')}
                </p>
                <Link to="/community">
                  <Button>
                    {t('wallet.ways_to_earn')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors border"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-primary/10 p-3 rounded-full">
                        {getActionIcon(transaction.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {t(`points.${transaction.action}`)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.action}
                          </Badge>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'PPpp', { locale: dateLocale })}
                        </p>
                        {transaction.reference_type && transaction.reference_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {transaction.reference_type} #{transaction.reference_id.substring(0, 8)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className="text-lg font-bold text-green-600 bg-green-50 px-4 py-2"
                      >
                        +{transaction.amount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PointsHistoryPage;
