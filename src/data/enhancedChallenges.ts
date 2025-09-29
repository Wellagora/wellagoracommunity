// Enhanced challenges with sponsorship and continuous generation
import { Challenge } from './challenges';

export interface SponsoredChallenge extends Challenge {
  sponsorshipPackage?: {
    level: 'bronze' | 'silver' | 'gold';
    price: number;
    benefits: string[];
    creditsRemaining: number;
    totalCredits: number;
  };
  isSponsored: boolean;
  sponsorVisibility: boolean;
}

export interface SponsorshipPackage {
  id: string;
  name: string;
  level: 'bronze' | 'silver' | 'gold';
  price: number;
  duration: number; // months
  creditsIncluded: number;
  benefits: string[];
  description: string;
}

export const sponsorshipPackages: SponsorshipPackage[] = [
  {
    id: 'bronze',
    name: 'Bronz Szponzoráció',
    level: 'bronze',
    price: 50000,
    duration: 1,
    creditsIncluded: 1000,
    benefits: [
      '1 havi kihívás szponzoráció',
      'Cég logó megjelenítése',
      'Alapszintű hatás riportok'
    ],
    description: 'Ideális kis vállalatok számára a fenntarthatósági láthatóság növeléséhez'
  },
  {
    id: 'silver',
    name: 'Ezüst Szponzoráció',
    level: 'silver',
    price: 150000,
    duration: 3,
    creditsIncluded: 3500,
    benefits: [
      '3 havi szponzoráció',
      'Brandelt kihívások',
      'Részletes analytics',
      'Közösségi hálózat hozzáférés',
      'Matching prioritás'
    ],
    description: 'Növekvő vállalatok számára brand awareness és közösségi kapcsolatok építéséhez'
  },
  {
    id: 'gold',
    name: 'Arany Szponzoráció', 
    level: 'gold',
    price: 300000,
    duration: 6,
    creditsIncluded: 8000,
    benefits: [
      '6 havi prémium szponzoráció',
      'Dedikált kihívás kategóriák',
      'VIP matching szolgáltatás',
      'Egyedi riportok és insights',
      'Rendezvény szponzoráció lehetőség',
      'Közvetlen CEO kapcsolat',
      'Sajtó és PR támogatás'
    ],
    description: 'Nagyvállalatok számára teljes fenntarthatósági ökoszisztéma partnerség'
  }
];

// Generate continuous challenges based on categories and current events
export const generateDynamicChallenges = (category?: string, difficulty?: string): SponsoredChallenge[] => {
  const baseChallenges = [
    {
      id: 'energy-efficiency-winter',
      titleKey: 'challenges.energy_winter.title',
      descriptionKey: 'challenges.energy_winter.description',
      longDescriptionKey: 'challenges.energy_winter.long_description',
      category: 'energy' as const,
      difficulty: 'intermediate' as const,
      duration: '21 nap',
      pointsReward: 450,
      participants: 892,
      completionRate: 67,
      isSponsored: true,
      sponsorVisibility: true,
      sponsor: {
        name: 'E.ON Hungária',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center'
      },
      sponsorshipPackage: {
        level: 'silver' as const,
        price: 150000,
        benefits: ['3 havi szponzoráció', 'Brandelt kihívások'],
        creditsRemaining: 2800,
        totalCredits: 3500
      },
      stepsKeys: [
        'challenges.energy_winter.steps.audit',
        'challenges.energy_winter.steps.insulation',
        'challenges.energy_winter.steps.smart_heating',
        'challenges.energy_winter.steps.monitor'
      ],
      tipsKeys: [
        'challenges.energy_winter.tips.timing',
        'challenges.energy_winter.tips.government_support'
      ],
      impact: {
        co2Saved: 28.5,
        treesEquivalent: 4
      },
      participants_preview: [
        { id: '1', name: 'Kovács Péter', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
        { id: '2', name: 'Nagy Anna', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
        { id: '3', name: 'Szabó Márton', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
      ]
    },
    {
      id: 'urban-mobility',
      titleKey: 'challenges.urban_mobility.title', 
      descriptionKey: 'challenges.urban_mobility.description',
      longDescriptionKey: 'challenges.urban_mobility.long_description',
      category: 'transport' as const,
      difficulty: 'beginner' as const,
      duration: '14 nap',
      pointsReward: 350,
      participants: 1456,
      completionRate: 82,
      isSponsored: true,
      sponsorVisibility: true,
      sponsor: {
        name: 'MOL Bubi',
        logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=center'
      },
      sponsorshipPackage: {
        level: 'bronze' as const,
        price: 50000,
        benefits: ['1 havi szponzoráció'],
        creditsRemaining: 650,
        totalCredits: 1000
      },
      stepsKeys: [
        'challenges.urban_mobility.steps.assess',
        'challenges.urban_mobility.steps.plan_route',
        'challenges.urban_mobility.steps.try_alternatives',
        'challenges.urban_mobility.steps.track_progress'
      ],
      tipsKeys: [
        'challenges.urban_mobility.tips.weather_prep',
        'challenges.urban_mobility.tips.safety_first'
      ],
      impact: {
        co2Saved: 12.8,
        treesEquivalent: 2
      },
      participants_preview: [
        { id: '4', name: 'Tóth Zsuzsanna', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
        { id: '5', name: 'Kiss János', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' }
      ]
    },
    {
      id: 'zero-waste-office',
      titleKey: 'challenges.zero_waste_office.title',
      descriptionKey: 'challenges.zero_waste_office.description', 
      longDescriptionKey: 'challenges.zero_waste_office.long_description',
      category: 'waste' as const,
      difficulty: 'advanced' as const,
      duration: '30 nap',
      pointsReward: 650,
      participants: 324,
      completionRate: 58,
      isSponsored: true,
      sponsorVisibility: true,
      sponsor: {
        name: 'IKEA Magyarország',
        logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center'
      },
      sponsorshipPackage: {
        level: 'gold' as const,
        price: 300000,
        benefits: ['6 havi prémium szponzoráció', 'VIP matching'],
        creditsRemaining: 7200,
        totalCredits: 8000
      },
      stepsKeys: [
        'challenges.zero_waste_office.steps.audit',
        'challenges.zero_waste_office.steps.eliminate_disposables',
        'challenges.zero_waste_office.steps.recycling_system',
        'challenges.zero_waste_office.steps.employee_training'
      ],
      tipsKeys: [
        'challenges.zero_waste_office.tips.leadership_buy_in',
        'challenges.zero_waste_office.tips.measure_progress'
      ],
      impact: {
        co2Saved: 45.2,
        treesEquivalent: 7
      },
      participants_preview: [
        { id: '6', name: 'Horváth Gábor', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
      ]
    }
  ];

  let filtered = baseChallenges;
  
  if (category && category !== 'all') {
    filtered = filtered.filter(challenge => challenge.category === category);
  }
  
  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(challenge => challenge.difficulty === difficulty);
  }
  
  return filtered;
};

// Get sponsorship dashboard data for businesses
export const getSponsorshipDashboard = (companyId: string) => {
  return {
    activePackage: sponsorshipPackages[1], // Silver package
    creditsUsed: 1650,
    creditsRemaining: 1850,
    sponsoredChallenges: 3,
    totalParticipants: 2847,
    impactGenerated: {
      co2Saved: 156.8,
      participantsReached: 2847,
      brandsAwareness: '+23%'
    },
    upcomingRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
};

export default generateDynamicChallenges;