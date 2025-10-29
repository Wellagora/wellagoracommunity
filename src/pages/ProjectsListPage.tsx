import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, ArrowRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
  is_active: boolean;
}

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('projects.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('projects.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('projects.loading')}</p>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('projects.no_projects')}</CardTitle>
                <CardDescription>
                  {t('projects.no_projects_desc')}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-base">
                          <MapPin className="h-4 w-4" />
                          {project.region_name}
                        </CardDescription>
                      </div>
                      <Badge variant="default">{t('projects.active')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.description && (
                      <p className="text-muted-foreground">{project.description}</p>
                    )}

                    {project.villages && project.villages.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {t('projects.participating_villages')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.villages.map((village, index) => (
                            <Badge key={index} variant="secondary">
                              {village}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link to={`/join/${project.slug}`} className="block">
                      <Button className="w-full" size="lg">
                        {t('projects.join_project')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
              <CardHeader>
                <CardTitle>{t('projects.help_title')}</CardTitle>
                <CardDescription>
                  {t('projects.help_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="lg">
                  {t('projects.contact')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
