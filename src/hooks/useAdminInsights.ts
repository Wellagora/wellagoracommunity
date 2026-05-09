import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommunitySignal } from './useCommunityInsights';

/**
 * Admin Insights — minden kategóriát mutat, fókusszal a content-gap-eken.
 * Backend: get_admin_insights() SECURITY DEFINER függvény (k≥3 anonimitással).
 *
 * Caller-nek explicit verify-olnia kell hogy admin user — a függvény nem ellenőriz role-t,
 * csak a SECURITY DEFINER bypass-olja az RLS-t. Az AdminLayout / route-guard biztosítja,
 * hogy ide csak admin user-rel jut el az alkalmazás.
 */

interface UseAdminInsightsOptions {
  weeksBack?: number;
  onlyContentGaps?: boolean;
  enabled?: boolean;
}

export function useAdminInsights({
  weeksBack = 4,
  onlyContentGaps = false,
  enabled = true,
}: UseAdminInsightsOptions = {}) {
  return useQuery({
    queryKey: ['admin-insights', weeksBack, onlyContentGaps],
    queryFn: async (): Promise<CommunitySignal[]> => {
      const { data, error } = await supabase.rpc('get_admin_insights', {
        _weeks_back: weeksBack,
        _only_content_gaps: onlyContentGaps,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('get_admin_insights')) {
          console.warn('[useAdminInsights] get_admin_insights() not yet deployed — returning empty list');
          return [];
        }
        throw error;
      }

      return (data as CommunitySignal[]) || [];
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  });
}
