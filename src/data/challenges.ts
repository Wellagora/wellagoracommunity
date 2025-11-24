// Challenge data for the sustainability platform
import communityGarden from '@/assets/community-garden.jpg';
import communityCelebration from '@/assets/community-celebration.jpg';
import communityChallenges from '@/assets/community-challenges.jpg';

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
  participants_preview: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  // Event scheduling and location
  isContinuous?: boolean;
  startDate?: string;
  endDate?: string;
  location?: string;
  imageUrl?: string;
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityChallenges,
    stepsKeys: [
      "challenges.kaliMuhely.steps.registration",
      "challenges.kaliMuhely.steps.participation",
      "challenges.kaliMuhely.steps.sharing"
    ],
    tipsKeys: [
      "challenges.kaliMuhely.tips.bring_ideas",
      "challenges.kaliMuhely.tips.connect"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityChallenges,
    stepsKeys: [
      "challenges.tudasHid.steps.mentor",
      "challenges.tudasHid.steps.share_skills",
      "challenges.tudasHid.steps.learn"
    ],
    tipsKeys: [
      "challenges.tudasHid.tips.patience",
      "challenges.tudasHid.tips.mutual_learning"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityGarden,
    stepsKeys: [
      "challenges.kaliKozosKert.steps.join",
      "challenges.kaliKozosKert.steps.cultivate",
      "challenges.kaliKozosKert.steps.harvest"
    ],
    tipsKeys: [
      "challenges.kaliKozosKert.tips.seasonal",
      "challenges.kaliKozosKert.tips.share_knowledge"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityChallenges,
    stepsKeys: [
      "challenges.szomszedSegit.steps.register",
      "challenges.szomszedSegit.steps.offer_help",
      "challenges.szomszedSegit.steps.receive_help"
    ],
    tipsKeys: [
      "challenges.szomszedSegit.tips.small_acts",
      "challenges.szomszedSegit.tips.reciprocity"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityCelebration,
    stepsKeys: [
      "challenges.kaliTortenetek.steps.gather",
      "challenges.kaliTortenetek.steps.share_stories",
      "challenges.kaliTortenetek.steps.document"
    ],
    tipsKeys: [
      "challenges.kaliTortenetek.tips.listen",
      "challenges.kaliTortenetek.tips.preserve"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityCelebration,
    stepsKeys: [
      "challenges.kaliKonyhak.steps.attend",
      "challenges.kaliKonyhak.steps.cook_together",
      "challenges.kaliKonyhak.steps.share_recipes"
    ],
    tipsKeys: [
      "challenges.kaliKonyhak.tips.local_ingredients",
      "challenges.kaliKonyhak.tips.traditional_recipes"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityChallenges,
    stepsKeys: [
      "challenges.mestersegekEjszakaja.steps.register",
      "challenges.mestersegekEjszakaja.steps.learn_craft",
      "challenges.mestersegekEjszakaja.steps.network"
    ],
    tipsKeys: [
      "challenges.mestersegekEjszakaja.tips.try_new",
      "challenges.mestersegekEjszakaja.tips.connect_artisans"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityCelebration,
    stepsKeys: [
      "challenges.kaliTortenetekTuz.steps.gather",
      "challenges.kaliTortenetekTuz.steps.share",
      "challenges.kaliTortenetekTuz.steps.connect"
    ],
    tipsKeys: [
      "challenges.kaliTortenetekTuz.tips.warm_clothes",
      "challenges.kaliTortenetekTuz.tips.bring_snack"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityCelebration,
    stepsKeys: [
      "challenges.szezonalisUnnepek.steps.participate",
      "challenges.szezonalisUnnepek.steps.celebrate",
      "challenges.szezonalisUnnepek.steps.contribute"
    ],
    tipsKeys: [
      "challenges.szezonalisUnnepek.tips.family",
      "challenges.szezonalisUnnepek.tips.traditions"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityChallenges,
    stepsKeys: [
      "challenges.kaliCsereBere.steps.bring_items",
      "challenges.kaliCsereBere.steps.exchange",
      "challenges.kaliCsereBere.steps.community"
    ],
    tipsKeys: [
      "challenges.kaliCsereBere.tips.quality",
      "challenges.kaliCsereBere.tips.fair_exchange"
    ],
    participants_preview: []
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
    participants: 0,
    completionRate: 0,
    imageUrl: communityChallenges,
    stepsKeys: [
      "challenges.idobank.steps.register",
      "challenges.idobank.steps.offer_service",
      "challenges.idobank.steps.use_service"
    ],
    tipsKeys: [
      "challenges.idobank.tips.skills",
      "challenges.idobank.tips.time_value"
    ],
    participants_preview: []
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