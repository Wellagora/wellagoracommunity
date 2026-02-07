import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';

interface Transaction {
  id: string;
  transaction_type: 'purchase' | 'spend' | 'refund';
  credits: number;
  description: string | null;
  created_at: string;
}

const SponsorTransactionHistory = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const localeMap = {
    hu: hu,
    en: enUS,
    de: de,
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('sponsor_user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      // Silent failure - toast not needed for transaction history
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowUpCircle className="w-5 h-5 text-success" />;
      case 'spend':
        return <ArrowDownCircle className="w-5 h-5 text-warning" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-info" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-success';
      case 'spend':
        return 'text-warning';
      case 'refund':
        return 'text-info';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTranslatedDescription = (transaction: Transaction): string => {
    if (!transaction.description) {
      return t(`sponsor.transaction_type.${transaction.transaction_type}`);
    }

    const desc = transaction.description;

    // Pattern: "{name} kihívás szponzorálása - {region}"
    const sponsorshipMatch = desc.match(/^(.+?)\s+kihívás\s+szponzorálása\s+-\s+(.+)$/i);
    if (sponsorshipMatch) {
      const challengeName = sponsorshipMatch[1];
      const region = sponsorshipMatch[2];
      return `${challengeName} ${t('sponsor.challenge_sponsorship')} - ${region}`;
    }

    // Pattern: "{package} csomag vásárlás"
    const packageMatch = desc.match(/^(.+?)\s+csomag\s+vásárlás$/i);
    if (packageMatch) {
      const packageName = packageMatch[1];
      return `${packageName} ${t('sponsor.package_purchase')}`;
    }

    // Fallback: return description as-is
    return desc;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sponsor.transaction_history')}</CardTitle>
        <CardDescription>{t('sponsor.transaction_history_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('sponsor.no_transactions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <p className="font-medium">
                      {getTranslatedDescription(transaction)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.created_at), 'PPP p', {
                        locale: localeMap[language as keyof typeof localeMap] || enUS,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'spend' ? '-' : '+'}
                    {Math.abs(transaction.credits)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {t(`sponsor.type.${transaction.transaction_type}`)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorTransactionHistory;
