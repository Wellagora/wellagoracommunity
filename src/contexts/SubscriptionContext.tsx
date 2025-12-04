import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Types
export type TierKey = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending' | 'past_due';

export interface SubscriptionPlan {
  id: string;
  plan_key: string;
  tier: TierKey;
  name: string;
  description: string | null;
  billing_period: BillingPeriod;
  price_huf: number;
  price_eur: number;
  monthly_credits: number;
  yearly_bonus_credits: number;
  included_credits: number;
  features: string[];
  is_active: boolean;
  display_order: number;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  auto_renew: boolean;
  created_at: string;
}

export interface SponsorCredits {
  id: string;
  sponsor_user_id: string;
  organization_id: string | null;
  total_credits: number;
  used_credits: number;
  available_credits: number;
}

interface SubscriptionContextType {
  // Plans
  plans: SubscriptionPlan[];
  plansLoading: boolean;
  
  // Current subscription
  currentSubscription: OrganizationSubscription | null;
  subscriptionLoading: boolean;
  
  // Credits
  credits: SponsorCredits | null;
  availableCredits: number;
  creditsLoading: boolean;
  
  // Combined loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshSubscription: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Helpers
  getPlansByTier: (tier: TierKey) => { monthly: SubscriptionPlan | null; yearly: SubscriptionPlan | null };
  getCurrentPlanTier: () => TierKey | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Helper to extract tier from plan_key
const getTierFromPlanKey = (planKey: string): TierKey => {
  if (planKey.startsWith('bronze')) return 'bronze';
  if (planKey.startsWith('silver')) return 'silver';
  if (planKey.startsWith('gold')) return 'gold';
  if (planKey.startsWith('diamond')) return 'diamond';
  return 'bronze';
};

// Helper to extract billing period from plan_key
const getBillingPeriodFromPlanKey = (planKey: string): BillingPeriod => {
  return planKey.includes('yearly') ? 'yearly' : 'monthly';
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  
  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  
  // Subscription state
  const [currentSubscription, setCurrentSubscription] = useState<OrganizationSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  
  // Credits state
  const [credits, setCredits] = useState<SponsorCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  // Fetch all subscription plans
  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const { data, error: fetchError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) {
        console.error('Error fetching plans:', fetchError);
        setError('Failed to load subscription plans');
        return;
      }

      // Transform data to typed plans
      const typedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        plan_key: plan.plan_key,
        tier: getTierFromPlanKey(plan.plan_key),
        name: plan.name,
        description: plan.description,
        billing_period: getBillingPeriodFromPlanKey(plan.plan_key),
        price_huf: plan.price_huf,
        price_eur: plan.price_eur,
        monthly_credits: plan.monthly_credits || 1,
        yearly_bonus_credits: plan.yearly_bonus_credits || 0,
        included_credits: plan.included_credits || 0,
        features: Array.isArray(plan.features) ? plan.features as string[] : [],
        is_active: plan.is_active ?? true,
        display_order: plan.display_order || 0,
      }));

      setPlans(typedPlans);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load subscription plans');
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Fetch current organization's subscription
  const fetchSubscription = useCallback(async () => {
    if (!user || !profile?.organization_id) {
      setCurrentSubscription(null);
      setSubscriptionLoading(false);
      return;
    }

    try {
      setSubscriptionLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('organization_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError);
        setError('Failed to load subscription');
        return;
      }

      if (data) {
        const planData = data.subscription_plans;
        const typedPlan: SubscriptionPlan | null = planData ? {
          id: planData.id,
          plan_key: planData.plan_key,
          tier: getTierFromPlanKey(planData.plan_key),
          name: planData.name,
          description: planData.description,
          billing_period: getBillingPeriodFromPlanKey(planData.plan_key),
          price_huf: planData.price_huf,
          price_eur: planData.price_eur,
          monthly_credits: planData.monthly_credits || 1,
          yearly_bonus_credits: planData.yearly_bonus_credits || 0,
          included_credits: planData.included_credits || 0,
          features: Array.isArray(planData.features) ? planData.features as string[] : [],
          is_active: planData.is_active ?? true,
          display_order: planData.display_order || 0,
        } : null;

        setCurrentSubscription({
          id: data.id,
          organization_id: data.organization_id,
          plan_id: data.plan_id,
          plan: typedPlan,
          status: data.status as SubscriptionStatus,
          current_period_start: data.current_period_start,
          current_period_end: data.current_period_end,
          cancel_at_period_end: data.cancel_at_period_end ?? false,
          auto_renew: !data.cancel_at_period_end,
          created_at: data.created_at,
        });
      } else {
        setCurrentSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription');
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user, profile?.organization_id]);

  // Fetch credits for the user/organization
  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setCreditsLoading(false);
      return;
    }

    try {
      setCreditsLoading(true);
      
      // Try to fetch by organization_id first, then by user_id
      let query = supabase
        .from('sponsor_credits')
        .select('*');
      
      if (profile?.organization_id) {
        query = query.eq('organization_id', profile.organization_id);
      } else {
        query = query.eq('sponsor_user_id', user.id);
      }
      
      const { data, error: fetchError } = await query.maybeSingle();

      if (fetchError) {
        console.error('Error fetching credits:', fetchError);
        // Don't set error for credits - it's optional
        return;
      }

      if (data) {
        setCredits({
          id: data.id,
          sponsor_user_id: data.sponsor_user_id,
          organization_id: data.organization_id,
          total_credits: data.total_credits || 0,
          used_credits: data.used_credits || 0,
          available_credits: data.available_credits ?? ((data.total_credits || 0) - (data.used_credits || 0)),
        });
      } else {
        setCredits(null);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
    } finally {
      setCreditsLoading(false);
    }
  }, [user, profile?.organization_id]);

  // Refresh functions
  const refreshSubscription = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  const refreshCredits = useCallback(async () => {
    await fetchCredits();
  }, [fetchCredits]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchPlans(), fetchSubscription(), fetchCredits()]);
  }, [fetchPlans, fetchSubscription, fetchCredits]);

  // Helper: Get plans grouped by tier
  const getPlansByTier = useCallback((tier: TierKey) => {
    const tierPlans = plans.filter(p => p.tier === tier);
    return {
      monthly: tierPlans.find(p => p.billing_period === 'monthly') || null,
      yearly: tierPlans.find(p => p.billing_period === 'yearly') || null,
    };
  }, [plans]);

  // Helper: Get current plan tier
  const getCurrentPlanTier = useCallback((): TierKey | null => {
    if (!currentSubscription?.plan) return null;
    return currentSubscription.plan.tier;
  }, [currentSubscription]);

  // Initial data fetch
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const isLoading = plansLoading || subscriptionLoading || creditsLoading;
  const availableCredits = credits?.available_credits ?? 0;

  const value: SubscriptionContextType = {
    plans,
    plansLoading,
    currentSubscription,
    subscriptionLoading,
    credits,
    availableCredits,
    creditsLoading,
    isLoading,
    error,
    refreshSubscription,
    refreshCredits,
    refreshAll,
    getPlansByTier,
    getCurrentPlanTier,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
