import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SeedRequest {
  action: 'seed' | 'wipe' | 'wipe_admin';
}

const TEST_ADMIN_PREFIX = 'TEST_ADMIN_';

// Helper to generate random date in last N days
const randomDateInPast = (days: number): string => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000);
  return pastDate.toISOString();
};

// Helper to pick random item from array
const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Test data constants - FULLY HUNGARIAN
const TEST_PREFIX = 'TEST_';

// Hungarian company names (fully localized)
const SPONSOR_NAMES = ['ZöldTech Kft.', 'ÖkoVentures Zrt.', 'Fenntarthatósági Központ Kft.'];

// Hungarian expert names with proper titles and locations
const EXPERT_DATA = [
  { first: 'Anna', last: 'Kovács', title: 'Fenntarthatósági Tanácsadó', location: 'Budapest, Magyarország', bio: 'Szenvedélyes fenntarthatósági szakértő, aki 10 éve segít embereknek zöldebb életet élni.' },
  { first: 'Péter', last: 'Nagy', title: 'Kézműves Pék', location: 'Debrecen, Magyarország', bio: 'Hagyományos kovászos kenyerek és péksütemények mestere, a lassú ételkészítés híve.' },
  { first: 'Eszter', last: 'Szabó', title: 'Természetes Kozmetikus', location: 'Szeged, Magyarország', bio: 'Természetes alapanyagokból készít kozmetikumokat, workshopjain megosztja tudását.' },
  { first: 'László', last: 'Tóth', title: 'Permakultúra Szakértő', location: 'Pécs, Magyarország', bio: 'Városi kertészkedés és permakultúra rajongó, aki kis tereken is zöld oázisokat teremt.' },
  { first: 'Katalin', last: 'Molnár', title: 'Tudatos Életmód Coach', location: 'Győr, Magyarország', bio: 'Életmód tanácsadó, aki a tudatos fogyasztás és a zero waste életmód népszerűsítésén dolgozik.' }
];

// Hungarian member names
const MEMBER_NAMES = [
  { first: 'Gábor', last: 'Kiss' },
  { first: 'Zsófia', last: 'Varga' },
  { first: 'Máté', last: 'Horváth' },
  { first: 'Nóra', last: 'Balogh' },
  { first: 'Dániel', last: 'Farkas' },
  { first: 'Réka', last: 'Takács' },
  { first: 'Ádám', last: 'Juhász' },
  { first: 'Boglárka', last: 'Szűcs' },
  { first: 'Levente', last: 'Oláh' },
  { first: 'Lilla', last: 'Fekete' }
];

