import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Target, TrendingUp, Award } from "lucide-react";

interface DashboardHeaderProps {
  userRole?: string;
  showQuickActions?: boolean;
  showBadges?: boolean;
  variant?: "citizen" | "organization";
}

export const DashboardHeader = memo(({ 
  userRole = "citizen",
  showQuickActions = true,
  showBadges = true,
  variant = "organization"
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.good_morning');
    if (hour < 18) return t('dashboard.good_afternoon');
    return t('dashboard.good_evening');
  };

  const userName = profile?.first_name 
    ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}` 
    : t('dashboard.user');

  if (variant === "citizen") {
    return (
      <section className="relative py-8 sm:py-12 lg:py-16 bg-card/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              {t('dashboard.roles.citizen')}
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {t('dashboard.my_programs')}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('dashboard.my_programs_subtitle')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-8 sm:py-16 lg:py-20 xl:py-24 bg-card/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center animate-fade-up-3d">
          {profile?.first_name && (
            <p className="text-sm sm:text-base text-muted-foreground mb-2">
              {getGreeting()}, <span className="font-semibold text-foreground">{userName}</span>
            </p>
          )}
          
          <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-6 xl:mb-8">
            {t('dashboard.title')}
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-3xl xl:max-w-4xl mx-auto mb-6 sm:mb-8 px-4">
            {t('dashboard.subtitle')}
          </p>
          
          {showBadges && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                <span className="text-foreground font-medium text-sm sm:text-base">
                  {t('dashboard.monthly_growth')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                <span className="text-foreground font-medium text-sm sm:text-base">
                  {t('dashboard.new_badges')}
                </span>
              </div>
            </div>
          )}

          {showQuickActions && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 sm:mt-8">
              <Button
                onClick={() => navigate('/piacer')}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Target className="w-4 h-4" />
                {t('dashboard.browse_programs')}
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <User className="w-4 h-4" />
                {t('dashboard.edit_profile')}
              </Button>
              <Button
                onClick={() => navigate('/settings')}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('dashboard.settings')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

DashboardHeader.displayName = "DashboardHeader";
