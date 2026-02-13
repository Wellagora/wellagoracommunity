import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { DollarSign, TrendingUp, Wallet, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface RevenueOverviewProps {
  grossSales: number;
  expertShare: number;
  platformShare: number;
  pendingPayout: number;
  lastPayoutDate?: string;
  isFoundingExpert?: boolean;
}

const RevenueOverview = ({
  grossSales,
  expertShare,
  platformShare,
  pendingPayout,
  lastPayoutDate,
  isFoundingExpert = false
}: RevenueOverviewProps) => {
  const { language } = useLanguage();

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} Ft`;
  };

  const defaultExpertPercent = isFoundingExpert ? 100 : 80;
  const defaultPlatformPercent = isFoundingExpert ? 0 : 20;
  const expertPercent = grossSales > 0 ? (expertShare / grossSales) * 100 : defaultExpertPercent;
  const platformPercent = grossSales > 0 ? (platformShare / grossSales) * 100 : defaultPlatformPercent;

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-black">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          {language === 'hu' ? 'Bevétel Áttekintés' : 'Revenue Overview'}
          <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-xs">
            {isFoundingExpert ? '100/0 Founding' : '80/20 Split'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Gross Sales */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-black/5 to-black/[0.02] border border-black/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-black/60">
              {language === 'hu' ? 'Bruttó Értékesítés' : 'Gross Sales'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-black">
            {formatCurrency(grossSales)}
          </p>
        </div>

        {/* 80/20 Visual Split */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-black">
            {language === 'hu' ? 'Bevétel Megosztás' : 'Revenue Split'}
          </p>
          
          {/* Visual Bar */}
          <div className="relative h-12 rounded-xl overflow-hidden flex">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: `${expertPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className="text-white text-sm font-bold">
                {language === 'hu' ? `Te: ${defaultExpertPercent}%` : `You: ${defaultExpertPercent}%`}
              </span>
            </motion.div>
            <motion.div
              className="bg-gradient-to-r from-black/20 to-black/30 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: `${platformPercent}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              <span className="text-white/80 text-xs font-medium">
                {defaultPlatformPercent}%
              </span>
            </motion.div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-emerald-700">
                  {language === 'hu' ? `A Te ${defaultExpertPercent}%-od` : `Your ${defaultExpertPercent}%`}
                </span>
              </div>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(expertShare)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/[0.02] border border-black/5">
              <div className="flex items-center gap-2 mb-1">
                <PieChart className="w-4 h-4 text-black/40" />
                <span className="text-xs text-black/50">
                  {language === 'hu' ? `Platform ${defaultPlatformPercent}%` : `Platform ${defaultPlatformPercent}%`}
                </span>
              </div>
              <p className="text-xl font-bold text-black/60">
                {formatCurrency(platformShare)}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700">
                {language === 'hu' ? 'Kifizetésre vár' : 'Pending Payout'}
              </p>
              <p className="text-2xl font-bold text-amber-800">
                {formatCurrency(pendingPayout)}
              </p>
              {lastPayoutDate && (
                <p className="text-xs text-amber-600 mt-1">
                  {language === 'hu' ? 'Utolsó kifizetés' : 'Last payout'}: {lastPayoutDate}
                </p>
              )}
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              {language === 'hu' ? 'Feldolgozás alatt' : 'Processing'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueOverview;
