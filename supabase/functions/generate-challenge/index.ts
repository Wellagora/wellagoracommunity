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

// Prompt injection detection and sanitization
const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(previous|everything|all)/i,
  /new\s+(instructions?|prompts?|rules?|task)/i,
  /system\s*:/i,
  /\[?system\]?/i,
  /assistant\s*:/i,
  /\[?assistant\]?/i,
  /you\s+are\s+now/i,
  /act\s+as/i,
  /pretend\s+to\s+be/i,
  /disregard/i,
  /override/i,
];

function detectPromptInjection(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return INJECTION_PATTERNS.some(pattern => pattern.test(text));
}

function sanitizeInput(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove control characters and normalize whitespace
  let sanitized = input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Truncate to max length
  sanitized = sanitized.substring(0, maxLength);
  
  return sanitized;
}

function validateAndSanitizeInputs(userProfile: any, regionalData: any): { 
  sanitized: { userProfile: any, regionalData: any }, 
  blocked: boolean,
  reason?: string 
} {
  const fieldsToCheck: string[] = [];
  
  // Collect all text fields for injection detection
  if (userProfile) {
    if (userProfile.type) fieldsToCheck.push(userProfile.type);
    if (userProfile.location?.city) fieldsToCheck.push(userProfile.location.city);
    if (userProfile.location?.region) fieldsToCheck.push(userProfile.location.region);
    if (userProfile.interests) fieldsToCheck.push(...userProfile.interests);
    if (userProfile.skillLevel) fieldsToCheck.push(userProfile.skillLevel);
  }
  
  if (regionalData) {
    if (regionalData.climate) fieldsToCheck.push(regionalData.climate);
    if (regionalData.infrastructure) fieldsToCheck.push(regionalData.infrastructure);
    if (regionalData.localIssues) fieldsToCheck.push(...regionalData.localIssues);
  }
  
  // Check for injection patterns
  for (const field of fieldsToCheck) {
    if (detectPromptInjection(field)) {
      return { 
        sanitized: { userProfile: {}, regionalData: {} }, 
        blocked: true,
        reason: 'Potential prompt injection detected in input' 
      };
    }
  }
  
  // Sanitize all inputs
  const sanitized = {
    userProfile: userProfile ? {
      type: sanitizeInput(userProfile.type || '', 50),
      location: {
        city: sanitizeInput(userProfile.location?.city || '', 100),
        region: sanitizeInput(userProfile.location?.region || '', 100),
      },
      interests: (userProfile.interests || []).map((i: string) => sanitizeInput(i, 100)).filter(Boolean),
      skillLevel: sanitizeInput(userProfile.skillLevel || '', 50),
    } : {},
    regionalData: regionalData ? {
      climate: sanitizeInput(regionalData.climate || '', 100),
      infrastructure: sanitizeInput(regionalData.infrastructure || '', 100),
      localIssues: (regionalData.localIssues || []).map((i: string) => sanitizeInput(i, 200)).filter(Boolean),
    } : {},
  };
  
  return { sanitized, blocked: false };
}

// Validation schemas
const categorySchema = z.enum([
  'energy', 'transport', 'food', 'waste', 'community', 
  'innovation', 'water', 'biodiversity', 'circular-economy', 'green-finance'
]);

const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

const userProfileSchema = z.object({
  type: z.string().max(50).optional(),
  location: z.object({
    city: z.string().max(100).optional(),
    region: z.string().max(100).optional(),
  }).optional(),
  interests: z.array(z.string().max(100)).max(10).optional(),
  skillLevel: z.string().max(50).optional(),
}).optional();

const regionalDataSchema = z.object({
  climate: z.string().max(100).optional(),
  infrastructure: z.string().max(100).optional(),
  localIssues: z.array(z.string().max(200)).max(10).optional(),
}).optional();

