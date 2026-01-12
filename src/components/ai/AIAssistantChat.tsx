import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Loader2,
  AlertCircle,
  HelpCircle,
  Users,
  MapPin,
  ChefHat
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import WellBotAvatar from "./WellBotAvatar";
import { MOCK_EXPERTS, MOCK_PROGRAMS, MOCK_SPONSORS, DEMO_STATS } from "@/data/mockData";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AIAssistantChat = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isDemoMode } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarMood, setAvatarMood] = useState<"neutral" | "thinking" | "happy" | "greeting">("greeting");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset greeting after initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAvatarMood("neutral");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Personal, intimate conversational prefixes - WellBot knows the experts personally
  const getPersonalPrefix = (): string => {
    const prefixes = language === 'hu' 
      ? [
          'Ajánlom neked... ',
          'Ismerem a tökéletes szakértőt! ',
          'Beszélj vele személyesen... ',
          'Hadd mutassam be neked... ',
          'Tudom, ki segíthet! '
        ]
      : language === 'de'
      ? [
          'Ich empfehle dir... ',
          'Ich kenne den perfekten Experten! ',
          'Sprich persönlich mit... ',
          'Lass mich dir vorstellen... ',
          'Ich weiß, wer helfen kann! '
        ]
      : [
          'I recommend... ',
          'I know the perfect expert! ',
          'Talk to them personally... ',
          'Let me introduce you to... ',
          'I know who can help! '
        ];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  };

  // Helper: Get localized expert name
  const getExpertName = (expert: typeof MOCK_EXPERTS[0]): string => {
    const firstName = language === 'de' ? expert.first_name_de : language === 'en' ? expert.first_name_en : expert.first_name;
    const lastName = language === 'de' ? expert.last_name_de : language === 'en' ? expert.last_name_en : expert.last_name;
    return `${firstName} ${lastName}`;
  };

  // Helper: Get localized expert title
  const getExpertTitle = (expert: typeof MOCK_EXPERTS[0]): string => {
    return language === 'de' ? expert.expert_title_de : language === 'en' ? expert.expert_title_en : expert.expert_title;
  };

  // Helper: Get localized program title
  const getProgramTitle = (program: typeof MOCK_PROGRAMS[0]): string => {
    return language === 'de' ? program.title_de : language === 'en' ? program.title_en : program.title;
  };

  // Helper: Search experts by keywords (proactive matching)
  const findMatchingExperts = (keywords: string[]): typeof MOCK_EXPERTS => {
    return MOCK_EXPERTS.filter(expert => {
      const searchableText = [
        expert.first_name, expert.last_name, expert.expert_title, expert.bio, expert.expert_bio_long,
        ...(expert.expertise_areas || [])
      ].join(' ').toLowerCase();
      return keywords.some(kw => searchableText.includes(kw.toLowerCase()));
    });
  };

  // Helper: Search programs by keywords
  const findMatchingPrograms = (keywords: string[]): typeof MOCK_PROGRAMS => {
    return MOCK_PROGRAMS.filter(program => {
      const searchableText = [
        program.title, program.title_en, program.title_de,
        program.description, program.description_en, program.description_de,
        program.category
      ].join(' ').toLowerCase();
      return keywords.some(kw => searchableText.includes(kw.toLowerCase()));
    });
  };

  // Helper: Get sponsor by name
  const findSponsor = (name: string): typeof MOCK_SPONSORS[0] | undefined => {
    return MOCK_SPONSORS.find(s => 
      s.organization_name.toLowerCase().includes(name.toLowerCase()) ||
      s.organization_name_en.toLowerCase().includes(name.toLowerCase())
    );
  };

  // ===== PROACTIVE COMMUNITY CONCIERGE INTELLIGENCE =====
  // Zero Rejection Rule: NEVER say "Sajnálom", "nincs információm", or any apology
  // Always synthesize helpful recommendations - WellBot KNOWS the experts personally
  const getDemoResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    const prefix = getPersonalPrefix();
    
    // ===== COOKING / GASTRONOMY - Proactive Multi-Expert Matching =====
    if (lowerMsg.includes('főz') || lowerMsg.includes('cook') || lowerMsg.includes('koch') || 
        lowerMsg.includes('recept') || lowerMsg.includes('recipe') || lowerMsg.includes('rezept') ||
        lowerMsg.includes('konyha') || lowerMsg.includes('kitchen') || lowerMsg.includes('küche') ||
        lowerMsg.includes('étel') || lowerMsg.includes('food') || lowerMsg.includes('essen') ||
        lowerMsg.includes('gasztro') || lowerMsg.includes('gastro')) {
      setAvatarMood("happy");
      const chef = MOCK_EXPERTS.find(e => e.id === 'mock-expert-6'); // Molnár Balázs
      const baker = MOCK_EXPERTS.find(e => e.id === 'mock-expert-1'); // Kovács István
      const herbalist = MOCK_EXPERTS.find(e => e.id === 'mock-expert-2'); // Nagy Éva
      const cookingProgram = MOCK_PROGRAMS.find(p => p.id === 'mock-program-11'); // Közösségi Főzőtanfolyam
      const sponsor = findSponsor('Káli');
      
      return language === 'hu'
        ? `${prefix}🍳 A főzés nálunk közösségi élmény! Személyesen ismerem a szakértőinket:\n\n👨‍🍳 **Beszélj Balázzsal!** - ${chef ? getExpertName(chef) : 'Molnár Balázs'} (${chef ? getExpertTitle(chef) : 'Séf'})\nA helyi konyha mestere. Ajánlom a "${cookingProgram ? getProgramTitle(cookingProgram) : 'Közösségi Főzőtanfolyam'}" programját!\n\n🍞 **Keresd Jánost!** - ${baker ? getExpertName(baker) : 'Kovács István'} (${baker ? getExpertTitle(baker) : 'Kemencemester'})\nA kemencés ételek és kovászkenyér tudora.\n\n🌿 **Szólj Évának!** - ${herbalist ? getExpertName(herbalist) : 'Nagy Éva'} (${herbalist ? getExpertTitle(herbalist) : 'Gyógynövényszakértő'})\nA fűszerek és ízesítés titkaiba avat be.\n\n🏨 A ${sponsor?.organization_name || 'Káli Panzió'} szponzorációjával Balázs programja **INGYENES**!\n\n❓ **Mit szeretnél pontosan tanulni?**\n• Alapvető főzési technikákat?\n• Helyi alapanyagok használatát?\n• Hagyományos magyar recepteket?`
        : language === 'de'
        ? `${prefix}🍳 Kochen ist bei uns ein Gemeinschaftserlebnis! Ich kenne unsere Experten persönlich:\n\n👨‍🍳 **Sprich mit Bastian!** - ${chef ? getExpertName(chef) : 'Bastian Meier'} (${chef ? getExpertTitle(chef) : 'Küchenchef'})\nMeister der lokalen Küche.\n\n🍞 **Frag Hans!** - ${baker ? getExpertName(baker) : 'Hans Schmidt'} (${baker ? getExpertTitle(baker) : 'Ofenbaumeister'})\nExperte für Ofengerichte und Sauerteigbrot.\n\n🌿 **Kontaktiere Anna!** - ${herbalist ? getExpertName(herbalist) : 'Anna Müller'} (${herbalist ? getExpertTitle(herbalist) : 'Kräuterexpertin'})\nSie weiht dich in die Geheimnisse der Gewürze ein.\n\n🏨 Dank ${sponsor?.organization_name_de || 'Káli Pension'} ist Bastians Programm **KOSTENLOS**!\n\n❓ **Was möchtest du genau lernen?**`
        : `${prefix}🍳 Cooking is a community experience here! I know our experts personally:\n\n👨‍🍳 **Talk to Benjamin!** - ${chef ? getExpertName(chef) : 'Benjamin Miller'} (${chef ? getExpertTitle(chef) : 'Chef'})\nMaster of local cuisine.\n\n🍞 **Ask Stephen!** - ${baker ? getExpertName(baker) : 'Stephen Smith'} (${baker ? getExpertTitle(baker) : 'Brick Oven Master'})\nExpert in oven dishes and sourdough bread.\n\n🌿 **Contact Eva!** - ${herbalist ? getExpertName(herbalist) : 'Eva Green'} (${herbalist ? getExpertTitle(herbalist) : 'Herbalist'})\nShe'll teach you the secrets of spices.\n\n🏨 Thanks to ${sponsor?.organization_name_en || 'Káli Guesthouse'} sponsorship, Benjamin's program is **FREE**!\n\n❓ **What would you like to learn specifically?**`;
    }
    
    // ===== BREAD / BAKING =====
    if (lowerMsg.includes('kenyér') || lowerMsg.includes('kovász') || lowerMsg.includes('bread') || lowerMsg.includes('baking') || lowerMsg.includes('brot') || lowerMsg.includes('backen')) {
      setAvatarMood("happy");
      const baker = MOCK_EXPERTS.find(e => e.id === 'mock-expert-1');
      const programs = findMatchingPrograms(['kenyér', 'kovász', 'bread', 'brot']);
      
      return language === 'hu' 
        ? `${prefix}🍞 **${baker ? getExpertName(baker) : 'Kovács István'}** a mi kenyérsütő mesterünk! A közösség kedvence - 127 tagunk közül sokan már elvégezték a kovászkenyér kurzusát.\n\n📚 Elérhető programjai:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(szponzorált - INGYENES!)' : `(${p.price_huf.toLocaleString()} Ft)`}`).join('\n')}\n\n🏨 A Káli Panzió szponzorációjának köszönhetően ingyen kipróbálhatod!\n\n👉 Nézd meg a Programok oldalon!`
        : language === 'de'
        ? `${prefix}🍞 **${baker ? getExpertName(baker) : 'Hans Schmidt'}** ist unser Brotback-Meister! Der Liebling der Gemeinschaft - viele unserer 127 Mitglieder haben seinen Kurs absolviert.\n\n📚 Verfügbare Programme:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(gesponsert - KOSTENLOS!)' : `(€${Math.round(p.price_huf / 400)})`}`).join('\n')}\n\n🏨 Dank Káli Pension kannst du es kostenlos ausprobieren!\n\n👉 Schau auf der Programm-Seite!`
        : `${prefix}🍞 **${baker ? getExpertName(baker) : 'Stephen Smith'}** is our bread baking master! A community favorite - many of our 127 members have completed his course.\n\n📚 Available programs:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(sponsored - FREE!)' : `(€${Math.round(p.price_huf / 400)})`}`).join('\n')}\n\n🏨 Thanks to Káli Guesthouse sponsorship, you can try it for free!\n\n👉 Check the Programs page!`;
    }
    
    // ===== HERBS / GARDENING =====
    if (lowerMsg.includes('gyógynövény') || lowerMsg.includes('herb') || lowerMsg.includes('kräuter') || lowerMsg.includes('kert') || lowerMsg.includes('garden') || lowerMsg.includes('garten') || lowerMsg.includes('növény') || lowerMsg.includes('plant')) {
      setAvatarMood("happy");
      const herbalist = MOCK_EXPERTS.find(e => e.id === 'mock-expert-2');
      const programs = findMatchingPrograms(['gyógynövény', 'herb', 'tea', 'kräuter']);
      
      return language === 'hu'
        ? `${prefix}🌿 **${herbalist ? getExpertName(herbalist) : 'Nagy Éva'}** a mi gyógynövény-szakértőnk! Imádják a tagjaink - különösen a balatoni táj növényvilágáról tud mesélni órákig.\n\n📚 Elérhető programjai:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(szponzorált - INGYENES!)' : `(${p.price_huf.toLocaleString()} Ft)`}`).join('\n')}\n\n5 szponzorunk támogatásával ingyenes túrákat is tart!\n\n👉 Ismerkedj meg vele a Szakértők galériában!`
        : language === 'de'
        ? `${prefix}🌿 **${herbalist ? getExpertName(herbalist) : 'Anna Müller'}** ist unsere Kräuter-Expertin! Unsere Mitglieder lieben sie - sie kann stundenlang über die Pflanzenwelt der Balaton-Region erzählen.\n\n📚 Verfügbare Programme:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(gesponsert - KOSTENLOS!)' : `(€${Math.round(p.price_huf / 400)})`}`).join('\n')}\n\nMit Unterstützung unserer 5 Sponsoren bietet sie kostenlose Touren!\n\n👉 Lerne sie in der Experten-Galerie kennen!`
        : `${prefix}🌿 **${herbalist ? getExpertName(herbalist) : 'Eva Green'}** is our herbs expert! Our members love her - she can talk for hours about the plant life of the Balaton region.\n\n📚 Available programs:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(sponsored - FREE!)' : `(€${Math.round(p.price_huf / 400)})`}`).join('\n')}\n\nWith support from our 5 sponsors, she offers free tours!\n\n👉 Meet her in the Experts Gallery!`;
    }

    // ===== WINE =====
    if (lowerMsg.includes('bor') || lowerMsg.includes('wine') || lowerMsg.includes('wein') || lowerMsg.includes('szőlő') || lowerMsg.includes('grape') || lowerMsg.includes('pince') || lowerMsg.includes('cellar')) {
      setAvatarMood("happy");
      const winemaker = MOCK_EXPERTS.find(e => e.id === 'mock-expert-3');
      const programs = findMatchingPrograms(['bor', 'wine', 'wein', 'szőlő', 'pince']);
      
      return language === 'hu'
        ? `${prefix}🍷 **${winemaker ? getExpertName(winemaker) : 'Szabó Péter'}** a mi borkészítő mesterünk! Családi pincészetük harmadik generációs borásza.\n\n📚 Elérhető programjai:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(szponzorált - INGYENES!)' : `(${p.price_huf.toLocaleString()} Ft)`}`).join('\n')}\n\nA vulkanikus talaj egyedi borokat ad - próbáld ki!\n\n👉 Nézd meg a Programok oldalon!`
        : language === 'de'
        ? `${prefix}🍷 **${winemaker ? getExpertName(winemaker) : 'Lukas Weber'}** ist unser Weinbaumeister! Winzer in dritter Generation unseres Familienweinguts.\n\n📚 Verfügbare Programme:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(gesponsert - KOSTENLOS!)' : `(€${Math.round(p.price_huf / 400)})`}`).join('\n')}\n\nDer vulkanische Boden bringt einzigartige Weine hervor!\n\n👉 Schau auf der Programm-Seite!`
        : `${prefix}🍷 **${winemaker ? getExpertName(winemaker) : 'Peter Winemaker'}** is our winemaking master! Third generation winemaker of our family winery.\n\n📚 Available programs:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" ${p.is_sponsored ? '(sponsored - FREE!)' : `(€${Math.round(p.price_huf / 400)})`}`).join('\n')}\n\nThe volcanic soil produces unique wines - try it!\n\n👉 Check the Programs page!`;
    }

    // ===== VOUCHER/COUPON EXPLANATION =====
    if (lowerMsg.includes('kupon') || lowerMsg.includes('voucher') || lowerMsg.includes('gutschein') || lowerMsg.includes('hogyan működik') || lowerMsg.includes('how does') || lowerMsg.includes('wie funktioniert')) {
      setAvatarMood("happy");
      const totalSponsors = MOCK_SPONSORS.length;
      const totalCredits = MOCK_SPONSORS.reduce((sum, s) => sum + s.total_credits, 0);
      
      return language === 'hu'
        ? `${prefix}🎫 Ez az egyik kedvenc témám! A kuponrendszerünk összeköti a közösséget:\n\n🏨 **Szponzorok** (${totalSponsors} partner, pl. Káli Panzió) krediteket vásárolnak\n👤 **Tagok** (${DEMO_STATS.members} tag, mint Te!) ingyenes kuponokat kapnak\n🎓 **Szakértők** (${DEMO_STATS.experts} mester) megkapják a programdíjat\n\n💰 Jelenleg **${totalCredits.toLocaleString()} kredit** érhető el a közösségben!\n\nÍgy mindenki nyer - a tudás körforgásban marad a közösségben! 🌿\n\n👉 Nézd meg a "Szponzorált" programokat a Piactéren!`
        : language === 'de'
        ? `${prefix}🎫 Das ist eines meiner Lieblingsthemen! Unser Gutscheinsystem verbindet die Gemeinschaft:\n\n🏨 **Sponsoren** (${totalSponsors} Partner, z.B. Káli Pension) kaufen Credits\n👤 **Mitglieder** (${DEMO_STATS.members} Mitglieder, wie Du!) erhalten kostenlose Gutscheine\n🎓 **Experten** (${DEMO_STATS.experts} Meister) werden bezahlt\n\n💰 Aktuell sind **${totalCredits.toLocaleString()} Credits** in der Gemeinschaft verfügbar!\n\nSo gewinnt jeder - Wissen bleibt in der Gemeinschaft! 🌿\n\n👉 Schau dir die "Gesponsert"-Programme im Marktplatz an!`
        : `${prefix}🎫 This is one of my favorite topics! Our voucher system connects the community:\n\n🏨 **Sponsors** (${totalSponsors} partners, e.g. Káli Guesthouse) purchase credits\n👤 **Members** (${DEMO_STATS.members} members, like you!) receive free vouchers\n🎓 **Experts** (${DEMO_STATS.experts} masters) get paid\n\n💰 Currently **${totalCredits.toLocaleString()} credits** available in the community!\n\nEveryone wins - knowledge stays in the community! 🌿\n\n👉 Check out "Sponsored" programs in the Marketplace!`;
    }

    // ===== POPULAR EXPERT =====
    if (lowerMsg.includes('népszerű') || lowerMsg.includes('popular') || lowerMsg.includes('beliebt') || lowerMsg.includes('legjobb') || lowerMsg.includes('best') || lowerMsg.includes('top')) {
      setAvatarMood("happy");
      const topExperts = MOCK_EXPERTS.slice(0, 3);
      
      return language === 'hu'
        ? `${prefix}⭐ A közösségünk kedvencei - a ${DEMO_STATS.members} tagunk szerint:\n\n${topExperts.map((e, i) => `${['🥇', '🥈', '🥉'][i]} **${getExpertName(e)}** - ${getExpertTitle(e)} (${(4.9 - i * 0.1).toFixed(1)}⭐)`).join('\n')}\n\nMind a hárman igazi kincsek! ${MOCK_SPONSORS.length} szponzorunk támogatásával sok programjuk ingyenes.\n\n❓ **Melyik szakterület érdekel leginkább?**\n• Gasztronómia és főzés?\n• Kézművesség?\n• Természet és fenntarthatóság?`
        : language === 'de'
        ? `${prefix}⭐ Die Favoriten unserer Gemeinschaft - laut unseren ${DEMO_STATS.members} Mitgliedern:\n\n${topExperts.map((e, i) => `${['🥇', '🥈', '🥉'][i]} **${getExpertName(e)}** - ${getExpertTitle(e)} (${(4.9 - i * 0.1).toFixed(1)}⭐)`).join('\n')}\n\nAlle drei sind echte Schätze! Dank ${MOCK_SPONSORS.length} Sponsoren sind viele Programme kostenlos.\n\n❓ **Welcher Bereich interessiert dich am meisten?**\n• Gastronomie und Kochen?\n• Handwerk?\n• Natur und Nachhaltigkeit?`
        : `${prefix}⭐ Our community favorites - according to our ${DEMO_STATS.members} members:\n\n${topExperts.map((e, i) => `${['🥇', '🥈', '🥉'][i]} **${getExpertName(e)}** - ${getExpertTitle(e)} (${(4.9 - i * 0.1).toFixed(1)}⭐)`).join('\n')}\n\nAll three are true treasures! Thanks to ${MOCK_SPONSORS.length} sponsors, many programs are free.\n\n❓ **Which area interests you most?**\n• Gastronomy and cooking?\n• Crafts?\n• Nature and sustainability?`;
    }

    // ===== LOCATION-BASED =====
    if (lowerMsg.includes('bécs') || lowerMsg.includes('vienna') || lowerMsg.includes('wien') || lowerMsg.includes('budapest') || lowerMsg.includes('balaton') || lowerMsg.includes('köveskál')) {
      setAvatarMood("happy");
      const location = lowerMsg.includes('bécs') || lowerMsg.includes('vienna') || lowerMsg.includes('wien') ? 'Bécs/Wien' : 
                       lowerMsg.includes('budapest') ? 'Budapest' : 
                       lowerMsg.includes('köveskál') ? 'Köveskál' : 'Balaton';
      const locationExperts = MOCK_EXPERTS.filter(e => 
        e.location_city.toLowerCase().includes(location.toLowerCase().split('/')[0]) ||
        location.toLowerCase() === 'balaton'
      );
      const sponsoredPrograms = MOCK_PROGRAMS.filter(p => p.is_sponsored);
      
      return language === 'hu'
        ? `${prefix}📍 ${location} környékén ${locationExperts.length > 0 ? `${locationExperts.length} szakértőnk aktív` : 'számos programunk elérhető'}!\n\n🎁 **Szponzorált programok (INGYENES):**\n${sponsoredPrograms.slice(0, 3).map(p => `• "${getProgramTitle(p)}" - ${p.sponsor_name}`).join('\n')}\n\n❓ **Milyen típusú program érdekel?**\n• Workshop (kézműves, főzés)?\n• Túra (gyógynövény, bor)?\n• Családi program?\n\n👉 Szűrj helyszín szerint a Programok oldalon!`
        : language === 'de'
        ? `${prefix}📍 In der Nähe von ${location} ${locationExperts.length > 0 ? `sind ${locationExperts.length} unserer Experten aktiv` : 'sind viele Programme verfügbar'}!\n\n🎁 **Gesponserte Programme (KOSTENLOS):**\n${sponsoredPrograms.slice(0, 3).map(p => `• "${getProgramTitle(p)}" - ${p.sponsor_name_de || p.sponsor_name}`).join('\n')}\n\n❓ **Welche Art von Programm interessiert dich?**\n• Workshop (Handwerk, Kochen)?\n• Tour (Kräuter, Wein)?\n• Familienprogramm?\n\n👉 Filtere nach Standort auf der Programm-Seite!`
        : `${prefix}📍 Near ${location}, ${locationExperts.length > 0 ? `${locationExperts.length} of our experts are active` : 'many programs are available'}!\n\n🎁 **Sponsored programs (FREE):**\n${sponsoredPrograms.slice(0, 3).map(p => `• "${getProgramTitle(p)}" - ${p.sponsor_name_en || p.sponsor_name}`).join('\n')}\n\n❓ **What type of program interests you?**\n• Workshop (crafts, cooking)?\n• Tour (herbs, wine)?\n• Family program?\n\n👉 Filter by location on the Programs page!`;
    }

    // ===== LEARNING / PROGRAMS GENERAL =====
    if (lowerMsg.includes('tanul') || lowerMsg.includes('learn') || lowerMsg.includes('lernen') || lowerMsg.includes('program') || lowerMsg.includes('mit') || lowerMsg.includes('what')) {
      setAvatarMood("happy");
      const categories = [...new Set(MOCK_PROGRAMS.map(p => p.category))];
      const sponsoredCount = MOCK_PROGRAMS.filter(p => p.is_sponsored).length;
      
      return language === 'hu' 
        ? `${prefix}📚 A mi ${DEMO_STATS.experts} szakértőnk fantasztikus programokat kínál!\n\n🎯 **Kategóriák:**\n${categories.map(c => `• ${c === 'workshop' ? 'Műhelymunka' : c === 'gastronomy' ? 'Gasztronómia' : c === 'wellness' ? 'Wellness' : c === 'sustainability' ? 'Fenntarthatóság' : c === 'community' ? 'Közösségi' : c}`).join('\n')}\n\n🎁 **${sponsoredCount} program szponzorált** - teljesen ingyenes a ${DEMO_STATS.members} tagunknak!\n\n❓ **Mi érdekel leginkább?**\n• Kézműves tevékenységek?\n• Gasztronómia és ételek?\n• Természet és egészség?\n\n👉 Fedezd fel a Programok oldalon!`
        : language === 'de'
        ? `${prefix}📚 Unsere ${DEMO_STATS.experts} Experten bieten fantastische Programme!\n\n🎯 **Kategorien:**\n${categories.map(c => `• ${c === 'workshop' ? 'Workshop' : c === 'gastronomy' ? 'Gastronomie' : c === 'wellness' ? 'Wellness' : c === 'sustainability' ? 'Nachhaltigkeit' : c === 'community' ? 'Gemeinschaft' : c}`).join('\n')}\n\n🎁 **${sponsoredCount} Programme sind gesponsert** - völlig kostenlos für unsere ${DEMO_STATS.members} Mitglieder!\n\n❓ **Was interessiert dich am meisten?**\n• Handwerkliche Aktivitäten?\n• Gastronomie und Essen?\n• Natur und Gesundheit?\n\n👉 Entdecke sie auf der Programm-Seite!`
        : `${prefix}📚 Our ${DEMO_STATS.experts} experts offer fantastic programs!\n\n🎯 **Categories:**\n${categories.map(c => `• ${c.charAt(0).toUpperCase() + c.slice(1)}`).join('\n')}\n\n🎁 **${sponsoredCount} programs are sponsored** - completely free for our ${DEMO_STATS.members} members!\n\n❓ **What interests you most?**\n• Craft activities?\n• Gastronomy and food?\n• Nature and health?\n\n👉 Discover them on the Programs page!`;
    }

    // ===== FREE PROGRAMS =====
    if (lowerMsg.includes('ingyenes') || lowerMsg.includes('free') || lowerMsg.includes('kostenlos') || lowerMsg.includes('gratis')) {
      setAvatarMood("happy");
      const sponsoredPrograms = MOCK_PROGRAMS.filter(p => p.is_sponsored);
      
      return language === 'hu'
        ? `${prefix}🎉 Jó hírem van! ${MOCK_SPONSORS.length} szponzorunk - köztük a Káli Panzió és helyi vállalkozások - lehetővé teszik, hogy a ${DEMO_STATS.members} tagunk ingyen tanulhasson a szakértőktől.\n\n🎁 **Ingyenes programok most:**\n${sponsoredPrograms.slice(0, 4).map(p => `• "${getProgramTitle(p)}" - ${p.sponsor_name}`).join('\n')}\n\n👉 Keresd a "Szponzorált" címkét a Piactéren!`
        : language === 'de'
        ? `${prefix}🎉 Gute Nachrichten! Unsere ${MOCK_SPONSORS.length} Sponsoren - darunter Káli Pension - ermöglichen es unseren ${DEMO_STATS.members} Mitgliedern, kostenlos von Experten zu lernen.\n\n🎁 **Kostenlose Programme jetzt:**\n${sponsoredPrograms.slice(0, 4).map(p => `• "${getProgramTitle(p)}" - ${p.sponsor_name_de || p.sponsor_name}`).join('\n')}\n\n👉 Suche nach dem "Gesponsert"-Label im Marktplatz!`
        : `${prefix}🎉 Good news! Our ${MOCK_SPONSORS.length} sponsors - including Káli Guesthouse - make it possible for our ${DEMO_STATS.members} members to learn from experts for free.\n\n🎁 **Free programs now:**\n${sponsoredPrograms.slice(0, 4).map(p => `• "${getProgramTitle(p)}" - ${p.sponsor_name_en || p.sponsor_name}`).join('\n')}\n\n👉 Look for the "Sponsored" label in the Marketplace!`;
    }

    // ===== BEEKEEPING / HONEY =====
    if (lowerMsg.includes('méh') || lowerMsg.includes('méz') || lowerMsg.includes('bee') || lowerMsg.includes('honey') || lowerMsg.includes('biene') || lowerMsg.includes('honig')) {
      setAvatarMood("happy");
      const beekeeper = MOCK_EXPERTS.find(e => e.id === 'mock-expert-5');
      const programs = findMatchingPrograms(['méh', 'méz', 'bee', 'honey']);
      
      return language === 'hu'
        ? `${prefix}🐝 **${beekeeper ? getExpertName(beekeeper) : 'Kiss Gábor'}** a mi méhész mesterünk! A fenntartható méhészet és méztermelés szakértője.\n\n📚 Elérhető programjai:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" (${p.price_huf.toLocaleString()} Ft)`).join('\n')}\n\nA méhek csodálatos világába kalauzol!\n\n👉 Nézd meg a Programok oldalon!`
        : language === 'de'
        ? `${prefix}🐝 **${beekeeper ? getExpertName(beekeeper) : 'Thomas Fischer'}** ist unser Imkermeister! Experte für nachhaltige Imkerei und Honigproduktion.\n\n📚 Verfügbare Programme:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" (€${Math.round(p.price_huf / 400)})`).join('\n')}\n\nEr führt dich in die wunderbare Welt der Bienen!\n\n👉 Schau auf der Programm-Seite!`
        : `${prefix}🐝 **${beekeeper ? getExpertName(beekeeper) : 'Gabriel Beekeeper'}** is our beekeeper master! Expert in sustainable beekeeping and honey production.\n\n📚 Available programs:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" (€${Math.round(p.price_huf / 400)})`).join('\n')}\n\nHe guides you into the wonderful world of bees!\n\n👉 Check the Programs page!`;
    }

    // ===== CRAFTS / WEAVING =====
    if (lowerMsg.includes('kosár') || lowerMsg.includes('fonás') || lowerMsg.includes('basket') || lowerMsg.includes('weav') || lowerMsg.includes('korb') || lowerMsg.includes('flecht') || lowerMsg.includes('kézműves') || lowerMsg.includes('craft') || lowerMsg.includes('handwerk')) {
      setAvatarMood("happy");
      const weaver = MOCK_EXPERTS.find(e => e.id === 'mock-expert-4');
      const programs = findMatchingPrograms(['kosár', 'fonás', 'basket', 'weav', 'korb', 'karácsonyi']);
      
      return language === 'hu'
        ? `${prefix}🧺 **${weaver ? getExpertName(weaver) : 'Tóth Anna'}** a mi kosárfonó művészünk! A hagyományos fonástechnikák megőrzője.\n\n📚 Elérhető programjai:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" (${p.price_huf.toLocaleString()} Ft)`).join('\n')}\n\nMinden kosár egy történet - megtanítja, hogyan mesélj a kezeddel!\n\n👉 Nézd meg a Programok oldalon!`
        : language === 'de'
        ? `${prefix}🧺 **${weaver ? getExpertName(weaver) : 'Maria Bauer'}** ist unsere Korbflechtkünstlerin! Bewahrerin traditioneller Flechttechniken.\n\n📚 Verfügbare Programme:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" (€${Math.round(p.price_huf / 400)})`).join('\n')}\n\nJeder Korb erzählt eine Geschichte - sie lehrt dich, mit deinen Händen zu erzählen!\n\n👉 Schau auf der Programm-Seite!`
        : `${prefix}🧺 **${weaver ? getExpertName(weaver) : 'Anne Weaver'}** is our basket weaving artist! Keeper of traditional weaving techniques.\n\n📚 Available programs:\n${programs.slice(0, 2).map(p => `• "${getProgramTitle(p)}" (€${Math.round(p.price_huf / 400)})`).join('\n')}\n\nEvery basket tells a story - she teaches you how to tell stories with your hands!\n\n👉 Check the Programs page!`;
    }

    // ===== PROACTIVE FALLBACK - Zero Rejection Rule =====
    // Try to find ANY matching expert or program based on keywords
    const userWords = lowerMsg.split(/\s+/).filter(w => w.length > 3);
    const matchingExperts = findMatchingExperts(userWords);
    const matchingPrograms = findMatchingPrograms(userWords);
    
    if (matchingExperts.length > 0 || matchingPrograms.length > 0) {
      setAvatarMood("happy");
      const expert = matchingExperts[0];
      const program = matchingPrograms[0];
      
      return language === 'hu'
        ? `${prefix}🔍 Érdekes kérdés! Hadd segítsek:\n\n${expert ? `👤 **${getExpertName(expert)}** (${getExpertTitle(expert)}) talán tud segíteni ebben a témában.\n\n` : ''}${program ? `📚 Kapcsolódó program: "${getProgramTitle(program)}" ${program.is_sponsored ? '(INGYENES!)' : ''}\n\n` : ''}A közösségünkben ${DEMO_STATS.experts} szakértő és ${DEMO_STATS.programs} program van - biztos találunk neked megfelelőt!\n\n❓ **Pontosítanád a kérdésedet?**\n• Mi érdekel leginkább ebben a témában?\n• Gyakorlati tudást keresel vagy elméletet?`
        : language === 'de'
        ? `${prefix}🔍 Interessante Frage! Lass mich helfen:\n\n${expert ? `👤 **${getExpertName(expert)}** (${getExpertTitle(expert)}) könnte bei diesem Thema helfen.\n\n` : ''}${program ? `📚 Verwandtes Programm: "${getProgramTitle(program)}" ${program.is_sponsored ? '(KOSTENLOS!)' : ''}\n\n` : ''}In unserer Gemeinschaft gibt es ${DEMO_STATS.experts} Experten und ${DEMO_STATS.programs} Programme - wir finden bestimmt das Richtige für dich!\n\n❓ **Könntest du deine Frage präzisieren?**\n• Was interessiert dich am meisten an diesem Thema?\n• Suchst du praktisches Wissen oder Theorie?`
        : `${prefix}🔍 Interesting question! Let me help:\n\n${expert ? `👤 **${getExpertName(expert)}** (${getExpertTitle(expert)}) might be able to help with this topic.\n\n` : ''}${program ? `📚 Related program: "${getProgramTitle(program)}" ${program.is_sponsored ? '(FREE!)' : ''}\n\n` : ''}In our community, there are ${DEMO_STATS.experts} experts and ${DEMO_STATS.programs} programs - we'll definitely find something for you!\n\n❓ **Could you clarify your question?**\n• What interests you most about this topic?\n• Are you looking for practical knowledge or theory?`;
    }

    // ===== ULTIMATE FALLBACK - Still proactive, never "I don't know" =====
    setAvatarMood("neutral");
    return language === 'hu'
      ? `Szia! 🤖 Örülök, hogy írsz!\n\nÉn vagyok a WellBot, a WellAgora digitális házigazdája. A közösségünk ${DEMO_STATS.members} tagot, ${DEMO_STATS.experts} szakértőt és ${MOCK_SPONSORS.length} szponzort számlál.\n\n🎯 **Miben segíthetek?**\n\n👨‍🍳 **Gasztronómia** - Főzés, kenyérsütés, borkészítés\n🌿 **Természet** - Gyógynövények, méhészet\n🎨 **Kézművesség** - Kosárfonás, hagyományok\n🎫 **Rendszer** - Kuponok, szponzoráció\n\n❓ Melyik terület érdekel? Segítek megtalálni a tökéletes programot vagy szakértőt!`
      : language === 'de'
      ? `Hallo! 🤖 Schön, dass du schreibst!\n\nIch bin WellBot, der digitale Gastgeber von WellAgora. Unsere Gemeinschaft zählt ${DEMO_STATS.members} Mitglieder, ${DEMO_STATS.experts} Experten und ${MOCK_SPONSORS.length} Sponsoren.\n\n🎯 **Wie kann ich helfen?**\n\n👨‍🍳 **Gastronomie** - Kochen, Brotbacken, Weinherstellung\n🌿 **Natur** - Kräuter, Imkerei\n🎨 **Handwerk** - Korbflechten, Traditionen\n🎫 **System** - Gutscheine, Sponsoring\n\n❓ Welcher Bereich interessiert dich? Ich helfe dir, das perfekte Programm oder den perfekten Experten zu finden!`
      : `Hi! 🤖 Glad you're reaching out!\n\nI'm WellBot, WellAgora's digital host. Our community has ${DEMO_STATS.members} members, ${DEMO_STATS.experts} experts, and ${MOCK_SPONSORS.length} sponsors.\n\n🎯 **How can I help?**\n\n👨‍🍳 **Gastronomy** - Cooking, bread baking, winemaking\n🌿 **Nature** - Herbs, beekeeping\n🎨 **Crafts** - Basket weaving, traditions\n🎫 **System** - Vouchers, sponsorship\n\n❓ Which area interests you? I'll help you find the perfect program or expert!`;
  };

  // Community Concierge quick-start chips
  const quickActions = [
    { 
      icon: HelpCircle, 
      title: language === 'hu' ? 'Hogyan működik a kupon?' : language === 'de' ? 'Wie funktioniert der Gutschein?' : 'How do vouchers work?', 
      query: language === 'hu' ? 'Hogyan működik a kuponrendszer?' : language === 'de' ? 'Wie funktioniert das Gutscheinsystem?' : 'How does the voucher system work?'
    },
    { 
      icon: Users, 
      title: language === 'hu' ? 'Ki a legnépszerűbb szakértő?' : language === 'de' ? 'Wer ist der beliebteste Experte?' : 'Who is the most popular expert?', 
      query: language === 'hu' ? 'Ki a legnépszerűbb szakértő?' : language === 'de' ? 'Wer ist der beliebteste Experte?' : 'Who is the most popular expert?'
    },
    { 
      icon: MapPin, 
      title: language === 'hu' ? 'Programok Bécsben?' : language === 'de' ? 'Programme in Wien?' : 'Programs in Vienna?', 
      query: language === 'hu' ? 'Milyen programok vannak Bécsben?' : language === 'de' ? 'Welche Programme gibt es in Wien?' : 'What programs are available in Vienna?'
    }
  ];
  // Load conversation history on mount (skip in demo mode)
  useEffect(() => {
    const loadConversationHistory = async () => {
      // In demo mode, skip Supabase and show empty chat
      if (isDemoMode || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: conversations, error: convError } = await supabase
          .from('ai_conversations')
          .select('id')
          .eq('user_id', user.id)
          .order('last_message_at', { ascending: false })
          .limit(1);

        if (convError) throw convError;

        if (conversations && conversations.length > 0) {
          const convId = conversations[0].id;
          setConversationId(convId);

          const { data: messagesData, error: msgError } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('timestamp', { ascending: false }); // Newest first

          if (msgError) throw msgError;

          if (messagesData && messagesData.length > 0) {
            const loadedMessages: Message[] = messagesData.map(msg => ({
              id: msg.id,
              content: msg.content,
              sender: msg.role === 'user' ? 'user' : 'ai',
              timestamp: new Date(msg.timestamp)
            }));

            setMessages(loadedMessages);
          }
        }
      } catch (error) {
        setError(t('wellbot.error_message'));
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationHistory();
  }, [user, t, isDemoMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date()
    };

    // Add new message at the beginning (newest first)
    setMessages(prev => [userMessage, ...prev]);
    setInputValue("");
    setIsTyping(true);
    setError(null);

    // DEMO MODE: Return mock response instead of calling edge function
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getDemoResponse(content),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [aiResponse, ...prev]);
      setIsTyping(false);
      return;
    }

    try {
      // For API call, we need chronological order
      const chronologicalMessages = [...messages].reverse();
      const conversationHistory = [...chronologicalMessages, userMessage].map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: conversationHistory,
          language: language,
          conversationId: conversationId,
          projectId: null
        }
      });

      if (error) {
        throw error;
      }

      if (!data || typeof (data as any).message !== 'string') {
        throw new Error('Invalid response');
      }

      const payload = data as {
        message: string;
        conversationId?: string;
        error?: string;
      };

      if (payload.error) {
        if (payload.error.includes('Rate limit')) {
          setError(t('wellbot.rate_limit_error'));
          toast({
            title: t('error'),
            description: t('wellbot.rate_limit_error'),
            variant: 'destructive',
          });
        } else if (payload.error.includes('Payment required')) {
          setError(t('wellbot.payment_error'));
          toast({
            title: t('error'),
            description: t('wellbot.payment_error'),
            variant: 'destructive',
          });
        } else {
          throw new Error(payload.error);
        }
        setIsTyping(false);
        return;
      }

      if (payload.conversationId && !conversationId) {
        setConversationId(payload.conversationId);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: payload.message,
        sender: 'ai',
        timestamp: new Date()
      };

      // Add AI response at the beginning (newest first)
      setMessages(prev => [aiResponse, ...prev]);
    } catch (error) {
      setError(t('wellbot.error_message'));
      toast({
        title: t('error'),
        description: t('wellbot.error_message'),
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    handleSendMessage(action.query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-3.5rem)] max-w-3xl mx-auto bg-[hsl(var(--background))]">
      {/* STICKY HEADER - WellBot Community Concierge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/40 px-4 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        {/* Avatar and Title */}
        <div className="flex items-center gap-4 mb-5">
          {/* Custom WellBot Mascot Avatar */}
          <div className="relative flex-shrink-0">
            <WellBotAvatar size="lg" mood={avatarMood} />
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white">
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                WellBot
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200">
                  {language === 'hu' ? 'Digitális Házigazda' : language === 'de' ? 'Digitaler Gastgeber' : 'Digital Host'}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <motion.div 
                    className="w-2 h-2 bg-sky-500 rounded-full"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-xs text-sky-600">{t('wellbot.online')}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {language === 'hu' 
                ? 'A WellAgora digitális házigazdája vagyok! Segítek eligazodni a programok és szakértők között. 🤖'
                : language === 'de'
                ? 'Ich bin der digitale Gastgeber von WellAgora! Ich helfe dir bei Programmen und Experten. 🤖'
                : 'I\'m WellAgora\'s digital host! I help you navigate programs and experts. 🤖'}
            </p>
          </div>
        </div>

        {/* Quick-Start Chips - Sky Blue border, Indigo text */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className="gap-2 text-sm bg-white/80 backdrop-blur-sm border-sky-300 text-indigo-700 
                  hover:bg-sky-50 hover:border-sky-400 hover:text-indigo-800 
                  shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-all duration-200"
                disabled={isTyping}
              >
                <action.icon className="h-4 w-4" />
                {action.title}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* INPUT FIELD - Below header, sticky */}
      <div className="sticky top-[180px] z-20 bg-white/80 backdrop-blur-md border-b border-white/40 px-4 py-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        {error && (
          <Alert variant="destructive" className="mb-3 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex items-center justify-between text-red-700">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-1 text-red-600 hover:text-red-800"
              >
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'hu' 
              ? 'Kérdezz a programokról, szakértőkről...' 
              : language === 'de' 
              ? 'Fragen Sie nach Programmen, Experten...' 
              : 'Ask about programs, experts...'}
            className="pr-14 resize-none min-h-[52px] max-h-[120px] bg-white/95 border-indigo-200 
              focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-slate-800 
              placeholder:text-slate-400 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)]"
            rows={1}
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="absolute right-2 bottom-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 shadow-md"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {language === 'hu' ? 'Enter küldés, Shift+Enter új sor' : language === 'de' ? 'Enter senden, Shift+Enter neue Zeile' : 'Enter to send, Shift+Enter for new line'}
        </p>
      </div>

      {/* SCROLLABLE MESSAGES AREA - Chat bubbles with organic premium style */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[hsl(var(--background))]">
        {/* Typing Indicator with thinking robot */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 items-start"
            >
              <WellBotAvatar size="sm" mood="thinking" />
              <div className="bg-sky-50/80 backdrop-blur-sm border border-sky-100 p-4 rounded-2xl rounded-tl-none shadow-[0_4px_16px_rgb(14,165,233,0.1)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-indigo-700">{t('wellbot.typing')}</span>
                  <div className="flex gap-1">
                    <motion.div 
                      className="w-2 h-2 bg-sky-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-sky-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-sky-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          /* Empty State - Robot Welcome */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center py-16"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(99,102,241,0.12)] border border-indigo-100/50 mb-6">
              <div className="flex justify-center mb-4">
                <WellBotAvatar size="xl" mood={avatarMood} />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                {language === 'hu' ? 'Szia! Újra itt vagyok' : language === 'de' ? 'Hallo! Ich bin wieder da' : 'Hi! I\'m back'}
              </h3>
              <p className="text-slate-600 max-w-sm text-sm leading-relaxed">
                {language === 'hu' 
                  ? 'Én vagyok WellBot, a WellAgora digitális házigazdája. 🤖 Készen állok, hogy segítsek eligazodni a 127 tagunk és szakértői programjaink között.'
                  : language === 'de'
                  ? 'Ich bin WellBot, der digitale Gastgeber von WellAgora. 🤖 Ich bin bereit, dir bei der Navigation durch unsere 127 Mitglieder und Expertenprogramme zu helfen.'
                  : 'I\'m WellBot, WellAgora\'s digital host. 🤖 I\'m ready to help you navigate our 127 members and expert programs.'}
              </p>
            </div>
          </motion.div>
        ) : (
          /* Messages - Chat bubbles with glassmorphism for WellBot */
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex gap-3 items-start ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Bot Avatar - Robot mascot */}
                {message.sender === "ai" && (
                  <WellBotAvatar size="sm" mood="neutral" />
                )}
                
                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[80%] ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  {message.sender === "ai" && (
                    <span className="text-xs font-medium bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent mb-1">WellBot</span>
                  )}
                  <div
                    className={`p-4 rounded-[1.25rem] whitespace-pre-wrap break-words text-sm leading-relaxed ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-sm shadow-[0_4px_16px_rgb(99,102,241,0.3)]"
                        : "bg-sky-50/80 backdrop-blur-sm border border-sky-100 text-slate-700 rounded-tl-sm shadow-[0_4px_16px_rgb(14,165,233,0.1)]"
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="text-xs text-slate-400 mt-1.5">
                    {format(message.timestamp, 'HH:mm')}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default AIAssistantChat;
