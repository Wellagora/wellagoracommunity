// Mock Data for Testing - Used when database is empty
// Names are localized based on active language

// ===== GLOBAL DEMO STATS - Single source of truth =====
export const DEMO_STATS = {
  members: 127,
  experts: 12,
  sponsors: 5,
  programs: 12,
  events: 6,
  completions: 312,
  points: 15420,
  activeChallenges: 8,
  wellbotResponses: 156,
} as const;

export interface MockExpert {
  id: string;
  first_name: string;
  first_name_en: string;
  first_name_de: string;
  last_name: string;
  last_name_en: string;
  last_name_de: string;
  avatar_url: string;
  expert_title: string;
  expert_title_en: string;
  expert_title_de: string;
  bio: string;
  bio_en: string;
  bio_de: string;
  expert_bio_long: string;
  expert_bio_long_en: string;
  expert_bio_long_de: string;
  location_city: string;
  is_verified_expert: boolean;
  expertise_areas: string[];
  created_at: string;
  [key: string]: unknown;
}

export interface MockProgram {
  id: string;
  title: string;
  title_en: string;
  title_de: string;
  description: string;
  description_en: string;
  description_de: string;
  image_url: string;
  thumbnail_url: string;
  price_huf: number;
  access_type: string;
  access_level: string;
  category: string;
  creator_id: string;
  is_published: boolean;
  is_featured: boolean;
  sponsor_name: string | null;
  sponsor_name_en: string | null;
  sponsor_name_de: string | null;
  sponsor_logo_url: string | null;
  is_sponsored: boolean;
  created_at: string;
  tools_needed?: string | null;
  [key: string]: unknown;
}

export interface MockVoucher {
  id: string;
  code: string;
  content_id: string;
  content_title: string;
  status: 'active' | 'redeemed';
  created_at: string;
  pickup_location: string;
}

