import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, Leaf, Heart, Home } from "lucide-react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const FoundingExpertLanding = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    source: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: t("foundingLanding.form_error_title"),
        description: t("foundingLanding.form_error_required"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save to Supabase founding_expert_leads table
      const { error: dbError } = await (supabase as any)
        .from("founding_expert_leads")
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim() || null,
          source: formData.source.trim() || null,
        });

      if (dbError) {
        console.error("Error saving lead:", dbError);
        toast({
          title: t("foundingLanding.form_error_title"),
          description: t("foundingLanding.form_error_save"),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Send email notification to Attila
      try {
        await supabase.functions.invoke("send-general-contact", {
          body: {
            to: "attila.kelemen@proself.org",
            senderName: formData.name.trim(),
            senderEmail: formData.email.trim(),
            subject: `Új Founding Expert érdeklődés — ${formData.name.trim()}`,
            message: [
              `Név: ${formData.name.trim()}`,
              `Email: ${formData.email.trim()}`,
              formData.message.trim()
                ? `Üzenet: ${formData.message.trim()}`
                : null,
              formData.source.trim()
                ? `Honnan hallott rólunk: ${formData.source.trim()}`
                : null,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        });
      } catch (emailError) {
        // Email is optional — DB save is the primary action
        console.warn("Email notification failed (non-critical):", emailError);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: t("foundingLanding.form_error_title"),
        description: t("foundingLanding.form_error_save"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const seoTitle =
    language === "hu"
      ? "Founding Expert — WellAgora"
      : language === "de"
        ? "Founding Expert — WellAgora"
        : "Founding Expert — WellAgora";

  const seoDesc =
    language === "hu"
      ? "Csatlakozz a WellAgora alapító közösségéhez. Van valamid, ami másnak is hasznos lehet."
      : language === "de"
        ? "Werde Teil der WellAgora-Gründungsgemeinschaft. Du hast etwas, das andere weiterbringt."
        : "Join the WellAgora founding community. You have something worth sharing.";

  return (
    <>
      <SEOHead title={seoTitle} description={seoDesc} url="/founding-expert" />
      <div className="min-h-screen bg-white">
        {/* ─── SECTION 1 — Hero ─── */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-white to-emerald-50/40" />
          <div className="absolute top-20 left-10 w-64 h-64 bg-green-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-emerald-200/15 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-4 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {t("foundingLanding.hero_title")}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                {t("foundingLanding.hero_subtitle")}
              </p>
              <Button
                size="lg"
                onClick={scrollToForm}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-green-200/50"
              >
                {t("foundingLanding.hero_cta")}
                <ArrowDown className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ─── SECTION 2 — Kik vannak itt már? ─── */}
        <section className="py-16 bg-gray-50/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { emoji: "🌿", key: "foundingLanding.card1" },
                { emoji: "🧠", key: "foundingLanding.card2" },
                { emoji: "🏔️", key: "foundingLanding.card3" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-6 text-center">
                      <span className="text-4xl block mb-4">{card.emoji}</span>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {t(card.key)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm mt-8 italic">
              {t("foundingLanding.cards_footer")}
            </p>
          </div>
        </section>

        {/* ─── SECTION 3 — Mit jelent Alapító Tagnak lenni? ─── */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
              {t("foundingLanding.exchange_title")}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Te hozod */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-green-50/60 rounded-2xl p-8"
              >
                <h3 className="text-lg font-bold text-green-800 mb-5">
                  {t("foundingLanding.bring_title")}
                </h3>
                <ul className="space-y-3">
                  {["bring_1", "bring_2", "bring_3"].map((key) => (
                    <li
                      key={key}
                      className="flex items-start gap-3 text-gray-700 text-sm"
                    >
                      <Leaf className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{t(`foundingLanding.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Te kapod */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-emerald-50/60 rounded-2xl p-8"
              >
                <h3 className="text-lg font-bold text-emerald-800 mb-5">
                  {t("foundingLanding.get_title")}
                </h3>
                <ul className="space-y-3">
                  {["get_1", "get_2", "get_3", "get_4", "get_5"].map((key) => (
                    <li
                      key={key}
                      className="flex items-start gap-3 text-gray-700 text-sm"
                    >
                      <Heart className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{t(`foundingLanding.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <p className="text-center text-gray-500 text-sm mt-8 italic">
              {t("foundingLanding.time_note")}
            </p>
          </div>
        </section>

        {/* ─── SECTION 4 — Mi a WellAgora? ─── */}
        <section className="py-16 bg-gradient-to-b from-gray-50/30 to-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                {t("foundingLanding.what_title")}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t("foundingLanding.what_text")}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t("foundingLanding.what_handprint")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── SECTION 5 — Ki áll mögötte? ─── */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-8"
            >
              {/* Attila portrait */}
              <img
                src="/attila-kelemen.png"
                alt="Kelemen Attila"
                className="w-40 h-40 md:w-48 md:h-48 rounded-2xl object-cover object-top flex-shrink-0"
              />

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("foundingLanding.founder_title")}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {t("foundingLanding.founder_text")}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── SECTION 6 — Jelentkezési űrlap ─── */}
        <section
          id="apply"
          ref={formRef}
          className="py-16 bg-gradient-to-b from-green-50/40 to-white"
        >
          <div className="container mx-auto px-4 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
                {t("foundingLanding.form_title")}
              </h2>

              {isSubmitted ? (
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-green-800 text-lg font-medium leading-relaxed">
                      {t("foundingLanding.form_success")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fl-name" className="text-gray-700">
                      {t("foundingLanding.form_name")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fl-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, name: e.target.value }))
                      }
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fl-email" className="text-gray-700">
                      {t("foundingLanding.form_email")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fl-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, email: e.target.value }))
                      }
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fl-message" className="text-gray-700">
                      {t("foundingLanding.form_message")}
                    </Label>
                    <Textarea
                      id="fl-message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, message: e.target.value }))
                      }
                      placeholder={t("foundingLanding.form_message_placeholder")}
                      className="rounded-xl min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fl-source" className="text-gray-700">
                      {t("foundingLanding.form_source")}
                    </Label>
                    <Input
                      id="fl-source"
                      value={formData.source}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, source: e.target.value }))
                      }
                      placeholder={t("foundingLanding.form_source_placeholder")}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base rounded-xl shadow-md"
                  >
                    {isSubmitting
                      ? t("foundingLanding.form_submitting")
                      : t("foundingLanding.form_submit")}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        {/* ─── SECTION 7 — Lábléc ─── */}
        <footer className="py-8 border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-sm text-gray-400 mb-3">
              {t("foundingLanding.footer_legal")}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              {t("foundingLanding.footer_home")}
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
};

export default FoundingExpertLanding;
