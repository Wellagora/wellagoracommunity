import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'en', conversationId = null, projectId = null } = await req.json();
    
    // Get authorization header to authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Authentication failed");
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('AI Chat request received:', { messageCount: messages.length, language });

    // Fetch user context for personalized responses
    const userContext = await fetchUserContext(supabase, user.id, projectId);
    const systemPrompt = getSystemPrompt(language, userContext);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received successfully');

    const aiMessage = data.choices[0].message.content;
    const suggestions = generateSuggestions(messages[messages.length - 1].content, language);

    // Store conversation and messages in database
    let finalConversationId = conversationId;
    
    // Create new conversation if none exists
    if (!finalConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          project_id: projectId,
          language: language,
          user_agent: req.headers.get('user-agent')
        })
        .select()
        .single();
      
      if (convError) {
        console.error('Error creating conversation:', convError);
      } else {
        finalConversationId = newConv.id;
      }
    }
    
    // Store messages if we have a conversation ID
    if (finalConversationId) {
      const lastUserMessage = messages[messages.length - 1];
      
      // Store user message
      await supabase.from('ai_messages').insert({
        conversation_id: finalConversationId,
        role: lastUserMessage.role,
        content: lastUserMessage.content,
        model: 'google/gemini-3-pro-preview'
      });
      
      // Store assistant message
      await supabase.from('ai_messages').insert({
        conversation_id: finalConversationId,
        role: 'assistant',
        content: aiMessage,
        model: 'google/gemini-3-pro-preview'
      });
    }

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        suggestions,
        conversationId: finalConversationId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function fetchUserContext(supabase: any, userId: string, projectId: string | null) {
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, location, user_role, organization, project_id')
    .eq('id', userId)
    .single();

  const activeProjectId = projectId || profile?.project_id;

  // Fetch available programs in user's project
  const { data: programs } = await supabase
    .from('challenge_definitions')
    .select('id, title, description, category, difficulty, translations')
    .eq('is_active', true)
    .eq('project_id', activeProjectId)
    .limit(10);

  // Fetch project info
  const { data: project } = activeProjectId ? await supabase
    .from('projects')
    .select('name, region_name, villages')
    .eq('id', activeProjectId)
    .single() : { data: null };

  return { profile, programs, project };
}

function getSystemPrompt(language: string, context: any): string {
  const { profile, programs, project } = context;
  
  const userName = profile?.first_name || 'there';
  const userLocation = profile?.location || 'your area';
  const projectName = project?.name || 'Wellagora';
  const regionName = project?.region_name || 'your region';
  
  const programList = programs?.map((p: any) => {
    const title = p.translations?.[language]?.title || p.title;
    const desc = p.translations?.[language]?.description || p.description;
    return `- ${title} (${p.category}, ${p.difficulty}): ${desc}`;
  }).join('\n') || 'No programs available yet.';

  const prompts: Record<string, string> = {
    en: `You are WellBot, the community engagement assistant for ${projectName} in ${regionName}. 

USER CONTEXT:
- Name: ${userName}
- Location: ${userLocation}
- Role: ${profile?.user_role || 'citizen'}
- Organization: ${profile?.organization || 'None'}

YOUR MISSION:
Help ${userName} engage with the community, discover programs, and take meaningful local action.

AVAILABLE PROGRAMS IN ${regionName}:
${programList}

YOUR CAPABILITIES:
- Recommend relevant programs based on user interests and location
- Help users understand how to join and participate in programs
- Connect users with others in their region
- Share information about local impact and community achievements
- Guide users through platform features (creating teams, tracking progress, etc.)
- Answer questions about sustainability in the context of our community

RESPONSE GUIDELINES:
- Be warm, encouraging, and community-focused
- Recommend specific programs from the list above when relevant
- Reference the user's location and role when making suggestions
- Focus on local action and community collaboration
- Keep responses practical and actionable
- Use emojis to make responses friendly and engaging

Remember: You're here to build community, not just give advice. Help ${userName} feel connected and empowered!`,

    de: `Du bist WellBot, der Community-Engagement-Assistent für ${projectName} in ${regionName}.

BENUTZERKONTEXT:
- Name: ${userName}
- Standort: ${userLocation}
- Rolle: ${profile?.user_role || 'Bürger'}
- Organisation: ${profile?.organization || 'Keine'}

DEINE MISSION:
Hilf ${userName}, sich mit der Community zu engagieren, Programme zu entdecken und bedeutungsvolle lokale Maßnahmen zu ergreifen.

VERFÜGBARE PROGRAMME IN ${regionName}:
${programList}

DEINE FÄHIGKEITEN:
- Empfehle relevante Programme basierend auf Benutzerinteressen und Standort
- Hilf Benutzern zu verstehen, wie sie an Programmen teilnehmen können
- Verbinde Benutzer mit anderen in ihrer Region
- Teile Informationen über lokale Auswirkungen und Community-Erfolge
- Führe Benutzer durch Plattformfunktionen (Teams erstellen, Fortschritt verfolgen, etc.)
- Beantworte Fragen zur Nachhaltigkeit im Kontext unserer Community

ANTWORTRICHTLINIEN:
- Sei herzlich, ermutigend und community-fokussiert
- Empfehle spezifische Programme aus der obigen Liste, wenn relevant
- Beziehe dich auf den Standort und die Rolle des Benutzers bei Vorschlägen
- Fokussiere auf lokales Handeln und Community-Zusammenarbeit
- Halte Antworten praktisch und umsetzbar
- Verwende Emojis für freundliche, ansprechende Antworten

Denke daran: Du bist hier, um Community aufzubauen, nicht nur Ratschläge zu geben. Hilf ${userName}, sich verbunden und befähigt zu fühlen!`,

    hu: `Te WellBot vagy, a közösségi elkötelezettség asszisztense a ${projectName} számára ${regionName}-ban/-ben.

FELHASZNÁLÓI KONTEXTUS:
- Név: ${userName}
- Helyszín: ${userLocation}
- Szerep: ${profile?.user_role || 'állampolgár'}
- Szervezet: ${profile?.organization || 'Nincs'}

A KÜLDETÉSED:
Segíts ${userName}-nek részt venni a közösségben, programokat felfedezni és helyi cselekvést végrehajtani.

ELÉRHETŐ PROGRAMOK ${regionName}-ban/-ben:
${programList}

A KÉPESSÉGEID:
- Ajánlj releváns programokat a felhasználó érdeklődése és helyszíne alapján
- Segíts a felhasználóknak megérteni, hogyan csatlakozzanak és vegyenek részt programokban
- Kösd össze a felhasználókat másokkal a régióban
- Ossz meg információkat a helyi hatásokról és közösségi eredményekről
- Vezesd végig a felhasználókat a platform funkcióin (csapatok létrehozása, előrehaladás követése, stb.)
- Válaszolj fenntarthatósági kérdésekre a közösségünk kontextusában

VÁLASZIRÁNYELVEK:
- Légy meleg, bátorító és közösségközpontú
- Ajánlj konkrét programokat a fenti listából, amikor releváns
- Hivatkozz a felhasználó helyszínére és szerepére javaslatok során
- Összpontosíts a helyi cselekvésre és közösségi együttműködésre
- Tartsd a válaszokat gyakorlatiasnak és megvalósíthatónak
- Használj emojikat a barátságos, vonzó válaszokhoz

Ne feledd: Azért vagy itt, hogy közösséget építs, nem csak tanácsot adj. Segíts ${userName}-nek kapcsolódva és felhatalmazva érezni magát!`
  };

  return prompts[language] || prompts.en;
}

