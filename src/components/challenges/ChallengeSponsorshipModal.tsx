import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Target, Coins, Calendar, AlertCircle, Award, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { addMonths, format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';

interface ChallengeSponsorshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  challengeTitle: string;
  region: string;
}

const DURATION_OPTIONS = [
  { months: 1, label: '1 hónap' },
  { months: 3, label: '3 hónap' },
  { months: 6, label: '6 hónap' },
  { months: 12, label: '12 hónap' },
];

const ChallengeSponsorshipModal = ({
  open,
  onOpenChange,
  challengeId,
  challengeTitle,
  region
}: ChallengeSponsorshipModalProps) => {
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const localeMap = {
    hu: hu,
    en: enUS,
    de: de,
  };

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

  const creditCost = selectedMonths; // 1 credit = 1 month
  const hasEnoughCredits = availableCredits >= creditCost;
  const startDate = new Date();
  const endDate = addMonths(startDate, selectedMonths);

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
        .maybeSingle();

      // Map duration to valid package_type values (constraint: bronze, silver, gold, platinum)
      const getPackageType = (months: number) => {
        if (months >= 12) return 'platinum';
        if (months >= 6) return 'gold';
        if (months >= 3) return 'silver';
        return 'bronze';
      };

      // Insert sponsorship
      const { data: sponsorshipData, error: sponsorError } = await supabase
        .from('challenge_sponsorships')
        .insert({
          challenge_id: challengeId,
          sponsor_user_id: user.id,
          sponsor_organization_id: profile?.organization_id,
          region: region,
          package_type: getPackageType(selectedMonths),
          tier: selectedMonths >= 12 ? 'diamond' : selectedMonths >= 6 ? 'gold' : selectedMonths >= 3 ? 'silver' : 'bronze',
          credit_cost: creditCost,
          status: 'active',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (sponsorError) throw sponsorError;

      // Deduct credits - get current values first
      const { data: currentCredits } = await supabase
        .from('sponsor_credits')
        .select('used_credits, available_credits')
        .eq('sponsor_user_id', user.id)
        .maybeSingle();

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

      // Log transaction
      await supabase
        .from('credit_transactions')
        .insert({
          sponsor_user_id: user.id,
          credits: -creditCost,
          transaction_type: 'sponsorship',
          description: `${selectedMonths} hónap szponzorálás: ${challengeTitle}`,
          related_sponsorship_id: sponsorshipData?.id
        });

      toast({
        title: t('sponsorship.success'),
        description: `${selectedMonths} hónapos szponzorálás elindítva!`
      });

      onOpenChange(false);
      loadCredits();
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            {t('sponsorship.title')}
          </DialogTitle>
          <DialogDescription>
            {challengeTitle}
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
            <p className="text-xs text-muted-foreground mt-1">
              1 kredit = 1 hónap szponzori jelenlét
            </p>
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

          {/* Duration Selection */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Szponzorálás időtartama
            </Label>
            
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.months}
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    selectedMonths === option.months
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMonths(option.months)}
                >
                  <div className="text-lg font-bold">{option.months}</div>
                  <div className="text-xs text-muted-foreground">hónap</div>
                  <div className="text-xs font-medium text-primary mt-1">
                    {option.months} kredit
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
              <span className="text-muted-foreground">Kezdés:</span>
              <span className="font-medium">
                {format(startDate, 'yyyy. MMMM d.', { locale: localeMap[language as keyof typeof localeMap] || hu })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
              <span className="text-muted-foreground">Befejezés:</span>
              <span className="font-medium">
                {format(endDate, 'yyyy. MMMM d.', { locale: localeMap[language as keyof typeof localeMap] || hu })}
              </span>
            </div>
          </div>

          {/* Insufficient Credits Warning */}
          {!hasEnoughCredits && !loading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nincs elegendő kredit. Szükséges: {creditCost}, elérhető: {availableCredits}
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
              disabled={isSubmitting || !hasEnoughCredits || loading}
              className="flex-1 bg-gradient-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('sponsorship.processing')}
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Szponzorálás ({creditCost} kredit)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeSponsorshipModal;
