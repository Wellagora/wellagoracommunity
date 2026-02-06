import { supabase } from '@/integrations/supabase/client';
import type { Currency } from '@/types/sponsorSupport';

export interface SponsorAllocation {
  id: string;
  rule_id: string;
  sponsor_id: string;
  content_id: string;
  user_id: string;
  amount: number;
  currency: Currency;
  status: 'reserved' | 'captured' | 'released';
  created_at: string;
  captured_at: string | null;
  released_at: string | null;
}

/**
 * Reserve sponsor support for a user joining a program.
 * Creates an allocation record with 'reserved' status.
 * Idempotent: returns existing allocation if already reserved.
 */
export async function reserveSupport(
  contentId: string,
  userId: string,
  currency: Currency
): Promise<{ allocation: SponsorAllocation | null; error: string | null }> {
  try {
    // Check if allocation already exists
    const { data: existing, error: checkError } = await supabase
      .from('sponsorship_allocations')
      .select('*')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing allocation:', checkError);
      return { allocation: null, error: checkError.message };
    }

    // If already exists and not released, return it
    if (existing && existing.status !== 'released') {
      return { allocation: existing as SponsorAllocation, error: null };
    }

    // Find eligible support rule
    const { data: rule, error: ruleError } = await supabase
      .from('sponsor_support_rules')
      .select('*')
      .eq('scope_type', 'program')
      .eq('scope_id', contentId)
      .eq('currency', currency)
      .eq('status', 'active')
      .lte('start_at', new Date().toISOString())
      .or(`end_at.is.null,end_at.gte.${new Date().toISOString()}`)
      .order('amount_per_participant', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ruleError) {
      console.error('Error finding support rule:', ruleError);
      return { allocation: null, error: ruleError.message };
    }

    if (!rule) {
      return { allocation: null, error: 'No eligible support rule found' };
    }

    // Check budget availability
    if (rule.budget_total && rule.budget_spent >= rule.budget_total) {
      return { allocation: null, error: 'Support budget exhausted' };
    }

    const availableBudget = rule.budget_total - rule.budget_spent;
    if (availableBudget < rule.amount_per_participant) {
      return { allocation: null, error: 'Insufficient budget remaining' };
    }

    // Create or update allocation
    const allocationData = {
      rule_id: rule.id,
      sponsor_id: rule.sponsor_id,
      content_id: contentId,
      user_id: userId,
      amount: rule.amount_per_participant,
      currency: rule.currency,
      status: 'reserved' as const,
    };

    if (existing && existing.status === 'released') {
      // Update existing released allocation
      const { data: updated, error: updateError } = await supabase
        .from('sponsorship_allocations')
        .update(allocationData)
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating allocation:', updateError);
        return { allocation: null, error: updateError.message };
      }

      return { allocation: updated as SponsorAllocation, error: null };
    } else {
      // Create new allocation
      const { data: created, error: createError } = await supabase
        .from('sponsorship_allocations')
        .insert(allocationData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating allocation:', createError);
        return { allocation: null, error: createError.message };
      }

      return { allocation: created as SponsorAllocation, error: null };
    }
  } catch (err) {
    console.error('Unexpected error in reserveSupport:', err);
    return { allocation: null, error: String(err) };
  }
}

/**
 * Capture a reserved allocation when enrollment is confirmed.
 * Updates status to 'captured' and sets captured_at timestamp.
 */
export async function captureSupport(
  allocationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('sponsorship_allocations')
      .update({
        status: 'captured',
        captured_at: new Date().toISOString(),
      })
      .eq('id', allocationId)
      .eq('status', 'reserved'); // Only capture if currently reserved

    if (error) {
      console.error('Error capturing allocation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error in captureSupport:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Release a reserved allocation when enrollment is cancelled or fails.
 * Updates status to 'released' and sets released_at timestamp.
 * This frees up the budget for other users.
 */
export async function releaseSupport(
  allocationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('sponsorship_allocations')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
      })
      .eq('id', allocationId)
      .eq('status', 'reserved'); // Only release if currently reserved

    if (error) {
      console.error('Error releasing allocation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error in releaseSupport:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Get all allocations for a user (for My Agora view)
 */
export async function getUserAllocations(
  userId: string
): Promise<{ allocations: SponsorAllocation[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('sponsorship_allocations')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['reserved', 'captured'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user allocations:', error);
      return { allocations: [], error: error.message };
    }

    return { allocations: (data || []) as SponsorAllocation[], error: null };
  } catch (err) {
    console.error('Unexpected error in getUserAllocations:', err);
    return { allocations: [], error: String(err) };
  }
}

/**
 * Get all allocations for a sponsor (for Sponsor Dashboard)
 */
export async function getSponsorAllocations(
  sponsorId: string,
  ruleId?: string,
  status?: 'reserved' | 'captured' | 'released'
): Promise<{ allocations: SponsorAllocation[]; error: string | null }> {
  try {
    let query = supabase
      .from('sponsorship_allocations')
      .select('*')
      .eq('sponsor_id', sponsorId);

    if (ruleId) {
      query = query.eq('rule_id', ruleId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sponsor allocations:', error);
      return { allocations: [], error: error.message };
    }

    return { allocations: (data || []) as SponsorAllocation[], error: null };
  } catch (err) {
    console.error('Unexpected error in getSponsorAllocations:', err);
    return { allocations: [], error: String(err) };
  }
}

/**
 * Get allocations for a specific content/program (for Expert view)
 */
export async function getContentAllocations(
  contentId: string
): Promise<{ allocations: SponsorAllocation[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('sponsorship_allocations')
      .select('*')
      .eq('content_id', contentId)
      .in('status', ['reserved', 'captured'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching content allocations:', error);
      return { allocations: [], error: error.message };
    }

    return { allocations: (data || []) as SponsorAllocation[], error: null };
  } catch (err) {
    console.error('Unexpected error in getContentAllocations:', err);
    return { allocations: [], error: String(err) };
  }
}
