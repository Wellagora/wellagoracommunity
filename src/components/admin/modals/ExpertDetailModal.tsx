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
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Briefcase,
  TrendingUp,
  DollarSign,
  FileText,
  Shield,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface ExpertProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  expert_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  verification_status: string | null;
  is_verified_expert: boolean | null;
  is_super_admin: boolean | null;
  user_role: string;
  created_at: string;
  green_pass: boolean | null;
  verification_expires_at: string | null;
  organization_name: string | null;
  expertise_areas: string[] | null;
}

interface ExpertProgram {
  id: string;
  title: string;
  is_published: boolean | null;
  created_at: string | null;
  price_huf: number | null;
  max_capacity: number | null;
  total_licenses: number | null;
  used_licenses: number | null;
}

interface PayoutRecord {
  id: string;
  amount_huf: number;
  status: string;
  period_start: string;
  period_end: string;
  paid_at: string | null;
}

export function ExpertDetailModal(props: {
  expertId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerifiedOrRejected?: () => void;
}) {
  const { expertId, open, onOpenChange, onVerifiedOrRejected } = props;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [programs, setPrograms] = useState<ExpertProgram[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const fullName = useMemo(() => {
    if (!profile) return "";
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return "?";
    const f = profile.first_name?.[0] || "";
    const l = profile.last_name?.[0] || "";
    return (f + l).toUpperCase() || profile.email[0].toUpperCase();
  }, [profile]);

  // Calculate earnings
  const earnings = useMemo(() => {
    const grossRevenue = programs.reduce((sum, p) => {
      const seats = p.used_licenses || 0;
      const price = p.price_huf || 0;
      return sum + (seats * price);
    }, 0);
    const platformFee = grossRevenue * 0.2;
    const netEarnings = grossRevenue - platformFee;
    const pendingPayout = payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount_huf, 0);
    
    return { grossRevenue, platformFee, netEarnings, pendingPayout };
  }, [programs, payouts]);

  const load = async () => {
    if (!expertId) return;
    setLoading(true);
    try {
      // Load profile
      const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,expert_title,bio,avatar_url,verification_status,is_verified_expert,is_super_admin,user_role,created_at,green_pass,verification_expires_at,organization_name,expertise_areas")
        .eq("id", expertId)
        .maybeSingle();
      if (pErr) throw pErr;

      // Load programs with more details
      const { data: progs, error: progErr } = await supabase
        .from("expert_contents")
        .select("id,title,is_published,created_at,price_huf,max_capacity,total_licenses,used_licenses")
        .eq("creator_id", expertId)
        .order("created_at", { ascending: false });
      if (progErr) throw progErr;

      // Load payouts
      const { data: payoutData, error: payoutErr } = await supabase
        .from("payouts")
        .select("id,amount_huf,status,period_start,period_end,paid_at")
        .eq("expert_id", expertId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (payoutErr) console.error("Payout fetch error:", payoutErr);

      setProfile((p as ExpertProfile) || null);
      setPrograms((progs as ExpertProgram[]) || []);
      setPayouts((payoutData as PayoutRecord[]) || []);
    } catch (e: any) {
      console.error("[ExpertDetailModal] load error", e);
      toast.error(e?.message || "Nem sikerült betölteni a szakértőt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      load();
      setIsEditing(false);
    }
  }, [open, expertId]);

  const status = (profile?.verification_status || "unverified") as VerificationStatus;

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          expert_title: profile.expert_title,
          bio: profile.bio,
          green_pass: profile.green_pass,
        })
        .eq("id", profile.id);
      if (error) throw error;

      // Log audit
      await supabase.rpc('log_audit', {
        p_action: 'update',
        p_table_name: 'profiles',
        p_record_id: profile.id,
        p_new_values: { first_name: profile.first_name, last_name: profile.last_name, expert_title: profile.expert_title, green_pass: profile.green_pass }
      });

      toast.success("Mentve!");
      setIsEditing(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Mentés sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const toggleGreenPass = async (enabled: boolean) => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ green_pass: enabled })
        .eq("id", profile.id);
      if (error) throw error;
      
      setProfile({ ...profile, green_pass: enabled });
      toast.success(enabled ? "Zöld Út engedélyezve!" : "Zöld Út letiltva!");
      
      await supabase.rpc('log_audit', {
        p_action: 'update',
        p_table_name: 'profiles',
        p_record_id: profile.id,
        p_new_values: { green_pass: enabled }
      });
    } catch (e: any) {
      toast.error(e?.message || "Művelet sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const setVerification = async (next: VerificationStatus) => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          verification_status: next,
          is_verified_expert: next === 'verified'
        })
        .eq("id", profile.id);
      if (error) throw error;

      await supabase.rpc('log_audit', {
        p_action: next === 'verified' ? 'verify' : 'reject',
        p_table_name: 'profiles',
        p_record_id: profile.id,
        p_new_values: { verification_status: next }
      });

      toast.success(next === "verified" ? "Hitelesítve!" : "Elutasítva!");
      onVerifiedOrRejected?.();
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Művelet sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Hitelesített</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="h-3 w-3 mr-1" /> Függőben</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" /> Elutasított</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Nem hitelesített</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Szakértő 360° Nézet
          </DialogTitle>
        </DialogHeader>

        {!expertId ? (
          <div>Hiányzó azonosító</div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : !profile ? (
          <div>Nincs találat</div>
        ) : (
          <Tabs defaultValue="profile" className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="programs">Programok ({programs.length})</TabsTrigger>
              <TabsTrigger value="earnings">Bevételek</TabsTrigger>
              <TabsTrigger value="documents">Dokumentumok</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px] mt-4">
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4 pr-4">
                {/* Header with Avatar */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold">{fullName}</h3>
                      {getStatusBadge()}
                      {profile.green_pass && (
                        <Badge className="bg-emerald-500 text-white">
                          <Zap className="h-3 w-3 mr-1" /> AUTO-PUBLISH
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{profile.expert_title || 'Szakértő'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {profile.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Csatlakozott: {format(new Date(profile.created_at), 'yyyy.MM.dd', { locale: hu })}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Green Pass Toggle */}
                <Card className={cn(
                  "border-2",
                  profile.green_pass ? "border-emerald-400 bg-emerald-50/50" : "border-amber-400 bg-amber-50/50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          profile.green_pass ? "bg-emerald-100" : "bg-amber-100"
                        )}>
                          <Zap className={cn(
                            "h-5 w-5",
                            profile.green_pass ? "text-emerald-600" : "text-amber-600"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium">Zöld Út / Green Pass</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.green_pass 
                              ? "Új programok automatikusan publikálásra kerülnek" 
                              : "Új programok manuális jóváhagyást igényelnek"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={profile.green_pass || false}
                        onCheckedChange={toggleGreenPass}
                        disabled={saving}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Editable Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Keresztnév</Label>
                    {isEditing ? (
                      <Input
                        value={profile.first_name || ""}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm py-2">{profile.first_name || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Vezetéknév</Label>
                    {isEditing ? (
                      <Input
                        value={profile.last_name || ""}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm py-2">{profile.last_name || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Szakértői cím</Label>
                    {isEditing ? (
                      <Input
                        value={profile.expert_title || ""}
                        onChange={(e) => setProfile({ ...profile, expert_title: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm py-2">{profile.expert_title || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Bio</Label>
                    {isEditing ? (
                      <Textarea
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm py-2">{profile.bio || 'Nincs bio megadva'}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Programs Tab */}
              <TabsContent value="programs" className="space-y-4 pr-4">
                {programs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nincs program
                  </div>
                ) : (
                  <div className="space-y-3">
                    {programs.map((p) => (
                      <Card key={p.id} className="cursor-pointer hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium truncate">{p.title}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span>{formatCurrency(p.price_huf || 0)}</span>
                                <span>Helyek: {p.used_licenses || 0} / {p.max_capacity || p.total_licenses || '-'}</span>
                                <span>Bevétel: {formatCurrency((p.used_licenses || 0) * (p.price_huf || 0))}</span>
                              </div>
                            </div>
                            <Badge variant={p.is_published ? "default" : "secondary"}>
                              {p.is_published ? "Publikált" : "Vázlat"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Earnings Tab */}
              <TabsContent value="earnings" className="space-y-4 pr-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bruttó Bevétel</p>
                          <p className="text-xl font-bold">{formatCurrency(earnings.grossRevenue)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100">
                          <DollarSign className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Platform Díj (20%)</p>
                          <p className="text-xl font-bold text-red-600">-{formatCurrency(earnings.platformFee)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-emerald-400">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nettó Kereset</p>
                          <p className="text-xl font-bold text-emerald-600">{formatCurrency(earnings.netEarnings)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={cn(earnings.pendingPayout > 0 && "border-2 border-amber-400")}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Függő Kifizetés</p>
                          <p className="text-xl font-bold text-amber-600">{formatCurrency(earnings.pendingPayout)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Kifizetési Előzmények</h4>
                  {payouts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nincs kifizetési előzmény</p>
                  ) : (
                    <div className="space-y-2">
                      {payouts.map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{formatCurrency(payout.amount_huf)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payout.period_start), 'yyyy.MM.dd')} - {format(new Date(payout.period_end), 'yyyy.MM.dd')}
                            </p>
                          </div>
                          <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                            {payout.status === 'completed' ? 'Kifizetve' : 'Függő'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4 pr-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Dokumentum feltöltés hamarosan elérhető</p>
                  <p className="text-sm">Hitelesítési dokumentumok, bizonyítványok</p>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          <div className="flex flex-wrap gap-2 w-full justify-between">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => { setIsEditing(false); load(); }}>Mégse</Button>
                  <Button onClick={saveProfile} disabled={saving}>Mentés</Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>Szerkesztés</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={() => setVerification("verified")}
                disabled={!profile || saving || loading || status === 'verified'}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Jóváhagyás
              </Button>
              <Button
                variant="destructive"
                onClick={() => setVerification("rejected")}
                disabled={!profile || saving || loading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Elutasítás
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
