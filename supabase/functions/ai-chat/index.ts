import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.0";

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

    console.log('===========================================');
    console.log('🤖 WellBot initializing with Gemini AI...');
    console.log('===========================================');
    console.log('AI Chat request received:', { messageCount: messages.length, language });

    // Fetch user context for personalized responses when user is logged in
    const userContext = userId
      ? await fetchUserContext(supabase, userId, projectId)
      : { profile: null, programs: [], project: null, activeProjectId: projectId };
    const activeProjectId = userContext.activeProjectId;
    const systemPrompt = getSystemPrompt(language, userContext);

    // Define tools for Gemini function calling
    const tools = [
      {
        functionDeclarations: [
          {
            name: "searchPrograms",
            description: "Search for expert programs/workshops by keyword, category, or expert name. Use this when user asks about available programs, workshops, courses, or wants to find something specific.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search term (keyword, category, or topic)"
                },
                category: {
                  type: "string",
                  description: "Optional category filter (e.g., 'cooking', 'gardening', 'crafts', 'wellness')"
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results (default: 5)"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "getProgramDetails",
            description: "Get detailed information about a specific program by ID. Use when user wants more details about a program.",
            parameters: {
              type: "object",
              properties: {
                programId: {
                  type: "string",
                  description: "The UUID of the program"
                }
              },
              required: ["programId"]
            }
          },
          {
            name: "getExpertInfo",
            description: "Get information about experts by name. Use when user asks about a specific expert or wants to find experts.",
            parameters: {
              type: "object",
              properties: {
                expertName: {
                  type: "string",
                  description: "Name of the expert to search for"
                }
              },
              required: []
            }
          },
          {
            name: "getUserVouchers",
            description: "Get the current user's vouchers and bookings. Use when user asks about their vouchers, bookings, or upcoming programs. Only works for authenticated users.",
            parameters: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["active", "used", "expired", "all"],
                  description: "Filter vouchers by status (default: active)"
                }
              }
            }
          }
        ]
      }
    ];

    // Initialize Gemini AI with fallback logic
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Model priority: gemini-2.0-flash-exp is confirmed working with the user's API key
    const modelOptions = [
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
      'gemini-exp-1206'
    ];
    
    let response;
    let finalMessage = '';
    let usedModel = '';
    
    for (const modelName of modelOptions) {
      try {
        console.log(`Attempting to use model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          tools: tools,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.5,  // Balanced creativity for general AI assistant
            topP: 0.8,         // Lower = more deterministic
            topK: 20,          // Lower = fewer options considered
            maxOutputTokens: 1024,  // Shorter, more concise responses
          }
        });

        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
          history: history
        });

        const result = await chat.sendMessage(messages[messages.length - 1].content);
        response = result.response;
        usedModel = modelName;
        
        // Check for function calls
        const functionCalls = response.functionCalls();
        
        if (functionCalls && functionCalls.length > 0) {
          console.log(`🔧 Function calls requested: ${functionCalls.map((c: any) => c.name).join(', ')}`);
          
          // Execute each function call
          const functionResults = [];
          
          for (const call of functionCalls) {
            let functionResult;
            
            try {
              switch (call.name) {
                case 'searchPrograms':
                  functionResult = await searchProgramsForAI(supabase, call.args, activeProjectId, language);
                  break;
                case 'getProgramDetails':
                  functionResult = await getProgramDetails(supabase, call.args.programId, language);
                  break;
                case 'getExpertInfo':
                  functionResult = await getExpertInfo(supabase, call.args.expertName);
                  break;
                case 'getUserVouchers':
                  functionResult = userId 
                    ? await getUserVouchers(supabase, userId, call.args.status || 'active')
                    : { error: 'User not authenticated. Please log in to view your vouchers.' };
                  break;
                default:
                  functionResult = { error: `Unknown function: ${call.name}` };
              }
              
              // Add grounding instruction for empty results
              if (functionResult && Array.isArray(functionResult) && functionResult.length === 0) {
                functionResult = {
                  results: [],
                  instruction: language === 'hu' 
                    ? 'A keresés nem talált eredményt. Mondd el őszintén a felhasználónak, hogy jelenleg nincs ilyen a platformon, és kérdezd meg, miben segíthetsz még.'
                    : language === 'de'
                    ? 'Die Suche ergab keine Ergebnisse. Sage dem Benutzer ehrlich, dass es derzeit nichts davon auf der Plattform gibt, und frage, wobei du noch helfen kannst.'
                    : 'The search returned no results. Tell the user honestly that there is currently nothing like that on the platform, and ask how else you can help.'
                };
              }
              
              console.log(`✅ Function ${call.name} executed successfully`);
            } catch (funcError: any) {
              console.error(`❌ Function ${call.name} failed:`, funcError);
              functionResult = { error: funcError.message || 'Function execution failed' };
            }
            
            functionResults.push({
              functionResponse: {
                name: call.name,
                response: functionResult
              }
            });
          }
          
          // Send function results back to Gemini for final response
          console.log('📤 Sending function results back to Gemini...');
          const finalResult = await chat.sendMessage(functionResults);
          finalMessage = finalResult.response.text();
          
          console.log(`✅ Gemini final response received using model: ${modelName}`);
        } else {
          // No function calls, use direct response
          finalMessage = response.text();
          console.log(`✅ Gemini response received successfully using model: ${modelName}`);
        }
        
        break; // Success, exit loop
        
      } catch (modelError: any) {
        console.error(`❌ Model ${modelName} failed:`, modelError?.message || modelError);
        
        // If this is the last model option, handle the error
        if (modelName === modelOptions[modelOptions.length - 1]) {
          console.error('All Gemini models failed. Returning error response.');
          
          const errorMessages: Record<string, string> = {
            hu: 'Az AI asszisztens jelenleg nem elérhető. Kérlek, próbáld újra később.',
            en: 'AI assistant is currently unavailable. Please try again later.',
            de: 'KI-Assistent ist derzeit nicht verfügbar. Bitte versuche es später erneut.'
          };
          
          return new Response(
            JSON.stringify({ 
              error: 'ai_unavailable',
              message: errorMessages[language] || errorMessages.en,
              details: 'All AI models are temporarily unavailable'
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
          );
        }
        // Otherwise continue to next model
        continue;
      }
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
    await storeConversation(supabase, userId || '', projectId, finalConversationId, language, messages[messages.length - 1], finalMessage, usedModel);

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

// Tool execution functions for AI function calling
async function searchProgramsForAI(supabase: any, args: any, projectId: string | null, language: string) {
  const query = args.query || '';
  const category = args.category;
  const limit = args.limit || 5;
  
  let queryBuilder = supabase
    .from('expert_contents')
    .select(`
      id, title, description, price, category, format,
      profiles!expert_contents_creator_id_fkey(full_name, avatar_url)
    `)
    .eq('status', 'published')
    .limit(limit);
  
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }
  
  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }
  
  const { data, error } = await queryBuilder;
  
  if (error) return { error: error.message };
  return { 
    programs: data?.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      format: p.format,
      expert: p.profiles?.full_name || 'Unknown'
    })) || [],
    count: data?.length || 0 
  };
}

async function getExpertInfo(supabase: any, expertName?: string) {
  let queryBuilder = supabase
    .from('profiles')
    .select(`
      id, full_name, avatar_url, bio, user_role,
      expert_contents!expert_contents_creator_id_fkey(id, title, category, price)
    `)
    .eq('user_role', 'expert');
  
  if (expertName) {
    queryBuilder = queryBuilder.ilike('full_name', `%${expertName}%`);
  }
  
  const { data, error } = await queryBuilder.limit(5);
  
  if (error) return { error: error.message };
  return { 
    experts: data?.map((e: any) => ({
      id: e.id,
      name: e.full_name,
      bio: e.bio,
      programs: e.expert_contents?.length || 0
    })) || [],
    count: data?.length || 0 
  };
}

async function getUserVouchers(supabase: any, userId: string, status?: string) {
  let queryBuilder = supabase
    .from('vouchers')
    .select(`
      id, code, status, created_at, expires_at,
      expert_contents(title, price)
    `)
    .eq('user_id', userId);
  
  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status);
  }
  
  const { data, error } = await queryBuilder.order('created_at', { ascending: false });
  
  if (error) return { error: error.message };
  return { 
    vouchers: data?.map((v: any) => ({
      id: v.id,
      code: v.code,
      status: v.status,
      program: v.expert_contents?.title || 'Unknown',
      expiresAt: v.expires_at
    })) || [],
    count: data?.length || 0 
  };
}

// Legacy function for backward compatibility
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

async function storeConversation(supabase: any, userId: string, projectId: string | null, conversationId: string | null, language: string, userMessage: any, aiMessage: string, modelUsed: string = 'gemini-1.5-flash') {
  if (!conversationId) return;
  
  const modelName = `google/${modelUsed}`;
  
  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    role: userMessage.role,
    content: userMessage.content,
    model: modelName
  });
  
  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    role: 'assistant',
    content: aiMessage,
    model: modelName
  });
}

async function fetchUserContext(supabase: any, userId: string, projectId: string | null) {
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, location, user_role, organization, project_id, bio, created_at')
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

  // Expert context: fetch expert's own programs, reviews, participants
  let expertContext: string | null = null;
  const userRole = profile?.user_role || '';
  if (['expert', 'creator'].includes(userRole)) {
    expertContext = await getExpertContextString(supabase, userId, profile);
  }

  return { profile, programs, project, activeProjectId, expertContext };
}

async function getExpertContextString(supabase: any, userId: string, profile: any): Promise<string> {
  // Fetch expert's programs
  const { data: contents } = await supabase
    .from('expert_contents')
    .select('id, title, content_type, price_huf, is_published, max_capacity, created_at')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  // Fetch reviews for expert's programs
  const contentIds = (contents || []).map((c: any) => c.id);
  let reviews: any[] = [];
  if (contentIds.length > 0) {
    const { data: reviewData } = await supabase
      .from('content_reviews')
      .select('rating')
      .in('content_id', contentIds);
    reviews = reviewData || [];
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'nincs meg';

  const freeCount = (contents || []).filter((c: any) => !c.price_huf || c.price_huf === 0).length;
  const paidCount = (contents || []).filter((c: any) => c.price_huf && c.price_huf > 0).length;
  const programCount = contents?.length || 0;
  const level = programCount <= 2 ? 'uj' : programCount <= 5 ? 'epitkezo' : 'halado';

  return `
SZAKERTO KONTEXTUS:
- Nev: ${profile?.first_name || ''} ${profile?.last_name || ''}
- Regisztracio ota: ${profile?.created_at ? new Date(profile.created_at).toLocaleDateString('hu') : '?'}
- Szint: ${level} (${programCount} program)
- Osszes program: ${programCount} (${freeCount} ingyenes, ${paidCount} fizetos)
- Atlag ertekeles: ${avgRating} (${reviews.length} ertekelesbol)
- Legutobbi program: ${contents?.[0]?.title || 'nincs meg'}
- Programok: ${JSON.stringify((contents || []).slice(0, 5).map((c: any) => ({
    title: c.title,
    type: c.content_type,
    price: c.price_huf,
  })))}
  `;
}

// ============================================
// ROLE-BASED SYSTEM PROMPTS
// ============================================

const EXPERT_COACH_SYSTEM_PROMPT = `Te a WellAgora Szakertoi Coach-a vagy.
A ceged a WellAgora Impact Marketplace-t mukodteto ProSelf International Inc.

SZEREPED:
Segitesz a szakertoknek sikeresnek lenni a WellAgora platformon.
Strategiai tanacsot adsz, nem technikai supportot.

A PLATFORM MUKODESE:
- Haromoldalu marketplace: Szakerto <-> Tag (kozossegi tag) <-> Szponzor
- A szakerto tartalmat hoz letre: online kurzus, elo webinar, helyszini workshop
- A tag fizet VAGY ingyen fer hozza (ha szponzoralt)
- Bevetel: Szakerto 80% / Platform 20%
- Szponzorok helyi vallalkozasok akik programokat tamogatnak

TANACSADASI IRANYELVEK:

1. UJ SZAKERTO (0-2 program):
- Javasolj INGYENES elso programot kozossegepitesre
- "Az elso programodat tedd ingyenesse - igy epitesz kozosseget es kapod az elso ertekeléseket"
- Segits a bemutatkozo tartalom megirasaban
- Biztatd hogy rovid, 30-60 perces programmal induljon

2. EPITKEZO SZAKERTO (3-5 program, van ertekelese):
- Javasolj atterest fizetos tartalomra
- Segits az arazasban: "Hasonlo programok 2000-5000 Ft kozott mozognak"
- Javasolj mixet: 1 ingyenes bevezeto + fizetos premium tartalom
- Emeld ki az ertekeléseit

3. HALADO SZAKERTO (5+ program, stabil kozonség):
- Javasolj sorozatokat (4 reszes kurzus magasabb aron)
- Emeld ki a szponzoralas lehetoseget
- Segits a szemelyes brand epiteseben
- Javasolj cross-promotion-t mas szakertokkel

ARAZASI UTMUTATO (HUF):
- Online tartalom (on-demand): 1 500 - 5 000 Ft
- Online elo (webinar, 60-90 perc): 2 000 - 8 000 Ft
- Helyszini workshop (2-3 ora): 3 000 - 15 000 Ft
- Tobbreszeskurzus: 5 000 - 25 000 Ft

STILUS:
- Magyar nyelven valaszolj (hacsak nem mas nyelven kerdeznek)
- Lelkes de professzionalis
- Konkret, akcioorientalt tanacsok
- Hasznalj emoji-kat mertekkel (max 2-3/uzenet)
- Rovid valaszok (max 150 szo), hacsak nem kerdeznek reszletesebben
- Szolitsd a szakertot tegezve

AMIBEN NEM SEGITESZ:
- Technikai support (arra van a help center)
- Jogi tanacsadas
- Konkret adoszamitas
- Mas platformok reklamozasa`;

const MEMBER_HELPER_SYSTEM_PROMPT = `Te a WellAgora asszisztense vagy.
Segitesz a kozossegi tagoknak programokat talalni, kerdeseiket megvalaszolni.
Magyar nyelven valaszolj. Legyel baratsagos es segitokesz.
Ajanlj programokat a tag erdeklodese alapjan.
Ha nem tudsz segiteni, iranyitsd a help center-re.
Max 1-2 emoji, rovid valaszok.`;

const SPONSOR_ADVISOR_SYSTEM_PROMPT = `Te a WellAgora Tamogatoi Tanacsadoja vagy.
Segitesz a szponzoroknak megerteni hogyan tamogathatnak programokat.
Magyar nyelven valaszolj. Legyel professzionalis.
Fazis 2-ben bovul a funkcionalitas.
Max 1-2 emoji, rovid valaszok.`;

function getRoleSystemPrompt(userRole: string): string {
  switch (userRole) {
    case 'expert':
    case 'creator':
      return EXPERT_COACH_SYSTEM_PROMPT;
    case 'sponsor':
    case 'business':
    case 'government':
    case 'ngo':
      return SPONSOR_ADVISOR_SYSTEM_PROMPT;
    case 'member':
    default:
      return MEMBER_HELPER_SYSTEM_PROMPT;
  }
}

function getSystemPrompt(language: string, context: any): string {
  const { profile, project, expertContext } = context;
  
  const userName = profile?.first_name || '';
  const userRole = profile?.user_role || 'member';
  const projectName = project?.name || 'WellAgora';

  // Role-based prompt routing
  const rolePrompt = getRoleSystemPrompt(userRole);

  // Build the full prompt
  let fullPrompt = rolePrompt;

  // Add expert context if available
  if (expertContext) {
    fullPrompt += `\n\n${expertContext}`;
  }

  // Add common capabilities
  fullPrompt += `\n\nPLATFORM FUNKCIOK (function calling):
- searchPrograms() - platform programok keresese
- getExpertInfo() - platform szakertok keresese
- getUserVouchers() - felhasznalo kuponjai
- getProgramDetails() - program reszletek

FONTOS SZABALYOK:
- Ha barmilyen adatbazis hiba tortenik, NE ird ki hogy "database error" vagy "try again in sometime". Ehelyett mondd: "Sajnos most nem tudom lekerdezni az adatokat. Kerlek, probald ujra kesobb." (vagy az aktualis nyelven).
- Mindig az aktualis nyelven valaszolj (hu/en/de).
- Angolul SOHA ne hasznald az "in sometime" kifejezest - helyette "later" vagy "in a moment".`;

  if (userName) {
    fullPrompt += `\n\nA felhasznalo neve: ${userName}.`;
  }

  // For non-expert roles, keep the general assistant capabilities
  if (!['expert', 'creator'].includes(userRole)) {
    const generalPrompts: Record<string, string> = {
      en: `\n\nYou can also answer general questions (travel, accommodation, restaurants, etc.) from your knowledge. Don't limit yourself to platform only.`,
      de: `\n\nDu kannst auch allgemeine Fragen (Reisen, Unterkunft, Restaurants, usw.) aus deinem Wissen beantworten. Beschranke dich nicht nur auf die Plattform.`,
      hu: `\n\nAltalanos kerdesekre is valaszolhatsz (utazas, szallas, ettermek, stb.) a tudasodbol. Ne korlatozd magad csak a platformra.`
    };
    fullPrompt += generalPrompts[language] || generalPrompts.hu;
  }

  return fullPrompt;
}

function getFallbackMessage(language: string, lastUserMessage: string): string {
  const templates: Record<string, string> = {
    en: "I couldn't generate a clear answer to your last question: \"{question}\". Please try rephrasing it or choose one of the suggestions below.",
    de: "Ich konnte gerade keine klare Antwort auf deine letzte Frage erzeugen: \"{question}\". Bitte formuliere sie neu oder wähle einen der untenstehenden Vorschläge.",
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
