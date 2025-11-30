import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/dialog";
import { Building2, Plus, Eye, CreditCard, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type OrganizationWithSubscription = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  logo_url: string | null;
  created_at: string;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_end_date: string | null;
};

const OrganizationsManager = () => {
  const [organizations, setOrganizations] = useState<OrganizationWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
          created_at: org.created_at,
          subscription_status: subscription?.status || null,
          subscription_plan: subscription?.plan_type || null,
          subscription_end_date: subscription?.end_date || null,
        };
      });

      setOrganizations(mergedData);
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setLoading(false);
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
      <div className="border rounded-lg">
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
                  <TableCell className="font-medium">{org.name}</TableCell>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{org.name} - Részletek</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Típus</p>
                              <p>{getTypeLabel(org.type)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Település</p>
                              <p>{org.location || "-"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Előfizetés státusz
                              </p>
                              <div className="mt-1">{getStatusBadge(org.subscription_status)}</div>
                            </div>
                            {org.subscription_plan && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Előfizetési csomag
                                </p>
                                <p>{org.subscription_plan}</p>
                              </div>
                            )}
                            {org.subscription_end_date && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Előfizetés vége
                                </p>
                                <p>
                                  {format(new Date(org.subscription_end_date), "yyyy. MM. dd.")}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Regisztráció dátuma
                              </p>
                              <p>
                                {org.created_at
                                  ? format(new Date(org.created_at), "yyyy. MM. dd.")
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" size="sm">
                        <CreditCard className="h-4 w-4" />
                      </Button>
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
        Összesen: {filteredOrganizations.length} szervezet
      </div>
    </div>
  );
};

export default OrganizationsManager;
