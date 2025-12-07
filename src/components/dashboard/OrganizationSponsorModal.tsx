import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Award, 
  Target, 
  TrendingUp, 
  Loader2,
  Calendar,
  Coins,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addMonths, format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

interface OrganizationSponsorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DURATION_OPTIONS = [
  { months: 1, label: '1 hónap' },
  { months: 3, label: '3 hónap' },
  { months: 6, label: '6 hónap' },
  { months: 12, label: '12 hónap' },
];

export const OrganizationSponsorModal = ({ open, onOpenChange, onSuccess }: OrganizationSponsorModalProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const { currentProject } = useProject();
  
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [credits, setCredits] = useState<number>(0);

  const localeMap = {
    hu: hu,
    en: enUS,
    de: de,
  };

  // Get translated challenge title and description
  const getChallengeTranslation = (challenge: any, field: 'title' | 'description'): string => {
    if (challenge.translations && challenge.translations[language]) {
      const translation = challenge.translations[language][field];
      if (translation) return translation;
    }
    return challenge[field] || '';
  };

  // Load challenges
  useEffect(() => {
    const loadChallenges = async () => {
      if (!open) return;

      try {
        setLoading(true);
        
        // Load all active challenges for the project, or all if no project
        let query = supabase
          .from('challenge_definitions')
          .select('id, title, description, translations, image_url')
          .eq('is_active', true)
          .limit(20);
        
        if (currentProject?.id) {
          query = query.eq('project_id', currentProject.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error loading challenges:", error);
          return;
        }

        setChallenges(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, [open, currentProject?.id]);

  // Load user credits
  useEffect(() => {
    const loadCredits = async () => {
      if (!profile?.id || !open) return;

      try {
        const { data, error } = await supabase
          .from('sponsor_credits')
          .select('available_credits')
          .eq('sponsor_user_id', profile.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error("Error loading credits:", error);
          return;
        }

        setCredits(data?.available_credits || 0);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    loadCredits();
  }, [profile?.id, open]);

  const creditCost = selectedMonths; // 1 credit = 1 month
  const hasEnoughCredits = credits >= creditCost;
  const startDate = new Date();
  const endDate = addMonths(startDate, selectedMonths);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChallenge) {
      toast({
        title: t('organization.error'),
        description: t('organization.select_challenge_required'),
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughCredits) {
      toast({
        title: t('organization.not_enough_credits'),
        description: t('sponsorship.purchase_credits'),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedChallengeData = challenges.find(c => c.id === selectedChallenge);
      
      // Map duration to valid package_type values (constraint: bronze, silver, gold, platinum)
      const getPackageType = (months: number) => {
        if (months >= 12) return 'platinum';
        if (months >= 6) return 'gold';
        if (months >= 3) return 'silver';
        return 'bronze';
      };

      // Create sponsorship record
      const { data: sponsorshipData, error: sponsorError } = await supabase
        .from('challenge_sponsorships')
        .insert({
          challenge_id: selectedChallenge,
          sponsor_user_id: profile!.id,
          sponsor_organization_id: profile!.organization_id,
          project_id: currentProject?.id,
          region: currentProject?.region_name || 'Magyarország',
          status: 'active',
          credit_cost: creditCost,
          package_type: getPackageType(selectedMonths),
          tier: selectedMonths >= 12 ? 'diamond' : selectedMonths >= 6 ? 'gold' : selectedMonths >= 3 ? 'silver' : 'bronze',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (sponsorError) throw sponsorError;

      // Deduct credits - get current values first
      const { data: currentCreditsData } = await supabase
        .from('sponsor_credits')
        .select('available_credits, used_credits')
        .eq('sponsor_user_id', profile!.id)
        .maybeSingle();

      if (currentCreditsData) {
        const { error: creditError } = await supabase
          .from('sponsor_credits')
          .update({ 
            available_credits: (currentCreditsData.available_credits || 0) - creditCost,
            used_credits: (currentCreditsData.used_credits || 0) + creditCost
          })
          .eq('sponsor_user_id', profile!.id);

        if (creditError) {
          console.error("Credit deduction error:", creditError);
        }
      }

      // Log transaction
      await supabase
        .from('credit_transactions')
        .insert({
          sponsor_user_id: profile!.id,
          organization_id: profile!.organization_id,
          transaction_type: 'sponsorship',
          credits: -creditCost,
          description: `${selectedMonths} hónap szponzorálás: ${selectedChallengeData?.title || selectedChallenge}`,
          related_sponsorship_id: sponsorshipData?.id
        });

      toast({
        title: t('sponsorship.success'),
        description: `${selectedMonths} hónapos szponzorálás elindítva!`,
      });

      onOpenChange(false);
      setSelectedChallenge("");
      setSelectedMonths(1);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating sponsorship:", error);
      toast({
        title: t('organization.error'),
        description: error.message || t('organization.sponsorship_failed'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-warning" />
            {t('organization.sponsor_challenge_title')}
          </DialogTitle>
          <DialogDescription>
            {t('organization.sponsor_challenge_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Available Credits */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-medium">{t('organization.available_credits')}</span>
              </div>
              <span className="text-2xl font-bold text-primary">{credits}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1 kredit = 1 hónap szponzori jelenlét
            </p>
          </div>

          {/* Challenge Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t('organization.select_challenge_required')}
            </Label>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : challenges.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                {t('organization.no_available_challenges')}
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedChallenge === challenge.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedChallenge(challenge.id)}
                  >
                    <div className="flex items-start gap-3">
                      {challenge.image_url && (
                        <img 
                          src={challenge.image_url} 
                          alt="" 
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {getChallengeTranslation(challenge, 'title')}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {getChallengeTranslation(challenge, 'description')}
                        </p>
                      </div>
                      {selectedChallenge === challenge.id && (
                        <Badge className="bg-primary text-primary-foreground flex-shrink-0">
                          Kiválasztva
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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

          {/* Cost Summary */}
          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                Összesen
              </span>
              <span className="text-2xl font-bold text-success">{creditCost} kredit</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMonths} hónap szponzori jelenlét a kiválasztott programon
            </p>
          </div>

          {/* Insufficient Credits Warning */}
          {!hasEnoughCredits && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nincs elegendő kredit. Szükséges: {creditCost}, elérhető: {credits}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => onOpenChange(false)}
            >
              {t('organization.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-primary"
              disabled={!selectedChallenge || !hasEnoughCredits || submitting || loading}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('organization.sponsoring')}
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Szponzorálás ({creditCost} kredit)
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
