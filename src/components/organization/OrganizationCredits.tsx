import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Zap,
  Crown,
  Star,
  Gem
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";
import { SubscriptionPlanSelector } from "@/components/subscription/SubscriptionPlanSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const { user, profile } = useAuth();
  const { credits, availableCredits, currentSubscription, isLoading, refreshCredits } = useSubscription();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  // Fetch credit transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) {
        setTransactionsLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('credit_transactions')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Filter by organization_id if available, otherwise by user_id
        if (profile?.organization_id) {
          query = query.eq('organization_id', profile.organization_id);
        } else {
          query = query.eq('sponsor_user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, profile?.organization_id]);

  const handleSelectPlan = async (planId: string) => {
    toast({
      title: "Csomag kiválasztva",
      description: "Stripe fizetés hamarosan elérhető! Kérjük vedd fel a kapcsolatot az adminisztrátorral.",
    });
    setShowPlanSelector(false);
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeMap = {
      purchase: { label: "Vásárlás", variant: "default" as const, icon: ShoppingCart },
      purchase_pending: { label: "Függőben", variant: "secondary" as const, icon: ShoppingCart },
      subscription: { label: "Előfizetés", variant: "default" as const, icon: Crown },
      sponsorship: { label: "Szponzorálás", variant: "outline" as const, icon: Award },
      spend: { label: "Felhasználás", variant: "outline" as const, icon: ArrowDownCircle },
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

  const formatCredits = (creditAmount: number, isPositive: boolean = true) => {
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? 'text-success' : 'text-destructive';
    return (
      <span className={`font-bold ${color}`}>
        {sign}{Math.abs(creditAmount).toLocaleString()} kredit
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

  const getTierIcon = (tier: string | undefined) => {
    switch (tier) {
      case 'bronze': return <Award className="w-5 h-5 text-amber-500" />;
      case 'silver': return <Star className="w-5 h-5 text-slate-400" />;
      case 'gold': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'diamond': return <Gem className="w-5 h-5 text-purple-500" />;
      default: return <Coins className="w-5 h-5 text-primary" />;
    }
  };

  const totalCredits = credits?.total_credits ?? 0;
  const usedCredits = credits?.used_credits ?? 0;
  const usagePercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

  if (isLoading || transactionsLoading) {
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
                {getTierIcon(currentSubscription?.plan?.tier)}
                <h3 className="text-xl font-semibold">Kredit egyenleged</h3>
              </div>
              <div className="text-5xl font-bold text-primary mb-2">
                {availableCredits.toLocaleString()}
              </div>
              <p className="text-muted-foreground">
                {availableCredits.toLocaleString()} / {totalCredits.toLocaleString()} kredit elérhető
              </p>
              {currentSubscription?.plan && (
                <Badge className="mt-2" variant="outline">
                  {currentSubscription.plan.name}
                </Badge>
              )}
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
                onClick={() => setShowPlanSelector(true)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {currentSubscription ? 'Csomag váltás' : 'Előfizetés'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Plan Selector Dialog */}
      <Dialog open={showPlanSelector} onOpenChange={setShowPlanSelector}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Előfizetési csomag választása</DialogTitle>
          </DialogHeader>
          <SubscriptionPlanSelector 
            onSelectPlan={handleSelectPlan}
            currentPlanKey={currentSubscription?.plan?.plan_key}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationCredits;
