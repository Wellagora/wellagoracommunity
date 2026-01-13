import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  StickyNote,
  Calendar,
  User,
  Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';

// Feedback type definition
interface Feedback {
  id: string;
  user_id: string | null;
  user_email: string | null;
  feedback_type: 'bug' | 'feature' | 'question' | 'other';
  message: string;
  page_url: string | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
  is_mock?: boolean;
}

// Mock feedback for demo mode
const MOCK_FEEDBACK: Feedback[] = [
  {
    id: 'mock-fb-1',
    user_id: 'mock-user-1',
    user_email: 'toth.eszter@example.com',
    feedback_type: 'bug',
    message: 'A program részletek oldal nem tölt be mobilon. Fehér képernyőt kapok.',
    page_url: '/piacer/program/123',
    status: 'new',
    admin_notes: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_mock: true
  },
  {
    id: 'mock-fb-2',
    user_id: 'mock-user-2',
    user_email: 'kovacs.janos@example.com',
    feedback_type: 'feature',
    message: 'Jó lenne, ha a szakértők tudnának csoportos üzenetet küldeni a résztvevőknek.',
    page_url: '/szakertoi-studio',
    status: 'in_progress',
    admin_notes: 'Roadmap-ra került, Q2-ben tervezzük.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    is_mock: true
  },
  {
    id: 'mock-fb-3',
    user_id: null,
    user_email: 'anonymous',
    feedback_type: 'question',
    message: 'Hogyan tudom megváltoztatni a profilképemet?',
    page_url: '/profil',
    status: 'resolved',
    admin_notes: 'Válaszoltunk emailben.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_mock: true
  },
  {
    id: 'mock-fb-4',
    user_id: 'mock-user-3',
    user_email: 'nagy.peter@example.com',
    feedback_type: 'bug',
    message: 'A voucher QR kód nem jelenik meg iOS-en Safari böngészőben.',
    page_url: '/iranyitopult',
    status: 'new',
    admin_notes: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    is_mock: true
  },
  {
    id: 'mock-fb-5',
    user_id: 'mock-user-4',
    user_email: 'szabo.anna@example.com',
    feedback_type: 'other',
    message: 'Nagyon szép a design! Gratulálok a csapatnak! 🎉',
    page_url: '/',
    status: 'closed',
    admin_notes: 'Köszönjük! 😊',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    is_mock: true
  },
  {
    id: 'mock-fb-6',
    user_id: 'mock-user-5',
    user_email: 'molnar.gabor@example.com',
    feedback_type: 'feature',
    message: 'Lehetne push notification amikor új program jelenik meg a közelemben?',
    page_url: '/piacer',
    status: 'new',
    admin_notes: null,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    is_mock: true
  },
  {
    id: 'mock-fb-7',
    user_id: 'mock-user-6',
    user_email: 'info@kalipanzio.hu',
    feedback_type: 'question',
    message: 'Hogyan tudok több kreditet vásárolni szponzorként?',
    page_url: '/tamogatoi-kozpont',
    status: 'new',
    admin_notes: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_mock: true
  },
];