export const MOCK_EXPERTS: MockExpert[] = [
  {
    id: 'mock-expert-6',
    first_name: 'Balázs',
    first_name_en: 'Benjamin',
    first_name_de: 'Bastian',
    last_name: 'Molnár',
    last_name_en: 'Miller',
    last_name_de: 'Meier',
    avatar_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Séf és Gasztro-szakértő',
    expert_title_en: 'Chef & Gastronomy Expert',
    expert_title_de: 'Küchenchef & Gastro-Experte',
    bio: 'A helyi alapanyagok és a hagyományos ízek mestere.',
    bio_en: 'Master of local ingredients and traditional flavors.',
    bio_de: 'Meister lokaler Zutaten und traditioneller Aromen.',
    expert_bio_long: 'Több mint 15 éve dolgozom a gasztronómia világában. A Balaton-felvidék ízvilágát képviselem, a helyi termelőkkel szoros együttműködésben. Programjaimon megtanítom, hogyan hozd ki a legtöbbet a szezonális alapanyagokból, és hogyan őrizd meg a hagyományos magyar ízeket modern technikákkal.',
    expert_bio_long_en: 'I have been working in the world of gastronomy for over 15 years. I represent the flavors of the Balaton Highlands, in close cooperation with local producers. In my programs, I teach you how to get the most out of seasonal ingredients and how to preserve traditional Hungarian flavors with modern techniques.',
    expert_bio_long_de: 'Seit über 15 Jahren arbeite ich in der Welt der Gastronomie. Ich repräsentiere die Aromen des Balaton-Hochlands in enger Zusammenarbeit mit lokalen Produzenten. In meinen Programmen lehre ich, wie man das Beste aus saisonalen Zutaten herausholt und traditionelle ungarische Aromen mit modernen Techniken bewahrt.',
    location_city: 'Köveskál',
    is_verified_expert: true,
    expertise_areas: ['Főzés', 'Gasztronómia', 'Szezonális konyha', 'Helyi alapanyagok'],
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'mock-expert-1',
    first_name: 'István',
    first_name_en: 'Stephen',
    first_name_de: 'Hans',
    last_name: 'Kovács',
    last_name_en: 'Smith',
    last_name_de: 'Schmidt',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Kemencemester',
    expert_title_en: 'Brick Oven Master',
    expert_title_de: 'Ofenbaumeister',
    bio: 'Több mint 20 éve építek kemencéket a régióban.',
    bio_en: 'Building ovens in our region for over 20 years.',
    bio_de: 'Seit über 20 Jahren baue ich traditionelle Öfen in unserer Region.',
    expert_bio_long: 'A hagyományos kemenceépítés mestere vagyok. Gyermekkorom óta tanulom ezt a mesterséget nagyapámtól, aki a régió leghíresebb kemenceépítője volt. Minden kemence egyedi, mint az alkotója. A tűz és a kenyér összefonódása az életem része.',
    expert_bio_long_en: 'I am a master of traditional oven building. I have been learning this craft from my grandfather since childhood, who was the most famous oven builder in the region. Every oven is unique, just like its creator. The interweaving of fire and bread is part of my life.',
    expert_bio_long_de: 'Ich bin ein Meister des traditionellen Ofenbaus. Seit meiner Kindheit lerne ich dieses Handwerk von meinem Großvater, der der berühmteste Ofenbauer der Region war. Jeder Ofen ist einzigartig, genau wie sein Schöpfer. Die Verflechtung von Feuer und Brot ist Teil meines Lebens.',
    location_city: 'Köveskál',
    is_verified_expert: true,
    expertise_areas: ['Kemenceépítés', 'Kenyérsütés', 'Hagyományőrzés'],
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'mock-expert-2',
    first_name: 'Éva',
    first_name_en: 'Eva',
    first_name_de: 'Anna',
    last_name: 'Nagy',
    last_name_en: 'Green',
    last_name_de: 'Müller',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Gyógynövényszakértő',
    expert_title_en: 'Herbalist Expert',
    expert_title_de: 'Kräuterexpertin',
    bio: 'A Balaton-felvidék gyógynövényeinek szakértője.',
    bio_en: 'Expert in medicinal herbs of the Balaton Uplands.',
    bio_de: 'Expertin für Heilkräuter der Region.',
    expert_bio_long: 'Évtizedek óta gyűjtöm és dolgozom fel a helyi gyógynövényeket. Programjaimon megosztom a tudásomat a természet gyógyító erejéről. Célom, hogy mindenki megismerje a környezetében található növények értékét és felhasználási módját.',
    expert_bio_long_en: 'For decades, I have been collecting and processing local medicinal herbs. In my programs, I share my knowledge about the healing power of nature. My goal is for everyone to learn the value and uses of plants found in their environment.',
    expert_bio_long_de: 'Seit Jahrzehnten sammle und verarbeite ich lokale Heilkräuter. In meinen Programmen teile ich mein Wissen über die heilende Kraft der Natur. Mein Ziel ist es, dass jeder den Wert und die Verwendung der Pflanzen in seiner Umgebung kennenlernt.',
    location_city: 'Mindszentkálla',
    is_verified_expert: true,
    expertise_areas: ['Gyógynövények', 'Teakeverékek', 'Természetgyógyászat'],
    created_at: '2024-02-20T10:00:00Z'
  },
  {
    id: 'mock-expert-3',
    first_name: 'Péter',
    first_name_en: 'Peter',
    first_name_de: 'Lukas',
    last_name: 'Szabó',
    last_name_en: 'Winemaker',
    last_name_de: 'Weber',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Borkészítő Mester',
    expert_title_en: 'Winemaking Master',
    expert_title_de: 'Weinbaumeister',
    bio: 'Családi pincészetünk harmadik generációs borásza.',
    bio_en: 'Third generation winemaker of our family winery.',
    bio_de: 'Winzer in dritter Generation unseres Familienweinguts.',
    expert_bio_long: 'A régió vulkanikus talaja egyedi borokat ad. Megtanítom a résztvevőket a helyi szőlőfajták megismerésére és a hagyományos borkészítés titkaira. Családunk évszázados hagyományait őrzöm és adom tovább.',
    expert_bio_long_en: 'The volcanic soil of the region produces unique wines. I teach participants about local grape varieties and the secrets of traditional winemaking. I preserve and pass on our family\'s centuries-old traditions.',
    expert_bio_long_de: 'Der vulkanische Boden der Region bringt einzigartige Weine hervor. Ich lehre die Teilnehmer über lokale Rebsorten und die Geheimnisse der traditionellen Weinherstellung. Ich bewahre und gebe die jahrhundertealten Traditionen unserer Familie weiter.',
    location_city: 'Szentbékkálla',
    is_verified_expert: true,
    expertise_areas: ['Borkészítés', 'Szőlészet', 'Borkóstoló'],
    created_at: '2024-03-10T10:00:00Z'
  },
  {
    id: 'mock-expert-4',
    first_name: 'Anna',
    first_name_en: 'Anne',
    first_name_de: 'Maria',
    last_name: 'Tóth',
    last_name_en: 'Weaver',
    last_name_de: 'Bauer',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Kosárfonó Művész',
    expert_title_en: 'Basket Weaving Artist',
    expert_title_de: 'Korbflechtkünstlerin',
    bio: 'A hagyományos fonástechnikák megőrzője.',
    bio_en: 'Keeper of traditional weaving techniques.',
    bio_de: 'Bewahrerin traditioneller Flechttechniken.',
    expert_bio_long: 'A fűzfavessző fonás évszázados hagyományát viszem tovább. Minden kosár egy történet - megtanítom, hogyan mesélj a te kezeddel is. A természetes anyagokkal való munka békét és harmóniát hoz.',
    expert_bio_long_en: 'I carry on the centuries-old tradition of willow weaving. Every basket tells a story - I teach you how to tell stories with your hands too. Working with natural materials brings peace and harmony.',
    expert_bio_long_de: 'Ich führe die jahrhundertealte Tradition des Weidenflechtens fort. Jeder Korb erzählt eine Geschichte - ich lehre dich, wie du auch mit deinen Händen Geschichten erzählen kannst. Die Arbeit mit natürlichen Materialien bringt Frieden und Harmonie.',
    location_city: 'Kékkút',
    is_verified_expert: true,
    expertise_areas: ['Kosárfonás', 'Kézművesség', 'Hagyományőrzés'],
    created_at: '2024-04-05T10:00:00Z'
  },
  {
    id: 'mock-expert-5',
    first_name: 'Gábor',
    first_name_en: 'Gabriel',
    first_name_de: 'Thomas',
    last_name: 'Kiss',
    last_name_en: 'Beekeeper',
    last_name_de: 'Fischer',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Méhész Mester',
    expert_title_en: 'Beekeeper Master',
    expert_title_de: 'Imkermeister',
    bio: 'Fenntartható méhészet és méztermelés.',
    bio_en: 'Sustainable beekeeping and honey production.',
    bio_de: 'Nachhaltige Imkerei und Honigproduktion.',
    expert_bio_long: 'A méhek csodálatos világába kalauzollak. Megtanítom, hogyan gondozd a saját kaptáraidat és élvezd a méhészet gyümölcseit. A méhek nélkül nincs élet - ez a mesterségem hitvallása.',
    expert_bio_long_en: 'I guide you into the wonderful world of bees. I teach you how to care for your own hives and enjoy the fruits of beekeeping. There is no life without bees - this is the creed of my craft.',
    expert_bio_long_de: 'Ich führe dich in die wunderbare Welt der Bienen ein. Ich lehre dich, wie du deine eigenen Bienenstöcke pflegen und die Früchte der Imkerei genießen kannst. Ohne Bienen gibt es kein Leben - das ist das Credo meines Handwerks.',
    location_city: 'Balatonhenye',
    is_verified_expert: true,
    expertise_areas: ['Méhészet', 'Mézfeldolgozás', 'Ökológia'],
    created_at: '2024-05-01T10:00:00Z'
  }
];

