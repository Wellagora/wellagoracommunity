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
  type: 'bug' | 'feature' | 'general' | 'complaint' | 'praise';
  subject: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved' | 'archived';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

const AdminFeedback = () => {
  const { t, language } = useLanguage();
  
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
      let query = supabase
        .from('feedback')
        .select(`
          *,
          user:profiles!user_id(id, first_name, last_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (activeStatusFilter !== 'all') {
        query = query.eq('status', activeStatusFilter);
      }

      if (activeTypeFilter !== 'all') {
        query = query.eq('type', activeTypeFilter);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setFeedback((data || []) as Feedback[]);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Hiba a visszajelzések betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [activeStatusFilter, activeTypeFilter]);

  // Get user display name
  const getUserName = (item: Feedback) => {
    if (!item.user) return 'Anonim';
    if (item.user.first_name && item.user.last_name) {
      return `${item.user.last_name} ${item.user.first_name}`;
    }
    return item.user.email;
  };

  // Counts (fetch separately for accurate totals)
  const [counts, setCounts] = useState({
    all: 0,
    new: 0,
    reviewed: 0,
    resolved: 0,
    archived: 0,
    bug: 0,
    feature: 0,
    general: 0,
    complaint: 0,
    praise: 0,
  });

  const fetchCounts = async () => {
    try {
      const { data } = await supabase
        .from('feedback')
        .select('status, type');

      if (data) {
        setCounts({
          all: data.length,
          new: data.filter(f => f.status === 'new').length,
          reviewed: data.filter(f => f.status === 'reviewed').length,
          resolved: data.filter(f => f.status === 'resolved').length,
          archived: data.filter(f => f.status === 'archived').length,
          bug: data.filter(f => f.type === 'bug').length,
          feature: data.filter(f => f.type === 'feature').length,
          general: data.filter(f => f.type === 'general').length,
          complaint: data.filter(f => f.type === 'complaint').length,
          praise: data.filter(f => f.type === 'praise').length,
        });
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

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
      const { error } = await supabase
        .from('feedback')
        .update({ 
          status: newStatus, 
          admin_notes: adminNotes
        })
        .eq('id', selectedFeedback.id);

      if (error) throw error;

      toast.success('Visszajelzés frissítve');
      setSelectedFeedback(null);
      fetchFeedback();
      fetchCounts();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Hiba a frissítés során');
    } finally {
      setIsSaving(false);
    }
  };

  // Get type icon and color
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'bug':
        return { icon: Bug, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', label: 'Hiba' };
      case 'feature':
        return { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', label: 'Funkció kérés' };
      case 'general':
        return { icon: MessageSquare, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', label: 'Általános' };
      case 'complaint':
        return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950', label: 'Panasz' };
      case 'praise':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', label: 'Dicséret' };
      default:
        return { icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800', label: 'Általános' };
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Új</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"><Clock className="h-3 w-3" />Átnézett</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="h-3 w-3" />Megoldott</Badge>;
      case 'archived':
        return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" />Archivált</Badge>;
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
            Visszajelzések
          </h1>
          <p className="text-muted-foreground">
            {counts.all} visszajelzés kezelése
          </p>
        </div>
        <Button variant="outline" onClick={() => { fetchFeedback(); fetchCounts(); }} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Frissítés
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", counts.new > 0 && "ring-2 ring-red-200 dark:ring-red-800")} onClick={() => setActiveStatusFilter('new')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Új</p>
                <p className="text-2xl font-bold text-red-600">{counts.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatusFilter('reviewed')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Átnézett</p>
                <p className="text-2xl font-bold text-blue-600">{counts.reviewed}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatusFilter('resolved')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Megoldott</p>
                <p className="text-2xl font-bold text-green-600">{counts.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatusFilter('archived')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archivált</p>
                <p className="text-2xl font-bold text-slate-600">{counts.archived}</p>
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
                Típus
              </Label>
              <Tabs value={activeTypeFilter} onValueChange={setActiveTypeFilter}>
                <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:grid-cols-6">
                  <TabsTrigger value="all">Összes</TabsTrigger>
                  <TabsTrigger value="bug" className="gap-1">
                    <Bug className="h-3 w-3" /> {counts.bug}
                  </TabsTrigger>
                  <TabsTrigger value="feature" className="gap-1">
                    <Lightbulb className="h-3 w-3" /> {counts.feature}
                  </TabsTrigger>
                  <TabsTrigger value="general" className="gap-1">
                    <MessageSquare className="h-3 w-3" /> {counts.general}
                  </TabsTrigger>
                  <TabsTrigger value="complaint" className="gap-1">
                    <AlertCircle className="h-3 w-3" /> {counts.complaint}
                  </TabsTrigger>
                  <TabsTrigger value="praise" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {counts.praise}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Státusz
              </Label>
              <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Összes</SelectItem>
                  <SelectItem value="new">Új</SelectItem>
                  <SelectItem value="reviewed">Átnézett</SelectItem>
                  <SelectItem value="resolved">Megoldott</SelectItem>
                  <SelectItem value="archived">Archivált</SelectItem>
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
        ) : feedback.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Még nem érkezett visszajelzés</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          feedback.map((item) => {
            const typeInfo = getTypeInfo(item.type);
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
                      </div>

                      {/* Subject */}
                      <p className="text-foreground font-semibold mb-1">
                        {item.subject}
                      </p>

                      {/* Message */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.message}
                      </p>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getUserName(item)}
                        </span>
                        {item.admin_notes && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <StickyNote className="h-3 w-3" />
                            Jegyzet
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
                    const info = getTypeInfo(selectedFeedback.type);
                    const Icon = info.icon;
                    return <Icon className={cn("h-5 w-5", info.color)} />;
                  })()}
                  Visszajelzés Részletek
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* Status & Type */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getTypeInfo(selectedFeedback.type).color}>
                  {getTypeInfo(selectedFeedback.type).label}
                </Badge>
                {getStatusBadge(selectedFeedback.status)}
              </div>

              {/* Subject */}
              <div>
                <Label className="text-sm font-medium mb-1 block">Tárgy</Label>
                <p className="text-foreground font-semibold">{selectedFeedback.subject}</p>
              </div>

              {/* Message */}
              <div>
                <Label className="text-sm font-medium mb-1 block">Üzenet</Label>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {selectedFeedback.message}
                  </p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" /> Feladó:
                  </span>
                  <span className="font-medium">{getUserName(selectedFeedback)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Beküldve:
                  </span>
                  <span className="font-medium">
                    {new Date(selectedFeedback.created_at).toLocaleString('hu-HU')}
                  </span>
                </div>
              </div>

              {/* Status Change */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Státusz módosítása
                </Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Feedback['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Új</SelectItem>
                    <SelectItem value="reviewed">Átnézett</SelectItem>
                    <SelectItem value="resolved">Megoldott</SelectItem>
                    <SelectItem value="archived">Archivált</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Admin jegyzet
                </Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Belső megjegyzések..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
              Mégse
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? 'Mentés...' : 'Mentés'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedback;
