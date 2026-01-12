import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Check, X, Camera, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { MOCK_VOUCHERS, MOCK_PROGRAMS, getMockExpertById, findVoucherByCode, formatPriceByLanguage } from "@/data/mockData";

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
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [recentRedemptions, setRecentRedemptions] = useState<Redemption[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemedCodes, setRedeemedCodes] = useState<Set<string>>(new Set());
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    loadRecentRedemptions();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop?.();
      }
    };
  }, [userId]);

  const loadRecentRedemptions = async () => {
    // Load from mock data - redeemed vouchers
    const redeemed = MOCK_VOUCHERS.filter(v => v.status === 'redeemed').slice(0, 5);
    const mockRedemptions: Redemption[] = redeemed.map((v, i) => ({
      id: v.id,
      programTitle: v.content_title,
      amount: Math.round(v.value_huf * 0.85), // Expert gets 85%
      timeAgo: i === 0 ? "2 perce" : i === 1 ? "1 órája" : "Ma 14:30",
      redeemedAt: new Date(v.redeemed_at || Date.now())
    }));
    setRecentRedemptions(mockRedemptions);
    setTodayCount(mockRedemptions.length);
  };

  const triggerSuccessAnimation = () => {
    setShowSuccess(true);
    
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7']
    });

    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error(t("expert_studio.enter_code") || "Kérjük add meg a kódot!");
      return;
    }

    const normalizedCode = voucherCode.toUpperCase().trim();
    
    // Validate format
    if (!normalizedCode.match(/^WA-\d{4}-[A-Z0-9]{4}$/)) {
      toast.error(t("expert_studio.invalid_format") || "Érvénytelen formátum! (WA-2026-XXXX)");
      return;
    }

    // Check if already redeemed in this session
    if (redeemedCodes.has(normalizedCode)) {
      toast.error(t("expert_studio.already_redeemed") || "Ez a kupon már be lett váltva!");
      return;
    }

    // Find voucher in mock data
    const voucher = findVoucherByCode(normalizedCode);
    
    if (!voucher) {
      toast.error(t("expert_studio.voucher_not_found") || "A kupon nem található!");
      return;
    }

    if (voucher.status === 'redeemed') {
      toast.error(t("expert_studio.already_redeemed") || "Ez a kupon már korábban be lett váltva!");
      return;
    }

    setIsValidating(true);

    // Calculate expert earnings (85% of value)
    const voucherAmount = Math.round(voucher.value_huf * 0.85);
    const formattedAmount = language === 'hu' ? `${voucherAmount.toLocaleString('hu-HU')} Ft` : `${Math.round(voucherAmount / 400)} €`;

    const newRedemption: Redemption = {
      id: Date.now().toString(),
      programTitle: voucher.content_title,
      amount: voucherAmount,
      timeAgo: t("expert_studio.just_now") || "Most",
      redeemedAt: new Date()
    };

    // 1. OPTIMISTIC UI UPDATE - instant feedback!
    onBalanceUpdate(balance + voucherAmount);
    setRecentRedemptions(prev => [newRedemption, ...prev.slice(0, 4)]);
    setTodayCount(prev => prev + 1);
    setRedeemedCodes(prev => new Set(prev).add(normalizedCode));
    triggerSuccessAnimation();
    setVoucherCode("");

    try {
      // 2. BACKGROUND: Simulate server validation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(`${t("expert_studio.voucher_success") || "Sikeres beváltás!"}: +${formattedAmount}`);
    } catch (error) {
      // 3. ROLLBACK if server fails
      onBalanceUpdate(balance);
      setRecentRedemptions(prev => prev.slice(1));
      setTodayCount(prev => prev - 1);
      setRedeemedCodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(normalizedCode);
        return newSet;
      });
      toast.error(t("expert_studio.validation_error") || "Beváltási hiba történt");
    } finally {
      setIsValidating(false);
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
        (decodedText: string) => {
          setVoucherCode(decodedText);
          scanner.clear();
          setScannerActive(false);
          toast.success(t("expert_studio.qr_scanned"));
        },
        () => {}
      );

      scannerRef.current = scanner;
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast.error(t("expert_studio.camera_error"));
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

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return t("expert_studio.just_now");
    if (diff < 60) return `${diff} ${t("expert_studio.minutes_ago")}`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ${t("expert_studio.hours_ago")}`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Ticket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {t("expert_studio.voucher_validator")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("expert_studio.validator_desc")}
            </p>
          </div>
        </div>

        {/* Validator Input */}
        <div className="space-y-4">
          {scannerActive ? (
            <div className="space-y-4">
              <div id="voucher-qr-reader" className="rounded-xl overflow-hidden" />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={stopQRScanner}
              >
                <X className="w-4 h-4 mr-2" />
                {t("common.stop")}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <Input
                  placeholder="WA-2026-XXXX"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 h-14 text-xl text-center font-mono bg-white/80 border-amber-500/30 focus:border-amber-500 placeholder:text-muted-foreground/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleValidateVoucher()}
                />
                <Button 
                  onClick={handleValidateVoucher}
                  disabled={isValidating || !voucherCode.trim()}
                  className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
                >
                  {isValidating ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Check className="w-6 h-6" />
                  )}
                </Button>
              </div>
              <Button 
                variant="outline"
                className="w-full h-12 border-amber-500/30 hover:bg-amber-500/10"
                onClick={startQRScanner}
              >
                <Camera className="w-5 h-5 mr-2" />
                {t("expert_studio.scan_qr")}
              </Button>
            </>
          )}
        </div>

        {/* Recent Redemptions */}
        <div className="mt-6 pt-6 border-t border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">
              {t("expert_studio.recent_redemptions")}
            </h4>
            {todayCount > 0 && (
              <span className="text-sm font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
                🎉 {t("expert_studio.today_count").replace("{{count}}", todayCount.toString())}
              </span>
            )}
          </div>

          {recentRedemptions.length > 0 ? (
            <ul className="space-y-3">
              {recentRedemptions.map((r, index) => (
                <motion.li 
                  key={r.id}
                  initial={index === 0 ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-lg"
                >
                  <span className="text-sm font-medium text-foreground truncate flex-1">
                    {r.programTitle}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 mx-3">
                    +{r.amount} Ft
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {r.timeAgo}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("expert_studio.no_redemptions_yet")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherValidator;
