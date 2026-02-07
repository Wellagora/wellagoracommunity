import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  const sessionId = searchParams.get("session_id");

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
              {t("purchase.complete") || "Sikeres vásárlás!"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("purchase.success_description") || "A program hozzáadva a fiókodhoz. Jó tanulást!"}
            </p>
            {sessionId && (
              <p className="text-xs text-muted-foreground mb-6">
                {t("purchase.order_reference") || "Rendelés azonosító"}: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
              </p>
            )}
            <div className="flex gap-3">
              <Button onClick={() => navigate("/kurzusaim")} className="gap-2">
                {t("purchase.go_to_courses") || "Kurzusaim"}
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
