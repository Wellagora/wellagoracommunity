// DEPRECATED: This edge function is no longer used. Scheduled for removal.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://wellagora.org',
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
const completionTypeSchema = z.enum(['manual', 'photo', 'api_verified', 'peer_verified']);

const userInputSchema = z.object({
  distance: z.number().min(0).max(1000).optional(),
  bulbCount: z.number().int().min(0).max(1000).optional(),
  waterSaved: z.number().min(0).max(100000).optional(),
}).optional();

const evidenceDataSchema = z.object({
  photoUrl: z.string().url().max(2048).optional(),
  gpsData: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
}).passthrough().optional();

const completeChallengeSchema = z.object({
  action: z.literal('complete-challenge'),
  challengeId: z.string().uuid('Invalid challenge ID format'),
  completionType: completionTypeSchema,
  userInput: userInputSchema,
  evidenceData: evidenceDataSchema,
  notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional(),
});

const getUserHandprintSchema = z.object({
  action: z.literal('get-user-handprint'),
});

const requestSchema = z.discriminatedUnion('action', [
  completeChallengeSchema,
  getUserHandprintSchema,
]);

interface ChallengeCompletion {
  challengeId: string;
  completionType: 'manual' | 'photo' | 'api_verified' | 'peer_verified';
  userInput?: any;
  evidenceData?: any;
  notes?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!;
    
    // Get the authorization header with Bearer prefix
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Error getting user:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Challenge validation request from user:', user.id);

    // Validate and parse request body
    const rawBody = await req.json();
    const validatedBody = requestSchema.parse(rawBody);

