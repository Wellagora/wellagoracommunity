import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Calendar, 
  CalendarDays, 
  Check, 
  CreditCard, 
  Gift, 
  Loader2, 
  Sparkles,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SponsorPackage {
  id: string;
  name: string;
  emoji: string;
  period: string;
  periodMonths: number;
  price: number;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  bonusPercent: number;
  badge: string | null;
  highlighted: boolean;
}

interface SponsorPackageSelectorProps {
  onPurchaseComplete?: (packageKey: string, credits: number) => void;
  onClose?: () => void;
}

const SponsorPackageSelector = ({ onPurchaseComplete, onClose }: SponsorPackageSelectorProps) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [packages, setPackages] = useState<SponsorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    // Use hardcoded packages with new simplified structure
    setPackages([
      {
        id: 'starter',
        name: t('sponsor_packages.pkg_starter'),
        emoji: '🌱',
        period: t('sponsor_packages.period_1month'),
        periodMonths: 1,
        price: 30000,
        baseCredits: 30000,
        bonusCredits: 0,
        totalCredits: 30000,
        bonusPercent: 0,
        badge: null,
        highlighted: false
      },
      {
        id: 'supporter',
        name: t('sponsor_packages.pkg_supporter'),
        emoji: '⭐',
        period: t('sponsor_packages.period_3months'),
        periodMonths: 3,
        price: 100000,
        baseCredits: 100000,
        bonusCredits: 15000,
        totalCredits: 115000,
        bonusPercent: 15,
        badge: t('sponsor_packages.badge_popular'),
        highlighted: true
      },
      {
        id: 'partner',
        name: t('sponsor_packages.pkg_partner'),
        emoji: '💎',
        period: t('sponsor_packages.period_12months'),
        periodMonths: 12,
        price: 400000,
        baseCredits: 400000,
        bonusCredits: 100000,
        totalCredits: 500000,
        bonusPercent: 25,
        badge: t('sponsor_packages.badge_best_value'),
        highlighted: false
      }
    ]);
    setLoading(false);
  };

  const handlePurchase = async (pkg: SponsorPackage) => {
    if (!user) {
      toast.error(t('sponsor_packages.login_required'));
      return;
    }

    setPurchasing(true);
    setSelectedPackage(pkg.id);

    try {
      // Atomic credit purchase via RPC
      const { data, error } = await (supabase.rpc as any)('purchase_sponsor_credits', {
        p_sponsor_user_id: user.id,
        p_total_credits: pkg.totalCredits,
        p_package_type: pkg.id,
        p_description: `${t(`sponsor_packages.pkg_${pkg.id}`)} ${t('sponsor_packages.package_purchase')}`
      });

      if (error) throw error;

      toast.success(
        t('sponsor_packages.purchase_success')
          .replace('{{package}}', t(`sponsor_packages.pkg_${pkg.id}`))
          .replace('{{credits}}', pkg.totalCredits.toLocaleString())
      );

      onPurchaseComplete?.(pkg.id, pkg.totalCredits);
      onClose?.();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(t('sponsor_packages.purchase_error'));
    } finally {
      setPurchasing(false);
      setSelectedPackage(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  const formatCredits = (amount: number) => {
    return amount.toLocaleString('hu-HU');
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">
          {t('sponsor_packages.title')}
        </h2>
        <p className="text-black/60">
          {t('sponsor_packages.subtitle')}
        </p>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg, index) => {
          const isSelected = selectedPackage === pkg.id;

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={pkg.highlighted ? 'md:scale-105' : ''}
            >
              <Card 
                className={`relative overflow-hidden transition-all duration-300 h-full flex flex-col ${
                  pkg.highlighted
                    ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-100' 
                    : 'border border-black/10 hover:border-black/20 shadow-md'
                }`}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full z-10 ${
                    pkg.id === 'supporter' ? 'bg-emerald-500 text-white' : 'bg-purple-500 text-white'
                  }`}>
                    ✦ {pkg.badge}
                  </div>
                )}

                <CardHeader className="pb-4 pt-2">
                  {/* Header */}
                  <div className="text-center">
                    <div className="text-4xl mb-2">{pkg.emoji}</div>
                    <CardTitle className="text-xl font-bold text-black mb-1">
                      {pkg.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {pkg.period}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 flex flex-col">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-black">
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>

                  {/* Credits breakdown */}
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg text-sm">
                    {/* Base credit row */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('sponsor_packages.credit')}</span>
                      <span className="font-medium">{pkg.baseCredits.toLocaleString()}</span>
                    </div>
                    
                    {/* Bonus credit row - only show if has bonus */}
                    {pkg.bonusCredits > 0 && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>🎁 {t('sponsor_packages.bonus')}</span>
                        <span className="font-medium">+{pkg.bonusCredits.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Total row with border */}
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                      <span className="font-semibold">{t('sponsor_packages.total')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">{pkg.totalCredits.toLocaleString()}</span>
                        {pkg.bonusPercent > 0 && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                            +{pkg.bonusPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>


                  {/* Purchase Button */}
                  <Button
                    className={`w-full ${
                      pkg.highlighted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-black hover:bg-black/90 text-white'
                    }`}
                    size="lg"
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing}
                  >
                    {isSelected && purchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('sponsor_packages.processing')}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {t('sponsor_packages.activate_package')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Shared Features Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-sm text-gray-500 mb-3">{t('sponsor_packages.every_package_includes')}</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
          <span className="flex items-center gap-1">
            <span className="text-emerald-500">✓</span> {t('sponsor_packages.feature_logo')}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-500">✓</span> {t('sponsor_packages.feature_visibility')}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-500">✓</span> {t('sponsor_packages.feature_rollover')}
          </span>
        </div>
      </div>

      {/* Info Note */}
      <p className="text-center text-sm text-black/50 mt-4">
        {t('sponsor_packages.terms_note')}
      </p>
    </div>
  );
};

export default SponsorPackageSelector;
