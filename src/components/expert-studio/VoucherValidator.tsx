import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ticket, Check, X, Camera, PartyPopper, QrCode } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useExpertVouchers, ExpertVoucher } from "@/hooks/useExpertVouchers";

interface Redemption {
  id: string;
  programTitle: string;
  amount: number;
  timeAgo: string;
  redeemedAt: Date;
}

interface VoucherValidatorProps {
  userId: string;
  onBalanceUpdate: (amount: number) => void;
  balance: number;
}

const VoucherValidator = ({ userId, onBalanceUpdate, balance }: VoucherValidatorProps) => {
  const { t, language } = useLanguage();
  const { vouchers, stats, redeemByCode, refetch } = useExpertVouchers();
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [modalCode, setModalCode] = useState("");
  const [modalError, setModalError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const scannerRef = useRef<any>(null);

  // Get recent redemptions from real data
  const recentRedemptions: Redemption[] = vouchers
    .filter(v => v.status === 'used' && v.redeemed_at)
    .slice(0, 5)
    .map(v => ({
      id: v.id,
      programTitle: v.program_title,
      amount: Math.round((v.program_price || 5000) * 0.80),
      timeAgo: formatTimeAgo(new Date(v.redeemed_at!)),
      redeemedAt: new Date(v.redeemed_at!)
    }));

  const todayCount = vouchers.filter(v => {
    if (v.status !== 'used' || !v.redeemed_at) return false;
    const today = new Date();
    const redeemed = new Date(v.redeemed_at);
    return redeemed.toDateString() === today.toDateString();
  }).length;

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop?.();
      }
    };
  }, [userId]);

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return t("expert_studio.just_now") || "Most";
    if (diff < 60) return `${diff} ${t("expert_studio.minutes_ago") || "perce"}`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ${t("expert_studio.hours_ago") || "órája"}`;
    return date.toLocaleDateString();
  }

  const triggerSuccessAnimation = () => {
    setShowSuccess(true);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7']
    });

    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleValidateVoucher = async (code: string) => {
    if (!code.trim()) {
      toast.error(t("expert_studio.enter_code") || "Kérjük add meg a kódot!");
      return false;
    }

    setIsValidating(true);
    
    try {
      const result = await redeemByCode(code);
      
      if (result.success && result.voucher) {
        const voucherAmount = Math.round((result.voucher.program_price || 5000) * 0.80);
        onBalanceUpdate(balance + voucherAmount);
        triggerSuccessAnimation();
        
        const formattedAmount = language === 'hu' 
          ? `${voucherAmount.toLocaleString('hu-HU')} Ft` 
          : `${Math.round(voucherAmount / 400)} €`;
        
        toast.success(`${t("expert_studio.voucher_success") || "Sikeres beváltás!"}: +${formattedAmount}`);
        return true;
      } else {
        toast.error(result.error || t("expert_studio.validation_error"));
        return false;
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputValidation = async () => {
    const success = await handleValidateVoucher(voucherCode);
    if (success) {
      setVoucherCode("");
    }
  };

  const handleModalValidation = async () => {
    setModalError("");
    const success = await handleValidateVoucher(modalCode);
    if (success) {
      setModalCode("");
      setShowCodeModal(false);
    } else {
      setModalError(t("expert_studio.voucher_not_found") || "A kupon nem található vagy már be lett váltva!");
    }
  };

  const startQRScanner = async () => {
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      setScannerActive(true);
      
      const scanner = new Html5QrcodeScanner(
        "voucher-qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        async (decodedText: string) => {
          scanner.clear();
          setScannerActive(false);
          
          const success = await handleValidateVoucher(decodedText);
          if (!success) {
            toast.error(t("expert_studio.qr_invalid") || "Érvénytelen QR kód");
          }
        },
        () => {}
      );

      scannerRef.current = scanner;
    } catch (error) {
      toast.error(t("expert_studio.camera_error") || "Kamera hiba");
      setScannerActive(false);
    }
  };

  const stopQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear?.();
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm overflow-hidden relative">
        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-full p-6 shadow-xl"
              >
                <PartyPopper className="w-16 h-16 text-emerald-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-1">
                {t("expert_studio.voucher_validator")}
              </h3>
              <p className="text-sm text-black/50">
                {t("expert_studio.validator_desc")}
              </p>
            </div>
          </div>

          {/* Primary Action: QR/Code Entry Modal */}
          <Button 
            onClick={() => setShowCodeModal(true)}
            className="w-full h-14 bg-black hover:bg-black/90 text-white text-lg font-semibold mb-4"
          >
            <QrCode className="w-6 h-6 mr-3" />
            {t("expert_studio.qr_or_code") || "QR Beolvasás / Kód Érvényesítés"}
          </Button>

          {/* Quick Input */}
          <div className="space-y-4">
            {scannerActive ? (
              <div className="space-y-4">
                <div id="voucher-qr-reader" className="rounded-xl overflow-hidden" />
                <Button 
                  variant="outline" 
                  className="w-full border-black/10"
                  onClick={stopQRScanner}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("common.stop") || "Bezárás"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Input
                  placeholder="WA-XXXX-XXXX"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 h-12 text-lg text-center font-mono bg-white border-black/10 focus:border-black placeholder:text-black/30"
                  onKeyPress={(e) => e.key === 'Enter' && handleInputValidation()}
                />
                <Button 
                  onClick={handleInputValidation}
                  disabled={isValidating || !voucherCode.trim()}
                  className="h-12 w-12 bg-black hover:bg-black/90"
                >
                  {isValidating ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Recent Redemptions */}
          <div className="mt-6 pt-6 border-t border-black/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-black">
                {t("expert_studio.recent_redemptions")}
              </h4>
              {todayCount > 0 && (
                <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                  🎉 {t("expert_studio.today_count")?.replace("{{count}}", todayCount.toString()) || `Ma: ${todayCount}`}
                </span>
              )}
            </div>

            {recentRedemptions.length > 0 ? (
              <ul className="space-y-2">
                {recentRedemptions.map((r, index) => (
                  <motion.li 
                    key={r.id}
                    initial={index === 0 ? { opacity: 0, x: -20 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-2 px-3 bg-black/[0.02] rounded-lg"
                  >
                    <span className="text-sm font-medium text-black truncate flex-1">
                      {r.programTitle}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 mx-3">
                      +{r.amount.toLocaleString()} Ft
                    </span>
                    <span className="text-xs text-black/40 whitespace-nowrap">
                      {r.timeAgo}
                    </span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-black/40 text-center py-4">
                {t("expert_studio.no_redemptions_yet") || "Még nincs beváltás"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Code Entry Modal */}
      <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black flex items-center gap-2">
              <QrCode className="w-6 h-6" />
              {t("expert_studio.validate_code") || "Kupon Érvényesítés"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* QR Scanner Button */}
            <Button 
              variant="outline"
              onClick={() => {
                setShowCodeModal(false);
                startQRScanner();
              }}
              className="w-full h-14 border-black/10 text-black hover:bg-black/5"
            >
              <Camera className="w-5 h-5 mr-2" />
              {t("expert_studio.scan_qr") || "QR Kód Beolvasás"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-black/40">
                  {t("common.or") || "vagy"}
                </span>
              </div>
            </div>

            {/* Manual Code Entry */}
            <div className="space-y-3">
              <Input
                placeholder="WA-XXXX-XXXX"
                value={modalCode}
                onChange={(e) => {
                  setModalCode(e.target.value.toUpperCase());
                  setModalError("");
                }}
                className="h-14 text-xl text-center font-mono bg-black/[0.02] border-black/10 focus:border-black placeholder:text-black/30"
                onKeyPress={(e) => e.key === 'Enter' && handleModalValidation()}
              />
              
              {modalError && (
                <p className="text-sm text-red-600 text-center">
                  {modalError}
                </p>
              )}

              <Button 
                onClick={handleModalValidation}
                disabled={isValidating || !modalCode.trim()}
                className="w-full h-12 bg-black hover:bg-black/90 text-white font-semibold"
              >
                {isValidating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t("common.loading") || "Ellenőrzés..."}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {t("expert_studio.validate_btn") || "Érvényesítés"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoucherValidator;
