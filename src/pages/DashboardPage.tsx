import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import CelebrationModal from "@/components/CelebrationModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCitizenView } from "@/components/dashboard/DashboardCitizenView";
import { DashboardOrganizationView } from "@/components/dashboard/DashboardOrganizationView";
import { Loader2 } from "lucide-react";

type UserRole = "citizen" | "business" | "government" | "ngo";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [currentRole, setCurrentRole] = useState<UserRole>("citizen");
  const [showCelebration, setShowCelebration] = useState(false);

  // Mock achievement for demonstration
  const mockAchievement = {
    title: "Energia Mester",
    description: "30%-kal csökkented az energiafogyasztásod ezen a hónapon!",
    points: 500,
    impact: "45.2kg",
    level: 13
  };

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Redirect organizations to their specialized dashboard
  useEffect(() => {
    if (profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role)) {
      navigate("/organization");
    }
  }, [profile?.user_role, navigate]);

  // Sync currentRole with user profile
  useEffect(() => {
    if (profile?.user_role && profile.user_role !== currentRole) {
      setCurrentRole(profile.user_role);
    }
  }, [profile?.user_role, currentRole]);

  const handleRoleChange = useCallback((role: UserRole) => {
    setCurrentRole(role);
  }, []);

  const handleCelebrationTrigger = useCallback(() => {
    setShowCelebration(true);
  }, []);

  const handleCelebrationClose = useCallback(() => {
    setShowCelebration(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Citizen dashboard - show all programs
  if (profile?.user_role === 'citizen') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <DashboardHeader 
          userRole={profile.user_role} 
          variant="citizen"
          showQuickActions={false}
          showBadges={false}
        />
        <DashboardCitizenView currentRole={currentRole} />
      </div>
    );
  }

  // General sustainability dashboard (no project context)
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <DashboardHeader 
        userRole={currentRole}
        variant="organization"
        showQuickActions={true}
        showBadges={true}
      />
      
      <DashboardOrganizationView 
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onCelebrationTrigger={handleCelebrationTrigger}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={handleCelebrationClose}
        achievement={mockAchievement}
      />
    </div>
  );
};

export default DashboardPage;
