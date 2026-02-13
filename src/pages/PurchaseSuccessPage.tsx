import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Ticket, Copy, Check } from "lucide-react";
import { awardPoints } from "@/lib/wellpoints";
import confetti from "canvas-confetti";

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const pointsAwarded = useRef(false);
  const sessionId = searchParams.get("session_id");
  const voucherCode = searchParams.get("voucher");

  useEffect(() => {
    if (!showConfetti) {
      setShowConfetti(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#00E5FF", "#0066FF", "#00CCFF", "#FFD700", "#10B981"],
      });
    }
  }, [showConfetti]);

  useEffect(() => {
    if (user && !pointsAwarded.current && (sessionId || voucherCode)) {
      pointsAwarded.current = true;
      awardPoints(user.id, 'voucher_redeemed', 'Program vásárlás', sessionId || voucherCode || undefined, 'purchase').catch(console.error);
    }
  }, [user, sessionId, voucherCode]);

  const handleCopy = async () => {
    if (voucherCode) {
      await navigator.clipboard.writeText(voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {t("checkout.success_title") || "Sikeres jelentkezés!"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("purchase.success_description") || "A program hozzáadva a fiókodhoz. Jó tanulást!"}
            </p>

            {voucherCode && (
              <div className="w-full bg-muted/50 border border-dashed border-primary/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("checkout.voucher_code") || "Voucher kódod"}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-mono font-bold tracking-wider text-foreground">
                    {voucherCode}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="Másolás"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("checkout.voucher_email_note") || "A voucher kódot e-mailben is megküldtük."}
                </p>
              </div>
            )}

            {sessionId && !voucherCode && (
              <p className="text-xs text-muted-foreground mb-6">
                {t("purchase.order_reference") || "Rendelés azonosító"}: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
              </p>
            )}

            <div className="flex gap-3">
              <Button onClick={() => navigate("/kurzusaim")} className="gap-2">
                {t("purchase.go_to_courses") || "Programjaim"}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/piacer")}>
                {t("purchase.browse_more") || "További programok"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
