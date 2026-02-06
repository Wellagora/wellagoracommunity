// DEPRECATED: This edge function is no longer used. Scheduled for removal.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://e2836cce-2bbf-4c42-8c46-419545d375c8.lovableproject.com',
  Deno.env.get('PRODUCTION_DOMAIN'), // e.g., https://yourdomain.com
  'http://localhost:5173', // Local development
].filter(Boolean); // Remove undefined values

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Validation function with strict input limits
function validateTranslationInput(data: any): { valid: boolean; error?: string; data?: { title: string; description: string } } {
  if (!data.title || typeof data.title !== 'string') {
    return { valid: false, error: 'Title is required' };
  }
  
  if (!data.description || typeof data.description !== 'string') {
    return { valid: false, error: 'Description is required' };
  }

  // Trim inputs
  const title = data.title.trim();
  const description = data.description.trim();

  // Length validation
  if (title.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  if (description.length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters' };
  }
  if (description.length > 2000) {
    return { valid: false, error: 'Description must be less than 2000 characters' };
  }

  // Character validation - allow letters, numbers, punctuation, and whitespace
  // Unicode property escapes for international characters
  const validCharPattern = /^[\p{L}\p{N}\p{P}\p{Z}\s]+$/u;
  if (!validCharPattern.test(title)) {
    return { valid: false, error: 'Title contains invalid characters' };
  }
  if (!validCharPattern.test(description)) {
    return { valid: false, error: 'Description contains invalid characters' };
  }

  // Remove control characters and zero-width characters
  const sanitizedTitle = title.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '');
  const sanitizedDescription = description.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '');

  return {
    valid: true,
    data: {
      title: sanitizedTitle,
      description: sanitizedDescription
    }
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Validate and sanitize input
    const validation = validateTranslationInput(requestData);
    if (!validation.valid) {
      console.log('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { title, description } = validation.data!;

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
