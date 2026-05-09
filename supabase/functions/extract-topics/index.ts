// extract-topics — WellBot Insights pipeline
// 2026-05-08
// Cél: az ai_messages tábla feldolgozatlan user-üzeneteit végigveszi, és Anthropic Haiku-val
// kategória-meghatározást és témacímkézést végez. Eredmény → wellbot_message_topics tábla.
//
// Trigger lehetőségek:
//   1. Manual: POST /functions/v1/extract-topics — egy batch (max 100 üzenet)
//   2. Cron (ajánlott): Supabase scheduled function vagy pg_cron — minden órában
//   3. Webhook: ai_messages INSERT trigger (de batch hatékonyabb)
//
// Futási mód: idempotens, csak az új (még feldolgozatlan) üzeneteken dolgozik.
// Költség-becslés: ~200 token/üzenet × Haiku ($0.25/M input, $1.25/M output) ≈ $0.05-0.10 / nap.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const TOPIC_EXTRACTION_MODEL = "claude-haiku-4-5-20251001";
const BATCH_LIMIT = 50; // hány üzenetet dolgoz fel egy hívásban

const CATEGORIES = [
  'lifestyle',
  'craft',
  'gastronomy',
  'wellness',
  'hiking',
  'gardening',
  'heritage',
  'volunteering',
  'community',
  'sport',
  'culture',
  'family',
];

// --- System prompt — strict JSON output, no narrative -----------------------
function getExtractionPrompt(language: string): string {
  return `Te egy téma-osztályozó vagy a Wellagora fenntarthatósági közösségi platformon.
A bemenet egy felhasználói kérdés a WellBot-hoz.

Feladatod: 1-3 fő téma azonosítása, és Wellagora kategória-rendszerébe való elhelyezése.

WELLAGORA KATEGÓRIÁK (slug-formában):
${CATEGORIES.map(c => `  - ${c}`).join('\n')}

OUTPUT (csak JSON, semmilyen narratív szöveg, semmilyen markdown):
{
  "topics": [
    {
      "slug": "kebab-case-stable-id",
      "label": "Magyar nyelvű cím (ténymegállapító, NEM felkiáltó, NEM dicsérő)",
      "category": "egy a fenti kategóriák közül",
      "confidence": 0.0-1.0
    }
  ]
}

SZABÁLYOK:
- A slug stabil legyen — ugyanazt jelentő kérdéseknek ugyanaz a slug-ja, különböző nyelveken is.
- Ha a kérdés irreleváns, általános üdvözlés, vagy túl rövid: "topics": [] (üres tömb).
- Confidence < 0.5 esetén ne kerüljön be.
- A label legyen tényközlő, nem reklámszöveg. Pl. "Téli komposztálás" — NEM "Szuper komposztálás technikák!".
- Maximum 3 téma egy üzenetben.
- A bemeneti nyelv lehet HU/EN/DE — a slug és category mindig egyforma normalizált forma; a label a bemeneti nyelven.

PÉLDÁK:

Bemenet: "Hogyan komposztáljak télen, fagy idején?"
Output: {"topics":[{"slug":"composting-winter","label":"Téli komposztálás","category":"gardening","confidence":0.95}]}

Bemenet: "What gardening workshops do you have for kids?"
Output: {"topics":[{"slug":"family-gardening-kids","label":"Family gardening for kids","category":"family","confidence":0.85},{"slug":"gardening-workshops","label":"Gardening workshops","category":"gardening","confidence":0.7}]}

Bemenet: "Helló, mi újság?"
Output: {"topics":[]}

Bemenet: "asd"
Output: {"topics":[]}`;
}

