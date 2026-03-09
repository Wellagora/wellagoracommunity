import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Leaf, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

// Static blog articles for initial content (SEO seed)
const STATIC_ARTICLES: Array<{
  id: string;
  slug: string;
  titleKey: string;
  excerptKey: string;
  category: string;
  readTime: number;
  publishedAt: string;
}> = [
  {
    id: "1",
    slug: "mi-az-a-fenntarthato-kozosseg",
    titleKey: "blog.article_1_title",
    excerptKey: "blog.article_1_excerpt",
    category: "community",
    readTime: 5,
    publishedAt: "2026-03-01",
  },
  {
    id: "2",
    slug: "helyi-tudasmegosztas-ereje",
    titleKey: "blog.article_2_title",
    excerptKey: "blog.article_2_excerpt",
    category: "lifestyle",
    readTime: 7,
    publishedAt: "2026-03-05",
  },
  {
    id: "3",
    slug: "kali-medence-fenntarthatosag",
    titleKey: "blog.article_3_title",
    excerptKey: "blog.article_3_excerpt",
    category: "heritage",
    readTime: 6,
    publishedAt: "2026-03-08",
  },
  {
    id: "4",
    slug: "founding-expert-program",
    titleKey: "blog.article_4_title",
    excerptKey: "blog.article_4_excerpt",
    category: "craft",
    readTime: 4,
    publishedAt: "2026-03-09",
  },
  {
    id: "5",
    slug: "jol-let-es-reziliencia-uj-megkozelites",
    titleKey: "blog.article_5_title",
    excerptKey: "blog.article_5_excerpt",
    category: "wellness",
    readTime: 8,
    publishedAt: "2026-03-09",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  community: "bg-emerald-100 text-emerald-700",
  lifestyle: "bg-amber-100 text-amber-700",
  heritage: "bg-purple-100 text-purple-700",
  craft: "bg-blue-100 text-blue-700",
  wellness: "bg-teal-100 text-teal-700",
  gardening: "bg-green-100 text-green-700",
  gastronomy: "bg-orange-100 text-orange-700",
};

const BlogPage = () => {
  const { t, language } = useLanguage();

  const seoDescription = language === 'hu'
    ? 'Fenntarthatósági tudástár — cikkek a helyi közösségépítésről, jól-létről és rezilienciáról.'
    : language === 'de'
    ? 'Nachhaltigkeits-Wissensbasis — Artikel über lokale Gemeinschaftsbildung, Wohlbefinden und Resilienz.'
    : 'Sustainability knowledge base — articles about local community building, well-being, and resilience.';

  return (
    <>
      <SEOHead
        title={language === 'hu' ? 'Tudástár — WellAgora' : language === 'de' ? 'Wissensbasis — WellAgora' : 'Knowledge Base — WellAgora'}
        description={seoDescription}
        url="/blog"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="pt-12 pb-8 bg-gradient-to-b from-emerald-50/50 to-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {language === 'hu' ? 'Tudástár' : language === 'de' ? 'Wissensbasis' : 'Knowledge Base'}
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {language === 'hu'
                  ? 'Gondolatok, történetek és útmutatók a fenntartható közösségépítésről.'
                  : language === 'de'
                  ? 'Gedanken, Geschichten und Leitfäden zum nachhaltigen Gemeinschaftsaufbau.'
                  : 'Thoughts, stories, and guides on sustainable community building.'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STATIC_ARTICLES.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden">
                    {/* Decorative top bar */}
                    <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className={CATEGORY_COLORS[article.category] || "bg-gray-100 text-gray-700"}>
                          {t(`categories.${article.category}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.readTime} {language === 'hu' ? 'perc' : 'min'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {t(article.titleKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {t(article.excerptKey)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.publishedAt).toLocaleDateString(
                            language === 'hu' ? 'hu-HU' : language === 'de' ? 'de-DE' : 'en-US',
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )}
                        </span>
                        <span className="text-emerald-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          {language === 'hu' ? 'Olvasd el' : language === 'de' ? 'Weiterlesen' : 'Read more'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Coming Soon CTA */}
            <motion.div
              className="text-center mt-12 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                {language === 'hu'
                  ? 'Hamarosan további cikkekkel bővül a Tudástár. Founding Expert-ként Te is írhatsz!'
                  : language === 'de'
                  ? 'Bald kommen weitere Artikel. Als Founding Expert kannst auch du schreiben!'
                  : 'More articles coming soon. As a Founding Expert, you can contribute too!'}
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;
