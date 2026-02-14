// DEPRECATED: This edge function is no longer used. Scheduled for removal.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

// Validation schemas
const businessProfileSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  industry: z.string().max(100).optional(),
  size: z.number().int().min(0).max(1000000).optional(),
  location: z.string().max(200).optional(),
  csr_goals: z.array(z.string().max(200)).max(20).optional(),
  budget: z.string().max(100).optional(),
});

const matchChallengeSchema = z.object({
  businessProfile: businessProfileSchema,
  challengeId: z.string().uuid('Invalid challenge ID format'),
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[MATCH-CHALLENGE] Request received');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not set');
    }

    // Get user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('[MATCH-CHALLENGE] User authenticated:', user.id);

    // Validate and parse request body
    const rawBody = await req.json();
    const { businessProfile, challengeId } = matchChallengeSchema.parse(rawBody);

    console.log('[MATCH-CHALLENGE] Matching business to challenge (validated):', { 
      businessId: businessProfile.id,
      challengeId 
    });

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabaseClient
      .from('challenge_definitions')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      throw new Error('Challenge not found');
    }

    // Build AI prompt for matching
    const systemPrompt = `Te egy intelligens matching engine vagy a WellAgora platformhoz.
A platform mottója: "Together we thrive" - vállalatok és fenntarthatósági kihívások összekapcsolása.

Feladatod: Értékelni egy vállalat és egy fenntarthatósági kihívás közötti illeszkedést.

A matching szempontjai:
1. IPARÁG RELEVANCIÁJA (0-30 pont): Mennyire releváns a kihívás a vállalat iparágához?
2. MÉRET ILLESZKEDÉS (0-20 pont): Megfelelő-e a kihívás a vállalat méretéhez?
3. CSR CÉLOK (0-30 pont): Mennyire illeszkedik a vállalat fenntarthatósági céljaiba?
4. KÖLTSÉGVETÉS (0-10 pont): Megvan-e a megfelelő szponzori csomag?
5. IMPACT POTENCIÁL (0-10 pont): Mekkora a várható hatás?

ÖSSZESÍTETT PONTSZÁM: 0-100
- 80-100: Kiváló illeszkedés (automatikus ajánlás)
- 60-79: Jó illeszkedés (manuális jóváhagyás)
- 40-59: Közepes illeszkedés (megfontolás)
- 0-39: Gyenge illeszkedés (nem ajánlott)`;

    const userPrompt = `Értékeld a következő vállalat és kihívás illeszkedését:

VÁLLALAT ADATAI:
- Név: ${businessProfile.name.substring(0, 200)}
- Iparág: ${(businessProfile.industry || 'Nem megadva').substring(0, 100)}
- Méret: ${businessProfile.size || 'Nem megadva'} alkalmazott
- Lokáció: ${(businessProfile.location || 'Nem megadva').substring(0, 200)}
- CSR Célok: ${(businessProfile.csr_goals?.join(', ') || 'Nem megadva').substring(0, 500)}
- Költségvetés: ${(businessProfile.budget || 'Nem megadva').substring(0, 100)}

KIHÍVÁS ADATAI:
- Cím: ${(challenge.title || 'N/A').substring(0, 200)}
- Leírás: ${(challenge.description || 'N/A').substring(0, 500)}
- Kategória: ${(challenge.category || 'N/A').substring(0, 50)}
- Nehézség: ${(challenge.difficulty || 'N/A').substring(0, 50)}
- Várható résztvevők: 50-100 fő
- Várható CO2 megtakarítás: ${challenge.base_impact?.co2_saved || 'N/A'} kg

Formázd a választ JSON objektumként:
{
  "matchScore": 0-100,
  "breakdown": {
    "industryRelevance": 0-30,
    "sizeAlignment": 0-20,
    "csrGoals": 0-30,
    "budget": 0-10,
    "impactPotential": 0-10
  },
  "recommendation": "excellent|good|moderate|poor",
  "reasoning": "Rövid magyarázat az illeszkedésről (2-3 mondat)",
  "suggestedPackage": "small|medium|large|enterprise",
  "expectedBenefits": [
    "Előny 1",
    "Előny 2",
    "Előny 3"
  ],
  "warnings": [
    "Figyelmeztetés 1 (opcionális)",
    "Figyelmeztetés 2 (opcionális)"
  ]
}`;

    console.log('[MATCH-CHALLENGE] Calling Lovable AI for matching...');

    // Call Lovable AI with Gemini Flash
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[MATCH-CHALLENGE] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('[MATCH-CHALLENGE] AI response received');

    const matchingResult = aiData.choices?.[0]?.message?.content;
    if (!matchingResult) {
      throw new Error('No matching result generated by AI');
    }

    // Parse AI response
    let matchData;
    try {
      const cleanContent = matchingResult
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      matchData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('[MATCH-CHALLENGE] JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('[MATCH-CHALLENGE] Match score:', matchData.matchScore);

    return new Response(JSON.stringify({
      success: true,
      match: {
        challengeId,
        businessId: businessProfile.id,
        ...matchData,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[MATCH-CHALLENGE] Error:', error);
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Validation error',
        details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Generic error response (no stack traces)
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing the matching request',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
