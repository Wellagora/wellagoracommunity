import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileCheck,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  content_url: string | null;
  access_level: string | null;
  price_huf: number | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  rejected_at: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  creator: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    is_verified_expert: boolean;
  };
}

const ContentModerationPanel = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadContents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expert_contents')
        .select(`
          *,
          creator:profiles!expert_contents_creator_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            is_verified_expert
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContents((data || []) as unknown as ContentItem[]);
    } catch (error) {
      console.error('Error loading contents:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült betölteni a tartalmakat',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveContent = async (contentId: string) => {
    const { error } = await supabase
      .from('expert_contents')
      .update({
        is_published: true,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        rejected_at: null,
        rejection_reason: null,
      })
      .eq('id', contentId);

    if (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült jóváhagyni a tartalmat',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Siker',
        description: 'Tartalom jóváhagyva és közzétéve',
      });
      loadContents();
    }
  };

  const rejectContent = async () => {
    if (!selectedContent || !rejectionReason.trim()) return;

    const { error } = await supabase
      .from('expert_contents')
      .update({
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        is_published: false,
      })
      .eq('id', selectedContent.id);

    if (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elutasítani a tartalmat',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Tartalom elutasítva',
        description: 'Az elutasítás oka mentve',
      });
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedContent(null);
      loadContents();
    }
  };

  const unpublishContent = async (contentId: string) => {
    const { error } = await supabase
      .from('expert_contents')
      .update({ is_published: false })
      .eq('id', contentId);

    if (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült visszavonni a közzétételt',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Közzététel visszavonva',
      });
      loadContents();
    }
  };

  const toggleFeatured = async (contentId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('expert_contents')
      .update({ is_featured: !currentStatus })
      .eq('id', contentId);

    if (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült frissíteni',
        variant: 'destructive',
      });
    } else {
      toast({
        title: !currentStatus ? 'Tartalom kiemelve' : 'Kiemelés visszavonva',
      });
      loadContents();
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a tartalmat?')) return;

    const { error } = await supabase
      .from('expert_contents')
      .delete()
      .eq('id', contentId);

    if (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült törölni a tartalmat',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Tartalom törölve',
      });
      loadContents();
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const pendingContents = contents.filter(c => !c.is_published && !c.rejected_at);
  const publishedContents = contents.filter(c => c.is_published);
  const rejectedContents = contents.filter(c => c.rejected_at);

  const getFilteredContents = () => {
    switch (activeTab) {
      case 'pending':
        return pendingContents;
      case 'published':
        return publishedContents;
      case 'rejected':
        return rejectedContents;
      default:
        return [];
    }
  };

  const getAccessLevelBadge = (level: string | null) => {
    const levels: Record<string, { label: string; className: string }> = {
      free: { label: 'Ingyenes', className: 'bg-green-500/20 text-green-400' },
      registered: { label: 'Regisztrált', className: 'bg-blue-500/20 text-blue-400' },
      premium: { label: 'Prémium', className: 'bg-amber-500/20 text-amber-400' },
      one_time_purchase: { label: 'Egyszeri', className: 'bg-purple-500/20 text-purple-400' },
    };
    const config = levels[level || 'free'] || levels.free;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-amber-500" />
          {t('admin.content_moderation')}
        </h2>
        <p className="text-muted-foreground">
          Szakértői tartalmak moderálása és közzététel kezelése
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{pendingContents.length}</p>
                <p className="text-sm text-muted-foreground">{t('admin.pending_content')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{publishedContents.length}</p>
                <p className="text-sm text-muted-foreground">Közzétett</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{rejectedContents.length}</p>
                <p className="text-sm text-muted-foreground">Elutasított</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#112240]">
          <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/20">
            <Clock className="h-4 w-4 mr-2" />
            Jóváhagyásra vár ({pendingContents.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="data-[state=active]:bg-emerald-500/20">
            <CheckCircle className="h-4 w-4 mr-2" />
            Közzétett ({publishedContents.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/20">
            <XCircle className="h-4 w-4 mr-2" />
            Elutasított ({rejectedContents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {getFilteredContents().length === 0 ? (
            <Card className="bg-[#112240] border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nincs tartalom ebben a kategóriában</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredContents().map((content) => (
                <Card key={content.id} className="bg-[#112240] border-border/50 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                    {content.thumbnail_url && (
                      <img
                        src={content.thumbnail_url}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {content.is_featured && (
                      <Badge className="absolute top-2 right-2 bg-amber-500">
                        <Star className="h-3 w-3 mr-1" />
                        Kiemelt
                      </Badge>
                    )}
                  </div>

                  <CardContent className="pt-4 space-y-3">
                    {/* Creator Info */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={content.creator?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {content.creator?.first_name?.[0]}{content.creator?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {content.creator?.first_name} {content.creator?.last_name}
                      </span>
                      {content.creator?.is_verified_expert && (
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold line-clamp-2">{content.title}</h3>

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {getAccessLevelBadge(content.access_level)}
                      {content.price_huf && (
                        <Badge variant="outline">{content.price_huf} Ft</Badge>
                      )}
                    </div>

                    {/* Description */}
                    {content.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {content.description}
                      </p>
                    )}

                    {/* Rejection reason for rejected tab */}
                    {content.rejected_at && content.rejection_reason && (
                      <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-red-400">
                          <strong>Elutasítás oka:</strong> {content.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(content.created_at), 'yyyy.MM.dd HH:mm')}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedContent(content);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('admin.preview')}
                      </Button>

                      {activeTab === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => approveContent(content.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('admin.approve')}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedContent(content);
                              setRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {t('admin.reject')}
                          </Button>
                        </>
                      )}

                      {activeTab === 'published' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeatured(content.id, content.is_featured)}
                          >
                            <Star className={`h-4 w-4 mr-1 ${content.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                            {t('admin.feature_content')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => unpublishContent(content.id)}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            {t('admin.unpublish')}
                          </Button>
                        </>
                      )}

                      {activeTab === 'rejected' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteContent(content.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Törlés
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.thumbnail_url && (
                <img
                  src={selectedContent.thumbnail_url}
                  alt={selectedContent.title}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedContent.creator?.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedContent.creator?.first_name?.[0]}{selectedContent.creator?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedContent.creator?.first_name} {selectedContent.creator?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedContent.creator?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {getAccessLevelBadge(selectedContent.access_level)}
                {selectedContent.price_huf && (
                  <Badge variant="outline">{selectedContent.price_huf} Ft</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{selectedContent.description}</p>
              {selectedContent.content_url && (
                <a
                  href={selectedContent.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Tartalom megnyitása →
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tartalom elutasítása</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Add meg az elutasítás okát a kreátor számára:
            </p>
            <Textarea
              placeholder="Elutasítás oka..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>
              Mégse
            </Button>
            <Button
              variant="destructive"
              onClick={rejectContent}
              disabled={!rejectionReason.trim()}
            >
              Elutasítás
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModerationPanel;
