import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, TrendingUp, Calendar, Building2, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BalanceCardProps {
  balance: number;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingAmount: number;
  grossSales?: number;
}

const MINIMUM_PAYOUT = 10000; // 10,000 Ft minimum

/**
 * BalanceCard - Expert Studio Component
 * 
 * Shows expert earnings with clear 80/20 transparency:
 * - [Total Price] - [20% WellAgora Fee] = [Your 80% Payout]
 * - Gross vs Net visualization
 */
const BalanceCard = ({ 
  balance, 
  monthlyEarnings, 
  totalEarnings, 
  pendingAmount,
  grossSales = 0
}: BalanceCardProps) => {
  const { t, language } = useLanguage();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const canRequestPayout = balance >= MINIMUM_PAYOUT;
  const progressToMinimum = Math.min((balance / MINIMUM_PAYOUT) * 100, 100);

  // Calculate 80/20 split from gross (if available) or estimate from net
  const estimatedGross = grossSales > 0 ? grossSales : Math.round(totalEarnings / 0.80);
  const platformFee = Math.round(estimatedGross * 0.20);
  const expertPayout = Math.round(estimatedGross * 0.80);

  const formatCurrency = (amount: number) => {
    if (language === "hu") {
      return `${amount.toLocaleString("hu-HU")} Ft`;
    }
    const eur = Math.round(amount / 400);
    return `€${eur.toLocaleString("de-DE")}`;
  };

  const handleRequestPayout = async () => {
    if (!bankAccount.trim()) {
      toast.error(t("expert_studio.enter_bank_account"));
      return;
    }
    
    setIsRequesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(t("expert_studio.payout_requested"));
      setShowPayoutModal(false);
      setBankAccount("");
    } catch (error) {
      toast.error(t("expert_studio.payout_error"));
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-green-500/10 border-emerald-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <CardContent className="p-6">
            {/* Main Balance */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("expert_studio.available_balance")}
                  </p>
                  <motion.p 
                    key={balance}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-foreground"
                  >
                    {formatCurrency(balance)}
                  </motion.p>
                </div>
              </div>
              <Button
                onClick={() => setShowPayoutModal(true)}
                disabled={!canRequestPayout}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg disabled:opacity-50"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                {t("expert_studio.request_payout")}
              </Button>
            </div>

            {/* 80/20 Revenue Split Visualization */}
            <div className="mb-6 p-4 rounded-xl bg-white/50 border border-emerald-200/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {language === 'hu' ? '80/20 Bevétel Megosztás' : '80/20 Revenue Split'}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          {language === 'hu'
                            ? 'A teljes program ár alapján számítjuk. Ön 80%-ot kap, a platform 20%-ot.'
                            : 'Calculated on the full program price. You receive 80%, platform takes 20%.'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => setShowBreakdownModal(true)}
                >
                  {language === 'hu' ? 'Részletek' : 'Details'}
                </Button>
              </div>

              {/* Visual Split Bar */}
              <div className="relative h-6 rounded-full overflow-hidden bg-muted/50 mb-3">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center"
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <span className="text-xs font-bold text-white">80%</span>
                </motion.div>
                <motion.div
                  className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center"
                  initial={{ width: 0 }}
                  animate={{ width: '20%' }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                >
                  <span className="text-xs font-bold text-white">20%</span>
                </motion.div>
              </div>

              {/* Split Values */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hu' ? 'Teljes ár' : 'Full price'}
                  </p>
                  <p className="font-semibold text-foreground text-sm">{formatCurrency(estimatedGross)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hu' ? 'Platform (20%)' : 'Platform (20%)'}
                  </p>
                  <p className="font-semibold text-indigo-600 text-sm">{formatCurrency(platformFee)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hu' ? 'Ön kapja (80%)' : 'You get (80%)'}
                  </p>
                  <p className="font-semibold text-emerald-600 text-sm">{formatCurrency(expertPayout)}</p>
                </div>
              </div>
            </div>

            {/* Progress to Minimum */}
            {!canRequestPayout && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {t("expert_studio.min_payout_progress")}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(balance)} / {formatCurrency(MINIMUM_PAYOUT)}
                  </span>
                </div>
                <Progress value={progressToMinimum} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("expert_studio.min_payout_hint").replace("{{amount}}", formatCurrency(MINIMUM_PAYOUT - balance))}
                </p>
              </div>
            )}

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-500/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">{t("expert_studio.this_month")}</span>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(monthlyEarnings)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">{t("expert_studio.total_earned")}</span>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(totalEarnings)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="text-xs">{t("expert_studio.pending")}</span>
                </div>
                <p className="font-semibold text-amber-600">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payout Modal */}
      <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("expert_studio.request_payout")}</DialogTitle>
            <DialogDescription>
              {t("expert_studio.payout_modal_desc").replace("{{amount}}", formatCurrency(balance))}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bank-account">{t("expert_studio.bank_account")}</Label>
              <Input
                id="bank-account"
                placeholder="HU12 3456 7890 1234 5678 0000 0000"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                {t("expert_studio.transfer_time_hint")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleRequestPayout}
              disabled={isRequesting || !bankAccount.trim()}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isRequesting ? t("common.processing") : t("expert_studio.confirm_payout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Breakdown Modal */}
      <Dialog open={showBreakdownModal} onOpenChange={setShowBreakdownModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              {language === 'hu' ? '80/20 Bevétel Bontás' : '80/20 Revenue Breakdown'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hu'
                ? 'A bevételek a Szakértői ár alapján kerülnek megosztásra'
                : 'Revenue is split based on your Expert price'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-muted/30 border">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {language === 'hu' ? 'Teljes program érték' : 'Total program value'}
                  </span>
                  <span className="font-bold text-lg">{formatCurrency(estimatedGross)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {language === 'hu' ? 'Platform jutalék (20%)' : 'Platform commission (20%)'}
                  </span>
                  <span className="font-medium text-indigo-600">-{formatCurrency(platformFee)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold">
                    {language === 'hu' ? 'Az Ön részesedése (80%)' : 'Your payout (80%)'}
                  </span>
                  <span className="font-bold text-xl text-emerald-600">{formatCurrency(expertPayout)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                {language === 'hu'
                  ? '💡 A 80/20 arány minden tranzakcióra vonatkozik – függetlenül attól, hogy Tag vagy Szponzor fizeti.'
                  : '💡 The 80/20 split applies to all transactions – whether paid by Member or Sponsor.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowBreakdownModal(false)} className="w-full">
              {language === 'hu' ? 'Értem' : 'Got it'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BalanceCard;
