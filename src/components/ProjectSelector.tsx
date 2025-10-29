import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function ProjectSelector() {
  const { currentProject, userProjects, setCurrentProject, isLoading } = useProject();
  const { t } = useLanguage();

  if (isLoading || userProjects.length === 0) {
    return null;
  }

  // Don't show selector if only one project
  if (userProjects.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="font-medium">{currentProject?.name}</span>
      </div>
    );
  }

  return (
    <Select
      value={currentProject?.id || ""}
      onValueChange={(value) => {
        const project = userProjects.find((p) => p.id === value);
        if (project) setCurrentProject(project);
      }}
    >
      <SelectTrigger className="w-[250px]">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder={t('project.select_project')} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {userProjects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
