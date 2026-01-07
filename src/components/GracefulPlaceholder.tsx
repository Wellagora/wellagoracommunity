import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface GracefulPlaceholderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

const GracefulPlaceholder = ({ 
  title, 
  description, 
  showBackButton = true 
}: GracefulPlaceholderProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
          <CardContent className="p-8 text-center">
            {/* Animated Icon */}
            <div className="relative inline-block mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-emerald-500/30 blur-xl scale-150"
                animate={{ 
                  scale: [1.5, 1.7, 1.5],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center border-2 border-white shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {title || t('common.coming_soon')}
            </h2>

            {/* Description */}
            <p className="text-slate-600 mb-6">
              {description || t('common.coming_soon_desc')}
            </p>

            {/* Back Button */}
            {showBackButton && (
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('program.back')}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default GracefulPlaceholder;
