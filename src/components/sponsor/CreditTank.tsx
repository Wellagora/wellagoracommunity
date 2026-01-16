import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wallet, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreditTankProps {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  packageType?: '75k' | '300k' | 'custom';
  onBuyCredits?: () => void;
}

const CreditTank = ({ 
  totalCredits, 
  usedCredits, 
  availableCredits,
  packageType = 'custom',
  onBuyCredits 
}: CreditTankProps) => {
  const { language } = useLanguage();
  
  const usagePercent = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;
  const remainingPercent = 100 - usagePercent;
  const isLow = remainingPercent < 20;
  const isCritical = remainingPercent < 10;

  const formatCredits = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toLocaleString();
  };

  const getPackageLabel = () => {
    switch (packageType) {
      case '75k': return '75,000 Ft';
      case '300k': return '300,000 Ft';
      default: return `${totalCredits.toLocaleString()} Ft`;
    }
  };

  const getTankColor = () => {
    if (isCritical) return 'from-red-500 to-red-600';
    if (isLow) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg text-black">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            {language === 'hu' ? 'Kredit Tank' : 'Credit Tank'}
          </div>
          <Badge variant="outline" className="border-black/10 text-black/60 text-xs">
            {getPackageLabel()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Visual Tank */}
        <div className="relative h-40 bg-gradient-to-b from-black/5 to-black/10 rounded-2xl overflow-hidden mb-4">
          {/* Water/Credit Level */}
          <motion.div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getTankColor()} opacity-80`}
            initial={{ height: 0 }}
            animate={{ height: `${remainingPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          
          {/* Wave Animation */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-4"
            style={{ 
              bottom: `calc(${remainingPercent}% - 8px)`,
              background: `linear-gradient(180deg, transparent 0%, ${isCritical ? 'rgba(239,68,68,0.3)' : isLow ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'} 100%)`
            }}
            animate={{ 
              y: [0, -4, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
            <p className="text-4xl font-bold drop-shadow-lg">
              {formatCredits(availableCredits)}
            </p>
            <p className="text-sm opacity-80">
              {language === 'hu' ? 'Ft elérhető' : 'Ft available'}
            </p>
          </div>

          {/* Low Warning */}
          {isLow && (
            <motion.div
              className="absolute top-3 right-3"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle className={`w-6 h-6 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} />
            </motion.div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-black/[0.02] border border-black/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-black/40" />
              <span className="text-xs text-black/50">
                {language === 'hu' ? 'Felhasznált' : 'Used'}
              </span>
            </div>
            <p className="text-lg font-bold text-black">
              {usedCredits.toLocaleString()} Ft
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-700">
                {language === 'hu' ? 'Hatékonyság' : 'Efficiency'}
              </span>
            </div>
            <p className="text-lg font-bold text-emerald-700">
              {Math.round(remainingPercent)}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-black/50">
            <span>{language === 'hu' ? 'Kredit felhasználás' : 'Credit usage'}</span>
            <span>{usagePercent.toFixed(1)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>

        {/* Low Credit Warning */}
        {isLow && (
          <div className={`mt-4 p-3 rounded-xl ${isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'} border`}>
            <p className={`text-sm font-medium ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
              {isCritical 
                ? (language === 'hu' ? '⚠️ Kritikusan alacsony kredit!' : '⚠️ Critically low credits!')
                : (language === 'hu' ? '⚠️ Alacsony kredit szint' : '⚠️ Low credit level')}
            </p>
            <Button
              size="sm"
              onClick={onBuyCredits}
              className={`mt-2 w-full ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'} text-white`}
            >
              {language === 'hu' ? 'Kredit Feltöltés' : 'Top Up Credits'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditTank;