export const MOCK_PROGRAMS: MockProgram[] = [
  // Expert 1's programs
  {
    id: 'mock-program-1',
    title: 'Kemenceépítés alapjai',
    title_en: 'Brick Oven Building Basics',
    title_de: 'Grundlagen des Ofenbaus',
    description: 'Tanuld meg a hagyományos kemenceépítés fortélyait! Ezen a programon végigvezetlek a tervezéstől az első tűzrakásig. Megismered a megfelelő anyagokat, a helyes arányokat és a kemence lelkét. A program végén saját kemencéd tervével távozol, amit bármikor megvalósíthatsz.',
    description_en: 'Learn the secrets of traditional oven building! In this program, I will guide you from planning to lighting the first fire. You will learn about the right materials, proper proportions, and the soul of the oven. At the end, you will leave with your own oven plan that you can implement anytime.',
    description_de: 'Lerne die Geheimnisse des traditionellen Ofenbaus! In diesem Programm führe ich dich von der Planung bis zum ersten Feuer. Du lernst die richtigen Materialien, die richtigen Proportionen und die Seele des Ofens kennen. Am Ende verlässt du das Programm mit deinem eigenen Ofenplan, den du jederzeit umsetzen kannst.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    price_huf: 15000,
    access_type: 'sponsored',
    access_level: 'sponsored',
    category: 'workshop',
    creator_id: 'mock-expert-1',
    is_published: true,
    is_featured: true,
    sponsor_name: 'Balaton Régió Alapítvány',
    sponsor_name_en: 'Balaton Region Foundation',
    sponsor_name_de: 'Balaton Region Stiftung',
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-06-01T10:00:00Z'
  },
  {
    id: 'mock-program-2',
    title: 'Kovászkenyér mesterkurzus',
    title_en: 'Sourdough Bread Masterclass',
    title_de: 'Sauerteigbrot Meisterkurs',
    description: 'A tökéletes kovászkenyér titkai a kemencében. Megtanítom, hogyan ápold a kovászodat, hogyan dagaszd a tésztát és hogyan süsd meg a tökéletes kenyeret. Évtizedes tapasztalatomat osztom meg veled ezen az intenzív napon.',
    description_en: 'Secrets of perfect sourdough bread in a brick oven. I will teach you how to nurture your sourdough, how to knead the dough, and how to bake the perfect bread. I will share my decades of experience with you during this intensive day.',
    description_de: 'Die Geheimnisse des perfekten Sauerteigbrots im traditionellen Ofen. Ich zeige dir, wie du deinen Sauerteig pflegst, den Teig knetest und das perfekte Brot bäckst. An diesem intensiven Tag teile ich meine jahrzehntelange Erfahrung mit dir.',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    price_huf: 12000,
    access_type: 'sponsored',
    access_level: 'sponsored',
    category: 'gastronomy',
    creator_id: 'mock-expert-1',
    is_published: true,
    is_featured: false,
    sponsor_name: 'Helyi Értékek Programja',
    sponsor_name_en: 'Local Values Program',
    sponsor_name_de: 'Programm für lokale Werte',
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-06-10T10:00:00Z'
  },
  // Expert 2's programs
  {
    id: 'mock-program-3',
    title: 'Gyógynövénygyűjtés túra',
    title_en: 'Medicinal Herb Foraging Tour',
    title_de: 'Heilkräuter-Sammelwanderung',
    description: 'Fedezd fel a helyi gyógynövényeket szakértő vezetésével! Együtt járjuk be a régió leggazdagabb gyógynövény-lelőhelyeit. Megtanulod felismerni, gyűjteni és feldolgozni a legfontosabb gyógynövényeket. Vigyél haza saját teakeveréket!',
    description_en: 'Discover local medicinal herbs with an expert guide! Together we will explore the richest herb locations in the region. You will learn to identify, collect, and process the most important medicinal herbs. Take home your own tea blend!',
    description_de: 'Entdecke heimische Heilkräuter mit einer Expertin! Gemeinsam erkunden wir die reichsten Kräuterstandorte der Region. Du lernst die wichtigsten Heilkräuter zu erkennen, zu sammeln und zu verarbeiten. Nimm deine eigene Teemischung mit nach Hause!',
    image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop',
    price_huf: 8000,
    access_type: 'sponsored',
    access_level: 'sponsored',
    category: 'wellness',
    creator_id: 'mock-expert-2',
    is_published: true,
    is_featured: true,
    sponsor_name: 'Zöld Jövő Egyesület',
    sponsor_name_en: 'Green Future Association',
    sponsor_name_de: 'Verein für grüne Zukunft',
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-06-15T10:00:00Z'
  },
  {
    id: 'mock-program-4',
    title: 'Házi teakeverékek készítése',
    title_en: 'Homemade Tea Blending Workshop',
    title_de: 'Workshop: Eigene Teemischungen',
    description: 'Készítsd el a saját egyedi teakeverékedet! Megismered a legfontosabb gyógynövényeket, hatásaikat és kombinálási lehetőségeiket. A program végén saját receptkönyveddel és személyre szabott teakeverékeddel távozol.',
    description_en: 'Create your own unique tea blend! You will learn about the most important herbs, their effects, and how to combine them. At the end, you will leave with your own recipe book and personalized tea blend.',
    description_de: 'Kreiere deine eigene Teemischung! Du lernst die wichtigsten Kräuter, ihre Wirkungen und Kombinationsmöglichkeiten kennen. Am Ende gehst du mit deinem eigenen Rezeptbuch und einer personalisierten Teemischung nach Hause.',
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    price_huf: 6000,
    access_type: 'one_time_purchase',
    access_level: 'one_time_purchase',
    category: 'wellness',
    creator_id: 'mock-expert-2',
    is_published: true,
    is_featured: false,
    sponsor_name: null,
    sponsor_name_en: null,
    sponsor_name_de: null,
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-06-20T10:00:00Z'
  },
  // Expert 3's programs
  {
    id: 'mock-program-5',
    title: 'Borkóstoló és pincetúra',
    title_en: 'Wine Tasting and Cellar Tour',
    title_de: 'Weinprobe und Kellerführung',
    description: 'Ismerd meg a régió borait! Családi pincészetünkben megkóstolhatod legjobb boraink és megismerheted a vulkanikus talaj egyedi karakterét. A túra során bepillanthatsz a borkészítés kulisszái mögé és hazavihetsz egy üveg kedvenc borodat.',
    description_en: 'Discover the wines of our region! In our family winery, you can taste our best wines and learn about the unique character of volcanic soil. During the tour, you will get a behind-the-scenes look at winemaking and take home a bottle of your favorite wine.',
    description_de: 'Entdecke die Weine unserer Region! In unserem Familienweingut kannst du unsere besten Weine probieren und den einzigartigen Charakter des vulkanischen Bodens kennenlernen. Während der Tour erhältst du einen Blick hinter die Kulissen der Weinherstellung und nimmst eine Flasche deines Lieblingsweins mit nach Hause.',
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
    price_huf: 18000,
    access_type: 'sponsored',
    access_level: 'sponsored',
    category: 'gastronomy',
    creator_id: 'mock-expert-3',
    is_published: true,
    is_featured: true,
    sponsor_name: 'Balatonfelvidéki Borút',
    sponsor_name_en: 'Balaton Highlands Wine Route',
    sponsor_name_de: 'Weinstraße des Balaton-Hochlands',
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-06-25T10:00:00Z'
  },
  {
    id: 'mock-program-6',
    title: 'Szüret a szőlőben',
    title_en: 'Harvest in the Vineyard',
    title_de: 'Weinlese im Weinberg',
    description: 'Vegyél részt az őszi szüreten! Autentikus élmény a szőlőbirtokon, ahol megtapasztalhatod a szüret örömét. Részt vehetsz a szőlő szedésében, kipróbálhatod a préseket és megkóstolhatod a friss mustot.',
    description_en: 'Participate in the autumn harvest! An authentic experience at the vineyard where you can experience the joy of the harvest. You can participate in picking grapes, try the presses, and taste the fresh must.',
    description_de: 'Nimm an der Herbstlese teil! Ein authentisches Erlebnis auf dem Weingut, bei dem du die Freude der Ernte erleben kannst. Du kannst bei der Traubenlese helfen, die Pressen ausprobieren und den frischen Most probieren.',
    image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=300&fit=crop',
    price_huf: 10000,
    access_type: 'one_time_purchase',
    access_level: 'one_time_purchase',
    category: 'community',
    creator_id: 'mock-expert-3',
    is_published: true,
    is_featured: false,
    sponsor_name: null,
    sponsor_name_en: null,
    sponsor_name_de: null,
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-01T10:00:00Z'
  },
  // Expert 4's programs
  {
    id: 'mock-program-7',
    title: 'Kosárfonás kezdőknek',
    title_en: 'Basket Weaving for Beginners',
    title_de: 'Korbflechten für Einsteiger',
    description: 'Fonds meg az első kosaradat! Lépésről lépésre megtanítom a fonás alapjait. Természetes fűzfavesszőből dolgozunk, amit együtt készítünk elő. A nap végén saját készítésű kosárral távozol.',
    description_en: 'Weave your first basket! I will teach you the basics of weaving step by step. We will work with natural willow, which we will prepare together. At the end of the day, you will leave with your own handmade basket.',
    description_de: 'Flechte deinen ersten Korb! Ich zeige dir Schritt für Schritt die Grundlagen des Flechtens. Wir arbeiten mit natürlicher Weide, die wir gemeinsam vorbereiten. Am Ende des Tages gehst du mit deinem eigenen handgefertigten Korb nach Hause.',
    image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop',
    price_huf: 9000,
    access_type: 'one_time_purchase',
    access_level: 'one_time_purchase',
    category: 'workshop',
    creator_id: 'mock-expert-4',
    is_published: true,
    is_featured: false,
    sponsor_name: null,
    sponsor_name_en: null,
    sponsor_name_de: null,
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-05T10:00:00Z'
  },
  {
    id: 'mock-program-8',
    title: 'Karácsonyi dekorációk fonása',
    title_en: 'Weaving Christmas Decorations',
    title_de: 'Weihnachtsdekorationen Flechten',
    description: 'Készíts egyedi karácsonyi díszeket! Természetes anyagokból fonunk díszeket, koszorúkat és egyéb karácsonyi dekorációkat. Kreatív, hangulatos délután az ünnepekre készülve.',
    description_en: 'Create unique Christmas decorations! We will weave ornaments, wreaths, and other Christmas decorations from natural materials. A creative, cozy afternoon while preparing for the holidays.',
    description_de: 'Gestalte einzigartige Weihnachtsdekorationen! Wir flechten Ornamente, Kränze und andere Weihnachtsdekorationen aus natürlichen Materialien. Ein kreativer, gemütlicher Nachmittag zur Einstimmung auf die Feiertage.',
    image_url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=300&fit=crop',
    price_huf: 7000,
    access_type: 'one_time_purchase',
    access_level: 'one_time_purchase',
    category: 'workshop',
    creator_id: 'mock-expert-4',
    is_published: true,
    is_featured: false,
    sponsor_name: null,
    sponsor_name_en: null,
    sponsor_name_de: null,
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-10T10:00:00Z'
  },
  // Expert 5's programs
  {
    id: 'mock-program-9',
    title: 'Méhészkedés alapjai',
    title_en: 'Beekeeping Basics',
    title_de: 'Grundlagen der Imkerei',
    description: 'Ismerkedj meg a méhek csodálatos világával! Megtanulod a méhcsalád működését, a kaptárak kezelését és a méz kinyerésének alapjait. Gyakorlati tudást adsz át, amit saját kertedben is alkalmazhatsz.',
    description_en: 'Get to know the wonderful world of bees! You will learn about bee colony dynamics, hive management, and the basics of honey extraction. Practical knowledge that you can apply in your own garden.',
    description_de: 'Lerne die wunderbare Welt der Bienen kennen! Du lernst die Dynamik des Bienenvolks, die Stockverwaltung und die Grundlagen der Honiggewinnung. Praktisches Wissen, das du in deinem eigenen Garten anwenden kannst.',
    image_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop',
    price_huf: 11000,
    access_type: 'one_time_purchase',
    access_level: 'one_time_purchase',
    category: 'sustainability',
    creator_id: 'mock-expert-5',
    is_published: true,
    is_featured: false,
    sponsor_name: null,
    sponsor_name_en: null,
    sponsor_name_de: null,
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-15T10:00:00Z'
  },
  {
    id: 'mock-program-10',
    title: 'Mézpergetés élménynap',
    title_en: 'Honey Harvesting Experience Day',
    title_de: 'Honigernte Erlebnistag',
    description: 'Vegyél részt a mézpergetés hagyományos folyamatában! Együtt szedjük ki a lépeket, használjuk a pergetőt és töltjük üvegekbe a friss mézet. Autentikus élmény a méhészet szívében, ahol hazavihetsz egy üveg saját pergetésű mézet.',
    description_en: 'Participate in the traditional honey harvesting process! Together we will extract the combs, use the extractor, and bottle the fresh honey. An authentic experience in the heart of the apiary where you can take home a jar of your own harvested honey.',
    description_de: 'Erlebe den traditionellen Prozess der Honigernte hautnah! Gemeinsam entnehmen wir die Waben, benutzen die Schleuder und füllen den frischen Honig in Gläser. Ein authentisches Erlebnis im Herzen der Imkerei, bei dem du ein Glas selbst geschleuderten Honig mit nach Hause nehmen kannst.',
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
    price_huf: 14000,
    access_type: 'one_time_purchase',
    access_level: 'one_time_purchase',
    category: 'sustainability',
    creator_id: 'mock-expert-5',
    is_published: true,
    is_featured: false,
    sponsor_name: null,
    sponsor_name_en: null,
    sponsor_name_de: null,
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-20T10:00:00Z'
  },
  // Expert 6's programs - Chef Molnár Balázs
  {
    id: 'mock-program-11',
    title: 'Közösségi Főzőtanfolyam',
    title_en: 'Community Cooking Course',
    title_de: 'Gemeinschaftskochkurs',
    description: 'Tanuld meg a helyi konyha titkait Molnár Balázs séf vezetésével! A Káli Panzió szponzorációjának köszönhetően ingyenesen csatlakozhatsz ehhez a közösségi programhoz. Ismerd meg a szezonális alapanyagokat, a hagyományos magyar ízeket és a modern konyhatechnikákat.',
    description_en: 'Learn the secrets of local cuisine with Chef Balázs Molnár! Thanks to Káli Panzió sponsorship, you can join this community program for free. Discover seasonal ingredients, traditional Hungarian flavors, and modern kitchen techniques.',
    description_de: 'Lerne die Geheimnisse der lokalen Küche mit Küchenchef Balázs Molnár! Dank der Sponsorschaft von Káli Panzió kannst du kostenlos an diesem Gemeinschaftsprogramm teilnehmen. Entdecke saisonale Zutaten, traditionelle ungarische Aromen und moderne Küchentechniken.',
    image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop',
    price_huf: 18000,
    access_type: 'sponsored',
    access_level: 'sponsored',
    category: 'gastronomy',
    creator_id: 'mock-expert-6',
    is_published: true,
    is_featured: true,
    sponsor_name: 'Káli Panzió',
    sponsor_name_en: 'Káli Guesthouse',
    sponsor_name_de: 'Káli Pension',
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-08-01T10:00:00Z'
  },
  {
    id: 'mock-program-12',
    title: 'Szezonális vacsora-élmény',
    title_en: 'Seasonal Dinner Experience',
    title_de: 'Saisonales Dinner-Erlebnis',
    description: 'Fedezd fel a Balaton-felvidék szezonális ízeit egy különleges vacsoraélményen! Molnár Balázs séf bemutatja a helyi termelők legjobb alapanyagait, és közösen elkészítitek a hagyományos ételeket modern csavarral.',
    description_en: 'Discover the seasonal flavors of the Balaton Highlands at a special dinner experience! Chef Balázs Molnár presents the best ingredients from local producers, and together you will prepare traditional dishes with a modern twist.',
    description_de: 'Entdecke die saisonalen Aromen des Balaton-Hochlands bei einem besonderen Dinner-Erlebnis! Küchenchef Balázs Molnár präsentiert die besten Zutaten lokaler Produzenten, und gemeinsam bereitet ihr traditionelle Gerichte mit modernem Twist zu.',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    price_huf: 22000,
    access_type: 'one_time_purchase',
    access_level: 'one_time_purchase',
    category: 'gastronomy',
    creator_id: 'mock-expert-6',
    is_published: true,
    is_featured: false,
    sponsor_name: null,
    sponsor_name_en: null,
    sponsor_name_de: null,
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-08-05T10:00:00Z'
  }
];

