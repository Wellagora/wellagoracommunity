import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertCircle } from "lucide-react";
import wellagoraLogo from "@/assets/wellagora-logo.png";

interface ErrorPageProps {
  error?: Error | null;
  resetError?: () => void;
}

/**
 * Error page component - MUST NOT use any context hooks (useLanguage, useAuth, etc.)
 * because it renders inside ErrorBoundary which is above all providers.
 * Also MUST NOT use framer-motion to avoid cascading failures.
 */
const ErrorPage = ({ error, resetError }: ErrorPageProps) => {
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
      <div className="text-center max-w-md animate-fade-in">
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

        {/* Message - Static text, no translation hooks */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Hiba történt
        </h2>
        <p className="text-white/60 mb-8">
          Valami hiba történt az oldal betöltése közben. Kérjük, próbáld újra.
        </p>

        {/* Error Details (dev mode) */}
        {error && import.meta.env.DEV && (
          <details className="text-left text-sm bg-[#112240] p-4 rounded-lg mb-6 border border-red-500/20">
            <summary className="cursor-pointer font-medium text-white mb-2">
              Technical details
            </summary>
            <p className="text-red-400 break-words font-mono text-xs">
              {error.message}
            </p>
            {error.stack && (
              <pre className="text-white/50 mt-2 text-xs overflow-auto max-h-40">
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
            className="border-cyan-500/30 hover:border-cyan-500 text-white px-6 py-5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Próbáld újra
          </Button>
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white px-6 py-5"
          >
            <Home className="w-4 h-4 mr-2" />
            Főoldal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
