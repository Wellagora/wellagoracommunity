import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, GripVertical, ChevronUp, ChevronDown, FileText, Video, Music, FileIcon } from 'lucide-react';

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
  created_at: string;
}

interface LessonEditorProps {
  programId: string;
}

export function LessonEditor({ programId }: LessonEditorProps) {
  const { t } = useLanguage();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'text' as 'text' | 'video' | 'audio' | 'pdf',
    content: '',
    video_url: '',
    audio_url: '',
    duration_minutes: '',
    is_free_preview: false
  });

  useEffect(() => {
    fetchLessons();
  }, [programId]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('program_lessons')
        .select('*')
        .eq('program_id', programId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error(t('lessons.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        description: lesson.description || '',
        content_type: lesson.content_type,
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        audio_url: lesson.audio_url || '',
        duration_minutes: lesson.duration_minutes?.toString() || '',
        is_free_preview: lesson.is_free_preview
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        description: '',
        content_type: 'text',
        content: '',
        video_url: '',
        audio_url: '',
        duration_minutes: '',
        is_free_preview: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLesson(null);
  };

  const handleSaveLesson = async () => {
    if (!formData.title.trim()) {
      toast.error(t('lessons.error_saving'));
      return;
    }

    try {
      const lessonData = {
        program_id: programId,
        title: formData.title,
        description: formData.description || null,
        content_type: formData.content_type,
        content: formData.content_type === 'text' ? formData.content : null,
        video_url: formData.content_type === 'video' ? formData.video_url : null,
        audio_url: formData.content_type === 'audio' ? formData.audio_url : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        is_free_preview: formData.is_free_preview,
        sort_order: editingLesson ? editingLesson.sort_order : lessons.length
      };

      if (editingLesson) {
        const { error } = await supabase
          .from('program_lessons')
          .update(lessonData)
          .eq('id', editingLesson.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('program_lessons')
          .insert(lessonData);

        if (error) throw error;
      }

      toast.success(t('lessons.lesson_saved'));
      handleCloseDialog();
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(t('lessons.error_saving'));
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm(t('lessons.delete_confirm'))) return;

    try {
      const { error } = await supabase
        .from('program_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast.success(t('lessons.lesson_deleted'));
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error(t('lessons.error_deleting'));
    }
  };

  const handleMoveLesson = async (lessonId: string, direction: 'up' | 'down') => {
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === lessons.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newLessons = [...lessons];
    [newLessons[currentIndex], newLessons[newIndex]] = [newLessons[newIndex], newLessons[currentIndex]];

    // Update sort_order for both lessons
    try {
      const updates = newLessons.map((lesson, index) => ({
        id: lesson.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('program_lessons')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setLessons(newLessons);
    } catch (error) {
      console.error('Error reordering lessons:', error);
      toast.error(t('lessons.error_saving'));
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'pdf': return <FileIcon className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('lessons.title')}</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t('lessons.add')}
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">{t('lessons.no_lessons')}</p>
            <p className="text-muted-foreground mb-4">{t('lessons.add_first')}</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {t('lessons.add')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveLesson(lesson.id, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveLesson(lesson.id, 'down')}
                      disabled={index === lessons.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getContentTypeIcon(lesson.content_type)}
                      <h3 className="font-semibold">{lesson.title}</h3>
                      {lesson.is_free_preview && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {t('lessons.free_preview')}
                        </span>
                      )}
                    </div>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{t(`lessons.content_type.${lesson.content_type}`)}</span>
                      {lesson.duration_minutes && (
                        <span>{t('lessons.duration', { minutes: lesson.duration_minutes })}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(lesson)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? t('lessons.edit') : t('lessons.add')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t('lessons.title_label')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('lessons.title_label')}
              />
            </div>

            <div>
              <Label htmlFor="description">{t('lessons.description_label')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('lessons.description_label')}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content_type">{t('lessons.content_type_label')}</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{t('lessons.content_type.text')}</SelectItem>
                  <SelectItem value="video">{t('lessons.content_type.video')}</SelectItem>
                  <SelectItem value="audio">{t('lessons.content_type.audio')}</SelectItem>
                  <SelectItem value="pdf">{t('lessons.content_type.pdf')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.content_type === 'text' && (
              <div>
                <Label htmlFor="content">{t('lessons.content_label')}</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('lessons.content_label')}
                  rows={10}
                />
              </div>
            )}

            {formData.content_type === 'video' && (
              <div>
                <Label htmlFor="video_url">{t('lessons.video_url_label')}</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}

            {formData.content_type === 'audio' && (
              <div>
                <Label htmlFor="audio_url">{t('lessons.audio_url_label')}</Label>
                <Input
                  id="audio_url"
                  value={formData.audio_url}
                  onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            <div>
              <Label htmlFor="duration">{t('lessons.duration_label')}</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder="30"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_free_preview"
                checked={formData.is_free_preview}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_free_preview: checked as boolean })
                }
              />
              <Label htmlFor="is_free_preview" className="cursor-pointer">
                {t('lessons.is_free_preview_label')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t('lessons.cancel')}
            </Button>
            <Button onClick={handleSaveLesson}>
              {t('lessons.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
