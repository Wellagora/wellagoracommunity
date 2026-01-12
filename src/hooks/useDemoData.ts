// Hook for Demo Mode Data - Returns mock data when isDemoMode is true

import { useAuth } from '@/contexts/AuthContext';
import { 
  MOCK_PROGRAMS, 
  MOCK_EXPERTS, 
  MOCK_SPONSORS, 
  MOCK_MEMBERS, 
  MOCK_VOUCHERS,
  getMockVouchersForMember,
  MockProgram,
  MockExpert,
  MockSponsor,
  MockMember,
  MockVoucher
} from '@/data/mockData';

export interface DemoStats {
  totalMembers: number;
  totalExperts: number;
  totalSponsors: number;
  totalPrograms: number;
  totalEvents: number;
  totalVouchers: number;
  redeemedVouchers: number;
  totalValueDistributed: number;
  completions: number;
  points: number;
}

export interface DemoCommunityCreation {
  id: string;
  title: string;
  image_url: string;
  user_name: string;
  created_at: string;
  likes: number;
  rating?: number;
  caption?: string;
}

export const useDemoData = () => {
  const { isDemoMode, profile } = useAuth();

  // Platform statistics for homepage and community
  const getStats = (): DemoStats | null => {
    if (!isDemoMode) return null;
    return {
      totalMembers: 127,
      totalExperts: MOCK_EXPERTS.length,
      totalSponsors: MOCK_SPONSORS.length,
      totalPrograms: MOCK_PROGRAMS.length,
      totalEvents: 6,
      totalVouchers: 534,
      redeemedVouchers: 312,
      totalValueDistributed: 892000,
      completions: 312,
      points: 15420,
    };
  };

  // Member's vouchers (for MyHubPage)
  const getMemberVouchers = (): MockVoucher[] | null => {
    if (!isDemoMode) return null;
    return getMockVouchersForMember('member-1'); // Tóth Eszter
  };

  // All programs (for Marketplace)
  const getPrograms = (): MockProgram[] | null => {
    if (!isDemoMode) return null;
    return MOCK_PROGRAMS;
  };

  // All experts (for ExpertGallery)
  const getExperts = (): MockExpert[] | null => {
    if (!isDemoMode) return null;
    return MOCK_EXPERTS;
  };

  // All sponsors
  const getSponsors = (): MockSponsor[] | null => {
    if (!isDemoMode) return null;
    return MOCK_SPONSORS;
  };

  // All members
  const getMembers = (): MockMember[] | null => {
    if (!isDemoMode) return null;
    return MOCK_MEMBERS;
  };

  // Sponsor data (for SponsorDashboard)
  const getSponsorData = (): MockSponsor | null => {
    if (!isDemoMode || profile?.user_role !== 'sponsor') return null;
    return MOCK_SPONSORS[0]; // Káli Panzió
  };

  // Community gallery creations for demo mode
  const getCommunityCreations = (): DemoCommunityCreation[] | null => {
    if (!isDemoMode) return null;
    return [
      {
        id: 'creation-1',
        title: 'Első kovászkenyerem',
        caption: 'Első próbálkozásom a kemencében sütött kovászkenyérrel. Köszönöm a mesteri tippeket!',
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
        user_name: 'Tóth Eszter',
        created_at: '2026-01-10',
        likes: 23,
        rating: 5
      },
      {
        id: 'creation-2',
        title: 'Kerti fűszerkert',
        caption: 'A gyógynövény túra után elkészítettem a saját kertemet. Minden napra friss menta tea!',
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
        user_name: 'Molnár Gábor',
        created_at: '2026-01-08',
        likes: 45,
        rating: 5
      },
      {
        id: 'creation-3',
        title: 'Házi lekvár',
        caption: 'Nagymamám receptje szerint, de modern csavarral. A borsos szilva a kedvenc!',
        image_url: 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=600&h=400&fit=crop',
        user_name: 'Fekete Anna',
        created_at: '2026-01-05',
        likes: 31,
        rating: 4
      },
      {
        id: 'creation-4',
        title: 'Fonott kosár',
        caption: 'A kosárfonás workshopról hazavitt technikával készítettem ezt a tároló kosarat.',
        image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=400&fit=crop',
        user_name: 'Varga Zoltán',
        created_at: '2026-01-03',
        likes: 28,
        rating: 5
      },
      {
        id: 'creation-5',
        title: 'Méhviaszgyertya',
        caption: 'A méhészeti programon tanult technikával készült. Csodálatos illata van!',
        image_url: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b4?w=600&h=400&fit=crop',
        user_name: 'Kiss Judit',
        created_at: '2025-12-28',
        likes: 37,
        rating: 5
      },
      {
        id: 'creation-6',
        title: 'Szüreti élmény',
        caption: 'Fantasztikus nap volt a szőlőben! A must íze felejthetetlenül friss volt.',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
        user_name: 'Horváth Péter',
        created_at: '2025-12-20',
        likes: 52,
        rating: 5
      }
    ];
  };

  return {
    isDemoMode,
    getStats,
    getMemberVouchers,
    getPrograms,
    getExperts,
    getSponsors,
    getMembers,
    getSponsorData,
    getCommunityCreations,
  };
};
