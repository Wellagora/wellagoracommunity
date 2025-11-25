import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPPORTED_LANGUAGES = {
  hu: "Hungarian",
  de: "German",
  en: "English",
  cs: "Czech",
  sk: "Slovak",
  hr: "Croatian",
  ro: "Romanian",
  pl: "Polish",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceLanguage, sourceText, targetLanguages } = await req.json();

    console.log("Translation request:", { sourceLanguage, sourceText, targetLanguages });

    if (!sourceLanguage || !sourceText) {
      return new Response(
        JSON.stringify({ error: "Missing sourceLanguage or sourceText" }),
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

    // Determine target languages (all except source if not specified)
    const targets = targetLanguages || 
      Object.keys(SUPPORTED_LANGUAGES).filter(lang => lang !== sourceLanguage);

    console.log("Target languages:", targets);

    // Create translation prompt
    const targetLangNames = targets.map(code => SUPPORTED_LANGUAGES[code as keyof typeof SUPPORTED_LANGUAGES]).join(", ");
    
    const systemPrompt = `You are a professional translator specializing in sustainability and environmental topics. 
Translate the given text from ${SUPPORTED_LANGUAGES[sourceLanguage as keyof typeof SUPPORTED_LANGUAGES]} into the following languages: ${targetLangNames}.

IMPORTANT RULES:
1. Maintain the same tone and style as the original
2. Keep any technical terms related to sustainability accurate
3. Preserve any placeholders like {variable}, %s, or {{interpolation}}
4. Return ONLY a valid JSON object with language codes as keys
5. Use these exact language codes: ${targets.join(", ")}
6. Do not include any explanation, just the JSON object

Example format:
{
  "de": "German translation here",
  "cs": "Czech translation here"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: sourceText },
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Translation service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const translatedContent = data.choices?.[0]?.message?.content;

    console.log("AI response:", translatedContent);

    if (!translatedContent) {
      return new Response(
        JSON.stringify({ error: "No translation returned" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from AI
    let translations;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = translatedContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                       translatedContent.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : translatedContent;
      translations = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw response:", translatedContent);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse translation response",
          rawResponse: translatedContent 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsed translations:", translations);

    return new Response(
      JSON.stringify({ 
        translations,
        sourceLanguage,
        sourceText 
      }),
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
