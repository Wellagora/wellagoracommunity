// Enhanced challenges with sponsorship and continuous generation (Wellagora Credit System)
import { Challenge } from './challenges';

export interface SponsoredChallenge extends Challenge {
  sponsorshipPackage?: {
    level: 'small' | 'medium' | 'large' | 'enterprise';
    priceHuf: number;
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
  level: 'small' | 'medium' | 'large' | 'enterprise';
  priceHuf: number;
  duration: string;
  credits: number;
  benefits: string[];
  description: string;
  expectedReach: string;
  idealFor: string;
}

export const sponsorshipPackages: SponsorshipPackage[] = [
  {
    id: 'small',
    name: 'Kis Vállalat',
    level: 'small',
    priceHuf: 100000,
    duration: '1 hónap',
    credits: 2,
    expectedReach: '100-200 fő',
    idealFor: '10-50 fő alkalmazott',
    benefits: [
      '2 challenge kampány támogatás',
      'Logo megjelenés challenge cardon',
      '50-100 fő elérés kampányonként',
      'Havi impact riport',
      'Email támogatás',
      'Social media említés'
    ],
    description: 'Ideális kisvállalkozások számára, akik szeretnék megkezdeni fenntarthatósági útjukat és látható pozitív hatást építeni'
  },
  {
    id: 'medium',
    name: 'Közepes Vállalat',
    level: 'medium',
    priceHuf: 250000,
    duration: '1 hónap',
    credits: 5,
    expectedReach: '250-500 fő',
    idealFor: '50-250 fő alkalmazott',
    benefits: [
      '5 challenge kampány támogatás',
      'Kiterjesztett branding',
      '50-100 fő elérés kampányonként',
      'Heti impact riportok',
      'Prioritás email támogatás',
      'Social media kampány',
      'Co-sponsorship lehetőség',
      'Résztvevői kedvezmény kódok'
    ],
    description: 'Növekvő vállalatok számára brand awareness építéshez és mérhető környezeti impact létrehozásához'
  },
  {
    id: 'large',
    name: 'Nagyvállalat', 
    level: 'large',
    priceHuf: 500000,
    duration: '1 hónap',
    credits: 10,
    expectedReach: '500-1000 fő',
    idealFor: '250-1000+ fő alkalmazott',
    benefits: [
      '10 challenge kampány támogatás',
      'Prémium logo elhelyezés',
      'Dedikált account manager',
      'Co-branded challenge-ek',
      'Egyedi challenge létrehozás',
      'Haladó analytics dashboard',
      'Employee engagement program',
      'Teljes social media integráció',
      'Havi stratégiai konzultáció'
    ],
    description: 'Nagyvállalatok számára komplett fenntarthatósági ökoszisztéma és employee engagement program'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    level: 'enterprise',
    priceHuf: 1000000,
    duration: '1 hónap',
    credits: 20,
    expectedReach: '1000+ fő',
    idealFor: '1000+ fő alkalmazott',
    benefits: [
      '20+ challenge kampány támogatás',
      'Korlátlan elérés',
      'Teljes márka integráció',
      'Dedikált success team',
      'API hozzáférés',
      'White-label opciók',
      'Multi-country deployment',
      'Custom fejlesztések',
      'C-level reporting'
    ],
    description: 'Multinacionális vállalatok számára egyedi, skálázható fenntarthatósági platform és teljes körű partnerség'
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
      durationKey: 'challenges.duration.21_days',
      pointsReward: 450,
      participants: 0,
      completionRate: 0,
      isSponsored: false,
      sponsorVisibility: false,
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
      participants_preview: []
    },
    {
      id: 'urban-mobility',
      titleKey: 'challenges.urban_mobility.title', 
      descriptionKey: 'challenges.urban_mobility.description',
      longDescriptionKey: 'challenges.urban_mobility.long_description',
      category: 'transport' as const,
      difficulty: 'beginner' as const,
      durationKey: 'challenges.duration.14_days',
      pointsReward: 350,
      participants: 0,
      completionRate: 0,
      isSponsored: false,
      sponsorVisibility: false,
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
      participants_preview: []
    },
    {
      id: 'zero-waste-office',
      titleKey: 'challenges.zero_waste_office.title',
      descriptionKey: 'challenges.zero_waste_office.description', 
      longDescriptionKey: 'challenges.zero_waste_office.long_description',
      category: 'waste' as const,
      difficulty: 'advanced' as const,
      durationKey: 'challenges.duration.30_days',
      pointsReward: 650,
      participants: 0,
      completionRate: 0,
      isSponsored: false,
      sponsorVisibility: false,
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
      participants_preview: []
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