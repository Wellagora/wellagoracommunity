import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Quote, Users, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SuccessStories = () => {
  const { t } = useLanguage();

  const stories = [
    {
      type: "citizen",
      name: "Kovács Anna",
      role: "Helyi lakos, Kövágóörs",
      story: "A Káli Műhely programon keresztül megismertem a szomszédokat, és rájöttem, hogy milyen sok közös érdeklődési körünk van. Most már havonta találkozunk, és együtt dolgozunk a közösség fejlesztésén.",
      challenge: "Káli Műhely",
      icon: Users,
    },
    {
      type: "organization",
      name: "Balaton-felvidéki Nonprofit Kft.",
      role: "Helyi vállalkozás",
      story: "A Káli közös kert programot szponzoráljuk, és látjuk, hogy milyen pozitív hatása van a régióra. Büszkék vagyunk, hogy hozzájárulhatunk a helyi közösség fenntartható fejlődéséhez.",
      challenge: "Káli közös kert",
      icon: Building2,
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sikersztoriak
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Olvasd el, hogyan változtatták meg mások életét a Káli medence programjai
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {stories.map((story, index) => {
            const Icon = story.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{story.name}</h3>
                        <p className="text-sm text-muted-foreground">{story.role}</p>
                      </div>
                    </div>
                    
                    <div className="relative pl-4 border-l-2 border-primary/30">
                      <Quote className="absolute -left-2 -top-1 w-6 h-6 text-primary/20" />
                      <p className="text-muted-foreground italic mb-4">
                        "{story.story}"
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <span className="text-sm font-semibold text-primary">
                        Program: {story.challenge}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
