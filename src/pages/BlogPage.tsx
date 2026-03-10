import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Leaf, ArrowRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";

// Static blog articles for initial content (SEO seed)
const STATIC_ARTICLES: Array<{
  id: string;
  slug: string;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  category: string;
  readTime: number;
  publishedAt: string;
}> = [
  {
    id: "1",
    slug: "mi-az-a-fenntarthato-kozosseg",
    titleKey: "blog.article_1_title",
    excerptKey: "blog.article_1_excerpt",
    contentKey: "blog.article_1_content",
    category: "community",
    readTime: 5,
    publishedAt: "2026-03-01",
  },
  {
    id: "2",
    slug: "helyi-tudasmegosztas-ereje",
    titleKey: "blog.article_2_title",
    excerptKey: "blog.article_2_excerpt",
    contentKey: "blog.article_2_content",
    category: "lifestyle",
    readTime: 7,
    publishedAt: "2026-03-05",
  },
  {
    id: "4",
    slug: "founding-expert-program",
    titleKey: "blog.article_4_title",
    excerptKey: "blog.article_4_excerpt",
    contentKey: "blog.article_4_content",
    category: "craft",
    readTime: 4,
    publishedAt: "2026-03-09",
  },
  {
    id: "5",
    slug: "jol-let-es-reziliencia-uj-megkozelites",
    titleKey: "blog.article_5_title",
    excerptKey: "blog.article_5_excerpt",
    contentKey: "blog.article_5_content",
    category: "wellness",
    readTime: 8,
    publishedAt: "2026-03-09",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  community: "bg-blue-100 text-blue-700",
  lifestyle: "bg-amber-100 text-amber-700",
  heritage: "bg-purple-100 text-purple-700",
  craft: "bg-blue-100 text-blue-700",
  wellness: "bg-blue-100 text-blue-700",
  gardening: "bg-blue-100 text-blue-700",
  gastronomy: "bg-orange-100 text-orange-700",
};

const BlogPage = () => {
  const { t, language } = useLanguage();
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const seoDescription = language === 'hu'
    ? 'Fenntarthatósági tudástár — cikkek a helyi közösségépítésről, jól-létről és rezilienciáról.'
    : language === 'de'
    ? 'Nachhaltigkeits-Wissensbasis — Artikel über lokale Gemeinschaftsbildung, Wohlbefinden und Resilienz.'
    : 'Sustainability knowledge base — articles about local community building, well-being, and resilience.';

  const toggleArticle = (id: string) => {
    setExpandedArticle(prev => prev === id ? null : id);
  };

  return (
    <>
      <SEOHead
        title={language === 'hu' ? 'Tudástár — WellAgora' : language === 'de' ? 'Wissensbasis — WellAgora' : 'Knowledge Base — WellAgora'}
        description={seoDescription}
        url="/blog"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="pt-12 pb-8 bg-gradient-to-b from-blue-50/50 to-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
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
            <div className="grid md:grid-cols-2 gap-6">
              {STATIC_ARTICLES.map((article, index) => {
                const isExpanded = expandedArticle === article.id;
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={isExpanded ? 'md:col-span-2' : ''}
                  >
                    <Card
                      className={`h-full transition-all duration-300 overflow-hidden cursor-pointer ${
                        isExpanded
                          ? 'shadow-xl ring-1 ring-blue-200'
                          : 'hover:shadow-lg group'
                      }`}
                      onClick={() => toggleArticle(article.id)}
                    >
                      {/* Decorative top bar */}
                      <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-400" />
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={CATEGORY_COLORS[article.category] || "bg-gray-100 text-gray-700"}>
                              {t(`categories.${article.category}`)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.readTime} {language === 'hu' ? 'perc' : 'min'}
                            </span>
                          </div>
                          {isExpanded && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedArticle(null); }}
                              className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          )}
                        </div>

                        <h3 className={`text-lg font-semibold text-foreground mb-2 transition-colors ${
                          !isExpanded ? 'group-hover:text-blue-600' : ''
                        }`}>
                          {t(article.titleKey)}
                        </h3>

                        {!isExpanded && (
                          <>
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
                              <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                {language === 'hu' ? 'Olvasd el' : language === 'de' ? 'Weiterlesen' : 'Read more'}
                                <ChevronDown className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </>
                        )}

                        {/* Expanded content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4"
                            >
                              <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
                                {t(article.contentKey)}
                              </div>
                              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(article.publishedAt).toLocaleDateString(
                                    language === 'hu' ? 'hu-HU' : language === 'de' ? 'de-DE' : 'en-US',
                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                  )}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setExpandedArticle(null); }}
                                  className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                                >
                                  {language === 'hu' ? 'Bezárás' : language === 'de' ? 'Schließen' : 'Close'}
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Coming Soon CTA */}
            <motion.div
              className="text-center mt-12 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-blue-500" />
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