// ===== MOCK SPONSORS =====
export interface MockSponsor {
  id: string;
  organization_name: string;
  organization_name_en: string;
  organization_name_de: string;
  contact_name: string;
  email?: string;
  user_role: 'sponsor';
  total_credits: number;
  used_credits: number;
  available_credits: number;
  sponsored_programs: number;
  people_reached: number;
}

export const MOCK_SPONSORS: MockSponsor[] = [
  {
    id: "sponsor-1",
    organization_name: "Káli Panzió",
    organization_name_en: "Káli Guesthouse",
    organization_name_de: "Káli Pension",
    contact_name: "Horváth Mária",
    email: "maria@kalipanzio.hu",
    user_role: "sponsor",
    total_credits: 50000,
    used_credits: 15000,
    available_credits: 35000,
    sponsored_programs: 4,
    people_reached: 127
  },
  {
    id: "sponsor-2",
    organization_name: "Balaton Bio Kft.",
    organization_name_en: "Balaton Bio Ltd.",
    organization_name_de: "Balaton Bio GmbH",
    contact_name: "Szabó Péter",
    email: "peter@balatonbio.hu",
    user_role: "sponsor",
    total_credits: 100000,
    used_credits: 45000,
    available_credits: 55000,
    sponsored_programs: 8,
    people_reached: 312
  },
  {
    id: "sponsor-3",
    organization_name: "Köveskál Önkormányzat",
    organization_name_en: "Köveskál Municipality",
    organization_name_de: "Gemeinde Köveskál",
    contact_name: "Dr. Kiss László",
    email: "polgarmester@koveskal.hu",
    user_role: "sponsor",
    total_credits: 200000,
    used_credits: 78000,
    available_credits: 122000,
    sponsored_programs: 12,
    people_reached: 534
  },
  {
    id: "sponsor-4",
    organization_name: "Tapolca Takarék",
    organization_name_en: "Tapolca Savings Bank",
    organization_name_de: "Tapolca Sparkasse",
    contact_name: "Nagy Katalin",
    email: "info@tapolcatakarek.hu",
    user_role: "sponsor",
    total_credits: 150000,
    used_credits: 62000,
    available_credits: 88000,
    sponsored_programs: 6,
    people_reached: 245
  },
  {
    id: "sponsor-5",
    organization_name: "Badacsony Borászat",
    organization_name_en: "Badacsony Winery",
    organization_name_de: "Badacsony Weingut",
    contact_name: "Varga István",
    email: "info@badacsonyboraszat.hu",
    user_role: "sponsor",
    total_credits: 75000,
    used_credits: 28000,
    available_credits: 47000,
    sponsored_programs: 5,
    people_reached: 189
  }
];

