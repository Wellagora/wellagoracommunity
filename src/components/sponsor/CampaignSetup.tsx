import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Target, 
  Users, 
  Wallet, 
  CheckCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Program {
  id: string;
  title: string;
  price_huf: number;
  creator_name: string;
  category: string;
}

interface CampaignSetupProps {
  onCampaignCreated?: () => void;
}

/**
 * CampaignSetup - Sponsor Dashboard Component
 * 
 * Allows sponsors to:
 * 1. Select a program to sponsor
 * 2. Define fixed HUF contribution per seat
 * 3. Set max sponsored seats
 * 
 * This creates a content_sponsorship record.
 */
const CampaignSetup = ({ onCampaignCreated }: CampaignSetupProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [contributionPerSeat, setContributionPerSeat] = useState<number>(5000);
  const [maxSeats, setMaxSeats] = useState<number>(10);

  useEffect(() => {
    if (showDialog) {
      loadPrograms();
    }
  }, [showDialog]);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('expert_contents')
        .select(`
          id,
          title,
          price_huf,
          category,
          profiles:creator_id (first_name, last_name)
        `)
        .eq('is_published', true)
        .gt('price_huf', 0)
        .order('title', { ascending: true });

      if (data) {
        const mapped = data.map(p => {
          const profile = p.profiles as any;
          return {
            id: p.id,
            title: p.title,
            price_huf: p.price_huf || 0,
            creator_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Expert',
            category: p.category || 'general'
          };
        });
        setPrograms(mapped);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProgramData = programs.find(p => p.id === selectedProgram);
  const totalCreditCost = contributionPerSeat * maxSeats;
  const memberPayment = selectedProgramData 
    ? Math.max(0, selectedProgramData.price_huf - contributionPerSeat)
    : 0;

  const handleCreateCampaign = async () => {
    if (!user || !selectedProgram) return;

    setCreating(true);
    try {
      // Create content sponsorship
      const { error } = await supabase
        .from('content_sponsorships')
        .insert({
          content_id: selectedProgram,
          sponsor_id: user.id,
          sponsor_contribution_huf: contributionPerSeat,
          max_sponsored_seats: maxSeats,
          sponsored_seats_used: 0,
          total_licenses: maxSeats,
          used_licenses: 0,
          is_active: true
        });

      if (error) throw error;

      // Update expert_contents to mark as sponsored
      await supabase
        .from('expert_contents')
        .update({
          is_sponsored: true,
          sponsor_id: user.id,
          fixed_sponsor_amount: contributionPerSeat
        })
        .eq('id', selectedProgram);

      toast.success(
        language === 'hu' 
          ? 'Kampány sikeresen létrehozva!'
          : 'Campaign created successfully!'
      );

      setShowDialog(false);
      resetForm();
      onCampaignCreated?.();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error(
        language === 'hu'
          ? 'Hiba a kampány létrehozásakor'
          : 'Error creating campaign'
      );
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedProgram('');
    setContributionPerSeat(5000);
    setMaxSeats(10);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-black">
            <Target className="w-5 h-5 text-indigo-600" />
            {language === 'hu' ? 'Új Kampány Indítása' : 'Start New Campaign'}
          </CardTitle>
          <CardDescription>
            {language === 'hu' 
              ? 'Válasszon programot és határozza meg a támogatás mértékét'
              : 'Select a program and define your sponsorship level'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowDialog(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'hu' ? 'Kampány Létrehozása' : 'Create Campaign'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <Target className="w-5 h-5 text-indigo-600" />
              {language === 'hu' ? 'Szponzorációs Kampány' : 'Sponsorship Campaign'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hu'
                ? 'Határozza meg, mennyivel támogatja a tagok részvételét'
                : 'Define how much you contribute to member participation'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Program Selection */}
            <div className="space-y-2">
              <Label>{language === 'hu' ? 'Program' : 'Program'}</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="border-black/10">
                  <SelectValue placeholder={language === 'hu' ? 'Válasszon programot...' : 'Select program...'} />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="p-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </div>
                  ) : (
                    programs.map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{program.title}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {formatCurrency(program.price_huf)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedProgramData && (
                <p className="text-xs text-black/50">
                  {language === 'hu' ? 'Szakértő' : 'Expert'}: {selectedProgramData.creator_name} • 
                  {language === 'hu' ? ' Teljes ár' : ' Full price'}: {formatCurrency(selectedProgramData.price_huf)}
                </p>
              )}
            </div>

            {/* Contribution per Seat */}
            <div className="space-y-2">
              <Label>{language === 'hu' ? 'Hozzájárulás / fő (Ft)' : 'Contribution / seat (Ft)'}</Label>
              <Input
                type="number"
                value={contributionPerSeat}
                onChange={(e) => setContributionPerSeat(parseInt(e.target.value) || 0)}
                min={500}
                step={500}
                className="border-black/10"
              />
              <p className="text-xs text-black/50">
                {language === 'hu' 
                  ? `1 Kredit = 1 Ft. A tag fizeti a különbséget: ${formatCurrency(memberPayment)}`
                  : `1 Credit = 1 Ft. Member pays the difference: ${formatCurrency(memberPayment)}`}
              </p>
            </div>

            {/* Max Seats */}
            <div className="space-y-2">
              <Label>{language === 'hu' ? 'Maximum támogatott hely' : 'Max sponsored seats'}</Label>
              <Input
                type="number"
                value={maxSeats}
                onChange={(e) => setMaxSeats(parseInt(e.target.value) || 1)}
                min={1}
                max={1000}
                className="border-black/10"
              />
            </div>

            {/* Cost Summary */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-3">
              <h4 className="font-semibold text-indigo-900 text-sm">
                {language === 'hu' ? 'Költség Összesítő' : 'Cost Summary'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-indigo-600/70">{language === 'hu' ? 'Hozzájárulás / fő' : 'Per seat'}</p>
                  <p className="font-bold text-indigo-900">{formatCurrency(contributionPerSeat)}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-600/70">{language === 'hu' ? 'Max helyek' : 'Max seats'}</p>
                  <p className="font-bold text-indigo-900">{maxSeats}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-900">
                    {language === 'hu' ? 'Összes kredit szükséges' : 'Total credits needed'}
                  </span>
                  <span className="text-xl font-bold text-indigo-700">
                    {formatCurrency(totalCreditCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="border-black/10"
            >
              {language === 'hu' ? 'Mégse' : 'Cancel'}
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!selectedProgram || creating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'hu' ? 'Létrehozás...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === 'hu' ? 'Kampány Indítása' : 'Start Campaign'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CampaignSetup;
