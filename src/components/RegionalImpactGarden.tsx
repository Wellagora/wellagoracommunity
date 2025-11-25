import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreePine, Sprout, Flower, MapPin, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export const RegionalImpactGarden = () => {
  const { t } = useLanguage();

  const regions = [
    { 
      id: 1, 
      name: t('impact_garden.region_1'), 
      growth: 85, 
      participants: 847,
      trees: 12,
      flowers: 8,
      sprouts: 5
    },
    { 
      id: 2, 
      name: t('impact_garden.region_2'), 
      growth: 72, 
      participants: 623,
      trees: 9,
      flowers: 6,
      sprouts: 7
    },
    { 
      id: 3, 
      name: t('impact_garden.region_3'), 
      growth: 68, 
      participants: 521,
      trees: 8,
      flowers: 5,
      sprouts: 6
    },
    { 
      id: 4, 
      name: t('impact_garden.region_4'), 
      growth: 91, 
      participants: 1024,
      trees: 15,
      flowers: 11,
      sprouts: 4
    },
  ];

  const getGrowthColor = (growth: number) => {
    if (growth >= 80) return "text-success";
    if (growth >= 60) return "text-primary";
    return "text-warning";
  };

  const getGrowthBg = (growth: number) => {
    if (growth >= 80) return "bg-success/10";
    if (growth >= 60) return "bg-primary/10";
    return "bg-warning/10";
  };

  return (
    <section className="py-16 bg-gradient-to-br from-success/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-success/10 text-success border-success/20">
            <TreePine className="w-4 h-4 mr-1" />
            {t('impact_garden.badge')}
          </Badge>
          <h2 className="text-3xl font-bold mb-2">{t('impact_garden.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('impact_garden.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getGrowthBg(region.growth)} rounded-full flex items-center justify-center`}>
                        <MapPin className={`w-5 h-5 ${getGrowthColor(region.growth)}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{region.name}</h3>
                        <p className="text-sm text-muted-foreground">{region.participants} {t('impact_garden.participants')}</p>
                      </div>
                    </div>
                    <Badge className={`${getGrowthBg(region.growth)} ${getGrowthColor(region.growth)} border-0`}>
                      {region.growth}%
                    </Badge>
                  </div>

                  {/* Visual Garden */}
                  <div className="relative h-32 bg-gradient-to-b from-sky-100/50 to-green-100/50 dark:from-sky-950/30 dark:to-green-950/30 rounded-lg mb-4 overflow-hidden">
                    {/* Ground */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-800/30 to-transparent"></div>
                    
                    {/* Trees */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-around items-end px-4">
                      {Array.from({ length: region.trees }).map((_, i) => (
                        <motion.div
                          key={`tree-${i}`}
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.1 * i, duration: 0.5 }}
                        >
                          <TreePine 
                            className={`w-8 h-8 ${getGrowthColor(region.growth)}`}
                            style={{ 
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                              transform: `scale(${0.8 + Math.random() * 0.4})`
                            }}
                          />
                        </motion.div>
                      ))}
                      {Array.from({ length: region.flowers }).map((_, i) => (
                        <motion.div
                          key={`flower-${i}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.15 * i, duration: 0.6 }}
                        >
                          <Flower 
                            className="w-5 h-5 text-pink-500"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                          />
                        </motion.div>
                      ))}
                      {Array.from({ length: region.sprouts }).map((_, i) => (
                        <motion.div
                          key={`sprout-${i}`}
                          initial={{ scale: 0, y: 10 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.2 * i, duration: 0.4 }}
                        >
                          <Sprout 
                            className="w-4 h-4 text-green-600"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Growth Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('impact_garden.growth_level')}</span>
                      <span className={`font-semibold ${getGrowthColor(region.growth)}`}>
                        {region.growth}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${region.growth >= 80 ? 'bg-success' : region.growth >= 60 ? 'bg-primary' : 'bg-warning'}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${region.growth}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Card className="inline-block bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-success" />
                  <span className="text-sm">{t('impact_garden.legend_mature')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flower className="w-5 h-5 text-pink-500" />
                  <span className="text-sm">{t('impact_garden.legend_blooming')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-green-600" />
                  <span className="text-sm">{t('impact_garden.legend_growing')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <Button size="lg" className="gap-2">
            {t('impact_garden.explore_button')}
            <TrendingUp className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
