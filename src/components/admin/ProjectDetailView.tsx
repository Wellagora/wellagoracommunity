import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";
import { ProgramCreator } from "./ProgramCreator";

interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages?: string[];
  description?: string;
  is_active: boolean;
}

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  draftChallenges: any[];
  activePrograms: any[];
  onRefresh: () => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Energia': 'bg-amber-500',
    'Közlekedés': 'bg-blue-500',
    'Hulladék': 'bg-green-500',
    'Víz': 'bg-cyan-500',
    'Biodiverzitás': 'bg-emerald-500',
    'Közösség': 'bg-purple-500',
    'Oktatás': 'bg-pink-500',
  };
  return colors[category] || 'bg-gray-500';
};

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    'beginner': 'bg-green-100 text-green-800 border-green-300',
    'intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'advanced': 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-800';
};

export default function ProjectDetailView({ 
  project, 
  onBack, 
  draftChallenges,
  activePrograms,
  onRefresh 
}: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState("programs");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza a projektekhez
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <CardDescription className="text-base mt-2">{project.region_name}</CardDescription>
            </div>
            <Badge variant={project.is_active ? "default" : "secondary"} className="text-base px-3 py-1">
              {project.is_active ? "Aktív" : "Inaktív"}
            </Badge>
          </div>
        </CardHeader>
        {project.villages && project.villages.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.villages.map((village, idx) => (
                <Badge key={idx} variant="outline">
                  {village}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabs for Programs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="programs">Új program létrehozása</TabsTrigger>
          <TabsTrigger value="draft">Draft programok ({draftChallenges.length})</TabsTrigger>
          <TabsTrigger value="active">Aktív programok ({activePrograms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Új program létrehozása</CardTitle>
              <CardDescription>
                Hozz létre egy új fenntarthatósági programot a {project.name} projekthez
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramCreator 
                onSuccess={() => {
                  onRefresh();
                  setActiveTab("draft");
                }}
                defaultProjectId={project.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft programok</CardTitle>
              <CardDescription>
                Ezeket a programokat létrehoztad, de még nem tetted közzé
              </CardDescription>
            </CardHeader>
            <CardContent>
              {draftChallenges.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Még nincsenek draft programok. Hozz létre egyet!
                </p>
              ) : (
                <div className="space-y-4">
                  {draftChallenges.map((challenge) => (
                    <div key={challenge.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(challenge.category)}>
                              {challenge.category}
                            </Badge>
                            <Badge className={getDifficultyColor(challenge.difficulty)} variant="secondary">
                              {challenge.difficulty}
                            </Badge>
                            <Badge variant="outline">Draft</Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-primary">{challenge.points_base}</div>
                          <div className="text-xs text-muted-foreground">pont</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.duration_days} nap</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktív programok</CardTitle>
              <CardDescription>A projekt alatt jelenleg futó programok</CardDescription>
            </CardHeader>
            <CardContent>
              {activePrograms.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Még nincsenek aktív programok. Hozz létre új programokat vagy tedd közzé a draft programokat.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePrograms.map((program) => (
                    <Card key={program.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-2">{program.title}</CardTitle>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge className={getCategoryColor(program.category)}>
                                {program.category}
                              </Badge>
                              <Badge variant="outline" className={getDifficultyColor(program.difficulty)}>
                                {program.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-500 shrink-0">
                            Aktív
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {program.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{program.duration_days} nap</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            <span>{program.points_base} pont</span>
                          </div>
                        </div>

                        {program.location && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium mb-1">Helyszín:</p>
                            <p className="text-xs text-muted-foreground">{program.location}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setEditingProgramId(program.id);
                            }}
                          >
                            Szerkesztés
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
