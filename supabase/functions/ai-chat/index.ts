// WellBot — AI chat edge function
// 2026-05-08: migrálva Gemini → Anthropic Claude.
// Modellek: claude-haiku-4-5-20251001 (elsődleges), claude-sonnet-4-6 (fallback).
// Prompt cache aktívan a system prompton (Care+DNA tanulság: változatlan system-prompt → cache).
// Tool use az Anthropic-féle agentic loop-pal.
// Brand-voice: a _shared/voice-rules.ts-ből merítve.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { withVoiceRules, SupportedLanguage } from "../_shared/voice-rules.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Anthropic config -------------------------------------------------------
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const PRIMARY_MODEL = "claude-haiku-4-5-20251001";
const FALLBACK_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1024;
const MAX_TOOL_ITERATIONS = 5;

// --- Tool definitions (Anthropic format) ------------------------------------
const TOOLS = [
  {
    name: "searchPrograms",
    description: "Search for expert programs/workshops by keyword, category, or expert name. Use this when user asks about available programs, workshops, courses, or wants to find something specific on the Wellagora platform.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term (keyword, category, or topic)" },
        category: { type: "string", description: "Optional category filter (e.g., 'eletmod', 'gasztronomia', 'kezmuves', 'jol-let')" },
        limit: { type: "number", description: "Maximum number of results (default: 5)" }
      },
      required: ["query"]
    }
  },
  {
    name: "getProgramDetails",
    description: "Get detailed information about a specific program by ID. Use when user wants more details about a program.",
    input_schema: {
      type: "object",
      properties: {
        programId: { type: "string", description: "The UUID of the program" }
      },
      required: ["programId"]
    }
  },
  {
    name: "getExpertInfo",
    description: "Get information about Wellagora experts/creators by name. Use when user asks about a specific expert or wants to find experts.",
    input_schema: {
      type: "object",
      properties: {
        expertName: { type: "string", description: "Name of the expert to search for (optional — empty returns top experts)" }
      },
      required: []
    }
  },
  {
    name: "getUserVouchers",
    description: "Get the current user's vouchers and bookings. Use when user asks about their vouchers, bookings, or upcoming programs. Only works for authenticated users.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["active", "used", "expired", "all"], description: "Filter vouchers by status (default: active)" }
      },
      required: []
    }
  },
  {
    name: "getEmergingTopics",
    description: "Get topics that have been frequently asked by the WellBot community recently. Use when a creator asks 'what should I create programs about?' or 'what is the community asking?'. Only returns topics where at least 3 different users asked (k≥3 anonymity threshold). Most useful for authenticated creators looking for content-gap signals.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Optional category filter (e.g., 'eletmod', 'gasztronomia')" },
        weeksBack: { type: "number", description: "How many weeks of history to consider (default: 4)" }
      },
      required: []
    }
  }
];

