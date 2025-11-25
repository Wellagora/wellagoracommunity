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

                  {/* Visual Garden - Deep Blue Glassmorphism */}
                  <motion.div 
                    className="relative h-40 rounded-[20px] mb-4 overflow-hidden group/garden"
                    style={{
                      background: 'linear-gradient(180deg, #0A1F4D 0%, #102B68 45%, #1C3F8E 100%)',
                      opacity: 0.9,
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(80, 120, 255, 0.35)',
                      boxShadow: '0 0 24px rgba(60, 100, 255, 0.18) inset'
                    }}
                    whileHover={{ y: -2, boxShadow: '0 0 32px rgba(60, 100, 255, 0.28) inset' }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Curved Ground Line */}
                    <svg 
                      className="absolute bottom-0 left-0 right-0 w-full h-12" 
                      preserveAspectRatio="none"
                      viewBox="0 0 400 48"
                    >
                      <path 
                        d="M0,48 L0,24 Q100,12 200,16 T400,20 L400,48 Z" 
                        fill="#07193E"
                        opacity="0.6"
                      />
                    </svg>
                    
                    {/* Elegant Icon Layout - Left Group (Trees) */}
                    <div className="absolute bottom-8 left-6 flex gap-3 items-end">
                      {Array.from({ length: Math.min(3, Math.ceil(region.trees / 5)) }).map((_, i) => (
                        <motion.div
                          key={`tree-left-${i}`}
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.1 * i, duration: 0.5 }}
                        >
                          <TreePine 
                            className="w-7 h-7"
                            style={{ 
                              color: '#7FDBFF',
                              filter: 'drop-shadow(0 0 6px rgba(127, 219, 255, 0.4))',
                              strokeWidth: 1.5
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Middle Group (Mixed) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 items-end">
                      {Array.from({ length: Math.min(2, Math.ceil(region.trees / 8)) }).map((_, i) => (
                        <motion.div
                          key={`tree-mid-${i}`}
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.15 * i + 0.2, duration: 0.5 }}
                        >
                          <TreePine 
                            className="w-6 h-6"
                            style={{ 
                              color: '#7FDBFF',
                              filter: 'drop-shadow(0 0 6px rgba(127, 219, 255, 0.4))',
                              strokeWidth: 1.5
                            }}
                          />
                        </motion.div>
                      ))}
                      {Array.from({ length: Math.min(2, Math.ceil(region.flowers / 4)) }).map((_, i) => (
                        <motion.div
                          key={`flower-mid-${i}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.15 * i + 0.3, duration: 0.6 }}
                        >
                          <Flower 
                            className="w-5 h-5"
                            style={{ 
                              color: '#FF84B5',
                              filter: 'drop-shadow(0 0 6px rgba(255, 132, 181, 0.4))',
                              strokeWidth: 1.5
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Right Group (Progress indicators) */}
                    <div className="absolute bottom-8 right-6 flex gap-2 items-end">
                      {Array.from({ length: Math.min(3, Math.ceil(region.flowers / 4)) }).map((_, i) => (
                        <motion.div
                          key={`flower-right-${i}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2 * i + 0.4, duration: 0.6 }}
                        >
                          <Flower 
                            className="w-5 h-5"
                            style={{ 
                              color: '#A8C8FF',
                              filter: 'drop-shadow(0 0 6px rgba(168, 200, 255, 0.4))',
                              strokeWidth: 1.5
                            }}
                          />
                        </motion.div>
                      ))}
                      {Array.from({ length: Math.min(2, Math.ceil(region.sprouts / 3)) }).map((_, i) => (
                        <motion.div
                          key={`sprout-right-${i}`}
                          initial={{ scale: 0, y: 10 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.25 * i + 0.5, duration: 0.4 }}
                        >
                          <Sprout 
                            className="w-4 h-4"
                            style={{ 
                              color: '#6EE1FF',
                              filter: 'drop-shadow(0 0 6px rgba(110, 225, 255, 0.4))',
                              strokeWidth: 1.5
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Modern Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-[#A7B6D8]">{t('impact_garden.growth_level')}</span>
                      <span className="font-semibold text-[#8AAEFF]">
                        {region.growth}%
                      </span>
                    </div>
                    <div 
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#081632' }}
                    >
                      <motion.div 
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, #274BD1, #8AAEFF)',
                          boxShadow: '0 0 8px rgba(60, 110, 255, 0.4)'
                        }}
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
          <Card className="inline-block bg-card/80 backdrop-blur-sm border-[#1C3F8E]/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TreePine className="w-5 h-5" style={{ color: '#7FDBFF' }} />
                  <span className="text-sm text-[#A7B6D8]">{t('impact_garden.legend_mature')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flower className="w-5 h-5" style={{ color: '#FF84B5' }} />
                  <span className="text-sm text-[#A7B6D8]">{t('impact_garden.legend_blooming')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5" style={{ color: '#6EE1FF' }} />
                  <span className="text-sm text-[#A7B6D8]">{t('impact_garden.legend_growing')}</span>
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
