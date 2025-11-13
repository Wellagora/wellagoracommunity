import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";
import { ProgramCreator } from "./ProgramCreator";
import { ProgramEditor } from "./ProgramEditor";

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
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Edit Program Dialog */}
      <Dialog open={!!editingProgramId} onOpenChange={(open) => !open && setEditingProgramId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Program szerkesztése</DialogTitle>
          </DialogHeader>
          {editingProgramId && (
            <ProgramEditor
              programId={editingProgramId}
              onSuccess={() => {
                setEditingProgramId(null);
                onRefresh();
              }}
              onCancel={() => setEditingProgramId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-xs sm:text-sm px-2 sm:px-4">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Vissza a projektekhez</span>
          <span className="sm:hidden">Vissza</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl break-words">{project.name}</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1 sm:mt-2">{project.region_name}</CardDescription>
            </div>
            <Badge variant={project.is_active ? "default" : "secondary"} className="text-sm sm:text-base px-2 sm:px-3 py-0.5 sm:py-1 self-start">
              {project.is_active ? "Aktív" : "Inaktív"}
            </Badge>
          </div>
        </CardHeader>
        {project.villages && project.villages.length > 0 && (
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {project.villages.map((village, idx) => (
                <Badge key={idx} variant="outline" className="text-xs sm:text-sm">
                  {village}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabs for Programs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex flex-col sm:flex-row h-auto sm:h-10 gap-1 sm:gap-0 p-1">
          <TabsTrigger value="programs" className="text-xs sm:text-sm w-full sm:w-auto whitespace-normal sm:whitespace-nowrap py-2 sm:py-1.5">
            Új program létrehozása
          </TabsTrigger>
          <TabsTrigger value="draft" className="text-xs sm:text-sm w-full sm:w-auto py-2 sm:py-1.5">
            Draft programok ({draftChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs sm:text-sm w-full sm:w-auto py-2 sm:py-1.5">
            Aktív programok ({activePrograms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Új program létrehozása</CardTitle>
              <CardDescription className="text-sm">
                Hozz létre új fenntarthatósági programot a közösség számára
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
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

        <TabsContent value="draft" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Draft programok</CardTitle>
              <CardDescription className="text-sm">
                Ezeket a programokat létrehoztad, de még nem tetted közzé
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {draftChallenges.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Még nincsenek draft programok. Hozz létre egyet!
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {draftChallenges.map((challenge) => (
                    <div key={challenge.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                            <Badge className={`${getCategoryColor(challenge.category)} text-xs`}>
                              {challenge.category}
                            </Badge>
                            <Badge className={`${getDifficultyColor(challenge.difficulty)} text-xs`} variant="secondary">
                              {challenge.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">Draft</Badge>
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg break-words">{challenge.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{challenge.description}</p>
                        </div>
                        <div className="text-left sm:text-right sm:ml-4 shrink-0">
                          <div className="text-lg sm:text-xl font-bold text-primary">{challenge.points_base}</div>
                          <div className="text-xs text-muted-foreground">pont</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{challenge.duration_days} nap</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Aktív programok</CardTitle>
              <CardDescription className="text-sm">A projekt alatt jelenleg futó programok</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {activePrograms.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Még nincsenek aktív programok. Hozz létre új programokat vagy tedd közzé a draft programokat.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {activePrograms.map((program) => (
                    <Card key={program.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm sm:text-base line-clamp-2 break-words">{program.title}</CardTitle>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                              <Badge className={`${getCategoryColor(program.category)} text-xs`}>
                                {program.category}
                              </Badge>
                              <Badge variant="outline" className={`${getDifficultyColor(program.difficulty)} text-xs`}>
                                {program.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-500 shrink-0 text-xs sm:text-sm self-start">
                            Aktív
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0">
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {program.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{program.duration_days} nap</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{program.points_base} pont</span>
                          </div>
                        </div>

                        {program.location && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium mb-1">Helyszín:</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{program.location}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
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
