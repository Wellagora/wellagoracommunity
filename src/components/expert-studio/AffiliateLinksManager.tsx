import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link2, Plus, ExternalLink, Trash2, ShoppingBag, Edit2 } from 'lucide-react';

interface AffiliateLink {
  id: string;
  product_name: string;
  product_url: string;
  partner_name: string | null;
  commission_rate: number;
  is_active: boolean;
  click_count: number;
  content_id: string | null;
}

interface AffiliateLinksManagerProps {
  contentId?: string;
}

const AffiliateLinksManager = ({ contentId }: AffiliateLinksManagerProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_url: '',
    partner_name: '',
    commission_rate: 0
  });

  useEffect(() => {
    if (user) {
      loadLinks();
    }
  }, [user, contentId]);

  const loadLinks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('affiliate_links')
        .select('*')
        .eq('expert_id', user.id)
        .order('created_at', { ascending: false });

      if (contentId) {
        query = query.eq('content_id', contentId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading affiliate links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.product_name || !formData.product_url) {
      toast.error(language === 'hu' ? 'Töltsd ki a kötelező mezőket' : 'Fill in required fields');
      return;
    }

    try {
      if (editingLink) {
        // Update existing
        const { error } = await supabase
          .from('affiliate_links')
          .update({
            product_name: formData.product_name,
            product_url: formData.product_url,
            partner_name: formData.partner_name || null,
            commission_rate: formData.commission_rate,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLink.id);

        if (error) throw error;
        toast.success(language === 'hu' ? 'Link frissítve!' : 'Link updated!');
      } else {
        // Create new
        const { error } = await supabase
          .from('affiliate_links')
          .insert({
            expert_id: user.id,
            content_id: contentId || null,
            product_name: formData.product_name,
            product_url: formData.product_url,
            partner_name: formData.partner_name || null,
            commission_rate: formData.commission_rate
          });

        if (error) throw error;
        toast.success(language === 'hu' ? 'Link hozzáadva!' : 'Link added!');
      }

      setIsDialogOpen(false);
      setEditingLink(null);
      setFormData({ product_name: '', product_url: '', partner_name: '', commission_rate: 0 });
      loadLinks();
    } catch (error) {
      console.error('Error saving affiliate link:', error);
      toast.error(language === 'hu' ? 'Hiba történt' : 'Error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(language === 'hu' ? 'Link törölve!' : 'Link deleted!');
      loadLinks();
    } catch (error) {
      console.error('Error deleting affiliate link:', error);
      toast.error(language === 'hu' ? 'Hiba történt' : 'Error occurred');
    }
  };

  const handleToggleActive = async (link: AffiliateLink) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);

      if (error) throw error;
      loadLinks();
    } catch (error) {
      console.error('Error toggling affiliate link:', error);
    }
  };

  const openEditDialog = (link: AffiliateLink) => {
    setEditingLink(link);
    setFormData({
      product_name: link.product_name,
      product_url: link.product_url,
      partner_name: link.partner_name || '',
      commission_rate: link.commission_rate
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingLink(null);
    setFormData({ product_name: '', product_url: '', partner_name: '', commission_rate: 0 });
    setIsDialogOpen(true);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg text-black">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            {language === 'hu' ? 'Ajánlott Termékek' : 'Recommended Products'}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNewDialog} className="bg-black hover:bg-black/90 text-white">
                <Plus className="w-4 h-4 mr-1" />
                {language === 'hu' ? 'Új Link' : 'Add Link'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLink 
                    ? (language === 'hu' ? 'Link Szerkesztése' : 'Edit Link')
                    : (language === 'hu' ? 'Új Affiliate Link' : 'New Affiliate Link')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{language === 'hu' ? 'Termék neve *' : 'Product Name *'}</Label>
                  <Input
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder={language === 'hu' ? 'pl. Kertészeti olló' : 'e.g. Gardening Scissors'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'hu' ? 'Termék URL *' : 'Product URL *'}</Label>
                  <Input
                    value={formData.product_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'hu' ? 'Partner neve' : 'Partner Name'}</Label>
                  <Input
                    value={formData.partner_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, partner_name: e.target.value }))}
                    placeholder={language === 'hu' ? 'pl. Praktiker, Biobolt' : 'e.g. Home Depot'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'hu' ? 'Jutalék (%)' : 'Commission (%)'}</Label>
                  <Input
                    value={formData.commission_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full bg-black hover:bg-black/90 text-white">
                  {editingLink 
                    ? (language === 'hu' ? 'Mentés' : 'Save')
                    : (language === 'hu' ? 'Hozzáadás' : 'Add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-8">
            <Link2 className="w-12 h-12 mx-auto text-black/20 mb-3" />
            <p className="text-black/50 text-sm mb-4">
              {language === 'hu' 
                ? 'Ajánlj termékeket a résztvevőidnek!'
                : 'Recommend products to your participants!'}
            </p>
            <Button variant="outline" onClick={openNewDialog} className="border-black/10">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'hu' ? 'Első link hozzáadása' : 'Add first link'}
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    link.is_active 
                      ? 'bg-white border-black/5' 
                      : 'bg-black/[0.02] border-black/5 opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-black truncate">
                        {link.product_name}
                      </p>
                      {link.partner_name && (
                        <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-600">
                          {link.partner_name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-black/50">
                      <span>{link.click_count} {language === 'hu' ? 'kattintás' : 'clicks'}</span>
                      {link.commission_rate > 0 && (
                        <span className="text-emerald-600">{link.commission_rate}% jutalék</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Switch
                      checked={link.is_active}
                      onCheckedChange={() => handleToggleActive(link)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.open(link.product_url, '_blank')}
                      className="h-8 w-8"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(link)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(link.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AffiliateLinksManager;
