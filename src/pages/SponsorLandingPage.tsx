import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Package, Coins, Heart, Eye, Lightbulb, Sparkles } from 'lucide-react';
import { SubscriptionPlanSelector } from '@/components/subscription/SubscriptionPlanSelector';

const SponsorLandingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPlan = (planId: string) => {
    navigate(`/register/organization?plan=${planId}`);
  };

  const steps = [
    {
      icon: Package,
      title: t('sponsor_landing.step_1_title'),
      description: t('sponsor_landing.step_1_desc'),
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: Coins,
      title: t('sponsor_landing.step_2_title'),
      description: t('sponsor_landing.step_2_desc'),
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Heart,
      title: t('sponsor_landing.step_3_title'),
      description: t('sponsor_landing.step_3_desc'),
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
    {
      icon: Eye,
      title: t('sponsor_landing.step_4_title'),
      description: t('sponsor_landing.step_4_desc'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  const faqItems = [
    {
      question: t('sponsor_landing.faq_1_q'),
      answer: t('sponsor_landing.faq_1_a'),
    },
    {
      question: t('sponsor_landing.faq_2_q'),
      answer: t('sponsor_landing.faq_2_a'),
    },
    {
      question: t('sponsor_landing.faq_3_q'),
      answer: t('sponsor_landing.faq_3_a'),
    },
    {
      question: t('sponsor_landing.faq_4_q'),
      answer: t('sponsor_landing.faq_4_a'),
    },
    {
      question: t('sponsor_landing.faq_5_q'),
      answer: t('sponsor_landing.faq_5_a'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            {t('sponsor_landing.badge')}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {t('sponsor_landing.hero_title')}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            {t('sponsor_landing.hero_subtitle')}
          </p>
          
          <p className="text-lg text-muted-foreground/80 italic mb-10 max-w-2xl mx-auto">
            "{t('sponsor_landing.hero_quote')}"
          </p>
          
          <Button 
            size="lg" 
            onClick={scrollToPricing}
            className="text-lg px-8 py-6 h-auto"
          >
            {t('sponsor_landing.cta_see_packages')}
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('sponsor_landing.how_it_works_title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('sponsor_landing.how_it_works_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card 
                  key={index}
                  className="relative bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300"
                >
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${step.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-xs font-medium text-muted-foreground">
                        {index + 1}. {t('sponsor_landing.step')}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Credit Explanation Section */}
      <section className="py-16 lg:py-24 bg-emerald-500/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <Lightbulb className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t('sponsor_landing.credit_title')}
                </h3>
              </div>
              
              <p className="text-lg font-semibold text-foreground mb-6">
                {t('sponsor_landing.credit_explanation')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('sponsor_landing.credit_example_1_label')}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {t('sponsor_landing.credit_example_1_value')}
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('sponsor_landing.credit_example_2_label')}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {t('sponsor_landing.credit_example_2_value')}
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('sponsor_landing.credit_example_3_label')}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {t('sponsor_landing.credit_example_3_value')}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {t('sponsor_landing.credit_note')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('sponsor_landing.pricing_title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('sponsor_landing.pricing_subtitle')}
            </p>
          </div>

          <SubscriptionPlanSelector onSelectPlan={handleSelectPlan} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('sponsor_landing.faq_title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('sponsor_landing.faq_subtitle')}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <CardContent className="p-10 md:p-16 text-center relative">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('sponsor_landing.final_cta_title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {t('sponsor_landing.final_cta_subtitle')}
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/register/organization')}
                className="text-lg px-8 py-6 h-auto"
              >
                {t('sponsor_landing.final_cta_button')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SponsorLandingPage;
