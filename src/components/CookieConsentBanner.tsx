import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { Cookie, X, Settings } from "lucide-react";
import { hasStoredConsent, saveConsentToStorage } from "@/lib/cookieConsent";

/**
 * CookieConsentBanner — default export ONLY.
 * No named exports here! Named exports break Vite Fast Refresh
 * and kill all React state + event handlers in this component.
 */
export default function CookieConsentBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // On mount: show banner after short delay if no stored consent
  useEffect(() => {
    if (hasStoredConsent()) return;
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Listen for reset event (from Footer "Cookie beállítások" link)
  useEffect(() => {
    const handleReset = () => {
      setShowCustomize(false);
      setIsVisible(true);
    };
    window.addEventListener("cookie-consent-reset", handleReset);
    return () => window.removeEventListener("cookie-consent-reset", handleReset);
  }, []);

  const saveAndHide = (choice: string) => {
    saveConsentToStorage(choice);
    setIsVisible(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () => {
    saveAndHide("all");
  };

  const handleEssentialOnly = () => {
    saveAndHide("essential");
  };

  const handleSaveCustom = () => {
    const parts = ["essential"];
    if (functional) parts.push("functional");
    if (analytics) parts.push("analytics");
    if (marketing) parts.push("marketing");
    saveAndHide(parts.join(","));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl shadow-2xl p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-4">
              {t("cookie.banner_text") || "Ez a weboldal cookie-kat használ a jobb felhasználói élmény érdekében."}{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                {t("cookie.details_link") || "Részletek az Adatkezelési tájékoztatóban."}
              </Link>
            </p>

            {showCustomize && (
              <div className="mb-4">
                <div className="space-y-3 border rounded-lg p-4 bg-background">
                  <h4 className="text-sm font-semibold">{t("cookie.customize_title") || "Cookie beállítások"}</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("cookie.essential_only") || "Szükséges"}</p>
                      <p className="text-xs text-muted-foreground">Mindig aktív</p>
                    </div>
                    <Switch checked disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("cookie.functional") || "Funkcionális"}</p>
                      <p className="text-xs text-muted-foreground">{t("cookie.functional_desc") || "Fejlett funkciók"}</p>
                    </div>
                    <Switch checked={functional} onCheckedChange={setFunctional} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("cookie.analytics") || "Analitikai"}</p>
                      <p className="text-xs text-muted-foreground">{t("cookie.analytics_desc") || "Használati statisztikák"}</p>
                    </div>
                    <Switch checked={analytics} onCheckedChange={setAnalytics} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("cookie.marketing") || "Marketing"}</p>
                      <p className="text-xs text-muted-foreground">{t("cookie.marketing_desc") || "Célzott hirdetések"}</p>
                    </div>
                    <Switch checked={marketing} onCheckedChange={setMarketing} />
                  </div>
                  <Button onClick={handleSaveCustom} size="sm" className="w-full">
                    {t("cookie.save_preferences") || "Beállítások mentése"}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleEssentialOnly} variant="outline" size="sm">
                {t("cookie.essential_only") || "Csak szükségesek"}
              </Button>
              <Button
                onClick={() => setShowCustomize((prev) => !prev)}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Settings className="w-3 h-3" />
                {t("cookie.customize") || "Testreszabás"}
              </Button>
              <Button onClick={handleAcceptAll} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                {t("cookie.accept_all") || "Mindent elfogadok"}
              </Button>
            </div>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
