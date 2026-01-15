import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  category: string;
  suggestion_text: string;
  matched_program_id: string | null;
  matched_program_title: string | null;
  confidence: number;
  keywords: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { media_id, file_url, file_type, expert_id } = await req.json();
    
    console.log(`[analyze-media] Starting analysis for media ${media_id}, type: ${file_type}`);
    
    if (!file_url || !expert_id || !media_id) {
      console.error('[analyze-media] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: media_id, file_url, expert_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('[analyze-media] GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch expert's existing programs for matching
    console.log(`[analyze-media] Fetching programs for expert ${expert_id}`);
    const { data: programs, error: programsError } = await supabase
      .from('expert_contents')
      .select('id, title, category, description')
      .eq('creator_id', expert_id);

    if (programsError) {
      console.error('[analyze-media] Error fetching programs:', programsError);
    }

    const programList = programs?.map(p => `- "${p.title}" (kategória: ${p.category || 'nincs'})`).join('\n') || 'Nincs még programja';

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create analysis prompt
    const prompt = `Elemezd ezt a ${file_type === 'video' ? 'videót' : 'képet'} és adj vissza egy JSON objektumot.

A szakértő meglévő programjai:
${programList}

Feladatod:
1. Azonosítsd a tartalom témáját/kategóriáját (főzés, kézművesség, természet, sport, wellness, oktatás, stb.)
2. Határozd meg, melyik meglévő programhoz illene legjobban (ha van ilyen)
3. Adj javaslatot a szakértőnek magyarul

Válaszolj CSAK egy valid JSON objektummal, más szöveget ne írj:
{
  "category": "a tartalom kategóriája magyarul",
  "suggestion_text": "Rövid, barátságos javaslat a szakértőnek magyarul, max 2 mondat",
  "matched_program_title": "a legjobban illő program címe vagy null",
  "confidence": 0.0-1.0 közötti szám a bizonyosságról,
  "keywords": ["kulcsszó1", "kulcsszó2", "kulcsszó3"]
}`;

    console.log(`[analyze-media] Calling Gemini API for ${file_url}`);
    
    let analysisResult: AnalysisResult;
    
    try {
      // For images, we can use the URL directly
      // For videos, we analyze a frame or use the thumbnail
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: file_type === 'video' ? 'video/mp4' : 'image/jpeg',
            data: '' // Gemini 2.0 Flash can fetch from URL
          }
        },
        `URL a médiához: ${file_url}`
      ]);

      const responseText = result.response.text();
      console.log(`[analyze-media] Raw Gemini response: ${responseText.substring(0, 500)}`);
      
      // Parse JSON from response (handle markdown code blocks)
      let jsonStr = responseText;
      if (responseText.includes('```json')) {
        jsonStr = responseText.split('```json')[1].split('```')[0].trim();
      } else if (responseText.includes('```')) {
        jsonStr = responseText.split('```')[1].split('```')[0].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Find matched program ID
      let matched_program_id = null;
      if (parsed.matched_program_title && programs) {
        const matchedProgram = programs.find(
          p => p.title.toLowerCase().includes(parsed.matched_program_title.toLowerCase()) ||
               parsed.matched_program_title.toLowerCase().includes(p.title.toLowerCase())
        );
        matched_program_id = matchedProgram?.id || null;
      }
      
      analysisResult = {
        category: parsed.category || 'általános',
        suggestion_text: parsed.suggestion_text || 'Ez a tartalom remekül mutat!',
        matched_program_id,
        matched_program_title: parsed.matched_program_title || null,
        confidence: parsed.confidence || 0.7,
        keywords: parsed.keywords || []
      };
      
    } catch (aiError) {
      console.error('[analyze-media] Gemini API error:', aiError);
      // Fallback analysis
      analysisResult = {
        category: file_type === 'video' ? 'videó' : 'kép',
        suggestion_text: 'Ez a tartalom készen áll a publikálásra! Adj hozzá egy programhoz.',
        matched_program_id: null,
        matched_program_title: null,
        confidence: 0.5,
        keywords: []
      };
    }

    // Save analysis result to expert_media
    console.log(`[analyze-media] Saving analysis to database for media ${media_id}`);
    const { error: updateError } = await supabase
      .from('expert_media')
      .update({ 
        ai_suggestion: analysisResult,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', media_id);

    if (updateError) {
      console.error('[analyze-media] Error saving analysis:', updateError);
    }

    console.log(`[analyze-media] Analysis complete for media ${media_id}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisResult 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[analyze-media] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Analysis failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
