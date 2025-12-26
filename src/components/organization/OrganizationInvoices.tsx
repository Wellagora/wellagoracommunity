import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  CheckCircle2, 
  Clock,
  XCircle,
  Download,
  Receipt,
  TrendingUp
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

interface Invoice {
  id: string;
  invoice_number: string;
  type: string;
  description: string | null;
  amount: number;
  total_amount: number;
  tax_amount: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
  due_date: string | null;
  paid_at: string | null;
  billing_name: string | null;
  billing_address: string | null;
  billing_tax_number: string | null;
  pdf_url: string | null;
  organization_id: string | null;
}

const OrganizationInvoices = () => {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (error) {
          // Silent error handling
        } else {
          setInvoices(data || []);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [profile?.organization_id]);

  // Calculate summary metrics
  const totalCount = invoices.length;
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;
  const pendingCount = invoices.filter(inv => inv.status === 'pending' || inv.status === 'draft').length;
  const totalSpent = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const getStatusBadge = (status: string | null) => {
    const statusMap = {
      paid: { label: "Fizetve", variant: "default" as const, icon: CheckCircle2, color: "text-success" },
      pending: { label: "Függőben", variant: "secondary" as const, icon: Clock, color: "text-warning" },
      draft: { label: "Vázlat", variant: "outline" as const, icon: FileText, color: "text-muted-foreground" },
      cancelled: { label: "Törölve", variant: "destructive" as const, icon: XCircle, color: "text-destructive" },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      subscription: { label: "Előfizetés", color: "bg-primary/10 text-primary" },
      credit_purchase: { label: "Kredit vásárlás", color: "bg-accent/10 text-accent" },
      other: { label: "Egyéb", color: "bg-muted text-muted-foreground" },
    };
    
    const typeInfo = typeMap[type as keyof typeof typeMap] || typeMap.other;
    
    return (
      <Badge variant="outline" className={typeInfo.color}>
        {typeInfo.label}
      </Badge>
    );
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'yyyy. MM. dd.', { locale: hu });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount: number, currency: string | null) => {
    return `${amount.toLocaleString('hu-HU')} ${currency || 'HUF'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Összes számla</p>
                <p className="text-3xl font-bold text-foreground">{totalCount}</p>
              </div>
              <Receipt className="w-10 h-10 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fizetett</p>
                <p className="text-3xl font-bold text-success">{paidCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Függőben</p>
                <p className="text-3xl font-bold text-warning">{pendingCount}</p>
              </div>
              <Clock className="w-10 h-10 text-warning/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Összes költés</p>
                <p className="text-2xl font-bold text-accent">{formatCurrency(totalSpent, 'HUF')}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-accent/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <Card className="border-muted">
          <CardContent className="py-16 text-center">
            <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">Még nincsenek számlák</h3>
            <p className="text-muted-foreground">
              A számlák itt fognak megjelenni az előfizetések és vásárlások után
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Számlák listája
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Számla szám</TableHead>
                    <TableHead>Típus</TableHead>
                    <TableHead>Leírás</TableHead>
                    <TableHead>Összeg</TableHead>
                    <TableHead>Státusz</TableHead>
                    <TableHead>Dátum</TableHead>
                    <TableHead>Fizetési határidő</TableHead>
                    <TableHead className="text-right">Művelet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(invoice.type)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {invoice.description || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(invoice.created_at)}
                      </TableCell>
                      <TableCell>
                        {formatDate(invoice.due_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(invoice)}
                        >
                          Részletek
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Számla részletei
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6 py-4">
              {/* Invoice Header */}
              <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Számlaszám</p>
                  <p className="text-xl font-bold">{selectedInvoice.invoice_number}</p>
                </div>
                {getStatusBadge(selectedInvoice.status)}
              </div>

              {/* Invoice Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Típus</p>
                  {getTypeBadge(selectedInvoice.type)}
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kiállítva</p>
                  <p className="font-medium">{formatDate(selectedInvoice.created_at)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fizetési határidő</p>
                  <p className="font-medium">{formatDate(selectedInvoice.due_date)}</p>
                </div>

                {selectedInvoice.paid_at && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fizetve</p>
                    <p className="font-medium text-success">{formatDate(selectedInvoice.paid_at)}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedInvoice.description && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Leírás</p>
                  <p className="text-sm">{selectedInvoice.description}</p>
                </div>
              )}

              {/* Billing Details */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-semibold">Számlázási adatok</h4>
                
                {selectedInvoice.billing_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Név</p>
                    <p className="font-medium">{selectedInvoice.billing_name}</p>
                  </div>
                )}

                {selectedInvoice.billing_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cím</p>
                    <p className="font-medium">{selectedInvoice.billing_address}</p>
                  </div>
                )}

                {selectedInvoice.billing_tax_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Adószám</p>
                    <p className="font-medium">{selectedInvoice.billing_tax_number}</p>
                  </div>
                )}
              </div>

              {/* Amounts */}
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nettó összeg</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</span>
                </div>
                
                {selectedInvoice.tax_amount && selectedInvoice.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ÁFA</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.tax_amount, selectedInvoice.currency)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Végösszeg</span>
                  <span className="text-primary">{formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency)}</span>
                </div>
              </div>

              {/* PDF Download */}
              {selectedInvoice.pdf_url && (
                <Button
                  className="w-full"
                  variant="outline"
                  asChild
                >
                  <a href={selectedInvoice.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    PDF letöltése
                  </a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationInvoices;
