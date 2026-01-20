import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import ExpertImpactReport from "@/components/expert-studio/ExpertImpactReport";
import ExpertDashboardStats from "@/components/expert-studio/ExpertDashboardStats";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";
import { BarChart3 } from "lucide-react";

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
      <div className="space-y-6">
        <ExpertDashboardStats userId={user.id} />
        <ExpertImpactReport userId={user.id} />
      </div>
    </DashboardLayout>
  );
};

export default ExpertAnalytics;
