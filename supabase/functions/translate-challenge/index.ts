import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();
    
    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: 'Title and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const languages = ['en', 'de', 'cs', 'sk', 'hr', 'ro', 'pl'];
    const translations: Record<string, { title: string; description: string }> = {
      hu: { title, description } // Original Hungarian text
    };

    console.log('Starting translations for:', { title, description });

    // Translate to each language
    for (const lang of languages) {
      try {
        const prompt = `Translate the following sustainability challenge from Hungarian to ${lang}. Maintain the tone and meaning. Return ONLY a JSON object with "title" and "description" fields, no other text.

Title: ${title}
Description: ${description}`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are a professional translator specializing in sustainability and environmental content. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          console.error(`Translation failed for ${lang}:`, response.status);
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: 'Translation credits exhausted. Please add credits to your workspace.' }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          continue; // Skip this language and continue with others
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          console.error(`No content in response for ${lang}`);
          continue;
        }

        // Try to parse the JSON response
        let translatedData;
        try {
          // Remove markdown code blocks if present
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          translatedData = JSON.parse(cleanContent);
        } catch (parseError) {
          console.error(`Failed to parse JSON for ${lang}:`, parseError, content);
          continue;
        }

        if (translatedData.title && translatedData.description) {
          translations[lang] = {
            title: translatedData.title,
            description: translatedData.description
          };
          console.log(`Successfully translated to ${lang}`);
        }
      } catch (error) {
        console.error(`Error translating to ${lang}:`, error);
        // Continue with other languages even if one fails
      }
    }

    // Return translations even if some failed
    console.log('Translation completed. Languages:', Object.keys(translations));
    
    return new Response(
      JSON.stringify({ translations }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Translation failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
