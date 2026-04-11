import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag, Download, FileText, Receipt, ArrowLeft, ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

interface PurchaseRow {
  id: string;
  content_title: string;
  content_id: string | null;
  amount_total: number;
  amount_user_paid: number;
  amount_sponsor: number;
  amount_wellpoints: number;
  invoice_number: string | null;
  invoice_status: string;
  invoice_issued_by: string;
  invoice_pdf_url: string | null;
  created_at: string;
  voucher_code: string | null;
  status: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    maximumFractionDigits: 0,
  }).format(amount);

const PurchaseHistoryPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPurchases = async () => {
      setLoading(true);
      try {
        // Fetch transactions for this user
        const { data: txns, error: txErr } = await supabase
          .from("transactions")
          .select(
            "id, content_id, amount_total, amount_user_paid, amount_sponsor, amount_wellpoints, invoice_number, invoice_status, invoice_issued_by, invoice_pdf_url, created_at, status"
          )
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });

        if (txErr) throw txErr;
        if (!txns || txns.length === 0) {
          setPurchases([]);
          setLoading(false);
          return;
        }

        // Fetch content titles
        const contentIds = [...new Set(txns.map((t: any) => t.content_id).filter(Boolean))];
        let titlesMap: Record<string, string> = {};
        if (contentIds.length > 0) {
          const { data: contents } = await supabase
            .from("expert_contents")
            .select("id, title")
            .in("id", contentIds);
          contents?.forEach((c: any) => {
            titlesMap[c.id] = c.title;
          });
        }

        // Fetch voucher codes
        const txnIds = txns.map((t: any) => t.id);
        let voucherMap: Record<string, string> = {};
        if (txnIds.length > 0) {
          const { data: vouchers } = await supabase
            .from("vouchers")
            .select("transaction_id, voucher_code")
            .in("transaction_id", txnIds);
          vouchers?.forEach((v: any) => {
            if (v.transaction_id) voucherMap[v.transaction_id] = v.voucher_code;
          });
        }

        setPurchases(
          txns.map((t: any) => ({
            id: t.id,
            content_title: titlesMap[t.content_id] || "Ismeretlen program",
            content_id: t.content_id,
            amount_total: Number(t.amount_total) || 0,
            amount_user_paid: Number(t.amount_user_paid) || 0,
            amount_sponsor: Number(t.amount_sponsor) || 0,
            amount_wellpoints: Number(t.amount_wellpoints) || 0,
            invoice_number: t.invoice_number,
            invoice_status: t.invoice_status || "pending",
            invoice_issued_by: t.invoice_issued_by || "platform",
            invoice_pdf_url: t.invoice_pdf_url,
            created_at: t.created_at,
            voucher_code: voucherMap[t.id] || null,
            status: t.status || "completed",
          }))
        );
      } catch {
        // graceful fallback
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const isHu = language === "hu";

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <Navigation />
      <div className="container max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/my-agora">
            <Button variant="ghost" size="icon" className="text-[#3d3429]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#3d3429] flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-orange-500" />
              {isHu ? "Vásárlásaim" : "My Purchases"}
            </h1>
            <p className="text-[#3d3429]/60 text-sm">
              {isHu
                ? "Korábbi vásárlásaid és a hozzájuk tartozó bizonylatok"
                : "Your past purchases and associated invoices"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : purchases.length === 0 ? (
          <Card className="bg-white border-[#e8e0d8]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-[#3d3429]/30 mb-4" />
              <p className="text-[#3d3429]/60 text-lg">
                {isHu ? "Még nincs vásárlásod." : "You have no purchases yet."}
              </p>
              <Link to="/programs">
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
                  {isHu ? "Programok böngészése" : "Browse Programs"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-[#e8e0d8]">
            <CardHeader>
              <CardTitle className="text-[#3d3429]">
                {isHu ? `${purchases.length} vásárlás` : `${purchases.length} purchases`}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isHu ? "Dátum" : "Date"}</TableHead>
                    <TableHead>{isHu ? "Program" : "Program"}</TableHead>
                    <TableHead className="text-right">{isHu ? "Összeg" : "Amount"}</TableHead>
                    <TableHead>{isHu ? "Bizonylat" : "Invoice"}</TableHead>
                    <TableHead>{isHu ? "Voucher" : "Voucher"}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((p) => (
                    <TableRow key={p.id} className="hover:bg-[#f5f0eb]/50">
                      <TableCell className="text-sm text-[#3d3429]">
                        {format(new Date(p.created_at), "yyyy.MM.dd HH:mm", { locale: hu })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#3d3429]">{p.content_title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.amount_sponsor > 0 && (
                              <span className="text-xs text-amber-600">
                                Szponzor: {formatCurrency(p.amount_sponsor)}
                              </span>
                            )}
                            {p.amount_wellpoints > 0 && (
                              <span className="text-xs text-emerald-600">
                                WellPoints: {formatCurrency(p.amount_wellpoints)}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-mono font-semibold text-[#3d3429]">
                            {formatCurrency(p.amount_user_paid)}
                          </p>
                          {p.amount_total !== p.amount_user_paid && (
                            <p className="text-xs text-[#3d3429]/50 line-through">
                              {formatCurrency(p.amount_total)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.invoice_number ? (
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                p.invoice_status === "issued"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : p.invoice_status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              {p.invoice_number}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-[#3d3429]/40">
                            {p.invoice_status === "pending"
                              ? isHu
                                ? "Készül..."
                                : "Processing..."
                              : "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.voucher_code ? (
                          <span className="font-mono text-sm bg-[#f5f0eb] px-2 py-1 rounded">
                            {p.voucher_code}
                          </span>
                        ) : (
                          <span className="text-[#3d3429]/30">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {p.invoice_pdf_url && (
                            <Button size="sm" variant="ghost" asChild title={isHu ? "Számla letöltése" : "Download invoice"}>
                              <a href={p.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 text-orange-500" />
                              </a>
                            </Button>
                          )}
                          {p.content_id && (
                            <Button size="sm" variant="ghost" asChild title={isHu ? "Program megtekintése" : "View program"}>
                              <Link to={`/programs/${p.content_id}`}>
                                <ExternalLink className="h-4 w-4 text-[#3d3429]/60" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PurchaseHistoryPage;
