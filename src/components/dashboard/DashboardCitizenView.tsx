import { memo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserProgramsList } from "./UserProgramsList";
import { ProgramCalendar } from "./ProgramCalendar";
import Dashboard from "./Dashboard";
import { ReferralWidget } from "@/components/referral/ReferralWidget";
import { ShareImpactCard } from "@/components/referral/ShareImpactCard";
import { PersonalImpactGarden } from "./PersonalImpactGarden";
import { EventsWidget } from "./EventsWidget";
import { MyEventsWidget } from "./MyEventsWidget";
import { NearbyWidget } from "./NearbyWidget";
import { Target, BarChart3, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface DashboardCitizenViewProps {
  currentRole: UserRole;
}

export const DashboardCitizenView = memo(({ currentRole }: DashboardCitizenViewProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Fetch user stats for ShareImpactCard
  const { data: userStats } = useQuery({
    queryKey: ['userImpactStats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { totalPoints: 0, challengesCompleted: 0, co2Saved: 0 };
      
      // Get challenge completions
      const { data: completions } = await supabase
        .from('challenge_completions')
        .select('points_earned, impact_data')
        .eq('user_id', user.id)
        .eq('validation_status', 'approved');
      
      // Get sustainability activities
      const { data: activities } = await supabase
        .from('sustainability_activities')
        .select('points_earned, impact_amount')
        .eq('user_id', user.id);
      
      const challengesCompleted = completions?.length || 0;
      const completionPoints = completions?.reduce((sum, c) => sum + (c.points_earned || 0), 0) || 0;
      const activityPoints = activities?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;
      const co2Saved = activities?.reduce((sum, a) => sum + (a.impact_amount || 0), 0) || 0;
      
      return {
        totalPoints: completionPoints + activityPoints,
        challengesCompleted,
        co2Saved
      };
    },
    enabled: !!user?.id,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <PersonalImpactGarden />
        <ReferralWidget />
        <ShareImpactCard 
          totalPoints={userStats?.totalPoints || 0}
          challengesCompleted={userStats?.challengesCompleted || 0}
          co2Saved={userStats?.co2Saved || 0}
        />
      </div>

      {/* Events Section - Three columns: Upcoming Events + My Events + Nearby */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <EventsWidget />
        <MyEventsWidget />
        <NearbyWidget />
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2">
          <TabsTrigger value="programs" className="flex items-center justify-center space-x-2 text-sm">
            <Target className="w-4 h-4" />
            <span>{t('dashboard.tabs.my_programs')}</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center justify-center space-x-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{t('dashboard.tabs.calendar')}</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center justify-center space-x-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            <span>{t('dashboard.tabs.my_activities')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="animate-fade-in">
          <UserProgramsList />
        </TabsContent>

        <TabsContent value="calendar" className="animate-fade-in">
          <ProgramCalendar />
        </TabsContent>

        <TabsContent value="activities" className="animate-fade-in">
          <Card>
            <CardContent className="p-6">
              <Dashboard userRole={currentRole} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

DashboardCitizenView.displayName = "DashboardCitizenView";