// --- Main handler -----------------------------------------------------------
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'en', conversationId = null, projectId = null } = await req.json();
    const lang: SupportedLanguage = (['hu', 'en', 'de'].includes(language) ? language : 'en') as SupportedLanguage;

    // Auth
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
    );

    let userId: string | null = null;
    if (authHeader) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('AI chat: authentication failed, continuing as anonymous', userError);
      } else {
        userId = user.id;
      }
    }

    // API key — graceful fallback if not yet configured (deployment window védelme)
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.warn('⚠️  ANTHROPIC_API_KEY not yet configured — returning friendly 503');
      const lang: SupportedLanguage = (['hu', 'en', 'de'].includes(language) ? language : 'en') as SupportedLanguage;
      const upgradeMsgs: Record<string, string> = {
        hu: 'A WellBot most frissül egy újabb modellre. Pár perc múlva próbáld újra.',
        en: 'WellBot is currently being upgraded to a newer model. Please try again in a few minutes.',
        de: 'WellBot wird gerade auf ein neueres Modell aktualisiert. Bitte versuche es in ein paar Minuten erneut.'
      };
      return new Response(
        JSON.stringify({
          message: upgradeMsgs[lang] || upgradeMsgs.en,
          suggestions: [],
          conversationId: null,
          model: 'maintenance'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log('🤖 WellBot v2 — Anthropic Claude');
    console.log('Request:', { messageCount: messages.length, language: lang, auth: userId ? 'logged-in' : 'anonymous' });

    // System prompt + voice rules
    const userContext = userId
      ? await fetchUserContext(supabase, userId, projectId)
      : { profile: null, programs: [], project: null, activeProjectId: projectId };
    const activeProjectId = userContext.activeProjectId;
    const basePrompt = getSystemPrompt(lang, userContext);
    const systemPrompt = withVoiceRules(lang, basePrompt);

    // Messages → Anthropic format
    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // --- Agentic loop with model fallback -------------------------------------
    let usedModel = '';
    let finalText = '';
    let lastError: any = null;

    for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const conversationMessages: any[] = [...anthropicMessages];
        let iterations = 0;

        while (iterations < MAX_TOOL_ITERATIONS) {
          iterations++;
          console.log(`📡 Anthropic call (iter ${iterations}, model ${modelName})`);

          const response = await callAnthropic(
            ANTHROPIC_API_KEY,
            modelName,
            systemPrompt,
            conversationMessages,
            TOOLS
          );

          const content = response.content || [];
          const stopReason = response.stop_reason;

          // Log cache stats if available (Care+DNA tanulság: track cost savings)
          if (response.usage) {
            console.log('💰 Token usage:', {
              input: response.usage.input_tokens,
              output: response.usage.output_tokens,
              cache_create: response.usage.cache_creation_input_tokens || 0,
              cache_read: response.usage.cache_read_input_tokens || 0
            });
          }

          if (stopReason === 'tool_use') {
            const toolUseBlocks = content.filter((b: any) => b.type === 'tool_use');

            // Defensive: ha a stop_reason 'tool_use' de mégsincs tool block, ne loop-oljunk végtelenül
            if (toolUseBlocks.length === 0) {
              console.warn('⚠️  stop_reason=tool_use but no tool_use blocks — extracting text and breaking');
              const textBlocks = content.filter((b: any) => b.type === 'text');
              finalText = textBlocks.map((b: any) => b.text).join('\n').trim();
              break;
            }

            console.log(`🔧 Tool calls: ${toolUseBlocks.map((b: any) => b.name).join(', ')}`);

            // Append assistant's tool_use to conversation
            conversationMessages.push({ role: 'assistant', content });

            // Execute each tool
            const toolResults = await Promise.all(toolUseBlocks.map(async (block: any) => {
              const result = await executeTool(
                block.name,
                block.input || {},
                supabase,
                activeProjectId,
                userId,
                lang
              );
              console.log(`✅ Tool ${block.name} executed`);
              return {
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(result)
              };
            }));

            // Send tool results back as user message
            conversationMessages.push({ role: 'user', content: toolResults });
            // Loop continues — Claude generates next response with tool results in context
          } else {
            // end_turn / stop_sequence / max_tokens — extract final text
            const textBlocks = content.filter((b: any) => b.type === 'text');
            finalText = textBlocks.map((b: any) => b.text).join('\n').trim();
            console.log(`✅ Final response (stop: ${stopReason})`);
            break;
          }
        }

        if (iterations >= MAX_TOOL_ITERATIONS && !finalText) {
          console.warn(`⚠️  Max tool iterations (${MAX_TOOL_ITERATIONS}) reached without final text`);
        }

        usedModel = modelName;
        break; // Success — exit model fallback loop
      } catch (err: any) {
        lastError = err;
        console.error(`❌ Model ${modelName} failed:`, err?.message || err);
        // Continue to next model in fallback chain
      }
    }

    // If both models failed
    if (!usedModel) {
      const errMsgs: Record<string, string> = {
        hu: 'A WellBot jelenleg nem elérhető. Próbáld újra később.',
        en: 'WellBot is currently unavailable. Please try again later.',
        de: 'WellBot ist derzeit nicht verfügbar. Bitte versuche es später erneut.'
      };
      return new Response(
        JSON.stringify({
          error: 'ai_unavailable',
          message: errMsgs[lang] || errMsgs.en,
          details: lastError?.message || 'All Anthropic models failed'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    // Persist conversation
    let finalConversationId = conversationId;
    if (!finalConversationId && userId) {
      const { data: newConv } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          project_id: projectId,
          language: lang,
          user_agent: req.headers.get('user-agent')
        })
        .select()
        .single();
      finalConversationId = newConv?.id;
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    if (!finalText || !finalText.trim()) {
      console.warn('Empty AI response, using fallback');
      finalText = getFallbackMessage(lang, lastUserMessage);
    }

    const suggestions = generateSuggestions(lastUserMessage, lang);

    await storeConversation(
      supabase,
      userId || '',
      projectId,
      finalConversationId,
      lang,
      messages[messages.length - 1],
      finalText,
      usedModel
    );

    return new Response(
      JSON.stringify({
        message: finalText,
        suggestions,
        conversationId: finalConversationId,
        model: usedModel
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// --- Anthropic API call -----------------------------------------------------
async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: any[],
  tools: any[]
): Promise<any> {
  const body = {
    model,
    max_tokens: MAX_TOKENS,
    // Prompt cache: a system prompt ritkán változik, ezért cache-eljük (1h TTL ephemeral).
    // Care+DNA tanulság: ezzel a hosszabb system-prompt is olcsón futtatható.
    system: [
      { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }
    ],
    tools,
    messages
  };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
      // Prompt caching opt-in beta header — biztonság kedvéért bekapcsolva
      "anthropic-beta": "prompt-caching-2024-07-31"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errText}`);
  }

  return await response.json();
}

// --- Tool dispatcher --------------------------------------------------------
async function executeTool(
  name: string,
  args: any,
  supabase: any,
  activeProjectId: string | null,
  userId: string | null,
  language: string
): Promise<any> {
  try {
    let result: any;
    switch (name) {
      case 'searchPrograms':
        result = await searchProgramsForAI(supabase, args, activeProjectId, language);
        break;
      case 'getProgramDetails':
        result = await getProgramDetails(supabase, args.programId, language);
        break;
      case 'getExpertInfo':
        result = await getExpertInfo(supabase, args.expertName);
        break;
      case 'getUserVouchers':
        result = userId
          ? await getUserVouchers(supabase, userId, args.status || 'active')
          : { error: 'User not authenticated. Please log in to view your vouchers.' };
        break;
      case 'getEmergingTopics':
        result = await getEmergingTopics(supabase, userId, args.category, args.weeksBack || 4);
        break;
      default:
        return { error: `Unknown function: ${name}` };
    }

    // Grounding instruction for empty results — keep AI honest
    if (result && Array.isArray(result) && result.length === 0) {
      return {
        results: [],
        instruction: language === 'hu'
          ? 'A keresés nem talált eredményt. Mondd el őszintén a felhasználónak, hogy jelenleg nincs ilyen a platformon, és kérdezd meg miben segíthetsz még.'
          : language === 'de'
            ? 'Die Suche ergab keine Ergebnisse. Sage dem Benutzer ehrlich, dass es derzeit nichts davon auf der Plattform gibt, und frage, wobei du noch helfen kannst.'
            : 'The search returned no results. Tell the user honestly that there is currently nothing like that on the platform, and ask how else you can help.'
      };
    }

    return result;
  } catch (err: any) {
    return { error: err.message || 'Function execution failed' };
  }
}

// --- Tool implementations ---------------------------------------------------

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

async function getProgramDetails(supabase: any, programId: string, language: string) {
  const { data: program, error } = await supabase
    .from('expert_contents')
    .select(`
      *,
      profiles!expert_contents_creator_id_fkey(full_name, avatar_url, bio)
    `)
    .eq('id', programId)
    .single();

  if (error || !program) return { error: error?.message || "Program not found" };

  return {
    id: program.id,
    title: program.title,
    description: program.description,
    category: program.category,
    format: program.format,
    price: program.price,
    expert: program.profiles?.full_name || 'Unknown',
    expertBio: program.profiles?.bio || null,
    status: program.status
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

/**
 * NEW (Community Insights for Creators):
 * Visszaadja a frequently-asked témákat a WellBot-kérdésekből, k≥3 küszöbbel.
 * A get_creator_insights SECURITY DEFINER függvény biztosítja:
 *   - csak aggregált adatot lát a creator
 *   - csak a saját kategóriájához tartozó témákat
 *   - csak ha legalább 3 különböző user kérdezett (k≥3)
 */
async function getEmergingTopics(
  supabase: any,
  userId: string | null,
  categoryFilter?: string,
  weeksBack: number = 4
) {
  // Anonim user nem férhet hozzá
  if (!userId) {
    return {
      error: 'authentication_required',
      message: 'Login as a creator to see emerging community topics.'
    };
  }

  // SECURITY DEFINER függvény: a user_id-ból kideríti a creator kategóriáit, és csak azokra szűr.
  // A k≥3 küszöb a függvényben van lefixálva.
  const { data, error } = await supabase.rpc('get_creator_insights', {
    _creator_id: userId,
    _weeks_back: weeksBack
  });

  if (error) {
    // Ha a függvény vagy tábla még nincs deployolva, érthető hibaüzenet
    if (error.code === '42883' || error.message?.includes('function get_creator_insights')) {
      return {
        error: 'feature_not_yet_deployed',
        message: 'Community Insights feature is in deployment. Will be available after the next migration.'
      };
    }
    return { error: error.message };
  }

  let topics = data || [];
  if (categoryFilter) {
    topics = topics.filter((t: any) => t.category_slug === categoryFilter);
  }

  return {
    topics: topics.map((t: any) => ({
      week: t.week_start,
      label: t.topic_label,
      category: t.category_slug,
      questionCount: t.question_count,
      uniqueUsers: t.unique_user_count,
      hasExistingProgram: t.has_existing_program
    })),
    count: topics.length,
    note: topics.length === 0
      ? 'No topics meet the k≥3 anonymity threshold yet. The community is still in early stage — check back next week.'
      : null
  };
}

// --- Conversation persistence ----------------------------------------------
async function storeConversation(
  supabase: any,
  userId: string,
  _projectId: string | null,
  conversationId: string | null,
  _language: string,
  userMessage: any,
  aiMessage: string,
  modelUsed: string
) {
  if (!conversationId) return;

  const modelName = `anthropic/${modelUsed}`;

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

// --- User context -----------------------------------------------------------
async function fetchUserContext(supabase: any, userId: string, projectId: string | null) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, location, user_role, organization, project_id')
    .eq('id', userId)
    .single();

  const activeProjectId = projectId || profile?.project_id;

  const { data: programs } = await supabase
    .from('expert_contents')
    .select('id, title, category')
    .eq('status', 'published')
    .limit(10);

  const { data: project } = activeProjectId ? await supabase
    .from('projects')
    .select('name, region_name, villages')
    .eq('id', activeProjectId)
    .single() : { data: null };

  return { profile, programs, project, activeProjectId };
}

// --- System prompt (voice rules appended in withVoiceRules) -----------------
function getSystemPrompt(language: string, context: any): string {
  const { profile, project } = context;
  const userName = profile?.first_name || '';
  const userRole = profile?.user_role || 'guest';
  const projectName = project?.name || 'Wellagora';

  const prompts: Record<string, string> = {
    en: `You are WellBot — you help people on the Wellagora platform.

WHO YOU ARE:
- A direct, natural community member who knows the platform.
- NOT a coach, NOT a guru, NOT an expert.
- You help users discover programs, events, creators on Wellagora.
- For general questions (recipes, ideas, tips) you can answer briefly — stay grounded.

WHAT WELLAGORA IS — keep it minimal:
- A community forum and creator platform.
- That's it. Don't expand on its "essence", don't categorize it, don't say what region it's for, don't give a marketing-style description.
- If the user asks "what is Wellagora?", answer briefly: a community forum and creator platform — and ask what they're looking for.

YOUR CAPABILITIES — function calling:
- searchPrograms — find programs on the platform
- getProgramDetails — details of a specific program
- getExpertInfo — info about creators
- getUserVouchers — the user's vouchers (auth required)
- getEmergingTopics — emerging topics from community questions (creators only, k≥3 anonymity)

WHEN TO USE FUNCTIONS:
- User asks about Wellagora programs, creators, or platform data → use functions
- User asks general questions (recipes, tips) → answer briefly from knowledge
- User is a creator asking "what should I create" → use getEmergingTopics

WHEN A FUNCTION RETURNS NO RESULTS:
- Say honestly that there is currently nothing matching, ask what else you can help with
- DO NOT invent programs, names, numbers, regions, categories
- DO NOT promise that "more is coming soon" unless data confirms

User context: ${userName ? `name: ${userName}, ` : ''}role: ${userRole}.`,

    de: `Du bist WellBot — du hilfst Menschen auf der Wellagora-Plattform.

WER DU BIST:
- Ein direktes, natürliches Gemeinschaftsmitglied, das die Plattform kennt.
- KEIN Coach, KEIN Guru, KEIN Experte.
- Du hilfst Benutzern, Programme, Veranstaltungen, Ersteller auf Wellagora zu entdecken.
- Bei allgemeinen Fragen (Rezepte, Ideen, Tipps) kannst du kurz antworten — bleib geerdet.

WAS WELLAGORA IST — halte es minimal:
- Ein Community-Forum und eine Creator-Plattform.
- Das ist es. Keine Erweiterung über die "Essenz", keine Kategorisierung, keine Region, keine Marketing-Beschreibung.
- Wenn der Benutzer fragt "Was ist Wellagora?", antworte kurz: ein Community-Forum und Creator-Plattform — und frage, was er sucht.

DEINE FÄHIGKEITEN — Function Calling:
- searchPrograms — Programme auf der Plattform finden
- getProgramDetails — Details eines bestimmten Programms
- getExpertInfo — Infos über Ersteller
- getUserVouchers — Gutscheine des Benutzers (Login erforderlich)
- getEmergingTopics — aufkommende Themen aus Gemeinschaftsfragen (nur Ersteller, k≥3 Anonymität)

WANN FUNKTIONEN VERWENDEN:
- Benutzer fragt nach Wellagora-Programmen, Erstellern oder Plattformdaten → Funktionen verwenden
- Benutzer stellt allgemeine Fragen (Rezepte, Tipps) → kurz aus Wissen antworten
- Benutzer ist Ersteller und fragt "Was soll ich erstellen" → getEmergingTopics

WENN EINE FUNKTION KEINE ERGEBNISSE LIEFERT:
- Sage ehrlich, dass derzeit nichts Passendes vorhanden ist, frage wobei du noch helfen kannst
- Erfinde KEINE Programme, Namen, Zahlen, Regionen, Kategorien
- Versprich NICHT, dass "bald mehr kommt", außer die Daten bestätigen es

Benutzerkontext: ${userName ? `Name: ${userName}, ` : ''}Rolle: ${userRole}.`,

    hu: `Te WellBot vagy — embereknek segítesz a Wellagora platformon.

KI VAGY:
- Közvetlen, természetes közösségi tag hangja, aki ismeri a platformot.
- NEM coach, NEM guru, NEM szakértő.
- Programokat, eseményeket, kreátorokat segítesz felfedezni a Wellagorán.
- Általános kérdésre (recept, ötlet, tipp) röviden válaszolhatsz — gyökeres maradj.

MI A WELLAGORA — tartsd minimálisan:
- Közösségi fórum és creator-platform.
- Ennyi. Ne magyarázd a "lényegét", ne kategorizáld, ne nevezd meg földrajzi régióhoz kötve, ne adj marketing-leírást.
- Ha a user kérdezi "mi az a Wellagora?", röviden: közösségi fórum és creator-platform — és kérdezd meg, mit keres.

KÉPESSÉGEID — function calling:
- searchPrograms — programokat keres a platformon
- getProgramDetails — egy konkrét program részletei
- getExpertInfo — információk kreátorokról
- getUserVouchers — a felhasználó kuponjai (csak bejelentkezett user)
- getEmergingTopics — közösségi kérdésekből aggregált témák (csak creator-ok, k≥3 anonimitás)

MIKOR HASZNÁLJ FUNKCIÓT:
- A felhasználó Wellagora programokról, kreátorokról vagy platform-adatokról kérdez → használj funkciót
- Általános kérdésekre (recept, tipp) → válaszolj röviden a tudásodból
- Ha creator kérdezi "mit készítsek" → getEmergingTopics

HA EGY FUNKCIÓ ÜRES EREDMÉNYT AD:
- Mondd el őszintén, hogy jelenleg nincs ilyen, és kérdezd miben segíthetsz még
- NE találj ki programot, nevet, számot, régiót, kategóriát
- NE ígérj "hamarosan jön még", hacsak az adatok nem támasztják alá

Felhasználó: ${userName ? `${userName}, ` : ''}szerep: ${userRole}.`
  };

  return prompts[language] || prompts.en;
}

// --- Fallback message -------------------------------------------------------
function getFallbackMessage(language: string, lastUserMessage: string): string {
  const templates: Record<string, string> = {
    en: "I could not generate a clear answer to your last question. Try rephrasing it, or pick one of the suggestions below.",
    de: "Ich konnte gerade keine klare Antwort auf deine letzte Frage erzeugen. Versuche, sie umzuformulieren, oder wähle einen der untenstehenden Vorschläge.",
    hu: "Most nem sikerült egyértelmű választ adnom. Próbáld meg másképp megfogalmazni, vagy válassz az alábbi javaslatok közül."
  };
  return templates[language] || templates.en;
}

// --- Suggestions ------------------------------------------------------------
function generateSuggestions(lastUserMessage: string, language: string): string[] {
  const input = (lastUserMessage || '').toLowerCase();

  const suggestions: Record<string, Record<string, string[]>> = {
    en: {
      programs: [
        "What programs are available?",
        "Show me programs in lifestyle",
        "Find programs by category",
        "Latest programs on the platform"
      ],
      creators: [
        "Who are the active creators?",
        "Show creators in gastronomy",
        "How do I become a creator?",
        "Featured experts this month"
      ],
      help: [
        "How does the platform work?",
        "What is Carbon Handprint?",
        "How do I track my impact?",
        "How to support a program"
      ],
      default: [
        "What programs are available?",
        "Tell me about Wellagora",
        "How do I join the community?",
        "What is happening this week?"
      ]
    },
    de: {
      programs: [
        "Welche Programme sind verfügbar?",
        "Zeige mir Lifestyle-Programme",
        "Programme nach Kategorie",
        "Neueste Programme auf der Plattform"
      ],
      creators: [
        "Wer sind die aktiven Ersteller?",
        "Zeige Ersteller in Gastronomie",
        "Wie werde ich Ersteller?",
        "Featured Experten diesen Monat"
      ],
      help: [
        "Wie funktioniert die Plattform?",
        "Was ist Carbon Handprint?",
        "Wie verfolge ich meinen Einfluss?",
        "Wie unterstütze ich ein Programm"
      ],
      default: [
        "Welche Programme sind verfügbar?",
        "Erzähle mir von Wellagora",
        "Wie trete ich der Gemeinschaft bei?",
        "Was passiert diese Woche?"
      ]
    },
    hu: {
      programs: [
        "Milyen programok érhetők el?",
        "Mutasd az életmód programokat",
        "Programok kategória szerint",
        "Legújabb programok a platformon"
      ],
      creators: [
        "Kik a platform kreátorai?",
        "Mutasd a gasztronómia kreátorait",
        "Hogyan lehetek kreátor?",
        "Kiemelt szakértők ebben a hónapban"
      ],
      help: [
        "Hogyan működik a platform?",
        "Mi az a Carbon Handprint?",
        "Hogyan követem a hatásom?",
        "Hogyan támogathatok egy programot"
      ],
      default: [
        "Milyen programok érhetők el?",
        "Mesélj a Wellagoráról",
        "Hogyan csatlakozhatok a közösséghez?",
        "Mi történik ezen a héten?"
      ]
    }
  };

  const langSuggestions = suggestions[language] || suggestions.en;

  if (input.includes('program') || input.includes('workshop') || input.includes('csatlako')) {
    return langSuggestions.programs;
  }
  if (input.includes('creator') || input.includes('expert') || input.includes('szakértő') || input.includes('kreátor')) {
    return langSuggestions.creators;
  }
  if (input.includes('how') || input.includes('help') || input.includes('hogyan') || input.includes('wie')) {
    return langSuggestions.help;
  }

  return langSuggestions.default;
}
