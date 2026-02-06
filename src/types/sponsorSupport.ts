export type Currency = 'HUF' | 'EUR';

export type SupportScopeType = 'program' | 'category' | 'creator' | 'event';

export type SupportRuleStatus = 'active' | 'paused' | 'ended';

export type AllocationStatus = 'reserved' | 'captured' | 'released';

export interface SponsorSupportRule {
  id: string;
  sponsor_id: string;
  scope_type: SupportScopeType;
  scope_id: string;
  amount_per_participant: number;
  currency: Currency;
  budget_total: number;
  budget_spent: number;
  max_participants: number | null;
  start_at: string;
  end_at: string | null;
  status: SupportRuleStatus;
  created_at: string;
  updated_at: string;
}

export interface SponsorshipAllocation {
  id: string;
  rule_id: string;
  sponsor_id: string;
  program_id: string;
  user_id: string;
  amount: number;
  currency: Currency;
  status: AllocationStatus;
  created_at: string;
  captured_at: string | null;
  released_at: string | null;
}

export interface CreateSupportRuleInput {
  scope_type: SupportScopeType;
  scope_id: string;
  amount_per_participant: number;
  currency: Currency;
  budget_total: number;
  max_participants?: number;
  start_at?: string;
  end_at?: string;
}

export interface SupportBreakdown {
  base_price: number;
  support_amount: number;
  user_pays: number;
  currency: Currency;
  sponsor_name?: string;
}

export interface EligibleSupportRule {
  rule: SponsorSupportRule;
  available_budget: number;
  participants_count: number;
}
