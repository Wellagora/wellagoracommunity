import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const CTABanner = () => {
  const { t } = useLanguage();

  return (
    <section
      className="relative py-20 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0f35 0%, #1a1a4e 40%, #2e1065 60%, #1e1b4b 100%)',
      }}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Decorative ring — echoes hero orbital style */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div className="w-[600px] h-[600px] rounded-full border border-white/[0.04]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-blue-300/70" />
            <span className="text-sm font-medium text-blue-300/80 uppercase tracking-widest">
              {t("index.cta_badge")}
            </span>
            <Sparkles className="w-5 h-5 text-blue-300/70" />
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
            {t("index.cta_headline")}
          </h2>

          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto">
            {t("index.cta_subheadline")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/piacer">
              <Button
                size="lg"
                className="rounded-full bg-[#6c5ce7] hover:bg-[#7c6cf7] text-white font-semibold px-8 min-w-[220px] shadow-[0_0_30px_rgba(108,92,231,0.35)] hover:shadow-[0_0_40px_rgba(108,92,231,0.5)] transition-all duration-300 gap-2"
              >
                {t("index.cta_explore_marketplace")}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/25 text-white hover:bg-white/10 hover:border-white/40 font-semibold px-8 min-w-[220px] transition-all duration-300"
              >
                {t("index.cta_become_expert")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
