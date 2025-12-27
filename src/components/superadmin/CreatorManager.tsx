import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Search,
  Sparkles,
  CheckCircle,
  XCircle,
  CreditCard,
  Eye,
  Ban,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface Creator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  is_verified_expert: boolean;
  stripe_onboarding_complete: boolean;
  payout_preference: string | null;
  wise_email: string | null;
  wise_iban: string | null;
  suspended_at: string | null;
  total_content: number;
  published_content: number;
}

interface ExpertContent {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  access_level: string | null;
  price_huf: number | null;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const CreatorManager = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [stripeFilter, setStripeFilter] = useState('all');
  const [contentFilter, setContentFilter] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [creatorContents, setCreatorContents] = useState<ExpertContent[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Debounced search (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadCreators = async () => {
    setLoading(true);
    try {
      // Get all creators
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url, bio, created_at, is_verified_expert, stripe_onboarding_complete, payout_preference, wise_email, wise_iban, suspended_at')
        .eq('user_role', 'creator')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get content counts for each creator (both total and published)
      const creatorsWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [totalRes, publishedRes] = await Promise.all([
            supabase
              .from('expert_contents')
              .select('*', { count: 'exact', head: true })
              .eq('creator_id', profile.id),
            supabase
              .from('expert_contents')
              .select('*', { count: 'exact', head: true })
              .eq('creator_id', profile.id)
              .eq('is_published', true),
          ]);

          return {
            ...profile,
            total_content: totalRes.count || 0,
            published_content: publishedRes.count || 0,
          } as Creator;
        })
      );

      setCreators(creatorsWithCounts);
    } catch (error) {
      console.error('Error loading creators:', error);
      toast({
        title: t('admin.error'),
        description: t('admin.load_error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCreatorContents = async (creatorId: string) => {
    const { data, error } = await supabase
      .from('expert_contents')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (!error) {
      setCreatorContents(data || []);
    }
  };

  const toggleVerification = async (creatorId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified_expert: !currentStatus })
      .eq('id', creatorId);

    if (error) {
      toast({
        title: t('admin.error'),
        description: 'Nem sikerült frissíteni a státuszt',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Siker',
        description: !currentStatus ? 'Szakértő hitelesítve!' : 'Hitelesítés visszavonva',
      });
      loadCreators();
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      if (selectedCreator?.id === creatorId) {
        setSelectedCreator(prev => prev ? { ...prev, is_verified_expert: !currentStatus } : null);
      }
    }
  };

  const suspendCreator = async (creatorId: string, isSuspended: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ suspended_at: isSuspended ? null : new Date().toISOString() })
      .eq('id', creatorId);

    if (error) {
      toast({
        title: t('admin.error'),
        description: t('admin.status_update_failed'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: isSuspended ? t('admin.creator_activated') : t('admin.creator_suspended'),
      });
      loadCreators();
      setSheetOpen(false);
    }
  };

  const openCreatorDetail = (creator: Creator) => {
    setSelectedCreator(creator);
    loadCreatorContents(creator.id);
    setSheetOpen(true);
  };

  useEffect(() => {
    loadCreators();
  }, []);

  // Filter with debounced search
  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      const matchesSearch =
        creator.first_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        creator.last_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        creator.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesVerification =
        verificationFilter === 'all' ||
        (verificationFilter === 'verified' && creator.is_verified_expert) ||
        (verificationFilter === 'not_verified' && !creator.is_verified_expert);

      const matchesStripe =
        stripeFilter === 'all' ||
        (stripeFilter === 'connected' && creator.stripe_onboarding_complete) ||
        (stripeFilter === 'not_connected' && !creator.stripe_onboarding_complete);

      const matchesContent =
        contentFilter === 'all' ||
        (contentFilter === 'has_content' && creator.total_content > 0) ||
        (contentFilter === 'no_content' && creator.total_content === 0);