// ===== MOCK MEMBERS =====
export interface MockMember {
  id: string;
  full_name: string;
  email: string;
  user_role: 'member';
  location_city: string;
  active_vouchers: number;
  redeemed_vouchers: number;
  total_savings: number;
}

export const MOCK_MEMBERS: MockMember[] = [
  {
    id: "member-1",
    full_name: "Tóth Eszter",
    email: "demo-tag@wellagora.hu",
    user_role: "member",
    location_city: "Budapest",
    active_vouchers: 3,
    redeemed_vouchers: 5,
    total_savings: 12500
  },
  {
    id: "member-2",
    full_name: "Molnár Gábor",
    email: "gabor.molnar@example.com",
    user_role: "member",
    location_city: "Kővágóörs",
    active_vouchers: 2,
    redeemed_vouchers: 8,
    total_savings: 24000
  },
  {
    id: "member-3",
    full_name: "Fekete Anna",
    email: "anna.fekete@example.com",
    user_role: "member",
    location_city: "Tapolca",
    active_vouchers: 1,
    redeemed_vouchers: 12,
    total_savings: 36500
  },
  {
    id: "member-4",
    full_name: "Varga Zoltán",
    email: "zoltan.varga@example.com",
    user_role: "member",
    location_city: "Badacsonytomaj",
    active_vouchers: 4,
    redeemed_vouchers: 3,
    total_savings: 8500
  },
  {
    id: "member-5",
    full_name: "Kiss Judit",
    email: "judit.kiss@example.com",
    user_role: "member",
    location_city: "Révfülöp",
    active_vouchers: 0,
    redeemed_vouchers: 15,
    total_savings: 45000
  }
];

// ===== ENHANCED MOCK VOUCHERS =====
export interface MockVoucher {
  id: string;
  code: string;
  content_id: string;
  content_title: string;
  member_id: string;
  sponsor_name: string;
  status: 'active' | 'redeemed';
  value_huf: number;
  created_at: string;
  pickup_location: string;
  expires_at?: string;
  redeemed_at?: string;
}

