import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Crown, Gem, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionPlan {
  id: string;
  plan_key: string;
  name: string;
  description: string | null;
  price_huf: number;
  price_eur: number;
  billing_period: string | null;
  monthly_credits: number | null;
  yearly_bonus_credits: number | null;
  included_credits: number | null;
  features: unknown;
  is_active: boolean | null;
  display_order: number | null;
}

interface SubscriptionPlanSelectorProps {
  onSelectPlan: (planId: string) => void;
  currentPlanKey?: string;
}

type TierKey = 'bronze' | 'silver' | 'gold' | 'diamond';

const tierConfig: Record<TierKey, {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  borderColor: string;
  iconColor: string;
  bgGlow: string;
  isPopular?: boolean;
}> = {
  bronze: {
    icon: Award,
    gradient: 'from-amber-600/20 to-orange-700/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    bgGlow: 'shadow-amber-500/20',
  },
  silver: {
    icon: Star,
    gradient: 'from-slate-400/20 to-gray-500/20',
    borderColor: 'border-slate-400/30',
    iconColor: 'text-slate-400',
    bgGlow: 'shadow-slate-400/20',
    isPopular: true,
  },
  gold: {
    icon: Crown,
    gradient: 'from-yellow-500/20 to-amber-600/20',
    borderColor: 'border-yellow-500/30',
    iconColor: 'text-yellow-500',
    bgGlow: 'shadow-yellow-500/20',
  },
  diamond: {
    icon: Gem,
    gradient: 'from-purple-500/20 to-blue-600/20',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    bgGlow: 'shadow-purple-500/20',
  },
};

const getTierFromPlanKey = (planKey: string): TierKey => {
  if (planKey.startsWith('bronze')) return 'bronze';
  if (planKey.startsWith('silver')) return 'silver';
  if (planKey.startsWith('gold')) return 'gold';
  if (planKey.startsWith('diamond')) return 'diamond';
  return 'bronze';
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('hu-HU').format(price);
};

export const SubscriptionPlanSelector: React.FC<SubscriptionPlanSelectorProps> = ({
  onSelectPlan,
  currentPlanKey,
}) => {
  const { t } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          return;
        }

        setPlans(data || []);
      } catch {
        // Silent failure
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Group plans by tier
  const groupedPlans = plans.reduce((acc, plan) => {
    const tier = getTierFromPlanKey(plan.plan_key);
    if (!acc[tier]) {
      acc[tier] = { monthly: null, yearly: null };
    }
    if (plan.billing_period === 'monthly') {
      acc[tier].monthly = plan;
    } else if (plan.billing_period === 'yearly') {
      acc[tier].yearly = plan;
    }
    return acc;
  }, {} as Record<TierKey, { monthly: SubscriptionPlan | null; yearly: SubscriptionPlan | null }>);

  const tiers: TierKey[] = ['bronze', 'silver', 'gold', 'diamond'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn(
          "text-sm font-medium transition-colors",
          !isYearly ? "text-foreground" : "text-muted-foreground"
        )}>
          {t('subscription.monthly')}
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="data-[state=checked]:bg-primary"
        />
        <span className={cn(
          "text-sm font-medium transition-colors",
          isYearly ? "text-foreground" : "text-muted-foreground"
        )}>
          {t('subscription.yearly')}
        </span>
        {isYearly && (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            {t('subscription.discount')}
          </Badge>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {tiers.map((tierKey) => {
          const config = tierConfig[tierKey];
          const tierPlans = groupedPlans[tierKey];
          if (!tierPlans) return null;

          const plan = isYearly ? tierPlans.yearly : tierPlans.monthly;
          if (!plan) return null;

          const Icon = config.icon;
          const isCurrentPlan = currentPlanKey === plan.plan_key;
          const features = Array.isArray(plan.features) ? plan.features as string[] : null;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
                "bg-gradient-to-br backdrop-blur-xl border",
                config.gradient,
                config.borderColor,
                config.bgGlow,
                "shadow-lg hover:shadow-xl",
                config.isPopular && "ring-2 ring-primary/50"
              )}
            >
              {/* Popular Badge */}
              {config.isPopular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {t('subscription.popular')}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-background/50",
                    config.iconColor
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {plan.name.replace(' Havi', '').replace(' Éves', '')}
                    </h3>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(plan.price_huf)}
                    </span>
                    <span className="text-muted-foreground">
                      Ft/{isYearly ? 'év' : 'hó'}
                    </span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ({formatPrice(Math.round(plan.price_huf / 12))} Ft/hó)
                    </p>
                  )}
                </div>

                {/* Credits */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {t('subscription.credits_per_month').replace('{{count}}', String(plan.monthly_credits || 1))}
                  </p>
                  {isYearly && plan.yearly_bonus_credits && plan.yearly_bonus_credits > 0 && (
                    <p className="text-sm text-green-400 font-medium">
                      {t('subscription.bonus_credits').replace('{{count}}', String(plan.yearly_bonus_credits))}
                    </p>
                  )}
                </div>

                {/* Features */}
                {features && features.length > 0 && (
                  <ul className="space-y-2">
                    {features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.iconColor)} />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <Button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                  className={cn(
                    "w-full mt-4",
                    isCurrentPlan && "opacity-50 cursor-not-allowed"
                  )}
                  variant={config.isPopular ? "default" : "outline"}
                >
                  {isCurrentPlan ? t('subscription.current_plan') : t('subscription.select_plan')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlanSelector;
