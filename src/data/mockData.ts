// Mock Data for Testing - Used when database is empty

export interface MockExpert {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  expert_title: string;
  expert_title_en: string;
  expert_title_de: string;
  bio: string;
  bio_en: string;
  bio_de: string;
  expert_bio_long: string;
  location_city: string;
  is_verified_expert: boolean;
  expertise_areas: string[];
  created_at: string;
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
  sponsor_logo_url: string | null;
  is_sponsored: boolean;
  created_at: string;
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
    first_name: 'Kovács',
    last_name: 'István',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Kemencemester',
    expert_title_en: 'Brick Oven Master',
    expert_title_de: 'Ofenmeister',
    bio: 'Több mint 20 éve építek kemencéket a Káli-medencében.',
    bio_en: 'Building ovens in the Káli Basin for over 20 years.',
    bio_de: 'Baue seit über 20 Jahren Öfen im Káli-Becken.',
    expert_bio_long: 'A hagyományos kemenceépítés mestere vagyok. Gyermekkorom óta tanulom ezt a mesterséget nagyapámtól, aki a régió leghíresebb kemenceépítője volt. Minden kemence egyedi, mint az alkotója.',
    location_city: 'Köveskál',
    is_verified_expert: true,
    expertise_areas: ['Kemenceépítés', 'Kenyérsütés', 'Hagyományőrzés'],
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'mock-expert-2',
    first_name: 'Nagy',
    last_name: 'Éva',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Gyógynövényszakértő',
    expert_title_en: 'Herbalist Expert',
    expert_title_de: 'Kräuterexpertin',
    bio: 'A Balaton-felvidék gyógynövényeinek szakértője.',
    bio_en: 'Expert in medicinal herbs of the Balaton Uplands.',
    bio_de: 'Expertin für Heilkräuter des Balaton-Hochlandes.',
    expert_bio_long: 'Évtizedek óta gyűjtöm és dolgozom fel a helyi gyógynövényeket. Workshopjaimon megosztom a tudásomat a természet gyógyító erejéről.',
    location_city: 'Mindszentkálla',
    is_verified_expert: true,
    expertise_areas: ['Gyógynövények', 'Teakeverékek', 'Természetgyógyászat'],
    created_at: '2024-02-20T10:00:00Z'
  },
  {
    id: 'mock-expert-3',
    first_name: 'Szabó',
    last_name: 'Péter',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Borkészítő Mester',
    expert_title_en: 'Winemaking Master',
    expert_title_de: 'Weinmeister',
    bio: 'Családi pincészetünk harmadik generációs borásza.',
    bio_en: 'Third generation winemaker of our family winery.',
    bio_de: 'Winzer der dritten Generation unseres Familienweinguts.',
    expert_bio_long: 'A Káli-medence vulkanikus talaja egyedi borokat ad. Megtanítom a résztvevőket a helyi szőlőfajták megismerésére és a hagyományos borkészítés titkaira.',
    location_city: 'Szentbékkálla',
    is_verified_expert: true,
    expertise_areas: ['Borkészítés', 'Szőlészet', 'Borkóstoló'],
    created_at: '2024-03-10T10:00:00Z'
  },
  {
    id: 'mock-expert-4',
    first_name: 'Tóth',
    last_name: 'Anna',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Kosárfonó Művész',
    expert_title_en: 'Basket Weaving Artist',
    expert_title_de: 'Korbflechtkünstlerin',
    bio: 'A hagyományos fonástechnikák megőrzője.',
    bio_en: 'Keeper of traditional weaving techniques.',
    bio_de: 'Bewahrerin traditioneller Flechttechniken.',
    expert_bio_long: 'A fűzfavessző fonás évszázados hagyományát viszem tovább. Minden kosár egy történet - megtanítom, hogyan mesélj a te kezeddel is.',
    location_city: 'Kékkút',
    is_verified_expert: true,
    expertise_areas: ['Kosárfonás', 'Kézművesség', 'Hagyományőrzés'],
    created_at: '2024-04-05T10:00:00Z'
  },
  {
    id: 'mock-expert-5',
    first_name: 'Kiss',
    last_name: 'Gábor',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    expert_title: 'Méhész Mester',
    expert_title_en: 'Beekeeper Master',
    expert_title_de: 'Imkermeister',
    bio: 'Fenntartható méhészet és méztermelés.',
    bio_en: 'Sustainable beekeeping and honey production.',
    bio_de: 'Nachhaltige Imkerei und Honigproduktion.',
    expert_bio_long: 'A méhek csodálatos világába kalauzollak. Megtanítom, hogyan gondozd a saját kaptáraidat és élvezd a méhészet gyümölcseit.',
    location_city: 'Balatonhenye',
    is_verified_expert: true,
    expertise_areas: ['Méhészet', 'Mézfeldolgozás', 'Ökológia'],
    created_at: '2024-05-01T10:00:00Z'
  }
];

