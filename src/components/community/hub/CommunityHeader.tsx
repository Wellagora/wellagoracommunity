import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, Sparkles } from "lucide-react";

interface CommunityHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  regionName?: string;
}

const CommunityHeader = ({ searchQuery, onSearchChange, regionName }: CommunityHeaderProps) => {
  const { t } = useLanguage();

  return (
    <motion.div 
      className="relative overflow-hidden bg-gradient-hero text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Atmospheric Mountain Mist */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-mountain-mist"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-aqua-glow"></div>
        <div className="absolute inset-0 bg-organic-shapes opacity-60"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-info/12 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.8s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 sm:py-24">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-up">
            <motion.div
              animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-accent drop-shadow-glow" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold drop-shadow-lg">
              {t('unified_hub.title')}
            </h1>
            <motion.div
              animate={{ rotate: [0, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles className="w-8 h-8 text-accent drop-shadow-glow" />
            </motion.div>
          </div>
          
          <p className="text-xl sm:text-2xl text-white/85 mb-8 max-w-2xl mx-auto font-light leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('unified_hub.subtitle')}
          </p>

          {regionName && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Badge className="bg-glass-strong text-white px-6 py-3 text-lg border-white/40 shadow-glow">
                <MapPin className="w-5 h-5 mr-2" />
                {regionName}
              </Badge>
            </motion.div>
          )}

          {/* Search Bar */}
          <motion.div 
            className="mt-10 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="relative group">
              <Search className="absolute left-3 sm:left-5 top-3 sm:top-5 h-5 w-5 sm:h-6 sm:w-6 text-white/70 group-hover:text-accent transition-colors duration-300" />
              <Input
                placeholder={t('unified_hub.search_placeholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 sm:pl-14 h-12 sm:h-16 bg-glass-strong border-accent/30 text-white placeholder:text-white/60 text-sm sm:text-lg rounded-2xl shadow-glow hover:shadow-premium hover:border-accent/50 transition-all duration-300 w-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CommunityHeader;
