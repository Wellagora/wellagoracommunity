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

    const systemPrompt = getSystemPrompt(language);

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
        temperature: 0.7,
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

function getSystemPrompt(language: string): string {
  const prompts: Record<string, string> = {
    en: `You are WellBot, a friendly and knowledgeable sustainability assistant. Your role is to help users:
- Understand their environmental impact
- Learn about sustainable practices in daily life
- Get specific advice on topics like energy efficiency, waste reduction, sustainable transport, and eco-friendly choices
- Discover actionable steps they can take right now to live more sustainably

Keep responses:
- Practical and actionable
- Encouraging and positive
- Easy to understand
- Focused on concrete steps users can take
- Structured with emojis and clear sections when appropriate

Always be supportive and never judgmental. Focus on progress, not perfection.`,

    de: `Du bist WellBot, ein freundlicher und sachkundiger Nachhaltigkeitsassistent. Deine Aufgabe ist es, Benutzern zu helfen:
- Ihren Umwelteinfluss zu verstehen
- Über nachhaltige Praktiken im Alltag zu lernen
- Spezifische Ratschläge zu Themen wie Energieeffizienz, Abfallreduzierung, nachhaltige Mobilität und umweltfreundliche Entscheidungen zu erhalten
- Umsetzbare Schritte zu entdecken, die sie jetzt unternehmen können, um nachhaltiger zu leben

Halte Antworten:
- Praktisch und umsetzbar
- Ermutigend und positiv
- Leicht verständlich
- Fokussiert auf konkrete Schritte
- Strukturiert mit Emojis und klaren Abschnitten wenn angemessen

Sei immer unterstützend und niemals wertend. Konzentriere dich auf Fortschritt, nicht auf Perfektion.`,

    hu: `Te WellBot vagy, egy barátságos és felkészült fenntarthatósági asszisztens. A szereped segíteni a felhasználóknak:
- Megérteni környezeti hatásukat
- Tanulni a fenntartható mindennapi gyakorlatokról
- Konkrét tanácsokat kapni témákban mint energiahatékonyság, hulladékcsökkentés, fenntartható közlekedés és környezetbarát döntések
- Felfedezni azokat a lépéseket, amelyeket most megtehetnek a fenntarthatóbb életért

Válaszaid legyenek:
- Gyakorlatiasak és megvalósíthatóak
- Bátorítóak és pozitívak
- Könnyen érthetőek
- Konkrét lépésekre fókuszálva
- Strukturáltak emojikal és világos szakaszokkal amikor megfelelő

Mindig támogató légy és soha ne ítélj. Fókuszálj a fejlődésre, nem a tökéletességre.`
  };

  return prompts[language] || prompts.en;
}

function generateSuggestions(lastUserMessage: string, language: string): string[] {
  const input = lastUserMessage.toLowerCase();
  
  const suggestions: Record<string, Record<string, string[]>> = {
    en: {
      carbon: [
        "How to calculate my carbon footprint?",
        "Best renewable energy options",
        "Plant-based meal ideas",
        "Eco-friendly product recommendations"
      ],
      transport: [
        "Best electric vehicle options",
        "Public transport in my area",
        "Bike-friendly routes nearby",
        "Carpooling tips"
      ],
      waste: [
        "Start composting at home",
        "Zero waste shopping guide",
        "Recycling best practices",
        "Upcycling project ideas"
      ],
      energy: [
        "Solar panel installation",
        "Smart home energy tips",
        "LED lighting benefits",
        "Home insulation guide"
      ],
      default: [
        "Calculate my carbon footprint",
        "Sustainable living tips",
        "Join local initiatives",
        "Eco-friendly product guide"
      ]
    },
    de: {
      carbon: [
        "Wie berechne ich meinen CO2-Fußabdruck?",
        "Beste erneuerbare Energieoptionen",
        "Pflanzliche Rezeptideen",
        "Umweltfreundliche Produktempfehlungen"
      ],
      transport: [
        "Beste Elektrofahrzeug-Optionen",
        "Öffentliche Verkehrsmittel in meiner Nähe",
        "Fahrradfreundliche Routen",
        "Tipps für Fahrgemeinschaften"
      ],
      waste: [
        "Kompostieren zu Hause beginnen",
        "Zero-Waste-Einkaufsführer",
        "Recycling Best Practices",
        "Upcycling-Projektideen"
      ],
      energy: [
        "Solaranlagen-Installation",
        "Smart-Home-Energietipps",
        "LED-Beleuchtung Vorteile",
        "Wärmedämmung Ratgeber"
      ],
      default: [
        "CO2-Fußabdruck berechnen",
        "Nachhaltige Lebenstipps",
        "Lokale Initiativen beitreten",
        "Umweltfreundliche Produkte"
      ]
    },
    hu: {
      carbon: [
        "Hogyan számítsam ki a szénlábnyomomat?",
        "Legjobb megújuló energia opciók",
        "Növényi alapú étkezési ötletek",
        "Környezetbarát termékajánlatok"
      ],
      transport: [
        "Legjobb elektromos autó opciók",
        "Tömegközlekedés a környékemen",
        "Kerékpáros útvonalak",
        "Autómegosztási tippek"
      ],
      waste: [
        "Komposztálás otthon",
        "Zero waste vásárlási útmutató",
        "Újrahasznosítási tippek",
        "Upcycling projekt ötletek"
      ],
      energy: [
        "Napelem telepítés",
        "Okosotthon energia tippek",
        "LED világítás előnyei",
        "Szigetelési útmutató"
      ],
      default: [
        "Szénlábnyom kiszámítása",
        "Fenntartható életmód tippek",
        "Helyi kezdeményezésekhez csatlakozás",
        "Környezetbarát termékek"
      ]
    }
  };

  const langSuggestions = suggestions[language] || suggestions.en;

  if (input.includes("carbon") || input.includes("footprint") || input.includes("co2") || input.includes("szén")) {
    return langSuggestions.carbon;
  } else if (input.includes("transport") || input.includes("car") || input.includes("bike") || input.includes("közlekedés")) {
    return langSuggestions.transport;
  } else if (input.includes("waste") || input.includes("recycl") || input.includes("compost") || input.includes("hulladék")) {
    return langSuggestions.waste;
  } else if (input.includes("energy") || input.includes("electric") || input.includes("solar") || input.includes("energia")) {
    return langSuggestions.energy;
  }

  return langSuggestions.default;
}
