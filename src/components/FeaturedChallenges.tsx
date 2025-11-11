import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Users, Sprout, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturedChallenges = () => {
  const { t } = useLanguage();

  const challenges = [
    {
      id: "kali-muhely",
      title: "Káli Műhely - Havi közösségi találkozók",
      description: "Havonta egyszer, rotálva a 4 településen (Kövágóörs, Kékkút, Mindszentkálla, Köveskál)",
      category: "Közösség",
      difficulty: "beginner",
      icon: Users,
      color: "from-primary to-secondary",
      image: "https://vvunxewylcifwphxgqab.supabase.co/storage/v1/object/public/program-images/kali-muhely-1762876915224.jpg",
    },
    {
      id: "kali-kozos-kert",
      title: "Káli közös kert - Közösségi termelés",
      description: "Közös kertészkedés, helyi termékek a 4 településen",
      category: "Biodiverzitás",
      difficulty: "beginner",
      icon: Sprout,
      color: "from-success to-info",
      image: "https://vvunxewylcifwphxgqab.supabase.co/storage/v1/object/public/program-images/kali-kozos-kert-1762875048140.jpg",
    },
    {
      id: "tudas-hid",
      title: "Tudás Híd - Generációk közötti program",
      description: "Hagyományőrzők és új lakosok párosítása a 4 településen",
      category: "Közösség",
      difficulty: "intermediate",
      icon: BookOpen,
      color: "from-accent to-warning",
      image: "https://vvunxewylcifwphxgqab.supabase.co/storage/v1/object/public/program-images/tudas-hid-1762875114052.jpg",
    },
  ];

  const difficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Kezdő";
      case "intermediate":
        return "Haladó";
      case "advanced":
        return "Tapasztalt";
      default:
        return difficulty;
    }
  };

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
            Kiemelt Programok
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Csatlakozz valamelyik népszerű programunkhoz és légy részese a közösségnek
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
                <Card className="h-full bg-card hover:shadow-glow transition-all duration-300 border-border/50 group overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={challenge.image} 
                      alt={challenge.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute bottom-3 left-3 w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {challenge.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {difficultyLabel(challenge.difficulty)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      {challenge.description}
                    </p>
                    <Link to={`/challenges/${challenge.id}`}>
                      <Button 
                        className={`w-full bg-gradient-to-r ${challenge.color} hover:opacity-90 transition-opacity`}
                      >
                        Csatlakozás
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
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
              Összes program megtekintése
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedChallenges;
