import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Sparkles, Ticket, Star, Heart, Gift, Clock, Trophy, MessageCircle, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Activity types for diverse content
type ActivityType = 'signup' | 'review' | 'expert_join' | 'sponsor_impact' | 'milestone' | 'comment' | 'program_published';

interface ActivityNotification {
  id: number | string;
  type: ActivityType;
  userName: string;
  userAvatar: string | null;
  userInitials: string;
  programTitle?: string;
  programThumbnail?: string;
  sponsorName?: string;
  reviewText?: string;
  rating?: number;
  seatsOpened?: number;
  time: string;
  timeAgo: string;
}

// Localized program title mappings
const PROGRAM_TITLE_TRANSLATIONS: Record<string, { en: string; de: string }> = {
  'Kovászos Kenyér Mesterkurzus': { en: 'Sourdough Bread Masterclass', de: 'Sauerteigbrot Meisterkurs' },
  'Gyógynövénytúra': { en: 'Herbal Tour', de: 'Kräuterwanderung' },
  'Természetes Kozmetikumok Mestere': { en: 'Natural Cosmetics Master', de: 'Natürliche Kosmetik Meister' },
  'Fenntartható Kertészkedés': { en: 'Sustainable Gardening', de: 'Nachhaltiges Gärtnern' },
  'Borkóstoló és Pincetúra': { en: 'Wine Tasting & Cellar Tour', de: 'Weinprobe & Kellerführung' },
  '5. programját fejezte be': { en: 'completed their 5th program', de: 'hat ihr 5. Programm abgeschlossen' },
};

// Helper to get localized program title
const getLocalizedProgramTitle = (title: string, language: string): string => {
  if (language === 'hu') return title;
  const translations = PROGRAM_TITLE_TRANSLATIONS[title];
  if (translations) {
    return language === 'en' ? translations.en : translations.de;
  }
  return title; // Fallback to Hungarian
};

interface MockActivityBase {
  id: string;
  type: ActivityType;
  userName: string;
  userAvatar: string | null;
  userInitials: string;
  programTitleKey: string;
  programThumbnail?: string;
  sponsorName?: string;
  reviewText?: string;
  rating?: number;
  seatsOpened?: number;
  time: string;
}

// Mock diverse activities for demonstration (base data in Hungarian)
const MOCK_ACTIVITIES_BASE: MockActivityBase[] = [
  {
    id: 'mock-1',
    type: 'signup',
    userName: 'Kovács Júlia',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    userInitials: 'KJ',
    programTitleKey: 'Kovászos Kenyér Mesterkurzus',
    programThumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=150&fit=crop',
    time: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'mock-2',
    type: 'review',
    userName: 'Nagy Péter',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    userInitials: 'NP',
    programTitleKey: 'Gyógynövénytúra',
    programThumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=200&h=150&fit=crop',
    reviewText: 'Zseniális volt! Rengeteg praktikus tippet kaptam.',
    rating: 5,
    time: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'mock-3',
    type: 'expert_join',
    userName: 'Szabó Eszter',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    userInitials: 'SzE',
    programTitleKey: 'Természetes Kozmetikumok Mestere',
    time: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'mock-4',
    type: 'sponsor_impact',
    userName: 'Balaton Bio Kft.',
    userAvatar: null,
    userInitials: 'BB',
    sponsorName: 'Balaton Bio Kft.',
    programTitleKey: 'Fenntartható Kertészkedés',
    programThumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150&fit=crop',
    seatsOpened: 5,
    time: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
  },
  {
    id: 'mock-5',
    type: 'signup',
    userName: 'Tóth Gábor',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    userInitials: 'TG',
    programTitleKey: 'Borkóstoló és Pincetúra',
    programThumbnail: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=150&fit=crop',
    time: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'mock-6',
    type: 'milestone',
    userName: 'Horváth Anna',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    userInitials: 'HA',
    programTitleKey: '5. programját fejezte be',
    time: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
  },
];

// Helper to convert base mock data to ActivityNotification with localized titles
const getMockActivities = (language: string, formatTime: (time: string) => string): ActivityNotification[] => {
  return MOCK_ACTIVITIES_BASE.map(m => ({
    ...m,
    programTitle: getLocalizedProgramTitle(m.programTitleKey, language),
    timeAgo: formatTime(m.time),
  }));
};

