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
  package_key: string;
  name_hu: string;
  name_en: string;
  total_price_huf: number;
  platform_fee_huf: number;
  credits_huf: number;
  bonus_credits_huf: number;
  billing_period: 'quarterly' | 'annual';
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
    try {
      const { data, error } = await supabase
        .from('sponsor_packages')
        .select('*')
        .eq('is_active', true)
        .order('total_price_huf', { ascending: true });

      if (error) throw error;
      setPackages((data || []).map(pkg => ({
        ...pkg,
        billing_period: pkg.billing_period as 'quarterly' | 'annual'
      })));
    } catch (error) {
      console.error('Error loading packages:', error);
      // Fallback to hardcoded packages
      setPackages([
        {
          id: 'quarterly',
          package_key: 'quarterly',
          name_hu: 'Negyedéves Csomag',
          name_en: 'Quarterly Package',
          total_price_huf: 150000,
          platform_fee_huf: 50000,
          credits_huf: 100000,
          bonus_credits_huf: 0,
          billing_period: 'quarterly'
        },
        {
          id: 'annual',
          package_key: 'annual',
          name_hu: 'Éves Csomag',
          name_en: 'Annual Package',
          total_price_huf: 480000,
          platform_fee_huf: 80000,
          credits_huf: 400000,
          bonus_credits_huf: 20000,
          billing_period: 'annual'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: SponsorPackage) => {
    if (!user) {
      toast.error(language === 'hu' ? 'Bejelentkezés szükséges' : 'Login required');
      return;
    }

    setPurchasing(true);
    setSelectedPackage(pkg.package_key);

    try {
      const totalCredits = pkg.credits_huf + pkg.bonus_credits_huf;

      // Record credit transaction
      const { error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          sponsor_user_id: user.id,
          credits: totalCredits,
          transaction_type: 'purchase',
          description: language === 'hu' 
            ? `${pkg.name_hu} vásárlás`
            : `${pkg.name_en} purchase`
        });

      if (txError) throw txError;

      // Update or create sponsor_credits
      const { data: existingCredits } = await supabase
        .from('sponsor_credits')
        .select('*')
        .eq('sponsor_user_id', user.id)
        .maybeSingle();

      if (existingCredits) {
        // Rollover existing credits
        const { error: updateError } = await supabase
          .from('sponsor_credits')
          .update({
            total_credits: existingCredits.total_credits + totalCredits,
            available_credits: existingCredits.available_credits + totalCredits,
            package_type: pkg.package_key,
            updated_at: new Date().toISOString()
          })
          .eq('sponsor_user_id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('sponsor_credits')
          .insert({
            sponsor_user_id: user.id,
            total_credits: totalCredits,
            available_credits: totalCredits,
            used_credits: 0,
            package_type: pkg.package_key
          });

        if (insertError) throw insertError;
      }

      // Record package history
      await supabase
        .from('credit_package_history')
        .insert({
          sponsor_user_id: user.id,
          package_type: pkg.package_key,
          initial_credits: totalCredits,
          remaining_credits: totalCredits,
          action: 'purchase'
        });

      toast.success(
        language === 'hu' 
          ? `${pkg.name_hu} sikeresen aktiválva! ${totalCredits.toLocaleString()} kredit jóváírva.`
          : `${pkg.name_en} activated! ${totalCredits.toLocaleString()} credits added.`
      );

      onPurchaseComplete?.(pkg.package_key, totalCredits);
      onClose?.();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(language === 'hu' ? 'Hiba történt a vásárlás során' : 'Error processing purchase');
    } finally {
      setPurchasing(false);
      setSelectedPackage(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  const getPackageIcon = (period: 'quarterly' | 'annual') => {
    return period === 'quarterly' ? Calendar : CalendarDays;
  };

  const getSavingsPercent = (pkg: SponsorPackage) => {
    if (pkg.billing_period === 'annual') {
      // Compare to 4 quarterly packages
      const quarterlyPrice = 150000 * 4; // 600k for 4 quarters
      const savings = quarterlyPrice - pkg.total_price_huf;
      return Math.round((savings / quarterlyPrice) * 100);
    }
    return 0;
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
          {language === 'hu' ? 'Válasszon Támogatói Csomagot' : 'Choose a Sponsor Package'}
        </h2>
        <p className="text-black/60">
          {language === 'hu' 
            ? '1 Kredit = 1 Ft. A kreditekkel támogathatja közössége fejlődését.'
            : '1 Credit = 1 HUF. Use credits to support your community\'s growth.'}
        </p>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg, index) => {
          const Icon = getPackageIcon(pkg.billing_period);
          const isAnnual = pkg.billing_period === 'annual';
          const savingsPercent = getSavingsPercent(pkg);
          const isSelected = selectedPackage === pkg.package_key;
          const totalCredits = pkg.credits_huf + pkg.bonus_credits_huf;

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative overflow-hidden transition-all duration-300 ${
                  isAnnual 
                    ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-100' 
                    : 'border border-black/10 hover:border-black/20'
                }`}
              >
                {/* Popular Badge */}
                {isAnnual && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-emerald-600 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {language === 'hu' ? 'Legnépszerűbb' : 'Most Popular'}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isAnnual ? 'bg-emerald-100' : 'bg-black/5'}`}>
                      <Icon className={`w-6 h-6 ${isAnnual ? 'text-emerald-600' : 'text-black/60'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-black">
                        {language === 'hu' ? pkg.name_hu : pkg.name_en}
                      </CardTitle>
                      <CardDescription>
                        {pkg.billing_period === 'quarterly' 
                          ? (language === 'hu' ? '3 hónapos időszak' : '3 month period')
                          : (language === 'hu' ? '12 hónapos időszak' : '12 month period')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-black">
                        {formatCurrency(pkg.total_price_huf)}
                      </span>
                      {savingsPercent > 0 && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          -{savingsPercent}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-black/50 mt-1">
                      {language === 'hu' ? 'bruttó ár' : 'total price'}
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3 p-4 rounded-xl bg-black/[0.02] border border-black/5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/60">
                        {language === 'hu' ? 'Platform díj' : 'Platform fee'}
                      </span>
                      <span className="font-medium text-black">
                        {formatCurrency(pkg.platform_fee_huf)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/60 flex items-center gap-1">
                        <Wallet className="w-4 h-4" />
                        {language === 'hu' ? 'Kredit' : 'Credits'}
                      </span>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(pkg.credits_huf)}
                      </span>
                    </div>
                    {pkg.bonus_credits_huf > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-black/60 flex items-center gap-1">
                          <Gift className="w-4 h-4 text-amber-500" />
                          {language === 'hu' ? 'Bónusz kredit' : 'Bonus credits'}
                        </span>
                        <span className="font-bold text-amber-600">
                          +{formatCurrency(pkg.bonus_credits_huf)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-black/10 pt-3 flex items-center justify-between">
                      <span className="font-semibold text-black">
                        {language === 'hu' ? 'Összes kredit' : 'Total credits'}
                      </span>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatCurrency(totalCredits)}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {[
                      language === 'hu' ? 'Kategória vagy szakértő támogatás' : 'Category or expert sponsorship',
                      language === 'hu' ? 'Valós idejű hatás riportok' : 'Real-time impact reports',
                      language === 'hu' ? 'Megújításkor kredit átgörgetés' : 'Credit rollover on renewal',
                      isAnnual && (language === 'hu' ? '+20k bónusz kredit' : '+20k bonus credits')
                    ].filter(Boolean).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-black/70">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Purchase Button */}
                  <Button
                    className={`w-full ${
                      isAnnual 
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
                        {language === 'hu' ? 'Feldolgozás...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {language === 'hu' ? 'Csomag Aktiválása' : 'Activate Package'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Note */}
      <p className="text-center text-sm text-black/50">
        {language === 'hu' 
          ? 'A vásárlással elfogadja az Általános Szerződési Feltételeket. A kreditek a lejárati időn belül felhasználhatók.'
          : 'By purchasing, you agree to our Terms of Service. Credits can be used within the validity period.'}
      </p>
    </div>
  );
};

export default SponsorPackageSelector;
