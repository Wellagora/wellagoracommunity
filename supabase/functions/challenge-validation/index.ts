import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChallengeCompletion {
  challengeId: string;
  completionType: 'manual' | 'photo' | 'api_verified' | 'peer_verified';
  userInput?: any; // km, bulb_count, stb.
  evidenceData?: any; // foto URL, GPS data, stb.
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Autentikáció ellenőrzése
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...payload }: { action: string } & any = await req.json();

    if (action === 'complete-challenge') {
      const completion: ChallengeCompletion = payload;
      
      // Challenge definition lekérése
      const { data: challengeDef, error: challengeError } = await supabase
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
        lovableApiKey
      );

      // Challenge completion létrehozása
      const { data: challengeCompletion, error: insertError } = await supabase
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
      const { error: activityError } = await supabase
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

    if (action === 'get-user-handprint') {
      // Felhasználó összes aktivitásának összesítése
      const { data: activities, error: activitiesError } = await supabase
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculateImpactAndValidate(
  challengeDef: any, 
  completion: ChallengeCompletion,
  lovableApiKey: string
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
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `Te egy fenntarthatósági szakértő vagy. Adj pozitív, motiváló visszajelzést a felhasználó challenge teljesítéséhez. 
              Legyen rövid (max 50 szó), magyar nyelven, és tartalmazzon egy praktikus tippet a további fejlődéshez.`
            },
            {
              role: 'user',
              content: `Challenge: ${challengeDef.title}
              Kategória: ${challengeDef.category}
              Felhasználó jegyzete: ${completion.notes || 'Nincs jegyzet'}
              Számított CO2 megtakarítás: ${co2Saved.toFixed(2)} kg
              Validálási típus: ${completion.completionType}`
            }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const aiTip = aiData.choices?.[0]?.message?.content;
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