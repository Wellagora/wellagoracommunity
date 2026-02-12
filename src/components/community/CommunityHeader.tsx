import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, GraduationCap, HandHeart, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunityStats {
  members: number;
  experts: number;
  sponsors: number;
  programs: number;
}

interface ExpertProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  expert_title: string | null;
  location_city: string | null;
}

export const CommunityHeader = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const [membersRes, expertsRes, sponsorsRes, programsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'member'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'expert'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('user_role', ['business', 'government', 'ngo']),
        supabase.from('expert_contents').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      ]);

      setStats({
        members: membersRes.count || 0,
        experts: expertsRes.count || 0,
        sponsors: sponsorsRes.count || 0,
        programs: programsRes.count || 0,
      });

      // Fetch expert profiles
      const { data: expertData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, expert_title, location_city')
        .eq('user_role', 'expert')
        .not('expert_title', 'is', null)
        .limit(8);

      if (expertData) {
        setExperts(expertData);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Expert';
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {t('community.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('community.subtitle')}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {loading ? (
          <>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </>
        ) : stats ? (
          <>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4 mr-2" />
              {stats.members} {stats.members === 1 ? t('community.stats_members_one') || t('community.stats_members') : t('community.stats_members')}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <GraduationCap className="w-4 h-4 mr-2" />
              {stats.experts} {stats.experts === 1 ? t('community.stats_experts_one') || t('community.stats_experts') : t('community.stats_experts')}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <HandHeart className="w-4 h-4 mr-2" />
              {stats.sponsors} {stats.sponsors === 1 ? t('community.stats_sponsors_one') || t('community.stats_sponsors') : t('community.stats_sponsors')}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <BookOpen className="w-4 h-4 mr-2" />
              {stats.programs} {stats.programs === 1 ? t('community.stats_programs_one') || t('community.stats_programs') : t('community.stats_programs')}
            </Badge>
          </>
        ) : null}
      </div>

      {/* Expert Gallery */}
      {experts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground text-center">
            {t('community.our_experts')}
          </h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max px-4 md:justify-center">
              {experts.map((expert) => (
                <Card
                  key={expert.id}
                  className="flex-shrink-0 w-48 p-4 cursor-pointer hover:shadow-md hover:scale-102 transition-all duration-200"
                  onClick={() => navigate(`/szakertok/${expert.id}`)}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={expert.avatar_url || undefined} alt={getFullName(expert.first_name, expert.last_name)} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(expert.first_name, expert.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-foreground">
                        {getFullName(expert.first_name, expert.last_name)}
                      </p>
                      {expert.expert_title && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {expert.expert_title}
                        </p>
                      )}
                      {expert.location_city && (
                        <p className="text-xs text-muted-foreground">
                          {expert.location_city}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
