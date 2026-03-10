import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { PiggyBank, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface SavingsWalletProps {
  totalSavings: number;
  sponsorCount: number;
  voucherCount: number;
}

const SavingsWallet = ({ totalSavings, sponsorCount, voucherCount }: SavingsWalletProps) => {
  const { language } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-50 border-blue-100 overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <p className="text-sm font-medium text-blue-700">
                {language === 'hu' ? 'Mecénásaink támogatása' : 'Sponsor Support'}
              </p>
            </div>
            <motion.p 
              className="text-3xl sm:text-4xl font-bold text-blue-800"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {totalSavings.toLocaleString()} Ft
            </motion.p>
            <p className="text-sm text-blue-600 mt-1">
              {language === 'hu' 
                ? `Ennyit takarítottál meg a mecénásoknak köszönhetően`
                : `Saved thanks to our sponsors`}
            </p>
          </div>
          <motion.div 
            className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <PiggyBank className="w-8 h-8 text-blue-600" />
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-200/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-blue-700">
              <strong>{sponsorCount}</strong> {language === 'hu' ? 'mecénás' : 'sponsors'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              <strong>{voucherCount}</strong> {language === 'hu' ? 'élmény' : 'experiences'}
            </span>
          </div>
        </div>

        {/* Gratitude Badge */}
        <motion.div
          className="mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Badge className="bg-white/80 text-blue-700 border-blue-200 hover:bg-white">
            <Heart className="w-3 h-3 mr-1 text-rose-500" />
            {language === 'hu' 
              ? 'Köszönjük közösségünk támogatóinak!'
              : 'Thanks to our community sponsors!'}
          </Badge>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default SavingsWallet;
