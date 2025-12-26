import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  // Intelligent redirect: if only one project exists, go directly to join page
  useEffect(() => {
    if (!loading && projects.length === 1) {
      navigate(`/join/${projects[0].slug}`);
    }
  }, [loading, projects, navigate]);

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
      // Silent fail - UI handles empty state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 mt-14 sm:mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              {t('projects.title')}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              {t('projects.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">{t('projects.loading')}</p>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t('projects.no_projects')}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('projects.no_projects_desc')}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl sm:text-2xl mb-2">{project.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm sm:text-base">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          {project.region_name}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="text-xs sm:text-sm">{t('projects.active')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {project.description && (
                      <p className="text-sm sm:text-base text-muted-foreground">{project.description}</p>
                    )}

                    {project.villages && project.villages.length > 0 && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          {t('projects.participating_villages')}
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {project.villages.map((village, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {village}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link to={`/join/${project.slug}`} className="block">
                      <Button className="w-full text-sm sm:text-base" size="lg">
                        {t('projects.join_project')}
                        <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 sm:mt-12 text-center px-4">
            <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t('projects.help_title')}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('projects.help_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="lg" className="text-sm sm:text-base">
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