// Fully localized program titles and descriptions (HU base, EN, DE translations)
const PROGRAM_DATA = [
  { 
    title: 'Fenntartható Kertészkedés Alapjai', 
    title_en: 'Sustainable Gardening Basics',
    title_de: 'Grundlagen des nachhaltigen Gärtnerns',
    desc: 'Tanuld meg, hogyan alakíts ki fenntartható kertet akár kis helyen is. Komposztálás, öntözés, természetes növényvédelem.',
    desc_en: 'Learn how to create a sustainable garden even in small spaces. Composting, irrigation, natural pest control.',
    desc_de: 'Lerne, wie du auch auf kleinem Raum einen nachhaltigen Garten anlegen kannst. Kompostierung, Bewässerung, natürlicher Pflanzenschutz.',
    category: 'gardening' 
  },
  { 
    title: 'Hulladékmentes Konyha', 
    title_en: 'Zero Waste Kitchen',
    title_de: 'Müllfreie Küche',
    desc: 'Fedezd fel a zero waste konyha titkait! Házi tartósítás, fermentálás, maradékok újrahasznosítása.',
    desc_en: 'Discover the secrets of a zero waste kitchen! Home preserving, fermentation, repurposing leftovers.',
    desc_de: 'Entdecke die Geheimnisse der müllfreien Küche! Hausgemachtes Einmachen, Fermentation, Resteverwertung.',
    category: 'cooking' 
  },
  { 
    title: 'Tudatos Vásárlás Mesterkurzus', 
    title_en: 'Conscious Shopping Masterclass',
    title_de: 'Meisterkurs für bewusstes Einkaufen',
    desc: 'Hogyan vásárolj fenntarthatóan? Helyi termelők, szezonális termékek, csomagolásmentes megoldások.',
    desc_en: 'How to shop sustainably? Local producers, seasonal products, package-free solutions.',
    desc_de: 'Wie kauft man nachhaltig ein? Lokale Produzenten, saisonale Produkte, verpackungsfreie Lösungen.',
    category: 'sustainability' 
  },
  { 
    title: 'Komposztálás A-tól Z-ig', 
    title_en: 'Composting from A to Z',
    title_de: 'Kompostierung von A bis Z',
    desc: 'Minden, amit a komposztálásról tudni kell: házi komposztáló, giliszta komposzt, balkonon is!',
    desc_en: 'Everything you need to know about composting: home composter, worm compost, even on a balcony!',
    desc_de: 'Alles über Kompostierung: Heimkomposter, Wurmkompost, sogar auf dem Balkon!',
    category: 'gardening' 
  },
  { 
    title: 'Természetes Kozmetikumok Készítése', 
    title_en: 'Making Natural Cosmetics',
    title_de: 'Herstellung natürlicher Kosmetik',
    desc: 'Készíts saját krémeket, szappanokat és testápolókat természetes alapanyagokból!',
    desc_en: 'Make your own creams, soaps and body care products from natural ingredients!',
    desc_de: 'Stelle deine eigenen Cremes, Seifen und Pflegeprodukte aus natürlichen Zutaten her!',
    category: 'crafts' 
  },
  { 
    title: 'Energiatakarékos Otthon', 
    title_en: 'Energy-Efficient Home',
    title_de: 'Energieeffizientes Zuhause',
    desc: 'Praktikus tippek az otthoni energiafogyasztás csökkentésére. Szigetelés, LED, okos eszközök.',
    desc_en: 'Practical tips to reduce home energy consumption. Insulation, LEDs, smart devices.',
    desc_de: 'Praktische Tipps zur Reduzierung des Energieverbrauchs zu Hause. Isolierung, LEDs, Smart-Geräte.',
    category: 'sustainability' 
  },
  { 
    title: 'Kovászos Kenyér Műhely', 
    title_en: 'Sourdough Bread Workshop',
    title_de: 'Sauerteigbrot-Workshop',
    desc: 'A tökéletes kovászos kenyér titkai. Kovász ápolás, dagasztás, sütés - kezdőknek is!',
    desc_en: 'Secrets of perfect sourdough bread. Starter care, kneading, baking - for beginners too!',
    desc_de: 'Geheimnisse des perfekten Sauerteigbrots. Sauerteignpflege, Kneten, Backen - auch für Anfänger!',
    category: 'cooking' 
  },
  { 
    title: 'Méhészet Kezdőknek', 
    title_en: 'Beekeeping for Beginners',
    title_de: 'Imkerei für Anfänger',
    desc: 'Ismerd meg a méhek csodálatos világát! Első lépések a házi méhészetben.',
    desc_en: 'Discover the wonderful world of bees! First steps in home beekeeping.',
    desc_de: 'Entdecke die wunderbare Welt der Bienen! Erste Schritte in der Heimimkerei.',
    category: 'gardening' 
  },
  { 
    title: 'Ökológiai Lábnyom Csökkentése', 
    title_en: 'Reducing Your Ecological Footprint',
    title_de: 'Reduzierung des ökologischen Fußabdrucks',
    desc: 'Mérd fel és csökkentsd ökológiai lábnyomodat! Gyakorlati lépések a fenntarthatóbb életért.',
    desc_en: 'Assess and reduce your ecological footprint! Practical steps for a more sustainable life.',
    desc_de: 'Bewerte und reduziere deinen ökologischen Fußabdruck! Praktische Schritte für ein nachhaltigeres Leben.',
    category: 'sustainability' 
  },
  { 
    title: 'Újrahasznosítás és Kreatív Alkotás', 
    title_en: 'Upcycling and Creative Making',
    title_de: 'Upcycling und kreatives Gestalten',
    desc: 'Adj új életet a régi tárgyaknak! Upcycling workshop kreatív megoldásokkal.',
    desc_en: 'Give new life to old objects! Upcycling workshop with creative solutions.',
    desc_de: 'Schenke alten Gegenständen neues Leben! Upcycling-Workshop mit kreativen Lösungen.',
    category: 'crafts' 
  }
];

