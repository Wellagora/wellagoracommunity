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
  }, [language]);

  const loadPackages = async () => {
    // Credit packages — 1 credit = 1 HUF
    const isHu = language === 'hu';
    const isDe = language === 'de';
    setPackages([
      {
        id: 'starter',
        name: isHu ? 'Kezdő' : isDe ? 'Starter' : 'Starter',
        emoji: '🌱',
        period: isHu ? '1 hónap' : isDe ? '1 Monat' : '1 month',
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
        name: isHu ? 'Támogató' : isDe ? 'Unterstützer' : 'Supporter',
        emoji: '⭐',
        period: isHu ? '3 hónap' : isDe ? '3 Monate' : '3 months',
        periodMonths: 3,
        price: 100000,
        baseCredits: 100000,
        bonusCredits: 15000,
        totalCredits: 115000,
        bonusPercent: 15,
        badge: isHu ? 'NÉPSZERŰ' : isDe ? 'BELIEBT' : 'POPULAR',
        highlighted: true
      },
      {
        id: 'partner',
        name: 'Partner',
        emoji: '💎',
        period: isHu ? '12 hónap' : isDe ? '12 Monate' : '12 months',
        periodMonths: 12,
        price: 400000,
        baseCredits: 400000,
        bonusCredits: 100000,
        totalCredits: 500000,
        bonusPercent: 25,
        badge: isHu ? 'LEGJOBB ÉRTÉK' : isDe ? 'BESTER WERT' : 'BEST VALUE',
        highlighted: false
      }
    ]);
    setLoading(false);
  };

  const handlePurchase = async (pkg: SponsorPackage) => {
    if (!user) {
      toast.error(language === 'hu' ? 'Bejelentkezés szükséges' : 'Login required');
      return;
    }

    setPurchasing(true);
    setSelectedPackage(pkg.id);

    try {
      // Record credit transaction
      const { error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          sponsor_user_id: user.id,
          credits: pkg.totalCredits,
          transaction_type: 'purchase',
          description: `${pkg.name} csomag vásárlás`
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
            total_credits: existingCredits.total_credits + pkg.totalCredits,
            available_credits: existingCredits.available_credits + pkg.totalCredits,
            package_type: pkg.id,
            updated_at: new Date().toISOString()
          })
          .eq('sponsor_user_id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('sponsor_credits')
          .insert({
            sponsor_user_id: user.id,
            total_credits: pkg.totalCredits,
            available_credits: pkg.totalCredits,
            used_credits: 0,
            package_type: pkg.id
          });

        if (insertError) throw insertError;
      }

      // Record package history
      await supabase
        .from('credit_package_history')
        .insert({
          sponsor_user_id: user.id,
          package_type: pkg.id,
          initial_credits: pkg.totalCredits,
          remaining_credits: pkg.totalCredits,
          action: 'purchase'
        });

      toast.success(
        `${pkg.name} csomag sikeresen aktiválva! ${pkg.totalCredits.toLocaleString()} kredit jóváírva.`
      );

      onPurchaseComplete?.(pkg.id, pkg.totalCredits);
      onClose?.();
    } catch (error) {
      toast.error('Hiba történt a vásárlás során');
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">
          {language === 'hu' ? 'Válassz Támogatói Csomagot' : language === 'de' ? 'Wählen Sie ein Sponsoring-Paket' : 'Choose a Sponsorship Package'}
        </h2>
        <p className="text-black/60">
          {language === 'hu' ? '1 Kredit = 1 Ft értékű támogatás. A kreditekkel programokat és eseményeket szponzorálhatsz.' : language === 'de' ? '1 Kredit = 1 Ft Unterstützung. Mit Credits können Sie Programme und Events sponsern.' : '1 Credit = 1 HUF support. Use credits to sponsor programs and events.'}
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
                    ? 'border-2 border-blue-500 shadow-xl shadow-blue-100' 
                    : 'border border-black/10 hover:border-black/20 shadow-md'
                }`}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full z-10 ${
                    pkg.badge === 'NÉPSZERŰ' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
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
                      <span className="text-gray-600">{language === 'hu' ? 'Kredit' : 'Credits'}</span>
                      <span className="font-medium">{pkg.baseCredits.toLocaleString('hu-HU')}</span>
                    </div>
                    
                    {/* Bonus credit row - only show if has bonus */}
                    {pkg.bonusCredits > 0 && (
                      <div className="flex justify-between items-center text-blue-600">
                        <span>🎁 Bónusz</span>
                        <span className="font-medium">+{pkg.bonusCredits.toLocaleString('hu-HU')}</span>
                      </div>
                    )}
                    
                    {/* Total row with border */}
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                      <span className="font-semibold">{language === 'hu' ? 'Összesen' : language === 'de' ? 'Gesamt' : 'Total'}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">{pkg.totalCredits.toLocaleString('hu-HU')}</span>
                        {pkg.bonusPercent > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
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
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
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
                        {language === 'hu' ? 'Csomag Aktiválása' : language === 'de' ? 'Paket Aktivieren' : 'Activate Package'}
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
        <p className="text-center text-sm text-gray-500 mb-3">
          {language === 'hu' ? 'Minden csomaggal jár:' : language === 'de' ? 'Bei jedem Paket inklusive:' : 'Included with every package:'}
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
          <span className="flex items-center gap-1">
            <span className="text-blue-500">✓</span> {language === 'hu' ? 'Logód megjelenik a támogatott programokon' : language === 'de' ? 'Ihr Logo auf gesponserten Programmen' : 'Your logo on sponsored programs'}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-blue-500">✓</span> {language === 'hu' ? 'Láthatóság a közösség számára' : language === 'de' ? 'Sichtbarkeit in der Community' : 'Community visibility'}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-blue-500">✓</span> {language === 'hu' ? 'Kredit átgörgetés megújításkor' : language === 'de' ? 'Kredit-Übertragung bei Verlängerung' : 'Credit rollover on renewal'}
          </span>
        </div>
      </div>

      {/* Info Note */}
      <p className="text-center text-sm text-black/50 mt-4">
        {language === 'hu' ? 'A vásárlással elfogadod az Általános Szerződési Feltételeket. A kreditek a lejárati időn belül felhasználhatók.' : language === 'de' ? 'Mit dem Kauf akzeptieren Sie die AGB. Credits sind innerhalb der Laufzeit verwendbar.' : 'By purchasing, you accept the Terms of Service. Credits can be used within the validity period.'}
      </p>
    </div>
  );
};

export default SponsorPackageSelector;
