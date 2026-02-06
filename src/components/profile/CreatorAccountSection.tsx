import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CreditCard, Building2, Sparkles, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreatorAccountSectionProps {
  userId: string;
  profile: any;
  onUpdate?: () => void;
}

export const CreatorAccountSection = ({ userId, profile, onUpdate }: CreatorAccountSectionProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [payoutPreference, setPayoutPreference] = useState<string>(profile?.payout_preference || 'stripe');
  const [wiseEmail, setWiseEmail] = useState<string>(profile?.wise_email || '');
  const [wiseIban, setWiseIban] = useState<string>(profile?.wise_iban || '');
  const [creatorLegalStatus, setCreatorLegalStatus] = useState<'individual' | 'entrepreneur'>(profile?.creator_legal_status || 'individual');
  const stripeConnected = profile?.stripe_onboarding_complete || false;

  useEffect(() => {
    if (profile) {
      setPayoutPreference(profile.payout_preference || 'stripe');
      setWiseEmail(profile.wise_email || '');
      setWiseIban(profile.wise_iban || '');
      setCreatorLegalStatus(profile.creator_legal_status || 'individual');
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          payout_preference: payoutPreference,
          wise_email: payoutPreference === 'wise' ? wiseEmail : null,
          wise_iban: payoutPreference === 'wise' ? wiseIban : null,
          creator_legal_status: creatorLegalStatus,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: t('creator.settings_saved') || 'Beállítások mentve',
        description: t('creator.settings_saved_desc') || 'A kreátor fiók beállításai sikeresen mentve.',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error saving creator settings:', error);
      toast({
        title: t('common.error') || 'Hiba',
        description: t('creator.save_error') || 'Nem sikerült menteni a beállításokat.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#112240] border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00CCFF]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {t('creator.title') || 'Kreátor Fiók'}
                {stripeConnected && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    {t('creator.active_badge') || 'Aktív Kreátor'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-[#B0C4DE]">
                {t('creator.description') || 'Állítsd be a kifizetési preferenciáidat és a kreátor fiók beállításait.'}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            {t('creator.legal_status') || 'Jogi státusz'}
          </Label>
          <RadioGroup
            value={creatorLegalStatus}
            onValueChange={(value) => setCreatorLegalStatus(value as 'individual' | 'entrepreneur')}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30 hover:border-[#00E5FF]/30 transition-colors">
              <RadioGroupItem value="individual" id="creator_legal_status_individual" className="border-[#00E5FF]" />
              <Label htmlFor="creator_legal_status_individual" className="cursor-pointer flex-1">
                {t('creator.legal_status_individual') || 'Közösségi kreátor (magánszemély)'}
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30 hover:border-[#00E5FF]/30 transition-colors">
              <RadioGroupItem value="entrepreneur" id="creator_legal_status_entrepreneur" className="border-[#00E5FF]" />
              <Label htmlFor="creator_legal_status_entrepreneur" className="cursor-pointer flex-1">
                {t('creator.legal_status_entrepreneur') || 'Profi kreátor (vállalkozás / cég)'}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Payout Preference */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            {t('creator.payout_preference') || 'Kifizetési preferencia'}
          </Label>
          <RadioGroup
            value={payoutPreference}
            onValueChange={setPayoutPreference}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30 hover:border-[#00E5FF]/30 transition-colors">
              <RadioGroupItem value="stripe" id="stripe" className="border-[#00E5FF]" />
              <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="w-4 h-4 text-[#00E5FF]" />
                <span>Stripe</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30 hover:border-[#00E5FF]/30 transition-colors">
              <RadioGroupItem value="wise" id="wise" className="border-[#00E5FF]" />
              <Label htmlFor="wise" className="flex items-center gap-2 cursor-pointer flex-1">
                <Building2 className="w-4 h-4 text-[#00E5FF]" />
                <span>Wise</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30 hover:border-[#00E5FF]/30 transition-colors">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" className="border-[#00E5FF]" />
              <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                <Building2 className="w-4 h-4 text-[#00E5FF]" />
                <span>{t('creator.bank_transfer') || 'Banki átutalás'}</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Wise Fields - Only show when Wise is selected */}
        {payoutPreference === 'wise' && (
          <div className="space-y-4 p-4 rounded-lg bg-background/20 border border-[#00E5FF]/20">
            <div className="space-y-2">
              <Label htmlFor="wise_email" className="text-foreground">
                {t('creator.wise_email') || 'Wise Email'}
              </Label>
              <Input
                id="wise_email"
                type="email"
                value={wiseEmail}
                onChange={(e) => setWiseEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-background/50 border-border/50 focus:border-[#00E5FF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wise_iban" className="text-foreground">
                {t('creator.wise_iban') || 'Wise IBAN'}
              </Label>
              <Input
                id="wise_iban"
                value={wiseIban}
                onChange={(e) => setWiseIban(e.target.value)}
                placeholder="HU42 1234 5678 9012 3456 7890 1234"
                className="bg-background/50 border-border/50 focus:border-[#00E5FF]"
              />
            </div>
          </div>
        )}

        {/* Stripe Connect Section */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Stripe Connect</Label>
          <div className="p-4 rounded-lg bg-background/20 border border-border/30">
            {stripeConnected ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/20">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-green-400">
                    {t('creator.stripe_connected') || 'Összekapcsolva'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('creator.stripe_connected_desc') || 'A Stripe fiókod aktív és készen áll a kifizetésekre.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {t('creator.stripe_not_connected') || 'Nincs összekapcsolva'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('creator.stripe_connect_desc') || 'Kapcsold össze a Stripe fiókodat a kifizetések fogadásához.'}
                  </p>
                </div>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-[#0066FF] to-[#00CCFF] hover:opacity-90 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('creator.stripe_connect') || 'Stripe Connect Összekapcsolása'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border/30">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#0066FF] to-[#00CCFF] hover:opacity-90 text-white min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.saving') || 'Mentés...'}
              </>
            ) : (
              t('creator.save_settings') || 'Változtatások mentése'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorAccountSection;