const CATEGORIES = ['sustainability', 'cooking', 'wellness', 'gardening', 'crafts'];
const PRICES = [5000, 8000, 12000, 15000, 20000, 25000, 30000];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify super admin access
    const authHeader = req.headers.get("Authorization")?.split(" ")[1];
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check super admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_super_admin) {
      return new Response(JSON.stringify({ error: "Super admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json() as SeedRequest;

    // WIPE ADMIN TEST DATA (TEST_ADMIN_ prefix from Super Admin migrations)
    if (action === 'wipe_admin') {
      console.log('Wiping admin test data (TEST_ADMIN_ prefix)...');
      
      // Delete in correct order due to foreign keys
      await supabase.from('vouchers').delete().ilike('code', `%${TEST_ADMIN_PREFIX}%`);
      await supabase.from('content_sponsorships').delete().ilike('discount_description', `%${TEST_ADMIN_PREFIX}%`);
      await supabase.from('expert_contents').delete().ilike('description', `%${TEST_ADMIN_PREFIX}%`);
      await supabase.from('sponsors').delete().ilike('description', `%${TEST_ADMIN_PREFIX}%`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Admin test data (TEST_ADMIN_) wiped successfully' 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'wipe') {
      // Wipe all test data (identifiable by TEST_ prefix in notes/descriptions)
      console.log('Wiping test data...');
      
      // Delete in correct order due to foreign keys
      await supabase.from('voucher_settlements').delete().ilike('notes', `%${TEST_PREFIX}%`);
      await supabase.from('vouchers').delete().ilike('code', `%${TEST_PREFIX}%`);
      await supabase.from('content_access').delete().ilike('payment_reference', `%${TEST_PREFIX}%`);
      await supabase.from('transactions').delete().ilike('notes', `%${TEST_PREFIX}%`);
      await supabase.from('credit_transactions').delete().ilike('description', `%${TEST_PREFIX}%`);
      await supabase.from('content_sponsorships').delete().ilike('discount_description', `%${TEST_PREFIX}%`);
      await supabase.from('sponsor_credits').delete().ilike('package_type', `%${TEST_PREFIX}%`);
      await supabase.from('expert_contents').delete().ilike('description', `%${TEST_PREFIX}%`);
      await supabase.from('profiles').delete().ilike('bio', `%${TEST_PREFIX}%`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'All test data wiped successfully' 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'seed') {
      console.log('Seeding test data...');
      
      const createdIds = {
        sponsors: [] as string[],
        experts: [] as string[],
        members: [] as string[],
        programs: [] as string[],
        sponsorships: [] as string[]
      };

      // 1. CREATE 3 SPONSORS with packages
      for (let i = 0; i < 3; i++) {
        const sponsorId = crypto.randomUUID();
        const packageType = i === 0 ? 'annual' : 'quarterly';
        const totalCredits = packageType === 'annual' ? 420000 : 100000;
        const usedCredits = Math.floor(Math.random() * totalCredits * 0.6);
        const availableCredits = totalCredits - usedCredits;

        // Create sponsor profile
        await supabase.from('profiles').insert({
          id: sponsorId,
          email: `test_sponsor_${i}@wellagora.test`,
          first_name: SPONSOR_NAMES[i].split(' ')[0],
          last_name: SPONSOR_NAMES[i].split(' ')[1] || 'Test',
          user_role: 'sponsor',
          organization_name: SPONSOR_NAMES[i],
          bio: `${TEST_PREFIX}Generated sponsor for E2E testing`,
          sponsor_status: 'active'
        });

        // Create sponsor credits
        await supabase.from('sponsor_credits').insert({
          sponsor_user_id: sponsorId,
          total_credits: totalCredits,
          used_credits: usedCredits,
          available_credits: availableCredits,
          package_type: `${TEST_PREFIX}${packageType}`
        });

        // Record credit purchase transaction
        await supabase.from('credit_transactions').insert({
          sponsor_user_id: sponsorId,
          credits: totalCredits,
          transaction_type: 'purchase',
          description: `${TEST_PREFIX}${packageType === 'annual' ? 'Annual' : 'Quarterly'} package purchase`
        });

        createdIds.sponsors.push(sponsorId);
      }

      // 2. CREATE 5 EXPERTS with 2-3 programs each
      for (let i = 0; i < 5; i++) {
        const expertId = crypto.randomUUID();
        const expert = EXPERT_DATA[i];

        await supabase.from('profiles').insert({
          id: expertId,
          email: `test_expert_${i}@wellagora.test`,
          first_name: expert.first,
          last_name: expert.last,
          user_role: 'expert',
          is_verified_expert: true,
          expert_title: expert.title,
          location: expert.location,
          bio: `${TEST_PREFIX}${expert.bio}`
        });

        createdIds.experts.push(expertId);

        // Create 2-3 programs per expert
        const programCount = 2 + Math.floor(Math.random() * 2);
        for (let j = 0; j < programCount; j++) {
          const programId = crypto.randomUUID();
          const price = randomPick(PRICES);
          const isOnline = Math.random() > 0.5;
          const programData = PROGRAM_DATA[(i * 2 + j) % PROGRAM_DATA.length];

          await supabase.from('expert_contents').insert({
            id: programId,
            creator_id: expertId,
            // Hungarian base fields
            title: programData.title,
            description: `${TEST_PREFIX}${programData.desc} Típus: ${isOnline ? 'Online' : 'Személyes'}.`,
            // English translations
            title_en: programData.title_en,
            description_en: `${TEST_PREFIX}${programData.desc_en} Type: ${isOnline ? 'Online' : 'In-person'}.`,
            // German translations
            title_de: programData.title_de,
            description_de: `${TEST_PREFIX}${programData.desc_de} Typ: ${isOnline ? 'Online' : 'Persönlich'}.`,
            category: programData.category,
            price_huf: price,
            access_type: 'paid',
            is_published: true
          });

          createdIds.programs.push(programId);

          // Seed 3-5 reviews per program with Hungarian content
          const reviewCount = 3 + Math.floor(Math.random() * 3);
          const REVIEW_COMMENTS = [
            'Fantasztikus program! Nagyon sokat tanultam, köszönöm szépen!',
            'Profi szakértő, minden kérdésre választ kaptam. Ajánlom mindenkinek!',
            'Életem egyik legjobb döntése volt, hogy részt vettem. 5 csillag!',
            'Gyakorlatias, hasznos, és remek közösség. Visszatérek!',
            'Lenyűgöző tudás és lelkesedés. Nagyon inspiráló volt!',
          ];
          
          for (let r = 0; r < reviewCount; r++) {
            const reviewerId = randomPick(createdIds.members.length > 0 ? createdIds.members : [crypto.randomUUID()]);
            await supabase.from('content_reviews').insert({
              content_id: programId,
              user_id: reviewerId,
              rating: 4 + Math.round(Math.random()), // 4 or 5 stars
              comment: REVIEW_COMMENTS[r % REVIEW_COMMENTS.length],
              created_at: randomDateInPast(30)
            });
          }
          if (Math.random() > 0.4 && createdIds.sponsors.length > 0) {
            const sponsorId = randomPick(createdIds.sponsors);
            const contribution = Math.min(price, Math.floor(Math.random() * 15000) + 5000);
            const maxSeats = isOnline ? 100 : 10;

            const { data: sponsorship } = await supabase.from('content_sponsorships').insert({
              content_id: programId,
              sponsor_id: sponsorId,
              sponsor_contribution_huf: contribution,
              max_sponsored_seats: maxSeats,
              sponsored_seats_used: Math.floor(Math.random() * maxSeats * 0.5),
              is_active: true,
              discount_description: `${TEST_PREFIX}Test sponsorship`
            }).select().single();

            if (sponsorship) {
              createdIds.sponsorships.push(sponsorship.id);
            }
          }
        }
      }

      // 3. CREATE 10 MEMBERS with simulated savings
      for (let i = 0; i < 10; i++) {
        const memberId = crypto.randomUUID();
        const name = MEMBER_NAMES[i];

        await supabase.from('profiles').insert({
          id: memberId,
          email: `test_member_${i}@wellagora.test`,
          first_name: name.first,
          last_name: name.last,
          user_role: 'citizen',
          bio: `${TEST_PREFIX}Test member for E2E testing`,
          credit_balance: Math.floor(Math.random() * 50000) // Simulated savings
        });

        createdIds.members.push(memberId);
      }

      // 4. CREATE 50 TRANSACTIONS over last 30 days (80/20 split)
      const noShowIndices = new Set<number>();
      while (noShowIndices.size < 4) {
        noShowIndices.add(Math.floor(Math.random() * 50));
      }

      for (let i = 0; i < 50; i++) {
        const isNoShow = noShowIndices.has(i);
        const programId = randomPick(createdIds.programs);
        const buyerId = randomPick(createdIds.members);
        const expertId = randomPick(createdIds.experts);
        
        // Get a random price (simulated)
        const expertPrice = randomPick(PRICES);
        const sponsorContribution = Math.random() > 0.5 ? Math.floor(Math.random() * expertPrice * 0.6) : 0;
        const memberPayment = expertPrice - sponsorContribution;
        
        // 80/20 split
        const platformCommission = Math.round(expertPrice * 0.20);
        const expertPayout = Math.round(expertPrice * 0.80);

        const transactionDate = randomDateInPast(30);
        const transactionType = sponsorContribution > 0 ? 'sponsored_purchase' : 'purchase';

        await supabase.from('transactions').insert({
          content_id: programId,
          buyer_id: buyerId,
          creator_id: expertId,
          amount: expertPrice,
          member_payment_amount: memberPayment,
          sponsor_payment_amount: sponsorContribution,
          expert_price_huf: expertPrice,
          platform_commission: platformCommission,
          platform_fee: platformCommission,
          expert_payout: expertPayout,
          creator_revenue: expertPayout,
          status: isNoShow ? 'no_show' : 'completed',
          transaction_type: transactionType,
          notes: `${TEST_PREFIX}${isNoShow ? 'NO_SHOW - Credit consumed, Expert paid' : 'Standard transaction'}`,
          created_at: transactionDate
        });

        // Create voucher for transaction
        const voucherId = crypto.randomUUID();
        await supabase.from('vouchers').insert({
          id: voucherId,
          user_id: buyerId,
          content_id: programId,
          unique_code: `${TEST_PREFIX}${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
          status: isNoShow ? 'no_show' : (Math.random() > 0.3 ? 'redeemed' : 'active'),
          sponsor_credit_status: isNoShow ? 'consumed' : 'active',
          expert_payout_status: isNoShow ? 'resource_consumed' : 'pending',
          payout_amount: expertPayout,
          created_at: transactionDate
        });

        // If no-show, create settlement record
        if (isNoShow) {
          await supabase.from('voucher_settlements').insert({
            voucher_id: voucherId,
            user_id: buyerId,
            expert_id: expertId,
            content_id: programId,
            settlement_type: 'no_show',
            original_price: expertPrice,
            sponsor_contribution: sponsorContribution,
            user_payment: memberPayment,
            expert_payout: expertPayout,
            platform_fee: platformCommission,
            sponsor_credit_action: 'consumed',
            settlement_status: 'processed',
            notes: `${TEST_PREFIX}No-Show settlement - Expert receives full 80% payout`
          });
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Test data seeded successfully',
        created: {
          sponsors: createdIds.sponsors.length,
          experts: createdIds.experts.length,
          members: createdIds.members.length,
          programs: createdIds.programs.length,
          sponsorships: createdIds.sponsorships.length,
          transactions: 50,
          noShowTransactions: 4
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in seed-test-data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
