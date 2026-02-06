import { useQuery } from "@tanstack/react-query";
import { findEligibleSupportRule, getSponsorName } from "@/lib/sponsorSupport";
import type { Currency } from "@/types/sponsorSupport";

/**
 * Hook to check if a program has active sponsor support
 */
export function useProgramSupport(programId: string | undefined, programCurrency: Currency) {
  return useQuery({
    queryKey: ["program-support", programId, programCurrency],
    queryFn: async () => {
      if (!programId) return null;

      const rule = await findEligibleSupportRule(programId, programCurrency);
      if (!rule) return null;

      const sponsorName = await getSponsorName(rule.sponsor_id);

      return {
        rule,
        sponsorName: sponsorName || undefined,
      };
    },
    enabled: !!programId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to check support for multiple programs (for marketplace listing)
 */
export function useBulkProgramSupport(programs: Array<{ id: string; currency: Currency }>) {
  return useQuery({
    queryKey: ["bulk-program-support", programs.map(p => p.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        programs.map(async (program) => {
          const rule = await findEligibleSupportRule(program.id, program.currency);
          if (!rule) return { programId: program.id, hasSupport: false };

          const sponsorName = await getSponsorName(rule.sponsor_id);
          
          // Fetch sponsor logo from profiles
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: sponsorProfile } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", rule.sponsor_id)
            .single();
          
          return {
            programId: program.id,
            hasSupport: true,
            supportAmount: rule.amount_per_participant,
            sponsorName: sponsorName || undefined,
            sponsorLogoUrl: sponsorProfile?.avatar_url || undefined,
            currency: rule.currency,
          };
        })
      );

      return results.reduce((acc, result) => {
        acc[result.programId] = result;
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: programs.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
