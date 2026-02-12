import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { BookOpen, Users, Sparkles } from "lucide-react";

const steps = [
  { icon: BookOpen, titleKey: "home.how_it_works_step1_title", descKey: "home.how_it_works_step1_desc" },
  { icon: Users,    titleKey: "home.how_it_works_step2_title", descKey: "home.how_it_works_step2_desc" },
  { icon: Sparkles, titleKey: "home.how_it_works_step3_title", descKey: "home.how_it_works_step3_desc" },
];

const HowItWorksSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-[#F7F3EB]">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12"
        >
          {t("home.how_it_works_title")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <step.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t(step.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(step.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