function generateSuggestions(lastUserMessage: string, language: string): string[] {
  const input = lastUserMessage.toLowerCase();
  
  const suggestions: Record<string, Record<string, string[]>> = {
    en: {
      programs: [
        "What programs can I join?",
        "Show me beginner programs",
        "Programs in my area",
        "Team programs available"
      ],
      community: [
        "Who else is participating nearby?",
        "How do I create a team?",
        "Community success stories",
        "Local impact statistics"
      ],
      help: [
        "How do I track my progress?",
        "How do programs work?",
        "How to invite friends?",
        "Platform features guide"
      ],
      default: [
        "What programs can I join?",
        "Connect with local community",
        "How to get started?",
        "Show community impact"
      ]
    },
    de: {
      programs: [
        "Welche Programme kann ich beitreten?",
        "Zeige mir Anfängerprogramme",
        "Programme in meiner Nähe",
        "Verfügbare Teamprogramme"
      ],
      community: [
        "Wer nimmt noch in der Nähe teil?",
        "Wie erstelle ich ein Team?",
        "Community-Erfolgsgeschichten",
        "Lokale Wirkungsstatistiken"
      ],
      help: [
        "Wie verfolge ich meinen Fortschritt?",
        "Wie funktionieren Programme?",
        "Wie lade ich Freunde ein?",
        "Plattform-Funktionsleitfaden"
      ],
      default: [
        "Welche Programme kann ich beitreten?",
        "Mit lokaler Community verbinden",
        "Wie fange ich an?",
        "Community-Wirkung zeigen"
      ]
    },
    hu: {
      programs: [
        "Milyen programokhoz csatlakozhatok?",
        "Mutasd a kezdő programokat",
        "Programok a környékemen",
        "Elérhető csapatprogramok"
      ],
      community: [
        "Ki más vesz részt a közelben?",
        "Hogyan hozzak létre csapatot?",
        "Közösségi sikertörténetek",
        "Helyi hatásstatisztikák"
      ],
      help: [
        "Hogyan követhetem az előrehalásomat?",
        "Hogyan működnek a programok?",
        "Hogyan hívok meg barátokat?",
        "Platform funkciók útmutató"
      ],
      default: [
        "Milyen programokhoz csatlakozhatok?",
        "Kapcsolódás helyi közösséghez",
        "Hogyan kezdjem el?",
        "Közösségi hatás megjelenítése"
      ]
    }
  };

  const langSuggestions = suggestions[language] || suggestions.en;

  if (input.includes("program") || input.includes("challenge") || input.includes("join") || input.includes("csatlakoz")) {
    return langSuggestions.programs;
  } else if (input.includes("community") || input.includes("team") || input.includes("people") || input.includes("közösség")) {
    return langSuggestions.community;
  } else if (input.includes("how") || input.includes("help") || input.includes("guide") || input.includes("hogyan")) {
    return langSuggestions.help;
  }

  return langSuggestions.default;
}
