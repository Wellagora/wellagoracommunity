import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CreditCard, Building2, Sparkles, Check, ExternalLink, FileCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExpertAgreementModal, EXPERT_ASZF_VERSION } from '@/components/expert-studio/ExpertAgreementModal';

interface CreatorAccountSectionProps {
  userId: string;
  profile: any;
  onUpdate?: () => void;
}

export const CreatorAccountSection = ({ userId, profile, onUpdate }: CreatorAccountSectionProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const [payoutPreference, setPayoutPreference] = useState<string>(profile?.payout_preference || 'stripe');
  const [wiseEmail, setWiseEmail] = useState<string>(profile?.wise_email || '');
  const [wiseIban, setWiseIban] = useState<string>(profile?.wise_iban || '');
  const [creatorLegalStatus, setCreatorLegalStatus] = useState<'individual' | 'entrepreneur'>(profile?.creator_legal_status || 'individual');
  const [taxId, setTaxId] = useState<string>(profile?.tax_id || '');
  const [companyTaxId, setCompanyTaxId] = useState<string>(profile?.company_tax_id || '');
  const stripeConnected = profile?.stripe_onboarding_complete || false;
  const isFoundingExpert = profile?.is_founding_expert || false;
  const aszfAccepted = profile?.expert_aszf_accepted_at != null;
  const aszfNeedsUpdate = profile?.expert_aszf_version !== EXPERT_ASZF_VERSION;

  useEffect(() => {
    if (profile) {
      setPayoutPreference(profile.payout_preference || 'stripe');
      setWiseEmail(profile.wise_email || '');
      setWiseIban(profile.wise_iban || '');
      setCreatorLegalStatus(profile.creator_legal_status || 'individual');
      setTaxId(profile.tax_id || '');
      setCompanyTaxId(profile.company_tax_id || '');
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
          tax_id: creatorLegalStatus === 'individual' ? taxId : null,
          company_tax_id: creatorLegalStatus === 'entrepreneur' ? companyTaxId : null,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: t('creator.settings_saved') || 'Beállítások mentve',
        description: t('creator.settings_saved_desc') || 'A kreátor fiók beállításai sikeresen mentve.',
      });

      onUpdate?.();
    } catch (error) {
      toast({
        title: t('common.error') || 'Hiba',
        description: t('creator.save_error') || 'Nem sikerült menteni a beállításokat.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: {},
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: t('common.error') || 'Hiba',
        description: language === 'hu'
          ? 'Nem sikerült elindítani a Stripe Connect összekapcsolást.'
          : 'Failed to start Stripe Connect onboarding.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="bg-white border-[#e8e0d8]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-[#3d3429]">
                  {t('creator.title') || 'Kreátor Fiók'}
                  {stripeConnected && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Check className="w-3 h-3 mr-1" />
                      {t('creator.active_badge') || 'Aktív Kreátor'}
                    </Badge>
                  )}
                  {isFoundingExpert && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Founding Expert
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-[#3d3429]/60">
                  {t('creator.description') || 'Állítsd be a kifizetési preferenciáidat és a kreátor fiók beállításait.'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ÁSZF Status Banner */}
          {(!aszfAccepted || aszfNeedsUpdate) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#3d3429] text-sm">
                    {language === 'hu'
                      ? (aszfNeedsUpdate && aszfAccepted
                        ? 'A szerződési feltételek frissültek — újra el kell fogadnod.'
                        : 'A tartalmak értékesítéséhez el kell fogadnod a Szakértői Szerződést.')
                      : (aszfNeedsUpdate && aszfAccepted
                        ? 'The agreement has been updated — please accept the new version.'
                        : 'You need to accept the Expert Agreement to start selling content.')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgreement(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-100 flex-shrink-0"
              >
                <FileCheck className="w-4 h-4 mr-1" />
                {language === 'hu' ? 'Szerződés megtekintése' : 'View Agreement'}
              </Button>
            </div>
          )}

          {aszfAccepted && !aszfNeedsUpdate && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700">
                {language === 'hu'
                  ? `Szakértői Szerződés elfogadva (v${profile?.expert_aszf_version}) — ${new Date(profile?.expert_aszf_accepted_at).toLocaleDateString('hu-HU')}`
                  : `Expert Agreement accepted (v${profile?.expert_aszf_version}) — ${new Date(profile?.expert_aszf_accepted_at).toLocaleDateString('en-US')}`}
              </p>
            </div>
          )}

          {/* Founding Expert badge */}
          {isFoundingExpert && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                {language === 'hu'
                  ? 'Founding Expert — 0% platform jutalék minden tranzakción, örökre!'
                  : 'Founding Expert — 0% platform fee on all transactions, forever!'}
              </p>
            </div>
          )}

          {/* Legal Status */}
          <div className="space-y-3">
            <Label className="text-[#3d3429] font-medium">
              {t('creator.legal_status') || 'Jogi státusz'}
            </Label>
            <RadioGroup
              value={creatorLegalStatus}
              onValueChange={(value) => setCreatorLegalStatus(value as 'individual' | 'entrepreneur')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8] hover:border-amber-300 transition-colors">
                <RadioGroupItem value="individual" id="creator_legal_status_individual" className="border-amber-400" />
                <Label htmlFor="creator_legal_status_individual" className="cursor-pointer flex-1 text-[#3d3429]">
                  <span className="font-medium">{t('creator.legal_status_individual') || 'Közösségi kreátor (magánszemély)'}</span>
                  <p className="text-xs text-[#3d3429]/50 mt-0.5">
                    {language === 'hu'
                      ? 'A platform állít ki számlát a vásárlónak'
                      : 'Platform issues invoices to buyers'}
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8] hover:border-amber-300 transition-colors">
                <RadioGroupItem value="entrepreneur" id="creator_legal_status_entrepreneur" className="border-amber-400" />
                <Label htmlFor="creator_legal_status_entrepreneur" className="cursor-pointer flex-1 text-[#3d3429]">
                  <span className="font-medium">{t('creator.legal_status_entrepreneur') || 'Profi kreátor (vállalkozás / cég)'}</span>
                  <p className="text-xs text-[#3d3429]/50 mt-0.5">
                    {language === 'hu'
                      ? 'Te állítod ki a számlát a vásárlónak'
                      : 'You issue invoices to buyers'}
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tax ID fields (DAC7 compliance) */}
          {creatorLegalStatus === 'individual' && (
            <div className="space-y-4 p-4 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8]">
              <div className="space-y-2">
                <Label htmlFor="tax_id" className="text-[#3d3429]">
                  {language === 'hu' ? 'Adóazonosító jel (DAC7 kötelező)' : 'Tax ID (DAC7 required)'}
                </Label>
                <Input
                  id="tax_id"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="8012345678"
                  className="bg-white border-[#e8e0d8] focus:border-amber-400"
                />
                <p className="text-xs text-[#3d3429]/50">
                  {language === 'hu'
                    ? 'Az EU DAC7 irányelv alapján a platform köteles a NAV felé jelenteni a kifizetéseidet.'
                    : 'Required for annual DAC7 reporting to the tax authority.'}
                </p>
              </div>
            </div>
          )}

          {creatorLegalStatus === 'entrepreneur' && (
            <div className="space-y-4 p-4 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8]">
              <div className="space-y-2">
                <Label htmlFor="company_tax_id" className="text-[#3d3429]">
                  {language === 'hu' ? 'Adószám' : 'Company Tax ID'}
                </Label>
                <Input
                  id="company_tax_id"
                  value={companyTaxId}
                  onChange={(e) => setCompanyTaxId(e.target.value)}
                  placeholder="12345678-2-42"
                  className="bg-white border-[#e8e0d8] focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Payout Preference */}
          <div className="space-y-3">
            <Label className="text-[#3d3429] font-medium">
              {t('creator.payout_preference') || 'Kifizetési preferencia'}
            </Label>
            <RadioGroup
              value={payoutPreference}
              onValueChange={setPayoutPreference}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8] hover:border-amber-300 transition-colors">
                <RadioGroupItem value="stripe" id="stripe" className="border-amber-400" />
                <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1 text-[#3d3429]">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>Stripe Connect</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8] hover:border-amber-300 transition-colors">
                <RadioGroupItem value="wise" id="wise" className="border-amber-400" />
                <Label htmlFor="wise" className="flex items-center gap-2 cursor-pointer flex-1 text-[#3d3429]">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>Wise</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8] hover:border-amber-300 transition-colors">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" className="border-amber-400" />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1 text-[#3d3429]">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>{t('creator.bank_transfer') || 'Banki átutalás'}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Wise Fields - Only show when Wise is selected */}
          {payoutPreference === 'wise' && (
            <div className="space-y-4 p-4 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8]">
              <div className="space-y-2">
                <Label htmlFor="wise_email" className="text-[#3d3429]">
                  {t('creator.wise_email') || 'Wise Email'}
                </Label>
                <Input
                  id="wise_email"
                  type="email"
                  value={wiseEmail}
                  onChange={(e) => setWiseEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="bg-white border-[#e8e0d8] focus:border-amber-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wise_iban" className="text-[#3d3429]">
                  {t('creator.wise_iban') || 'Wise IBAN'}
                </Label>
                <Input
                  id="wise_iban"
                  value={wiseIban}
                  onChange={(e) => setWiseIban(e.target.value)}
                  placeholder="HU42 1234 5678 9012 3456 7890 1234"
                  className="bg-white border-[#e8e0d8] focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Stripe Connect Section */}
          <div className="space-y-3">
            <Label className="text-[#3d3429] font-medium">Stripe Connect</Label>
            <div className="p-4 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8]">
              {stripeConnected ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-100">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-700">
                      {t('creator.stripe_connected') || 'Összekapcsolva'}
                    </p>
                    <p className="text-sm text-[#3d3429]/60">
                      {t('creator.stripe_connected_desc') || 'A Stripe fiókod aktív és készen áll a kifizetésekre.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#3d3429]">
                      {t('creator.stripe_not_connected') || 'Nincs összekapcsolva'}
                    </p>
                    <p className="text-sm text-[#3d3429]/60">
                      {t('creator.stripe_connect_desc') || 'Kapcsold össze a Stripe fiókodat a kifizetések fogadásához.'}
                    </p>
                  </div>
                  <Button
                    variant="default"
                    onClick={handleStripeConnect}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('creator.stripe_connect') || 'Stripe Connect'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-[#e8e0d8]">
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white min-w-[200px]"
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

      {/* Expert Agreement Modal */}
      <ExpertAgreementModal
        isOpen={showAgreement}
        onClose={() => setShowAgreement(false)}
        onAccepted={() => {
          setShowAgreement(false);
          onUpdate?.();
        }}
        creatorLegalStatus={creatorLegalStatus}
      />
    </>
  );
};

export default CreatorAccountSection;
