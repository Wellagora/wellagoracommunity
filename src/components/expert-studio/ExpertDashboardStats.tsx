import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Wallet, TrendingUp, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface ExpertDashboardStatsProps {
  userId: string;
}

interface Stats {
  totalPrograms: number;
  publishedPrograms: number;
  totalBookings: number;
  grossEarnings: number;
  expertPayout: number;
  platformFee: number;
}

/**
 * ExpertDashboardStats - Shows key metrics for expert
 * - Total programs count
 * - Total bookings count
 * - Earnings breakdown (80% expert / 20% platform)
 */
const ExpertDashboardStats = ({ userId }: ExpertDashboardStatsProps) => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    totalPrograms: 0,
    publishedPrograms: 0,
    totalBookings: 0,
    grossEarnings: 0,
    expertPayout: 0,
    platformFee: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Fetch all expert's programs
      const { data: programs, error: programsError } = await supabase
        .from("expert_contents")
        .select("id, is_published, used_licenses, price_huf")
        .eq("creator_id", userId);

      if (programsError) throw programsError;

      const totalPrograms = programs?.length || 0;
      const publishedPrograms = programs?.filter(p => p.is_published).length || 0;
      const totalBookings = programs?.reduce((sum, p) => sum + (p.used_licenses || 0), 0) || 0;

      // Calculate earnings based on actual program prices and bookings
      // Using average price if no specific price, or 5000 Ft default
      let grossEarnings = 0;
      programs?.forEach(p => {
        const pricePerBooking = p.price_huf || 5000;
        grossEarnings += (p.used_licenses || 0) * pricePerBooking;
      });

      // 80/20 split
      const expertPayout = Math.round(grossEarnings * 0.80);
      const platformFee = Math.round(grossEarnings * 0.20);

      setStats({
        totalPrograms,
        publishedPrograms,
        totalBookings,
        grossEarnings,
        expertPayout,
        platformFee,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (language === "hu") {
      return `${amount.toLocaleString("hu-HU")} Ft`;
    }
    const eur = Math.round(amount / 400);
    return `€${eur.toLocaleString("de-DE")}`;
  };

  const statCards = [
    {
      icon: BookOpen,
      label: language === 'hu' ? 'Programok' : 'Programs',
      value: `${stats.publishedPrograms}/${stats.totalPrograms}`,
      sublabel: language === 'hu' ? 'publikált/összes' : 'published/total',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      label: language === 'hu' ? 'Foglalások' : 'Bookings',
      value: stats.totalBookings.toString(),
      sublabel: language === 'hu' ? 'összes résztvevő' : 'total participants',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Wallet,
      label: language === 'hu' ? 'Bruttó bevétel' : 'Gross Revenue',
      value: formatCurrency(stats.grossEarnings),
      sublabel: language === 'hu' ? 'teljes forgalom' : 'total revenue',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: TrendingUp,
      label: language === 'hu' ? 'Az Ön részesedése' : 'Your Payout',
      value: formatCurrency(stats.expertPayout),
      sublabel: '80%',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      highlight: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${stat.highlight ? 'ring-2 ring-emerald-500/50' : ''} ${stat.bgColor} border-0 shadow-sm`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {stat.highlight && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        80%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground/70">{stat.sublabel}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* 80/20 Split Info Bar */}
      <Card className="bg-gradient-to-r from-emerald-50 to-indigo-50 border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">
                {language === 'hu' ? '80/20 Bevétel Megosztás' : '80/20 Revenue Split'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-emerald-600 font-medium">
                {language === 'hu' ? 'Ön:' : 'You:'} {formatCurrency(stats.expertPayout)}
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-indigo-600">
                {language === 'hu' ? 'Platform:' : 'Platform:'} {formatCurrency(stats.platformFee)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertDashboardStats;
