import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CreateProjectDialogProps {
  onSuccess: () => void;
}

export const CreateProjectDialog = ({ onSuccess }: CreateProjectDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    slug: '',
    region_name: '',
    villages: '',
    description: ''
  });

  const createProject = async () => {
    try {
      if (!newProject.name || !newProject.slug || !newProject.region_name) {
        toast({
          title: 'Hiányzó mezők',
          description: 'Kérlek töltsd ki az összes kötelező mezőt',
          variant: 'destructive'
        });
        return;
      }

      const villagesArray = newProject.villages
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      const { error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          slug: newProject.slug,
          region_name: newProject.region_name,
          villages: villagesArray,
          description: newProject.description || null,
          is_active: true,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Projekt létrehozva',
        description: `A "${newProject.name}" projekt sikeresen létrejött`,
      });

      setNewProject({
        name: '',
        slug: '',
        region_name: '',
        villages: '',
        description: ''
      });
      setOpen(false);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Nem sikerült létrehozni a projektet';
      toast({
        title: 'Hiba',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Új projekt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Új projekt létrehozása</DialogTitle>
          <DialogDescription>
            Töltsd ki a projekt alapvető adatait
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Projekt név *</Label>
            <Input
              id="name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="Káli medence"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL-barát azonosító (slug) *</Label>
            <Input
              id="slug"
              value={newProject.slug}
              onChange={(e) => setNewProject({ ...newProject, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="kali-medence"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Régió név *</Label>
            <Input
              id="region"
              value={newProject.region_name}
              onChange={(e) => setNewProject({ ...newProject, region_name: e.target.value })}
              placeholder="Káli medence"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="villages">Falvak (vesszővel elválasztva)</Label>
            <Input
              id="villages"
              value={newProject.villages}
              onChange={(e) => setNewProject({ ...newProject, villages: e.target.value })}
              placeholder="Köveskál, Szentbékkálla, Mindszentkálla"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Leírás</Label>
            <Textarea
              id="description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="A projekt részletes leírása..."
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Mégse
          </Button>
          <Button onClick={createProject}>
            Létrehozás
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