// --- Main handler -----------------------------------------------------------
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Service role client — szükséges a SECURITY DEFINER függvények és a privát táblák íráshoz
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse body for optional batch size override
    let batchLimit = BATCH_LIMIT;
    try {
      const body = await req.json();
      if (typeof body?.limit === 'number') batchLimit = Math.min(body.limit, 200);
    } catch {
      // No body or invalid JSON — use default
    }

    console.log(`🔍 extract-topics — fetching up to ${batchLimit} unprocessed messages`);

    // Fetch unprocessed messages
    const { data: messages, error: fetchError } = await supabase
      .rpc('get_unprocessed_messages', { _limit: batchLimit });

    if (fetchError) {
      throw new Error(`Failed to fetch messages: ${fetchError.message}`);
    }

    if (!messages || messages.length === 0) {
      console.log('✅ No unprocessed messages — nothing to do');
      return new Response(
        JSON.stringify({ processed: 0, skipped: 0, errors: 0, duration_ms: Date.now() - startTime }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📦 Processing ${messages.length} messages`);

    let processed = 0;
    let skipped = 0;
    let errors = 0;
    const allTopicRows: any[] = [];

    // Process each message via Anthropic Haiku
    for (const msg of messages) {
      try {
        const language = msg.language || 'hu';
        const systemPrompt = getExtractionPrompt(language);

        const response = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
            "anthropic-beta": "prompt-caching-2024-07-31"
          },
          body: JSON.stringify({
            model: TOPIC_EXTRACTION_MODEL,
            max_tokens: 400,
            // System prompt cache-elve, mert minden hívásnál ugyanaz
            system: [
              { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }
            ],
            messages: [
              { role: "user", content: `Bemenet: "${msg.content}"\n\nOutput:` }
            ]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`❌ Anthropic API error for message ${msg.id}: ${response.status} ${errText}`);
          errors++;
          continue;
        }

        const result = await response.json();
        const textBlock = result.content?.find((b: any) => b.type === 'text');
        if (!textBlock?.text) {
          console.warn(`⚠️  Empty response for message ${msg.id}`);
          skipped++;
          continue;
        }

        // Parse JSON response
        let parsed: any;
        try {
          // Defensive: AI sometimes wraps in ```json blocks
          const cleaned = textBlock.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch (parseErr) {
          console.warn(`⚠️  JSON parse failed for message ${msg.id}: ${textBlock.text.slice(0, 100)}`);
          skipped++;
          continue;
        }

        const topics = parsed?.topics || [];

        if (topics.length === 0) {
          // No meaningful topics — skip (but don't reprocess: insert dummy row to mark processed?)
          // For now, we leave it unprocessed so "noise" messages stay queryable.
          // Future improvement: insert a row with confidence 0 and slug 'no-topic' to mark as processed.
          skipped++;
          continue;
        }

        for (const t of topics) {
          if (!t.slug || !t.label || typeof t.confidence !== 'number') continue;
          if (t.confidence < 0.5) continue;
          if (t.category && !CATEGORIES.includes(t.category)) {
            // Unknown category — keep but null-ify
            t.category = null;
          }
          allTopicRows.push({
            message_id: msg.id,
            conversation_id: msg.conversation_id,
            topic_slug: t.slug,
            topic_label: t.label,
            category_slug: t.category || null,
            confidence: t.confidence,
            language: language
          });
        }
        processed++;
      } catch (msgErr: any) {
        console.error(`❌ Error processing message ${msg.id}:`, msgErr?.message || msgErr);
        errors++;
      }
    }

    // Bulk insert topic rows
    if (allTopicRows.length > 0) {
      const { error: insertError } = await supabase
        .from('wellbot_message_topics')
        .insert(allTopicRows);

      if (insertError) {
        console.error('❌ Bulk insert failed:', insertError);
        return new Response(
          JSON.stringify({
            error: 'insert_failed',
            details: insertError.message,
            processed: 0,
            skipped,
            errors: errors + 1
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const duration_ms = Date.now() - startTime;
    console.log(`✅ Done: processed=${processed}, skipped=${skipped}, errors=${errors}, topic_rows=${allTopicRows.length}, ${duration_ms}ms`);

    return new Response(
      JSON.stringify({
        processed,
        skipped,
        errors,
        topic_rows_inserted: allTopicRows.length,
        duration_ms
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('❌ extract-topics fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
