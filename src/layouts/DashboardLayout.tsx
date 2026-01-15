import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowLeft, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

/**
 * Unified Dashboard Layout wrapper
 * Provides consistent styling for all role-based dashboards
 */
export default function DashboardLayout({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-black",
  showBackButton = true,
  backUrl = "/",
}: DashboardLayoutProps) {
  const { t } = useLanguage();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Welcome message logic: use full name or email prefix
  const getWelcomeName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.email) {
      return profile.email.split("@")[0];
    }
    return t("common.user");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-8"
        >
          {/* Back & Logout row */}
          <div className="flex items-center justify-between mb-4">
            {showBackButton && (
              <Link to={backUrl}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-black/60 hover:text-black hover:bg-black/5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.back")}
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-black/60 hover:text-black hover:bg-black/5 ml-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("common.logout")}
            </Button>
          </div>

          {/* Title with icon */}
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 shadow-sm">
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-black tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-black/50 text-base">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Welcome message */}
          <div className="mt-4 p-4 rounded-2xl bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 shadow-sm">
            <p className="text-black font-medium">
              {t("dashboard.welcome")}, {getWelcomeName()}! 👋
            </p>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
