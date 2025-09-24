// Challenge data for the sustainability platform
export interface Challenge {
  id: string;
  title: string;
  description: string;
  longDescription: string;
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
  steps: string[];
  tips: string[];
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
    title: "30-Day Plastic-Free Challenge",
    description: "Reduce single-use plastics in your daily life",
    longDescription: "Join thousands of people in reducing plastic waste by eliminating single-use plastics from your daily routine. This challenge will help you develop sustainable habits while making a real environmental impact.",
    category: "waste",
    difficulty: "intermediate",
    duration: "30 days",
    pointsReward: 500,
    participants: 1247,
    completionRate: 78,
    sponsor: {
      name: "EcoTech Solutions",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
    },
    steps: [
      "Assess your current plastic usage for 3 days",
      "Replace single-use water bottles with a reusable one",
      "Bring reusable bags for grocery shopping",
      "Choose products with minimal packaging",
      "Find plastic-free alternatives for personal care items",
      "Share your progress and inspire others",
      "Reflect on your journey and plan for the future"
    ],
    tips: [
      "Start small - focus on one item at a time",
      "Keep reusable items visible as reminders",
      "Find a plastic-free buddy for accountability",
      "Research local stores with bulk buying options",
      "Document your journey with photos"
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
    title: "Green Energy Switch Challenge",
    description: "Transition to renewable energy sources in your home",
    longDescription: "Make the switch to clean, renewable energy and reduce your carbon footprint. This challenge guides you through evaluating your energy usage, exploring renewable options, and making the transition to green energy solutions.",
    category: "energy",
    difficulty: "advanced",
    duration: "45 days",
    pointsReward: 750,
    participants: 892,
    completionRate: 65,
    sponsor: {
      name: "SolarTech Innovations",
      logo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&h=100&fit=crop&crop=center"
    },
    steps: [
      "Conduct a home energy audit",
      "Research renewable energy providers in your area",
      "Compare costs and benefits of different green energy options",
      "Switch to a renewable energy provider or install solar panels",
      "Optimize your energy usage with smart devices",
      "Track your energy savings and environmental impact",
      "Share your experience with friends and family"
    ],
    tips: [
      "Check for government incentives and rebates",
      "Consider community solar programs if rooftop solar isn't feasible",
      "Invest in energy-efficient appliances",
      "Monitor your usage with smart meters",
      "Join local renewable energy advocacy groups"
    ],
    impact: {
      co2Saved: 85.2,
      treesEquivalent: 12
    },
    participants_preview: [
      {
        id: "4",
        name: "David Park",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "5",
        name: "Lisa Thompson",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "6",
        name: "James Wilson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "3",
    title: "Sustainable Transport Week",
    description: "Reduce your carbon footprint through eco-friendly transportation",
    longDescription: "Discover sustainable transportation alternatives that reduce emissions and promote healthier living. This week-long challenge explores biking, public transport, electric vehicles, and carpooling options.",
    category: "transport",
    difficulty: "beginner",
    duration: "7 days",
    pointsReward: 300,
    participants: 2156,
    completionRate: 89,
    steps: [
      "Calculate your current transportation carbon footprint",
      "Try cycling or walking for short trips",
      "Use public transportation for one full day",
      "Organize a carpool with colleagues or friends",
      "Research electric vehicle options in your area",
      "Plan a car-free weekend adventure",
      "Create a sustainable transport plan for the future"
    ],
    tips: [
      "Download transit apps for real-time schedules",
      "Invest in a good bicycle and safety gear",
      "Explore bike-sharing programs in your city",
      "Combine errands into single trips",
      "Consider working from home when possible"
    ],
    impact: {
      co2Saved: 25.8,
      treesEquivalent: 4
    },
    participants_preview: [
      {
        id: "7",
        name: "Maria Garcia",
        avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "8",
        name: "Alex Kumar",
        avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "9",
        name: "Rachel Green",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "4",
    title: "Plant-Based Nutrition Journey",
    description: "Explore sustainable eating habits with plant-based meals",
    longDescription: "Reduce your environmental impact through conscious food choices. This challenge introduces you to plant-based nutrition while exploring local, organic, and sustainable food sources.",
    category: "food",
    difficulty: "intermediate",
    duration: "21 days",
    pointsReward: 400,
    participants: 1789,
    completionRate: 72,
    steps: [
      "Learn about the environmental impact of food choices",
      "Plan three plant-based meals per day for one week",
      "Visit local farmers markets and organic stores",
      "Try cooking with seasonal, local ingredients",
      "Reduce food waste by meal planning and composting",
      "Share plant-based recipes with your community",
      "Evaluate your health and environmental impact"
    ],
    tips: [
      "Start with familiar dishes and substitute ingredients",
      "Focus on whole foods rather than processed alternatives",
      "Learn about proper plant-based nutrition",
      "Connect with local vegetarian/vegan communities",
      "Keep a food diary to track your progress"
    ],
    impact: {
      co2Saved: 42.1,
      treesEquivalent: 6
    },
    participants_preview: [
      {
        id: "10",
        name: "Sophie Miller",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "11",
        name: "Carlos Santos",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "12",
        name: "Nina Patel",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "5",
    title: "Community Green Initiative",
    description: "Organize and participate in local environmental projects",
    longDescription: "Make a collective impact by engaging with your community in environmental initiatives. This challenge focuses on organizing local clean-ups, tree planting, and awareness campaigns.",
    category: "community",
    difficulty: "advanced",
    duration: "60 days",
    pointsReward: 1000,
    participants: 634,
    completionRate: 55,
    sponsor: {
      name: "Green Future Foundation",
      logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop&crop=center"
    },
    steps: [
      "Research environmental issues in your community",
      "Connect with local environmental organizations",
      "Organize a community clean-up event",
      "Plan and execute a tree-planting initiative",
      "Create an awareness campaign on social media",
      "Establish a community garden or green space",
      "Document and share your community's impact"
    ],
    tips: [
      "Partner with schools and local businesses",
      "Apply for community grants and funding",
      "Use social media to recruit volunteers",
      "Collaborate with local government officials",
      "Create long-term sustainability plans"
    ],
    impact: {
      co2Saved: 120.5,
      treesEquivalent: 18
    },
    participants_preview: [
      {
        id: "13",
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "14",
        name: "Elena Rodriguez",
        avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "15",
        name: "Thomas Anderson",
        avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "6",
    title: "Carbon Handprint Calculator Master",
    description: "Track and amplify your positive environmental impact",
    longDescription: "Unlike carbon footprints that measure negative impact, the Carbon Handprint Calculator tracks your positive contributions to sustainability. Learn to measure, optimize, and share your environmental solutions and positive impact.",
    category: "innovation",
    difficulty: "advanced",
    duration: "30 days",
    pointsReward: 800,
    participants: 456,
    completionRate: 68,
    sponsor: {
      name: "Innovation Labs",
      logo: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop&crop=center"
    },
    steps: [
      "Set up your personal Carbon Handprint Calculator profile",
      "Log your first week of positive environmental actions",
      "Compare handprint vs footprint metrics",
      "Identify opportunities to increase your positive impact",
      "Share solutions that others can replicate",
      "Mentor someone else in using the calculator",
      "Create a 30-day handprint optimization plan"
    ],
    tips: [
      "Focus on scalable solutions that can inspire others",
      "Document your innovations with photos and data",
      "Connect with other handprint champions",
      "Use the AI assistant to optimize your impact strategies",
      "Set weekly handprint goals to stay motivated"
    ],
    impact: {
      co2Saved: 95.7,
      treesEquivalent: 14
    },
    participants_preview: [
      {
        id: "16",
        name: "Dr. Maya Johnson",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "17",
        name: "Tech Innovator Alex",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "18",
        name: "Green Engineer Sam",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "7",
    title: "Water Stewardship Challenge",
    description: "Become a guardian of our planet's most precious resource",
    longDescription: "Master water conservation, quality protection, and sustainable usage patterns. This comprehensive challenge covers everything from household efficiency to watershed protection.",
    category: "water",
    difficulty: "intermediate",
    duration: "28 days",
    pointsReward: 550,
    participants: 1324,
    completionRate: 81,
    steps: [
      "Conduct a comprehensive water audit of your home",
      "Install water-saving devices and fix leaks",
      "Create a rainwater harvesting system",
      "Test and improve local water quality",
      "Organize a community watershed cleanup",
      "Educate others about water conservation",
      "Plan a long-term water stewardship strategy"
    ],
    tips: [
      "Monitor your water usage with smart meters",
      "Research local watershed health",
      "Connect with water conservation organizations",
      "Use native plants for landscaping",
      "Practice greywater recycling safely"
    ],
    impact: {
      co2Saved: 18.3,
      treesEquivalent: 3
    },
    participants_preview: [
      {
        id: "19",
        name: "River Guardian Lisa",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "20",
        name: "Watershed Warrior Tom",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "21",
        name: "Aqua Activist Maria",
        avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "8",
    title: "Biodiversity Protector Mission",
    description: "Create and protect habitats for local wildlife",
    longDescription: "Become a champion for local ecosystems and biodiversity. Learn to create wildlife corridors, plant native species, and monitor ecosystem health in your community.",
    category: "biodiversity",
    difficulty: "expert",
    duration: "90 days",
    pointsReward: 1200,
    participants: 289,
    completionRate: 43,
    sponsor: {
      name: "Wildlife Conservation Trust",
      logo: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop&crop=center"
    },
    steps: [
      "Survey and document local biodiversity",
      "Create a native plant garden or habitat",
      "Install wildlife-friendly features (bee houses, bird boxes)",
      "Remove invasive species from local areas",
      "Monitor and document wildlife activity",
      "Connect fragmented habitats with wildlife corridors",
      "Educate community about local ecosystem importance"
    ],
    tips: [
      "Use iNaturalist app for species identification",
      "Partner with local conservation groups",
      "Focus on keystone species in your area",
      "Create photo documentation of changes over time",
      "Involve schools in citizen science projects"
    ],
    impact: {
      co2Saved: 156.8,
      treesEquivalent: 22
    },
    participants_preview: [
      {
        id: "22",
        name: "Eco Scientist Dr. James",
        avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "23",
        name: "Nature Guide Sarah",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "24",
        name: "Wildlife Photographer Kim",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
      }
    ]
  }
];

export const getChallengeById = (id: string): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === id);
};

export const getChallengesByCategory = (category: Challenge['category']): Challenge[] => {
  return challenges.filter(challenge => challenge.category === category);
};

export const getChallengesByDifficulty = (difficulty: Challenge['difficulty']): Challenge[] => {
  return challenges.filter(challenge => challenge.difficulty === difficulty);
};