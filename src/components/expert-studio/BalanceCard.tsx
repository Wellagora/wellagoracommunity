import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, ArrowUpRight, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BalanceCardProps {
  balance: number;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingAmount: number;
}

const MINIMUM_PAYOUT = 10000; // 10,000 Ft minimum

const BalanceCard = ({ balance, monthlyEarnings, totalEarnings, pendingAmount }: BalanceCardProps) => {
  const { t, language } = useLanguage();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const canRequestPayout = balance >= MINIMUM_PAYOUT;
  const progressToMinimum = Math.min((balance / MINIMUM_PAYOUT) * 100, 100);

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
      // In production, this would call an edge function
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
    </>
  );
};

export default BalanceCard;
