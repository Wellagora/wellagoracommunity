import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Package, Info, Pencil } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  plan_key: string;
  price_huf: number;
  price_eur: number;
  included_credits: number;
  monthly_credits: number | null;
  yearly_bonus_credits: number | null;
  is_active: boolean;
  display_order: number;
  features: any;
  billing_period: string;
  description: string;
}

const SystemSettings = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [defaultProjectId, setDefaultProjectId] = useState<string>("");
  const [platformName, setPlatformName] = useState<string>("");
  const [supportEmail, setSupportEmail] = useState<string>("");
  
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      setProjects(projectsData || []);

      // Load system settings
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('key, value');
      
      settingsData?.forEach(setting => {
        if (setting.key === 'default_project') {
          setDefaultProjectId((setting.value as any).project_id || '');
        } else if (setting.key === 'platform_name') {
          setPlatformName((setting.value as any).name || '');
        } else if (setting.key === 'support_email') {
          setSupportEmail((setting.value as any).email || '');
        }
      });

      // Load subscription plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order');
      setSubscriptionPlans(plansData || []);

    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Hiba történt a beállítások betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const saveSystemSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;
      toast.success('Beállítás mentve');
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error('Hiba történt a mentés során');
    }
  };

  const handleSaveDefaultProject = async () => {
    await saveSystemSetting('default_project', { project_id: defaultProjectId });
  };

  const handleSavePlatformName = async () => {
    await saveSystemSetting('platform_name', { name: platformName });
  };

  const handleSaveSupportEmail = async () => {
    await saveSystemSetting('support_email', { email: supportEmail });
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: editingPlan.name,
          price_huf: editingPlan.price_huf,
          price_eur: editingPlan.price_eur,
          monthly_credits: editingPlan.monthly_credits,
          yearly_bonus_credits: editingPlan.yearly_bonus_credits,
          included_credits: editingPlan.included_credits,
          is_active: editingPlan.is_active,
          features: editingPlan.features,
          description: editingPlan.description
        })
        .eq('id', editingPlan.id);

      if (error) throw error;
      toast.success('Csomag mentve');
      setShowPlanDialog(false);
      setEditingPlan(null);
      loadData();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Hiba történt a mentés során');
    }
  };

  const handleTogglePlanActive = async (plan: SubscriptionPlan) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;
      toast.success('Állapot frissítve');
      loadData();
    } catch (error) {
      console.error('Error toggling plan:', error);
      toast.error('Hiba történt a frissítés során');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Beállítások</h2>
        <p className="text-muted-foreground">
          Rendszer szintű beállítások és konfigurációk
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            Általános
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            <Package className="w-4 h-4 mr-2" />
            Előfizetési csomagok
          </TabsTrigger>
          <TabsTrigger value="system">
            <Info className="w-4 h-4 mr-2" />
            Rendszer info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-card/30 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Alapértelmezett projekt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultProject">Projekt</Label>
                <div className="flex gap-2">
                  <Select value={defaultProjectId} onValueChange={setDefaultProjectId}>
                    <SelectTrigger id="defaultProject">
                      <SelectValue placeholder="Válassz projektet" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSaveDefaultProject}>Mentés</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Platform adatok</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform név</Label>
                <div className="flex gap-2">
                  <Input
                    id="platformName"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="Wellagora"
                  />
                  <Button onClick={handleSavePlatformName}>Mentés</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Támogatási email</Label>
                <div className="flex gap-2">
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@wellagora.com"
                  />
                  <Button onClick={handleSaveSupportEmail}>Mentés</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Előfizetési csomagok</h3>
              <p className="text-sm text-muted-foreground">
                Szerkesztheti a meglévő 8 csomagot (Bronze, Silver, Gold, Diamond × Havi/Éves). Új csomag létrehozása vagy törlés nem engedélyezett.
              </p>
            </div>
          </div>

          <Card className="bg-card/30 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Csomag</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Időszak</TableHead>
                    <TableHead>Ár (HUF)</TableHead>
                    <TableHead>Kredit/hó</TableHead>
                    <TableHead>Bónusz</TableHead>
                    <TableHead>Aktív</TableHead>
                    <TableHead>Szerkesztés</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionPlans.map(plan => {
                    const tier = plan.plan_key.split('_')[0];
                    const period = plan.billing_period;
                    
                    return (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{tier}</Badge>
                        </TableCell>
                        <TableCell>
                          {period === 'monthly' ? 'Havi' : 'Éves'}
                        </TableCell>
                        <TableCell>{plan.price_huf.toLocaleString()} Ft</TableCell>
                        <TableCell>{plan.monthly_credits || '-'}</TableCell>
                        <TableCell>
                          {plan.yearly_bonus_credits ? `+${plan.yearly_bonus_credits}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={plan.is_active}
                            onCheckedChange={() => handleTogglePlanActive(plan)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPlan(plan);
                              setShowPlanDialog(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="bg-card/30 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Rendszer információ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Platform verzió</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Utolsó deploy</span>
                <span className="text-sm">2025-01-15 14:30</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Database status</span>
                <Badge className="bg-success text-success-foreground">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Edge functions status</span>
                <Badge className="bg-success text-success-foreground">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Összes felhasználó</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Összes szervezet</span>
                <span className="font-semibold">-</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Csomag szerkesztése</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Név</Label>
                  <Input
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kulcs (csak olvasható)</Label>
                  <Input
                    value={editingPlan.plan_key}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ár HUF</Label>
                  <Input
                    type="number"
                    value={editingPlan.price_huf}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price_huf: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ár EUR</Label>
                  <Input
                    type="number"
                    value={editingPlan.price_eur}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price_eur: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Kredit/hó</Label>
                  <Input
                    type="number"
                    value={editingPlan.monthly_credits || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthly_credits: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bónusz kredit (éves)</Label>
                  <Input
                    type="number"
                    value={editingPlan.yearly_bonus_credits || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, yearly_bonus_credits: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Össz. kredit</Label>
                  <Input
                    type="number"
                    value={editingPlan.included_credits}
                    onChange={(e) => setEditingPlan({ ...editingPlan, included_credits: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Leírás</Label>
                <Textarea
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Funkciók (soronként egy)</Label>
                <Textarea
                  value={Array.isArray(editingPlan.features) ? editingPlan.features.join('\n') : ''}
                  onChange={(e) => setEditingPlan({ 
                    ...editingPlan, 
                    features: e.target.value.split('\n').map(f => f.trim()).filter(Boolean)
                  })}
                  placeholder="Havi 1 kredit&#10;Szervezeti profil&#10;Logo megjelenés"
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingPlan.is_active}
                  onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                />
                <Label>Aktív</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Mégse
            </Button>
            <Button onClick={handleSavePlan}>Mentés</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemSettings;
