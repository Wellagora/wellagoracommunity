import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, Mail, Users, Languages, Shield, Sparkles, CalendarPlus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { ProjectsTab } from './dashboard/ProjectsTab';
import UserRoleManager from './UserRoleManager';
import MessagesManager from './MessagesManager';
import AIAnalyticsDashboard from './AIAnalyticsDashboard';
import LegalContentManager from './LegalContentManager';
import ProjectDetailView from './ProjectDetailView';
import TranslateAllButton from './TranslateAllButton';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { useState } from 'react';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'users' | 'legal' | 'ai_analytics' | 'settings'>('projects');

  const {
    draftChallenges,
    activePrograms,
    projects,
    loading,
    hasAdminAccess,
    defaultProjectId,
    selectedProject,
    stats,
    setSelectedProject,
    loadData,
    toggleProjectStatus,
  } = useAdminDashboard();

  if (!hasAdminAccess || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('admin.back_to_platform')}
        </Button>
        <div className="flex items-center gap-3">
          <CreateEventDialog 
            trigger={
              <Button className="gap-2">
                <CalendarPlus className="w-4 h-4" />
                {t('events.create')}
              </Button>
            }
          />
          <Button
            onClick={() => navigate('/translation-tool')}
            variant="outline"
            className="gap-2"
          >
            <Languages className="w-4 h-4" />
            {t('admin.translation_tool')}
          </Button>
          <Badge variant="outline" className="text-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('admin.ai_powered')}
          </Badge>
        </div>
      </div>
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.dashboard_title')}</h1>
          <p className="text-muted-foreground">
            {selectedProject 
              ? `${selectedProject.name} - ${t('admin.programs_management')}`
              : t('admin.projects_and_stats')
            }
          </p>
        </div>
      </div>

      {/* Show Project Detail View if a project is selected */}
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          draftChallenges={draftChallenges}
          activePrograms={activePrograms}
          onRefresh={() => loadData(selectedProject.id)}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-[750px]">
            <TabsTrigger value="projects">
              <Building2 className="w-4 h-4 mr-2" />
              {t('admin.tab_projects')}
            </TabsTrigger>
            <TabsTrigger value="messages">
              <Mail className="w-4 h-4 mr-2" />
              {t('admin.tab_messages')}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              {t('admin.tab_users')}
            </TabsTrigger>
            <TabsTrigger value="legal">
              <Shield className="w-4 h-4 mr-2" />
              {t('admin.tab_legal')}
            </TabsTrigger>
            <TabsTrigger value="ai_analytics">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('admin.tab_ai_analytics')}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              {t('admin.tab_settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <ProjectsTab
              projects={projects}
              stats={stats}
              defaultProjectId={defaultProjectId}
              onSelectProject={setSelectedProject}
              onToggleProjectStatus={toggleProjectStatus}
              onRefresh={() => loadData()}
            />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesManager />
          </TabsContent>

          <TabsContent value="users">
            <UserRoleManager />
          </TabsContent>

          <TabsContent value="legal">
            <LegalContentManager />
          </TabsContent>

          <TabsContent value="ai_analytics">
            <AIAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl">
              <TranslateAllButton />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminDashboard;
