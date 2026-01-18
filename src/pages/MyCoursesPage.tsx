import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2,
  ArrowLeft,
  Clock,
  Star,
  Store
} from "lucide-react";
import { motion } from "framer-motion";

interface EnrolledProgram {
  id: string;
  content_id: string;
  purchased_at: string;
  access_type: string;
  content: {
    id: string;
    title: string;
    title_en?: string;
    title_de?: string;
    thumbnail_url: string | null;
    image_url: string | null;
    category: string | null;
    creator_id: string;
    creator?: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  };
  progress?: number;
}

const MyCoursesPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();
  const [enrolledPrograms, setEnrolledPrograms] = useState<EnrolledProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEnrolledPrograms();
    }
  }, [user]);

  const loadEnrolledPrograms = async () => {
    try {
      // Get user's content access records
      const { data, error } = await supabase
        .from("content_access")
        .select(`
          id,
          content_id,
          purchased_at,
          access_type,
          content:expert_contents (
            id,
            title,
            title_en,
            title_de,
            thumbnail_url,
            image_url,
            category,
            creator_id,
            creator:profiles!expert_contents_creator_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      
      // Filter out null content and add mock progress
      const validPrograms = (data || [])
        .filter(item => item.content !== null)
        .map(item => ({
          ...item,
          content: item.content as EnrolledProgram["content"],
          progress: Math.floor(Math.random() * 100), // Mock progress for now
        }));

      setEnrolledPrograms(validPrograms);
    } catch (error) {
      console.error("Error loading enrolled programs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="md:hidden">
            <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-foreground" />
            <h1 className="text-xl font-semibold">{t("my_courses.title")}</h1>
          </div>
        </div>

        {/* Stats Bar */}
        {enrolledPrograms.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {enrolledPrograms.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("my_courses.total_courses")}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {enrolledPrograms.filter(p => p.progress === 100).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("my_courses.completed")}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {enrolledPrograms.filter(p => (p.progress || 0) > 0 && (p.progress || 0) < 100).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("my_courses.in_progress")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Courses List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : enrolledPrograms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t("my_courses.empty")}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {t("my_courses.empty_desc")}
            </p>
            <Link to="/piacer">
              <Button className="min-h-[44px] bg-black hover:bg-black/90 text-white">
                <Store className="w-4 h-4 mr-2" />
                {t("my_courses.browse_marketplace")}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {enrolledPrograms.map((program, index) => {
              const localizedTitle = getLocalizedField(program.content as Record<string, unknown>, 'title');
              const isCompleted = program.progress === 100;
              const hasStarted = (program.progress || 0) > 0;
              
              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/piacer/${program.content_id}/learn`}>
                    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 touch-manipulation active:scale-[0.98]">
                      <CardContent className="p-0">
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-28 h-28 shrink-0 relative bg-muted">
                            {program.content.thumbnail_url || program.content.image_url ? (
                              <img
                                src={program.content.thumbnail_url || program.content.image_url || ""}
                                alt={localizedTitle || ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            {isCompleted && (
                              <div className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 py-3 pr-4">
                            <h3 className="font-medium text-foreground line-clamp-1 mb-1">
                              {localizedTitle}
                            </h3>
                            
                            {program.content.creator && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {program.content.creator.first_name} {program.content.creator.last_name}
                              </p>
                            )}

                            {/* Progress */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {isCompleted 
                                    ? t("my_courses.completed") 
                                    : hasStarted 
                                      ? t("my_courses.in_progress")
                                      : t("my_courses.not_started")
                                  }
                                </span>
                                <span className="font-medium">{program.progress || 0}%</span>
                              </div>
                              <Progress value={program.progress || 0} className="h-1.5" />
                            </div>

                            {/* Access Type Badge */}
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {program.access_type === "sponsored" 
                                  ? t("my_courses.sponsored") 
                                  : t("my_courses.purchased")
                                }
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
