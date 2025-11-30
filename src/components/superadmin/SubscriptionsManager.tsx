import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  CheckCircle,
  Calendar,
  XCircle,
  Edit,
  TrendingUp,
  Clock,
  FileText,
  CheckSquare,
  Square,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addYears, isAfter, isBefore, addDays } from "date-fns";
import { toast } from "sonner";

type SubscriptionWithOrg = {
  id: string;
  organization_id: string;
  organization_name: string;
  plan_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  price_paid: number | null;
  currency: string | null;
  auto_renew: boolean | null;
  created_at: string;
};

const SubscriptionsManager = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithOrg[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

  // KPI stats
  const [stats, setStats] = useState({
    activeCount: 0,
    expiringSoon: 0,
    pendingCount: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subsError) throw subsError;

      // Fetch organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("id, name");

      if (orgsError) throw orgsError;

      setOrganizations(orgsData || []);

      // Merge data
      const mergedData: SubscriptionWithOrg[] = (subsData || []).map((sub) => {
        const org = orgsData?.find((o) => o.id === sub.organization_id);
        return {
          id: sub.id,
          organization_id: sub.organization_id!,
          organization_name: org?.name || "Unknown",
          plan_type: sub.plan_type,
          status: sub.status || "pending",
          start_date: sub.start_date,
          end_date: sub.end_date,
          price_paid: sub.price_paid,
          currency: sub.currency || "HUF",
          auto_renew: sub.auto_renew,
          created_at: sub.created_at!,
        };
      });

      setSubscriptions(mergedData);

      // Calculate stats
      const active = mergedData.filter((s) => s.status === "active");
      const now = new Date();
      const in30Days = addDays(now, 30);
      const expiring = active.filter(
        (s) => s.end_date && isAfter(new Date(s.end_date), now) && isBefore(new Date(s.end_date), in30Days)
      );
      const pending = mergedData.filter((s) => s.status === "pending");
      const revenue = active.reduce((sum, s) => sum + (s.price_paid || 0), 0) / 12;

      setStats({
        activeCount: active.length,
        expiringSoon: expiring.length,
        pendingCount: pending.length,
        monthlyRevenue: Math.round(revenue),
      });
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast.error("Hiba az előfizetések betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Aktív</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Függőben</Badge>;
      case "expired":
        return <Badge variant="destructive">Lejárt</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-muted-foreground">Lemondva</Badge>;
      case "past_due":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Késedelmes</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleActivate = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          start_date: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast.success("Előfizetés aktiválva");
      loadData();
    } catch (error) {
      console.error("Error activating subscription:", error);
      toast.error("Hiba az aktiválás során");
    }
  };

  const handleExtend = async () => {
    if (!selectedSubscription) return;

    try {
      const sub = subscriptions.find((s) => s.id === selectedSubscription);
      if (!sub || !sub.end_date) return;

      const newEndDate = addYears(new Date(sub.end_date), 1);

      const { error } = await supabase
        .from("subscriptions")
        .update({ end_date: newEndDate.toISOString() })
        .eq("id", selectedSubscription);

      if (error) throw error;

      toast.success("Előfizetés meghosszabbítva 1 évvel");
      setIsExtendDialogOpen(false);
      setSelectedSubscription(null);
      loadData();
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast.error("Hiba a hosszabbítás során");
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast.success("Előfizetés lemondva");
      loadData();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Hiba a lemondás során");
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.organization_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesPlan = planFilter === "all" || sub.plan_type === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Get unique plan types for filter
  const uniquePlans = Array.from(new Set(subscriptions.map((s) => s.plan_type)));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Előfizetések</h2>
          <p className="text-muted-foreground">Összes előfizetés kezelése</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Új előfizetés
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új előfizetés létrehozása</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Szervezet</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz szervezetet" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Csomag típus</Label>
                <Input placeholder="pl. business_pro" />
              </div>
              <div className="space-y-2">
                <Label>Összeg</Label>
                <Input type="number" placeholder="150000" />
              </div>
              <div className="space-y-2">
                <Label>Pénznem</Label>
                <Select defaultValue="HUF">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HUF">HUF</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Mégse
              </Button>
              <Button>Létrehozás</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív előfizetések</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lejár 30 napon belül</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Függőben</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Havi bevétel (átlag)</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.monthlyRevenue.toLocaleString()} Ft
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Keresés szervezet szerint..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Státusz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes státusz</SelectItem>
            <SelectItem value="active">Aktív</SelectItem>
            <SelectItem value="pending">Függőben</SelectItem>
            <SelectItem value="expired">Lejárt</SelectItem>
            <SelectItem value="cancelled">Lemondva</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Csomag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes csomag</SelectItem>
            {uniquePlans.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card/30 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Szervezet</TableHead>
              <TableHead>Csomag</TableHead>
              <TableHead>Státusz</TableHead>
              <TableHead>Kezdés</TableHead>
              <TableHead>Lejárat</TableHead>
              <TableHead>Összeg</TableHead>
              <TableHead>Auto megújítás</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nincs megjeleníthető előfizetés
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.organization_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sub.plan_type}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell>
                    {sub.start_date ? format(new Date(sub.start_date), "yyyy. MM. dd.") : "-"}
                  </TableCell>
                  <TableCell>
                    {sub.end_date ? format(new Date(sub.end_date), "yyyy. MM. dd.") : "-"}
                  </TableCell>
                  <TableCell>
                    {sub.price_paid
                      ? `${sub.price_paid.toLocaleString()} ${sub.currency}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {sub.auto_renew ? (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {sub.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivate(sub.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aktiválás
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSubscription(sub.id);
                          setIsExtendDialogOpen(true);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Hosszabbítás
                      </Button>
                      {sub.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(sub.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Lemondás
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Összesen: {filteredSubscriptions.length} előfizetés
      </div>

      {/* Extend Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Előfizetés hosszabbítása</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Biztosan meghosszabbítod ezt az előfizetést 1 évvel?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleExtend}>Hosszabbítás</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManager;
