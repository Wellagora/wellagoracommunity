import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, Heart, Leaf, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  delay: number;
}

const StatCard = ({ icon: Icon, value, label, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
  >
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group h-full">
      <CardContent className="p-6 text-center">
        <div 
          className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-7 w-7" style={{ color }} />
        </div>
        <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export const RegionalImpactGarden = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    members: 0,
    contents: 0,
    events: 0,
    sponsors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Members count (citizens)
        const { count: membersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('user_role', ['citizen', 'creator']);

        // Workshop Secrets count (published)
        const { count: contentsCount } = await supabase
          .from('expert_contents')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        // Events count
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });

        // Sponsors count (business, ngo, government)
        const { count: sponsorsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('user_role', ['business', 'ngo', 'government']);

        setStats({
          members: membersCount || 0,
          contents: contentsCount || 0,
          events: eventsCount || 0,
          sponsors: sponsorsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-success/10 text-success border-success/20">
            <Leaf className="h-4 w-4 mr-1" />
            {t("impact_garden.badge")}
          </Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-foreground">
            {t("impact_garden.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            {t("impact_garden.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Statistics - 2x2 on mobile, 4x1 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <StatCard
                icon={Users}
                value={stats.members}
                label={t('impact_garden.members')}
                color="hsl(var(--primary))"
                delay={0}
              />
              <StatCard
                icon={BookOpen}
                value={stats.contents}
                label={t('impact_garden.contents')}
                color="hsl(var(--primary))"
                delay={0.1}
              />
              <StatCard
                icon={Calendar}
                value={stats.events}
                label={t('impact_garden.events')}
                color="hsl(var(--primary))"
                delay={0.2}
              />
              <StatCard
                icon={Heart}
                value={stats.sponsors}
                label={t('impact_garden.sponsors')}
                color="hsl(var(--accent))"
                delay={0.3}
              />
            </div>

            {/* CTA Text */}
            <p className="text-center text-muted-foreground mt-10 max-w-2xl mx-auto text-sm md:text-base">
              {t('impact_garden.cta')}
            </p>
          </>
        )}
      </div>
    </section>
  );
};
