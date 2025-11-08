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
import { 
  Award, 
  MapPin, 
  Target, 
  TrendingUp, 
  Loader2,
  Crown,
  Star,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface OrganizationSponsorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SponsorTier {
  id: string;
  name: string;
  credits: number;
  features: string[];
  icon: typeof Award;
  gradient: string;
}

const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    credits: 50,
    features: ['Regional visibility', 'Logo on challenge page', 'Monthly report'],
    icon: Award,
    gradient: 'from-amber-600 to-orange-600'
  },
  {
    id: 'silver',
    name: 'Silver',
    credits: 100,
    features: ['National visibility', 'Featured sponsor', 'Weekly analytics', 'Social media mentions'],
    icon: Star,
    gradient: 'from-slate-400 to-gray-500'
  },
  {
    id: 'gold',
    name: 'Gold',
    credits: 200,
    features: ['Premium visibility', 'Top placement', 'Daily insights', 'Press release', 'Co-branding opportunities'],
    icon: Crown,
    gradient: 'from-yellow-400 to-amber-500'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    credits: 500,
    features: ['Exclusive partnership', 'Campaign customization', 'Real-time analytics', 'Dedicated support', 'Impact report'],
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500'
  }
];

const REGIONS = [
  'Országos',
  'Budapest',
  'Pest megye',
  'Közép-Dunántúl',
  'Nyugat-Dunántúl',
  'Dél-Dunántúl',
  'Észak-Magyarország',
  'Észak-Alföld',
  'Dél-Alföld'
];

export const OrganizationSponsorModal = ({ open, onOpenChange }: OrganizationSponsorModalProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Országos");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [credits, setCredits] = useState<number>(0);

  // Load challenges
  useEffect(() => {
    const loadChallenges = async () => {
      if (!open) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('challenge_definitions')
          .select('*')
          .eq('is_active', true)
          .limit(20);

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
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChallenge || !selectedTier) {
      toast({
        title: t('organization.error'),
        description: t('organization.select_challenge_and_package'),
        variant: "destructive",
      });
      return;
    }

    const tier = SPONSOR_TIERS.find(t => t.id === selectedTier);
    if (!tier) return;

    if (credits < tier.credits) {
      toast({
        title: t('organization.not_enough_credits'),
        description: t('organization.need_credits')
          .replace('{amount}', tier.credits.toString())
          .replace('{available}', credits.toString()),
        variant: "destructive",
      });
      // Navigate to purchase page
      navigate('/sponsor-dashboard');
      onOpenChange(false);
      return;
    }

    setSubmitting(true);

    try {
      const selectedChallengeData = challenges.find(c => c.id === selectedChallenge);
      
      // Create sponsorship
      const { error: sponsorError } = await supabase
        .from('challenge_sponsorships')
        .insert({
          challenge_id: selectedChallenge,
          sponsor_user_id: profile!.id,
          sponsor_organization_id: profile!.organization_id,
          tier: selectedTier,
          region: selectedRegion,
          status: 'active',
          credit_cost: tier.credits,
          package_type: selectedTier,
        });

      if (sponsorError) throw sponsorError;

      // Deduct credits
      const { error: creditError } = await supabase
        .from('sponsor_credits')
        .update({ 
          available_credits: credits - tier.credits,
          used_credits: credits
        })
        .eq('sponsor_user_id', profile!.id);

      if (creditError) throw creditError;

      // Log transaction
      await supabase
        .from('credit_transactions')
        .insert({
          sponsor_user_id: profile!.id,
          transaction_type: 'spend',
          credits: -tier.credits,
          description: `${selectedChallengeData.title} kihívás szponzorálása - ${selectedRegion}`
        });

      toast({
        title: t('organization.sponsorship_success'),
        description: t('organization.package_activated')
          .replace('{tier}', tier.name)
          .replace('{challenge}', selectedChallengeData.title),
      });

      onOpenChange(false);
      setSelectedChallenge("");
      setSelectedTier(null);
      setSelectedRegion("Országos");
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

  const selectedTierData = SPONSOR_TIERS.find(t => t.id === selectedTier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('organization.available_credits')}</span>
              <span className="text-2xl font-bold text-success">{credits}</span>
            </div>
          </div>

          {/* Region Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t('organization.select_region')} *
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REGIONS.map((region) => (
                <Button
                  key={region}
                  type="button"
                  variant={selectedRegion === region ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedRegion(region)}
                >
                  {region}
                </Button>
              ))}
            </div>
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
              <p className="text-sm text-muted-foreground p-4 text-center">{t('organization.no_available_challenges')}</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedChallenge === challenge.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedChallenge(challenge.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{challenge.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{challenge.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {challenge.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tier Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              {t('organization.select_sponsor_package')}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPONSOR_TIERS.map((tier) => {
                const TierIcon = tier.icon;
                const canAfford = credits >= tier.credits;
                
                return (
                  <div
                    key={tier.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTier === tier.id
                        ? 'border-primary bg-primary/5'
                        : canAfford
                        ? 'border-border hover:border-primary/50'
                        : 'border-border opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canAfford && setSelectedTier(tier.id)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.gradient}`}>
                        <TierIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{tier.name}</h4>
                        <p className="text-sm font-bold text-primary">{tier.credits} kredit</p>
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-success mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impact Preview */}
          {selectedTierData && selectedChallenge && (
            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('organization.expected_impact')}
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-bold">{selectedRegion}</p>
                  <p className="text-xs text-muted-foreground">{t('organization.scope')}</p>
                </div>
                <div>
                  <Crown className="w-5 h-5 mx-auto mb-1 text-warning" />
                  <p className="text-sm font-bold">{selectedTierData.name}</p>
                  <p className="text-xs text-muted-foreground">{t('organization.package')}</p>
                </div>
                <div>
                  <Award className="w-5 h-5 mx-auto mb-1 text-success" />
                  <p className="text-sm font-bold">-{selectedTierData.credits}</p>
                  <p className="text-xs text-muted-foreground">{t('organization.credit')}</p>
                </div>
              </div>
            </div>
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
              className="flex-1"
              disabled={!selectedChallenge || !selectedTier || submitting || loading}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('organization.sponsoring')}
                </>
              ) : (
                `${t('organization.sponsor_button')} (${selectedTierData?.credits || 0} ${t('organization.credit')})`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