      return matchesSearch && matchesVerification && matchesStripe && matchesContent;
    });
  }, [creators, debouncedSearchQuery, verificationFilter, stripeFilter, contentFilter]);

  // Active filter check for styling
  const isFilterActive = (filter: string, value: string) => {
    if (filter === 'verification') return verificationFilter === value;
    if (filter === 'stripe') return stripeFilter === value;
    if (filter === 'content') return contentFilter === value;
    return false;
  };

  const isAllFiltersDefault = verificationFilter === 'all' && stripeFilter === 'all' && contentFilter === 'all';

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" style={{ color: '#FFD700' }} />
          {t('admin.creators_management')}
        </h2>
        <p className="text-muted-foreground">
          {t('admin.creators_management_desc') || 'Kreátorok validálása és kezelése'}
        </p>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isAllFiltersDefault ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setVerificationFilter('all'); setStripeFilter('all'); setContentFilter('all'); }}
          className={isAllFiltersDefault 
            ? 'bg-[#FFD700] text-black hover:bg-[#FFD700]/90 border-2 border-[#FFD700]' 
            : 'border-border hover:border-[#FFD700]/50'}
        >
          {t('admin.all_creators')}
        </Button>
        <Button
          variant={verificationFilter === 'verified' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setVerificationFilter('verified'); setStripeFilter('all'); setContentFilter('all'); }}
          className={verificationFilter === 'verified' 
            ? 'bg-emerald-500 hover:bg-emerald-600 border-2 border-emerald-500' 
            : 'border-border hover:border-emerald-500/50'}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('admin.verified_only')}
        </Button>
        <Button
          variant={stripeFilter === 'connected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setVerificationFilter('all'); setStripeFilter('connected'); setContentFilter('all'); }}
          className={stripeFilter === 'connected' 
            ? 'bg-blue-500 hover:bg-blue-600 border-2 border-blue-500' 
            : 'border-border hover:border-blue-500/50'}
        >
          <CreditCard className="h-3 w-3 mr-1" />
          {t('admin.stripe_active')}
        </Button>
        <Button
          variant={contentFilter === 'no_content' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setVerificationFilter('all'); setStripeFilter('all'); setContentFilter('no_content'); }}
          className={contentFilter === 'no_content' 
            ? 'bg-orange-500 hover:bg-orange-600 border-2 border-orange-500' 
            : 'border-border hover:border-orange-500/50'}
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {t('admin.no_content')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#112240] border-border/50">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className={`w-[180px] bg-background/50 ${verificationFilter !== 'all' ? 'border-[#FFD700]' : ''}`}>
                <SelectValue placeholder={t('admin.verification')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.all_creators')}</SelectItem>
                <SelectItem value="verified">{t('admin.verified')}</SelectItem>
                <SelectItem value="not_verified">{t('admin.not_verified')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stripeFilter} onValueChange={setStripeFilter}>
              <SelectTrigger className={`w-[180px] bg-background/50 ${stripeFilter !== 'all' ? 'border-[#FFD700]' : ''}`}>
                <SelectValue placeholder="Stripe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.all_creators')}</SelectItem>
                <SelectItem value="connected">{t('admin.stripe_connected')}</SelectItem>
                <SelectItem value="not_connected">{t('admin.stripe_not_connected')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contentFilter} onValueChange={setContentFilter}>
              <SelectTrigger className={`w-[180px] bg-background/50 ${contentFilter !== 'all' ? 'border-[#FFD700]' : ''}`}>
                <SelectValue placeholder={t('admin.contents')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.all_creators')}</SelectItem>
                <SelectItem value="has_content">{t('admin.has_content')}</SelectItem>
                <SelectItem value="no_content">{t('admin.no_content')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Creators Table */}
      <Card className="bg-[#112240] border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('admin.creator')} ({filteredCreators.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.creator')}</TableHead>
                <TableHead>{t('admin.registered')}</TableHead>
                <TableHead>{t('admin.verification')}</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>{t('admin.payout')}</TableHead>
                <TableHead>{t('admin.content_count')}</TableHead>
                <TableHead>{t('admin.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.map((creator) => (
                <TableRow key={creator.id} className={creator.suspended_at ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={creator.avatar_url || undefined} />
                        <AvatarFallback>
                          {creator.first_name[0]}{creator.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {creator.first_name} {creator.last_name}
                          {creator.suspended_at && (
                            <Badge variant="destructive" className="text-xs">
                              {t('admin.suspended')}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{creator.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(creator.created_at), 'yyyy. MM. dd.')}
                  </TableCell>
                  <TableCell>
                    {creator.is_verified_expert ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('admin.verified')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        {t('admin.not_verified')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {creator.stripe_onboarding_complete ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {t('admin.stripe_connected')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-400 border-orange-500/30">
                        {t('admin.stripe_not_connected')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize font-medium">
                      {creator.payout_preference || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {creator.published_content} / {creator.total_content}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCreatorDetail(creator)}
                        className="hover:bg-[#FFD700]/10"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('admin.view_details')}
                      </Button>
                      <Switch
                        checked={creator.is_verified_expert}
                        onCheckedChange={() => toggleVerification(creator.id, creator.is_verified_expert)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCreators.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t('admin.no_results')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Creator Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-[#0a1929]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              {selectedCreator && (
                <>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedCreator.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedCreator.first_name[0]}{selectedCreator.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      {selectedCreator.first_name} {selectedCreator.last_name}
                      {selectedCreator.is_verified_expert && (
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Hitelesített
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      {selectedCreator.email}
                    </p>
                  </div>
                </>
              )}
            </SheetTitle>
          </SheetHeader>

          {selectedCreator && (
            <div className="mt-6 space-y-6">
              {/* Profile Info */}
              <Card className="bg-[#112240]/50 border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm">Profil információk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('admin.registered')}</span>
                    <span>{format(new Date(selectedCreator.created_at), 'yyyy. MM. dd. HH:mm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stripe státusz</span>
                    <span>{selectedCreator.stripe_onboarding_complete ? 'Összekapcsolva' : 'Nincs'}</span>
                  </div>
                  {selectedCreator.bio && (
                    <div className="pt-2">
                      <span className="text-muted-foreground block mb-1">Bio</span>
                      <p className="text-sm">{selectedCreator.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payout Settings */}
              <Card className="bg-[#112240]/50 border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm">Kifizetési beállítások</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferencia</span>
                    <span className="capitalize font-medium">{selectedCreator.payout_preference || '-'}</span>
                  </div>
                  {selectedCreator.payout_preference === 'wise' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wise Email</span>
                        <span>{selectedCreator.wise_email || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wise IBAN</span>
                        <span className="font-mono text-xs">{selectedCreator.wise_iban || '-'}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Verification Toggle */}
              <Card className="bg-[#112240]/50 border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm">Hitelesítés kezelése</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Szakértő hitelesítve</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCreator.is_verified_expert ? 'A kreátor hitelesítve van' : 'A kreátor nincs hitelesítve'}
                      </p>
                    </div>
                    <Switch
                      checked={selectedCreator.is_verified_expert}
                      onCheckedChange={() => toggleVerification(selectedCreator.id, selectedCreator.is_verified_expert)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contents List */}
              <Card className="bg-[#112240]/50 border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{t('admin.content_count')}</span>
                    <Badge variant="outline">
                      {selectedCreator.published_content} / {selectedCreator.total_content}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creatorContents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Még nincs tartalom
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {creatorContents.map((content) => (
                        <div
                          key={content.id}
                          className="flex items-center justify-between p-2 rounded bg-background/30"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {content.title}
                            </span>
                          </div>
                          <Badge
                            variant={content.is_published ? 'default' : 'secondary'}
                            className={content.is_published ? 'bg-emerald-500/20 text-emerald-400' : ''}
                          >
                            {content.is_published ? 'Publikált' : 'Draft'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Suspend Action - Disabled for now */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        variant="destructive"
                        className="w-full opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Felfüggesztés
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hamarosan elérhető</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CreatorManager;
