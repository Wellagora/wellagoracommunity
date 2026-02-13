import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Ticket, Star, Coins, Flame, Trophy, Sparkles, ArrowRight, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { getUserBalance, WELLPOINTS_QUERY_KEY, STREAK_QUERY_KEY } from "@/lib/wellpoints";
import { BrowseProgramsNudge } from "@/components/growth/BrowseProgramsNudge";

const getDateLocale = (language: Language) => {
  switch (language) {
    case 'hu': return hu;
    case 'de': return de;
    case 'en': return enUS;
    default: return enUS;
  }
};

// Level system
const LEVELS = [
  { min: 0, name: 'beginner', icon: '🌱' },
  { min: 100, name: 'explorer', icon: '🔍' },
  { min: 300, name: 'active', icon: '⭐' },
  { min: 600, name: 'builder', icon: '🤝' },
  { min: 1000, name: 'master', icon: '🏆' },
  { min: 2000, name: 'legend', icon: '👑' },
];

function getUserLevel(totalPoints: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVELS[i].min) {
      const current = LEVELS[i];
      const next = LEVELS[i + 1];
      const progress = next ? ((totalPoints - current.min) / (next.min - current.min)) * 100 : 100;
      return { ...current, progress, nextLevel: next };
    }
  }
  return { ...LEVELS[0], progress: 0, nextLevel: LEVELS[1] };
}

// Earning methods
const EARNING_METHODS = [
  { icon: '📝', points: 5, key: 'post' },
  { icon: '💬', points: 3, key: 'comment' },
  { icon: '❤️', points: 1, key: 'like' },
  { icon: '🎓', points: 25, key: 'participation' },
  { icon: '⭐', points: 20, key: 'review' },
  { icon: '👥', points: 100, key: 'invite' },
];

// Rewards
const REWARDS = [
  { points: 500, key: 'discount_10', icon: '🏷️' },
  { points: 1000, key: 'free_event', icon: '🎟️' },
  { points: 2000, key: 'expert_consultation', icon: '💎' },
];

interface JoinedProgram {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  purchased_at: string;
}

interface SponsoredAccess {
  id: string;
  content_id: string;
  content_title: string;
  access_type: string;
  purchased_at: string;
  sponsor_name?: string;
  status: 'active' | 'expired';
}

const MyAgoraPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const dateLocale = getDateLocale(language);

  // Fetch WellPoints balance
  const { data: wellPointsBalance = 0 } = useQuery({
    queryKey: WELLPOINTS_QUERY_KEY(user?.id || ''),
    queryFn: () => getUserBalance(user!.id),
    enabled: !!user,
  });

  // Fetch streak data from profile
  const { data: profileData } = useQuery({
    queryKey: STREAK_QUERY_KEY(user?.id || ''),
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Calculate level and progress
  const userLevel = getUserLevel(wellPointsBalance);
  const currentStreak = profileData?.current_streak || 0;
  const longestStreak = profileData?.longest_streak || 0;
  const todayPoints = 0; // TODO: Calculate today's earned points

  // Card 1: Active Participations - Fetch from multiple sources
  const { data: participations = [], isLoading: participationsLoading, isError: participationsError } = useQuery({
    queryKey: ["myParticipations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const allPrograms: JoinedProgram[] = [];
      
      // 1. Fetch from transactions table (completed purchases)
      const { data: transactionData } = await supabase
        .from("transactions")
        .select(`
          content_id,
          created_at,
          expert_contents (
            id,
            title,
            category,
            image_url
          )
        `)
        .eq("buyer_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      
      if (transactionData) {
        transactionData.forEach(t => {
          if (t.expert_contents) {
            allPrograms.push({
              id: t.content_id,
              title: (t.expert_contents as any)?.title || "",
              category: (t.expert_contents as any)?.category || "",
              image_url: (t.expert_contents as any)?.image_url,
              purchased_at: t.created_at,
            });
          }
        });
      }
      
      // 2. Fetch from vouchers table (claimed sponsored programs)
      const { data: voucherData } = await supabase
        .from("vouchers")
        .select(`
          content_id,
          created_at,
          expert_contents (
            id,
            title,
            category,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (voucherData) {
        voucherData.forEach(v => {
          if (v.expert_contents) {
            allPrograms.push({
              id: v.content_id,
              title: (v.expert_contents as any)?.title || "",
              category: (v.expert_contents as any)?.category || "",
              image_url: (v.expert_contents as any)?.image_url,
              purchased_at: v.created_at,
            });
          }
        });
      }
      
      // 3. Fetch from content_access table (legacy/backward compatibility)
      const { data: accessData } = await supabase
        .from("content_access")
        .select(`
          content_id,
          purchased_at,
          expert_contents (
            id,
            title,
            category,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });
      
      if (accessData) {
        accessData.forEach(a => {
          if (a.expert_contents) {
            allPrograms.push({
              id: a.content_id,
              title: (a.expert_contents as any)?.title || "",
              category: (a.expert_contents as any)?.category || "",
              image_url: (a.expert_contents as any)?.image_url,
              purchased_at: a.purchased_at,
            });
          }
        });
      }
      
      // Remove duplicates based on content_id and sort by date
      const uniquePrograms = Array.from(
        new Map(allPrograms.map(p => [p.id, p])).values()
      ).sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime());
      
      return uniquePrograms.slice(0, 10) as JoinedProgram[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  // Upcoming Events (RSVPd by the user)
  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["myUpcomingEvents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      // Get user's RSVPd events
      const { data: rsvps, error } = await supabase
        .from("event_rsvps")
        .select(`
          event_id,
          events (
            id, title, start_date, end_date, location_name, village, image_url, current_participants, max_participants
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "going");
      if (error) throw error;
      return (rsvps || [])
        .map((r: any) => r.events)
        .filter(Boolean)
        .filter((e: any) => new Date(e.start_date) >= new Date())
        .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, 5);
    },
    enabled: !!user?.id,
    retry: false,
  });

  // Card 3: Sponsored Access - Fetch from vouchers table
  const { data: sponsoredAccess = [], isLoading: sponsoredLoading, isError: sponsoredError } = useQuery({
    queryKey: ["mySponsoredAccess", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch vouchers (sponsored programs)
      const { data: voucherData, error } = await supabase
        .from("vouchers")
        .select(`
          id,
          content_id,
          code,
          created_at,
          status,
          expert_contents (
            id,
            title,
            sponsor_name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return (voucherData || []).map(v => ({
        id: v.id,
        content_id: v.content_id,
        content_title: (v.expert_contents as any)?.title || "",
        access_type: "voucher",
        purchased_at: v.created_at,
        sponsor_name: (v.expert_contents as any)?.sponsor_name,
        status: v.status as 'active' | 'expired',
      })) as SponsoredAccess[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  if (authLoading) {
    return (
      <DashboardLayout title={t("my_agora.title")} icon={Star} iconColor="text-emerald-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <DashboardLayout
      title={t("my_agora.title")}
      subtitle={t("my_agora.pilot_subtitle")}
      icon={Star}
      iconColor="text-emerald-500"
    >
      <div className="space-y-8">
        {/* SECTION 1: Welcome + Stats Row */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WellPoints Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🪙</div>
                <div className="text-4xl font-bold text-amber-700 mb-1">{wellPointsBalance}</div>
                <div className="text-sm text-amber-600">{t('gamification.your_points')}</div>
                {todayPoints > 0 && (
                  <div className="text-xs text-emerald-600 mt-1">{t('gamification.today_earned').replace('{{points}}', String(todayPoints))}</div>
                )}
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-6 text-center">
                <div className={`text-4xl mb-2 ${currentStreak === 0 ? 'opacity-40' : ''}`}>🔥</div>
                <div className="text-4xl font-bold text-red-700 mb-1">{currentStreak}</div>
                <div className="text-sm text-red-600">
                  {currentStreak === 0 ? t('gamification.start_streak') : `${currentStreak} ${t('gamification.streak')}`}
                </div>
                {longestStreak > 0 && (
                  <div className="text-xs text-red-500 mt-1">{t('gamification.record').replace('{{days}}', String(longestStreak))}</div>
                )}
              </CardContent>
            </Card>

            {/* Level Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">{userLevel.icon}</div>
                <div className="text-xl font-bold text-purple-700 mb-2">
                  {t(`gamification.level.${userLevel.name}`)}
                </div>
                <Progress value={userLevel.progress} className="h-2 mb-2" />
                {userLevel.nextLevel && (
                  <div className="text-xs text-purple-600">
                    {t('gamification.points_to_next').replace('{{points}}', String(userLevel.nextLevel.min - wellPointsBalance))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SECTION 2: How to earn points */}
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('gamification.how_to_earn')}</h2>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {EARNING_METHODS.map((method, index) => (
              <Card key={index} className="flex-shrink-0 w-32">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{method.icon}</div>
                  <div className="text-sm font-medium mb-1">{t(`gamification.earn.${method.key}`)}</div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    +{method.points} WP
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION 3: Rewards preview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('gamification.what_to_spend')}</h2>
          <div className="space-y-3">
            {REWARDS.map((reward, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-3xl">{reward.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{t(`gamification.reward.${reward.key}`)}</div>
                    <Badge variant="outline" className="mt-1">
                      {reward.points} WP
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION 4: Upcoming Events */}
        {!eventsLoading && upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-500" />
              {t('my_agora.upcoming_events') || 'Közelgő eseményeim'}
            </h2>
            <div className="space-y-3">
              {upcomingEvents.map((event: any) => (
                <Card
                  key={event.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-center">
                      <div>
                        <p className="text-xs font-bold text-indigo-600">
                          {format(new Date(event.start_date), 'MMM', { locale: dateLocale })}
                        </p>
                        <p className="text-xl font-bold text-indigo-700 leading-none">
                          {format(new Date(event.start_date), 'd')}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(event.start_date), 'HH:mm')}
                        </span>
                        {event.location_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {event.current_participants || 0}/{event.max_participants || '∞'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: Existing content (programs + vouchers) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Programs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                {t("gamification.active_programs")}
              </CardTitle>
            </CardHeader>
            <CardContent>
            {participationsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : participationsError ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">{t("common.no_data")}</p>
              </div>
            ) : participations.length === 0 ? (
              <BrowseProgramsNudge />
            ) : (
              <div className="space-y-3">
                {participations.slice(0, 5).map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate(`/programs/${program.id}`)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {program.image_url ? (
                        <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{program.title}</p>
                      <p className="text-xs text-muted-foreground">{program.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-purple-600" />
              {t("my_agora.sponsored_access_title")}
            </CardTitle>
            <CardDescription>
              {t("my_agora.sponsored_access_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sponsoredLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : sponsoredError ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">{t("common.no_data")}</p>
              </div>
            ) : sponsoredAccess.length === 0 ? (
              <div className="text-center py-6">
                <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">{t("my_agora.no_sponsored_access")}</p>
                <p className="text-xs text-muted-foreground">{t("my_agora.sponsored_access_hint")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sponsoredAccess.slice(0, 5).map((access) => (
                  <div
                    key={access.id}
                    className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{access.content_title}</p>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                        {t("my_agora.status_active")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("my_agora.sponsored_by")}: {access.sponsor_name || t("my_agora.community_sponsor")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(access.purchased_at), "PPP", { locale: dateLocale })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyAgoraPage;
