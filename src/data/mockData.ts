// Mock Data for Testing - Used when database is empty
// Names are localized based on active language

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
    image_url: 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop',
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
    image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop',
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
    image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
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
  }
];

export const MOCK_VOUCHERS: MockVoucher[] = [
  {
    id: 'mock-voucher-1',
    code: 'WA-2026-XK4M',
    content_id: 'mock-program-1',
    content_title: 'Kemenceépítés alapjai',
    status: 'active',
    created_at: '2026-01-05T10:00:00Z',
    pickup_location: 'A Mesternél'
  },
  {
    id: 'mock-voucher-2',
    code: 'WA-2026-B7PQ',
    content_id: 'mock-program-3',
    content_title: 'Gyógynövénygyűjtés túra',
    status: 'active',
    created_at: '2026-01-03T14:30:00Z',
    pickup_location: 'A Mesternél'
  }
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
