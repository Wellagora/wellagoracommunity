import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Service {
  id: string;
  title: string;
  description: string | null;
  service_type: string;
  price_huf: number;
  duration_minutes: number | null;
  is_active: boolean;
}

export const ExpertServicesManager = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_huf: 0,
    duration_minutes: 60,
    is_active: true
  });

  const loadServices = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data } = await supabase
      .from('expert_services')
      .select('*')
      .eq('expert_id', user.id)
      .order('created_at', { ascending: false });

    setServices(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, [user]);

  const openCreateDialog = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      price_huf: 0,
      duration_minutes: 60,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || '',
      price_huf: service.price_huf,
      duration_minutes: service.duration_minutes || 60,
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !formData.title.trim()) return;

    setIsSaving(true);
    try {
      if (editingService) {
        // Update
        const { error } = await supabase
          .from('expert_services')
          .update({
            title: formData.title,
            description: formData.description || null,
            price_huf: formData.price_huf,
            duration_minutes: formData.duration_minutes,
            is_active: formData.is_active
          })
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success(t('services.updated'));
      } else {
        // Create
        const { error } = await supabase
          .from('expert_services')
          .insert({
            expert_id: user.id,
            title: formData.title,
            description: formData.description || null,
            price_huf: formData.price_huf,
            duration_minutes: formData.duration_minutes,
            is_active: formData.is_active
          });

        if (error) throw error;
        toast.success(t('services.created'));
      }

      setIsDialogOpen(false);
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(t('services.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm(t('services.delete_confirm'))) return;

    try {
      const { error } = await supabase
        .from('expert_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      toast.success(t('services.deleted'));
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(t('services.delete_error'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('services.manage_title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('services.manage_subtitle')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t('services.add_new')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? t('services.edit_service') : t('services.add_service')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('services.title_label')}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('services.title_placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('services.description_label')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('services.description_placeholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('services.price_label')}</Label>
                  <Input
                    type="number"
                    value={formData.price_huf}
                    onChange={(e) => setFormData({ ...formData, price_huf: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('services.duration_label')}</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>{t('services.is_active')}</Label>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.title.trim()}
                className="w-full"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingService ? t('services.save_changes') : t('services.create')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">{t('services.no_services_yet')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('services.no_services_hint')}
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t('services.add_first')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{service.title}</h3>
                    {!service.is_active && (
                      <Badge variant="outline" className="text-xs">
                        {t('services.inactive')}
                      </Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {service.price_huf.toLocaleString()} Ft
                    </Badge>
                    {service.duration_minutes && (
                      <span className="text-muted-foreground">
                        {service.duration_minutes} {t('services.minutes')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(service.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
