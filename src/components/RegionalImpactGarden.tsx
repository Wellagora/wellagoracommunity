import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreePine, Sprout, Flower, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import { motion } from "framer-motion";
import { useMemo } from "react";

export const RegionalImpactGarden = () => {
  const { t } = useLanguage();
  const { currentProject } = useProject();

  // Generate region data from actual project villages
  const regions = useMemo(() => {
    if (!currentProject?.villages || currentProject.villages.length === 0) {
      return [];
    }

    // TODO: Replace with actual participant and impact data from database
    // For now, generate representative data based on village index
    return currentProject.villages.map((village, index) => {
      return {
        id: index + 1,
        name: village,
        trees: 5,
        flowers: 3,
        sprouts: 2,
      };
    });
  }, [currentProject]);

  // Don't render if no regions available
  if (regions.length === 0) {
    return null;
  }

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
    <section className="py-8 md:py-16 bg-gradient-to-br from-success/5 via-background to-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <Badge className="mb-4 bg-success/10 text-success border-success/20">
            <TreePine className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            {t("impact_garden.badge")}
          </Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 px-4">{t("impact_garden.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-4">
            {t("impact_garden.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto mb-8">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm md:text-base">{region.name}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Visual Garden - Deep Blue Glassmorphism */}
                  <motion.div
                    className="relative h-32 md:h-40 rounded-[16px] md:rounded-[20px] mb-3 md:mb-4 overflow-hidden group/garden"
                    style={{
                      background: "linear-gradient(180deg, #0A1F4D 0%, #102B68 45%, #1C3F8E 100%)",
                      opacity: 0.9,
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(80, 120, 255, 0.35)",
                      boxShadow: "0 0 24px rgba(60, 100, 255, 0.18) inset",
                    }}
                    whileHover={{ y: -2, boxShadow: "0 0 32px rgba(60, 100, 255, 0.28) inset" }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Curved Ground Line */}
                    <svg
                      className="absolute bottom-0 left-0 right-0 w-full h-8 md:h-12"
                      preserveAspectRatio="none"
                      viewBox="0 0 400 48"
                    >
                      <path d="M0,48 L0,24 Q100,12 200,16 T400,20 L400,48 Z" fill="#07193E" opacity="0.6" />
                    </svg>

                    {/* Elegant Icon Layout - Left Group (Trees) */}
                    <div className="absolute bottom-6 md:bottom-8 left-3 md:left-6 flex gap-2 md:gap-3 items-end">
                      {Array.from({ length: Math.min(2, Math.ceil(region.trees / 6)) }).map((_, i) => (
                        <motion.div
                          key={`tree-left-${i}`}
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.1 * i, duration: 0.5 }}
                        >
                          <TreePine
                            className="w-5 h-5 md:w-7 md:h-7"
                            style={{
                              color: "#7FDBFF",
                              filter:
                                "drop-shadow(0 0 4px rgba(127, 219, 255, 0.4)) md:drop-shadow(0 0 6px rgba(127, 219, 255, 0.4))",
                              strokeWidth: 1.5,
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Middle Group (Mixed) */}
                    <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 items-end">
                      {Array.from({ length: Math.min(2, Math.ceil(region.trees / 8)) }).map((_, i) => (
                        <motion.div
                          key={`tree-mid-${i}`}
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.15 * i + 0.2, duration: 0.5 }}
                        >
                          <TreePine
                            className="w-4 h-4 md:w-6 md:h-6"
                            style={{
                              color: "#7FDBFF",
                              filter:
                                "drop-shadow(0 0 4px rgba(127, 219, 255, 0.4)) md:drop-shadow(0 0 6px rgba(127, 219, 255, 0.4))",
                              strokeWidth: 1.5,
                            }}
                          />
                        </motion.div>
                      ))}
                      {Array.from({ length: Math.min(1, Math.ceil(region.flowers / 5)) }).map((_, i) => (
                        <motion.div
                          key={`flower-mid-${i}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.15 * i + 0.3, duration: 0.6 }}
                        >
                          <Flower
                            className="w-4 h-4 md:w-5 md:h-5"
                            style={{
                              color: "#FF84B5",
                              filter:
                                "drop-shadow(0 0 4px rgba(255, 132, 181, 0.4)) md:drop-shadow(0 0 6px rgba(255, 132, 181, 0.4))",
                              strokeWidth: 1.5,
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Right Group (Progress indicators) */}
                    <div className="absolute bottom-6 md:bottom-8 right-3 md:right-6 flex gap-1.5 md:gap-2 items-end">
                      {Array.from({ length: Math.min(2, Math.ceil(region.flowers / 5)) }).map((_, i) => (
                        <motion.div
                          key={`flower-right-${i}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2 * i + 0.4, duration: 0.6 }}
                        >
                          <Flower
                            className="w-4 h-4 md:w-5 md:h-5"
                            style={{
                              color: "#A8C8FF",
                              filter:
                                "drop-shadow(0 0 4px rgba(168, 200, 255, 0.4)) md:drop-shadow(0 0 6px rgba(168, 200, 255, 0.4))",
                              strokeWidth: 1.5,
                            }}
                          />
                        </motion.div>
                      ))}
                      {Array.from({ length: Math.min(1, Math.ceil(region.sprouts / 4)) }).map((_, i) => (
                        <motion.div
                          key={`sprout-right-${i}`}
                          initial={{ scale: 0, y: 10 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.25 * i + 0.5, duration: 0.4 }}
                        >
                          <Sprout
                            className="w-3 h-3 md:w-4 md:h-4"
                            style={{
                              color: "#6EE1FF",
                              filter:
                                "drop-shadow(0 0 4px rgba(110, 225, 255, 0.4)) md:drop-shadow(0 0 6px rgba(110, 225, 255, 0.4))",
                              strokeWidth: 1.5,
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center px-4">
          <Card className="inline-block bg-card/80 backdrop-blur-sm border-[#1C3F8E]/30">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4 md:w-5 md:h-5" style={{ color: "#7FDBFF" }} />
                  <span className="text-xs md:text-sm text-[#A7B6D8]">{t("impact_garden.legend_mature")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flower className="w-4 h-4 md:w-5 md:h-5" style={{ color: "#FF84B5" }} />
                  <span className="text-xs md:text-sm text-[#A7B6D8]">{t("impact_garden.legend_blooming")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 md:w-5 md:h-5" style={{ color: "#6EE1FF" }} />
                  <span className="text-xs md:text-sm text-[#A7B6D8]">{t("impact_garden.legend_growing")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
