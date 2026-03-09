import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";

interface FAQItem {
  questionKey: string;
  answerKey: string;
}

const FAQ_ITEMS: FAQItem[] = [
  { questionKey: "faq.q1", answerKey: "faq.a1" },
  { questionKey: "faq.q2", answerKey: "faq.a2" },
  { questionKey: "faq.q3", answerKey: "faq.a3" },
  { questionKey: "faq.q4", answerKey: "faq.a4" },
  { questionKey: "faq.q5", answerKey: "faq.a5" },
  { questionKey: "faq.q6", answerKey: "faq.a6" },
  { questionKey: "faq.q7", answerKey: "faq.a7" },
  { questionKey: "faq.q8", answerKey: "faq.a8" },
];

const FAQPage = () => {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Build FAQPage JSON-LD Schema
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map(item => ({
      "@type": "Question",
      "name": t(item.questionKey),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t(item.answerKey)
      }
    }))
  });

  const seoDescription = language === 'hu'
    ? 'Gyakran ismételt kérdések a WellAgora platformról — hogyan működik, kik a Szakértők, hogyan támogathatsz.'
    : language === 'de'
    ? 'Häufig gestellte Fragen zur WellAgora-Plattform — wie sie funktioniert, wer die Experten sind, wie Sie unterstützen können.'
    : 'Frequently asked questions about the WellAgora platform — how it works, who the Experts are, how you can support.';

  return (
    <>
      <SEOHead
        title={language === 'hu' ? 'GYIK — WellAgora' : language === 'de' ? 'FAQ — WellAgora' : 'FAQ — WellAgora'}
        description={seoDescription}
        url="/gyik"
      />
      <Helmet>
        <script type="application/ld+json">{faqSchema}</script>
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-12 pb-8 bg-gradient-to-b from-amber-50/30 to-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {language === 'hu' ? 'Gyakran Ismételt Kérdések' : language === 'de' ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'hu'
                  ? 'Válaszok a leggyakoribb kérdésekre a WellAgora platformról.'
                  : language === 'de'
                  ? 'Antworten auf die häufigsten Fragen zur WellAgora-Plattform.'
                  : 'Answers to the most common questions about the WellAgora platform.'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-8 pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div className="border border-border rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-medium text-foreground pr-4">
                          {t(item.questionKey)}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5"
                        >
                          <p className="text-muted-foreground leading-relaxed">
                            {t(item.answerKey)}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FAQPage;
