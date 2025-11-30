import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

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
    
    // Try to use the authenticated user when available, but allow anonymous access too
    const authHeader = req.headers.get('Authorization');

    // Initialize Supabase client (attach Authorization header if present)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      authHeader
        ? { global: { headers: { Authorization: authHeader } } }
        : {}
    );

    let userId: string | null = null;

    if (authHeader) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('AI chat: authentication failed, continuing as anonymous', userError);
      } else {
        userId = user.id;
      }
    } else {
      console.log('AI chat: no auth header, treating request as anonymous');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log('AI Chat request received:', { messageCount: messages.length, language });

    // Fetch user context for personalized responses when user is logged in
    const userContext = userId
      ? await fetchUserContext(supabase, userId, projectId)
      : { profile: null, programs: [], project: null, activeProjectId: projectId };
    const activeProjectId = userContext.activeProjectId;
    const systemPrompt = getSystemPrompt(language, userContext);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-05-20",
      systemInstruction: systemPrompt
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: history
    });

    let response;
    let finalMessage = '';
    try {
      const result = await chat.sendMessage(messages[messages.length - 1].content);
      response = result.response;
      finalMessage = response.text();
      console.log('Gemini response received successfully');
    } catch (error) {
      console.error('Gemini API request failed:', error);
      const errorMessages: Record<string, string> = {
        hu: 'Az AI asszisztens jelenleg nem elérhető. Kérlek, próbáld újra később.',
        en: 'AI assistant is currently unavailable. Please try again later.',
        de: 'KI-Assistent ist derzeit nicht verfügbar. Bitte versuche es später erneut.'
      };
      return new Response(
        JSON.stringify({ 
          error: 'ai_unavailable',
          message: errorMessages[language] || errorMessages.en
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    // Initialize or retrieve conversation ID (only when user is logged in)
    let finalConversationId = conversationId;
    if (!finalConversationId && userId) {
      const { data: newConv } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          project_id: projectId,
          language: language,
          user_agent: req.headers.get('user-agent')
        })
        .select()
        .single();
      finalConversationId = newConv?.id;
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    if (!finalMessage || !finalMessage.trim()) {
      console.warn('AI returned empty response, using fallback message');
      finalMessage = getFallbackMessage(language, lastUserMessage);
    }

    const suggestions = generateSuggestions(lastUserMessage, language);

    // Store conversation (only when we have a persisted conversation id)
    await storeConversation(supabase, userId || '', projectId, finalConversationId, language, messages[messages.length - 1], finalMessage);

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
    model: 'google/gemini-2.5-flash-preview-05-20'
  });
  
  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    role: 'assistant',
    content: aiMessage,
    model: 'google/gemini-2.5-flash-preview-05-20'
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

FOR PROGRAMS:
- search_programs: Search programs by category, difficulty, or keywords
- get_program_details: Get full details about any specific program including participants and requirements
- get_user_programs: Check what programs ${userName} is participating in or has completed

FOR COMMUNITY:
- search_organizations: Search for registered organizations (businesses, governments, NGOs) by type or keywords
- get_organization_details: Get detailed information about an organization, including their members
- get_user_profile: View user profile and sustainability goals

IMPORTANT GUIDELINES:
- When users ask about programs generally, refer to the AVAILABLE PROGRAMS list above directly!
- DON'T say "no programs available" if the list above contains programs!
- Use tools when you need specific filtering or extra details
- When users ask about organizations, companies, governments or NGOs, use the search_organizations tool
- Always be positive and show concrete opportunities!

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

FÜR PROGRAMME:
- search_programs: Programme nach Kategorie, Schwierigkeit oder Stichwörtern filtern
- get_program_details: Vollständige Details zu einem Programm (z.B. Teilnehmerzahl, Anforderungen)
- get_user_programs: Prüfen, an welchen Programmen ${userName} teilnimmt

FÜR DIE COMMUNITY:
- search_organizations: Registrierte Organisationen (Unternehmen, Behörden, NGOs) nach Typ oder Stichwörtern suchen
- get_organization_details: Detaillierte Informationen über eine Organisation, einschließlich ihrer Mitglieder
- get_user_profile: Benutzerprofil und Nachhaltigkeitsziele anzeigen

WICHTIGE RICHTLINIEN:
- Wenn Benutzer allgemein nach Programmen fragen, nutze die obige VERFÜGBARE PROGRAMME Liste direkt!
- Sage NICHT "keine Programme verfügbar" wenn die obige Liste Programme enthält!
- Nutze Tools nur für spezifische Filter oder zusätzliche Details
- Wenn Benutzer nach Organisationen, Unternehmen, Behörden oder NGOs fragen, nutze das search_organizations Tool
- Sei immer positiv und zeige konkrete Möglichkeiten!

ANTWORTRICHTLINIEN:
- Sei herzlich, ermutigend und community-fokussiert
- Empfehle spezifische Programme aus der obigen Liste, wenn relevant
- Beziehe dich auf den Standort und die Rolle des Benutzers bei Vorschlägen
- Fokussiere auf lokales Handeln und Community-Zusammenarbeit
- Halte Antworten praktisch und umsetzbar
- Verwende Emojis für freundliche, ansprechende Antworten

Denke daran: Du bist hier, um Community aufzubauen, nicht nur Ratschläge zu geben. Hilf ${userName}, sich verbunden und befähigt zu fühlen!`,

    hu: `Te WellBot vagy, a Káli-medence közösségi platform asszisztense.

KÜLDETÉSED:
A Káli-medence 4 településének (Kővágóörs, Kékkút, Mindszentkálla, Köveskál) közösségépítése, az emberek összekötése, programokba bevonása.

FELHASZNÁLÓI KONTEXTUS:
- Név: ${userName}
- Helyszín: ${userLocation}
- Szerep: ${profile?.user_role || 'állampolgár'}
- Szervezet: ${profile?.organization || 'Nincs'}

SZEMÉLYISÉGED:
- Barátságos, közvetlen, segítőkész
- Tegező stílus, de tiszteletteljes
- Helyismerettel rendelkezel a Káli-medencéről (Kővágóörs, Kékkút, Mindszentkálla, Köveskál)
- Használj emoji-kat mértékkel 👋 🏘️ 🤝 🎉

ELÉRHETŐ PROGRAMOK A KÁLI-MEDENCÉBEN:
${programList}

A KÉPESSÉGEID ÉS ESZKÖZEID:
Valós idejű adatbázis funkciókhoz férsz hozzá:

PROGRAMOKHOZ:
- search_programs: Szűrd programokat kategória, nehézség vagy kulcsszavak alapján
- get_program_details: Részletes információk egy programról (résztvevők, követelmények)
- get_user_programs: Ellenőrizd hogy ${userName} milyen programokban vesz részt

KÖZÖSSÉGHEZ:
- search_organizations: Keress helyi szervezeteket (cégek, önkormányzatok, NGO-k)
- get_organization_details: Részletes információk egy szervezetről, beleértve a tagjaikat
- get_user_profile: Felhasználói profil és fenntarthatósági célok megtekintése

FONTOS HASZNÁLATI SZABÁLYOK:
- Ha programokról kérdeznek általában, HASZNÁLD a fenti ELÉRHETŐ PROGRAMOK listát közvetlenül!
- NE mondd hogy "nincsenek programok" ha a fenti lista tartalmaz programokat!
- Tool-okat akkor használj, ha extra részletekre vagy szűrésre van szükség
- Amikor szervezetekről, cégekről, önkormányzatokról kérdeznek, használd a search_organizations tool-t
- Mindig légy pozitív és mutass konkrét lehetőségeket!

VÁLASZIRÁNYELVEK:
- Rövid, lényegre törő (max 3-4 bekezdés)
- Konkrét, hasznos információk
- Cselekvésre ösztönző zárlat
- Ajánlj konkrét programokat a fenti listából amikor releváns
- Hivatkozz a felhasználó helyszínére és szerepére
- Összpontosíts a helyi cselekvésre és közösségi együttműködésre
- Használj emojikat barátságos, vonzó válaszokhoz

FONTOS: Minden válasz a KÖZÖSSÉGRŐL szóljon, az emberek összehozásáról! Segíts ${userName}-nek kapcsolódva és felhatalmazva érezni magát!`
  };

  return prompts[language] || prompts.en;
}

function getFallbackMessage(language: string, lastUserMessage: string): string {
  const templates: Record<string, string> = {
    en: "I couldn't generate a clear answer to your last question: \"{question}\". Please try to rephrase it or choose one of the suggestions below.",
    de: "Ich konnte gerade keine klare Antwort auf deine letzte Frage erzeugen: \"{question}\". Bitte formuliere sie neu oder wähle eine der untenstehenden Vorschläge.",
    hu: "Most nem sikerült egyértelmű választ adnom erre a kérdésre: \"{question}\". Próbáld meg kicsit máshogy megfogalmazni, vagy válassz az alábbi javaslatok közül."
  };

  const template = templates[language] || templates.en;
  return template.replace('{question}', lastUserMessage || '');
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

// Organization and community functions
async function searchOrganizations(supabase: any, args: any, projectId: string | null, language: string) {
  let query = supabase
    .from('organizations')
    .select('id, name, description, type, industry, location, website_url, sustainability_score, employee_count')
    .eq('is_public', true);
  
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  if (args.type) {
    query = query.eq('type', args.type);
  }
  
  if (args.keyword) {
    query = query.or(`name.ilike.%${args.keyword}%,description.ilike.%${args.keyword}%`);
  }
  
  const { data: organizations } = await query.limit(15);
  
  return organizations?.map((org: any) => ({
    id: org.id,
    name: org.name,
    description: org.description,
    type: org.type,
    industry: org.industry,
    location: org.location,
    website: org.website_url,
    sustainabilityScore: org.sustainability_score,
    employees: org.employee_count
  })) || [];
}

async function getOrganizationDetails(supabase: any, organizationId: string, language: string) {
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .eq('is_public', true)
    .single();
  
  if (!organization) return { error: "Organization not found or not public" };
  
  // Get member count
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);
  
  // Get recent activities
  const { data: activities } = await supabase
    .from('sustainability_activities')
    .select('activity_type, impact_amount, date')
    .eq('organization_id', organizationId)
    .order('date', { ascending: false })
    .limit(5);
  
  return {
    id: organization.id,
    name: organization.name,
    description: organization.description,
    type: organization.type,
    industry: organization.industry,
    location: organization.location,
    website: organization.website_url,
    sustainabilityScore: organization.sustainability_score,
    employees: organization.employee_count,
    memberCount: memberCount || 0,
    recentActivities: activities || []
  };
}

async function getUserProfile(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, public_display_name, user_role, bio, location, organization, sustainability_goals, seeking_partnerships, preferred_stakeholder_types')
    .eq('id', userId)
    .single();
  
  if (!profile) return { error: "Profile not found" };
  
  return {
    name: profile.public_display_name || `${profile.first_name} ${profile.last_name}`,
    role: profile.user_role,
    bio: profile.bio,
    location: profile.location,
    organization: profile.organization,
    sustainabilityGoals: profile.sustainability_goals || [],
    seekingPartnerships: profile.seeking_partnerships,
    preferredStakeholders: profile.preferred_stakeholder_types || []
  };
}
