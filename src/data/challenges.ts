// Challenge data for the sustainability platform
export interface Challenge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  category: "energy" | "transport" | "food" | "waste" | "community" | "innovation" | "water" | "biodiversity" | "circular-economy" | "green-finance";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  durationKey: string;
  pointsReward: number;
  participants: number;
  completionRate: number;
  sponsor?: {
    name: string;
    logo: string;
    sponsorUserId?: string;
    organizationId?: string;
  };
  stepsKeys: string[];
  tipsKeys: string[];
  impact: {
    co2Saved: number;
    treesEquivalent: number;
  };
  participants_preview: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
}

export const challenges: Challenge[] = [
  // Alapprogram - Core Community Programs
  {
    id: "kali-muhely",
    titleKey: "challenges.kaliMuhely.title",
    descriptionKey: "challenges.kaliMuhely.description",
    longDescriptionKey: "challenges.kaliMuhely.longDescription",
    category: "community",
    difficulty: "beginner",
    durationKey: "challenges.duration.monthly",
    pointsReward: 150,
    participants: 45,
    completionRate: 92,
    stepsKeys: [
      "challenges.kaliMuhely.steps.registration",
      "challenges.kaliMuhely.steps.participation",
      "challenges.kaliMuhely.steps.sharing"
    ],
    tipsKeys: [
      "challenges.kaliMuhely.tips.bring_ideas",
      "challenges.kaliMuhely.tips.connect"
    ],
    impact: {
      co2Saved: 5,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Kovács Anna", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Nagy Péter", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "tudas-hid",
    titleKey: "challenges.tudasHid.title",
    descriptionKey: "challenges.tudasHid.description",
    longDescriptionKey: "challenges.tudasHid.longDescription",
    category: "community",
    difficulty: "intermediate",
    durationKey: "challenges.duration.monthly",
    pointsReward: 200,
    participants: 32,
    completionRate: 88,
    stepsKeys: [
      "challenges.tudasHid.steps.mentor",
      "challenges.tudasHid.steps.share_skills",
      "challenges.tudasHid.steps.learn"
    ],
    tipsKeys: [
      "challenges.tudasHid.tips.patience",
      "challenges.tudasHid.tips.mutual_learning"
    ],
    impact: {
      co2Saved: 8,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Szabó István", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Tóth Katalin", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "kali-kozos-kert",
    titleKey: "challenges.kaliKozosKert.title",
    descriptionKey: "challenges.kaliKozosKert.description",
    longDescriptionKey: "challenges.kaliKozosKert.longDescription",
    category: "community",
    difficulty: "beginner",
    durationKey: "challenges.duration.ongoing",
    pointsReward: 180,
    participants: 67,
    completionRate: 85,
    stepsKeys: [
      "challenges.kaliKozosKert.steps.join",
      "challenges.kaliKozosKert.steps.cultivate",
      "challenges.kaliKozosKert.steps.harvest"
    ],
    tipsKeys: [
      "challenges.kaliKozosKert.tips.seasonal",
      "challenges.kaliKozosKert.tips.share_knowledge"
    ],
    impact: {
      co2Saved: 15,
      treesEquivalent: 2
    },
    participants_preview: [
      { id: "1", name: "Horváth Mária", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Kiss József", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
      { id: "3", name: "Varga Eszter", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "szomszed-segit",
    titleKey: "challenges.szomszedSegit.title",
    descriptionKey: "challenges.szomszedSegit.description",
    longDescriptionKey: "challenges.szomszedSegit.longDescription",
    category: "community",
    difficulty: "beginner",
    durationKey: "challenges.duration.ongoing",
    pointsReward: 120,
    participants: 89,
    completionRate: 94,
    stepsKeys: [
      "challenges.szomszedSegit.steps.register",
      "challenges.szomszedSegit.steps.offer_help",
      "challenges.szomszedSegit.steps.receive_help"
    ],
    tipsKeys: [
      "challenges.szomszedSegit.tips.small_acts",
      "challenges.szomszedSegit.tips.reciprocity"
    ],
    impact: {
      co2Saved: 12,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Molnár Gábor", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Balogh Éva", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "kali-tortenetek",
    titleKey: "challenges.kaliTortenetek.title",
    descriptionKey: "challenges.kaliTortenetek.description",
    longDescriptionKey: "challenges.kaliTortenetek.longDescription",
    category: "community",
    difficulty: "beginner",
    durationKey: "challenges.duration.monthly",
    pointsReward: 140,
    participants: 54,
    completionRate: 90,
    stepsKeys: [
      "challenges.kaliTortenetek.steps.gather",
      "challenges.kaliTortenetek.steps.share_stories",
      "challenges.kaliTortenetek.steps.document"
    ],
    tipsKeys: [
      "challenges.kaliTortenetek.tips.listen",
      "challenges.kaliTortenetek.tips.preserve"
    ],
    impact: {
      co2Saved: 3,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Németh László", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Farkas Ildikó", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  // Kreatív ötletek - Creative Ideas
  {
    id: "kali-konyhak",
    titleKey: "challenges.kaliKonyhak.title",
    descriptionKey: "challenges.kaliKonyhak.description",
    longDescriptionKey: "challenges.kaliKonyhak.longDescription",
    category: "food",
    difficulty: "beginner",
    durationKey: "challenges.duration.monthly",
    pointsReward: 160,
    participants: 38,
    completionRate: 87,
    stepsKeys: [
      "challenges.kaliKonyhak.steps.attend",
      "challenges.kaliKonyhak.steps.cook_together",
      "challenges.kaliKonyhak.steps.share_recipes"
    ],
    tipsKeys: [
      "challenges.kaliKonyhak.tips.local_ingredients",
      "challenges.kaliKonyhak.tips.traditional_recipes"
    ],
    impact: {
      co2Saved: 10,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Papp Judit", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Takács András", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "mestersegek-ejszakaja",
    titleKey: "challenges.mestersegekEjszakaja.title",
    descriptionKey: "challenges.mestersegekEjszakaja.description",
    longDescriptionKey: "challenges.mestersegekEjszakaja.longDescription",
    category: "innovation",
    difficulty: "intermediate",
    durationKey: "challenges.duration.1_day",
    pointsReward: 200,
    participants: 72,
    completionRate: 91,
    stepsKeys: [
      "challenges.mestersegekEjszakaja.steps.register",
      "challenges.mestersegekEjszakaja.steps.learn_craft",
      "challenges.mestersegekEjszakaja.steps.network"
    ],
    tipsKeys: [
      "challenges.mestersegekEjszakaja.tips.try_new",
      "challenges.mestersegekEjszakaja.tips.connect_artisans"
    ],
    impact: {
      co2Saved: 5,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Lakatos Zsófia", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Rácz Tamás", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
      { id: "3", name: "Simon Rita", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "kali-tortenetek-tuz",
    titleKey: "challenges.kaliTortenetekTuz.title",
    descriptionKey: "challenges.kaliTortenetekTuz.description",
    longDescriptionKey: "challenges.kaliTortenetekTuz.longDescription",
    category: "community",
    difficulty: "beginner",
    durationKey: "challenges.duration.seasonal",
    pointsReward: 130,
    participants: 48,
    completionRate: 88,
    stepsKeys: [
      "challenges.kaliTortenetekTuz.steps.gather",
      "challenges.kaliTortenetekTuz.steps.share",
      "challenges.kaliTortenetekTuz.steps.connect"
    ],
    tipsKeys: [
      "challenges.kaliTortenetekTuz.tips.warm_clothes",
      "challenges.kaliTortenetekTuz.tips.bring_snack"
    ],
    impact: {
      co2Saved: 4,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Pintér Mónika", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Gál Norbert", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "szezonalis-unnepek",
    titleKey: "challenges.szezonalisUnnepek.title",
    descriptionKey: "challenges.szezonalisUnnepek.description",
    longDescriptionKey: "challenges.szezonalisUnnepek.longDescription",
    category: "community",
    difficulty: "beginner",
    durationKey: "challenges.duration.seasonal",
    pointsReward: 170,
    participants: 95,
    completionRate: 93,
    stepsKeys: [
      "challenges.szezonalisUnnepek.steps.participate",
      "challenges.szezonalisUnnepek.steps.celebrate",
      "challenges.szezonalisUnnepek.steps.contribute"
    ],
    tipsKeys: [
      "challenges.szezonalisUnnepek.tips.family",
      "challenges.szezonalisUnnepek.tips.traditions"
    ],
    impact: {
      co2Saved: 7,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Novák Petra", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Barna Mihály", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
      { id: "3", name: "Fekete Judit", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "kali-csere-bere",
    titleKey: "challenges.kaliCsereBere.title",
    descriptionKey: "challenges.kaliCsereBere.description",
    longDescriptionKey: "challenges.kaliCsereBere.longDescription",
    category: "circular-economy",
    difficulty: "beginner",
    durationKey: "challenges.duration.monthly",
    pointsReward: 140,
    participants: 61,
    completionRate: 84,
    stepsKeys: [
      "challenges.kaliCsereBere.steps.bring_items",
      "challenges.kaliCsereBere.steps.exchange",
      "challenges.kaliCsereBere.steps.community"
    ],
    tipsKeys: [
      "challenges.kaliCsereBere.tips.quality",
      "challenges.kaliCsereBere.tips.fair_exchange"
    ],
    impact: {
      co2Saved: 18,
      treesEquivalent: 2
    },
    participants_preview: [
      { id: "1", name: "Varga Zsolt", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Kovács Erika", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" }
    ]
  },
  {
    id: "idobank",
    titleKey: "challenges.idobank.title",
    descriptionKey: "challenges.idobank.description",
    longDescriptionKey: "challenges.idobank.longDescription",
    category: "community",
    difficulty: "intermediate",
    durationKey: "challenges.duration.ongoing",
    pointsReward: 190,
    participants: 43,
    completionRate: 86,
    stepsKeys: [
      "challenges.idobank.steps.register",
      "challenges.idobank.steps.offer_service",
      "challenges.idobank.steps.use_service"
    ],
    tipsKeys: [
      "challenges.idobank.tips.skills",
      "challenges.idobank.tips.time_value"
    ],
    impact: {
      co2Saved: 14,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Szabó Kristóf", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
      { id: "2", name: "Nagy Dóra", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" }
    ]
  }
];

// Utility functions
export const getChallengeById = (id: string): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === id);
};

export const getChallengesByCategory = (category: Challenge['category']): Challenge[] => {
  return challenges.filter(challenge => challenge.category === category);
};

export const getChallengesByDifficulty = (difficulty: Challenge['difficulty']): Challenge[] => {
  return challenges.filter(challenge => challenge.difficulty === difficulty);
};