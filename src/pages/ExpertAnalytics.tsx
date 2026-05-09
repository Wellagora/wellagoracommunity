import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import ExpertAnalyticsDashboard from "@/components/expert-studio/ExpertAnalyticsDashboard";
import CommunitySignalsPanel from "@/components/expert-studio/CommunitySignalsPanel";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";
import { BarChart3, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ExpertAnalytics = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return <ExpertStudioSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout
      title={t("nav.analytics")}
      subtitle={t("expert.analytics_subtitle") || "Track your performance and impact"}
      icon={BarChart3}
      iconColor="text-amber-500"
    >
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {t("expert.tab_performance") || "Teljesítmény"}
          </TabsTrigger>
          <TabsTrigger value="community-signals" className="gap-2">
            <Sparkles className="w-4 h-4" />
            {t("expert.tab_community_signals") || "Közösségi jelek"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-0">
          <ExpertAnalyticsDashboard userId={user.id} />
        </TabsContent>

        <TabsContent value="community-signals" className="mt-0">
          <CommunitySignalsPanel creatorId={user.id} weeksBack={4} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ExpertAnalytics;
