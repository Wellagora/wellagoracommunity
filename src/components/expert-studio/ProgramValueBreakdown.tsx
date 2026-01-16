import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Wallet, 
  Building2, 
  Users,
  TrendingUp,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProgramValueBreakdownProps {
  programTitle: string;
  expertPriceHuf: number;
  totalEnrollments: number;
  sponsoredEnrollments?: number;
  directPurchases?: number;
}

/**
 * ProgramValueBreakdown - Expert Studio Component
 * 
 * Shows the 80/20 financial distribution for a program:
 * - Total Program Value (Expert Price × Enrollments)
 * - Platform Commission (20% of Total Value)
 * - Expert Payout (80% of Total Value)
 * 
 * This component helps Experts understand their revenue based on the
 * WellAgora Business Engine where Expert pricing is the master value.
 */
const ProgramValueBreakdown = ({
  programTitle,
  expertPriceHuf,
  totalEnrollments,
  sponsoredEnrollments = 0,
  directPurchases = 0
}: ProgramValueBreakdownProps) => {
  const { language } = useLanguage();

  // Calculate financials based on 80/20 split
  const totalProgramValue = expertPriceHuf * totalEnrollments;
  const platformCommission = Math.round(totalProgramValue * 0.20);
  const expertPayout = Math.round(totalProgramValue * 0.80);

  // Per-enrollment breakdown
  const perEnrollmentPlatformFee = Math.round(expertPriceHuf * 0.20);
  const perEnrollmentExpertPayout = Math.round(expertPriceHuf * 0.80);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              {language === 'hu' ? 'Program Érték Bontás' : 'Program Value Breakdown'}
            </CardTitle>
            <CardDescription className="mt-1">
              {programTitle}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-black/40" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  {language === 'hu' 
                    ? 'A teljes program érték (Szakértői ár × Jelentkezések) alapján számítjuk a 80/20 megosztást. Ön 80%-ot kap, függetlenül attól, hogy ki fizeti (tag vagy szponzor).'
                    : 'The 80/20 split is calculated on the full program value (Expert Price × Enrollments). You receive 80%, regardless of who pays (member or sponsor).'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Expert Price Header */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-700">
              {language === 'hu' ? 'Szakértői ár / fő' : 'Expert price / person'}
            </span>
            <Badge variant="outline" className="border-emerald-300 bg-white text-emerald-700">
              {language === 'hu' ? 'Mester érték' : 'Master value'}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{formatCurrency(expertPriceHuf)}</p>
        </div>

        {/* Enrollments Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-black/[0.02] border border-black/5 text-center">
            <Users className="w-5 h-5 text-black/40 mx-auto mb-1" />
            <p className="text-2xl font-bold text-black">{totalEnrollments}</p>
            <p className="text-xs text-black/50">
              {language === 'hu' ? 'Összes' : 'Total'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <Wallet className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-700">{sponsoredEnrollments}</p>
            <p className="text-xs text-emerald-600">
              {language === 'hu' ? 'Szponzorált' : 'Sponsored'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
            <Building2 className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-indigo-700">{directPurchases}</p>
            <p className="text-xs text-indigo-600">
              {language === 'hu' ? 'Direkt' : 'Direct'}
            </p>
          </div>
        </div>

        {/* 80/20 Split Visualization */}
        <div className="space-y-4">
          <h4 className="font-semibold text-black text-sm">
            {language === 'hu' ? '80/20 Bevétel Megosztás' : '80/20 Revenue Split'}
          </h4>

          {/* Visual Bar */}
          <div className="relative h-8 rounded-full overflow-hidden bg-black/5">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className="text-xs font-bold text-white">80%</span>
            </motion.div>
            <motion.div
              className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: '20%' }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <span className="text-xs font-bold text-white">20%</span>
            </motion.div>
          </div>

          {/* Amount Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {language === 'hu' ? 'Szakértői részesedés' : 'Expert payout'}
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(expertPayout)}</p>
              <p className="text-xs text-emerald-600/70 mt-1">
                {formatCurrency(perEnrollmentExpertPayout)} / {language === 'hu' ? 'fő' : 'person'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">
                  {language === 'hu' ? 'Platform jutalék' : 'Platform commission'}
                </span>
              </div>
              <p className="text-2xl font-bold text-indigo-700">{formatCurrency(platformCommission)}</p>
              <p className="text-xs text-indigo-600/70 mt-1">
                {formatCurrency(perEnrollmentPlatformFee)} / {language === 'hu' ? 'fő' : 'person'}
              </p>
            </div>
          </div>
        </div>

        {/* Total Program Value */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-black/[0.02] to-black/[0.04] border border-black/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black/60">
                {language === 'hu' ? 'Teljes program érték' : 'Total program value'}
              </p>
              <p className="text-xs text-black/40 mt-0.5">
                {formatCurrency(expertPriceHuf)} × {totalEnrollments} {language === 'hu' ? 'fő' : 'enrollments'}
              </p>
            </div>
            <p className="text-3xl font-bold text-black">{formatCurrency(totalProgramValue)}</p>
          </div>
        </div>

        {/* Info Note */}
        <p className="text-xs text-black/50 text-center">
          {language === 'hu' 
            ? 'A bevételek az Ön által beállított Szakértői ár alapján kerülnek kiszámításra. Szponzorált vagy direkt vásárlás esetén is ugyanazt a 80%-ot kapja.'
            : 'Revenue is calculated based on your Expert Price. You receive the same 80% whether the enrollment is sponsored or direct purchase.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProgramValueBreakdown;
