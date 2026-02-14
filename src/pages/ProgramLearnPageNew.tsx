import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  FileText, 
  Video, 
  Music, 
  FileIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { awardPoints, WELLPOINTS_QUERY_KEY } from '@/lib/wellpoints';

interface Lesson {
  id: string;
  program_id: string;
  title: string;
  description: string | null;
  content_type: 'text' | 'video' | 'audio' | 'pdf';
  content: string | null;
  video_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  duration_minutes: number | null;
  is_free_preview: boolean;
  sort_order: number;
}

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  program_id: string;
  completed: boolean;
  progress_percent: number;
  completed_at: string | null;
}

const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getVimeoId = (url: string): string | null => {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const ProgramLearnPageNew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Fetch program
  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_contents')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch lessons
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['program-lessons', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_lessons')
        .select('*')
        .eq('program_id', id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!id,
  });

  // Fetch lesson progress
  const { data: progressData = [], isLoading: progressLoading } = useQuery({
    queryKey: ['lesson-progress', id, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('program_id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!id && !!user?.id,
  });

  // Check if user has purchased
  const { data: hasPurchased, isLoading: purchaseLoading } = useQuery({
    queryKey: ['program-purchase', id, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Check vouchers table for purchased/claimed access
      const { data: vouchers } = await supabase
        .from('vouchers')
        .select('id')
        .eq('content_id', id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);
      
      return (vouchers && vouchers.length > 0) || false;
    },
    enabled: !!id && !!user?.id,
  });

  const currentLesson = lessons[currentLessonIndex];
  const canAccessLesson = currentLesson?.is_free_preview || hasPurchased;

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          program_id: id!,
          completed: true,
          completed_at: new Date().toISOString(),
          progress_percent: 100,
        }, { 
          onConflict: 'user_id,lesson_id' 
        });
      
      if (error) throw error;
    },
    onSuccess: (_data, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', id, user?.id] });
      toast.success(t('lessons.completed'));

      // Award WellPoints for lesson completion
      if (user?.id) {
        awardPoints(user.id, 'lesson_completed', 'Lecke teljesítve', lessonId, 'lesson').catch(() => {});
        queryClient.invalidateQueries({ queryKey: WELLPOINTS_QUERY_KEY(user.id) });

        // Check if all lessons are now completed → award program_completed
        const otherCompleted = progressData.filter(p => p.lesson_id !== lessonId && p.completed).length;
        if (otherCompleted + 1 >= lessons.length && lessons.length > 0) {
          awardPoints(user.id, 'program_completed', 'Program teljesítve', id!, 'program').catch(() => {});
        }
      }
    },
    onError: () => {
      toast.error(t('lessons.error_saving'));
    },
  });

  const handleMarkComplete = () => {
    if (currentLesson) {
      markCompleteMutation.mutate(currentLesson.id);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progressData.some(p => p.lesson_id === lessonId && p.completed);
  };

  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    if (!canAccessLesson) {
      return (
        <Card className="bg-white/80 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('lessons.locked')}</h3>
            <p className="text-muted-foreground mb-6">
              Purchase this program to access all lessons
            </p>
            <Button onClick={() => navigate(`/programs/${id}`)}>
              View Program Details
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Render based on content type
    if (currentLesson.content_type === 'video' && currentLesson.video_url) {
      const youtubeId = getYouTubeId(currentLesson.video_url);
      const vimeoId = getVimeoId(currentLesson.video_url);

      if (youtubeId) {
        return (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={currentLesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      if (vimeoId) {
        return (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              title={currentLesson.title}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    if (currentLesson.content_type === 'audio' && currentLesson.audio_url) {
      return (
        <Card>
          <CardContent className="p-6">
            <audio controls className="w-full">
              <source src={currentLesson.audio_url} />
              Your browser does not support the audio element.
            </audio>
          </CardContent>
        </Card>
      );
    }

    if (currentLesson.content_type === 'text' && currentLesson.content) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{currentLesson.content}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentLesson.content_type === 'pdf' && currentLesson.pdf_url) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <FileIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-4">PDF Document</h3>
            <Button onClick={() => window.open(currentLesson.pdf_url!, '_blank')}>
              Open PDF
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">{t('lessons.content_coming')}</p>
        </CardContent>
      </Card>
    );
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'pdf': return <FileIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (programLoading || lessonsLoading || purchaseLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <div className="w-80 bg-white border-r min-h-screen p-6 hidden lg:block">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Program not found</h1>
            <Button onClick={() => navigate('/programs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h1 className="text-2xl font-bold mb-2">{t('lessons.content_coming')}</h1>
            <p className="text-muted-foreground mb-6">
              This program doesn't have any lessons yet.
            </p>
            <Button onClick={() => navigate(`/programs/${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Program
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white border-r min-h-screen p-6 hidden lg:block overflow-y-auto"
        >
          <Link
            to={`/programs/${id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Program
          </Link>

          <h2 className="font-bold text-lg mb-2 line-clamp-2">
            {program.title_hu || program.title}
          </h2>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t('lessons.progress')}</span>
              <span className="font-medium">{completedCount} / {lessons.length}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progressPercent)}% {t('lessons.completed')}
            </p>
          </div>

          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              const isCompleted = isLessonCompleted(lesson.id);
              const isCurrent = index === currentLessonIndex;
              const canAccess = lesson.is_free_preview || hasPurchased;

              return (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : canAccess ? (
                        getLessonIcon(lesson.content_type)
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm line-clamp-2">
                          {lesson.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-75">
                        {lesson.duration_minutes && (
                          <span>{lesson.duration_minutes} min</span>
                        )}
                        {lesson.is_free_preview && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {t('lessons.free_preview')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
          {/* Mobile back button */}
          <div className="lg:hidden mb-4">
            <Link
              to={`/programs/${id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Program
            </Link>
          </div>

          <motion.div
            key={currentLessonIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Lesson Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  Lesson {currentLessonIndex + 1} of {lessons.length}
                </Badge>
                {currentLesson?.is_free_preview && (
                  <Badge variant="secondary">{t('lessons.free_preview')}</Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {currentLesson?.title}
              </h1>
              {currentLesson?.description && (
                <p className="text-muted-foreground">
                  {currentLesson.description}
                </p>
              )}
            </div>

            {/* Lesson Content */}
            {renderLessonContent()}

            {/* Lesson Actions */}
            {canAccessLesson && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousLesson}
                    disabled={currentLessonIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {t('lessons.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextLesson}
                    disabled={currentLessonIndex === lessons.length - 1}
                  >
                    {t('lessons.next')}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                {!isLessonCompleted(currentLesson.id) && (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={markCompleteMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t('lessons.mark_complete')}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProgramLearnPageNew;
