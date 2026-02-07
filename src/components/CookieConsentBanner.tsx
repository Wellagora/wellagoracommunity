import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const COOKIE_CONSENT_KEY = "wellagora_cookie_consent";

export const resetCookieConsent = () => {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.dispatchEvent(new Event('cookie-consent-reset'));
};

const CookieConsentBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleReset = () => setVisible(true);
    window.addEventListener('cookie-consent-reset', handleReset);
    return () => window.removeEventListener('cookie-consent-reset', handleReset);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'all');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential');
    setVisible(false);
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
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleEssentialOnly} variant="outline" size="sm">
                    {t("cookie.essential_only") || "Csak szükségesek"}
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
