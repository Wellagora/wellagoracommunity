import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Users, 
  Target, 
  Calendar,
  ChevronRight,
  Loader2 
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
  is_active: boolean;
}

interface ProjectMember {
  user_id: string;
  role: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    public_display_name: string | null;
  };
}

export function UserProgramsList() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    loadUserProjects();
  }, []);

  const loadUserProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData, error: memberError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const projectIds = memberData.map((m) => m.project_id);

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .eq("is_active", true);

      if (projectsError) throw projectsError;

      setProjects(projectsData || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadProjectParticipants = async (projectId: string) => {
    setLoadingParticipants(true);
    try {
      const { data, error } = await supabase
        .from("project_members")
        .select("user_id, role")
        .eq("project_id", projectId);

      if (error) throw error;

      if (!data || data.length === 0) {
        setParticipants([]);
        setLoadingParticipants(false);
        return;
      }

      // Get profile data for each user
      const userIds = data.map(m => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, public_display_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Merge member data with profile data
      const mergedData = data.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        return {
          user_id: member.user_id,
          role: member.role,
          profiles: profile ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
            public_display_name: profile.public_display_name
          } : {
            first_name: '',
            last_name: '',
            avatar_url: null,
            public_display_name: null
          }
        };
      });

      setParticipants(mergedData);
    } catch (error) {
    } finally {
      setLoadingParticipants(false);
    }
  };

  const toggleProjectDetails = (projectId: string) => {
    if (selectedProject === projectId) {
      setSelectedProject(null);
      setParticipants([]);
    } else {
      setSelectedProject(projectId);
      loadProjectParticipants(projectId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('dashboard.no_programs')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.no_programs_description')}
          </p>
          <Button onClick={() => navigate('/projects')} variant="outline">
            {t('dashboard.browse_programs')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleProjectDetails(project.id)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    {t('dashboard.active')}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {project.region_name}
                  </div>
                  {project.villages && project.villages.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {project.villages.length} {t('dashboard.villages')}
                    </div>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
                )}
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${selectedProject === project.id ? 'rotate-90' : ''}`} />
            </div>
          </CardHeader>
          
          {selectedProject === project.id && (
            <CardContent className="border-t bg-muted/20 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    {t('dashboard.participants')} ({participants.length})
                  </h4>
                  {loadingParticipants ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {participants.map((member) => (
                        <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.profiles?.avatar_url || ''} />
                            <AvatarFallback>
                              {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.profiles?.public_display_name || 
                               `${member.profiles?.first_name} ${member.profiles?.last_name}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t(`dashboard.role.${member.role}`)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    {t('dashboard.quick_actions')}
                  </h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/challenges')}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      {t('dashboard.browse_project_challenges')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(`/region/${project.slug}`)}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('dashboard.explore_region')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/community')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {t('dashboard.connect_community')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
