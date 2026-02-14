import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 10 translation requests per minute per user
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const authToken = req.headers.get('Authorization')?.slice(-12) || clientIp;
    const rl = checkRateLimit(`translate:${authToken}`, 10, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const { text, targetLanguages } = await req.json();
    
    if (!text || !targetLanguages || !Array.isArray(targetLanguages)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, targetLanguages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Translation service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const translations: Record<string, string> = {};

    for (const lang of targetLanguages) {
      const langName = lang === 'en' ? 'English' : lang === 'de' ? 'German' : lang;
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following Hungarian text to ${langName}. 
Return ONLY the translation, nothing else. No explanations, no quotes, no prefixes.
Keep proper nouns, brand names, and technical terms unchanged if they don't have a common translation.
Maintain the original tone and style.`
            },
            {
              role: "user",
              content: text
            }
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace" }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error(`AI gateway error for ${lang}:`, response.status, errorText);
        translations[lang] = text; // Fallback to original
        continue;
      }

      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content?.trim() || text;
      translations[lang] = translatedText;
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