export const MOCK_VOUCHERS: MockVoucher[] = [
  {
    id: "voucher-1",
    code: "WA-2026-K4L1",
    content_id: "mock-program-2",
    content_title: "Kovászkenyér mesterkurzus",
    member_id: "member-1",
    sponsor_name: "Káli Panzió",
    status: "active",
    value_huf: 3500,
    created_at: "2026-01-10T10:00:00Z",
    pickup_location: "A Szakértőnél",
    expires_at: "2026-02-05"
  },
  {
    id: "voucher-2",
    code: "WA-2026-B1O2",
    content_id: "mock-program-9",
    content_title: "Méhészkedés alapjai",
    member_id: "member-1",
    sponsor_name: "Balaton Bio Kft.",
    status: "active",
    value_huf: 3500,
    created_at: "2026-01-08T14:00:00Z",
    pickup_location: "A Szakértőnél",
    expires_at: "2026-01-20"
  },
  {
    id: "voucher-3",
    code: "WA-2026-K0V3",
    content_id: "mock-program-3",
    content_title: "Gyógynövénygyűjtés túra",
    member_id: "member-1",
    sponsor_name: "Köveskál Önkormányzat",
    status: "active",
    value_huf: 2990,
    created_at: "2026-01-05T09:30:00Z",
    pickup_location: "A Szakértőnél",
    expires_at: "2026-02-15"
  },
  {
    id: "voucher-4",
    code: "WA-2026-R3D1",
    content_id: "mock-program-1",
    content_title: "Kemenceépítés alapjai",
    member_id: "member-2",
    sponsor_name: "Káli Panzió",
    status: "redeemed",
    value_huf: 4500,
    created_at: "2025-12-28T10:00:00Z",
    pickup_location: "A Szakértőnél",
    redeemed_at: "2026-01-02"
  },
  {
    id: "voucher-5",
    code: "WA-2026-T4P1",
    content_id: "mock-program-5",
    content_title: "Borkóstoló és pincetúra",
    member_id: "member-3",
    sponsor_name: "Tapolca Takarék",
    status: "redeemed",
    value_huf: 3490,
    created_at: "2025-12-20T15:00:00Z",
    pickup_location: "A Szakértőnél",
    redeemed_at: "2026-01-05"
  },
  {
    id: "voucher-6",
    code: "WA-2026-W8NE",
    content_id: "mock-program-7",
    content_title: "Kosárfonás kezdőknek",
    member_id: "member-2",
    sponsor_name: "Badacsony Borászat",
    status: "active",
    value_huf: 2800,
    created_at: "2026-01-11T08:00:00Z",
    pickup_location: "A Szakértőnél",
    expires_at: "2026-02-20"
  }
];

// ===== MOCK COMMUNITY Q&A =====
export interface MockQuestion {
  id: string;
  question: string;
  question_en: string;
  question_de: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  content?: {
    id: string;
    title: string;
    title_en: string;
    title_de: string;
  };
  answers: {
    id: string;
    answer: string;
    answer_en: string;
    answer_de: string;
    expert: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  }[];
}

