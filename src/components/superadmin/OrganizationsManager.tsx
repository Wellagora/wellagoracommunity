import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Plus, Eye, CreditCard, Edit, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import OrganizationDetailView from "./OrganizationDetailView";

type OrganizationWithSubscription = {
  id: string;
  name: string;
  type: "business" | "citizen" | "creator" | "government" | "ngo";
  location: string | null;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  employee_count: number | null;
  is_public: boolean | null;
  created_at: string;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_end_date: string | null;
};

type OrganizationMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: string;
};

const OrganizationsManager = () => {
  const [organizations, setOrganizations] = useState<OrganizationWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Navigation state
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithSubscription | null>(null);
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  
  // Subscription form state
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan_type: "",
    price_paid: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    status: "active",
  });
  
  // Edit form state
  const [editForm, setEditForm] = useState<{
    name: string;
    type: "business" | "citizen" | "creator" | "government" | "ngo";
    location: string;
    description: string;
    website_url: string;
    employee_count: string;
    is_public: boolean;
  }>({
    name: "",
    type: "business",
    location: "",
    description: "",
    website_url: "",
    employee_count: "",
    is_public: true,
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);

      // Fetch organizations with their subscriptions
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgsError) throw orgsError;

      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from("subscriptions")
        .select("*");

      if (subsError) throw subsError;

      // Merge data
      const mergedData = orgsData.map((org) => {
        const subscription = subsData?.find((sub) => sub.organization_id === org.id);
        return {
          id: org.id,
          name: org.name,
          type: org.type,
          location: org.location,
          logo_url: org.logo_url,
          description: org.description,
          website_url: org.website_url,
          employee_count: org.employee_count,
          is_public: org.is_public,
          created_at: org.created_at,
          subscription_status: subscription?.status || null,
          subscription_plan: subscription?.plan_type || null,
          subscription_end_date: subscription?.end_date || null,
        };
      });

      setOrganizations(mergedData);
    } catch (error) {
      toast.error("Hiba a szervezetek betöltése során");
    } finally {
      setLoading(false);
    }
  };

  const loadOrgMembers = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, user_role")
        .eq("organization_id", orgId);

      if (error) throw error;
      setOrgMembers(data || []);
    } catch (error) {
      toast.error("Hiba a tagok betöltése során");
    }
  };

  const handleViewDetails = (org: OrganizationWithSubscription) => {
    setSelectedOrganizationId(org.id);
  };

  const handleManageSubscription = (org: OrganizationWithSubscription) => {
    setSelectedOrg(org);
    setSubscriptionForm({
      plan_type: org.subscription_plan || "",
      price_paid: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      status: org.subscription_status || "active",
    });
    setSubscriptionDialogOpen(true);
  };

  const handleEdit = (org: OrganizationWithSubscription) => {
    setSelectedOrg(org);
    setEditForm({
      name: org.name,
      type: org.type,
      location: org.location || "",
      description: org.description || "",
      website_url: org.website_url || "",
      employee_count: org.employee_count?.toString() || "",
      is_public: org.is_public ?? true,
    });
    setEditDialogOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedOrg) return;

    try {
      const { error } = await supabase.from("subscriptions").upsert({
        organization_id: selectedOrg.id,
        plan_type: subscriptionForm.plan_type,
        price_paid: parseFloat(subscriptionForm.price_paid),
        start_date: subscriptionForm.start_date,
        end_date: subscriptionForm.end_date,
        status: subscriptionForm.status,
        currency: "HUF",
      });

      if (error) throw error;

      toast.success("Előfizetés sikeresen mentve");
      setSubscriptionDialogOpen(false);
      loadOrganizations();
    } catch (error) {
      toast.error("Hiba az előfizetés mentése során");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedOrg) return;

    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: editForm.name,
          type: editForm.type as any,
          location: editForm.location || null,
          description: editForm.description || null,
          website_url: editForm.website_url || null,
          employee_count: editForm.employee_count ? parseInt(editForm.employee_count) : null,
          is_public: editForm.is_public,
        })
        .eq("id", selectedOrg.id);

      if (error) throw error;

      toast.success("Szervezet sikeresen frissítve");
      setEditDialogOpen(false);
      loadOrganizations();
    } catch (error) {
      toast.error("Hiba a szervezet frissítése során");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "business":
        return "default";
      case "government":
        return "secondary";
      case "ngo":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "business":
        return "Vállalkozás";
      case "government":
        return "Önkormányzat";
      case "ngo":
        return "Civil";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">Nincs előfizetés</Badge>;
    }
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Aktív</Badge>;
      case "pending":
        return <Badge variant="secondary">Függőben</Badge>;
      case "expired":
        return <Badge variant="destructive">Lejárt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || org.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "none" && !org.subscription_status) ||
      org.subscription_status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If an organization is selected, show detail view
  if (selectedOrganizationId) {
    return (
      <OrganizationDetailView
        organizationId={selectedOrganizationId}
        onBack={() => setSelectedOrganizationId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Szervezetek</h2>
          <p className="text-muted-foreground">
            Összes szervezet kezelése a platformon
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Új szervezet
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Keresés név alapján..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Típus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes típus</SelectItem>
            <SelectItem value="business">Vállalkozás</SelectItem>
            <SelectItem value="government">Önkormányzat</SelectItem>
            <SelectItem value="ngo">Civil</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Előfizetés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes státusz</SelectItem>
            <SelectItem value="active">Aktív</SelectItem>
            <SelectItem value="pending">Függőben</SelectItem>
            <SelectItem value="expired">Lejárt</SelectItem>
            <SelectItem value="none">Nincs előfizetés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card/30 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logó</TableHead>
              <TableHead>Név</TableHead>
              <TableHead>Típus</TableHead>
              <TableHead>Település</TableHead>
              <TableHead>Előfizetés státusz</TableHead>
              <TableHead>Regisztráció</TableHead>
              <TableHead className="text-right">Művelet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nincs megjeleníthető szervezet
                </TableCell>
              </TableRow>
            ) : (
              filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={org.logo_url || undefined} />
                      <AvatarFallback>
                        <Building2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelectedOrganizationId(org.id)}
                      className="font-medium hover:text-primary hover:underline text-left"
                    >
                      {org.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(org.type)}>
                      {getTypeLabel(org.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{org.location || "-"}</TableCell>
                  <TableCell>{getStatusBadge(org.subscription_status)}</TableCell>
                  <TableCell>
                    {org.created_at ? format(new Date(org.created_at), "yyyy. MM. dd.") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(org)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleManageSubscription(org)}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(org)}
                      >
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
        Összesen: {filteredOrganizations.length} szervezet
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedOrg?.name} - Részletek</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Típus</p>
              <p>{selectedOrg ? getTypeLabel(selectedOrg.type) : ""}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Település</p>
              <p>{selectedOrg?.location || "-"}</p>
            </div>
            {selectedOrg?.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leírás</p>
                <p className="text-sm">{selectedOrg.description}</p>
              </div>
            )}
            {selectedOrg?.website_url && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weboldal</p>
                <a 
                  href={selectedOrg.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {selectedOrg.website_url}
                </a>
              </div>
            )}
            {selectedOrg?.employee_count && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alkalmazottak száma</p>
                <p>{selectedOrg.employee_count}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Előfizetés státusz
              </p>
              <div className="mt-1">{selectedOrg && getStatusBadge(selectedOrg.subscription_status)}</div>
            </div>
            {selectedOrg?.subscription_plan && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Előfizetési csomag
                </p>
                <p>{selectedOrg.subscription_plan}</p>
              </div>
            )}
            {selectedOrg?.subscription_end_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Előfizetés vége
                </p>
                <p>
                  {format(new Date(selectedOrg.subscription_end_date), "yyyy. MM. dd.")}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Regisztráció dátuma
              </p>
              <p>
                {selectedOrg?.created_at
                  ? format(new Date(selectedOrg.created_at), "yyyy. MM. dd.")
                  : "-"}
              </p>
            </div>
            
            {/* Associated Users */}
            {orgMembers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Csapattagok ({orgMembers.length})
                </p>
                <div className="space-y-2 border rounded-lg p-3">
                  {orgMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.user_role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Előfizetés kezelése - {selectedOrg?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Csomag típus</Label>
              <Select 
                value={subscriptionForm.plan_type} 
                onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, plan_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz csomagot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business_starter">Business Starter</SelectItem>
                  <SelectItem value="business_pro">Business Pro</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fizetett ár (HUF)</Label>
              <Input
                type="number"
                value={subscriptionForm.price_paid}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, price_paid: e.target.value })}
                placeholder="50000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kezdő dátum</Label>
                <Input
                  type="date"
                  value={subscriptionForm.start_date}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Lejárat dátuma</Label>
                <Input
                  type="date"
                  value={subscriptionForm.end_date}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Státusz</Label>
              <Select 
                value={subscriptionForm.status} 
                onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktív</SelectItem>
                  <SelectItem value="pending">Függőben</SelectItem>
                  <SelectItem value="expired">Lejárt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscriptionDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleSaveSubscription}>
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Szervezet szerkesztése</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Név *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Szervezet neve"
              />
            </div>
            <div className="space-y-2">
              <Label>Típus *</Label>
              <Select 
                value={editForm.type} 
                onValueChange={(value) => setEditForm({ ...editForm, type: value as "business" | "citizen" | "government" | "ngo" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Vállalkozás</SelectItem>
                  <SelectItem value="government">Önkormányzat</SelectItem>
                  <SelectItem value="ngo">Civil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Település</Label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Budapest"
              />
            </div>
            <div className="space-y-2">
              <Label>Leírás</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Rövid leírás a szervezetről..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Weboldal URL</Label>
              <Input
                value={editForm.website_url}
                onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Alkalmazottak száma</Label>
              <Input
                type="number"
                value={editForm.employee_count}
                onChange={(e) => setEditForm({ ...editForm, employee_count: e.target.value })}
                placeholder="50"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is-public">Nyilvános profil</Label>
              <Switch
                id="is-public"
                checked={editForm.is_public}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_public: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleSaveEdit}>
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationsManager;
