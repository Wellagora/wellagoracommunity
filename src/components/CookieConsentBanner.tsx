import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { Cookie, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const COOKIE_CONSENT_KEY = "wellagora_cookie_consent";

export const resetCookieConsent = () => {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.dispatchEvent(new Event('cookie-consent-reset'));
};

const getStoredConsent = (): string | null => {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return null;
  }
};

const CookieConsentBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleReset = () => {
      setShowCustomize(false);
      setVisible(true);
    };
    window.addEventListener('cookie-consent-reset', handleReset);
    return () => window.removeEventListener('cookie-consent-reset', handleReset);
  }, []);

  const saveConsent = useCallback((choice: string) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ choice, date: new Date().toISOString() }));
    } catch {
      localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    }
    setVisible(false);
    setShowCustomize(false);
  }, []);

  const handleAcceptAll = () => saveConsent('all');
  const handleEssentialOnly = () => saveConsent('essential');
  const handleSaveCustom = () => {
    const parts = ['essential'];
    if (functional) parts.push('functional');
    if (analytics) parts.push('analytics');
    if (marketing) parts.push('marketing');
    saveConsent(parts.join(','));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
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

                <AnimatePresence>
                  {showCustomize && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-4"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleEssentialOnly} variant="outline" size="sm">
                    {t("cookie.essential_only") || "Csak szükségesek"}
                  </Button>
                  <Button
                    onClick={() => setShowCustomize(!showCustomize)}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
