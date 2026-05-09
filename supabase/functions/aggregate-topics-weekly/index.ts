// aggregate-topics-weekly — WellBot Insights pipeline
// 2026-05-08
// Cél: a wellbot_message_topics-ből heti aggregátum építése a wellbot_topic_weekly_aggregate-ba.
// Minden vasárnap éjjel fut (cron) — ezzel az új héti adat kész lesz hétfőn reggelre,
// amikor Attila / a creator-ok a heti emailt kapják.
//
// Idempotens: a refresh_weekly_aggregates() SECURITY DEFINER függvény törli és újra-számolja
// a megadott hét aggregátumait. Megpróbálhatod többször is futtatni — nem duplázódik.
//
// Default: az AKTUÁLIS hét és a MÚLTBELI hét újra-aggregálva (overlap-védelem,
// ha valamiért elcsúszik a téma-extrakció).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Monday (ISO week start) of the date
function getMondayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Optional: parse body for explicit week_start override
    let weeksToProcess: string[] = [];
    try {
      const body = await req.json();
      if (typeof body?.week_start === 'string') {
        weeksToProcess = [body.week_start];
      } else if (Array.isArray(body?.weeks)) {
        weeksToProcess = body.weeks;
      }
    } catch {
      // No body — use default: last 2 weeks (current + previous)
    }

    if (weeksToProcess.length === 0) {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
      weeksToProcess = [getMondayOf(lastWeek), getMondayOf(today)];
    }

    console.log(`📊 aggregate-topics-weekly — processing weeks: ${weeksToProcess.join(', ')}`);

    const results: Array<{ week_start: string; rows: number; error?: string }> = [];

    for (const weekStart of weeksToProcess) {
      try {
        const { data, error } = await supabase
          .rpc('refresh_weekly_aggregates', { _week_start: weekStart });

        if (error) {
          console.error(`❌ Aggregation failed for ${weekStart}:`, error.message);
          results.push({ week_start: weekStart, rows: 0, error: error.message });
        } else {
          console.log(`✅ Week ${weekStart}: ${data} rows aggregated`);
          results.push({ week_start: weekStart, rows: data || 0 });
        }
      } catch (err: any) {
        console.error(`❌ Exception for ${weekStart}:`, err);
        results.push({ week_start: weekStart, rows: 0, error: err?.message || 'unknown' });
      }
    }

    const duration_ms = Date.now() - startTime;
    const totalRows = results.reduce((sum, r) => sum + r.rows, 0);
    const errors = results.filter(r => r.error).length;

    console.log(`✅ Done: total_rows=${totalRows}, errors=${errors}, ${duration_ms}ms`);

    return new Response(
      JSON.stringify({
        weeks_processed: results,
        total_rows: totalRows,
        errors,
        duration_ms
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('❌ aggregate-topics-weekly fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
