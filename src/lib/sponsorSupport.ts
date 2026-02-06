import { supabase } from "@/integrations/supabase/client";
import type { SponsorSupportRule, SponsorshipAllocation, SupportBreakdown, Currency } from "@/types/sponsorSupport";

/**
 * Find eligible support rules for a program
 */
export async function findEligibleSupportRule(
  programId: string,
  programCurrency: Currency
): Promise<SponsorSupportRule | null> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("sponsor_support_rules")
      .select("*")
      .eq("scope_type", "program")
      .eq("scope_id", programId)
      .eq("currency", programCurrency)
      .eq("status", "active")
      .lte("start_at", now)
      .or(`end_at.is.null,end_at.gte.${now}`)
      .order("amount_per_participant", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
      throw error;
    }

    // Check if budget is exhausted
    if (data.budget_total && data.budget_spent >= data.budget_total) {
      return null;
    }

    // Check max participants if set
    if (data.max_participants) {
      const { count } = await supabase
        .from("sponsorship_allocations")
        .select("*", { count: "exact", head: true })
        .eq("rule_id", data.id)
        .in("status", ["reserved", "captured"]);

      if (count && count >= data.max_participants) {
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error("Error finding eligible support rule:", error);
    return null;
  }
}

/**
 * Calculate price breakdown with support
 */
export function calculateSupportBreakdown(
  basePrice: number,
  supportAmount: number,
  currency: Currency,
  sponsorName?: string
): SupportBreakdown {
  const userPays = Math.max(0, basePrice - supportAmount);
  
  return {
    base_price: basePrice,
    support_amount: supportAmount,
    user_pays: userPays,
    currency,
    sponsor_name: sponsorName,
  };
}

/**
 * Reserve an allocation (on Join intent)
 */
export async function reserveAllocation(
  ruleId: string,
  sponsorId: string,
  programId: string,
  userId: string,
  amount: number,
  currency: Currency
): Promise<{ success: boolean; allocationId?: string; error?: string }> {
  try {
    // Check for existing allocation (idempotency)
    const { data: existing } = await supabase
      .from("sponsorship_allocations")
      .select("id, status")
      .eq("rule_id", ruleId)
      .eq("user_id", userId)
      .eq("program_id", programId)
      .in("status", ["reserved", "captured"])
      .single();

    if (existing) {
      return { success: true, allocationId: existing.id };
    }

    // Create new reservation
    const { data, error } = await supabase
      .from("sponsorship_allocations")
      .insert({
        rule_id: ruleId,
        sponsor_id: sponsorId,
        program_id: programId,
        user_id: userId,
        amount,
        currency,
        status: "reserved",
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, allocationId: data.id };
  } catch (error: any) {
    console.error("Error reserving allocation:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Capture an allocation (on successful payment/confirmation)
 */
export async function captureAllocation(
  allocationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("sponsorship_allocations")
      .update({
        status: "captured",
        captured_at: new Date().toISOString(),
      })
      .eq("id", allocationId)
      .eq("status", "reserved");

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error capturing allocation:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Release an allocation (on cancel/back)
 */
export async function releaseAllocation(
  allocationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("sponsorship_allocations")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
      })
      .eq("id", allocationId)
      .eq("status", "reserved");

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error releasing allocation:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get sponsor name for display
 */
export async function getSponsorName(sponsorId: string): Promise<string | undefined> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, first_name, last_name")
      .eq("id", sponsorId)
      .single();

    if (error || !data) return undefined;

    return data.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim() || undefined;
  } catch (error) {
    console.error("Error fetching sponsor name:", error);
    return undefined;
  }
}

/**
 * Check if program has active support
 */
export async function programHasActiveSupport(
  programId: string,
  programCurrency: Currency
): Promise<boolean> {
  const rule = await findEligibleSupportRule(programId, programCurrency);
  return rule !== null;
}