const AdminFeedback = () => {
  const { t, language } = useLanguage();
  const { isDemoMode } = useAuth();
  
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  
  // Detail modal state
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<Feedback['status']>('new');
  const [isSaving, setIsSaving] = useState(false);

  // Date locale
  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

  // Helper for translations with params
  const tWithParams = (key: string, params?: Record<string, string | number>) => {
    let text = t(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, String(v));
      });
    }
    return text;
  };

  // Fetch feedback
  const fetchFeedback = async () => {
    setLoading(true);
    
    try {
      if (isDemoMode) {
        setFeedback(MOCK_FEEDBACK);
      } else {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        // Cast the data to our Feedback type
        setFeedback((data || []) as Feedback[]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error(t('admin.feedback_mgmt.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [isDemoMode]);

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    let result = feedback;

    if (activeTypeFilter !== 'all') {
      result = result.filter(f => f.feedback_type === activeTypeFilter);
    }

    if (activeStatusFilter !== 'all') {
      result = result.filter(f => f.status === activeStatusFilter);
    }

    return result;
  }, [feedback, activeTypeFilter, activeStatusFilter]);

  // Counts
  const counts = useMemo(() => ({
    all: feedback.length,
    new: feedback.filter(f => f.status === 'new').length,
    in_progress: feedback.filter(f => f.status === 'in_progress').length,
    resolved: feedback.filter(f => f.status === 'resolved').length,
    closed: feedback.filter(f => f.status === 'closed').length,
    bug: feedback.filter(f => f.feedback_type === 'bug').length,
    feature: feedback.filter(f => f.feedback_type === 'feature').length,
    question: feedback.filter(f => f.feedback_type === 'question').length,
    other: feedback.filter(f => f.feedback_type === 'other').length,
  }), [feedback]);

  // Open detail modal
  const handleOpenDetail = (item: Feedback) => {
    setSelectedFeedback(item);
    setAdminNotes(item.admin_notes || '');
    setNewStatus(item.status);
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!selectedFeedback) return;

    setIsSaving(true);

    try {
      if (isDemoMode || selectedFeedback.is_mock) {
        // Demo mode: update local state
        setFeedback(prev => prev.map(f => 
          f.id === selectedFeedback.id 
            ? { ...f, status: newStatus, admin_notes: adminNotes, updated_at: new Date().toISOString() }
            : f
        ));
      } else {
        // Real mode: update Supabase
        const { error } = await supabase
          .from('feedback')
          .update({ 
            status: newStatus, 
            admin_notes: adminNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedFeedback.id);

        if (error) throw error;

        setFeedback(prev => prev.map(f => 
          f.id === selectedFeedback.id 
            ? { ...f, status: newStatus, admin_notes: adminNotes, updated_at: new Date().toISOString() }
            : f
        ));
      }

      toast.success(t('admin.feedback_mgmt.updated'));
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error(t('admin.feedback_mgmt.update_error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Get type icon and color
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'bug':
        return { icon: Bug, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', label: t('admin.feedback_mgmt.type_bug') };
      case 'feature':
        return { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950', label: t('admin.feedback_mgmt.type_feature') };
      case 'question':
        return { icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', label: t('admin.feedback_mgmt.type_question') };
      default:
        return { icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800', label: t('admin.feedback_mgmt.type_other') };
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />{t('admin.feedback_mgmt.status_new')}</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"><Clock className="h-3 w-3" />{t('admin.feedback_mgmt.status_in_progress')}</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="h-3 w-3" />{t('admin.feedback_mgmt.status_resolved')}</Badge>;
      case 'closed':
        return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" />{t('admin.feedback_mgmt.status_closed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('admin.feedback_mgmt.title')}
          </h1>
          <p className="text-muted-foreground">
            {tWithParams('admin.feedback_mgmt.subtitle', { count: feedback.length })}
          </p>
        </div>
        <Button variant="outline" onClick={fetchFeedback} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          {t('admin.feedback_mgmt.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", counts.new > 0 && "ring-2 ring-red-200 dark:ring-red-800")} onClick={() => setActiveStatusFilter('new')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.feedback_mgmt.status_new')}</p>
                <p className="text-2xl font-bold text-red-600">{counts.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatusFilter('in_progress')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.feedback_mgmt.status_in_progress')}</p>
                <p className="text-2xl font-bold text-amber-600">{counts.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatusFilter('resolved')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.feedback_mgmt.status_resolved')}</p>
                <p className="text-2xl font-bold text-green-600">{counts.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatusFilter('closed')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.feedback_mgmt.status_closed')}</p>
                <p className="text-2xl font-bold text-slate-600">{counts.closed}</p>
              </div>
              <XCircle className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type Filter */}
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground mb-2 block">
                {t('admin.feedback_mgmt.filter_type')}
              </Label>
              <Tabs value={activeTypeFilter} onValueChange={setActiveTypeFilter}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="all">{t('admin.feedback_mgmt.filter_all')}</TabsTrigger>
                  <TabsTrigger value="bug" className="gap-1">
                    <Bug className="h-3 w-3" /> {counts.bug}
                  </TabsTrigger>
                  <TabsTrigger value="feature" className="gap-1">
                    <Lightbulb className="h-3 w-3" /> {counts.feature}
                  </TabsTrigger>
                  <TabsTrigger value="question" className="gap-1">
                    <HelpCircle className="h-3 w-3" /> {counts.question}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Label className="text-sm text-muted-foreground mb-2 block">
                {t('admin.feedback_mgmt.filter_status')}
              </Label>
              <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.feedback_mgmt.filter_all')}</SelectItem>
                  <SelectItem value="new">{t('admin.feedback_mgmt.status_new')}</SelectItem>
                  <SelectItem value="in_progress">{t('admin.feedback_mgmt.status_in_progress')}</SelectItem>
                  <SelectItem value="resolved">{t('admin.feedback_mgmt.status_resolved')}</SelectItem>
                  <SelectItem value="closed">{t('admin.feedback_mgmt.status_closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-3">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-16 flex-1" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('admin.feedback_mgmt.no_feedback')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item) => {
            const typeInfo = getTypeInfo(item.feedback_type);
            const TypeIcon = typeInfo.icon;

            return (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenDetail(item)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Type Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      typeInfo.bg
                    )}>
                      <TypeIcon className={cn("h-5 w-5", typeInfo.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn("text-sm font-medium", typeInfo.color)}>
                          {typeInfo.label}
                        </span>
                        {getStatusBadge(item.status)}
                        {item.is_mock && (
                          <Badge variant="outline" className="text-xs">Demo</Badge>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-foreground line-clamp-2 mb-2">
                        {item.message}
                      </p>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.user_email || 'anonymous'}
                        </span>
                        {item.page_url && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {item.page_url}
                          </span>
                        )}
                        {item.admin_notes && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <StickyNote className="h-3 w-3" />
                            {t('admin.feedback_mgmt.has_notes')}
                          </span>
                        )}
                        <span className="flex items-center gap-1 ml-auto">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeedback && (
                <>
                  {(() => {
                    const info = getTypeInfo(selectedFeedback.feedback_type);
                    const Icon = info.icon;
                    return <Icon className={cn("h-5 w-5", info.color)} />;
                  })()}
                  {t('admin.feedback_mgmt.detail_title')}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* Status & Type */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getTypeInfo(selectedFeedback.feedback_type).color}>
                  {getTypeInfo(selectedFeedback.feedback_type).label}
                </Badge>
                {getStatusBadge(selectedFeedback.status)}
              </div>

              {/* Message */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>

              {/* Meta Info */}
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" /> {t('admin.feedback_mgmt.from')}:
                  </span>
                  <span className="font-medium">{selectedFeedback.user_email || 'anonymous'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {t('admin.feedback_mgmt.submitted')}:
                  </span>
                  <span className="font-medium">
                    {new Date(selectedFeedback.created_at).toLocaleString()}
                  </span>
                </div>
                {selectedFeedback.page_url && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Globe className="h-4 w-4" /> {t('admin.feedback_mgmt.page')}:
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      {selectedFeedback.page_url}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                )}
              </div>

              {/* Status Change */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('admin.feedback_mgmt.change_status')}
                </Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Feedback['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t('admin.feedback_mgmt.status_new')}</SelectItem>
                    <SelectItem value="in_progress">{t('admin.feedback_mgmt.status_in_progress')}</SelectItem>
                    <SelectItem value="resolved">{t('admin.feedback_mgmt.status_resolved')}</SelectItem>
                    <SelectItem value="closed">{t('admin.feedback_mgmt.status_closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('admin.feedback_mgmt.admin_notes')}
                </Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t('admin.feedback_mgmt.notes_placeholder')}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
              {t('admin.feedback_mgmt.cancel')}
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? t('admin.feedback_mgmt.saving') : t('admin.feedback_mgmt.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedback;
