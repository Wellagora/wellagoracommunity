import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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
import {
  Search,
  Sparkles,
  CheckCircle,
  XCircle,
  CreditCard,
  Eye,
  Ban,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

interface Creator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  is_verified_expert: boolean;
  stripe_onboarding_complete: boolean;
  payout_preference: string | null;
  wise_email: string | null;
  wise_iban: string | null;
  suspended_at: string | null;
  content_count: number;
}

interface ExpertContent {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  access_level: string | null;
  price_huf: number | null;
}

const CreatorManager = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [stripeFilter, setStripeFilter] = useState('all');
  const [contentFilter, setContentFilter] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [creatorContents, setCreatorContents] = useState<ExpertContent[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const loadCreators = async () => {
    setLoading(true);
    try {
      // First get all creators
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_role', 'creator')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get content counts for each creator
      const creatorsWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from('expert_contents')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', profile.id);

          return {
            ...profile,
            content_count: count || 0,
          } as Creator;
        })
      );

      setCreators(creatorsWithCounts);
    } catch (error) {
      console.error('Error loading creators:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült betölteni a kreátorokat',
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
        title: 'Hiba',
        description: 'Nem sikerült frissíteni a státuszt',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Siker',
        description: !currentStatus ? 'Kreátor hitelesítve' : 'Hitelesítés visszavonva',
      });
      loadCreators();
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
        title: 'Hiba',
        description: 'Nem sikerült frissíteni a státuszt',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Siker',
        description: isSuspended ? 'Kreátor aktiválva' : 'Kreátor felfüggesztve',
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

  const filteredCreators = creators.filter(creator => {
    const matchesSearch =
      creator.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchQuery.toLowerCase());

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
      (contentFilter === 'has_content' && creator.content_count > 0) ||
      (contentFilter === 'no_content' && creator.content_count === 0);

    return matchesSearch && matchesVerification && matchesStripe && matchesContent;
  });

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
          <Sparkles className="h-6 w-6 text-[#00E5FF]" />
          {t('admin.creators_management')}
        </h2>
        <p className="text-muted-foreground">
          Kreátorok validálása és kezelése
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-[#112240] border-border/50">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Keresés név vagy email alapján..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue placeholder="Hitelesítés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes</SelectItem>
                <SelectItem value="verified">{t('admin.verified')}</SelectItem>
                <SelectItem value="not_verified">{t('admin.not_verified')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stripeFilter} onValueChange={setStripeFilter}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue placeholder="Stripe státusz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes</SelectItem>
                <SelectItem value="connected">{t('admin.stripe_connected')}</SelectItem>
                <SelectItem value="not_connected">{t('admin.stripe_not_connected')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contentFilter} onValueChange={setContentFilter}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue placeholder="Tartalom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes</SelectItem>
                <SelectItem value="has_content">Van tartalom</SelectItem>
                <SelectItem value="no_content">Nincs tartalom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Creators Table */}
      <Card className="bg-[#112240] border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kreátorok ({filteredCreators.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kreátor</TableHead>
                <TableHead>Regisztráció</TableHead>
                <TableHead>Hitelesítés</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Kifizetés</TableHead>
                <TableHead>{t('admin.content_count')}</TableHead>
                <TableHead>Műveletek</TableHead>
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
                              Felfüggesztve
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{creator.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(creator.created_at), 'yyyy.MM.dd')}
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
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Aktív
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Nincs
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">
                      {creator.payout_preference || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{creator.content_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCreatorDetail(creator)}
                      >
                        <Eye className="h-4 w-4" />
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
                    Nincs találat
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Creator Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
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
              <Card className="bg-[#112240]/50">
                <CardHeader>
                  <CardTitle className="text-sm">Profil információk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regisztráció</span>
                    <span>{format(new Date(selectedCreator.created_at), 'yyyy.MM.dd HH:mm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stripe státusz</span>
                    <span>{selectedCreator.stripe_onboarding_complete ? 'Összekapcsolva' : 'Nincs'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payout Settings */}
              <Card className="bg-[#112240]/50">
                <CardHeader>
                  <CardTitle className="text-sm">Kifizetési beállítások</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferencia</span>
                    <span className="capitalize">{selectedCreator.payout_preference || '-'}</span>
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
              <Card className="bg-[#112240]/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('admin.verify_expert')}</p>
                      <p className="text-sm text-muted-foreground">
                        Hitelesített szakértő badge megjelenítése
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

              {/* Content List */}
              <Card className="bg-[#112240]/50">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Tartalmak ({creatorContents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creatorContents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nincs tartalom</p>
                  ) : (
                    <div className="space-y-2">
                      {creatorContents.map((content) => (
                        <div
                          key={content.id}
                          className="flex items-center justify-between p-2 rounded bg-background/30"
                        >
                          <div>
                            <p className="font-medium text-sm">{content.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {content.access_level} • {content.price_huf ? `${content.price_huf} Ft` : 'Ingyenes'}
                            </p>
                          </div>
                          <Badge variant={content.is_published ? 'default' : 'secondary'}>
                            {content.is_published ? 'Publikált' : 'Vázlat'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Suspend Button */}
              <Button
                variant={selectedCreator.suspended_at ? 'default' : 'destructive'}
                className="w-full"
                onClick={() => suspendCreator(selectedCreator.id, !!selectedCreator.suspended_at)}
              >
                <Ban className="h-4 w-4 mr-2" />
                {selectedCreator.suspended_at ? 'Kreátor Aktiválása' : t('admin.suspend_creator')}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CreatorManager;
