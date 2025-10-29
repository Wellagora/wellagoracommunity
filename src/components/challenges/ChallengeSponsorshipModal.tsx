import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Target, Trophy, Euro, TrendingUp, Check } from 'lucide-react';

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
    price: '50,000 Ft',
    benefits: ['Logo megjelenítés', 'Cég neve a kihíváson', 'Egyszerű említés']
  },
  {
    value: 'silver',
    name: 'Ezüst',
    price: '100,000 Ft',
    benefits: ['Logo megjelenítés', 'Kiemelt cég név', 'Profilra linkelt név', 'ESG beszámoló megemlítés']
  },
  {
    value: 'gold',
    name: 'Arany',
    price: '200,000 Ft',
    benefits: ['Nagy logo', 'Kiemelt pozíció', 'Teljes profilra linkelt kártya', 'ESG jelentés részletes adat', 'Social media említés']
  },
  {
    value: 'platinum',
    name: 'Platinum',
    price: '500,000 Ft',
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
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSponsor = async () => {
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

      const { error } = await supabase
        .from('challenge_sponsorships')
        .insert({
          challenge_id: challengeId,
          sponsor_user_id: user.id,
          sponsor_organization_id: profile?.organization_id,
          region: region,
          package_type: selectedPackage,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: t('sponsorship.success'),
        description: t('sponsorship.success_desc')
          .replace('{challengeTitle}', challengeTitle)
          .replace('{region}', region)
      });

      onOpenChange(false);
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
                              <Euro className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{pkg.price}</span>
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
              disabled={isSubmitting}
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
