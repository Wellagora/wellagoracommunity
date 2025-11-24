import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Award, 
  Leaf,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeCompletion {
  user_id: string;
  challenge_id: string;
  points_earned: number;
  validation_status: string;
  created_at: string;
  user_name: string;
  user_avatar: string;
}

interface ChallengeStats {
  challenge_id: string;
  challenge_title: string;
  total_completions: number;
  employees: EmployeeCompletion[];
}

export const OrganizationChallengeStats = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<ChallengeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalEmployees: 0,
    totalCompletions: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (profile?.organization_id) {
      loadStats();
    }
  }, [profile?.organization_id]);

  const loadStats = async () => {
    if (!profile?.organization_id) return;

    try {
      setLoading(true);

      // Get all challenge completions by employees of this organization
      const { data: completions, error } = await supabase
        .from('challenge_completions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url,
            public_display_name
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by challenge
      const challengeMap = new Map<string, ChallengeStats>();
      let totalPoints = 0;
      const uniqueEmployees = new Set<string>();

      completions?.forEach((completion: any) => {
        const challengeId = completion.challenge_id;
        uniqueEmployees.add(completion.user_id);
        totalPoints += completion.points_earned || 0;

        if (!challengeMap.has(challengeId)) {
          challengeMap.set(challengeId, {
            challenge_id: challengeId,
            challenge_title: getChallengeTitle(challengeId),
            total_completions: 0,
            employees: []
          });
        }

        const stats = challengeMap.get(challengeId)!;
        stats.total_completions++;
        
        const profileData = completion.profiles;
        stats.employees.push({
          user_id: completion.user_id,
          challenge_id: challengeId,
          points_earned: completion.points_earned,
          validation_status: completion.validation_status,
          created_at: completion.created_at,
          user_name: profileData?.public_display_name || 
                     `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || 
                     'Anonymous',
          user_avatar: profileData?.avatar_url || ''
        });
      });

      setStats(Array.from(challengeMap.values()));
      setTotalStats({
        totalEmployees: uniqueEmployees.size,
        totalCompletions: completions?.length || 0,
        totalPoints
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeTitle = (challengeId: string): string => {
    // Map challenge IDs to titles - in real app would fetch from challenge_definitions table
    const titleMap: Record<string, string> = {
      'bike-to-work': 'Bike to Work Challenge',
      'zero-waste-week': 'Zero Waste Week',
      'energy-efficiency': 'Energy Efficiency Challenge',
      'plant-based-meals': 'Plant-Based Meals',
      'plastic-free-july': 'Plastic Free July'
    };
    return titleMap[challengeId] || challengeId;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">{t('organization.employee_participation')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalCompletions}</p>
                <p className="text-sm text-muted-foreground">{t('organization.total_completions')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <Trophy className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalPoints.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('organization.total_points')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Stats */}
      {stats.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('organization.no_employee_completions')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('organization.encourage_employees')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        stats.map((challengeStat) => (
          <Card key={challengeStat.challenge_id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    {challengeStat.challenge_title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {challengeStat.total_completions} {t('organization.completions_by_employees')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {challengeStat.employees.slice(0, 5).map((employee, idx) => (
                  <div key={`${employee.user_id}-${idx}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={employee.user_avatar} />
                        <AvatarFallback>{employee.user_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(employee.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={employee.validation_status === 'approved' ? 'default' : 'secondary'}>
                        {employee.validation_status}
                      </Badge>
                      <div className="flex items-center gap-1 text-warning">
                        <Award className="w-4 h-4" />
                        <span className="font-semibold">{employee.points_earned}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {challengeStat.employees.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{challengeStat.employees.length - 5} {t('organization.more_completions')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
