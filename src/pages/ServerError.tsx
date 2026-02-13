import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home, ServerCrash } from "lucide-react";
import { motion } from "framer-motion";
import wellagoraLogo from "@/assets/wellagora-logo.png";

const ServerError = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A1930] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="mb-8">
          <img
            src={wellagoraLogo}
            alt="WellAgora"
            className="h-12 w-auto mx-auto opacity-50"
          />
        </div>

        <div className="mb-6">
          <h1 className="text-8xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            500
          </h1>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#112240] flex items-center justify-center">
            <ServerCrash className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          {t("error.500_title") || "Szerverhiba"}
        </h2>
        <p className="text-gray-300 mb-8">
          {t("error.500_description") || "Valami hiba történt a szerveren. Kérjük, próbáld újra később."}
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-6 py-6 text-lg"
          >
            {t("common.retry") || "Újrapróbálás"}
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--primary))] hover:opacity-90 text-white px-6 py-6 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            {t("common.back_home")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ServerError;
