import Navigation from "@/components/Navigation";
import { MobilizeTeamModal } from "@/components/dashboard/MobilizeTeamModal";
import { OrganizationSponsorModal } from "@/components/dashboard/OrganizationSponsorModal";
import OrganizationProfileEditor from "@/components/organization/OrganizationProfileEditor";
import OrganizationSubscription from "@/components/organization/OrganizationSubscription";
import OrganizationInvoices from "@/components/organization/OrganizationInvoices";
import OrganizationCredits from "@/components/organization/OrganizationCredits";
import OrganizationEmployees from "@/components/organization/OrganizationEmployees";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Building2, 
  Users,
  MapPin,
  Heart,
  CreditCard,
  Coins,
  Receipt,
  LayoutDashboard,
  CalendarPlus
} from "lucide-react";
import { useOrgDashboard } from "@/hooks/useOrgDashboard";
import { OrgDashboardHeader } from "@/components/organization/dashboard/OrgDashboardHeader";
import { OrgOverviewTab } from "@/components/organization/dashboard/OrgOverviewTab";
import { OrgSponsorshipsTab } from "@/components/organization/dashboard/OrgSponsorshipsTab";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { Button } from "@/components/ui/button";

const OrganizationDashboard = () => {
  const {
    user,
    profile,
    authLoading,
    t,
    selectedTab,
    setSelectedTab,
    mobilizeModalOpen,
    setMobilizeModalOpen,
    sponsorModalOpen,
    setSponsorModalOpen,
    sponsorshipRefreshKey,
    partnerships,
    impactStories,
    loadingStories,
    metrics,
    handleSponsorshipSuccess,
  } = useOrgDashboard();

  const getRoleInfo = () => {
    switch (profile?.user_role) {
      case "business":
        return {
          title: t('organization.regional_impact_hub'),
          subtitle: t('organization.corporate_environmental_impact'),
          gradient: "from-accent to-secondary",
          icon: Building2
        };
      case "government":
        return {
          title: t('organization.municipal_impact_hub'), 
          subtitle: t('organization.urban_sustainability_coordination'),
          gradient: "from-warning to-destructive",
          icon: MapPin
        };
      case "ngo":
        return {
          title: t('organization.ngo_impact_hub'),
          subtitle: t('organization.community_environmental_initiatives'), 
          gradient: "from-success to-primary",
          icon: Heart
        };
      default:
        return {
          title: t('organization.regional_impact_hub'),
          subtitle: t('organization.community_sustainability_participation'),
          gradient: "from-primary to-success", 
          icon: Building2
        };
    }
  };

  const roleInfo = getRoleInfo();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user || profile?.user_role === "citizen") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 xl:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <OrgDashboardHeader 
            profile={profile}
            roleInfo={roleInfo}
            partnerships={partnerships}
            t={t}
          />
          <CreateEventDialog 
            trigger={
              <Button className="gap-2 shrink-0">
                <CalendarPlus className="w-4 h-4" />
                {t('events.create')}
              </Button>
            }
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6 sm:space-y-8">
          <TabsList className="inline-flex w-full overflow-x-auto bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2 gap-2">
            <TabsTrigger value="overview" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm whitespace-nowrap">
              <LayoutDashboard className="w-4 h-4" />
              <span>Áttekintés</span>
            </TabsTrigger>
            <TabsTrigger value="sponsorships" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm whitespace-nowrap">
              <Heart className="w-4 h-4" />
              <span>Szponzorálások</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm whitespace-nowrap">
              <Building2 className="w-4 h-4" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm whitespace-nowrap">
              <CreditCard className="w-4 h-4" />
              <span>Előfizetés</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm whitespace-nowrap">
              <Coins className="w-4 h-4" />
              <span>Kreditek</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm whitespace-nowrap">
              <Receipt className="w-4 h-4" />
              <span>Számlák</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center justify-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-xl transition-smooth text-xs sm:text-sm whitespace-nowrap">
              <Users className="w-4 h-4" />
              <span>Csapat</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OrgOverviewTab 
              metrics={metrics}
              organizationId={profile?.organization_id}
              onNavigateToSponsorships={() => setSelectedTab("sponsorships")}
              onOpenSponsorModal={() => setSponsorModalOpen(true)}
              onOpenMobilizeModal={() => setMobilizeModalOpen(true)}
              t={t}
            />
          </TabsContent>

          {/* Sponsorships Tab */}
          <TabsContent value="sponsorships">
            <OrgSponsorshipsTab 
              partnerships={partnerships}
              impactStories={impactStories}
              loadingStories={loadingStories}
              sponsorshipRefreshKey={sponsorshipRefreshKey}
              onOpenSponsorModal={() => setSponsorModalOpen(true)}
              t={t}
            />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <OrganizationProfileEditor />
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <OrganizationSubscription />
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            <OrganizationCredits />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <OrganizationInvoices />
          </TabsContent>

          {/* Team/Employees Tab */}
          <TabsContent value="team" className="space-y-6">
            <OrganizationEmployees />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <MobilizeTeamModal 
        open={mobilizeModalOpen} 
        onOpenChange={setMobilizeModalOpen} 
      />
      <OrganizationSponsorModal
        open={sponsorModalOpen}
        onOpenChange={setSponsorModalOpen}
        onSuccess={handleSponsorshipSuccess}
      />
    </div>
  );
};

export default OrganizationDashboard;
