import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  UserX, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Banknote,
  Info
} from 'lucide-react';

interface SettlementResult {
  success: boolean;
  settlement_id?: string;
  expert_payout?: number;
  platform_fee?: number;
  user_refund?: number;
  sponsor_credit_action?: string;
  status?: string;
  error?: string;
}

const NoShowManager = () => {
  const { language } = useLanguage();
  const [voucherCode, setVoucherCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [settlementResult, setSettlementResult] = useState<SettlementResult | null>(null);

  const handleSearch = async () => {
    if (!voucherCode.trim()) {
      toast.error(language === 'hu' ? 'Adja meg a voucher kódot' : 'Please enter a voucher code');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleMarkNoShow = async () => {
    setIsProcessing(true);
    setSettlementResult(null);

    try {
      const { data, error } = await supabase.rpc('mark_voucher_noshow', {
        p_voucher_code: voucherCode.trim().toUpperCase()
      });

      if (error) throw error;

      const result = data as unknown as SettlementResult;
      setSettlementResult(result);

      if (result.success) {
        toast.success(
          language === 'hu' 
            ? 'No-Show feldolgozva - Kifizetés jóváhagyva!' 
            : 'No-Show processed - Payout approved!'
        );
        setVoucherCode('');
      } else {
        toast.error(result.error || (language === 'hu' ? 'Hiba történt' : 'An error occurred'));
      }
    } catch (error: any) {
      console.error('Error processing no-show:', error);
      toast.error(error.message || (language === 'hu' ? 'Hiba történt' : 'An error occurred'));
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-black">
            <UserX className="w-5 h-5 text-amber-600" />
            {language === 'hu' ? 'No-Show Kezelés' : 'No-Show Management'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Alert */}
          <Alert className="border-amber-200 bg-amber-50">
            <Info className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              {language === 'hu' 
                ? 'Ha egy tag nem jelenik meg, jelölje meg a voucher kódját. Ön megkapja a teljes kifizetést (80%), a szponzor kreditet felhasználjuk.'
                : 'If a member is a no-show, mark their voucher code. You receive full payout (80%), sponsor credit is consumed.'}
            </AlertDescription>
          </Alert>

          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder={language === 'hu' ? 'Voucher kód (pl: WA-XXXX-XXXX)' : 'Voucher code (e.g., WA-XXXX-XXXX)'}
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <Button 
              onClick={handleSearch}
              disabled={!voucherCode.trim() || isSearching}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Settlement Result */}
          {settlementResult && settlementResult.success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">
                  {language === 'hu' ? 'Sikeresen feldolgozva!' : 'Successfully processed!'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white">
                  <p className="text-xs text-black/50">
                    {language === 'hu' ? 'Az Ön kifizetése' : 'Your payout'}
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    {(settlementResult.expert_payout || 0).toLocaleString()} Ft
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white">
                  <p className="text-xs text-black/50">
                    {language === 'hu' ? 'Szponzor kredit' : 'Sponsor credit'}
                  </p>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 mt-1">
                    {settlementResult.sponsor_credit_action === 'consumed' 
                      ? (language === 'hu' ? 'Felhasználva' : 'Consumed')
                      : settlementResult.sponsor_credit_action}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-emerald-700 font-medium">
                {settlementResult.status}
              </div>
            </div>
          )}

          {/* Financial Logic Explanation */}
          <div className="p-4 rounded-xl bg-black/[0.02] border border-black/5 space-y-2">
            <p className="text-sm font-medium text-black">
              {language === 'hu' ? 'No-Show / Késői lemondás szabályok:' : 'No-Show / Late cancellation rules:'}
            </p>
            <ul className="text-xs text-black/60 space-y-1">
              <li className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>
                  {language === 'hu' 
                    ? 'Szakértő: 100% kifizetés (80% az eredeti árból)'
                    : 'Expert: 100% payout (80% of original price)'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>
                  {language === 'hu' 
                    ? 'Szponzor kredit: Felhasználva (nem visszatérítendő)'
                    : 'Sponsor credit: Consumed (non-refundable)'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <UserX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>
                  {language === 'hu' 
                    ? 'Tag: 0% visszatérítés'
                    : 'Member: 0% refund'}
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              {language === 'hu' ? 'No-Show megerősítése' : 'Confirm No-Show'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hu' 
                ? `Biztosan meg szeretné jelölni a "${voucherCode}" kódú vouchert No-Show-ként? Ez a művelet nem vonható vissza.`
                : `Are you sure you want to mark voucher "${voucherCode}" as a No-Show? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 my-4">
            <p className="text-sm text-amber-800 font-medium">
              {language === 'hu' ? 'A következő történik:' : 'What will happen:'}
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1">
              <li>• {language === 'hu' ? 'Ön megkapja a teljes kifizetését' : 'You receive your full payout'}</li>
              <li>• {language === 'hu' ? 'A szponzor kredit felhasználódik' : 'Sponsor credit is consumed'}</li>
              <li>• {language === 'hu' ? 'A tag nem kap visszatérítést' : 'Member receives no refund'}</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
            >
              {language === 'hu' ? 'Mégse' : 'Cancel'}
            </Button>
            <Button
              onClick={handleMarkNoShow}
              disabled={isProcessing}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {language === 'hu' ? 'Feldolgozás...' : 'Processing...'}
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  {language === 'hu' ? 'No-Show megjelölése' : 'Mark as No-Show'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoShowManager;
