import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SponsorSupportWizard } from "@/components/sponsor/SponsorSupportWizard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Plus, Pause, Play, StopCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SponsorSupportRule } from "@/types/sponsorSupport";

const SponsorSupport = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWizard, setShowWizard] = useState(false);

  // Fetch sponsor support rules
  const { data: supportRules, isLoading: loadingRules } = useQuery({
    queryKey: ["sponsor-support-rules", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("sponsor_support_rules")
        .select("*")
        .eq("sponsor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SponsorSupportRule[];
    },
    enabled: !!user,
  });

  // Mutation to update rule status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ruleId, status }: { ruleId: string; status: string }) => {
      const { error } = await supabase
        .from("sponsor_support_rules")
        .update({ status })
        .eq("id", ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsor-support-rules"] });
      toast({
        title: t("common.success"),
        description: t("sponsor_support.support_created"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("sponsor_support.create_error"),
        variant: "destructive",
      });
    },
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isSponsor = profile?.user_role && ['business', 'government', 'ngo', 'sponsor'].includes(profile.user_role);
  const isSuperAdmin = profile?.is_super_admin === true;
  
  if (!isSponsor && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatPrice = (amount: number, currency: string) => {
    if (currency === "EUR") {
      return `€${amount.toFixed(2)}`;
    }
    return `${amount.toLocaleString()} Ft`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      active: { variant: "default", label: t("sponsor_support.status_active") },
      paused: { variant: "secondary", label: t("sponsor_support.status_paused") },
      ended: { variant: "destructive", label: t("sponsor_support.status_ended") },
    };
    
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const activeRules = supportRules?.filter(r => r.status === "active") || [];
  const pausedRules = supportRules?.filter(r => r.status === "paused") || [];
  const endedRules = supportRules?.filter(r => r.status === "ended") || [];

  if (showWizard) {
    return (
      <DashboardLayout
        title={t("sponsor_support.wizard_title")}
        subtitle={t("sponsor_support.step_scope")}
        icon={Heart}
        iconColor="text-pink-500"
      >
        <SponsorSupportWizard
          onComplete={() => {
            setShowWizard(false);
            queryClient.invalidateQueries({ queryKey: ["sponsor-support-rules"] });
          }}
          onCancel={() => setShowWizard(false)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t("sponsor_support.my_supports")}
      subtitle={t("sponsor_support.no_supports_hint")}
      icon={Heart}
      iconColor="text-pink-500"
    >
      <div className="space-y-6">
        {/* Header with CTA */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{t("sponsor_support.my_supports")}</h2>
            <p className="text-muted-foreground">{t("sponsor_support.no_supports_hint")}</p>
          </div>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("sponsor_support.new_support")}
          </Button>
        </div>

        {/* Active Supports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
              {t("sponsor_support.active_supports")} ({activeRules.length})
            </CardTitle>
            <CardDescription>
              {t("sponsor_support.no_supports_hint")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRules ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : activeRules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("sponsor_support.no_supports_yet")}</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowWizard(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("sponsor_support.new_support")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRules.map((rule) => (
                  <Card key={rule.id} className="border-pink-200">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(rule.status)}
                            <span className="text-sm text-muted-foreground">
                              {t(`sponsor_support.scope_type_${rule.scope_type}`)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t("sponsor_support.amount_per_participant")}:</span>
                              <span className="ml-2 font-semibold text-green-600">
                                +{formatPrice(rule.amount_per_participant, rule.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("sponsor_support.budget_remaining")}:</span>
                              <span className="ml-2 font-semibold">
                                {formatPrice(rule.budget_total - rule.budget_spent, rule.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("sponsor_support.budget_total")}:</span>
                              <span className="ml-2">{formatPrice(rule.budget_total, rule.currency)}</span>
                            </div>
                            {rule.max_participants && (
                              <div>
                                <span className="text-muted-foreground">{t("sponsor_support.max_participants")}:</span>
                                <span className="ml-2">{rule.max_participants}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ ruleId: rule.id, status: "paused" })}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ ruleId: rule.id, status: "ended" })}
                          >
                            <StopCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paused Supports */}
        {pausedRules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("sponsor_support.paused_supports")} ({pausedRules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pausedRules.map((rule) => (
                  <Card key={rule.id} className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(rule.status)}
                            <span className="text-sm text-muted-foreground">
                              {t(`sponsor_support.scope_type_${rule.scope_type}`)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">{t("sponsor_support.amount_per_participant")}:</span>
                            <span className="ml-2 font-semibold">
                              +{formatPrice(rule.amount_per_participant, rule.currency)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ ruleId: rule.id, status: "active" })}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ ruleId: rule.id, status: "ended" })}
                          >
                            <StopCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ended Supports */}
        {endedRules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("sponsor_support.ended_supports")} ({endedRules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endedRules.slice(0, 5).map((rule) => (
                  <Card key={rule.id} className="border-gray-100 opacity-60">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(rule.status)}
                            <span className="text-sm text-muted-foreground">
                              {t(`sponsor_support.scope_type_${rule.scope_type}`)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">{t("sponsor_support.amount_per_participant")}:</span>
                            <span className="ml-2">
                              +{formatPrice(rule.amount_per_participant, rule.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SponsorSupport;
