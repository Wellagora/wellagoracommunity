import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Building2, BookOpen, Loader2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  colorClass: string;
  bgClass: string;
}

const StatCard = ({ icon: Icon, value, label, colorClass, bgClass }: StatCardProps) => (
  <motion.div variants={cardVariants}>
    <Card className="bg-card/80 backdrop-blur-md border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`w-7 h-7 ${colorClass}`} />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const CommunityStatsSection = () => {
  const { t } = useLanguage();
  const { stats, loading } = useCommunityStats();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      value: stats.members,
      label: t("community.stats_members") || "Tagok",
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-100",
    },
    {
      icon: Award,
      value: stats.experts,
      label: t("community.stats_experts") || "Szakértők",
      colorClass: "text-amber-600",
      bgClass: "bg-amber-100",
    },
    {
      icon: Building2,
      value: stats.sponsors,
      label: t("community.stats_sponsors") || "Támogatók",
      colorClass: "text-blue-600",
      bgClass: "bg-blue-100",
    },
    {
      icon: BookOpen,
      value: stats.programs,
      label: t("community.stats_programs") || "Programok",
      colorClass: "text-purple-600",
      bgClass: "bg-purple-100",
    },
  ];

  return (
    <section className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t("community.stats_title") || "Közösségünk számokban"}
        </h2>
        <p className="text-muted-foreground">
          {t("community.stats_subtitle") || "A régió növekvő értékőrző közössége"}
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </motion.div>
    </section>
  );
};

export default CommunityStatsSection;
