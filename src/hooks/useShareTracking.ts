import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Track UTM-based share clicks on page load.
 * Inserts a row into share_clicks when utm_source + utm_medium=share are present.
 * Should be called on pages that receive shared traffic (profile, program detail).
 */
export function useShareTracking(opts: {
  expertId?: string | null;
  programId?: string | null;
}) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");

    // Only track if this is a share-originated visit
    if (!utmSource || utmMedium !== "share") return;

    const visitorId =
      sessionStorage.getItem("wa_visitor_id") ||
      `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("wa_visitor_id", visitorId);

    // Deduplicate: don't re-track same visitor+source+page within this session
    const dedupeKey = `share_tracked_${utmSource}_${location.pathname}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");

    (supabase as any)
      .from("share_clicks")
      .insert({
        expert_id: opts.expertId || null,
        program_id: opts.programId || null,
        source: utmSource,
        medium: utmMedium,
        campaign: utmCampaign || null,
        visitor_id: visitorId,
        referrer: document.referrer || null,
        page_path: location.pathname,
      })
      .then(({ error }) => {
        if (error) console.error("Share click tracking error:", error);
      });
  }, [location.search, opts.expertId, opts.programId]);
}
