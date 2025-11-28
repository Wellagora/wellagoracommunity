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
    const activeProjectId = userContext.activeProjectId;
    const systemPrompt = getSystemPrompt(language, userContext);

    // Define tools for AI to use
    const tools = [
      {
        type: "function",
        function: {
          name: "search_programs",
          description: "Search for available programs based on category, difficulty, or keywords. Use this when users ask about specific types of programs.",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "Program category (e.g., 'health', 'mental-health', 'nutrition', 'community', 'environment')"
              },
              difficulty: {
                type: "string",
                enum: ["beginner", "intermediate", "advanced"],
                description: "Difficulty level filter"
              },
              keyword: {
                type: "string",
                description: "Search keyword in title or description"
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_program_details",
          description: "Get detailed information about a specific program including how to join, requirements, and current participants.",
          parameters: {
            type: "object",
            properties: {
              program_id: {
                type: "string",
                description: "The ID of the program to get details for"
              }
            },
            required: ["program_id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_user_programs",
          description: "Get programs the user is currently participating in or has completed.",
          parameters: {
            type: "object",
            properties: {}
          }
        }
      }
    ];

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
        tools: tools,
        max_tokens: 2000,
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

    // Check if AI wants to use tools
    const aiMessage = data.choices[0].message;
    
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      console.log('AI requested tool calls:', aiMessage.tool_calls.length);
      
      // Execute tool calls
      const toolResults = [];
      for (const toolCall of aiMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${functionName}`, functionArgs);
        
        let result;
        if (functionName === "search_programs") {
          result = await searchPrograms(supabase, functionArgs, activeProjectId, language);
        } else if (functionName === "get_program_details") {
          result = await getProgramDetails(supabase, functionArgs.program_id, language);
        } else if (functionName === "get_user_programs") {
          result = await getUserPrograms(supabase, user.id, language);
        }
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(result)
        });
      }
      
      // Send tool results back to AI for final response
      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            aiMessage,
            ...toolResults
          ],
          max_tokens: 2000,
        }),
      });
      
      const finalData = await finalResponse.json();
      const finalMessage = finalData.choices[0].message.content;
      const suggestions = generateSuggestions(messages[messages.length - 1].content, language);
      
      // Store conversation
      await storeConversation(supabase, user.id, projectId, finalConversationId, language, messages[messages.length - 1], finalMessage);
      
      return new Response(
        JSON.stringify({ 
          message: finalMessage,
          suggestions,
          conversationId: finalConversationId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // No tool calls - direct response
    const finalMessage = aiMessage.content;
    const suggestions = generateSuggestions(messages[messages.length - 1].content, language);

    // Store conversation
    let finalConversationId = conversationId;
    if (!finalConversationId) {
      const { data: newConv } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          project_id: projectId,
          language: language,
          user_agent: req.headers.get('user-agent')
        })
        .select()
        .single();
      finalConversationId = newConv?.id;
    }
    
    await storeConversation(supabase, user.id, projectId, finalConversationId, language, messages[messages.length - 1], finalMessage);

    return new Response(
      JSON.stringify({ 
        message: finalMessage,
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

// Tool execution functions
async function searchPrograms(supabase: any, args: any, projectId: string | null, language: string) {
  let query = supabase
    .from('challenge_definitions')
    .select('id, title, description, category, difficulty, translations, points_base, is_team_challenge')
    .eq('is_active', true)
    .eq('project_id', projectId);
  
  if (args.category) {
    query = query.ilike('category', `%${args.category}%`);
  }
  
  if (args.difficulty) {
    query = query.eq('difficulty', args.difficulty);
  }
  
  if (args.keyword) {
    query = query.or(`title.ilike.%${args.keyword}%,description.ilike.%${args.keyword}%`);
  }
  
  const { data: programs } = await query.limit(10);
  
  return programs?.map((p: any) => ({
    id: p.id,
    title: p.translations?.[language]?.title || p.title,
    description: p.translations?.[language]?.description || p.description,
    category: p.category,
    difficulty: p.difficulty,
    points: p.points_base,
    isTeam: p.is_team_challenge
  })) || [];
}

async function getProgramDetails(supabase: any, programId: string, language: string) {
  const { data: program } = await supabase
    .from('challenge_definitions')
    .select('*')
    .eq('id', programId)
    .single();
  
  if (!program) return { error: "Program not found" };
  
  // Get participant count
  const { count } = await supabase
    .from('challenge_completions')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', programId);
  
  return {
    id: program.id,
    title: program.translations?.[language]?.title || program.title,
    description: program.translations?.[language]?.description || program.description,
    category: program.category,
    difficulty: program.difficulty,
    points: program.points_base,
    duration_days: program.duration_days,
    isTeam: program.is_team_challenge,
    minTeamSize: program.min_team_size,
    maxTeamSize: program.max_team_size,
    participants: count || 0,
    requirements: program.validation_requirements
  };
}

async function getUserPrograms(supabase: any, userId: string, language: string) {
  const { data: completions } = await supabase
    .from('challenge_completions')
    .select('challenge_id, completion_date, validation_status')
    .eq('user_id', userId)
    .order('completion_date', { ascending: false })
    .limit(10);
  
  if (!completions || completions.length === 0) {
    return [];
  }
  
  const programIds = completions.map((c: any) => c.challenge_id);
  const { data: programs } = await supabase
    .from('challenge_definitions')
    .select('id, title, category, translations')
    .in('id', programIds);
  
  return completions.map((c: any) => {
    const program = programs?.find((p: any) => p.id === c.challenge_id);
    return {
      title: program?.translations?.[language]?.title || program?.title,
      category: program?.category,
      completedDate: c.completion_date,
      status: c.validation_status
    };
  });
}

async function storeConversation(supabase: any, userId: string, projectId: string | null, conversationId: string | null, language: string, userMessage: any, aiMessage: string) {
  if (!conversationId) return;
  
  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    role: userMessage.role,
    content: userMessage.content,
    model: 'google/gemini-3-pro-preview'
  });
  
  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    role: 'assistant',
    content: aiMessage,
    model: 'google/gemini-3-pro-preview'
  });
}

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

  return { profile, programs, project, activeProjectId };
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

YOUR CAPABILITIES & TOOLS:
You have access to real-time database functions:
- search_programs: Search programs by category (health, mental-health, nutrition, community, environment), difficulty, or keywords
- get_program_details: Get full details about any specific program including participants and requirements
- get_user_programs: Check what programs the user is currently in or has completed

Use these tools actively to give accurate, personalized recommendations!

When users ask about programs:
1. Use search_programs to find relevant options
2. Use get_program_details to give complete information
3. Use get_user_programs to understand their history

IMPORTANT: Always search the database when users ask about programs! Don't just list what you saw in context.

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

DEINE FÄHIGKEITEN & WERKZEUGE:
Du hast Zugriff auf Echtzeit-Datenbankfunktionen:
- search_programs: Programme nach Kategorie (Gesundheit, mentale Gesundheit, Ernährung, Gemeinschaft, Umwelt), Schwierigkeit oder Stichwörtern suchen
- get_program_details: Vollständige Details zu jedem spezifischen Programm inkl. Teilnehmer und Anforderungen abrufen
- get_user_programs: Prüfen, an welchen Programmen der Benutzer teilnimmt oder teilgenommen hat

Nutze diese Werkzeuge aktiv für genaue, personalisierte Empfehlungen!

Wenn Benutzer nach Programmen fragen:
1. Verwende search_programs um relevante Optionen zu finden
2. Verwende get_program_details für vollständige Informationen
3. Verwende get_user_programs um ihre Historie zu verstehen

WICHTIG: Suche immer in der Datenbank, wenn Benutzer nach Programmen fragen! Liste nicht nur auf, was du im Kontext gesehen hast.

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

A KÉPESSÉGEID ÉS ESZKÖZEID:
Valós idejű adatbázis funkciókhoz férsz hozzá:
- search_programs: Programok keresése kategória (egészség, mentális egészség, táplálkozás, közösség, környezet), nehézség vagy kulcsszavak alapján
- get_program_details: Részletes információk lekérése bármely programról, beleértve a résztvevőket és követelményeket
- get_user_programs: Ellenőrzés, hogy a felhasználó milyen programokban vesz részt vagy vett részt

Használd ezeket az eszközöket aktívan pontos, személyre szabott ajánlásokhoz!

Amikor a felhasználók programokról kérdeznek:
1. Használd a search_programs-ot releváns lehetőségek kereséséhez
2. Használd a get_program_details-t teljes információkért
3. Használd a get_user_programs-ot az előzményeik megértéséhez

FONTOS: Mindig keress az adatbázisban, amikor a felhasználók programokról kérdeznek! Ne csak sorold fel, amit a kontextusban láttál.

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