export const LiveNotificationFeed = () => {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format relative time
  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === 'hu') {
      if (diffMins < 1) return 'Most';
      if (diffMins < 60) return `${diffMins} perce`;
      if (diffHours < 24) return `${diffHours} órája`;
      return `${diffDays} napja`;
    }
    if (language === 'de') {
      if (diffMins < 1) return 'Jetzt';
      if (diffMins < 60) return `vor ${diffMins} Min`;
      if (diffHours < 24) return `vor ${diffHours} Std`;
      return `vor ${diffDays} Tagen`;
    }
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, [language]);

  // Get user initials
  const getInitials = (firstName?: string | null, lastName?: string | null): string => {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    return first + last || '👤';
  };

  // Get activity icon
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'signup': return UserPlus;
      case 'review': return Star;
      case 'expert_join': return Sparkles;
      case 'program_published': return BookOpen;
      case 'sponsor_impact': return Gift;
      case 'milestone': return Trophy;
      case 'comment': return MessageCircle;
      default: return Ticket;
    }
  };

  // Get activity color
  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'signup': return 'bg-emerald-100 text-emerald-600 ring-emerald-200';
      case 'review': return 'bg-amber-100 text-amber-600 ring-amber-200';
      case 'expert_join': return 'bg-purple-100 text-purple-600 ring-purple-200';
      case 'program_published': return 'bg-indigo-100 text-indigo-600 ring-indigo-200';
      case 'sponsor_impact': return 'bg-blue-100 text-blue-600 ring-blue-200';
      case 'milestone': return 'bg-rose-100 text-rose-600 ring-rose-200';
      default: return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
  };

  // Build activity message
  const getActivityMessage = (activity: ActivityNotification): string => {
    const { type, userName, programTitle, reviewText, rating, sponsorName, seatsOpened } = activity;
    
    if (language === 'hu') {
      switch (type) {
        case 'signup':
          return `${userName} csatlakozott a(z) ${programTitle} programhoz`;
        case 'review':
          return `${userName} ${rating} csillagos értékelést adott`;
        case 'expert_join':
          return `${userName} új Szakértőként csatlakozott`;
        case 'program_published':
          return `${userName} új programot publikált: ${programTitle}`;
        case 'sponsor_impact':
          return `${sponsorName} támogatja: ${programTitle}`;
        case 'milestone':
          return `${userName} ${programTitle}`;
        default:
          return `${userName} aktivitás`;
      }
    }
    if (language === 'de') {
      switch (type) {
        case 'signup':
          return `${userName} ist beigetreten: ${programTitle}`;
        case 'review':
          return `${userName} hat ${rating} Sterne gegeben`;
        case 'expert_join':
          return `${userName} ist als Experte beigetreten`;
        case 'program_published':
          return `${userName} hat neues Programm veröffentlicht: ${programTitle}`;
        case 'sponsor_impact':
          return `${sponsorName} unterstützt: ${programTitle}`;
        case 'milestone':
          return `${userName} ${programTitle}`;
        default:
          return `${userName} Aktivität`;
      }
    }
    // English
    switch (type) {
      case 'signup':
        return `${userName} joined ${programTitle}`;
      case 'review':
        return `${userName} gave ${rating} stars`;
      case 'expert_join':
        return `${userName} joined as Expert`;
      case 'program_published':
        return `${userName} published new program: ${programTitle}`;
      case 'sponsor_impact':
        return `${sponsorName} sponsors: ${programTitle}`;
      case 'milestone':
        return `${userName} ${programTitle}`;
      default:
        return `${userName} activity`;
    }
  };

  // Fetch initial real data from Supabase - recent activity from multiple sources
  const fetchRealNotifications = useCallback(async () => {
    try {
      let realActivities: ActivityNotification[] = [];

      // 1. Fetch recent program publications (expert_contents)
      const { data: recentPrograms } = await supabase
        .from('expert_contents')
        .select(`
          id, 
          created_at, 
          title,
          title_en,
          title_de,
          thumbnail_url,
          creator_id,
          profiles:creator_id (first_name, last_name, avatar_url)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentPrograms) {
        recentPrograms.forEach((program: any) => {
          const profile = program.profiles;
          const localizedTitle = language === 'en' ? (program.title_en || program.title) :
                                language === 'de' ? (program.title_de || program.title) :
                                program.title;
          
          realActivities.push({
            id: `program-${program.id}`,
            type: 'program_published',
            userName: profile?.first_name 
              ? `${profile.first_name} ${profile.last_name || ''}`
              : 'Szakértő',
            userAvatar: profile?.avatar_url || null,
            userInitials: getInitials(profile?.first_name, profile?.last_name),
            programTitle: localizedTitle || 'új program',
            programThumbnail: program.thumbnail_url || null,
            time: program.created_at,
            timeAgo: formatRelativeTime(program.created_at),
          });
        });
      }

      // 2. Fetch recent expert registrations (profiles with user_role = creator)
      const { data: recentExperts } = await supabase
        .from('profiles')
        .select('id, created_at, first_name, last_name, avatar_url, expert_title')
        .eq('user_role', 'creator')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentExperts) {
        recentExperts.forEach((expert: any) => {
          realActivities.push({
            id: `expert-${expert.id}`,
            type: 'expert_join',
            userName: expert.first_name 
              ? `${expert.first_name} ${expert.last_name || ''}`
              : 'Új Szakértő',
            userAvatar: expert.avatar_url || null,
            userInitials: getInitials(expert.first_name, expert.last_name),
            programTitle: expert.expert_title || undefined,
            time: expert.created_at,
            timeAgo: formatRelativeTime(expert.created_at),
          });
        });
      }

      // 3. Fetch recent sponsorships (content_sponsorships)
      const { data: recentSponsorships } = await supabase
        .from('content_sponsorships')
        .select(`
          id,
          created_at,
          sponsored_seats_used,
          content_id,
          sponsor_id,
          expert_contents:content_id (title, title_en, title_de, thumbnail_url),
          sponsors:sponsor_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentSponsorships) {
        recentSponsorships.forEach((sponsorship: any) => {
          const content = sponsorship.expert_contents;
          const sponsor = sponsorship.sponsors;
          const localizedTitle = language === 'en' ? (content?.title_en || content?.title) :
                                language === 'de' ? (content?.title_de || content?.title) :
                                content?.title;
          
          realActivities.push({
            id: `sponsor-${sponsorship.id}`,
            type: 'sponsor_impact',
            userName: sponsor?.name || 'Támogató',
            userAvatar: null,
            userInitials: sponsor?.name?.[0]?.toUpperCase() || 'T',
            sponsorName: sponsor?.name || 'Támogató',
            programTitle: localizedTitle || 'programhoz',
            programThumbnail: content?.thumbnail_url || null,
            seatsOpened: sponsorship.sponsored_seats_used || 0,
            time: sponsorship.created_at,
            timeAgo: formatRelativeTime(sponsorship.created_at),
          });
        });
      }

      // Sort all real activities by time and take top 5
      const sortedActivities = realActivities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

      // If we have real data, use it; otherwise fall back to mock
      if (sortedActivities.length > 0) {
        setNotifications(sortedActivities);
      } else {
        // Fall back to mock data if no real data available
        setNotifications(getMockActivities(language, formatRelativeTime).slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Fall back to mock data on error
      setNotifications(getMockActivities(language, formatRelativeTime).slice(0, 5));
    } finally {
      setIsLoading(false);
    }
  }, [language, formatRelativeTime, getInitials]);

  // Load real data on mount
  useEffect(() => {
    fetchRealNotifications();
  }, [fetchRealNotifications]);

  // Subscribe to real-time voucher claims
  useEffect(() => {
    const channel = supabase
      .channel('voucher-claims-realtime-v2')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vouchers' },
        async (payload) => {
          const [profileRes, contentRes] = await Promise.all([
            supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', payload.new.user_id).single(),
            supabase.from('expert_contents').select('title, thumbnail_url').eq('id', payload.new.content_id).single()
          ]);
          
          const profile = profileRes.data;
          const content = contentRes.data;

          const newNotification: ActivityNotification = {
            id: payload.new.id,
            type: 'signup',
            userName: profile?.first_name 
              ? `${profile.first_name} ${profile.last_name?.[0] || ''}.`
              : 'Egy Tag',
            userAvatar: profile?.avatar_url || null,
            userInitials: getInitials(profile?.first_name, profile?.last_name),
            programTitle: content?.title || 'programhoz',
            programThumbnail: content?.thumbnail_url || null,
            time: new Date().toISOString(),
            timeAgo: language === 'hu' ? 'Most' : language === 'de' ? 'Jetzt' : 'Now',
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [language]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-black/5 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-black/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-black/10 rounded w-3/4" />
              <div className="h-3 bg-black/5 rounded w-1/2" />
            </div>
            <div className="w-16 h-12 rounded-lg bg-black/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  delay: index * 0.05,
                }
              }}
              exit={{ 
                opacity: 0, 
                x: -50, 
                scale: 0.9,
                transition: { duration: 0.25 }
              }}
              layout
            >
              {/* Rich Activity Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-black/[0.03] group">
                {/* User Avatar with activity type ring */}
                <div className="relative flex-shrink-0">
                  <Avatar className={`w-12 h-12 ring-2 ${colorClass.split(' ')[2]} shadow-sm`}>
                    <AvatarImage src={activity.userAvatar || undefined} />
                    <AvatarFallback className="bg-black/5 text-black/70 text-sm font-medium">
                      {activity.userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Activity type icon badge */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} ring-2 ring-white`}>
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black leading-snug">
                    {getActivityMessage(activity)}
                  </p>
                  
                  {/* Review text preview */}
                  {activity.type === 'review' && activity.reviewText && (
                    <p className="text-xs text-black/50 mt-1 italic line-clamp-1">
                      "{activity.reviewText}"
                    </p>
                  )}
                  
                  {/* Star rating for reviews */}
                  {activity.type === 'review' && activity.rating && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(activity.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="flex items-center gap-1 mt-1.5 text-black/40">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{activity.timeAgo}</span>
                  </div>
                </div>
                
                {/* Program thumbnail */}
                {activity.programThumbnail && (
                  <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-black/5 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={activity.programThumbnail} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {notifications.length === 0 && !isLoading && (
        <div className="text-center py-8 text-black/40">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{language === 'hu' ? 'Hamarosan itt lesznek az aktivitások!' : 'Activities coming soon!'}</p>
        </div>
      )}
    </div>
  );
};

export default LiveNotificationFeed;