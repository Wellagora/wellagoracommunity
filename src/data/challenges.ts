// Challenge data for the sustainability platform
export interface Challenge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  category: "energy" | "transport" | "food" | "waste" | "community" | "innovation" | "water" | "biodiversity" | "circular-economy" | "green-finance";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  duration: string;
  pointsReward: number;
  participants: number;
  completionRate: number;
  sponsor?: {
    name: string;
    logo: string;
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
  {
    id: "1",
    titleKey: "challenges.plastic_free.title",
    descriptionKey: "challenges.plastic_free.description", 
    longDescriptionKey: "challenges.plastic_free.long_description",
    category: "waste",
    difficulty: "intermediate",
    duration: "30 nap",
    pointsReward: 500,
    participants: 1247,
    completionRate: 78,
    sponsor: {
      name: "EcoTech Solutions",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
    },
    stepsKeys: [
      "challenges.plastic_free.steps.assess",
      "challenges.plastic_free.steps.bottle", 
      "challenges.plastic_free.steps.bags",
      "challenges.plastic_free.steps.packaging",
      "challenges.plastic_free.steps.personal_care",
      "challenges.plastic_free.steps.share",
      "challenges.plastic_free.steps.reflect"
    ],
    tipsKeys: [
      "challenges.plastic_free.tips.start_small",
      "challenges.plastic_free.tips.visible_reminders",
      "challenges.plastic_free.tips.buddy",
      "challenges.plastic_free.tips.bulk_stores",
      "challenges.plastic_free.tips.document"
    ],
    impact: {
      co2Saved: 15.5,
      treesEquivalent: 2
    },
    participants_preview: [
      {
        id: "1",
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "2", 
        name: "Marcus Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "3",
        name: "Emma Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "2",
    titleKey: "challenges.green_energy.title",
    descriptionKey: "challenges.green_energy.description",
    longDescriptionKey: "challenges.green_energy.long_description", 
    category: "energy",
    difficulty: "advanced",
    duration: "45 nap",
    pointsReward: 750,
    participants: 892,
    completionRate: 65,
    sponsor: {
      name: "SolarTech Innovations",
      logo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&h=100&fit=crop&crop=center"
    },
    stepsKeys: [
      "challenges.green_energy.steps.audit",
      "challenges.green_energy.steps.research",
      "challenges.green_energy.steps.quotes",
      "challenges.green_energy.steps.financing",
      "challenges.green_energy.steps.installation", 
      "challenges.green_energy.steps.monitor"
    ],
    tipsKeys: [
      "challenges.green_energy.tips.government_incentives",
      "challenges.green_energy.tips.multiple_quotes",
      "challenges.green_energy.tips.certified_installers",
      "challenges.green_energy.tips.payback_calculation",
      "challenges.green_energy.tips.community_programs"
    ],
    impact: {
      co2Saved: 42.3,
      treesEquivalent: 6
    },
    participants_preview: [
      {
        id: "4",
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "5",
        name: "Lisa Wong",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "6",
        name: "Ahmed Hassan",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "3",
    titleKey: "challenges.bike_to_work.title",
    descriptionKey: "challenges.bike_to_work.description",
    longDescriptionKey: "challenges.bike_to_work.description", 
    category: "transport",
    difficulty: "beginner",
    duration: "7 nap",
    pointsReward: 200,
    participants: 3456,
    completionRate: 89,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 8.2,
      treesEquivalent: 1
    },
    participants_preview: [
      {
        id: "7",
        name: "Kovács János",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "4",
    titleKey: "challenges.plastic_free_week.title",
    descriptionKey: "challenges.plastic_free_week.description",
    longDescriptionKey: "challenges.plastic_free_week.description", 
    category: "waste",
    difficulty: "beginner",
    duration: "7 nap",
    pointsReward: 150,
    participants: 2890,
    completionRate: 76,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 5.1,
      treesEquivalent: 1
    },
    participants_preview: [
      {
        id: "8",
        name: "Nagy Anna",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  // Additional challenges for expanded catalog
  {
    id: "solar-panel-install",
    titleKey: "challenges.solarPanel.title", 
    descriptionKey: "challenges.solarPanel.description",
    longDescriptionKey: "challenges.solarPanel.description",
    category: "energy",
    difficulty: "advanced",
    duration: "8 hét",
    pointsReward: 800,
    participants: 892,
    completionRate: 65,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 1200,
      treesEquivalent: 54
    },
    participants_preview: [
      { id: "1", name: "Gábor Kiss", avatar: "/api/placeholder/32/32" },
      { id: "2", name: "Éva Molnár", avatar: "/api/placeholder/32/32" }
    ],
    sponsor: {
      name: "SolarTech Kft.",
      logo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&h=100&fit=crop&crop=center"
    }
  },
  {
    id: "bike-to-work-month",
    titleKey: "challenges.bikeToWork.title",
    descriptionKey: "challenges.bikeToWork.description",
    longDescriptionKey: "challenges.bikeToWork.description",
    category: "transport",
    difficulty: "beginner",
    duration: "30 nap",
    pointsReward: 250,
    participants: 3421,
    completionRate: 83,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 85,
      treesEquivalent: 4
    },
    participants_preview: [
      { id: "1", name: "László Balogh", avatar: "/api/placeholder/32/32" },
      { id: "2", name: "Rita Szabó", avatar: "/api/placeholder/32/32" },
      { id: "3", name: "Tamás Horváth", avatar: "/api/placeholder/32/32" }
    ]
  },
  {
    id: "plastic-free-lifestyle",
    titleKey: "challenges.plasticFree.title",
    descriptionKey: "challenges.plasticFree.description",
    longDescriptionKey: "challenges.plasticFree.description",
    category: "waste",
    difficulty: "expert", 
    duration: "12 hét",
    pointsReward: 600,
    participants: 743,
    completionRate: 58,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 95,
      treesEquivalent: 4
    },
    participants_preview: [
      { id: "1", name: "Dóra Varga", avatar: "/api/placeholder/32/32" },
      { id: "2", name: "Máté Fekete", avatar: "/api/placeholder/32/32" }
    ]
  },
  {
    id: "community-garden",
    titleKey: "challenges.communityGarden.title",
    descriptionKey: "challenges.communityGarden.description",
    longDescriptionKey: "challenges.communityGarden.description",
    category: "biodiversity",
    difficulty: "intermediate",
    duration: "6 hét", 
    pointsReward: 400,
    participants: 1289,
    completionRate: 76,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 120,
      treesEquivalent: 5
    },
    participants_preview: [
      { id: "1", name: "Ildikó Papp", avatar: "/api/placeholder/32/32" },
      { id: "2", name: "József Takács", avatar: "/api/placeholder/32/32" },
      { id: "3", name: "Viktória Németh", avatar: "/api/placeholder/32/32" }
    ],
    sponsor: {
      name: "GreenSpaces Ltd.",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
    }
  },
  {
    id: "water-conservation",
    titleKey: "challenges.waterConservation.title",
    descriptionKey: "challenges.waterConservation.description",
    longDescriptionKey: "challenges.waterConservation.description",
    category: "water",
    difficulty: "beginner",
    duration: "3 hét",
    pointsReward: 180,
    participants: 2156,
    completionRate: 89,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 25,
      treesEquivalent: 1
    },
    participants_preview: [
      { id: "1", name: "Beáta Kovács", avatar: "/api/placeholder/32/32" },
      { id: "2", name: "András Lakatos", avatar: "/api/placeholder/32/32" }
    ]
  },
  {
    id: "green-innovation-hackathon",
    titleKey: "challenges.greenHackathon.title", 
    descriptionKey: "challenges.greenHackathon.description",
    longDescriptionKey: "challenges.greenHackathon.description",
    category: "innovation",
    difficulty: "expert",
    duration: "1 hét",
    pointsReward: 1000,
    participants: 456,
    completionRate: 42,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 500,
      treesEquivalent: 23
    },
    participants_preview: [
      { id: "1", name: "Márton Gál", avatar: "/api/placeholder/32/32" },
      { id: "2", name: "Krisztina Farkas", avatar: "/api/placeholder/32/32" },
      { id: "3", name: "Norbert Simon", avatar: "/api/placeholder/32/32" }
    ]
  },
  {
    id: "circular-economy-workshop",
    titleKey: "challenges.circularWorkshop.title",
    descriptionKey: "challenges.circularWorkshop.description",
    longDescriptionKey: "challenges.circularWorkshop.description", 
    category: "circular-economy",
    difficulty: "intermediate",
    duration: "2 hét",
    pointsReward: 350,
    participants: 892,
    completionRate: 71,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 80,
      treesEquivalent: 4
    },
    participants_preview: [
      { id: "1", name: "Eszter Rácz", avatar: "/api/placeholder/32/32" },
      { id: "2", name: "Zsolt Pintér", avatar: "/api/placeholder/32/32" }
    ],
    sponsor: {
      name: "CircularHub",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
    }
  },
  {
    id: "green-finance-literacy",
    titleKey: "challenges.greenFinance.title",
    descriptionKey: "challenges.greenFinance.description",
    longDescriptionKey: "challenges.greenFinance.description",
    category: "green-finance", 
    difficulty: "advanced",
    duration: "5 hét",
    pointsReward: 450,
    participants: 634,
    completionRate: 67,
    stepsKeys: [],
    tipsKeys: [],
    impact: {
      co2Saved: 200,
      treesEquivalent: 9
    },
    participants_preview: [
      { id: "1", name: "Péter Horváth", avatar: "/api/placeholder/32/32" },
      { id: "2", name: "Katalin Novák", avatar: "/api/placeholder/32/32" },
      { id: "3", name: "Gergő Barna", avatar: "/api/placeholder/32/32" }
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