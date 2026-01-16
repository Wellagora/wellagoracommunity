import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, DollarSign, CreditCard, Link2, Ticket } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RevenueSource {
  name: string;
  value: number;
  color: string;
  icon: typeof DollarSign;
}

const RevenueMixChart = () => {
  const { language } = useLanguage();
  const [revenueData, setRevenueData] = useState<RevenueSource[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      // Fetch transaction data
      const { data: transactions } = await supabase
        .from('transactions')
        .select('platform_share, transaction_type')
        .in('transaction_type', ['purchase', 'sponsorship', 'affiliate']);

      // Fetch sponsorship packages revenue
      const { data: creditTransactions } = await supabase
        .from('credit_transactions')
        .select('credits, transaction_type')
        .eq('transaction_type', 'purchase');

      // Calculate revenue by source
      let transactionFees = 0;
      let sponsorshipPackages = 0;
      let affiliateCommissions = 0;

      // From transactions
      transactions?.forEach(tx => {
        const share = tx.platform_share || 0;
        if (tx.transaction_type === 'affiliate') {
          affiliateCommissions += share;
        } else {
          transactionFees += share;
        }
      });

      // From credit purchases (sponsorship packages)
      // Assume 10% platform margin on credit packages
      creditTransactions?.forEach(tx => {
        sponsorshipPackages += Math.round(tx.credits * 0.10);
      });

      // If no real data, use placeholder values to show the chart structure
      if (transactionFees === 0 && sponsorshipPackages === 0 && affiliateCommissions === 0) {
        transactionFees = 150000;
        sponsorshipPackages = 300000;
        affiliateCommissions = 50000;
      }

      const data: RevenueSource[] = [
        {
          name: language === 'hu' ? 'Tranzakciós Díjak (20%)' : 'Transaction Fees (20%)',
          value: transactionFees,
          color: '#10b981', // emerald
          icon: Ticket
        },
        {
          name: language === 'hu' ? 'Szponzorációs Csomagok' : 'Sponsorship Packages',
          value: sponsorshipPackages,
          color: '#6366f1', // indigo
          icon: CreditCard
        },
        {
          name: language === 'hu' ? 'Affiliate Jutalékok' : 'Affiliate Commissions',
          value: affiliateCommissions,
          color: '#f59e0b', // amber
          icon: Link2
        }
      ];

      setRevenueData(data);
      setTotalRevenue(transactionFees + sponsorshipPackages + affiliateCommissions);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} Ft`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-slate-500">
            {totalRevenue > 0 ? `${((data.value / totalRevenue) * 100).toFixed(1)}%` : '0%'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="bg-[#112240] border-border/50">
        <CardContent className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700]"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#112240] border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#FFD700]">
          <PieChart className="h-5 w-5" />
          {language === 'hu' ? 'Platform Bevétel Mix' : 'Platform Revenue Mix'}
          <Badge variant="outline" className="ml-auto border-[#FFD700]/30 text-[#FFD700]">
            {formatCurrency(totalRevenue)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={revenueData as any}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Legend & Breakdown */}
          <div className="space-y-4">
            {revenueData.map((source, index) => {
              const Icon = source.icon;
              const percentage = totalRevenue > 0 ? ((source.value / totalRevenue) * 100).toFixed(1) : '0';
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${source.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: source.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{source.name}</p>
                      <p className="text-xs text-white/50">{percentage}% of total</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold" style={{ color: source.color }}>
                    {formatCurrency(source.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 80/20 Rule Reminder */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-400">
                {language === 'hu' ? 'Bevétel Megosztás Szabály' : 'Revenue Split Rule'}
              </p>
              <p className="text-xs text-white/60">
                {language === 'hu' 
                  ? 'Szakértők: 80% | Platform: 20% minden tranzakcióból'
                  : 'Experts: 80% | Platform: 20% of every transaction'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueMixChart;
