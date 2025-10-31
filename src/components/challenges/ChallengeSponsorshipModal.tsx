import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Target, Trophy, Coins, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChallengeSponsorshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  challengeTitle: string;
  region: string;
}

const packageOptions = [
  {
    value: 'bronze',
    name: 'Bronz',
    credits: 10,
    benefits: ['Logo megjelenítés', 'Cég neve a kihíváson', 'Egyszerű említés']
  },
  {
    value: 'silver',
    name: 'Ezüst',
    credits: 20,
    benefits: ['Logo megjelenítés', 'Kiemelt cég név', 'Profilra linkelt név', 'ESG beszámoló megemlítés']
  },
  {
    value: 'gold',
    name: 'Arany',
    credits: 40,
    benefits: ['Nagy logo', 'Kiemelt pozíció', 'Teljes profilra linkelt kártya', 'ESG jelentés részletes adat', 'Social media említés']
  },
  {
    value: 'platinum',
    name: 'Platinum',
    credits: 100,
    benefits: ['Premium logo', 'Exkluzív szponzor státusz', 'Dedikált landing page', 'Teljes ESG marketing csomag', 'Média megjelenések']
  }
];

const ChallengeSponsorshipModal = ({
  open,
  onOpenChange,
  challengeId,
  challengeTitle,
  region
}: ChallengeSponsorshipModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<string>('bronze');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load available credits
  useEffect(() => {
    if (open) {
      loadCredits();
    }
  }, [open]);

  const loadCredits = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sponsor_credits')
        .select('available_credits')
        .eq('sponsor_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAvailableCredits(data?.available_credits || 0);
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPackageData = packageOptions.find(p => p.value === selectedPackage);
  const hasEnoughCredits = availableCredits >= (selectedPackageData?.credits || 0);

  const handleSponsor = async () => {
    if (!hasEnoughCredits) {
      toast({
        title: t('sponsorship.insufficient_credits'),
        description: t('sponsorship.purchase_credits'),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t('admin.error'),
          description: t('sponsorship.login_required'),
          variant: 'destructive'
        });
        return;
      }

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const creditCost = selectedPackageData?.credits || 0;

      // Insert sponsorship with credit cost
      const { error: sponsorError } = await supabase
        .from('challenge_sponsorships')
        .insert({
          challenge_id: challengeId,
          sponsor_user_id: user.id,
          sponsor_organization_id: profile?.organization_id,
          region: region,
          package_type: selectedPackage,
          tier: selectedPackage,
          credit_cost: creditCost,
          status: 'active'
        });

      if (sponsorError) throw sponsorError;

      // Deduct credits manually - first get current credits
      const { data: currentCredits } = await supabase
        .from('sponsor_credits')
        .select('used_credits, available_credits')
        .eq('sponsor_user_id', user.id)
        .single();

      if (currentCredits) {
        const { error: creditError } = await supabase
          .from('sponsor_credits')
          .update({ 
            used_credits: (currentCredits.used_credits || 0) + creditCost,
            available_credits: (currentCredits.available_credits || 0) - creditCost
          })
          .eq('sponsor_user_id', user.id);

        if (creditError) {
          console.error('Credit deduction error:', creditError);
        }
      }

      // Also log transaction
      await supabase
        .from('credit_transactions')
        .insert({
          sponsor_user_id: user.id,
          credits: -creditCost,
          transaction_type: 'sponsorship',
          description: `Sponsorship for challenge: ${challengeTitle}`,
          related_sponsorship_id: null
        });

      toast({
        title: t('sponsorship.success'),
        description: t('sponsorship.success_desc')
          .replace('{challengeTitle}', challengeTitle)
          .replace('{credits}', creditCost.toString())
      });

      onOpenChange(false);
      loadCredits(); // Reload credits
    } catch (error: any) {
      toast({
        title: t('sponsorship.error'),
        description: error.message || t('sponsorship.error_desc'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            {t('sponsorship.title')}
          </DialogTitle>
          <DialogDescription>
            {t('sponsorship.subtitle').replace('{challengeTitle}', challengeTitle)}
          </DialogDescription>
          
          {/* Credits Display */}
          <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-semibold">{t('sponsorship.available_credits')}</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {loading ? '...' : availableCredits}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Target className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">{t('sponsorship.why_sponsor')}</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t('sponsorship.benefit_1')}</li>
                    <li>• {t('sponsorship.benefit_2')}</li>
                    <li>• {t('sponsorship.benefit_3')}</li>
                    <li>• {t('sponsorship.benefit_4')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('sponsorship.choose_package')}</h3>
            <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
              <div className="grid gap-4">
                {packageOptions.map((pkg) => (
                  <Card
                    key={pkg.value}
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg.value
                        ? 'border-primary shadow-lg ring-2 ring-primary/20'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPackage(pkg.value)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={pkg.value} id={pkg.value} />
                          <div>
                            <Label htmlFor={pkg.value} className="text-lg font-bold cursor-pointer">
                              {pkg.name}
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Coins className="w-4 h-4 text-primary" />
                              <span className="text-sm font-semibold text-primary">{pkg.credits} {t('sponsorship.credits')}</span>
                            </div>
                          </div>
                        </div>
                        {selectedPackage === pkg.value && (
                          <Badge className="bg-primary">
                            <Check className="w-3 h-3 mr-1" />
                            {t('sponsorship.selected')}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {pkg.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-success flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Insufficient Credits Warning */}
          {!hasEnoughCredits && selectedPackageData && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('sponsorship.need_more_credits')} {selectedPackageData.credits - availableCredits} {t('sponsorship.credits')}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('sponsorship.cancel')}
            </Button>
            <Button
              onClick={handleSponsor}
              disabled={isSubmitting || !hasEnoughCredits}
              className="flex-1 bg-gradient-primary"
            >
              {isSubmitting ? t('sponsorship.processing') : t('sponsorship.start')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeSponsorshipModal;