const generateChallengeSchema = z.object({
  userProfile: userProfileSchema,
  regionalData: regionalDataSchema,
  category: categorySchema.optional(),
  difficulty: difficultySchema.optional(),
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[GENERATE-CHALLENGE] Request received');

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

    console.log('[GENERATE-CHALLENGE] User authenticated:', user.id);

    // Validate and parse request body
    const rawBody = await req.json();
    const { userProfile, regionalData, category, difficulty } = generateChallengeSchema.parse(rawBody);
    
    console.log('[GENERATE-CHALLENGE] Input data validated:', { 
      userType: userProfile?.type, 
      location: userProfile?.location,
      category,
      difficulty 
    });

    // Check for prompt injection and sanitize inputs
    const { sanitized, blocked, reason } = validateAndSanitizeInputs(userProfile, regionalData);
    
    if (blocked) {
      console.warn('[GENERATE-CHALLENGE] Blocked potential injection:', reason);
      return new Response(JSON.stringify({ 
        error: 'Invalid input detected',
        code: 'INVALID_INPUT'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[GENERATE-CHALLENGE] Inputs sanitized successfully');

    // Build AI prompt based on user data
    const systemPrompt = `Te egy fenntarthatósági kihívás generátor vagy a Wellagora platformhoz.
A Wellagora mottója: "Together we thrive" - közösen építjük a pozitív környezeti hatást (handprint).

Feladatod: Generálj egy személyre szabott, konkrét fenntarthatósági kihívást a megadott adatok alapján.

FONTOS SZABÁLYOK:
- A kihívás legyen KONKRÉT, MÉRHETŐ és MEGVALÓSÍTHATÓ
- Tartalmazzon pontos lépéseket és elvárásokat
- Számold ki a várható CO2 megtakarítást (kg-ban)
- A kihívás legyen releváns a felhasználó profiljához és lokációjához
- Használj motiváló, pozitív nyelvezetet
- A handprint építés legyen a fókusz, nem a bűntudat`;

    const userPrompt = `Generálj egy fenntarthatósági kihívást az alábbi paraméterek alapján:

FELHASZNÁLÓI PROFIL:
- Típus: ${sanitized.userProfile.type || 'citizen'}
- Lokáció: ${sanitized.userProfile.location?.city || 'Budapest'}, ${sanitized.userProfile.location?.region || 'Magyarország'}
- Érdeklődési területek: ${sanitized.userProfile.interests?.join(', ') || 'általános fenntarthatóság'}
- Szint: ${sanitized.userProfile.skillLevel || 'kezdő'}

REGIONÁLIS KONTEXTUS:
- Időjárás: ${sanitized.regionalData.climate || 'mérsékelt'}
- Infrastruktúra: ${sanitized.regionalData.infrastructure || 'városi'}
- Helyi problémák: ${sanitized.regionalData.localIssues?.join(', ') || 'nincs megadva'}

KIHÍVÁS PARAMÉTEREI:
- Kategória: ${category || 'bármilyen'}
- Nehézség: ${difficulty || 'kezdő'}

Formázd a választ JSON objektumként az alábbi struktúrában:
{
  "title": "Rövid, figyelemfelkeltő cím",
  "description": "1-2 mondatos leírás",
  "longDescription": "Részletes leírás (2-3 bekezdés) a kihívásról és annak jelentőségéről",
  "category": "energy|transport|food|waste|community|innovation|water|biodiversity|circular-economy|green-finance",
  "difficulty": "beginner|intermediate|advanced|expert",
  "duration": "N nap/hét",
  "pointsReward": 100-1000,
  "steps": [
    "1. lépés konkrét leírással",
    "2. lépés konkrét leírással",
    "..."
  ],
  "tips": [
    "Hasznos tipp 1",
    "Hasznos tipp 2",
    "..."
  ],
  "impact": {
    "co2Saved": X.X,
    "description": "Magyarázat a számításról"
  },
  "validation": {
    "type": "manual|photo|api_verified",
    "description": "Hogyan kell validálni a teljesítést"
  }
}`;

    console.log('[GENERATE-CHALLENGE] Calling Lovable AI...');

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
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[GENERATE-CHALLENGE] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('[GENERATE-CHALLENGE] AI response received');

    const generatedContent = aiData.choices?.[0]?.message?.content;
    if (!generatedContent) {
      throw new Error('No content generated by AI');
    }

    // Parse AI response (remove markdown code blocks if present)
    let challengeData;
    try {
      const cleanContent = generatedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      challengeData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('[GENERATE-CHALLENGE] JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Store in challenge_definitions table for admin moderation
    const { data: insertedChallenge, error: insertError } = await supabaseClient
      .from('challenge_definitions')
      .insert({
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        title: challengeData.title,
        description: challengeData.description,
        category: challengeData.category,
        difficulty: challengeData.difficulty,
        duration_days: parseInt(challengeData.duration.match(/\d+/)?.[0] || '7'),
        points_base: challengeData.pointsReward,
        base_impact: {
          co2_saved: challengeData.impact.co2Saved,
          description: challengeData.impact.description
        },
        validation_requirements: {
          type: challengeData.validation.type,
          description: challengeData.validation.description,
          steps: challengeData.steps,
          tips: challengeData.tips
        },
        is_active: false // Requires admin approval
      })
      .select()
      .single();

    if (insertError) {
      console.error('[GENERATE-CHALLENGE] Insert error:', insertError);
      throw insertError;
    }

    console.log('[GENERATE-CHALLENGE] Challenge stored for moderation:', insertedChallenge.id);

    return new Response(JSON.stringify({
      success: true,
      challenge: {
        ...challengeData,
        id: insertedChallenge.id,
        status: 'pending_moderation',
        message: 'Kihívás sikeresen generálva! Admin jóváhagyásra vár.'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[GENERATE-CHALLENGE] Error:', error);
    
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
      error: 'An error occurred generating the challenge',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
