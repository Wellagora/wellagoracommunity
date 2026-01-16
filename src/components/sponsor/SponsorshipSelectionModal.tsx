import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Layers, 
  User, 
  Leaf, 
  Utensils, 
  Heart, 
  Palette, 
  Loader2,
  Check,
  Sparkles
} from 'lucide-react';

interface SponsorshipSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Expert {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  expert_title: string | null;
  expertise_areas: string[] | null;
}

const CATEGORIES = [
  { id: 'sustainability', label: { hu: 'Fenntarthatóság', en: 'Sustainability', de: 'Nachhaltigkeit' }, icon: Leaf, color: 'emerald' },
  { id: 'food', label: { hu: 'Élelmiszer & Kézműves', en: 'Food & Craft', de: 'Essen & Handwerk' }, icon: Utensils, color: 'amber' },
  { id: 'wellness', label: { hu: 'Egészség & Wellness', en: 'Health & Wellness', de: 'Gesundheit & Wellness' }, icon: Heart, color: 'rose' },
  { id: 'creative', label: { hu: 'Kreatív & Művészet', en: 'Creative & Art', de: 'Kreativ & Kunst' }, icon: Palette, color: 'violet' },
];

const SponsorshipSelectionModal = ({ open, onOpenChange, onSuccess }: SponsorshipSelectionModalProps) => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const [sponsorshipType, setSponsorshipType] = useState<'category' | 'expert'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch verified experts
  useEffect(() => {
    const fetchExperts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, expert_title, expertise_areas')
        .eq('is_verified_expert', true)
        .limit(20);

      if (!error && data) {
        setExperts(data);
      }
      setIsLoading(false);
    };

    if (open) {
      fetchExperts();
    }
  }, [open]);

  const handleSave = async () => {
    if (!user) {
      toast.error(language === 'hu' ? 'Bejelentkezés szükséges' : 'Login required');
      return;
    }

    if (sponsorshipType === 'category' && !selectedCategory) {
      toast.error(language === 'hu' ? 'Válasszon kategóriát' : 'Please select a category');
      return;
    }

    if (sponsorshipType === 'expert' && !selectedExpert) {
      toast.error(language === 'hu' ? 'Válasszon szakértőt' : 'Please select an expert');
      return;
    }

    setIsSaving(true);

    try {
      // Update sponsor_credits with the selection
      const updateData: Record<string, any> = {
        sponsorship_type: sponsorshipType,
        sponsored_category: sponsorshipType === 'category' ? selectedCategory : null,
        sponsored_expert_id: sponsorshipType === 'expert' ? selectedExpert : null,
      };

      const { error } = await supabase
        .from('sponsor_credits')
        .update(updateData)
        .eq('sponsor_user_id', user.id);

      if (error) throw error;

      toast.success(
        language === 'hu' 
          ? 'Támogatási preferencia elmentve!' 
          : 'Sponsorship preference saved!'
      );

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving sponsorship selection:', error);
      toast.error(language === 'hu' ? 'Hiba történt' : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || Layers;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-[0.5px] border-black/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-black">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            {language === 'hu' ? 'Támogatási Típus Kiválasztása' : 'Select Sponsorship Type'}
          </DialogTitle>
          <DialogDescription className="text-black/60">
            {language === 'hu' 
              ? 'Válassza ki, hogyan szeretné támogatni a közösséget: egy teljes kategóriát vagy egy konkrét szakértőt.'
              : 'Choose how you want to support the community: an entire category or a specific expert.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sponsorship Type Selection */}
          <RadioGroup 
            value={sponsorshipType} 
            onValueChange={(value) => setSponsorshipType(value as 'category' | 'expert')}
            className="grid grid-cols-2 gap-4"
          >
            <Label 
              htmlFor="type-category"
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                sponsorshipType === 'category' 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-black/10 hover:border-black/20'
              }`}
            >
              <RadioGroupItem value="category" id="type-category" className="sr-only" />
              <div className="flex flex-col items-center gap-2 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  sponsorshipType === 'category' ? 'bg-emerald-500 text-white' : 'bg-black/5 text-black/60'
                }`}>
                  <Layers className="w-6 h-6" />
                </div>
                <span className="font-semibold text-black">
                  {language === 'hu' ? 'Kategória' : 'Category'}
                </span>
                <span className="text-xs text-black/50">
                  {language === 'hu' 
                    ? 'Minden program egy témakörben'
                    : 'All programs in a topic'}
                </span>
                {sponsorshipType === 'category' && (
                  <Check className="w-5 h-5 text-emerald-600 mt-1" />
                )}
              </div>
            </Label>

            <Label 
              htmlFor="type-expert"
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                sponsorshipType === 'expert' 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-black/10 hover:border-black/20'
              }`}
            >
              <RadioGroupItem value="expert" id="type-expert" className="sr-only" />
              <div className="flex flex-col items-center gap-2 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  sponsorshipType === 'expert' ? 'bg-emerald-500 text-white' : 'bg-black/5 text-black/60'
                }`}>
                  <User className="w-6 h-6" />
                </div>
                <span className="font-semibold text-black">
                  {language === 'hu' ? 'Szakértő' : 'Expert'}
                </span>
                <span className="text-xs text-black/50">
                  {language === 'hu' 
                    ? 'Egy szakértő összes programja'
                    : 'All programs by one expert'}
                </span>
                {sponsorshipType === 'expert' && (
                  <Check className="w-5 h-5 text-emerald-600 mt-1" />
                )}
              </div>
            </Label>
          </RadioGroup>

          {/* Category Selection */}
          {sponsorshipType === 'category' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-black">
                {language === 'hu' ? 'Válasszon kategóriát' : 'Select a category'}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? `border-2 border-${category.color}-500 bg-${category.color}-50` 
                          : 'border border-black/10 hover:border-black/20'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? `bg-${category.color}-500 text-white` : 'bg-black/5 text-black/60'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-black text-sm">
                            {category.label[language as keyof typeof category.label] || category.label.en}
                          </p>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-emerald-600" />}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expert Selection */}
          {sponsorshipType === 'expert' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-black">
                {language === 'hu' ? 'Válasszon szakértőt' : 'Select an expert'}
              </Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {experts.map((expert) => {
                    const isSelected = selectedExpert === expert.id;
                    return (
                      <Card 
                        key={expert.id}
                        className={`cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-2 border-emerald-500 bg-emerald-50' 
                            : 'border border-black/10 hover:border-black/20'
                        }`}
                        onClick={() => setSelectedExpert(expert.id)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={expert.avatar_url || undefined} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {expert.first_name?.[0]}{expert.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black text-sm truncate">
                              {expert.first_name} {expert.last_name}
                            </p>
                            {expert.expert_title && (
                              <p className="text-xs text-black/50 truncate">
                                {expert.expert_title}
                              </p>
                            )}
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-black/[0.02] border border-black/5">
            <p className="text-sm text-black/70">
              {sponsorshipType === 'category' 
                ? (language === 'hu' 
                    ? '💡 A kategória támogatásával a kiválasztott témakör ÖSSZES programját támogatja. A felhasználók ingyen férhetnek hozzá ezekhez a tartalmakhoz.'
                    : '💡 By sponsoring a category, you support ALL programs in that topic. Users can access these contents for free.')
                : (language === 'hu'
                    ? '💡 A szakértő támogatásával a kiválasztott szakértő ÖSSZES programját támogatja. Ez segít a szakértőnek nagyobb közönséget elérni.'
                    : '💡 By sponsoring an expert, you support ALL programs by that expert. This helps the expert reach a wider audience.')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-black/5">
          <Button 
            variant="outline" 
            className="flex-1 border-black/10"
            onClick={() => onOpenChange(false)}
          >
            {language === 'hu' ? 'Mégse' : 'Cancel'}
          </Button>
          <Button 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSave}
            disabled={isSaving || (sponsorshipType === 'category' && !selectedCategory) || (sponsorshipType === 'expert' && !selectedExpert)}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {language === 'hu' ? 'Mentés' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorshipSelectionModal;
