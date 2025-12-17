import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
  branding: any;
  settings: any;
  is_active: boolean;
}

interface ProjectContextType {
  currentProject: Project | null;
  userProjects: Project[];
  isLoading: boolean;
  setCurrentProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentProject = (project: Project | null) => {
    setCurrentProjectState(project);
    if (project) {
      localStorage.setItem("currentProjectId", project.id);
    } else {
      localStorage.removeItem("currentProjectId");
    }
  };

  const refreshProjects = async () => {
    if (!user) {
      setUserProjects([]);
      setCurrentProjectState(null);
      setIsLoading(false);
      return;
    }

    try {
      // Get user's projects
      const { data: memberData, error: memberError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setUserProjects([]);
        setCurrentProjectState(null);
        setIsLoading(false);
        return;
      }

      const projectIds = memberData.map((m) => m.project_id);

      // Get project details
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .eq("is_active", true);

      if (projectsError) throw projectsError;

      setUserProjects(projects || []);

      // Set current project
      const savedProjectId = localStorage.getItem("currentProjectId");
      
      if (savedProjectId && projects?.find((p) => p.id === savedProjectId)) {
        const project = projects.find((p) => p.id === savedProjectId);
        setCurrentProjectState(project || null);
      } else if (projects && projects.length > 0) {
        setCurrentProjectState(projects[0]);
        localStorage.setItem("currentProjectId", projects[0].id);
      }
    } catch (error) {
      logger.error('Error loading projects', error, 'Project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [user]);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        userProjects,
        isLoading,
        setCurrentProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
