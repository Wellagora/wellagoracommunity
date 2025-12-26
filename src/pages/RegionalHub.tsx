import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegionalHub } from '@/hooks/useRegionalHub';
import { RegionalHubHeader } from '@/components/regional/RegionalHubHeader';
import { RegionalStakeholderList } from '@/components/regional/RegionalStakeholderList';
import { RegionalChallengesTab } from '@/components/regional/RegionalChallengesTab';
import { RegionalSponsorshipTab } from '@/components/regional/RegionalSponsorshipTab';
import ChallengeSponsorshipModal from '@/components/challenges/ChallengeSponsorshipModal';
import ContactModal from '@/components/regional/ContactModal';
import { Map, Users, Target, TrendingUp } from 'lucide-react';

const RegionalHub = () => {
  const { t } = useLanguage();
  const {
    viewMode,
    selectedTypes,
    searchQuery,
    loadingStakeholders,
    selectedChallengeForSponsorship,
    contactModalOpen,
    selectedContact,
    currentProject,
    projectLoading,
    user,
    filteredProfiles,
    regionalChallenges,
    setViewMode,
    setSearchQuery,
    setSelectedChallengeForSponsorship,
    setContactModalOpen,
    setSelectedContact,
    handleTypeToggle,
    navigate,
    toast,
  } = useRegionalHub();

  // Loading state
  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 text-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // No project state
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 text-center">
          <Map className="w-24 h-24 mx-auto mb-6 text-primary opacity-50" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('regional.no_project')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('regional.join_project_desc')}
          </p>
          <Button onClick={() => navigate('/projects')} size="lg">
            {t('regional.view_projects')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-6 sm:pb-8">
        <RegionalHubHeader
          project={currentProject}
          registeredCount={filteredProfiles.filter(p => p.isRegistered).length}
          potentialCount={filteredProfiles.filter(p => !p.isRegistered).length}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto">
              <TabsTrigger value="stakeholders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('regional.partners')}</span>
                <span className="sm:hidden">{t('regional.partners_short')}</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('regional.challenges')}</span>
                <span className="sm:hidden">{t('regional.challenges_short')}</span>
              </TabsTrigger>
              <TabsTrigger value="sponsorship" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('regional.sponsorship')}</span>
                <span className="sm:hidden">{t('regional.sponsorship_short')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stakeholders">
              <RegionalStakeholderList
                stakeholders={filteredProfiles}
                loading={loadingStakeholders}
                selectedTypes={selectedTypes}
                searchQuery={searchQuery}
                regionName={currentProject.region_name}
                onTypeToggle={handleTypeToggle}
                onSearchChange={setSearchQuery}
                onContactClick={(name, userId) => {
                  setSelectedContact({ name, userId });
                  setContactModalOpen(true);
                }}
                onStakeholderClick={(stakeholder) => {
                  toast({
                    title: t('regional.stakeholder_selected'),
                    description: stakeholder.name,
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="challenges">
              <RegionalChallengesTab
                challenges={regionalChallenges}
                regionName={currentProject.region_name}
                userId={user?.id}
                onSponsorClick={(id, title) => setSelectedChallengeForSponsorship({ id, title })}
                onSponsorProfileClick={(organizationId, userId) => {
                  if (organizationId) {
                    navigate(`/organization/${organizationId}`);
                  } else if (userId) {
                    navigate(`/profile?userId=${userId}`);
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="sponsorship">
              <RegionalSponsorshipTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {selectedChallengeForSponsorship && (
        <ChallengeSponsorshipModal
          open={!!selectedChallengeForSponsorship}
          onOpenChange={(open) => !open && setSelectedChallengeForSponsorship(null)}
          challengeId={selectedChallengeForSponsorship.id}
          challengeTitle={selectedChallengeForSponsorship.title}
          region={currentProject.region_name}
        />
      )}

      {selectedContact && (
        <ContactModal
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
          recipientName={selectedContact.name}
          recipientUserId={selectedContact.userId}
        />
      )}
    </div>
  );
};

export default RegionalHub;