export const MOCK_QA: MockQuestion[] = [
  {
    id: 'qa-1',
    question: 'Hogyan kezdjek bele a kovászolásba? Sosem csináltam még.',
    question_en: 'How do I start with sourdough? I have never done it before.',
    question_de: 'Wie fange ich mit Sauerteig an? Ich habe es noch nie gemacht.',
    created_at: '2026-01-10T08:30:00Z',
    user: { first_name: 'Tóth', last_name: 'Eszter', avatar_url: null },
    content: { id: 'mock-program-2', title: 'Kovászkenyér mesterkurzus', title_en: 'Sourdough Masterclass', title_de: 'Sauerteig-Meisterkurs' },
    answers: [
      {
        id: 'ans-1',
        answer: 'Nézd meg a programom videóját! A kezdéshez csak liszt és víz kell. Örömmel várlak a következő workshopon is!',
        answer_en: 'Check out my program video! To start, you only need flour and water. I would be happy to see you at my next workshop!',
        answer_de: 'Schau dir mein Programmvideo an! Zum Anfangen brauchst du nur Mehl und Wasser. Ich freue mich, dich beim nächsten Workshop zu sehen!',
        expert: { first_name: 'István', last_name: 'Kovács', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' }
      }
    ]
  },
  {
    id: 'qa-2',
    question: 'Milyen gyógynövényeket gyűjthetek télen a környéken?',
    question_en: 'What medicinal herbs can I forage in winter in the region?',
    question_de: 'Welche Heilkräuter kann ich im Winter in der Region sammeln?',
    created_at: '2026-01-08T14:20:00Z',
    user: { first_name: 'Molnár', last_name: 'Gábor', avatar_url: null },
    content: { id: 'mock-program-3', title: 'Gyógynövénygyűjtés túra', title_en: 'Herb Foraging Tour', title_de: 'Kräutersammelwanderung' },
    answers: [
      {
        id: 'ans-2',
        answer: 'Télen is sok mindent találsz! Csipkebogyó, fagyöngy, fekete bodza kérge. Gyere el a téli túrámra!',
        answer_en: 'You can find plenty in winter too! Rosehip, mistletoe, elderberry bark. Join my winter tour!',
        answer_de: 'Im Winter findest du auch viel! Hagebutte, Mistel, Holunderrinde. Komm zu meiner Wintertour!',
        expert: { first_name: 'Éva', last_name: 'Nagy', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face' }
      }
    ]
  },
  {
    id: 'qa-3',
    question: 'Melyik szőlőfajta illik legjobban a vulkáni talajhoz?',
    question_en: 'Which grape variety is best suited for volcanic soil?',
    question_de: 'Welche Rebsorte eignet sich am besten für vulkanischen Boden?',
    created_at: '2026-01-05T11:45:00Z',
    user: { first_name: 'Fekete', last_name: 'Anna', avatar_url: null },
    answers: []
  },
  {
    id: 'qa-4',
    question: 'Hol vásárolhatok jó minőségű fűzfavesszőt kosárfonáshoz?',
    question_en: 'Where can I buy good quality willow rods for basket weaving?',
    question_de: 'Wo kann ich gute Weidenruten zum Korbflechten kaufen?',
    created_at: '2026-01-03T16:00:00Z',
    user: { first_name: 'Varga', last_name: 'Zoltán', avatar_url: null },
    content: { id: 'mock-program-7', title: 'Kosárfonás kezdőknek', title_en: 'Basket Weaving for Beginners', title_de: 'Korbflechten für Anfänger' },
    answers: [
      {
        id: 'ans-4',
        answer: 'A programomon biztosítom az anyagot, de ha magadnak szeretnél, a helyi piacomon találsz. Üdv, Anna',
        answer_en: 'I provide the materials in my program, but if you want your own, you can find them at my local market. Regards, Anna',
        answer_de: 'Ich stelle die Materialien in meinem Programm zur Verfügung, aber wenn du eigene möchtest, findest du sie auf meinem lokalen Markt. Grüße, Anna',
        expert: { first_name: 'Anna', last_name: 'Tóth', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' }
      }
    ]
  }
];

// Helper to get localized Q&A
export const getLocalizedQuestion = (q: MockQuestion, language: string): string => {
  if (language === 'en') return q.question_en || q.question;
  if (language === 'de') return q.question_de || q.question;
  return q.question;
};

export const getLocalizedAnswer = (a: MockQuestion['answers'][0], language: string): string => {
  if (language === 'en') return a.answer_en || a.answer;
  if (language === 'de') return a.answer_de || a.answer;
  return a.answer;
};

// ===== SOCIAL FEED POSTS =====
export type PostType = 'expert_tip' | 'question' | 'success_story' | 'announcement' | 'wellbot_answer';

export interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'member' | 'expert' | 'wellbot';
  authorBadge?: string;
  content: string;
  createdAt: string;
  isExpertAnswer?: boolean;
}

export interface FeedPost {
  id: string;
  type: PostType;
  authorId: string;
  authorName: string;
  authorRole: 'member' | 'expert' | 'sponsor' | 'wellbot';
  authorBadge?: string;
  content: string;
  imageUrl?: string;
  programKeywords?: string[];
  relatedProgramId?: string;
  createdAt: string;
  likes: number;
  isLikedByMe: boolean;
  comments: FeedComment[];
  isWellBotResponse?: boolean;
  replyToPostId?: string;
}

export const MOCK_FEED_POSTS: FeedPost[] = [
  // POST 1 - Expert Tip (Today, 2 hours ago)
  {
    id: 'post-1',
    type: 'expert_tip',
    authorId: 'mock-expert-1',
    authorName: 'Kovács István',
    authorRole: 'expert',
    authorBadge: 'Kemencemester',
    content: 'A mai páratartalom tökéletes a kovásznak! 🌡️ Itt egy kép a reggeli sütésről. Tipp: ha ragacsos a tészta, ne adj hozzá több lisztet - inkább várd ki a pihenőidőt.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
    programKeywords: ['kovász', 'kenyér', 'sütés'],
    relatedProgramId: 'mock-program-2',
    createdAt: '2026-01-13T08:30:00Z',
    likes: 24,
    isLikedByMe: false,
    comments: [
      {
        id: 'c1',
        authorId: 'member-1',
        authorName: 'Tóth Eszter',
        authorRole: 'member',
        content: 'Köszönöm a tippet! Ma délután megpróbálom. 🙏',
        createdAt: '2026-01-13T09:15:00Z'
      }
    ]
  },
  // POST 2 - Member Question (Today, 4 hours ago)
  {
    id: 'post-2',
    type: 'question',
    authorId: 'member-2',
    authorName: 'Molnár Gábor',
    authorRole: 'member',
    content: 'Sziasztok! Tudja valaki, hol kapok Káli-medencei kecskesajtot? A piacon nem találtam a hétvégén. 🧀',
    programKeywords: ['sajt', 'kecske', 'helyi'],
    createdAt: '2026-01-13T06:45:00Z',
    likes: 8,
    isLikedByMe: false,
    comments: [
      {
        id: 'c2',
        authorId: 'mock-expert-2',
        authorName: 'Nagy Éva',
        authorRole: 'expert',
        authorBadge: 'Gyógynövényszakértő',
        content: 'Szia Gábor! A Köveskáli Sajtműhelyben kapható, szerdán és szombaton van nyitva. Vagy gyere el a sajtkészítő programomra, és készítsd el magadnak! 😊',
        createdAt: '2026-01-13T07:30:00Z',
        isExpertAnswer: true
      },
      {
        id: 'c3',
        authorId: 'member-3',
        authorName: 'Fekete Anna',
        authorRole: 'member',
        content: 'A Tapolcai biopiacon is szokott lenni pénteken!',
        createdAt: '2026-01-13T08:00:00Z'
      }
    ]
  },
  // WellBot response to cheese question
  {
    id: 'post-2-wellbot',
    type: 'wellbot_answer',
    authorId: 'wellbot',
    authorName: 'WellBot',
    authorRole: 'wellbot',
    authorBadge: 'AI Asszisztens',
    content: '🧀 Ha érdekel a sajtkészítés, van egy remek programunk! Nagy Éva Gyógynövényszakértő "Házi teakeverékek készítése" kurzusán megismerheted a helyi ízeket. Ha pedig sajtot szeretnél, a Köveskáli Sajtműhelyben vársz - és nézd meg a helyi termelői programjainkat is!',
    relatedProgramId: 'mock-program-4',
    createdAt: '2026-01-13T07:35:00Z',
    likes: 5,
    isLikedByMe: false,
    isWellBotResponse: true,
    replyToPostId: 'post-2',
    comments: []
  },
  // POST 3 - Expert Tip with Image (Yesterday)
  {
    id: 'post-3',
    type: 'expert_tip',
    authorId: 'mock-expert-2',
    authorName: 'Nagy Éva',
    authorRole: 'expert',
    authorBadge: 'Gyógynövényszakértő',
    content: 'A kertben már bújnak a tavaszi fűszernövények! 🌿 Most van itt az ideje előkészíteni a magágyást. Aki szeretne saját fűszerkertet, jelentkezzen a tavaszi programomra!',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    programKeywords: ['fűszer', 'kert', 'növény'],
    relatedProgramId: 'mock-program-3',
    createdAt: '2026-01-12T14:20:00Z',
    likes: 45,
    isLikedByMe: true,
    comments: []
  },
  // POST 4 - Member Question (2 days ago)
  {
    id: 'post-4',
    type: 'question',
    authorId: 'member-1',
    authorName: 'Tóth Eszter',
    authorRole: 'member',
    content: 'Mikor lesz a következő közös főzés? 🍳 Az utolsó nagyon jó volt, szeretném hozni a párom is!',
    programKeywords: ['főzés', 'közös'],
    createdAt: '2026-01-11T18:30:00Z',
    likes: 12,
    isLikedByMe: false,
    comments: [
      {
        id: 'c4',
        authorId: 'mock-expert-6',
        authorName: 'Molnár Balázs',
        authorRole: 'expert',
        authorBadge: 'Séf',
        content: 'Január 20-án, szombaton lesz a következő! Tésztakészítés lesz a téma. Hozd nyugodtan! 👨‍👩‍👧',
        createdAt: '2026-01-11T19:00:00Z',
        isExpertAnswer: true
      }
    ]
  },
  // WellBot response to cooking question
  {
    id: 'post-4-wellbot',
    type: 'wellbot_answer',
    authorId: 'wellbot',
    authorName: 'WellBot',
    authorRole: 'wellbot',
    authorBadge: 'AI Asszisztens',
    content: '👨‍🍳 Addig is, amíg vársz a közös főzésre, nézd meg Kovács István "Kovászkenyér mesterkurzus" programját! Lépésről lépésre megtanulhatod a tökéletes kenyérsütést. A Helyi Értékek Programja támogatásával most ingyen elérhető!',
    relatedProgramId: 'mock-program-2',
    createdAt: '2026-01-11T19:15:00Z',
    likes: 8,
    isLikedByMe: false,
    isWellBotResponse: true,
    replyToPostId: 'post-4',
    comments: [
      {
        id: 'c-wb-1',
        authorId: 'member-1',
        authorName: 'Tóth Eszter',
        authorRole: 'member',
        content: 'Köszi WellBot! Már be is iratkoztam! 🙌',
        createdAt: '2026-01-11T20:00:00Z'
      }
    ]
  },
  // POST 5 - Success Story (3 days ago)
  {
    id: 'post-5',
    type: 'success_story',
    authorId: 'member-4',
    authorName: 'Varga Zoltán',
    authorRole: 'member',
    content: 'Elkészült az első kemencém a Kemenceépítés program után! 🔥 3 hónap munka, de megérte. Tegnap sütöttem benne az első pizzát - a család imádta! Köszönöm Kovács Istvánnak a türelmet és a tippeket!',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    relatedProgramId: 'mock-program-1',
    createdAt: '2026-01-10T16:00:00Z',
    likes: 89,
    isLikedByMe: true,
    comments: [
      {
        id: 'c5',
        authorId: 'mock-expert-1',
        authorName: 'Kovács István',
        authorRole: 'expert',
        authorBadge: 'Kemencemester',
        content: 'Zoli, gyönyörű munka! 👏 Büszke vagyok rád. Következő lépés: kenyérsütés kemencében - gyere a haladó kurzusra!',
        createdAt: '2026-01-10T17:30:00Z',
        isExpertAnswer: true
      }
    ]
  },
  // POST 6 - Announcement (1 week ago)
  {
    id: 'post-6',
    type: 'announcement',
    authorId: 'admin-1',
    authorName: 'WellAgora Csapat',
    authorRole: 'sponsor',
    authorBadge: 'Platform',
    content: '🎉 Köszönjük, hogy velünk vagytok! A közösségünk átlépte a 100 aktív tagot! Különösen hálásak vagyunk támogatóinknak - a Káli Panziónak és a Balaton Bio-nak - akik lehetővé teszik az ingyenes programokat. Hajrá, 2026! 🚀',
    createdAt: '2026-01-06T12:00:00Z',
    likes: 127,
    isLikedByMe: true,
    comments: []
  }
];

// ===== DEMO ACCOUNTS =====
export interface DemoAccount {
  email: string;
  password: string;
  role: 'member' | 'expert' | 'sponsor' | 'admin';
  name: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "demo-tag@wellagora.hu", password: "Demo123!", role: "member", name: "Tag (Tóth Eszter)" },
  { email: "demo-expert@wellagora.hu", password: "Demo123!", role: "expert", name: "Szakértő (Kovács J.)" },
  { email: "demo-sponsor@wellagora.hu", password: "Demo123!", role: "sponsor", name: "Szponzor (Káli Panzió)" },
  { email: "admin@wellagora.hu", password: "Admin123!", role: "admin", name: "Admin" }
];

// Helper function to get programs by expert
export const getMockProgramsByExpert = (expertId: string): MockProgram[] => {
  return MOCK_PROGRAMS.filter(p => p.creator_id === expertId);
};

// Helper function to get expert by ID
export const getMockExpertById = (expertId: string): MockExpert | undefined => {
  return MOCK_EXPERTS.find(e => e.id === expertId);
};

// Helper to attach creator to program
export const getMockProgramsWithCreators = (): (MockProgram & { creator: MockExpert | undefined })[] => {
  return MOCK_PROGRAMS.map(program => ({
    ...program,
    creator: MOCK_EXPERTS.find(e => e.id === program.creator_id)
  }));
};

// Helper to get localized expert name
export const getLocalizedExpertName = (expert: MockExpert, language: string): { firstName: string; lastName: string } => {
  if (language === 'en') {
    return { firstName: expert.first_name_en, lastName: expert.last_name_en };
  }
  if (language === 'de') {
    return { firstName: expert.first_name_de, lastName: expert.last_name_de };
  }
  return { firstName: expert.first_name, lastName: expert.last_name };
};

// Helper to get localized sponsor name
export const getLocalizedSponsorName = (program: MockProgram, language: string): string | null => {
  if (!program.sponsor_name) return null;
  if (language === 'en') return program.sponsor_name_en || program.sponsor_name;
  if (language === 'de') return program.sponsor_name_de || program.sponsor_name;
  return program.sponsor_name;
};

// Helper to get localized organization name
export const getLocalizedOrgName = (sponsor: MockSponsor, language: string): string => {
  if (language === 'en') return sponsor.organization_name_en || sponsor.organization_name;
  if (language === 'de') return sponsor.organization_name_de || sponsor.organization_name;
  return sponsor.organization_name;
};

// Currency conversion rates (approximate)
const HUF_TO_EUR_RATE = 400;

// Helper to format price based on language/region
export const formatPriceByLanguage = (priceHuf: number, language: string): { price: string; originalPrice?: string } => {
  if (language === 'hu') {
    return {
      price: priceHuf === 0 ? '0 Ft' : `${priceHuf.toLocaleString('hu-HU')} Ft`,
      originalPrice: priceHuf > 0 ? `${priceHuf.toLocaleString('hu-HU')} Ft` : undefined
    };
  }
  // For EN/DE, convert to EUR
  const priceEur = Math.round(priceHuf / HUF_TO_EUR_RATE);
  return {
    price: priceHuf === 0 ? '0 €' : `${priceEur} €`,
    originalPrice: priceHuf > 0 ? `${priceEur} €` : undefined
  };
};

// Helper to get localized program title
export const getLocalizedProgramTitle = (program: MockProgram, language: string): string => {
  if (language === 'en') return program.title_en || program.title;
  if (language === 'de') return program.title_de || program.title;
  return program.title;
};

// Helper to get localized program description
export const getLocalizedProgramDescription = (program: MockProgram, language: string): string => {
  if (language === 'en') return program.description_en || program.description;
  if (language === 'de') return program.description_de || program.description;
  return program.description;
};

// Helper to get vouchers for a specific member
export const getMockVouchersForMember = (memberId: string): MockVoucher[] => {
  return MOCK_VOUCHERS.filter(v => v.member_id === memberId);
};

// Helper to find voucher by code
export const findVoucherByCode = (code: string): MockVoucher | undefined => {
  return MOCK_VOUCHERS.find(v => v.code.toUpperCase() === code.toUpperCase());
};

// Helper to get sponsor by ID
export const getMockSponsorById = (sponsorId: string): MockSponsor | undefined => {
  return MOCK_SPONSORS.find(s => s.id === sponsorId);
};

// Helper to get demo account sponsor (for demo login)
export const getDemoSponsorData = (): MockSponsor => {
  return MOCK_SPONSORS[0]; // Káli Panzió
};
