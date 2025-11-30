import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock,
  Zap,
  Crown,
  Package
} from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

interface Subscription {
  id: string;
  organization_id: string;
  plan_type: string;
  status: string;
  price_paid: number | null;
  start_date: string | null;
  end_date: string | null;
  included_credits: number | null;
  auto_renew: boolean | null;
  currency: string | null;
  created_at: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  plan_key: string;
  price_huf: number;
  price_eur: number;
  included_credits: number | null;
  features: any; // Json type from database
  description: string | null;
  billing_period: string | null;
  target_user_role: string | null;
  is_active: boolean | null;
  display_order: number | null;
}

const OrganizationSubscription = () => {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else if (data) {
          setCurrentSubscription(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchSubscription();
  }, [profile?.organization_id]);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) {
          console.error('Error fetching plans:', error);
        } else {
          setAvailablePlans(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleAutoRenewToggle = async (value: boolean) => {
    if (!currentSubscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ auto_renew: value })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      setCurrentSubscription({ ...currentSubscription, auto_renew: value });
      toast({
        title: "Frissítve",
        description: value ? "Az automatikus megújítás bekapcsolva" : "Az automatikus megújítás kikapcsolva",
      });
    } catch (error) {
      console.error('Error updating auto-renew:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült frissíteni az automatikus megújítást",
        variant: "destructive",
      });
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !profile?.organization_id) return;

    try {
      // Create pending subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          organization_id: profile.organization_id,
          plan_type: selectedPlan.plan_key,
          status: 'pending',
          price_paid: selectedPlan.price_huf,
          currency: 'HUF',
          included_credits: selectedPlan.included_credits,
        });

      if (error) throw error;

      toast({
        title: "Sikeres kérés",
        description: "Stripe fizetés hamarosan elérhető! Kérjük vedd fel a kapcsolatot az adminisztrátorral.",
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült létrehozni az előfizetést",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Aktív", variant: "default" as const, icon: CheckCircle2 },
      pending: { label: "Függőben", variant: "secondary" as const, icon: Clock },
      expired: { label: "Lejárt", variant: "destructive" as const, icon: Clock },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getPlanIcon = (planKey: string) => {
    if (planKey.includes('enterprise')) return Crown;
    if (planKey.includes('pro')) return Zap;
    return Package;
  };

  const calculateProgress = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 0;
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const now = new Date();
    
    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(now, start);
    
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    return Math.max(0, differenceInDays(parseISO(endDate), new Date()));
  };

  const getDateLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
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
      {/* Current Subscription Section */}
      {currentSubscription ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Jelenlegi előfizetésed
                </CardTitle>
                <CardDescription className="mt-2">
                  {availablePlans.find(p => p.plan_key === currentSubscription.plan_type)?.name || currentSubscription.plan_type}
                </CardDescription>
              </div>
              {getStatusBadge(currentSubscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                <CreditCard className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Fizetett összeg</p>
                  <p className="text-lg font-bold">
                    {currentSubscription.price_paid?.toLocaleString() || 0} {currentSubscription.currency || 'HUF'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                <Calendar className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Időszak</p>
                  <p className="text-sm font-medium">
                    {currentSubscription.start_date && format(parseISO(currentSubscription.start_date), 'PP', { locale: getDateLocale() })}
                    {' - '}
                    {currentSubscription.end_date && format(parseISO(currentSubscription.end_date), 'PP', { locale: getDateLocale() })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Hátralévő napok</p>
                  <p className="text-lg font-bold">
                    {getDaysRemaining(currentSubscription.end_date) ?? '-'} nap
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {currentSubscription.start_date && currentSubscription.end_date && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Előfizetés idővonala</span>
                  <span className="text-foreground font-medium">
                    {calculateProgress(currentSubscription.start_date, currentSubscription.end_date).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={calculateProgress(currentSubscription.start_date, currentSubscription.end_date)} 
                  className="h-2"
                />
              </div>
            )}

            {/* Auto Renew Toggle */}
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
              <div className="space-y-0.5">
                <p className="font-medium">Automatikus megújítás</p>
                <p className="text-sm text-muted-foreground">
                  Az előfizetés automatikusan megújul a lejárat előtt
                </p>
              </div>
              <Switch
                checked={currentSubscription.auto_renew ?? false}
                onCheckedChange={handleAutoRenewToggle}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-muted">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Még nincs aktív előfizetésed</h3>
            <p className="text-muted-foreground mb-6">
              Válassz az alábbi csomagok közül a kezdéshez
            </p>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
              <Package className="w-4 h-4 mr-2" />
              Válassz csomagot
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Plans Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Elérhető előfizetési csomagok</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePlans.map((plan) => {
            const Icon = getPlanIcon(plan.plan_key);
            const isCurrentPlan = currentSubscription?.plan_type === plan.plan_key;

            return (
              <Card 
                key={plan.id} 
                className={`relative ${isCurrentPlan ? 'border-primary shadow-glow' : 'border-border'}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-secondary">
                      Jelenlegi csomag
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="py-4 border-y border-border">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{plan.price_huf.toLocaleString()}</span>
                      <span className="text-muted-foreground">HUF</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {plan.price_eur} EUR / {plan.billing_period || 'év'}
                    </div>
                  </div>

                  {plan.included_credits && plan.included_credits > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-medium">{plan.included_credits} kredit</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isCurrentPlan ? "Aktív csomag" : "Kiválasztom"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Plan Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Előfizetés kiválasztása</DialogTitle>
            <DialogDescription>
              Jóváhagyod a következő csomag megrendelését?
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{selectedPlan.price_huf.toLocaleString()}</span>
                  <span className="text-muted-foreground">HUF</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedPlan.price_eur} EUR / {selectedPlan.billing_period || 'év'}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">A csomag tartalma:</p>
                {(Array.isArray(selectedPlan.features) ? selectedPlan.features : []).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handlePurchase} className="bg-gradient-to-r from-primary to-secondary">
              <CreditCard className="w-4 h-4 mr-2" />
              Fizetés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationSubscription;
