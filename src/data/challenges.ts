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