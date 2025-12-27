import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Compass, 
  Sparkles, 
  Building2, 
  CheckCircle, 
  ArrowRight,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type UserRole = 'citizen' | 'creator' | 'business';

interface RoleOption {
  role: UserRole | 'sponsor';
  icon: typeof Compass;
  titleKey: string;
  descKey: string;
  accent: string | null;
  badge: string | null;
  disabled: boolean;
}

interface RoleSelectorProps {
  onComplete?: () => void;
}

const RoleSelector = ({ onComplete }: RoleSelectorProps) => {
  const { t } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExpertWelcome, setShowExpertWelcome] = useState(false);

  const roles: RoleOption[] = [
    {
      role: 'citizen',
      icon: Compass,
      titleKey: 'onboarding.role_explorer_title',
      descKey: 'onboarding.role_explorer_desc',
      accent: null,
      badge: null,
      disabled: false,
    },
    {
      role: 'creator',
      icon: Sparkles,
      titleKey: 'onboarding.role_expert_title',
      descKey: 'onboarding.role_expert_desc',
      accent: '#00E5FF',
      badge: t('onboarding.new_badge'),
      disabled: false,
    },
    {
      role: 'sponsor',
      icon: Building2,
      titleKey: 'onboarding.role_sponsor_title',
      descKey: 'onboarding.role_sponsor_desc',
      accent: '#FFD700',
      badge: t('onboarding.coming_soon'),
      disabled: true,
    },
  ];

  const handleRoleSelect = (role: UserRole | 'sponsor') => {
    if (role === 'sponsor') return;
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole || !user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: selectedRole })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile to update navigation
      await refreshProfile();

      if (selectedRole === 'creator') {
        setShowExpertWelcome(true);
      } else {
        toast.success(t('common.success'));
        onComplete?.();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpertContinue = () => {
    setShowExpertWelcome(false);
    onComplete?.();
    navigate('/szakertoi-studio');
  };

  return (
    <>
      <div className="min-h-screen bg-[#0A1930] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-[#112240] border-[hsl(var(--cyan))]/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              {t('onboarding.choose_role')}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {t('onboarding.choose_role_subtitle')}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.role;
              const isDisabled = role.disabled;

              return (
                <button
                  key={role.role}
                  onClick={() => handleRoleSelect(role.role)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full text-left p-6 rounded-xl border-2 transition-all duration-300 relative",
                    isDisabled && "opacity-50 cursor-not-allowed border-dashed",
                    !isDisabled && "cursor-pointer hover:scale-[1.02]",
                    isSelected && role.accent 
                      ? `border-[${role.accent}] bg-[${role.accent}]/10 shadow-[0_0_20px_rgba(0,229,255,0.3)]`
                      : isSelected 
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border/50 bg-[#0A1930]/50 hover:border-primary/50"
                  )}
                  style={
                    isSelected && role.accent 
                      ? { 
                          borderColor: role.accent, 
                          backgroundColor: `${role.accent}10`,
                          boxShadow: `0 0 20px ${role.accent}30`
                        } 
                      : undefined
                  }
                >
                  {/* Badge */}
                  {role.badge && (
                    <Badge 
                      className={cn(
                        "absolute top-3 right-3 text-xs font-semibold",
                        role.disabled 
                          ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50"
                          : "bg-[#00E5FF] text-black"
                      )}
                    >
                      {role.badge}
                    </Badge>
                  )}

                  <div className="flex items-start gap-4">
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        role.accent 
                          ? `bg-[${role.accent}]/20` 
                          : "bg-primary/20"
                      )}
                      style={role.accent ? { backgroundColor: `${role.accent}20` } : undefined}
                    >
                      <Icon 
                        className="w-6 h-6" 
                        style={role.accent ? { color: role.accent } : { color: 'hsl(var(--primary))' }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {t(role.titleKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(role.descKey)}
                      </p>
                    </div>

                    {isSelected && !isDisabled && (
                      <div className="w-8 h-8 rounded-full bg-[#00E5FF] flex items-center justify-center">
                        <Check className="w-5 h-5 text-black" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            <Button
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
              className="w-full mt-6 bg-gradient-to-r from-[#00E5FF] to-[#0066FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] text-white"
              size="lg"
            >
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  {t('common.continue')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Expert Welcome Modal */}
      <Dialog open={showExpertWelcome} onOpenChange={setShowExpertWelcome}>
        <DialogContent className="bg-[#112240] border-[#00E5FF]/30 max-w-md">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-[#00E5FF]" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {t("onboarding.expert_welcome_title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("onboarding.expert_welcome_desc")}
            </DialogDescription>
            <div className="space-y-2 text-left bg-[#0A1930] p-4 rounded-lg">
              <p className="text-sm flex items-center gap-2 text-foreground">
                <CheckCircle className="h-4 w-4 text-[#00E5FF]" />
                {t("onboarding.expert_benefit_1")}
              </p>
              <p className="text-sm flex items-center gap-2 text-foreground">
                <CheckCircle className="h-4 w-4 text-[#00E5FF]" />
                {t("onboarding.expert_benefit_2")}
              </p>
              <p className="text-sm flex items-center gap-2 text-foreground">
                <CheckCircle className="h-4 w-4 text-[#00E5FF]" />
                {t("onboarding.expert_benefit_3")}
              </p>
            </div>
            <Button 
              onClick={handleExpertContinue}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#0066FF] text-white hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              {t("onboarding.expert_cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoleSelector;
