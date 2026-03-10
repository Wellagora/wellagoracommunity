import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  Medal,
  Award,
  Flame,
  MessageSquare,
  BookOpen,
  UserPlus,
  Footprints,
  Gem,
  GraduationCap,
  Megaphone,
  Brain,
  Users
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const POINTS_PER_LEVEL = 100;

// Map icon name from DB to Lucide component
const ICON_MAP: Record<string, React.ReactNode> = {
  footprints: <Footprints className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  trophy: <Trophy className="w-5 h-5" />,
  crown: <Crown className="w-5 h-5" />,
  gem: <Gem className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
  'message-square': <MessageSquare className="w-5 h-5" />,
  megaphone: <Megaphone className="w-5 h-5" />,
  brain: <Brain className="w-5 h-5" />,
  'book-open': <BookOpen className="w-5 h-5" />,
  'graduation-cap': <GraduationCap className="w-5 h-5" />,
  medal: <Medal className="w-5 h-5" />,
  'user-plus': <UserPlus className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  award: <Award className="w-5 h-5" />,
};

interface BadgeDefinition {
  id: string;
  name: string;
  name_hu?: string;
  name_en?: string;
  name_de?: string;
  description: string | null;
  description_en?: string | null;
  description_de?: string | null;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  sort_order: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge_definitions: BadgeDefinition;
}

interface LeaderboardEntry {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  avatar_url: string | null;
  wellpoints_balance: number;
  current_streak: number;
}

