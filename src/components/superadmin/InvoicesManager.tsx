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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  CheckCircle,
  Eye,
  Trash2,
  FileText,
  AlertCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

type InvoiceWithOrg = {
  id: string;
  invoice_number: string;
  organization_id: string | null;
  organization_name: string;
  type: string;
  description: string | null;
  amount: number;
  tax_amount: number | null;
  total_amount: number;
  currency: string | null;
  status: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};

const invoiceSchema = z.object({
  organization_id: z.string().uuid({ message: "Válassz szervezetet" }),
  type: z.enum(["subscription", "credit_purchase", "one_time"]),
  description: z.string().max(500, { message: "Leírás maximum 500 karakter lehet" }),
  amount: z.number().positive({ message: "Az összegnek pozitívnak kell lennie" }),
  tax_amount: z.number().nonnegative({ message: "Az adó nem lehet negatív" }),
  due_date: z.string().min(1, { message: "Add meg a fizetési határidőt" }),
});

const InvoicesManager = () => {
  const [invoices, setInvoices] = useState<InvoiceWithOrg[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithOrg | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    organization_id: "",
    type: "subscription",
    description: "",
    amount: "",
    tax_amount: "",
    due_date: "",
  });

  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingTotal: 0,
    overdueCount: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (invoicesError) throw invoicesError;

      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("id, name");

      if (orgsError) throw orgsError;

      setOrganizations(orgsData || []);

      const mergedData: InvoiceWithOrg[] = (invoicesData || []).map((inv) => {
        const org = orgsData?.find((o) => o.id === inv.organization_id);
        return {
          id: inv.id,
          invoice_number: inv.invoice_number,
          organization_id: inv.organization_id,
          organization_name: org?.name || "N/A",
          type: inv.type,
          description: inv.description,
          amount: inv.amount,
          tax_amount: inv.tax_amount,
          total_amount: inv.total_amount,
          currency: inv.currency || "HUF",
          status: inv.status || "draft",
          due_date: inv.due_date,
          paid_at: inv.paid_at,
          created_at: inv.created_at!,
        };
      });

      setInvoices(mergedData);

      // Calculate stats
      const paid = mergedData.filter((i) => i.status === "paid");
      const paidTotal = paid.reduce((sum, i) => sum + i.total_amount, 0);
      
      const pending = mergedData.filter((i) => i.status === "pending");
      const pendingTotal = pending.reduce((sum, i) => sum + i.total_amount, 0);
      
      const now = new Date();
      const overdue = mergedData.filter(
        (i) => i.status === "pending" && i.due_date && isBefore(new Date(i.due_date), now)
      );
      
      const today = startOfDay(now);
      const todayEnd = endOfDay(now);
      const todayPaid = paid.filter(
        (i) => i.paid_at && isAfter(new Date(i.paid_at), today) && isBefore(new Date(i.paid_at), todayEnd)
      );
      const todayTotal = todayPaid.reduce((sum, i) => sum + i.total_amount, 0);

      setStats({
        totalPaid: paidTotal,
        pendingTotal: pendingTotal,
        overdueCount: overdue.length,
        todayRevenue: todayTotal,
      });
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Hiba a számlák betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const { data, error } = await supabase
      .from("invoices")
      .select("invoice_number")
      .like("invoice_number", `${year}-%`)
      .order("invoice_number", { ascending: false })
      .limit(1);

    if (error) throw error;

    let sequence = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].invoice_number;
      const lastSequence = parseInt(lastNumber.split("-")[1]);
      sequence = lastSequence + 1;
    }

    return `${year}-${sequence.toString().padStart(5, "0")}`;
  };

  const handleCreateInvoice = async () => {
    try {
      const amount = parseFloat(formData.amount);
      const taxAmount = parseFloat(formData.tax_amount || "0");
      const totalAmount = amount + taxAmount;

      const validated = invoiceSchema.parse({
        organization_id: formData.organization_id,
        type: formData.type,
        description: formData.description,
        amount,
        tax_amount: taxAmount,
        due_date: formData.due_date,
      });

      const invoiceNumber = await generateInvoiceNumber();

      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        organization_id: validated.organization_id,
        type: validated.type,
        description: validated.description,
        amount: validated.amount,
        tax_amount: validated.tax_amount,
        total_amount: totalAmount,
        currency: "HUF",
        status: "draft",
        due_date: validated.due_date,
      });

      if (error) throw error;

      toast.success("Számla létrehozva");
      setIsCreateDialogOpen(false);
      setFormData({
        organization_id: "",
        type: "subscription",
        description: "",
        amount: "",
        tax_amount: "",
        due_date: "",
      });
      loadData();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        console.error("Error creating invoice:", error);
        toast.error("Hiba a számla létrehozásakor");
      }
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      if (error) throw error;

      toast.success("Számla fizetettnek jelölve");
      loadData();
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast.error("Hiba a számla frissítésekor");
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a számlát?")) return;

    try {
      const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);

      if (error) throw error;

      toast.success("Számla törölve");
      loadData();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Hiba a számla törlésekor");
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "subscription":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Előfizetés</Badge>;
      case "credit_purchase":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Kredit vásárlás</Badge>;
      case "one_time":
        return <Badge variant="outline">Egyszeri</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Fizetve</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Függőben</Badge>;
      case "overdue":
        return <Badge variant="destructive">Lejárt</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="line-through text-muted-foreground">Törölt</Badge>;
      case "refunded":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Visszatérített</Badge>;
      case "draft":
        return <Badge variant="outline" className="text-muted-foreground">Piszkozat</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.organization_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesType = typeFilter === "all" || inv.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

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
          <h2 className="text-3xl font-bold tracking-tight">Számlák</h2>
          <p className="text-muted-foreground">Összes számla kezelése</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Új számla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Új számla létrehozása</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Szervezet</Label>
                <Select
                  value={formData.organization_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, organization_id: value })
                  }
                >
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
                <Label>Típus</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Előfizetés</SelectItem>
                    <SelectItem value="credit_purchase">Kredit vásárlás</SelectItem>
                    <SelectItem value="one_time">Egyszeri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Leírás</Label>
                <Textarea
                  placeholder="Számla leírása"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  maxLength={500}
                />
              </div>
              <div className="space-y-2">
                <Label>Nettó összeg (Ft)</Label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ÁFA (Ft)</Label>
                <Input
                  type="number"
                  placeholder="40500"
                  value={formData.tax_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_amount: e.target.value })
                  }
                />
              </div>
              {formData.amount && (
                <div className="text-sm text-muted-foreground">
                  Bruttó összeg:{" "}
                  {(
                    parseFloat(formData.amount) + parseFloat(formData.tax_amount || "0")
                  ).toLocaleString()}{" "}
                  Ft
                </div>
              )}
              <div className="space-y-2">
                <Label>Fizetési határidő</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Mégse
              </Button>
              <Button onClick={handleCreateInvoice}>Létrehozás</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes befizetés</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPaid.toLocaleString()} Ft
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Függőben</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingTotal.toLocaleString()} Ft
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lejárt számlák</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mai bevétel</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todayRevenue.toLocaleString()} Ft
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Keresés számlaszám vagy szervezet szerint..."
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
            <SelectItem value="draft">Piszkozat</SelectItem>
            <SelectItem value="pending">Függőben</SelectItem>
            <SelectItem value="paid">Fizetve</SelectItem>
            <SelectItem value="overdue">Lejárt</SelectItem>
            <SelectItem value="cancelled">Törölt</SelectItem>
            <SelectItem value="refunded">Visszatérített</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Típus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes típus</SelectItem>
            <SelectItem value="subscription">Előfizetés</SelectItem>
            <SelectItem value="credit_purchase">Kredit vásárlás</SelectItem>
            <SelectItem value="one_time">Egyszeri</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card/30 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Számlaszám</TableHead>
              <TableHead>Szervezet</TableHead>
              <TableHead>Típus</TableHead>
              <TableHead>Leírás</TableHead>
              <TableHead>Összeg</TableHead>
              <TableHead>Státusz</TableHead>
              <TableHead>Határidő</TableHead>
              <TableHead>Fizetve</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nincs megjeleníthető számla
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.organization_name}</TableCell>
                  <TableCell>{getTypeBadge(inv.type)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {inv.description || "-"}
                  </TableCell>
                  <TableCell>
                    {inv.total_amount.toLocaleString()} {inv.currency}
                  </TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell>
                    {inv.due_date ? format(new Date(inv.due_date), "yyyy. MM. dd.") : "-"}
                  </TableCell>
                  <TableCell>
                    {inv.paid_at ? format(new Date(inv.paid_at), "yyyy. MM. dd.") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {(inv.status === "pending" || inv.status === "overdue") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsPaid(inv.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Fizetve
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {inv.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(inv.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Összesen: {filteredInvoices.length} számla
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Számla részletei</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Számlaszám</p>
                <p className="text-lg font-semibold">{selectedInvoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Szervezet</p>
                <p>{selectedInvoice.organization_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Típus</p>
                <div className="mt-1">{getTypeBadge(selectedInvoice.type)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leírás</p>
                <p>{selectedInvoice.description || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nettó összeg</p>
                  <p>{selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ÁFA</p>
                  <p>
                    {selectedInvoice.tax_amount?.toLocaleString() || 0} {selectedInvoice.currency}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bruttó összeg</p>
                <p className="text-lg font-semibold">
                  {selectedInvoice.total_amount.toLocaleString()} {selectedInvoice.currency}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Státusz</p>
                <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fizetési határidő</p>
                  <p>
                    {selectedInvoice.due_date
                      ? format(new Date(selectedInvoice.due_date), "yyyy. MM. dd.")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fizetve</p>
                  <p>
                    {selectedInvoice.paid_at
                      ? format(new Date(selectedInvoice.paid_at), "yyyy. MM. dd.")
                      : "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Létrehozva</p>
                <p>
                  {format(new Date(selectedInvoice.created_at), "yyyy. MM. dd. HH:mm")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesManager;
