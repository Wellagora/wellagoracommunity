import { useState, useEffect } from "react";
import { X, Share, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "pwa-install-banner-dismissed";

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

    setIsIOS(isIOSDevice && isSafari);
    setIsAndroid(isAndroidDevice);

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS Safari, show banner after 3 seconds
    if (isIOSDevice && isSafari) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  // Don't render if already standalone or nothing to show
  if (isStandalone || (!isIOS && !deferredPrompt)) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe md:hidden"
        >
          <div className="relative bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700">
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Android Install */}
            {isAndroid && deferredPrompt && (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="font-semibold text-base">Install WellAgora</h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Add to home screen for the best experience
                  </p>
                </div>
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-4"
                >
                  Install
                </Button>
              </div>
            )}

            {/* iOS Safari Instructions */}
            {isIOS && (
              <div className="pr-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">Add WellAgora to Home Screen</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
                      <span>Tap</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-md">
                        <Share className="w-4 h-4" />
                        <span>Share</span>
                      </span>
                      <span>then</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-md">
                        <Plus className="w-4 h-4" />
                        <span>Add to Home Screen</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Animated arrow pointing to Share button (bottom center of Safari) */}
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-900" />
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