export const MOCK_PROGRAMS: MockProgram[] = [
  // Expert 1's programs (Kovács István - Kemencemester)
  {
    id: 'mock-program-1',
    title: 'Kemenceépítés alapjai',
    title_en: 'Brick Oven Building Basics',
    title_de: 'Grundlagen des Ofenbaus',
    description: 'Tanuld meg a hagyományos kemenceépítés fortélyait!',
    description_en: 'Learn the secrets of traditional oven building!',
    description_de: 'Lerne die Geheimnisse des traditionellen Ofenbaus!',
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
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-06-01T10:00:00Z'
  },
  {
    id: 'mock-program-2',
    title: 'Kovászkenyér mesterkurzus',
    title_en: 'Sourdough Bread Masterclass',
    title_de: 'Sauerteigbrot Meisterkurs',
    description: 'A tökéletes kovászkenyér titkai a kemencében.',
    description_en: 'Secrets of perfect sourdough bread in a brick oven.',
    description_de: 'Geheimnisse des perfekten Sauerteigbrots im Ofen.',
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
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-06-10T10:00:00Z'
  },
  // Expert 2's programs (Nagy Éva - Gyógynövényszakértő)
  {
    id: 'mock-program-3',
    title: 'Gyógynövénygyűjtés túra',
    title_en: 'Medicinal Herb Foraging Tour',
    title_de: 'Kräutersammeltour',
    description: 'Fedezd fel a helyi gyógynövényeket szakértő vezetésével!',
    description_en: 'Discover local medicinal herbs with an expert guide!',
    description_de: 'Entdecke lokale Heilkräuter mit einer Expertin!',
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
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-06-15T10:00:00Z'
  },
  {
    id: 'mock-program-4',
    title: 'Házi teakeverékek készítése',
    title_en: 'Homemade Tea Blending',
    title_de: 'Hausteemischungen Zubereiten',
    description: 'Készítsd el a saját egyedi teakeverékedet!',
    description_en: 'Create your own unique tea blend!',
    description_de: 'Erstelle deine eigene Teemischung!',
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
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-06-20T10:00:00Z'
  },
  // Expert 3's programs (Szabó Péter - Borkészítő)
  {
    id: 'mock-program-5',
    title: 'Borkóstoló és pincetúra',
    title_en: 'Wine Tasting and Cellar Tour',
    title_de: 'Weinprobe und Kellerführung',
    description: 'Ismerd meg a Káli-medence borait!',
    description_en: 'Discover the wines of the Káli Basin!',
    description_de: 'Entdecke die Weine des Káli-Beckens!',
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
    sponsor_logo_url: null,
    is_sponsored: true,
    created_at: '2024-06-25T10:00:00Z'
  },
  {
    id: 'mock-program-6',
    title: 'Szüret a szőlőben',
    title_en: 'Harvest in the Vineyard',
    title_de: 'Ernte im Weinberg',
    description: 'Vegyél részt az őszi szüreten!',
    description_en: 'Participate in the autumn harvest!',
    description_de: 'Nimm an der Herbsternte teil!',
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
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-01T10:00:00Z'
  },
  // Expert 4's programs (Tóth Anna - Kosárfonó)
  {
    id: 'mock-program-7',
    title: 'Kosárfonás kezdőknek',
    title_en: 'Basket Weaving for Beginners',
    title_de: 'Korbflechten für Anfänger',
    description: 'Fonds meg az első kosaradat!',
    description_en: 'Weave your first basket!',
    description_de: 'Flechte deinen ersten Korb!',
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
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-05T10:00:00Z'
  },
  {
    id: 'mock-program-8',
    title: 'Karácsonyi dekorációk fonása',
    title_en: 'Weaving Christmas Decorations',
    title_de: 'Weihnachtsdekorationen Flechten',
    description: 'Készíts egyedi karácsonyi díszeket!',
    description_en: 'Create unique Christmas decorations!',
    description_de: 'Erstelle einzigartige Weihnachtsdekorationen!',
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
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-10T10:00:00Z'
  },
  // Expert 5's programs (Kiss Gábor - Méhész)
  {
    id: 'mock-program-9',
    title: 'Méhészkedés alapjai',
    title_en: 'Beekeeping Basics',
    title_de: 'Grundlagen der Imkerei',
    description: 'Ismerkedj meg a méhek csodálatos világával!',
    description_en: 'Get to know the wonderful world of bees!',
    description_de: 'Lerne die wunderbare Welt der Bienen kennen!',
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
    sponsor_logo_url: null,
    is_sponsored: false,
    created_at: '2024-07-15T10:00:00Z'
  },
  {
    id: 'mock-program-10',
    title: 'Mézpergetés élménynap',
    title_en: 'Honey Harvesting Experience',
    title_de: 'Honigerntetag',
    description: 'Vegyél részt a mézpergetés hagyományos folyamatában!',
    description_en: 'Participate in the traditional honey harvesting process!',
    description_de: 'Nimm am traditionellen Honigernten teil!',
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
    pickup_location: 'Kovács István Műhelye, Köveskál'
  },
  {
    id: 'mock-voucher-2',
    code: 'WA-2026-B7PQ',
    content_id: 'mock-program-3',
    content_title: 'Gyógynövénygyűjtés túra',
    status: 'active',
    created_at: '2026-01-03T14:30:00Z',
    pickup_location: 'Nagy Éva Kertje, Mindszentkálla'
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
