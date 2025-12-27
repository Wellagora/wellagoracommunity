import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import wellagoraLogo from "@/assets/wellagora-logo.png";

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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

        {/* 404 Text */}
        <div className="mb-6">
          <h1 className="text-8xl font-black bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--primary))] bg-clip-text text-transparent mb-4">
            404
          </h1>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#112240] flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-foreground mb-3">
          {t("error.404_title")}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t("error.404_description")}
        </p>

        {/* Action Button */}
        <Button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--primary))] hover:opacity-90 text-white px-8 py-6 text-lg"
        >
          <Home className="w-5 h-5 mr-2" />
          {t("common.back_home")}
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
