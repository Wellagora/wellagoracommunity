import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import wellagoraLogo from "@/assets/wellagora-logo.png";

interface ErrorPageProps {
  error?: Error | null;
  resetError?: () => void;
}

const ErrorPage = ({ error, resetError }: ErrorPageProps) => {
  const { t } = useLanguage();

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    // Use window.location instead of useNavigate to avoid Router context dependency
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#0A1930] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <div className="mb-8">
          <img
            src={wellagoraLogo}
            alt="WellAgora"
            className="h-12 w-auto mx-auto opacity-50"
          />
        </div>

        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-foreground mb-3">
          {t("error.500_title")}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t("error.500_description")}
        </p>

        {/* Error Details (dev mode) */}
        {error && process.env.NODE_ENV === "development" && (
          <details className="text-left text-sm bg-[#112240] p-4 rounded-lg mb-6 border border-red-500/20">
            <summary className="cursor-pointer font-medium text-foreground mb-2">
              Technical details
            </summary>
            <p className="text-red-400 break-words font-mono text-xs">
              {error.message}
            </p>
            {error.stack && (
              <pre className="text-muted-foreground mt-2 text-xs overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="border-[hsl(var(--cyan))]/30 hover:border-[hsl(var(--cyan))] px-6 py-5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.try_again")}
          </Button>
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--primary))] hover:opacity-90 text-white px-6 py-5"
          >
            <Home className="w-4 h-4 mr-2" />
            {t("common.back_home")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
