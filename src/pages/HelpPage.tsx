import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, Mail, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();

  const faqs = [
    { q: t('help.faq1_q'), a: t('help.faq1_a') },
    { q: t('help.faq2_q'), a: t('help.faq2_a') },
    { q: t('help.faq3_q'), a: t('help.faq3_a') },
    { q: t('help.faq4_q'), a: t('help.faq4_a') },
    { q: t('help.faq5_q'), a: t('help.faq5_a') },
    { q: t('help.faq6_q'), a: t('help.faq6_a') },
  ];

  const filtered = searchQuery
    ? faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  return (
    <>
      <SEOHead
        title={t('seo.help.title')}
        description={t('seo.help.description')}
      />
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <main className="flex-1 pt-14 sm:pt-16">
        <section className="bg-gradient-to-b from-emerald-50 to-white py-12 sm:py-16">
          <div className="container mx-auto px-4 text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{t('help.title')}</h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">{t('help.subtitle')}</p>
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder={t('help.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-base"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {filtered.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">{t('help.no_results')}</p>
          )}

          <div className="mt-12 p-6 bg-emerald-50 rounded-xl text-center">
            <Mail className="w-8 h-8 mx-auto mb-3 text-emerald-600" />
            <h3 className="font-semibold text-lg mb-2">{t('help.contact_title')}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t('help.contact_desc')}</p>
            <Button asChild>
              <Link to="/contact">
                {t('help.contact_button')} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default HelpPage;
