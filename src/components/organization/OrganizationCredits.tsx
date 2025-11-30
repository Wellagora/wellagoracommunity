import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Coins, 
  ShoppingCart,
  TrendingUp,
  Award,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  Zap
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

interface SponsorCredits {
  id: string;
  sponsor_user_id: string;
  total_credits: number;
  used_credits: number;
  available_credits: number | null;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_huf: number;
  price_eur: number;
  created_at: string;
}

interface CreditTransaction {
  id: string;
  sponsor_user_id: string;
  transaction_type: string;
  credits: number;
  description: string | null;
  created_at: string;
  related_sponsorship_id: string | null;
}

const OrganizationCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [credits, setCredits] = useState<SponsorCredits | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch sponsor credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('sponsor_credits')
          .select('*')
          .eq('sponsor_user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching credits:', error);
        } else {
          setCredits(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCredits();
  }, [user?.id]);

  // Fetch credit packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('credit_packages')
          .select('*')
          .order('credits', { ascending: true });

        if (error) {
          console.error('Error fetching packages:', error);
        } else {
          setPackages(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchPackages();
  }, []);

  // Fetch credit transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('sponsor_user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  const handleSelectPackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setDialogOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !user?.id) return;

    try {
      // Create pending transaction
      const { error } = await supabase
        .from('credit_transactions')
        .insert({
          sponsor_user_id: user.id,
          transaction_type: 'purchase_pending',
          credits: selectedPackage.credits,
          description: `Kredit csomag vásárlás: ${selectedPackage.name}`,
        });

      if (error) throw error;

      toast({
        title: "Sikeres kérés",
        description: "Stripe fizetés hamarosan elérhető! Kérjük vedd fel a kapcsolatot az adminisztrátorral.",
      });
      
      setDialogOpen(false);
      
      // Refresh transactions
      const { data } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('sponsor_user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setTransactions(data);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült létrehozni a tranzakciót",
        variant: "destructive",
      });
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeMap = {
      purchase: { label: "Vásárlás", variant: "default" as const, icon: ShoppingCart },
      purchase_pending: { label: "Vásárlás (függőben)", variant: "secondary" as const, icon: ShoppingCart },
      sponsorship: { label: "Szponzorálás", variant: "outline" as const, icon: Award },
      bonus: { label: "Bónusz", variant: "default" as const, icon: Zap },
      refund: { label: "Visszatérítés", variant: "secondary" as const, icon: RefreshCw },
    };
    
    const typeInfo = typeMap[type as keyof typeof typeMap] || { 
      label: type, 
      variant: "outline" as const, 
      icon: Coins 
    };
    
    const Icon = typeInfo.icon;
    
    return (
      <Badge variant={typeInfo.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {typeInfo.label}
      </Badge>
    );
  };

  const formatCredits = (credits: number, isPositive: boolean = true) => {
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? 'text-success' : 'text-destructive';
    return (
      <span className={`font-bold ${color}`}>
        {sign}{Math.abs(credits).toLocaleString()} kredit
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy. MM. dd. HH:mm', { locale: hu });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount: number, currency: 'HUF' | 'EUR') => {
    return `${amount.toLocaleString('hu-HU')} ${currency}`;
  };

  const calculatePricePerCredit = (price: number, credits: number) => {
    return (price / credits).toFixed(2);
  };

  const availableCredits = credits?.available_credits ?? 0;
  const totalCredits = credits?.total_credits ?? 0;
  const usedCredits = credits?.used_credits ?? 0;
  const usagePercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Credits Overview Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Kredit egyenleged</h3>
              </div>
              <div className="text-5xl font-bold text-primary mb-2">
                {availableCredits.toLocaleString()}
              </div>
              <p className="text-muted-foreground">
                {availableCredits.toLocaleString()} / {totalCredits.toLocaleString()} kredit elérhető
              </p>
            </div>

            <div className="flex-1 w-full max-w-xs">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Felhasznált</span>
                  <span className="font-medium">{usedCredits.toLocaleString()} kredit</span>
                </div>
                <Progress value={usagePercentage} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Használat</span>
                  <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Kredit vásárlás
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Elérhető kredit csomagok</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className="border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-center text-xl">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">kredit</div>
                </div>

                <div className="space-y-2 py-4 border-y border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">HUF</span>
                    <span className="font-bold">{formatCurrency(pkg.price_huf, 'HUF')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">EUR</span>
                    <span className="font-bold">{formatCurrency(pkg.price_eur, 'EUR')}</span>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {calculatePricePerCredit(pkg.price_huf, pkg.credits)} HUF / kredit
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleSelectPackage(pkg)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Vásárlás
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Tranzakció előzmények</h2>
        {transactions.length === 0 ? (
          <Card className="border-muted">
            <CardContent className="py-16 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Még nincsenek tranzakciók</h3>
              <p className="text-muted-foreground">
                A kredit tranzakciók itt fognak megjelenni
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dátum</TableHead>
                      <TableHead>Típus</TableHead>
                      <TableHead>Kreditek</TableHead>
                      <TableHead>Leírás</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const isPositive = transaction.credits > 0;
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {formatDate(transaction.created_at)}
                          </TableCell>
                          <TableCell>
                            {getTransactionTypeBadge(transaction.transaction_type)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isPositive ? (
                                <ArrowUpCircle className="w-4 h-4 text-success" />
                              ) : (
                                <ArrowDownCircle className="w-4 h-4 text-destructive" />
                              )}
                              {formatCredits(transaction.credits, isPositive)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {transaction.description || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Package Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kredit csomag vásárlása</DialogTitle>
            <DialogDescription>
              Jóváhagyod a következő csomag megrendelését?
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
                <Coins className="w-10 h-10 text-primary" />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{selectedPackage.name}</h3>
                <div className="text-4xl font-bold text-primary mb-1">
                  {selectedPackage.credits.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">kredit</div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HUF ár</span>
                  <span className="font-bold">{formatCurrency(selectedPackage.price_huf, 'HUF')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EUR ár</span>
                  <span className="font-bold">{formatCurrency(selectedPackage.price_eur, 'EUR')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Kredit ára</span>
                  <span className="font-medium text-sm">
                    {calculatePricePerCredit(selectedPackage.price_huf, selectedPackage.credits)} HUF / kredit
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handlePurchase} className="bg-gradient-to-r from-primary to-accent">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Fizetés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationCredits;
