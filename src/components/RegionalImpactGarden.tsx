import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Target, Calendar, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VillageStats {
  village_name: string;
  participants: number;
  programs: number;
  events: number;
}

export const RegionalImpactGarden = () => {
  const { t } = useLanguage();
  const { currentProject } = useProject();
  const [villageStats, setVillageStats] = useState<VillageStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate region data from actual project villages
  const projectVillages = useMemo(() => {
    if (!currentProject?.villages || currentProject.villages.length === 0) {
      return [];
    }
    return currentProject.villages;
  }, [currentProject]);

  // Fetch real metrics from Supabase RPC
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_regional_village_stats', {
          p_project_id: currentProject.id
        });

        if (error) {
          console.error('Error fetching village stats:', error);
          // Use project villages as fallback with zero counts
          const fallbackStats = projectVillages.map(village => ({
            village_name: village,
            participants: 0,
            programs: 0,
            events: 0,
          }));
          setVillageStats(fallbackStats);
        } else if (data && Array.isArray(data)) {
          // Merge RPC data with project villages
          const statsMap = new Map<string, VillageStats>();
          
          // Initialize with project villages
          projectVillages.forEach(village => {
            statsMap.set(village.toLowerCase(), {
              village_name: village,
              participants: 0,
              programs: 0,
              events: 0,
            });
          });
          
          // Overlay RPC data
          (data as unknown as VillageStats[]).forEach(stat => {
            const key = stat.village_name.toLowerCase();
            if (statsMap.has(key)) {
              statsMap.set(key, {
                ...stat,
                village_name: statsMap.get(key)!.village_name, // Keep original casing
              });
            } else {
              // Add new villages from RPC data
              statsMap.set(key, stat);
            }
          });
          
          setVillageStats(Array.from(statsMap.values()));
        } else {
          // No data, use project villages
          const fallbackStats = projectVillages.map(village => ({
            village_name: village,
            participants: 0,
            programs: 0,
            events: 0,
          }));
          setVillageStats(fallbackStats);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        const fallbackStats = projectVillages.map(village => ({
          village_name: village,
          participants: 0,
          programs: 0,
          events: 0,
        }));
        setVillageStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [currentProject?.id, projectVillages]);

  // Don't render if no villages
  if (projectVillages.length === 0 && villageStats.length === 0) {
    return null;
  }

  const displayStats = villageStats.length > 0 ? villageStats : projectVillages.map(v => ({
    village_name: v,
    participants: 0,
    programs: 0,
    events: 0,
  }));

  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-success/5 via-background to-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <Badge className="mb-4 bg-success/10 text-success border-success/20">
            <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            {t("impact_garden.badge")}
          </Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 px-4">{t("impact_garden.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-4">
            {t("impact_garden.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto mb-8">
            {displayStats.map((stats, index) => (
              <motion.div
                key={stats.village_name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300 h-full">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm md:text-base">{stats.village_name}</h3>
                    </div>

                    {/* Metrics Display - Horizontal Row */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      <div className="text-center p-2 md:p-3 bg-primary/5 rounded-lg">
                        <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                        <div className="text-lg md:text-xl font-bold text-primary">
                          {stats.participants}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {t('impact_garden.participants')}
                        </div>
                      </div>

                      <div className="text-center p-2 md:p-3 bg-success/5 rounded-lg">
                        <Target className="w-4 h-4 text-success mx-auto mb-1" />
                        <div className="text-lg md:text-xl font-bold text-success">
                          {stats.programs}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {t('impact_garden.programs')}
                        </div>
                      </div>

                      <div className="text-center p-2 md:p-3 bg-accent/5 rounded-lg">
                        <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
                        <div className="text-lg md:text-xl font-bold text-accent">
                          {stats.events}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {t('impact_garden.events')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center px-4">
          <Card className="inline-block bg-card/80 backdrop-blur-sm border-primary/30">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span className="text-xs md:text-sm text-muted-foreground">{t("impact_garden.legend_participants")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-success" />
                  <span className="text-xs md:text-sm text-muted-foreground">{t("impact_garden.legend_programs")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                  <span className="text-xs md:text-sm text-muted-foreground">{t("impact_garden.legend_events")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
