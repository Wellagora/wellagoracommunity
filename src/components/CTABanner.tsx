import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const CTABanner = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-16 bg-white/60 backdrop-blur-sm overflow-hidden z-0">
      {/* Subtle monochrome decorative blurs - no grid patterns */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-slate-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-slate-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              {t("index.cta_badge")}
            </span>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 leading-tight">
            {t("index.cta_headline")}
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("index.cta_subheadline")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/piacer">
              <Button size="lg" className="min-w-[200px] gap-2 bg-black hover:bg-black/90 text-white">
                {t("index.cta_explore_marketplace")}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="min-w-[200px] border-black/20 hover:bg-black/5">
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