    if (validatedBody.action === 'complete-challenge') {
      const completion: ChallengeCompletion = {
        challengeId: validatedBody.challengeId,
        completionType: validatedBody.completionType,
        userInput: validatedBody.userInput,
        evidenceData: validatedBody.evidenceData,
        notes: validatedBody.notes?.trim(),
      };
      
      // Challenge definition lekérése
      const { data: challengeDef, error: challengeError } = await supabaseClient
        .from('challenge_definitions')
        .select('*')
        .eq('id', completion.challengeId)
        .single();
        
      if (challengeError || !challengeDef) {
        return new Response(JSON.stringify({ error: 'Challenge not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Impact számítás és validálás
      const result = await calculateImpactAndValidate(
        challengeDef,
        completion,
        anthropicApiKey
      );

      // Challenge completion létrehozása
      const { data: challengeCompletion, error: insertError } = await supabaseClient
        .from('challenge_completions')
        .insert({
          user_id: user.id,
          challenge_id: completion.challengeId,
          completion_type: completion.completionType,
          evidence_data: completion.evidenceData,
          impact_data: result.impactData,
          points_earned: result.pointsEarned,
          validation_score: result.validationScore,
          validation_status: result.validationScore > 0.7 ? 'validated' : 'pending',
          notes: completion.notes
        })
        .select()
        .single();

      if (insertError) {
        console.error('Challenge completion insert error:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to save completion' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Sustainability activity létrehozása
      const { error: activityError } = await supabaseClient
        .from('sustainability_activities')
        .insert({
          user_id: user.id,
          activity_type: challengeDef.category,
          description: `${challengeDef.title} teljesítve`,
          impact_amount: result.impactData.co2_saved || 0,
          points_earned: result.pointsEarned,
          challenge_completion_id: challengeCompletion.id,
          validation_method: completion.completionType,
          confidence_score: result.validationScore,
          evidence_url: completion.evidenceData?.photoUrl,
          auto_generated: true
        });

      if (activityError) {
        console.error('Activity insert error:', activityError);
      }

      return new Response(JSON.stringify({ 
        success: true,
        completion: challengeCompletion,
        impactSummary: result.impactData,
        validationFeedback: result.feedback
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (validatedBody.action === 'get-user-handprint') {
      // Felhasználó összes aktivitásának összesítése
      const { data: activities, error: activitiesError } = await supabaseClient
        .from('sustainability_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]); // aktuális hónap

      if (activitiesError) {
        console.error('Activities fetch error:', activitiesError);
        return new Response(JSON.stringify({ error: 'Failed to fetch activities' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const handprint = calculateHandprintFromActivities(activities || []);
      
      return new Response(JSON.stringify({ handprint }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Challenge validation error:', error);
    
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
      error: 'An error occurred processing your request',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculateImpactAndValidate(
  challengeDef: any,
  completion: ChallengeCompletion,
  anthropicApiKey: string
) {
  const baseImpact = challengeDef.base_impact;
  const validationReqs = challengeDef.validation_requirements;
  
  // Alapvető impact számítás
  let co2Saved = 0;
  let calculationDetails: any = {};

  switch (baseImpact.calculation_method) {
    case 'user_distance * 0.21':
      const distance = completion.userInput?.distance || 10; // default 10km
      co2Saved = distance * 0.21;
      calculationDetails = { distance, co2_per_km: 0.21 };
      break;
      
    case 'bulb_count * 2.8':
      const bulbCount = completion.userInput?.bulbCount || 1;
      co2Saved = bulbCount * 2.8;
      calculationDetails = { bulb_count: bulbCount, co2_per_bulb: 2.8 };
      break;
      
    case 'water_saved_liters * 0.0004':
      const waterSaved = completion.userInput?.waterSaved || 500;
      co2Saved = waterSaved * 0.0004;
      calculationDetails = { water_saved_liters: waterSaved, co2_per_liter: 0.0004 };
      break;
      
    case 'fixed_impact':
    default:
      co2Saved = baseImpact.co2_saved || baseImpact.co2_saved_monthly || baseImpact.co2_saved_per_day || 5;
      calculationDetails = { method: 'fixed_impact', base_value: co2Saved };
      break;
  }

  // Validálási szint meghatározása
  let validationScore = 0.6; // alapértelmezett manuális
  let feedback = "Becslésen alapuló számítás. ";
  
  const bonusMultipliers = validationReqs?.bonus_multipliers || {};
  
  switch (completion.completionType) {
    case 'photo':
      validationScore = 0.85;
      feedback = "Fotó alapú igazolás - nagyon jó! ";
      if (bonusMultipliers.photo) {
        co2Saved *= bonusMultipliers.photo;
        feedback += `${Math.round((bonusMultipliers.photo - 1) * 100)}% bónusz ponttal! `;
      }
      break;
      
    case 'api_verified':
      validationScore = 0.95;
      feedback = "API alapú verifikáció - tökéletes! ";
      if (bonusMultipliers.gps || bonusMultipliers.smart_meter) {
        const multiplier = bonusMultipliers.gps || bonusMultipliers.smart_meter;
        co2Saved *= multiplier;
        feedback += `${Math.round((multiplier - 1) * 100)}% bónusz ponttal! `;
      }
      break;
      
    case 'peer_verified':
      validationScore = 0.80;
      feedback = "Közösség által igazolt - szuper! ";
      if (bonusMultipliers.community) {
        co2Saved *= bonusMultipliers.community;
        feedback += `${Math.round((bonusMultipliers.community - 1) * 100)}% bónusz ponttal! `;
      }
      break;
      
    case 'manual':
    default:
      validationScore = 0.6;
      feedback = "Manuális bevitel. Következő alkalommal próbáld fotóval a +20% bónuszért! ";
      break;
  }

  // AI-alapú intelligens visszajelzés
  if (completion.notes || completion.evidenceData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          system: `Te egy fenntarthatósági szakértő vagy. Adj pozitív, motiváló visszajelzést a felhasználó challenge teljesítéséhez.
              Legyen rövid (max 50 szó), magyar nyelven, és tartalmazzon egy praktikus tippet a további fejlődéshez.`,
          messages: [
            {
              role: 'user',
              content: `Challenge: ${challengeDef.title?.substring(0, 200) || 'N/A'}
              Kategória: ${challengeDef.category?.substring(0, 50) || 'N/A'}
              Felhasználó jegyzete: ${completion.notes?.substring(0, 500) || 'Nincs jegyzet'}
              Számított CO2 megtakarítás: ${co2Saved.toFixed(2)} kg
              Validálási típus: ${completion.completionType}`
            }
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const aiTip = aiData.content?.[0]?.text?.trim();
        if (aiTip) {
          feedback += `💡 ${aiTip}`;
        }
      }
    } catch (aiError) {
      console.error('AI feedback error:', aiError);
    }
  }

  const pointsEarned = Math.round(challengeDef.points_base * validationScore);

  return {
    impactData: {
      co2_saved: Math.round(co2Saved * 100) / 100,
      category: challengeDef.category,
      calculation_details: calculationDetails,
      validation_method: completion.completionType
    },
    pointsEarned,
    validationScore,
    feedback
  };
}

function calculateHandprintFromActivities(activities: any[]) {
  const categoryTotals = {
    transport: 0,
    energy: 0,
    waste: 0,
    water: 0,
    community: 0
  };

  let totalCo2Saved = 0;
  let totalPoints = 0;

  activities.forEach(activity => {
    const co2 = activity.impact_amount || 0;
    const points = activity.points_earned || 0;
    
    totalCo2Saved += co2;
    totalPoints += points;
    
    if (categoryTotals.hasOwnProperty(activity.activity_type)) {
      categoryTotals[activity.activity_type as keyof typeof categoryTotals] += co2;
    }
  });

  const treesEquivalent = Math.round(totalCo2Saved / 22);
  
  let rank = 'Kezdő';
  if (totalCo2Saved > 1000) rank = 'Fenntarthatósági Hős';
  else if (totalCo2Saved > 500) rank = 'Környezeti Bajnok';
  else if (totalCo2Saved > 200) rank = 'Zöld Aktivista';
  else if (totalCo2Saved > 50) rank = 'Öko Harcos';

  return {
    ...categoryTotals,
    totalCo2Saved: Math.round(totalCo2Saved * 100) / 100,
    treesEquivalent,
    totalPoints,
    rank,
    activitiesCount: activities.length
  };
}