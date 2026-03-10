import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  ExternalLink,
  RotateCcw,
  AlertTriangle,
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
  const queryClient = useQueryClient();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Confirmation dialogs state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [contentToAction, setContentToAction] = useState<ContentItem | null>(null);

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
        title: t('admin.content_approved') || 'Tartalom jóváhagyva és közzétéve!',
      });
      loadContents();
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    }
    setApproveDialogOpen(false);
    setContentToAction(null);
  };

  const rejectContent = async () => {
    if (!selectedContent || rejectionReason.trim().length < 10) return;

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
        title: t('admin.content_rejected') || 'Tartalom elutasítva',
      });
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedContent(null);
      loadContents();
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    }
  };

  const unpublishContent = async (contentId: string) => {
    const { error } = await supabase
      .from('expert_contents')
      .update({ 
        is_published: false,
        reviewed_by: null,
        reviewed_at: null,
      })
      .eq('id', contentId);

    if (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült visszavonni a közzétételt',
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('admin.content_unpublished') || 'Közzététel visszavonva',
      });
      loadContents();
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    }
    setUnpublishDialogOpen(false);
    setContentToAction(null);
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
      const featuredCount = contents.filter(c => c.is_published && c.is_featured && c.id !== contentId).length + (!currentStatus ? 1 : 0);
      if (!currentStatus) {
        toast({
          title: t('admin.content_featured') || 'Tartalom kiemelve!',
          description: `${t('admin.featured_count')?.replace('{count}', String(featuredCount)) || `Jelenleg ${featuredCount} tartalom van kiemelve`}`,
        });
      } else {
        toast({
          title: t('admin.content_unfeatured') || 'Kiemelés eltávolítva',
        });
      }
      loadContents();
    }
  };

  const deleteContent = async (contentId: string) => {
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
        title: t('admin.content_deleted') || 'Tartalom törölve',
      });
      loadContents();
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    }
    setDeleteDialogOpen(false);
    setDeleteConfirmText('');
    setContentToAction(null);
  };

  const reReviewContent = async (contentId: string) => {
    const { error } = await supabase
      .from('expert_contents')
      .update({
        rejected_at: null,
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
      })
      .eq('id', contentId);

    if (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült visszaállítani a tartalmat',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Tartalom visszahelyezve jóváhagyásra',
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
      free: { label: t('admin.access_free') || 'Támogatott', className: 'bg-blue-500/20 text-blue-400' },
      registered: { label: t('admin.access_registered') || 'Regisztrált', className: 'bg-blue-500/20 text-blue-400' },
      premium: { label: t('admin.access_premium') || 'Prémium', className: 'bg-amber-500/20 text-amber-400' },
      one_time_purchase: { label: t('admin.access_purchase') || 'Egyszeri', className: 'bg-purple-500/20 text-purple-400' },
    };
    const config = levels[level || 'free'] || levels.free;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'pending':
        return t('admin.no_pending') || '🎉 Nincs jóváhagyásra váró tartalom';
      case 'published':
        return t('admin.no_published') || '📭 Még nincs közzétett tartalom';
      case 'rejected':
        return t('admin.no_rejected') || '✅ Nincs elutasított tartalom';
      default:
        return 'Nincs tartalom';
    }
  };

  const handleApproveClick = (content: ContentItem) => {
    setContentToAction(content);
    setApproveDialogOpen(true);
  };

  const handleUnpublishClick = (content: ContentItem) => {
    setContentToAction(content);
    setUnpublishDialogOpen(true);
  };

  const handleDeleteClick = (content: ContentItem) => {
    setContentToAction(content);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
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
          {t('admin.moderation') || 'Moderáció'}
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
                <p className="text-sm text-muted-foreground">{t('admin.pending_tab') || 'Jóváhagyásra vár'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{publishedContents.length}</p>
                <p className="text-sm text-muted-foreground">{t('admin.published_tab') || 'Közzétett'}</p>
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
                <p className="text-sm text-muted-foreground">{t('admin.rejected_tab') || 'Elutasított'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#0A1930] border border-border/50">
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700] data-[state=active]:border-b-2 data-[state=active]:border-[#FFD700]"
          >
            <Clock className="h-4 w-4 mr-2" />
            {t('admin.pending_tab') || 'Jóváhagyásra vár'} ({pendingContents.length})
          </TabsTrigger>
          <TabsTrigger 
            value="published" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('admin.published_tab') || 'Közzétett'} ({publishedContents.length})
          </TabsTrigger>
          <TabsTrigger 
            value="rejected" 
            className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-400"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {t('admin.rejected_tab') || 'Elutasított'} ({rejectedContents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {getFilteredContents().length === 0 ? (
            <Card className="bg-[#112240] border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-xl text-muted-foreground">{getEmptyStateMessage()}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredContents().map((content) => (
                <Card 
                  key={content.id} 
                  className="bg-[#112240] border-border/50 overflow-hidden hover:border-[#FFD700]/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                    {content.thumbnail_url ? (
                      <img
                        src={content.thumbnail_url}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileCheck className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {content.is_featured && (
                      <Badge className="absolute top-2 right-2 bg-[#FFD700] text-black">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Kiemelt
                      </Badge>
                    )}
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute top-2 left-2 ${
                        content.rejected_at 
                          ? 'bg-red-500/90' 
                          : content.is_published 
                            ? 'bg-blue-500/90' 
                            : 'bg-amber-500/90'
                      }`}
                    >
                      {content.rejected_at 
                        ? (t('admin.rejected_tab') || 'Elutasított')
                        : content.is_published 
                          ? (t('admin.published_tab') || 'Közzétett')
                          : (t('admin.pending_tab') || 'Várakozik')
                      }
                    </Badge>
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
                        <CheckCircle className="h-3 w-3 text-[#FFD700]" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold line-clamp-2">{content.title}</h3>

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {getAccessLevelBadge(content.access_level)}
                      <Badge variant="outline">
                        {content.price_huf && content.price_huf > 0 
                          ? `${content.price_huf} Ft` 
                          : (t('admin.access_free') || 'Támogatott')
                        }
                      </Badge>
                    </div>

                    {/* Description */}
                    {content.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {content.description.length > 100 
                          ? `${content.description.substring(0, 100)}...` 
                          : content.description
                        }
                      </p>
                    )}

                    {/* Rejection reason for rejected tab */}
                    {content.rejected_at && content.rejection_reason && (
                      <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-muted-foreground italic">
                          <strong className="text-red-400">{t('admin.rejection_reason') || 'Elutasítás oka'}:</strong>{' '}
                          {content.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(content.created_at), 'yyyy. MM. dd.')}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedContent(content);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('admin.preview') || 'Előnézet'}
                      </Button>

                      {activeTab === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                            onClick={() => handleApproveClick(content)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('admin.approve') || 'Jóváhagyás'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                              setSelectedContent(content);
                              setRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {t('admin.reject') || 'Elutasítás'}
                          </Button>
                        </>
                      )}

                      {activeTab === 'published' && (
                        <>
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`feature-${content.id}`}
                              checked={content.is_featured}
                              onCheckedChange={() => toggleFeatured(content.id, content.is_featured)}
                              className="data-[state=checked]:bg-[#FFD700]"
                            />
                            <Label 
                              htmlFor={`feature-${content.id}`}
                              className={`text-sm cursor-pointer ${content.is_featured ? 'text-[#FFD700]' : 'text-muted-foreground'}`}
                            >
                              <Star className={`h-4 w-4 inline mr-1 ${content.is_featured ? 'fill-[#FFD700]' : ''}`} />
                              {t('admin.feature') || 'Kiemelés'}
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnpublishClick(content)}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            {t('admin.unpublish') || 'Visszavonás'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteClick(content)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t('admin.delete_content') || 'Törlés'}
                          </Button>
                        </>
                      )}

                      {activeTab === 'rejected' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700]/10"
                            onClick={() => reReviewContent(content.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            {t('admin.re_review') || 'Újra áttekintés'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteClick(content)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t('admin.delete_permanent') || 'Végleges törlés'}
                          </Button>
                        </>
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
            <DialogTitle className="text-xl">{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.thumbnail_url ? (
                <img
                  src={selectedContent.thumbnail_url}
                  alt={selectedContent.title}
                  className="w-full h-48 object-cover rounded"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                  <FileCheck className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedContent.creator?.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedContent.creator?.first_name?.[0]}{selectedContent.creator?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {selectedContent.creator?.first_name} {selectedContent.creator?.last_name}
                    </p>
                    {selectedContent.creator?.is_verified_expert && (
                      <Badge className="bg-[#FFD700] text-black">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Hitelesített
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedContent.creator?.email}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex gap-2 flex-wrap">
                {getAccessLevelBadge(selectedContent.access_level)}
                <Badge variant="outline">
                  {selectedContent.price_huf && selectedContent.price_huf > 0 
                    ? `${selectedContent.price_huf} Ft` 
                    : (t('admin.access_free') || 'Támogatott')
                  }
                </Badge>
                <Badge variant="outline">
                  {format(new Date(selectedContent.created_at), 'yyyy. MM. dd.')}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{selectedContent.description || 'Nincs leírás'}</p>
              
              {/* Content URL */}
              {selectedContent.content_url && (
                <a
                  href={selectedContent.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Tartalom megnyitása
                </a>
              )}

              {/* Quick Actions in Preview */}
              {!selectedContent.is_published && !selectedContent.rejected_at && (
                <DialogFooter className="gap-2">
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    onClick={() => {
                      setPreviewOpen(false);
                      handleApproveClick(selectedContent);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('admin.approve') || 'Jóváhagyás'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      setPreviewOpen(false);
                      setRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t('admin.reject') || 'Elutasítás'}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.reject') || 'Tartalom elutasítása'}</DialogTitle>
            <DialogDescription>
              Add meg az elutasítás okát a kreátor számára (minimum 10 karakter):
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('admin.rejection_reason_placeholder') || 'Add meg az elutasítás okát (min. 10 karakter)...'}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            {rejectionReason.length > 0 && rejectionReason.length < 10 && (
              <p className="text-sm text-red-400">
                Még {10 - rejectionReason.length} karakter szükséges
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>
              Mégse
            </Button>
            <Button
              variant="destructive"
              onClick={rejectContent}
              disabled={rejectionReason.trim().length < 10}
            >
              {t('admin.reject') || 'Elutasítás'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.approve_confirm_title') || 'Tartalom jóváhagyása'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.approve_confirm_text') || 'Biztosan közzéteszed ezt a tartalmat?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => contentToAction && approveContent(contentToAction.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('admin.approve') || 'Jóváhagyás'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={unpublishDialogOpen} onOpenChange={setUnpublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.unpublish_confirm_title') || 'Közzététel visszavonása'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.unpublish_confirm_text') || 'Biztosan visszavonod a közzétételt? A tartalom nem lesz látható a felhasználók számára.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => contentToAction && unpublishContent(contentToAction.id)}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              {t('admin.unpublish') || 'Visszavonás'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog - Extra Safety */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-red-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              {t('admin.delete_confirm_title') || '⚠️ Végleges törlés'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-red-500 font-bold text-base">
                {t('admin.delete_confirm_warning') || 'FIGYELEM: Ez a művelet NEM visszavonható! A tartalom véglegesen törlődik.'}
              </p>
              <p className="text-muted-foreground">
                A törlés megerősítéséhez írd be: <span className="font-mono font-bold">TÖRLÉS</span>
              </p>
              <Input
                placeholder={t('admin.delete_confirm_type') || 'Írd be: TÖRLÉS'}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="border-red-500/30 focus:border-red-500"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              Mégse
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteConfirmText !== 'TÖRLÉS'}
              onClick={() => contentToAction && deleteContent(contentToAction.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('admin.delete_permanent') || 'Végleges törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContentModerationPanel;