const PointsSystem = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // Fetch user profile stats
  const { data: profileStats, isLoading: loadingProfile } = useQuery({
    queryKey: ['user-gamification-stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('wellpoints_balance, current_streak, longest_streak')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Fetch earned badges
  const { data: earnedBadges = [], isLoading: loadingBadges } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select('id, badge_id, earned_at, badge_definitions(*)')
        .eq('user_id', user!.id)
        .order('earned_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as UserBadge[];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Fetch all badge definitions (for available badges)
  const { data: allBadges = [], isLoading: loadingAllBadges } = useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as BadgeDefinition[];
    },
    staleTime: 5 * 60_000,
  });

  // Fetch leaderboard (top 10 by wellpoints_balance)
  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['wellpoints-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, avatar_url, wellpoints_balance, current_streak')
        .gt('wellpoints_balance', 0)
        .order('wellpoints_balance', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
    staleTime: 2 * 60_000,
  });

  // Compute derived values
  const totalPoints = profileStats?.wellpoints_balance ?? 0;
  const level = Math.floor(totalPoints / POINTS_PER_LEVEL) + 1;
  const pointsInLevel = totalPoints % POINTS_PER_LEVEL;
  const progressToNextLevel = (pointsInLevel / POINTS_PER_LEVEL) * 100;
  const streakDays = profileStats?.current_streak ?? 0;

  const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badge_id));
  const availableBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id));

  const getBadgeName = (badge: BadgeDefinition) => {
    if (language === 'en' && badge.name_en) return badge.name_en;
    if (language === 'de' && badge.name_de) return badge.name_de;
    return badge.name;
  };

  const getBadgeDescription = (badge: BadgeDefinition) => {
    if (language === 'en' && badge.description_en) return badge.description_en;
    if (language === 'de' && badge.description_de) return badge.description_de;
    return badge.description || '';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-muted text-muted-foreground";
      case "rare": return "bg-blue-500 text-blue-50";
      case "epic": return "bg-purple-500 text-purple-50";
      case "legendary": return "bg-gradient-to-r from-amber-500 to-yellow-400 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRarityLabel = (rarity: string) => {
    const labels: Record<string, Record<string, string>> = {
      common: { hu: 'Gyakori', en: 'Common', de: 'Häufig' },
      rare: { hu: 'Ritka', en: 'Rare', de: 'Selten' },
      epic: { hu: 'Epikus', en: 'Epic', de: 'Episch' },
      legendary: { hu: 'Legendás', en: 'Legendary', de: 'Legendär' },
    };
    return labels[rarity]?.[language] || labels[rarity]?.hu || rarity;
  };

  const isLoading = loadingProfile || loadingBadges || loadingAllBadges;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Find user's rank in leaderboard
  const userRank = leaderboard.findIndex(e => e.id === user?.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{t('points.total_points')}</p>
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
              <Trophy className="w-8 h-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('points.level')}</p>
                <p className="text-2xl font-bold">{level}</p>
                <Progress value={progressToNextLevel} className="w-full mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {POINTS_PER_LEVEL - pointsInLevel} {t('points.points_to_level')} {level + 1}
                </p>
              </div>
              <Star className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('points.your_badges')}</p>
                <p className="text-2xl font-bold">{earnedBadges.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  / {allBadges.length} {language === 'hu' ? 'összesen' : language === 'de' ? 'gesamt' : 'total'}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('points.current_streak')}</p>
                <p className="text-2xl font-bold">{streakDays} {t('points.days')}</p>
              </div>
              <Flame className={`w-8 h-8 ${streakDays >= 3 ? 'text-orange-500 fill-orange-400' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earned Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>{t('points.your_badges')}</span>
            </CardTitle>
            <CardDescription>
              {t('points.your_badges_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {earnedBadges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Medal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {language === 'hu' ? 'Még nincsenek jelvényeid. Kezdj el pontokat gyűjteni!'
                   : language === 'de' ? 'Noch keine Abzeichen. Fang an, Punkte zu sammeln!'
                   : 'No badges yet. Start earning points!'}
                </p>
              </div>
            ) : (
              earnedBadges.map((ub) => {
                const badge = ub.badge_definitions;
                return (
                  <div key={ub.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      badge.rarity === 'legendary' ? 'bg-amber-100 text-amber-600' :
                      badge.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                      badge.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {ICON_MAP[badge.icon] || <Award className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{getBadgeName(badge)}</h4>
                        <Badge className={getRarityColor(badge.rarity)} variant="secondary">
                          {getRarityLabel(badge.rarity)}
                        </Badge>
                      </div>
                      {badge.points_reward > 0 && (
                        <p className="text-xs text-emerald-600 font-medium">+{badge.points_reward} WellPoint</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(ub.earned_at).toLocaleDateString(language === 'hu' ? 'hu-HU' : language === 'de' ? 'de-DE' : 'en-US')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <Link to="/points-history">
              <Button variant="ghost" size="sm" className="w-full mt-2">
                {language === 'hu' ? 'Pont előzmények' : language === 'de' ? 'Punkteverlauf' : 'Points History'} →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Available Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Medal className="w-5 h-5" />
              <span>{t('points.available_badges')}</span>
            </CardTitle>
            <CardDescription>
              {t('points.available_badges_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableBadges.slice(0, 6).map((badge) => (
              <div key={badge.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card opacity-60">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 text-gray-400 grayscale">
                  {ICON_MAP[badge.icon] || <Award className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-muted-foreground">{getBadgeName(badge)}</h4>
                    <Badge className={getRarityColor(badge.rarity)} variant="outline">
                      {getRarityLabel(badge.rarity)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {badge.requirement_type === 'points' && `${badge.requirement_value} WellPoint`}
                    {badge.requirement_type === 'streak' && `${badge.requirement_value} ${language === 'hu' ? 'napos sorozat' : language === 'de' ? 'Tage Serie' : 'day streak'}`}
                    {badge.requirement_type === 'posts' && `${badge.requirement_value} ${language === 'hu' ? 'poszt' : language === 'de' ? 'Beiträge' : 'posts'}`}
                    {badge.requirement_type === 'programs' && `${badge.requirement_value} ${language === 'hu' ? 'program' : language === 'de' ? 'Programme' : 'programs'}`}
                    {badge.requirement_type === 'referrals' && `${badge.requirement_value} ${language === 'hu' ? 'meghívó' : language === 'de' ? 'Empfehlungen' : 'referrals'}`}
                  </p>
                </div>
              </div>
            ))}
            {availableBadges.length > 6 && (
              <p className="text-center text-xs text-muted-foreground pt-1">
                +{availableBadges.length - 6} {language === 'hu' ? 'további jelvény' : language === 'de' ? 'weitere Abzeichen' : 'more badges'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-warning" />
            <span>{t('points.leaderboard')}</span>
          </CardTitle>
          <CardDescription>
            {t('points.leaderboard_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLeaderboard ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {language === 'hu' ? 'Még nincs ranglistás tag. Légy te az első!'
                 : language === 'de' ? 'Noch keine Rangliste. Sei der Erste!'
                 : 'No leaderboard entries yet. Be the first!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.id === user?.id;
                const displayName = entry.display_name || `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || 'Anon';
                const entryLevel = Math.floor((entry.wellpoints_balance ?? 0) / POINTS_PER_LEVEL) + 1;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                      isCurrentUser ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                      {index === 0 ? <Crown className="w-5 h-5 text-amber-500" /> :
                       index === 1 ? <Medal className="w-5 h-5 text-gray-400" /> :
                       index === 2 ? <Award className="w-5 h-5 text-orange-500" /> :
                       index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback>
                        {(entry.first_name?.[0] || '?')}{(entry.last_name?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{isCurrentUser ? t('points.you') : displayName}</h4>
                        {isCurrentUser && <Badge variant="outline">{t('points.you')}</Badge>}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{t('points.level')} {entryLevel}</span>
                        {entry.current_streak > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-400" />
                              {entry.current_streak} {t('points.days')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{(entry.wellpoints_balance ?? 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{t('points.points')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsSystem;
