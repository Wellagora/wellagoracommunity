import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { toast } from 'sonner';
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Award,
  Mail,
  Calendar,
  Briefcase
} from 'lucide-react';

interface Expert {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  specialization: string | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  programs_count: number;
  created_at: string;
  expert_title?: string | null;
}

// Mock experts for demo mode
const MOCK_EXPERTS: Expert[] = [
  {
    id: 'exp-1',
    full_name: 'Dr. Kovács István',
    email: 'kovacs@example.com',
    avatar_url: null,
    specialization: 'Gasztronómia',
    verification_status: 'pending',
    programs_count: 3,
    created_at: '2025-12-15T10:00:00Z',
    expert_title: 'Mesterszakács'
  },
  {
    id: 'exp-2',
    full_name: 'Nagy Eszter',
    email: 'nagy@example.com',
    avatar_url: null,
    specialization: 'Fenntarthatóság',
    verification_status: 'pending',
    programs_count: 2,
    created_at: '2025-12-20T14:00:00Z',
    expert_title: 'Öko tanácsadó'
  },
  {
    id: 'exp-3',
    full_name: 'Szabó Péter',
    email: 'szabo@example.com',
    avatar_url: null,
    specialization: 'Outdoor',
    verification_status: 'verified',
    programs_count: 5,
    created_at: '2025-10-01T09:00:00Z',
    expert_title: 'Túravezető'
  },
  {
    id: 'exp-4',
    full_name: 'Tóth Anna',
    email: 'toth@example.com',
    avatar_url: null,
    specialization: 'Jóllét',
    verification_status: 'verified',
    programs_count: 4,
    created_at: '2025-09-15T11:00:00Z',
    expert_title: 'Jóga oktató'
  },
  {
    id: 'exp-5',
    full_name: 'Kiss Gábor',
    email: 'kiss@example.com',
    avatar_url: null,
    specialization: 'Mezőgazdaság',
    verification_status: 'rejected',
    programs_count: 0,
    created_at: '2025-11-01T08:00:00Z',
    expert_title: 'Biogazda'
  },
];

const AdminExperts = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();

  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'verify' | 'reject' | null;
    expert: Expert | null;
  }>({ open: false, action: null, expert: null });

  // Fetch experts
  const fetchExperts = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setExperts(MOCK_EXPERTS);
      } else {
        // Query for both 'expert' and 'creator' roles to match all expert profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url, expert_title, verification_status, created_at')
          .in('user_role', ['expert', 'creator'])
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get program counts for each expert
        const expertsWithCounts = await Promise.all(
          (data || []).map(async (profile) => {
            const { count } = await supabase
              .from('expert_contents')
              .select('*', { count: 'exact', head: true })
              .eq('creator_id', profile.id);

            return {
              id: profile.id,
              full_name: `${profile.first_name} ${profile.last_name}`,
              email: profile.email,
              avatar_url: profile.avatar_url,
              specialization: profile.expert_title,
              verification_status: (profile.verification_status || 'unverified') as Expert['verification_status'],
              programs_count: count || 0,
              created_at: profile.created_at,
              expert_title: profile.expert_title
            };
          })
        );

        setExperts(expertsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
      toast.error(t('admin.experts.error') || 'Error loading experts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, [isDemoMode]);

  // Filter experts
  const getFilteredExperts = () => {
    let filtered = experts;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(e => e.verification_status === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.full_name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.specialization?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredExperts = getFilteredExperts();

  // Count by status
  const counts = {
    all: experts.length,
    pending: experts.filter(e => e.verification_status === 'pending').length,
    verified: experts.filter(e => e.verification_status === 'verified').length,
    rejected: experts.filter(e => e.verification_status === 'rejected').length,
  };

  // Handle verification action
  const handleAction = async () => {
    if (!confirmDialog.expert || !confirmDialog.action) return;

    const newStatus = confirmDialog.action === 'verify' ? 'verified' : 'rejected';

    try {
      if (isDemoMode) {
        setExperts(prev =>
          prev.map(e =>
            e.id === confirmDialog.expert!.id
              ? { ...e, verification_status: newStatus }
              : e
          )
        );
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ verification_status: newStatus })
          .eq('id', confirmDialog.expert.id);

        if (error) throw error;
        fetchExperts();
      }

      toast.success(
        confirmDialog.action === 'verify'
          ? t('admin.experts.verify_success')
          : t('admin.experts.reject_success')
      );
    } catch (error) {
      console.error('Error updating expert:', error);
      toast.error(t('admin.experts.error') || 'Error updating expert');
    } finally {
      setConfirmDialog({ open: false, action: null, expert: null });
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{t('admin.experts.pending')}</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{t('admin.experts.verified')}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{t('admin.experts.rejected')}</Badge>;
      default:
        return <Badge variant="secondary">Unverified</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.experts.title')}</h1>
          <p className="text-muted-foreground">{t('admin.experts.subtitle')}</p>
        </div>
        <Button variant="outline" onClick={fetchExperts} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('common.refresh') || 'Refresh'}
        </Button>
      </div>

      {/* Pending Alert */}
      {counts.pending > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            {counts.pending} {t('admin.experts.pending_alert')}
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            {t('admin.experts.pending_alert_desc')}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              {t('admin.experts.all')}
              <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              {t('admin.experts.pending')}
              <Badge variant={counts.pending > 0 ? 'destructive' : 'secondary'} className="ml-1">
                {counts.pending}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              {t('admin.experts.verified')}
              <Badge variant="secondary" className="ml-1">{counts.verified}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              {t('admin.experts.rejected')}
              <Badge variant="secondary" className="ml-1">{counts.rejected}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search') || 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExperts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'pending' 
                    ? t('admin.experts.no_pending') 
                    : t('admin.experts.no_experts')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExperts.map((expert) => (
                <Card key={expert.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={expert.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(expert.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold truncate">{expert.full_name}</h3>
                            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {expert.email}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {t('admin.experts.view_profile')}
                              </DropdownMenuItem>
                              {expert.verification_status !== 'verified' && (
                                <DropdownMenuItem
                                  onClick={() => setConfirmDialog({ open: true, action: 'verify', expert })}
                                  className="text-emerald-600"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  {t('admin.experts.verify')}
                                </DropdownMenuItem>
                              )}
                              {expert.verification_status !== 'rejected' && (
                                <DropdownMenuItem
                                  onClick={() => setConfirmDialog({ open: true, action: 'reject', expert })}
                                  className="text-red-600"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  {t('admin.experts.reject')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-3 space-y-2">
                          {expert.specialization && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              {expert.specialization}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Award className="h-3 w-3" />
                            {expert.programs_count} {t('common.programs') || 'programs'}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(expert.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          {getStatusBadge(expert.verification_status)}

                          {expert.verification_status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                                onClick={() => setConfirmDialog({ open: true, action: 'verify', expert })}
                              >
                                <UserCheck className="h-3 w-3 mr-1" />
                                {t('admin.experts.verify')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => setConfirmDialog({ open: true, action: 'reject', expert })}
                              >
                                <UserX className="h-3 w-3 mr-1" />
                                {t('admin.experts.reject')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, expert: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'verify'
                ? t('admin.experts.verify')
                : t('admin.experts.reject')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'verify'
                ? t('admin.experts.verify_confirm')
                : t('admin.experts.reject_confirm')}
              <br />
              <strong>{confirmDialog.expert?.full_name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={confirmDialog.action === 'verify' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {confirmDialog.action === 'verify'
                ? t('admin.experts.verify')
                : t('admin.experts.reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminExperts;
