import { memo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserProgramsList } from "./UserProgramsList";
import { ProgramCalendar } from "./ProgramCalendar";
import Dashboard from "./Dashboard";
import { Target, Users, BarChart3 } from "lucide-react";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface DashboardCitizenViewProps {
  currentRole: UserRole;
}

export const DashboardCitizenView = memo(({ currentRole }: DashboardCitizenViewProps) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2">
          <TabsTrigger value="programs" className="flex items-center justify-center space-x-2 text-sm">
            <Target className="w-4 h-4" />
            <span>{t('dashboard.tabs.my_programs')}</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center justify-center space-x-2 text-sm">
            <Users className="w-4 h-4" />
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
