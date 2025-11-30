import { memo, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card3D } from "@/components/ui/card-3d";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Landmark, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface RoleOption {
  value: UserRole;
  icon: LucideIcon;
  gradient: string;
  borderGradient: string;
}

interface DashboardRoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const DashboardRoleSelector = memo(({ 
  currentRole, 
  onRoleChange 
}: DashboardRoleSelectorProps) => {
  const { t } = useLanguage();

  const roles: RoleOption[] = useMemo(() => [
    { 
      value: "citizen" as UserRole, 
      icon: User, 
      gradient: "from-primary/20 to-success/20",
      borderGradient: "from-primary to-success"
    },
    { 
      value: "business" as UserRole, 
      icon: Building2, 
      gradient: "from-accent/20 to-secondary/20",
      borderGradient: "from-accent to-secondary"
    },
    { 
      value: "government" as UserRole, 
      icon: Landmark, 
      gradient: "from-warning/20 to-destructive/20",
      borderGradient: "from-warning to-destructive"
    },
    { 
      value: "ngo" as UserRole, 
      icon: Users, 
      gradient: "from-success/20 to-primary/20",
      borderGradient: "from-success to-primary"
    }
  ], []);

  const getCurrentRoleGradient = useMemo(() => {
    const role = roles.find(role => role.value === currentRole);
    return role?.borderGradient || "from-primary to-success";
  }, [roles, currentRole]);

  return (
    <Card3D className="mb-6 sm:mb-8 bg-card/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1 sm:mb-2">
              {t('dashboard.type.title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('dashboard.type.subtitle')}
            </p>
          </div>
          <Badge className={`bg-gradient-to-r ${getCurrentRoleGradient} text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium shadow-premium`}>
            {t(`dashboard.roles.${currentRole}`)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isActive = currentRole === role.value;
            return (
              <button
                key={role.value}
                onClick={() => onRoleChange(role.value)}
                className={`
                  cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 group
                  ${isActive 
                    ? `bg-gradient-to-br ${role.gradient} border-primary shadow-glow scale-105` 
                    : 'bg-card/30 border-border hover:bg-card/70 hover:border-primary/50 hover:scale-102 hover:shadow-md'
                  }
                `}
                type="button"
              >
                <div className="text-center space-y-4">
                  <div className={`
                    w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${role.borderGradient} shadow-lg` 
                      : 'bg-gradient-to-r from-muted to-muted-foreground/20 group-hover:from-primary group-hover:to-success'
                    }
                  `}>
                    <IconComponent className={`w-8 h-8 ${isActive ? 'text-white' : 'text-foreground group-hover:text-white'}`} />
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isActive ? 'text-foreground' : 'text-foreground group-hover:text-primary'}`}>
                      {t(`dashboard.roles.${role.value}`)}
                    </h3>
                    <p className={`text-sm ${isActive ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                      {t(`dashboard.roles.${role.value}_desc`)}
                    </p>
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center justify-center">
                      <Badge className="bg-white/20 text-foreground border-white/30">
                        {t('dashboard.selected')}
                      </Badge>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card3D>
  );
});

DashboardRoleSelector.displayName = "DashboardRoleSelector";
