import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Building2,
  Search,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Plus
} from 'lucide-react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { SponsorDetailModal } from '@/components/admin/modals/SponsorDetailModal';

interface Sponsor {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  description?: string | null;
  logo_url?: string | null;
  is_active: boolean;
  credit_balance?: number;
  created_at: string;
  source: 'sponsors_table' | 'profiles_table';
}

interface AdminOutletContext {
  selectedProjectId: string | null;
}

const AdminSponsors = () => {
  const { isDemoMode } = useAuth();
  const { selectedProjectId } = useOutletContext<AdminOutletContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website_url: '',
    description: '',
    is_active: true,
  });
  
  // Modal state
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSponsors = async () => {
    setLoading(true);
    
    try {
      // Query sponsors table (primary source - real brand partners)
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (sponsorsError) {
        // Log error internally but don't crash
      }

      // Combine results from sponsors table only (profiles with sponsor roles are users, not brand partners)
      const combinedSponsors: Sponsor[] = [];

      if (sponsorsData) {
        sponsorsData.forEach(s => {
          combinedSponsors.push({
            id: s.id,
            name: s.name,
            email: '',
            avatar_url: s.logo_url,
            description: s.description,
            logo_url: s.logo_url,
            is_active: s.is_active ?? true,
            credit_balance: 0,
            created_at: s.created_at || new Date().toISOString(),
            source: 'sponsors_table'
          });
        });
      }

      
      setSponsors(combinedSponsors);
    } catch (error) {
      
      toast.error('Hiba a szponzorok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, [isDemoMode]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openCreate = () => {
    setEditingSponsor(null);
    setFormData({
      name: '',
      slug: '',
      logo_url: '',
      website_url: '',
      description: '',
      is_active: true,
    });
    setCreateEditOpen(true);
  };

  const openEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name || '',
      slug: sponsor.id && sponsor.source === 'sponsors_table' ? (sponsor as any).slug || '' : '',
      logo_url: sponsor.logo_url || sponsor.avatar_url || '',
      website_url: (sponsor as any).website_url || '',
      description: sponsor.description || '',
      is_active: sponsor.is_active,
    });
    setCreateEditOpen(true);
  };

  const saveSponsor = async () => {
    if (!formData.name.trim()) {
      toast.error('A név kötelező');
      return;
    }

    setSaving(true);
    try {
      if (editingSponsor) {
        const { error } = await supabase
          .from('sponsors')
          .update({
            name: formData.name.trim(),
            slug: formData.slug.trim() || null,
            logo_url: formData.logo_url.trim() || null,
            website_url: formData.website_url.trim() || null,
            description: formData.description.trim() || null,
            is_active: formData.is_active,
          })
          .eq('id', editingSponsor.id);
        if (error) throw error;
        toast.success('Szponzor frissítve');
      } else {
        const { error } = await supabase
          .from('sponsors')
          .insert({
            name: formData.name.trim(),
            slug: formData.slug.trim() || null,
            logo_url: formData.logo_url.trim() || null,
            website_url: formData.website_url.trim() || null,
            description: formData.description.trim() || null,
            is_active: formData.is_active,
          });
        if (error) throw error;
        toast.success('Szponzor létrehozva');
      }

      setCreateEditOpen(false);
      await fetchSponsors();
    } catch (e: any) {
      console.error('[AdminSponsors] save error', e);
      toast.error(e?.message || 'Hiba a mentés során');
    } finally {
      setSaving(false);
    }
  };

  // Handle card click - open modal
  const handleCardClick = (sponsorId: string) => {
    
    setSelectedSponsorId(sponsorId);
    setModalOpen(true);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />Aktív</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Inaktív</Badge>;
  };

  const filteredSponsors = sponsors.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && s.is_active) ||
      (statusFilter === 'inactive' && !s.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: sponsors.length,
    active: sponsors.filter(s => s.is_active).length,
    inactive: sponsors.filter(s => !s.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-600" />
            Szponzorok
          </h1>
          <p className="text-muted-foreground">
            Szponzorok és partnerek kezelése
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchSponsors} variant="outline" size="icon" title="Frissítés">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Új szponzor
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Keresés cégnév alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">
              Összes ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="active">
              Aktív ({counts.active})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inaktív ({counts.inactive})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Sponsors List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredSponsors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nincs megjeleníthető szponzor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSponsors.map((sponsor) => (
            <Card 
              key={sponsor.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                !sponsor.is_active && "opacity-60"
              )}
              onClick={() => handleCardClick(sponsor.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sponsor.logo_url || sponsor.avatar_url || undefined} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                      {sponsor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{sponsor.name}</h3>
                      {getStatusBadge(sponsor.is_active)}
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(sponsor);
                        }}
                      >
                        Szerkesztés
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {sponsor.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {sponsor.email}
                        </span>
                      )}
                      {sponsor.credit_balance !== undefined && sponsor.credit_balance > 0 && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {sponsor.credit_balance.toLocaleString()} kredit
                        </span>
                      )}
                      {sponsor.description && (
                        <span className="truncate max-w-xs text-xs">
                          {sponsor.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sponsor Detail Modal */}
      <SponsorDetailModal
        sponsorId={selectedSponsorId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={fetchSponsors}
      />

      {/* Create/Edit Sponsor Modal */}
      <Dialog open={createEditOpen} onOpenChange={setCreateEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingSponsor ? 'Szponzor szerkesztése' : 'Új szponzor'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Név</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: editingSponsor ? prev.slug : generateSlug(name),
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={formData.logo_url} onChange={(e) => setFormData((p) => ({ ...p, logo_url: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input value={formData.website_url} onChange={(e) => setFormData((p) => ({ ...p, website_url: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Leírás</Label>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Aktív</div>
                <div className="text-sm text-muted-foreground">Inaktív szponzor nem jelenik meg nyilvánosan</div>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateEditOpen(false)}>
              Mégse
            </Button>
            <Button onClick={saveSponsor} disabled={saving}>
              {saving ? '...' : 'Mentés'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSponsors;
