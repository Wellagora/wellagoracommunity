import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Quote, Star, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export const StoryOfTheWeek = () => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="py-8 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/20 overflow-hidden">
              <CardContent className="p-4 md:p-8 lg:p-12">
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <Quote className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {t('story_week.badge')}
                      </Badge>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {t('story_week.date')}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4">{t('story_week.title')}</h3>
                  </div>
                </div>

                <blockquote className="relative mb-6">
                  <div className="absolute -left-1 md:-left-2 -top-1 md:-top-2 text-4xl md:text-6xl text-primary/20 font-serif">"</div>
                  <p className="text-base md:text-lg text-foreground leading-relaxed pl-6 md:pl-8 italic">
                    {t('story_week.quote')}
                  </p>
                  <div className="absolute -right-1 md:-right-2 -bottom-2 md:-bottom-4 text-4xl md:text-6xl text-primary/20 font-serif">"</div>
                </blockquote>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-accent to-warning rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-foreground text-sm md:text-base">{t('story_week.author_name')}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{t('story_week.author_role')}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {t('story_week.read_more')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Full Story Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Quote className="w-5 h-5 text-white" />
              </div>
              {t('story_week.title')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Star className="w-3 h-3 mr-1" />
                {t('story_week.badge')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t('story_week.date')}
              </span>
            </div>

            <blockquote className="relative border-l-4 border-primary pl-6 py-2">
              <p className="text-lg text-foreground leading-relaxed italic">
                {t('story_week.quote')}
              </p>
            </blockquote>

            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed">
                {t('story_week.full_story')}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-border">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-warning rounded-full"></div>
              <div>
                <p className="font-semibold text-foreground text-lg">{t('story_week.author_name')}</p>
                <p className="text-sm text-muted-foreground">{t('story_week.author_role')}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
