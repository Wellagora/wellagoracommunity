import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quote, Star, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export const StoryOfTheWeek = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/20 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Quote className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Star className="w-3 h-3 mr-1" />
                      {t('story_week.badge')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {t('story_week.date')}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{t('story_week.title')}</h3>
                </div>
              </div>

              <blockquote className="relative mb-6">
                <div className="absolute -left-2 -top-2 text-6xl text-primary/20 font-serif">"</div>
                <p className="text-lg text-foreground leading-relaxed pl-8 italic">
                  {t('story_week.quote')}
                </p>
                <div className="absolute -right-2 -bottom-4 text-6xl text-primary/20 font-serif">"</div>
              </blockquote>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-warning rounded-full"></div>
                  <div>
                    <p className="font-semibold text-foreground">{t('story_week.author_name')}</p>
                    <p className="text-sm text-muted-foreground">{t('story_week.author_role')}</p>
                  </div>
                </div>
                <Button variant="ghost" className="gap-2">
                  {t('story_week.read_more')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
