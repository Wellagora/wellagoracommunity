import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Users, Sprout, BookOpen, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ProgramCardButtons from "@/components/challenges/ProgramCardButtons";
import { useUserChallenges } from "@/hooks/useUserChallenges";

const FeaturedChallenges = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isJoined } = useUserChallenges();

  const challenges = [
    {
      id: "kali-muhely",
      titleKey: "challenges.kaliMuhely.title",
      descriptionKey: "challenges.kaliMuhely.description",
      categoryKey: "challenges.category.community",
      difficulty: "beginner",
      icon: Users,
      color: "from-primary to-secondary",
      image: "https://vvunxewylcifwphxgqab.supabase.co/storage/v1/object/public/program-images/kali-muhely-1762876915224.jpg",
    },
    {
      id: "kali-kozos-kert",
      titleKey: "challenges.kaliKozosKert.title",
      descriptionKey: "challenges.kaliKozosKert.description",
      categoryKey: "challenges.category.biodiversity",
      difficulty: "beginner",
      icon: Sprout,
      color: "from-success to-info",
      image: "https://vvunxewylcifwphxgqab.supabase.co/storage/v1/object/public/program-images/kali-kozos-kert-1762875048140.jpg",
    },
    {
      id: "tudas-hid",
      titleKey: "challenges.tudasHid.title",
      descriptionKey: "challenges.tudasHid.description",
      categoryKey: "challenges.category.community",
      difficulty: "intermediate",
      icon: BookOpen,
      color: "from-accent to-warning",
      image: "https://vvunxewylcifwphxgqab.supabase.co/storage/v1/object/public/program-images/tudas-hid-1762875114052.jpg",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("challenges.featured.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("challenges.section.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {challenges.map((challenge, index) => {
            const Icon = challenge.icon;
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card hover:shadow-glow transition-all duration-300 border-border/50 group overflow-hidden relative">
                  {/* Joined Badge */}
                  {isJoined(challenge.id) && (
                    <Badge 
                      variant="default" 
                      className="absolute top-3 right-3 z-10 bg-success text-success-foreground shadow-lg"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      {t('challenges.joined_badge')}
                    </Badge>
                  )}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={challenge.image} 
                      alt={t(challenge.titleKey)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute bottom-3 left-3 w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">{t(challenge.titleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      {t(challenge.descriptionKey)}
                    </p>
                    <ProgramCardButtons
                      challengeId={challenge.id}
                      isJoined={isJoined(challenge.id)}
                      onNavigate={() => navigate(`/challenges/${challenge.id}`)}
                      onSponsor={() => navigate(`/challenges/${challenge.id}?action=sponsor`)}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/challenges">
              <Button variant="outline" size="lg" className="border-2 border-primary hover:bg-primary hover:text-white">
                {t("challenges.view_all")}
              </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedChallenges;
