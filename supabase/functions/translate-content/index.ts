import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function translateWithAnthropic(text: string, lang: string, apiKey: string): Promise<string> {
  const langName = lang === 'en' ? 'English' : lang === 'de' ? 'German' : lang;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Translate the following Hungarian text to ${langName}. Return ONLY the translation, nothing else. No explanations, no quotes, no prefixes. Keep proper nouns and brand names unchanged. Maintain the original tone and style.\n\n${text}`
          }
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Anthropic error for ${lang}:`, response.status, errText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text?.trim() || text;
  } finally {
    clearTimeout(timeout);
  }
}

async function translateWithLovable(text: string, lang: string, apiKey: string): Promise<string> {
  const langName = lang === 'en' ? 'English' : lang === 'de' ? 'German' : lang;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following Hungarian text to ${langName}. Return ONLY the translation, nothing else.`
          },
          { role: "user", content: text }
        ],
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Lovable gateway error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || text;
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguages } = await req.json();

    if (!text || !targetLanguages || !Array.isArray(targetLanguages)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, targetLanguages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!ANTHROPIC_API_KEY && !LOVABLE_API_KEY) {
      console.error("No translation API key configured (ANTHROPIC_API_KEY or LOVABLE_API_KEY)");
      return new Response(
        JSON.stringify({ error: "NO_API_KEY", message: "Translation service not configured. Set ANTHROPIC_API_KEY or LOVABLE_API_KEY in Supabase secrets." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const translations: Record<string, string> = {};

    for (const lang of targetLanguages) {
      try {
        if (ANTHROPIC_API_KEY) {
          translations[lang] = await translateWithAnthropic(text, lang, ANTHROPIC_API_KEY);
        } else if (LOVABLE_API_KEY) {
          translations[lang] = await translateWithLovable(text, lang, LOVABLE_API_KEY);
        }
      } catch (err) {
        console.error(`Translation failed for ${lang}:`, err);
        // Try fallback if primary fails
        if (ANTHROPIC_API_KEY && LOVABLE_API_KEY) {
          try {
            translations[lang] = await translateWithLovable(text, lang, LOVABLE_API_KEY);
          } catch {
            translations[lang] = text; // Last resort: return original
          }
        } else {
          translations[lang] = text;
        }
      }
    }

    return new Response(
      JSON.stringify(translations),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
