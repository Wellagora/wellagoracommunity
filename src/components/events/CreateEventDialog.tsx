import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const VILLAGES = [
  'Kővágóörs',
  'Mindszentkálla', 
  'Kékkút',
  'Szentbékkálla',
  'Balatonhenye',
  'Köveskál',
  'Salföld',
  'Ábrahámhegy',
];

interface CreateEventDialogProps {
  trigger?: React.ReactNode;
}

export function CreateEventDialog({ trigger }: CreateEventDialogProps) {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location_name: '',
    village: '',
    max_participants: '',
  });

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase.from('events').insert({
        title: formData.title,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        location_name: formData.location_name || null,
        village: formData.village || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        is_public: true,
        created_by: user.id,
        organization_id: profile?.organization_id || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
      toast.success(t('events.create_success') || 'Event created successfully!');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location_name: '',
        village: '',
        max_participants: '',
      });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast.error(t('events.create_error') || 'Failed to create event');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date) {
      toast.error(t('events.validation_error') || 'Please fill in required fields');
      return;
    }
    createEventMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <CalendarPlus className="w-4 h-4" />
            {t('events.create')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-primary" />
            {t('events.create')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('events.title')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('events.title_placeholder') || 'Event title'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('events.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('events.description_placeholder') || 'Event description'}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t('events.start_date')} *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">{t('events.end_date')}</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_name">{t('events.location')}</Label>
            <Input
              id="location_name"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder={t('events.location_placeholder') || 'Event location'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="village">{t('events.village')}</Label>
              <Select
                value={formData.village}
                onValueChange={(value) => setFormData({ ...formData, village: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('events.select_village') || 'Select village'} />
                </SelectTrigger>
                <SelectContent>
                  {VILLAGES.map((village) => (
                    <SelectItem key={village} value={village}>
                      {village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_participants">{t('events.max_participants')}</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                placeholder="20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('events.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
