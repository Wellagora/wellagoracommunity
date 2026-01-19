import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Mail, 
  Globe, 
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Wallet,
  PiggyBank,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

interface SponsorRow {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  location_city: string | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  created_at: string | null;
}

interface SponsorCredits {
  total_credits: number;
  used_credits: number;
  available_credits: number;
}

interface Campaign {
  id: string;
  content_id: string;
  program_title: string;
  expert_name: string;
  max_sponsored_seats: number | null;
  sponsored_seats_used: number | null;
  sponsor_contribution_huf: number | null;
  is_active: boolean | null;
}

interface Transaction {
  id: string;
  credits: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

export function SponsorDetailModal(props: {
  sponsorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const { sponsorId, open, onOpenChange, onSaved } = props;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sponsor, setSponsor] = useState<SponsorRow | null>(null);
  const [credits, setCredits] = useState<SponsorCredits | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);

  // Calculate burn rate
  const burnStats = useMemo(() => {
    if (!credits || !transactions.length) return { daysUntilEmpty: 999, dailyBurn: 0 };
    
    const spendTransactions = transactions.filter(t => t.transaction_type === 'spend');
    const last30Days = spendTransactions.filter(t => 
      new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const totalSpent30Days = last30Days.reduce((sum, t) => sum + t.credits, 0);
    const dailyBurn = totalSpent30Days / 30;
    const daysUntilEmpty = dailyBurn > 0 ? Math.floor(credits.available_credits / dailyBurn) : 999;
    
    return { daysUntilEmpty, dailyBurn };
  }, [credits, transactions]);

  // Credit status
  const creditStatus = useMemo(() => {
    if (!credits) return 'unknown';
    if (credits.available_credits <= 0) return 'empty';
    if (credits.available_credits < 1000) return 'critical';
    if (credits.available_credits < 5000) return 'warning';
    return 'healthy';
  }, [credits]);

  const load = async () => {
    if (!sponsorId) return;
    setLoading(true);
    try {
      // Load sponsor
      const { data, error } = await supabase.from("sponsors").select("*").eq("id", sponsorId).maybeSingle();
      if (error) throw error;
      setSponsor((data as SponsorRow) || null);

      // Load credits from sponsor_credits table (using sponsor_user_id which links to the sponsor's user)
      // First, find the user linked to this sponsor
      const { data: creditsData } = await supabase
        .from("sponsor_credits")
        .select("total_credits, used_credits, available_credits")
        .eq("sponsor_user_id", sponsorId)
        .maybeSingle();
      
      setCredits(creditsData as SponsorCredits || { total_credits: 0, used_credits: 0, available_credits: 0 });

      // Load campaigns (content_sponsorships)
      const { data: campaignsData } = await supabase
        .from("content_sponsorships")
        .select(`
          id,
          content_id,
          max_sponsored_seats,
          sponsored_seats_used,
          sponsor_contribution_huf,
          is_active,
          expert_contents:content_id (title, creator_id, profiles:creator_id (first_name, last_name))
        `)
        .eq("sponsor_id", sponsorId);

      if (campaignsData) {
        setCampaigns(campaignsData.map((c: any) => ({
          id: c.id,
          content_id: c.content_id,
          program_title: c.expert_contents?.title || 'Ismeretlen program',
          expert_name: c.expert_contents?.profiles 
            ? `${c.expert_contents.profiles.first_name || ''} ${c.expert_contents.profiles.last_name || ''}`.trim() 
            : 'Ismeretlen',
          max_sponsored_seats: c.max_sponsored_seats,
          sponsored_seats_used: c.sponsored_seats_used,
          sponsor_contribution_huf: c.sponsor_contribution_huf,
          is_active: c.is_active
        })));
      }

      // Load transactions
      const { data: txData } = await supabase
        .from("credit_transactions")
        .select("id, credits, transaction_type, description, created_at")
        .eq("sponsor_user_id", sponsorId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      setTransactions((txData as Transaction[]) || []);

    } catch (e: any) {
      console.error("[SponsorDetailModal] load error", e);
      toast.error(e?.message || "Nem sikerült betölteni a szponzort");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      load();
      setIsEditing(false);
      setDepositAmount(0);
    }
  }, [open, sponsorId]);

  const save = async () => {
    if (!sponsor) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("sponsors")
        .update({
          name: sponsor.name,
          slug: sponsor.slug,
          logo_url: sponsor.logo_url,
          website_url: sponsor.website_url,
          description: sponsor.description,
          location_city: sponsor.location_city,
          is_active: sponsor.is_active,
          is_verified: sponsor.is_verified,
        })
        .eq("id", sponsor.id);
      if (error) throw error;

      await supabase.rpc('log_audit', {
        p_action: 'update',
        p_table_name: 'sponsors',
        p_record_id: sponsor.id,
        p_new_values: { name: sponsor.name, is_active: sponsor.is_active }
      });

      toast.success("Mentve!");
      setIsEditing(false);
      onSaved?.();
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Mentés sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const addCredits = async (amount: number) => {
    if (!sponsor || amount <= 0) return;
    setSaving(true);
    try {
      // Check if credits record exists
      const { data: existing } = await supabase
        .from("sponsor_credits")
        .select("id, total_credits")
        .eq("sponsor_user_id", sponsorId)
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from("sponsor_credits")
          .update({ 
            total_credits: existing.total_credits + amount,
            updated_at: new Date().toISOString()
          })
          .eq("sponsor_user_id", sponsorId);
      } else {
        // Create new
        await supabase
          .from("sponsor_credits")
          .insert({
            sponsor_user_id: sponsorId,
            total_credits: amount,
            used_credits: 0
          });
      }

      // Log transaction
      await supabase
        .from("credit_transactions")
        .insert({
          sponsor_user_id: sponsorId,
          credits: amount,
          transaction_type: 'purchase',
          description: `Admin kredit hozzáadás: +${amount.toLocaleString()} Ft`
        });

      await supabase.rpc('log_audit', {
        p_action: 'update',
        p_table_name: 'sponsor_credits',
        p_record_id: sponsorId as any,
        p_new_values: { added_credits: amount }
      });

      toast.success(`+${amount.toLocaleString()} Ft kredit hozzáadva!`);
      setDepositAmount(0);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Kredit hozzáadás sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = () => {
    if (!sponsor) return null;
    return sponsor.is_active 
      ? <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Aktív</Badge>
      : <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Inaktív</Badge>;
  };

  const getCreditStatusBanner = () => {
    if (creditStatus === 'empty') {
      return (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Kredit elfogyott!</p>
            <p className="text-sm text-red-600">A szponzorált programok visszaállnak teljes árra.</p>
          </div>
        </div>
      );
    }
    if (creditStatus === 'critical') {
      return (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Kritikusan alacsony egyenleg!</p>
            <p className="text-sm text-red-600">Kevesebb mint 1,000 Ft kredit maradt.</p>
          </div>
        </div>
      );
    }
    if (creditStatus === 'warning') {
      return (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Alacsony egyenleg figyelmeztetés</p>
            <p className="text-sm text-amber-600">Kevesebb mint 5,000 Ft kredit maradt. {burnStats.daysUntilEmpty < 999 && `(~${burnStats.daysUntilEmpty} nap)`}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Szponzor 360° Nézet
          </DialogTitle>
        </DialogHeader>

        {!sponsorId ? (
          <div>Hiányzó azonosító</div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : !sponsor ? (
          <div>Nincs találat</div>
        ) : (
          <Tabs defaultValue="profile" className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="credits">Kreditek</TabsTrigger>
              <TabsTrigger value="campaigns">Kampányok ({campaigns.length})</TabsTrigger>
              <TabsTrigger value="transactions">Tranzakciók</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px] mt-4">
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4 pr-4">
                {/* Header with Logo */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 rounded-lg">
                    <AvatarImage src={sponsor.logo_url || undefined} className="object-contain" />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-700 rounded-lg">
                      {sponsor.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold">{sponsor.name}</h3>
                      {getStatusBadge()}
                    </div>
                    <p className="text-muted-foreground">{sponsor.description?.slice(0, 100) || 'Szponzor'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {sponsor.website_url && (
                        <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                          <Globe className="h-3 w-3" /> {sponsor.website_url}
                        </a>
                      )}
                      {sponsor.created_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Csatlakozott: {format(new Date(sponsor.created_at), 'yyyy.MM.dd', { locale: hu })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Status Toggle */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Szponzor státusz</p>
                        <p className="text-sm text-muted-foreground">
                          {sponsor.is_active ? "Aktív szponzor, kampányok futnak" : "Inaktív, kampányok szünetelnek"}
                        </p>
                      </div>
                      <Switch
                        checked={sponsor.is_active || false}
                        onCheckedChange={(checked) => setSponsor({ ...sponsor, is_active: checked })}
                        disabled={saving}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Editable Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Cégnév</Label>
                    {isEditing ? (
                      <Input value={sponsor.name} onChange={(e) => setSponsor({ ...sponsor, name: e.target.value })} />
                    ) : (
                      <p className="text-sm py-2">{sponsor.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Weboldal</Label>
                    {isEditing ? (
                      <Input value={sponsor.website_url || ""} onChange={(e) => setSponsor({ ...sponsor, website_url: e.target.value })} />
                    ) : (
                      <p className="text-sm py-2">{sponsor.website_url || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    {isEditing ? (
                      <Input value={sponsor.logo_url || ""} onChange={(e) => setSponsor({ ...sponsor, logo_url: e.target.value })} />
                    ) : (
                      <p className="text-sm py-2 truncate">{sponsor.logo_url || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Leírás</Label>
                    {isEditing ? (
                      <Textarea value={sponsor.description || ""} onChange={(e) => setSponsor({ ...sponsor, description: e.target.value })} rows={3} />
                    ) : (
                      <p className="text-sm py-2">{sponsor.description || 'Nincs leírás'}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Credits Tab */}
              <TabsContent value="credits" className="space-y-4 pr-4">
                {getCreditStatusBanner()}

                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="border-2 border-emerald-400">
                    <CardContent className="p-4 text-center">
                      <Wallet className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                      <p className="text-sm text-muted-foreground">Elérhető Kredit</p>
                      <p className="text-3xl font-bold text-emerald-600">{formatCurrency(credits?.available_credits || 0)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <PiggyBank className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-sm text-muted-foreground">Összes Befizetett</p>
                      <p className="text-2xl font-bold">{formatCurrency(credits?.total_credits || 0)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Receipt className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                      <p className="text-sm text-muted-foreground">Felhasznált</p>
                      <p className="text-2xl font-bold">{formatCurrency(credits?.used_credits || 0)}</p>
                    </CardContent>
                  </Card>
                </div>

                {burnStats.dailyBurn > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingDown className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="font-medium">Égetési Ráta</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(burnStats.dailyBurn)} / nap átlag
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-2xl font-bold",
                            burnStats.daysUntilEmpty < 7 && "text-red-600",
                            burnStats.daysUntilEmpty >= 7 && burnStats.daysUntilEmpty < 14 && "text-amber-600"
                          )}>
                            {burnStats.daysUntilEmpty < 999 ? `${burnStats.daysUntilEmpty} nap` : '∞'}
                          </p>
                          <p className="text-sm text-muted-foreground">kimerülésig</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Quick Deposit */}
                <div>
                  <h4 className="font-medium mb-3">Gyors Kredit Feltöltés</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => addCredits(10000)} disabled={saving}>
                      <Plus className="h-4 w-4 mr-1" /> 10,000 Ft
                    </Button>
                    <Button variant="outline" onClick={() => addCredits(50000)} disabled={saving}>
                      <Plus className="h-4 w-4 mr-1" /> 50,000 Ft
                    </Button>
                    <Button variant="outline" onClick={() => addCredits(100000)} disabled={saving}>
                      <Plus className="h-4 w-4 mr-1" /> 100,000 Ft
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input 
                      type="number" 
                      placeholder="Egyedi összeg" 
                      value={depositAmount || ''} 
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-40"
                    />
                    <Button onClick={() => addCredits(depositAmount)} disabled={saving || depositAmount <= 0}>
                      Hozzáadás
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Campaigns Tab */}
              <TabsContent value="campaigns" className="space-y-4 pr-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nincs aktív kampány</p>
                    <p className="text-sm">Szponzorált programok itt jelennek meg</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map((c) => (
                      <Card key={c.id} className={cn(
                        "cursor-pointer hover:shadow-md transition-all",
                        !c.is_active && "opacity-60"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium truncate">{c.program_title}</h4>
                              <p className="text-sm text-muted-foreground">Szakértő: {c.expert_name}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm">
                                <span>Helyek: {c.sponsored_seats_used || 0} / {c.max_sponsored_seats || '-'}</span>
                                <span>Hozzájárulás: {formatCurrency(c.sponsor_contribution_huf || 0)} / fő</span>
                              </div>
                            </div>
                            <Badge variant={c.is_active ? "default" : "secondary"}>
                              {c.is_active ? "Aktív" : "Inaktív"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-4 pr-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nincs tranzakció</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {tx.transaction_type === 'purchase' ? (
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {tx.transaction_type === 'purchase' ? '+' : '-'}{formatCurrency(tx.credits)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.description || (tx.transaction_type === 'purchase' ? 'Kredit vásárlás' : 'Kredit felhasználás')}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(tx.created_at), 'yyyy.MM.dd HH:mm', { locale: hu })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          <div className="flex flex-wrap gap-2 w-full justify-end">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); load(); }}>Mégse</Button>
                <Button onClick={save} disabled={saving}>Mentés</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>Szerkesztés</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
