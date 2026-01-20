import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import MyProgramsList from "@/components/expert-studio/MyProgramsList";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";
import { Store } from "lucide-react";

const ExpertPrograms = () => {
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
      title={t("nav.my_programs")}
      subtitle={t("expert.programs_subtitle") || "Manage your programs and content"}
      icon={Store}
      iconColor="text-amber-500"
    >
      <div className="space-y-6">
        <MyProgramsList userId={user.id} />
      </div>
    </DashboardLayout>
  );
};

export default ExpertPrograms;
