import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Leaf, ChevronRight, Sparkles, DollarSign, MapPin, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const CreatorLandingSection = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: DollarSign,
      title: t("landing.creator_benefit_revenue_title") || "Bevétel",
      description: t("landing.creator_benefit_revenue") || "Monetizáld a szakértelmedet Gated Content és Stripe/Wise kifizetésekkel.",
    },
    {
      icon: MapPin,
      title: t("landing.creator_benefit_local_title") || "Helyi Hatás",
      description: t("landing.creator_benefit_local") || "A PostGIS technológiával közvetlenül a környezetedben lévőket érheted el.",
    },
    {
      icon: Bot,
      title: t("landing.creator_benefit_ai_title") || "AI Támogatás",
      description: t("landing.creator_benefit_ai") || "A WellBot segít, hogy a tartalmad eljusson a megfelelő célközönséghez.",
    },
  ];

  const steps = [
    { label: t("landing.creator_step_1") || "Regisztráció", emoji: "📝" },
    { label: t("landing.creator_step_2") || "Feltöltés", emoji: "📤" },
    { label: t("landing.creator_step_3") || "Bevétel", emoji: "💰" },
  ];

  return (
    <section className="py-16 md:py-20 bg-[#091629] border-t border-b border-[rgba(0,229,255,0.2)] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0066FF]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00CCFF]/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* LEFT SIDE - Copy and CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Headline with gradient */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-[#0066FF] to-[#00CCFF] bg-clip-text text-transparent">
                {t("landing.creator_headline") || "Oszd meg a tudásodat, építsd a közösségedet."}
              </span>
            </h2>

            {/* Benefits list */}
            <div className="space-y-5 mb-10">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#00E5FF]" />
                    </div>
                    <div>
                      <span className="font-bold text-white">{benefit.title}</span>{" "}
                      <span className="text-[#B0C4DE]">{benefit.description}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Button */}
            <Link to="/auth?role=creator">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#0066FF] to-[#00CCFF] hover:from-[#0055DD] hover:to-[#00BBEE] text-white font-semibold text-lg px-8 py-6 shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_30px_rgba(0,102,255,0.5)] transition-all"
              >
                {t("landing.creator_cta") || "Regisztrálj Kreátorként"}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* RIGHT SIDE - Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main dashboard mockup */}
            <div className="bg-[#112240]/80 backdrop-blur-sm rounded-2xl p-6 border border-[rgba(0,229,255,0.2)] shadow-xl">
              {/* Mock header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00CCFF] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Creator Dashboard</p>
                  <p className="text-xs text-[#B0C4DE]">WellAgora</p>
                </div>
              </div>

              {/* Mock stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0A1930]/60 rounded-lg p-4">
                  <p className="text-xs text-[#B0C4DE] mb-1">{t("landing.creator_total_revenue") || "Összes bevétel"}</p>
                  <p className="text-2xl font-bold text-white">127,500 Ft</p>
                  <p className="text-xs text-green-400">+23% ↑</p>
                </div>
                <div className="bg-[#0A1930]/60 rounded-lg p-4">
                  <p className="text-xs text-[#B0C4DE] mb-1">{t("landing.creator_followers") || "Követők"}</p>
                  <p className="text-2xl font-bold text-white">342</p>
                  <p className="text-xs text-[#00E5FF]">+12 e héten</p>
                </div>
              </div>

              {/* Mock chart placeholder */}
              <div className="bg-[#0A1930]/60 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-[#B0C4DE]">Havi bevétel</p>
                  <p className="text-xs text-[#00E5FF]">Részletek →</p>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {[40, 55, 45, 70, 60, 80, 75].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#0066FF] to-[#00CCFF] rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Avatar row */}
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00CCFF] border-2 border-[#112240] flex items-center justify-center text-xs text-white font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-[#0A1930] border-2 border-[#112240] flex items-center justify-center text-xs text-[#B0C4DE]">
                  +24
                </div>
              </div>
            </div>

            {/* Floating notification card - top right */}
            <motion.div
              initial={{ opacity: 0, y: -20, rotate: 3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="absolute -top-4 -right-4 md:top-2 md:-right-8 bg-[#112240] rounded-xl p-3 shadow-lg border border-green-500/30 transform rotate-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-green-400 font-medium">{t("landing.creator_new_sale") || "Új eladás"}</p>
                  <p className="text-sm text-white font-bold">+5,000 Ft</p>
                </div>
              </div>
            </motion.div>

            {/* Floating badge - bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-8 bg-[#112240] rounded-xl p-3 shadow-lg border border-[#00E5FF]/30 transform -rotate-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-xs text-[#00E5FF] font-medium">{t("landing.creator_carbon_handprint") || "Carbon Handprint"}</p>
                  <p className="text-sm text-white font-bold">+50kg CO₂</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Process Flow Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-16"
        >
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{step.emoji}</span>
                <span className="text-[#B0C4DE] font-medium">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-[#00E5FF] hidden md:block" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CreatorLandingSection;
